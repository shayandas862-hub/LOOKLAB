// Compiles one Claude Design template (*.dc.html) into a React view (TSX).
// The template language is small and every binding in the export is a member path
// (measured 2026-09-30), so the compile is exact. See D-LL-014.
import { parseDocument } from 'htmlparser2';

const VOID = new Set(['input', 'br', 'img', 'hr', 'meta', 'link', 'source', 'area', 'col', 'embed', 'wbr']);
const NUMERIC_ATTR = new Set(['rows', 'cols', 'tabIndex', 'maxLength', 'colSpan', 'rowSpan', 'size', 'span']);
const BOOLEAN = new Set(['autoFocus', 'disabled', 'checked', 'selected', 'readOnly', 'multiple', 'required']);
const RENAME = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
  colspan: 'colSpan', rowspan: 'rowSpan', autofocus: 'autoFocus', contenteditable: 'contentEditable',
  'xlink:href': 'xlinkHref',
};
const LITERAL = /^(true|false|null|undefined|-?\d+(\.\d+)?|'[^']*'|"[^"]*")$/;
const BINDING = /\{\{\s*(.*?)\s*\}\}/g;

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function attrName(name) {
  if (RENAME[name]) return RENAME[name];
  if (name.startsWith('data-') || name.startsWith('aria-')) return name;
  return name.includes('-') ? camel(name) : name;
}

function expr(raw, scope) {
  const e = raw.trim();
  if (LITERAL.test(e)) return e;
  const root = e.split('.')[0];
  return scope.has(root) ? e : `v.${e}`;
}

// Splits "a {{ x }} b" into [{lit:'a '}, {expr:'v.x'}, {lit:' b'}].
function parts(value, scope) {
  const out = [];
  let last = 0;
  for (const m of value.matchAll(BINDING)) {
    if (m.index > last) out.push({ lit: value.slice(last, m.index) });
    out.push({ expr: expr(m[1], scope) });
    last = m.index + m[0].length;
  }
  if (last < value.length) out.push({ lit: value.slice(last) });
  return out;
}

const tick = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

// Returns a JS expression for a (possibly interpolated) attribute value.
function valueExpr(value, scope) {
  const p = parts(value, scope);
  if (p.length === 1 && p[0].expr) return p[0].expr;
  if (p.every((x) => x.lit !== undefined)) return JSON.stringify(value);
  return '`' + p.map((x) => (x.expr ? '${' + x.expr + '}' : tick(x.lit))).join('') + '`';
}

