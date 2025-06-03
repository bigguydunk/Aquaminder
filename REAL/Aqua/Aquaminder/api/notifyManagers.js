import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { akuarium_id, penyakit_id, jumlah_ikan_sakit, disease_name, added_by } = req.body;
  try {
    // Get all manager user_ids (role === 2)
    const { data: managers, error } = await supabase
      .from('users')
      .select('user_id, username')
      .eq('role', 2);
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    if (!managers || managers.length === 0) {
      console.warn('No managers found.');
      return res.status(200).json({ message: 'No managers found.' });
    }
    // Read HTML template
    const templatePath = path.join(__dirname, 'notify-managers.html');
    let templateHtml;
    try {
      templateHtml = fs.readFileSync(templatePath, 'utf8');
    } catch (e) {
      console.error('Failed to read notify-managers.html:', e);
      return res.status(500).json({ error: 'Failed to read notify-managers.html', details: String(e) });
    }
    templateHtml = templateHtml
      .replace(/\{\{diseaseName\}\}/g, disease_name || penyakit_id)
      .replace(/\{\{akuariumId\}\}/g, akuarium_id)
      .replace(/\{\{jumlahIkanSakit\}\}/g, jumlah_ikan_sakit)
      .replace(/\{\{addedBy\}\}/g, added_by || '-');
    const subject = 'Aquaminder: Penykakit ditambahkan ke Aquarium';
    for (const manager of managers) {
      // Fetch email from auth.users
      let email = null;
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(manager.user_id);
        if (userError) throw userError;
        email = userData?.user?.email;
      } catch (e) {
        console.error('Failed to fetch email for manager', manager.user_id, e);
        continue;
      }
      if (!email) continue;
      try {
        await resend.emails.send({
          from: 'reminder@aquaminder.live',
          to: email,
          subject,
          html: templateHtml,
        });
      } catch (e) {
        console.error('Failed to send to', email, e);
      }
    }
    res.status(200).json({ message: 'Notification sent to managers.' });
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
