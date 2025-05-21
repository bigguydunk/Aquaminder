import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    res.status(500).json({ error: 'Missing Supabase environment variables' });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { user_id } = req.body || {};
  if (!user_id) {
    res.status(400).json({ error: 'Missing user_id' });
    return;
  }

  try {
    const { error } = await supabase.auth.admin.deleteUser(user_id);
    if (error) {
      console.error('Supabase Auth error:', error);
      res.status(500).json({ error: error.message, details: error });
      return;
    }
    res.status(200).json({ success: true });
  } catch (e) {
    console.error('Unexpected error:', e);
    res.status(500).json({ error: 'Unexpected error', details: e instanceof Error ? e.message : e });
  }
}
