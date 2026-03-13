const { createClient } = require('@supabase/supabase-js');

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function logProgress(req, res) {
  try {
    const { revenue_cat_user_id, usage_seconds = 0, phrase_count = 0 } = req.body;

    if (!revenue_cat_user_id) {
      return res.status(400).json({ error: 'revenue_cat_user_id required' });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' });
    }

    const today = todayString();
    const yesterday = yesterdayString();

    const { data: existing } = await supabase
      .from('daily_progress')
      .select('usage_seconds, phrase_count')
      .eq('revenue_cat_user_id', revenue_cat_user_id)
      .eq('date', today)
      .single();

    const currentUsage = existing?.usage_seconds || 0;
    const currentPhrases = existing?.phrase_count || 0;
    const newUsage = currentUsage + usage_seconds;
    const newPhrases = currentPhrases + phrase_count;

    const { error: upsertError } = await supabase.from('daily_progress').upsert(
      {
        revenue_cat_user_id,
        date: today,
        usage_seconds: newUsage,
        phrase_count: newPhrases,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'revenue_cat_user_id,date' }
    );

    if (upsertError) {
      console.error('Daily progress upsert error:', upsertError);
      return res.status(500).json({ error: upsertError.message });
    }

    const { data: streakRow } = await supabase
      .from('streaks')
      .select('current_streak, last_practice_date')
      .eq('revenue_cat_user_id', revenue_cat_user_id)
      .single();

    let newStreak = 1;
    const lastDate = streakRow?.last_practice_date;

    if (lastDate === today) {
      newStreak = streakRow?.current_streak || 1;
    } else if (lastDate === yesterday) {
      newStreak = (streakRow?.current_streak || 0) + 1;
    }

    const { error: streakError } = await supabase.from('streaks').upsert(
      {
        revenue_cat_user_id,
        current_streak: newStreak,
        last_practice_date: today,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'revenue_cat_user_id' }
    );

    if (streakError) {
      console.error('Streak upsert error:', streakError);
    }

    if (usage_seconds > 0) {
      await supabase.from('sessions').insert({
        revenue_cat_user_id,
        duration_seconds: usage_seconds,
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Log progress error:', err);
    res.status(500).json({ error: err.message || 'Failed to log progress' });
  }
}

async function getProgress(req, res) {
  try {
    const { revenue_cat_user_id } = req.query;

    if (!revenue_cat_user_id) {
      return res.status(400).json({ error: 'revenue_cat_user_id required' });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' });
    }

    const today = todayString();

    const { data: todayRow } = await supabase
      .from('daily_progress')
      .select('usage_seconds, phrase_count')
      .eq('revenue_cat_user_id', revenue_cat_user_id)
      .eq('date', today)
      .single();

    const { data: streakRow } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('revenue_cat_user_id', revenue_cat_user_id)
      .single();

    const { data: datesRows } = await supabase
      .from('daily_progress')
      .select('date')
      .eq('revenue_cat_user_id', revenue_cat_user_id)
      .order('date', { ascending: true });

    const practiceDates = (datesRows || [])
      .map((r) => r.date)
      .filter(Boolean)
      .sort();

    res.json({
      todayUsageSeconds: todayRow?.usage_seconds || 0,
      todayPhraseCount: todayRow?.phrase_count || 0,
      dailyGoal: 5,
      streak: streakRow?.current_streak || 0,
      practiceDates,
    });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: err.message || 'Failed to get progress' });
  }
}

module.exports = { logProgress, getProgress };
