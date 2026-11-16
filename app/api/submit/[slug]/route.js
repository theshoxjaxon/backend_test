import { db, ok, bad, PER_STUDENT } from '@/lib/db';

export async function POST(req, { params }) {
  const { slug } = await params;
  const body = await req.json(), answers = body.answers ?? {};
  const [student, surname, grp] = ['name', 'surname', 'group'].map(k => String(body[k] ?? '').trim().slice(0, 100));
  if (!student || !surname || !grp) return bad('Name, surname and group required');
  try {
    const t = ok(await db.from('tests').select('id').eq('slug', slug).maybeSingle());
    if (!t) return bad('Test not found', 404);
    const qs = ok(await db.from('questions').select('id,answer').eq('test_id', t.id));
    // the student must have been given exactly PER_STUDENT distinct questions of this test
    const ids = [...new Set(body.ids)], total = Math.min(PER_STUDENT, qs.length), given = qs.filter(q => ids.includes(q.id));
    if (ids.length !== total || given.length !== total) return bad('Invalid question set');
    const score = given.filter(q => answers[q.id] === q.answer).length;
    ok(await db.from('results').insert({ test_id: t.id, student, surname, grp, score, total }));
    return Response.json({ ok: true }); // students never see the score; only the admin does
  } catch (e) { console.error(e); return bad(e.message, 500); }
}
