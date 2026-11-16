import { createClient } from '@supabase/supabase-js';

export const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
export const PER_STUDENT = 25; // questions each student gets, picked at random
export const ok = ({ data, error }) => { if (error) throw error; return data; };
export const bad = (error, status = 400) => Response.json({ error }, { status });

// Wraps an admin route: password check + error handling. fn(req, params) returns JSON data.
export const admin = fn => async (req, ctx) => {
  if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) return bad('Wrong password', 401);
  try { return Response.json(await fn(req, await ctx.params)); }
  catch (e) { if (e instanceof Response) return e; console.error(e); return bad(e.message, 500); }
};
