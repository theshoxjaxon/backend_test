// Imports the "Question Bank" sheet as test "node-js-test", shuffling options
// (the sheet always has the correct answer in column A). Usage: npm run seed [-- --dry]
import { createClient } from '@supabase/supabase-js';
const SHEET = '1nh2rH0TYyXBo-3DDiCVuZN5bTrqpgCI9krrrVmfAgys', SLUG = 'node-js-test', TITLE = 'Backend: Node-Express + PostgreSQL';

function csv(s) { // minimal RFC4180 parser
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const res = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET}/gviz/tq?tqx=out:csv&sheet=Question%20Bank`);
const questions = csv(await res.text()).slice(1).filter(r => r[3]).map(r => {
  const opts = [5, 7, 9, 11].map((i, k) => ({ uz: r[i], ru: r[i + 1], correct: k === 0 })); // first is the correct one
  if (!r[3] || !r[4] || opts.some(o => !o.uz || !o.ru)) throw new Error(`${r[0]}: missing text`);
  shuffle(opts);
  return { text: r[3], text_ru: r[4], options: opts.map(o => o.uz), options_ru: opts.map(o => o.ru), answer: opts.findIndex(o => o.correct) };
});
const dist = [0, 1, 2, 3].map(i => questions.filter(q => q.answer === i).length);
console.log(`${questions.length} questions; correct answer is A/B/C/D in ${dist.join('/')}`);
if (process.argv.includes('--dry')) process.exit();

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const { data: t, error } = await db.from('tests').upsert({ slug: SLUG, title: TITLE }, { onConflict: 'slug' }).select().single();
if (error) throw error;
await db.from('questions').delete().eq('test_id', t.id); // re-runnable (reshuffles)
const r = await db.from('questions').insert(questions.map(q => ({ ...q, test_id: t.id })));
if (r.error) throw r.error;
console.log(`done: http://localhost:5175/${SLUG}`);
