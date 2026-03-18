const { createClient } = require('@supabase/supabase-js');

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

async function upsertUser(req, res) {
  try {
    const { revenue_cat_user_id, name, learning_language, language_level, motivation, native_language, age_range, learning_speed } = req.body;

    if (!revenue_cat_user_id) {
      return res.status(400).json({ error: 'revenue_cat_user_id required' });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' });
    }

    const { error } = await supabase.from('users').upsert(
      {
        revenue_cat_user_id,
        name: name || null,
        learning_language: learning_language || null,
        language_level: language_level || null,
        motivation: motivation || null,
        native_language: native_language || null,
        age_range: age_range || null,
        learning_speed: learning_speed || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'revenue_cat_user_id' }
    );

    if (error) {
      console.error('User upsert error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('User sync error:', err);
    res.status(500).json({ error: err.message || 'Failed to sync user' });
  }
}

async function setPlanToPro(req, res) {
  try {
    const { revenue_cat_user_id } = req.body;

    if (!revenue_cat_user_id) {
      return res.status(400).json({ error: 'revenue_cat_user_id required' });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' });
    }

    const { error } = await supabase.from('users').upsert(
      {
        revenue_cat_user_id,
        plan: 'pro',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'revenue_cat_user_id' }
    );

    if (error) {
      console.error('Set plan error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Set plan error:', err);
    res.status(500).json({ error: err.message || 'Failed to set plan' });
  }
}

async function checkUserExists(req, res) {
  try {
    const { revenue_cat_user_id } = req.query;

    if (!revenue_cat_user_id) {
      return res.status(400).json({ error: 'revenue_cat_user_id required' });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('revenue_cat_user_id')
      .eq('revenue_cat_user_id', revenue_cat_user_id)
      .maybeSingle();

    if (error) {
      console.error('Check user exists error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ exists: !!data });
  } catch (err) {
    console.error('Check user exists error:', err);
    res.status(500).json({ error: err.message || 'Failed to check user' });
  }
}

async function getPlan(req, res) {
  try {
    const { revenue_cat_user_id } = req.query;

    if (!revenue_cat_user_id) {
      return res.status(400).json({ error: 'revenue_cat_user_id required' });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('plan')
      .eq('revenue_cat_user_id', revenue_cat_user_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Get plan error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ plan: data?.plan || 'free' });
  } catch (err) {
    console.error('Get plan error:', err);
    res.status(500).json({ error: err.message || 'Failed to get plan' });
  }
}

module.exports = { upsertUser, setPlanToPro, getPlan, checkUserExists };
