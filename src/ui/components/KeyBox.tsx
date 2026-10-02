// The API key box in Settings (P4 task 1). It fills the design's key slot (`apiKeyText`, bindings.json). The key is
// typed into a password field, sent once to settings.add_provider (which puts it in the macOS Keychain), and cleared
// from the page whatever the answer. The box only ever says whether a key is in the Keychain, never any of its characters.
import React from 'react';

type Run = (cmd: string, text: string, input?: object) => Promise<unknown>;
const btn: React.CSSProperties = {
  height: 26, padding: '0 10px', borderRadius: 6, background: 'var(--bg2)', border: '1px solid var(--line2)', color: 'var(--tx)',
  cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
};

export function KeyBox({ hasKey, run, reload }: { hasKey: boolean; run: Run; reload: () => void }) {
  const [adding, setAdding] = React.useState(false);
  const [key, setKey] = React.useState('');
  const save = async () => {
    const typed = key.trim();
    setKey('');
    const r = await run('settings.add_provider', 'Key saved in the macOS Keychain', { provider: 'anthropic', api_key: typed });
    if (r) setAdding(false);
    reload();
  };
  const remove = async () => {
    await run('settings.remove_provider', 'Key removed from the Keychain');
    reload();
  };
  const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, width: '100%' };
  if (adding) {
    return (
      <form style={row} onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <input
          type="password" title="settings.add_provider" autoComplete="off" spellCheck={false} placeholder="Paste key (sk-ant-…)"
          value={key} onChange={(e) => setKey(e.target.value)} autoFocus
          style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: 'var(--tx)', font: 'inherit' }}
        />
        <button type="submit" style={btn} aria-label="Save to Keychain" disabled={!key.trim()}>Save</button>
        <button type="button" style={btn} onClick={() => { setKey(''); setAdding(false); }}>Cancel</button>
      </form>
    );
  }
  return (
    <div style={row}>
      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hasKey ? 'Key in the macOS Keychain' : 'No key yet'}</span>
      {hasKey ? (
        <>
          <button type="button" style={btn} aria-label="Replace key" onClick={() => setAdding(true)}>Replace</button>
          <button type="button" style={btn} aria-label="Remove key" title="settings.remove_provider" onClick={() => void remove()}>Remove</button>
        </>
      ) : (
        <button type="button" style={btn} onClick={() => setAdding(true)}>Add key</button>
      )}
    </div>
  );
}
