'use client';
import { useEffect, useMemo, useState } from 'react';

const gkey = g => (g ?? '').toUpperCase().replace(/\s+/g, '') || '—'; // "gw 102" and "GW102" are one group
const pct = r => Math.round((r.score / (r.total || 1)) * 100);
const avg = rows => rows.length ? Math.round(rows.reduce((s, r) => s + pct(r), 0) / rows.length) : 0;

export default function Admin() {
  const [pw, setPw] = useState(''), [authed, setAuthed] = useState(false), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const [tests, setTests] = useState([]), [tid, setTid] = useState(''), [qs, setQs] = useState([]), [rs, setRs] = useState([]);
  const [tab, setTab] = useState('results'), [group, setGroup] = useState('ALL'), [search, setSearch] = useState('');
  const [open, setOpen] = useState(null), [slug, setSlug] = useState(''), [title, setTitle] = useState(''), [json, setJson] = useState('');

  const api = async (p, method = 'GET', body, pass = pw) => {
    const r = await fetch('/api/admin' + p, { method, headers: { 'content-type': 'application/json', 'x-admin-password': pass }, body: body && JSON.stringify(body) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error); return j;
  };
  async function loadTests(pass, select) {
    const t = await api('/tests', 'GET', undefined, pass);
    setTests(t); setTid(select ?? (t.some(x => x.id == tid) ? tid : t[0]?.id ?? ''));
  }
  async function login(pass = pw) {
    try { await loadTests(pass); sessionStorage.pw = pass; setPw(pass); setAuthed(true); setErr(''); }
    catch (e) { sessionStorage.removeItem('pw'); setErr(e.message); }
  }
  useEffect(() => { if (sessionStorage.pw) login(sessionStorage.pw); }, []);

  const refresh = async () => {
    if (!tid) return setQs([]), setRs([]);
    setBusy(true);
    try { const [q, r] = await Promise.all([api(`/tests/${tid}/questions`), api(`/tests/${tid}/results`)]); setQs(q); setRs(r); setErr(''); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  useEffect(() => { if (authed) { setGroup('ALL'); refresh(); } }, [authed, tid]);
  const run = fn => async () => { try { setErr(''); await fn(); } catch (e) { setErr(e.message); } };

  // results -> { GW100: [rows], GW102: [rows] }
  const groups = useMemo(() => {
    const m = {};
    for (const r of rs) (m[gkey(r.grp)] ??= []).push(r);
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
  }, [rs]);
  const shown = groups.filter(([g]) => group === 'ALL' || g === group).map(([g, rows]) => [g,
    rows.filter(r => `${r.surname} ${r.student}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (a.surname ?? '').localeCompare(b.surname ?? ''))]).filter(([, rows]) => rows.length);

  // per-question stats from stored answers (older results have none)
  const stats = useMemo(() => qs.map(q => {
    const seen = rs.filter(r => r.answers && q.id in r.answers), wrong = seen.filter(r => r.answers[q.id] !== q.answer);
    const picks = q.options.map((_, j) => seen.filter(r => r.answers[q.id] === j).length);
    return { q, seen: seen.length, wrong: wrong.length, skipped: seen.filter(r => r.answers[q.id] < 0).length, picks, rate: seen.length ? Math.round(wrong.length / seen.length * 100) : -1 };
  }).sort((a, b) => b.rate - a.rate), [qs, rs]);
  const noData = rs.filter(r => !r.answers).length;

  function exportCsv() {
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Group', 'Surname', 'Name', 'Score', 'Total', 'Percent', 'Submitted'],
      ...groups.flatMap(([g, rows]) => rows.map(r => [g, r.surname, r.student, r.score, r.total, pct(r), new Date(r.created_at).toLocaleString()]))];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + rows.map(r => r.map(esc).join(',')).join('\n')], { type: 'text/csv' }));
    a.download = `results-${tests.find(t => t.id == tid)?.slug ?? 'test'}.csv`; a.click();
  }

  if (!authed) return <main className="portal-wrapper"><h1>Admin</h1><div className="row">
    <input type="password" placeholder="Admin password" autoFocus value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
    <button onClick={() => login()}>Enter</button></div><span className="err">{err}</span></main>;

  const cur = tests.find(t => t.id == tid);
  return <main className="portal-wrapper">
    <h1>Admin</h1>
    <div className="row">
      <select value={tid} onChange={e => setTid(e.target.value)}>{tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
      <button onClick={refresh} disabled={busy}>{busy ? 'Loading…' : '↻ Refresh'}</button>
    </div>
    {cur && <a href={`http://localhost:5175/${cur.slug}`} target="_blank">student link: localhost:5175/{cur.slug}</a>}
    <span className="err"> {err}</span>
    <div className="adm-tabs">{[['results', `Results (${rs.length})`], ['analysis', 'Analysis'], ['questions', `Questions (${qs.length})`], ['tests', 'Tests']].map(([k, label]) =>
      <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>)}</div>

    {tab === 'results' && <>
      <div className="adm-stats">
        <div><b>{rs.length}</b><small>students</small></div>
        <div><b>{groups.length}</b><small>groups</small></div>
        <div><b>{avg(rs)}%</b><small>average</small></div>
      </div>
      <div className="row">
        <input type="text" placeholder="Search name or surname…" value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={exportCsv} disabled={!rs.length}>⬇ Export CSV</button>
      </div>
      <div className="adm-chips">{[['ALL', `All (${rs.length})`], ...groups.map(([g, rows]) => [g, `${g} (${rows.length})`])].map(([g, label]) =>
        <button key={g} className={group === g ? 'on' : ''} onClick={() => setGroup(g)}>{label}</button>)}</div>
      {!rs.length && <div className="card">{busy ? 'Loading…' : 'No results yet.'}</div>}
      {shown.map(([g, rows]) => <div className="card" key={g}>
        <b>{g}</b> — {rows.length} student{rows.length > 1 ? 's' : ''}, average {avg(rows)}%
        <table><thead><tr><th>#</th><th colSpan={2}>Student</th><th>Score</th><th>%</th><th>Left page</th><th>Submitted</th><th></th></tr></thead>
          <tbody>{rows.map((r, i) => <tr key={r.id}><td>{i + 1}</td><td colSpan={2}><a href="#" title={r.answers ? 'Show answers' : 'No answer data saved'} onClick={e => { e.preventDefault(); r.answers && setOpen(open === r.id ? null : r.id); }}>{r.surname} {r.student}</a></td>
            <td><b>{r.score}/{r.total}</b></td><td className={pct(r) >= 60 ? 'adm-pass' : 'adm-fail'}>{pct(r)}%</td>
            <td className={r.violations ? 'adm-fail' : ''}>{r.violations ?? 0}</td>
            <td>{new Date(r.created_at).toLocaleString()}</td>
            <td><button disabled={!r.answers} title={r.answers ? 'Show answers' : 'No answer data saved'} onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? '▲' : '▼'}</button> <button className="x" title="Delete result" onClick={run(async () => { if (confirm(`Delete result of ${r.surname} ${r.student}?`)) { await api('/results/' + r.id, 'DELETE'); refresh(); } })}>×</button></td></tr>)}</tbody></table>
        {rows.filter(r => r.id === open).map(r => <div key={r.id} className="adm-detail"><b>{r.surname} {r.student}</b> — {r.score}/{r.total} correct
          {qs.filter(q => r.answers[q.id] !== undefined).map(q => { const a = r.answers[q.id], good = a === q.answer; return <div key={q.id} className="adm-q">
            <span className={good ? 'adm-pass' : 'adm-fail'}>{good ? '✓' : '✗'}</span> <b>{q.text}</b><br />
            {good ? <span className="adm-pass">Chose: {q.options[a]}</span> : <><span className="adm-fail">Chose: {a < 0 ? '— (no answer)' : q.options[a]}</span> · <span className="adm-pass">Correct: {q.options[q.answer]}</span></>}</div>; })}</div>)}
      </div>)}
    </>}

    {tab === 'analysis' && <div className="card"><b>Hardest questions first</b> (% of students who got it wrong)
      {noData > 0 && <div><small>{noData} older result(s) have no answer data and are not counted.</small></div>}
      {stats.map(({ q, seen, wrong, skipped, picks, rate }) => <div key={q.id} className="adm-q">
        <b className={rate >= 50 ? 'adm-fail' : ''}>{rate < 0 ? 'no data' : `${rate}% wrong`}</b> ({wrong}/{seen}{skipped ? `, ${skipped} skipped` : ''}) — {q.text}<br />
        <small>{q.options.map((o, j) => <span key={j} className={j === q.answer ? 'adm-pass' : ''}>{o} [{picks[j]}] · </span>)}</small></div>)}
    </div>}

    {tab === 'questions' && <>
      <div className="card"><b>Add questions</b> (JSON array; <code>answer</code> = 0-based index of the correct option; optional <code>text_ru</code>, <code>options_ru</code>)
        <textarea placeholder='[{"text":"2+2?","options":["3","4","5","6"],"answer":1}]' value={json} onChange={e => setJson(e.target.value)} />
        <button onClick={run(async () => { await api(`/tests/${tid}/questions`, 'POST', JSON.parse(json)); setJson(''); refresh(); })}>Add</button></div>
      <div className="card"><b>Questions ({qs.length})</b><table><tbody>{qs.map((q, i) => <tr key={q.id}><td>{i + 1}</td>
        <td>{q.text}<br /><small>{q.options.map((o, j) => j === q.answer ? <b key={j}>{o} · </b> : <span key={j}>{o} · </span>)}</small></td>
        <td><button className="x" onClick={run(async () => { if (confirm('Delete question?')) { await api('/questions/' + q.id, 'DELETE'); refresh(); } })}>×</button></td></tr>)}</tbody></table></div>
    </>}

    {tab === 'tests' && <div className="card"><b>New test</b>
      <div className="row"><input type="text" placeholder="url-slug" value={slug} onChange={e => setSlug(e.target.value)} />
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <button onClick={run(async () => { const t = await api('/tests', 'POST', { slug, title }); setSlug(''); setTitle(''); await loadTests(pw, t.id); setTab('questions'); })}>Create</button></div></div>}
  </main>;
}
