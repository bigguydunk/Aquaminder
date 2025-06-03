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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { akuarium_id, penyakit_id, jumlah_ikan_sakit, disease_name, added_by } = req.body;
  try {
    // Get all manager emails (role === 2)
    const { data: managers, error } = await supabase
      .from('users')
      .select('email, username')
      .eq('role', 2);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!managers || managers.length === 0) {
      return res.status(200).json({ message: 'No managers found.' });
    }
    // Read HTML template
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.join(__dirname, 'notify-managers.html');
    let templateHtml = fs.readFileSync(templatePath, 'utf8');
    templateHtml = templateHtml
      .replace(/\{\{diseaseName\}\}/g, disease_name || penyakit_id)
      .replace(/\{\{akuariumId\}\}/g, akuarium_id)
      .replace(/\{\{jumlahIkanSakit\}\}/g, jumlah_ikan_sakit)
      .replace(/\{\{addedBy\}\}/g, added_by || '-');
    const subject = 'Aquaminder: Penykakit ditambahkan ke Aquarium';
    for (const manager of managers) {
      if (!manager.email) continue;
      try {
        await resend.emails.send({
          from: 'reminder@aquaminder.live',
          to: manager.email,
          subject,
          html: templateHtml,
        });
      } catch (e) {
        // Log but don't fail all
        console.error('Failed to send to', manager.email, e);
      }
    }
    res.status(200).json({ message: 'Notification sent to managers.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
