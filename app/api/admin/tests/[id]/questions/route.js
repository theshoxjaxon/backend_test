import { db, ok, bad, admin } from '@/lib/db';

export const GET = admin(async (_, { id }) => ok(await db.from('questions').select('*').eq('test_id', id).order('id')));
export const POST = admin(async (req, { id }) => {
  const body = await req.json(), list = Array.isArray(body) ? body : [body];
  const invalid = list.find(q => !q.text || !Array.isArray(q.options) || q.options.length < 2 || !Number.isInteger(q.answer) || !q.options[q.answer]);
  if (invalid) throw bad('Each question needs text, options[], and answer (0-based index): ' + JSON.stringify(invalid));
  return ok(await db.from('questions').insert(list.map(({ text, options, answer, text_ru, options_ru }) => ({ test_id: id, text, options, answer, text_ru, options_ru }))).select());
});
