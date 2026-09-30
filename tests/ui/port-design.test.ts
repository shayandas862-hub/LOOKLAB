import { describe, expect, test } from 'vitest';
import ts from 'typescript';
// @ts-expect-error: plain ESM module without types
import { convertTemplate } from '../../scripts/port-design/convert.mjs';

function wrap(body: string, script = '') {
  return `<!DOCTYPE html><html><body><x-dc>${body}</x-dc>${script}</body></html>`;
}

function compiles(code: string) {
  const out = ts.transpileModule(code, {
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    fileName: 'x.tsx',
  });
  return (out.diagnostics ?? []).map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
}

describe('port-design: template → TSX', () => {
  test('bindings in text and style become expressions on the vals object', () => {
    const r = convertTemplate(wrap('<div style="color:{{ c }};width:4px">Hi {{ name }}</div>'), 'T');
    expect(r.tsx).toContain('style={sx(`color:${v.c};width:4px`)}');
    expect(r.tsx).toContain('{"Hi "}{v.name}');
    expect(compiles(r.tsx)).toEqual([]);
  });

  test('sc-for keeps its loop variable unprefixed', () => {
    const r = convertTemplate(
      wrap('<sc-for list="{{ items }}" as="n" hint-placeholder-count="3"><b onClick="{{ n.go }}">{{ n.label }}</b></sc-for>'),
      'T',
    );
    expect(r.tsx).toMatch(/\(v\.items \?\? \[\]\)\.map\(\(n: any, i\d+: number\) =>/);
    expect(r.tsx).toContain('onClick={n.go}');
    expect(r.tsx).toContain('{n.label}');
    expect(r.tsx).not.toContain('hint-');
    expect(compiles(r.tsx)).toEqual([]);
  });

  test('sc-if becomes a conditional', () => {
    const r = convertTemplate(wrap('<sc-if value="{{ ok }}" hint-placeholder-val="{{ false }}"><i>yes</i></sc-if>'), 'T');
    expect(r.tsx).toMatch(/v\.ok \? \(/);
    expect(compiles(r.tsx)).toEqual([]);
  });

  test('style-hover becomes a class with an !important :hover rule', () => {
    const r = convertTemplate(wrap('<button style="color:red" style-hover="color:blue">x</button>'), 'T');
    const cls = /className="(dch-[a-z0-9]+)"/.exec(r.tsx)?.[1];
    expect(cls).toBeTruthy();
    expect(r.css).toContain(`.${cls}:hover{color:blue !important}`);
  });

  test('hyphenated SVG attributes become camelCase', () => {
    const r = convertTemplate(wrap('<svg viewBox="0 0 2 2"><path d="M0 0" stroke-width="1.6" stroke-linecap="round"></path></svg>'), 'T');
    expect(r.tsx).toContain('strokeWidth="1.6"');
    expect(r.tsx).toContain('strokeLinecap="round"');
    expect(r.tsx).toContain('viewBox="0 0 2 2"');
  });

  test('dc-import renders the named screen with camelCase props', () => {
    const r = convertTemplate(wrap('<dc-import name="Breakdown" nav="{{ nav }}" ai-ok="{{ aiOk }}" style="width:100%" hint-size="100%,100%"></dc-import>'), 'T');
    expect(r.tsx).toContain('<screens.Breakdown nav={v.nav} aiOk={v.aiOk} />');
  });

  test('image-slot becomes the ImageSlot component, and the logic can fill it by slot id', () => {
    const r = convertTemplate(wrap('<image-slot id="{{ l.slot }}" shape="rect" fit="contain" placeholder="Drop"></image-slot>'), 'T');
    expect(r.tsx).toContain('<ImageSlot id={v.l.slot} shape="rect" fit="contain" placeholder="Drop" {...v.slotProps?.(v.l.slot)} />');
    const s = convertTemplate(wrap('<image-slot id="ref-12c" shape="rect"></image-slot>'), 'T');
    expect(s.tsx).toContain('{...v.slotProps?.("ref-12c")}');
    expect(compiles(s.tsx)).toEqual([]);
  });

  test('braces in literal text are escaped and void elements self-close', () => {
    const r = convertTemplate(wrap('<p>a {b} c</p><input value="{{ q }}" onChange="{{ onQ }}"></input>'), 'T');
    expect(r.tsx).toContain('{"a {b} c"}');
    expect(r.tsx).toContain('<input value={v.q} onChange={v.onQ} />');
    expect(compiles(r.tsx)).toEqual([]);
  });

  test('typed source badges become bindable so sample screens can relabel them', () => {
    const r = convertTemplate(wrap('<span>MEASURED</span><span>AI 78%</span><span>MEASURED values</span>'), 'T');
    expect(r.tsx).toContain('{v.badgeText ? v.badgeText("MEASURED") : "MEASURED"}');
    expect(r.tsx).toContain('{v.badgeText ? v.badgeText("AI 78%") : "AI 78%"}');
    expect(r.tsx).toContain('{"MEASURED values"}');
  });

  test('literals listed in bindings become data slots with the design text as fallback', () => {
    const r = convertTemplate(wrap('<p>42 tools</p><p>other</p>'), 'T', { '42 tools': 'toolText' });
    expect(r.tsx).toContain('{v.toolText ?? "42 tools"}');
    expect(r.tsx).toContain('{"other"}');
  });

  test('numeric attributes become numbers', () => {
    const r = convertTemplate(wrap('<textarea rows="3" placeholder="4"></textarea>'), 'T');
    expect(r.tsx).toContain('rows={3}');
    expect(r.tsx).toContain('placeholder="4"');
  });

  test('helmet styles are collected and the logic script is returned', () => {
    const r = convertTemplate(
      wrap(
        '<helmet><link rel="stylesheet" href="x"><style>:root{--a:1}</style></helmet><div></div>',
        '<script type="text/x-dc" data-dc-script data-props="{&quot;theme&quot;:{&quot;default&quot;:&quot;dark&quot;}}">class Component extends DCLogic {}</script>',
      ),
      'T',
    );
    expect(r.css).toContain(':root{--a:1}');
    expect(r.script).toContain('class Component extends DCLogic');
    expect(r.defaults).toEqual({ theme: 'dark' });
  });
});
