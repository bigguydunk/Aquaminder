import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY!);

// Helper: get current time and 5 minutes ahead in ISO format
function getTimeWindow() {
  const now = new Date();
  const in5min = new Date(now.getTime() + 5 * 60 * 1000);
  return {
    now: now.toISOString().slice(0, 16),
    in5min: in5min.toISOString().slice(0, 16),
  };
}

// Helper to fetch user email from Supabase Auth
async function getUserEmail(user_id: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.getUserById(user_id);
  if (error || !data?.user?.email) return null;
  return data.user.email;
}

export default async function handler(res: VercelResponse) {
  console.log('sendReminders.scheduled.ts triggered');
  const { now, in5min } = getTimeWindow();
  console.log('Time window:', now, 'to', in5min);

  // 1. Get jadwal entries due in the next 5 minutes
  const { data: schedules, error } = await supabase
    .from('jadwal')
    .select('jadwal_id, tanggal, user_id')
    .gte('tanggal', now)
    .lt('tanggal', in5min);

  if (error) {
    console.error('Supabase error:', error.message);
    return res.status(500).json({ error: error.message });
  }
  if (!schedules || schedules.length === 0) {
    console.log('No schedules due.');
    return res.status(200).json({ message: 'No schedules due.' });
  }

  // 2. Send emails
  for (const schedule of schedules) {
    const email = await getUserEmail(schedule.user_id);
    console.log('Processing schedule:', schedule, 'Email:', email);
    if (!email) continue;
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Jadwal Reminder',
        text: `You have a scheduled task at ${schedule.tanggal}.`,
      });
      console.log('Email sent to', email);
    } catch (e) {
      // Log error but continue
      console.error('Failed to send email to', email, e);
    }
  }

  res.status(200).json({ message: 'Reminders sent.' });
}

// No changes to the function code itself. This file should be renamed to enable Vercel Scheduled Functions.