function attrJsx(value, scope) {
  const p = parts(value, scope);
  if (p.every((x) => x.lit !== undefined) && !/["\\{}]/.test(value)) return `"${value}"`;
  return `{${valueExpr(value, scope)}}`;
}

function hashOf(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// Source badges typed into a template ("MEASURED", "AI 78%") go through the logic's badgeText(),
// so a screen on sample data can relabel them (D-LL-015).
const BADGE_TEXT = /^(MEASURED|AI \d{1,3}%)$/;

function textJsx(text, scope, bindings = {}) {
  if (/^\s*$/.test(text)) return text.includes('\n') ? '' : '{" "}';
  const collapsed = text.replace(/\s+/g, ' ');
  const bound = bindings[collapsed.trim()];
  if (bound) return `{v.${bound} ?? ${JSON.stringify(collapsed.trim())}}`;
  if (BADGE_TEXT.test(collapsed.trim())) {
    const lit = JSON.stringify(collapsed.trim());
    return `{v.badgeText ? v.badgeText(${lit}) : ${lit}}`;
  }
  return parts(collapsed, scope)
    .map((x) => (x.expr ? `{${x.expr}}` : `{${JSON.stringify(x.lit)}}`))
    .join('');
}

/** `bindings` maps a literal text, or "[title=…] attribute", in the template to a vals key (src/ui/bindings.json). */
export function convertTemplate(html, viewName, bindings = {}) {
  const doc = parseDocument(html, { lowerCaseAttributeNames: false, lowerCaseTags: false, recognizeSelfClosing: true });
  const css = [];
  const hover = new Map();
  let script = '';
  let defaults = {};
  let loop = 0;
  const used = { ImageSlot: false, screens: false };

  const find = (nodes, test) => {
    for (const n of nodes) {
      if (test(n)) return n;
      const hit = n.children && find(n.children, test);
      if (hit) return hit;
    }
    return null;
  };

  const xdc = find(doc.children, (n) => n.name === 'x-dc');
  if (!xdc) throw new Error(`${viewName}: no <x-dc> root`);

  const scriptEl = find(doc.children, (n) => n.name === 'script' && n.attribs && 'data-dc-script' in n.attribs);
  if (scriptEl) {
    script = scriptEl.children.map((c) => c.data ?? '').join('');
    if (scriptEl.attribs['data-props']) {
      const props = JSON.parse(scriptEl.attribs['data-props']);
      defaults = Object.fromEntries(Object.entries(props).map(([k, d]) => [k, d.default]));
    }
  }

  function genAttrs(el, scope) {
    const out = [];
    for (const [name, value] of Object.entries(el.attribs)) {
      if (name.startsWith('hint-')) continue;
      if (name === 'style-hover') {
        const cls = `dch-${hashOf(value)}`;
        const decls = value.split(';').map((d) => d.trim()).filter(Boolean).map((d) => `${d} !important`);
        hover.set(cls, `.${cls}:hover{${decls.join(';')}}`);
        out.push(`className="${cls}"`);
        continue;
      }
      if (name === 'style') {
        out.push(`style={sx(${valueExpr(value, scope)})}`);
        continue;
      }
      const jsxName = attrName(name);
      // An attribute bound in bindings.json as "[title=<the element's title>] <name>" becomes a data slot, with the
      // design's own value as the fallback (P3: Fit light is T0, so it must not follow the AI buttons' disabled).
      const bound = el.attribs.title && bindings[`[title=${el.attribs.title}] ${name}`];
      if (bound) {
        const orig = attrJsx(value, scope);
        out.push(`${jsxName}={v.${bound} ?? ${orig.startsWith('{') && orig.endsWith('}') ? orig.slice(1, -1) : orig}}`);
        continue;
      }
      if (value === '' && BOOLEAN.has(jsxName)) {
        out.push(`${jsxName}={true}`);
        continue;
      }
      if (NUMERIC_ATTR.has(jsxName) && /^-?\d+$/.test(value)) {
        out.push(`${jsxName}={${value}}`);
        continue;
      }
      out.push(`${jsxName}=${attrJsx(value, scope)}`);
    }
    return out;
  }

  function gen(node, scope, pad) {
    if (node.type === 'text') return textJsx(node.data, scope, bindings);
    if (node.type === 'comment' || node.type === 'directive') return '';
    if (node.type === 'style') {
      css.push(node.children.map((c) => c.data ?? '').join('').trim());
      return '';
    }
    if (node.type === 'script') return '';
    const el = node;
    const kids = (s, p) => el.children.map((c) => gen(c, s, p)).filter(Boolean).join('\n' + p);

    if (el.name === 'helmet') {
      el.children.forEach((c) => gen(c, scope, pad));
      return '';
    }
    if (el.name === 'sc-for') {
      const as = el.attribs.as;
      const idx = `i${++loop}`;
      const inner = new Set(scope).add(as);
      const list = expr(el.attribs.list.replace(/^\{\{|\}\}$/g, ''), scope);
      return `{(${list} ?? []).map((${as}: any, ${idx}: number) => (\n${pad}  <React.Fragment key={${idx}}>\n${pad}    ${kids(inner, pad + '    ')}\n${pad}  </React.Fragment>\n${pad}))}`;
    }
    if (el.name === 'sc-if') {
      const cond = expr(el.attribs.value.replace(/^\{\{|\}\}$/g, ''), scope);
      return `{${cond} ? (\n${pad}  <>\n${pad}    ${kids(scope, pad + '    ')}\n${pad}  </>\n${pad}) : null}`;
    }
    if (el.name === 'dc-import') {
      used.screens = true;
      const props = Object.entries(el.attribs)
        .filter(([n]) => n !== 'name' && n !== 'style' && !n.startsWith('hint-'))
        .map(([n, val]) => `${camel(n)}=${attrJsx(val, scope)}`);
      return `<screens.${el.attribs.name}${props.length ? ' ' + props.join(' ') : ''} />`;
    }
    if (el.name === 'image-slot') {
      used.ImageSlot = true;
      // The logic may fill a slot (image, click handler) by its id: slotProps(id) returns extra props (P2).
      const id = el.attribs.id ? valueExpr(el.attribs.id, scope) : 'undefined';
      return `<ImageSlot ${genAttrs(el, scope).join(' ')} {...v.slotProps?.(${id})} />`;
    }
    const tag = el.name;
    const attrs = genAttrs(el, scope);
    const open = `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
    const body = kids(scope, pad + '  ');
    if (VOID.has(tag) || !body) return `${open} />`;
    if (tag === 'textarea') return `${open} defaultValue={${JSON.stringify(el.children.map((c) => c.data ?? '').join(''))}} />`;
    return `${open}>\n${pad}  ${body}\n${pad}</${tag}>`;
  }

  const body = xdc.children.map((c) => gen(c, new Set(), '    ')).filter(Boolean).join('\n    ');
  const imports = ["import React from 'react';", "import { sx } from '../runtime/sx';"];
  if (used.ImageSlot) imports.push("import { ImageSlot } from '../components/ImageSlot';");
  if (used.screens) imports.push("import * as screens from '../logic/screens';");

  const tsx = `${imports.join('\n')}

export const defaults: Record<string, unknown> = ${JSON.stringify(defaults)};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ${viewName}View(v: any): React.ReactElement {
  return (
    <>
    ${body}
    </>
  );
}
`;
  return { tsx, css: [...css, ...hover.values()].join('\n'), script, defaults };
}
