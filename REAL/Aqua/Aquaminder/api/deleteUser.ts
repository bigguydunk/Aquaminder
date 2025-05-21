import { createClient } from '@supabase/supabase-js';
import type { IncomingMessage, ServerResponse } from 'http';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
    return;
  }
  let body = req.body;
  if (!body) {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    await new Promise(resolve => req.on('end', resolve));
    body = JSON.parse(data);
  }
  const { user_id } = body;
  if (!user_id) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Missing user_id' }));
    return;
  }
  try {
    const { error } = await supabase.auth.admin.deleteUser(user_id);
    if (error) {
      console.error('Supabase Auth error:', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message, details: error }));
      return;
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true }));
  } catch (e) {
    console.error('Unexpected error:', e);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Unexpected error', details: e instanceof Error ? e.message : e }));
  }
}