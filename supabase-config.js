/* =============================================
   Ruby Pet Shop — Supabase Config & DB Helpers
   ============================================= */
'use strict';

const SUPABASE_URL = 'https://shinzmgclwxzxoyjzwel.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoaW56bWdjbHd4enhveWp6d2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTUyODUsImV4cCI6MjA5NDkzMTI4NX0.u_ruO6VaVyuFBux0SUPeQTUFgQgxdnb7QHBFr7KAHqA';

/* ── Supabase client (CDN loaded before this file) ─── */
const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ══════════════════════════════════════════════════════
   DB — namespace for all Supabase operations
══════════════════════════════════════════════════════ */
const DB = {

  /* ── AUTH ──────────────────────────────────────────── */
  auth: _sb.auth,

  async signIn(email, password) {
    return await _sb.auth.signInWithPassword({ email, password });
  },

  async signUp(email, password, meta = {}) {
    return await _sb.auth.signUp({
      email, password,
      options: { data: meta }
    });
  },

  async signOut() {
    return await _sb.auth.signOut();
  },

  async getSession() {
    const { data: { session } } = await _sb.auth.getSession();
    return session;
  },

  async resetPassword(email) {
    return await _sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/index.html'
    });
  },

  onAuthChange(cb) {
    return _sb.auth.onAuthStateChange(cb);
  },

  /* ── PROFILE ───────────────────────────────────────── */
  async getProfile(userId) {
    const { data, error } = await _sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async upsertProfile(userId, fields) {
    const { error } = await _sb.from('profiles').upsert({
      id: userId, ...fields, updated_at: new Date().toISOString()
    });
    return { error };
  },

  /* ── PETS ──────────────────────────────────────────── */
  async getPets(userId) {
    const { data, error } = await _sb
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    return { data: data || [], error };
  },

  async addPet(userId, pet) {
    const { data, error } = await _sb
      .from('pets')
      .insert({ user_id: userId, ...pet })
      .select()
      .single();
    return { data, error };
  },

  async deletePet(petId) {
    const { error } = await _sb.from('pets').delete().eq('id', petId);
    return { error };
  },

  /* ── ORDERS ────────────────────────────────────────── */
  async getOrders(userId) {
    const { data, error } = await _sb
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  async saveOrder(userId, order, items = []) {
    const { data: ord, error: ordErr } = await _sb
      .from('orders')
      .insert({ user_id: userId, ...order })
      .select()
      .single();
    if (ordErr) return { error: ordErr };

    if (items.length) {
      const { error: itmErr } = await _sb
        .from('order_items')
        .insert(items.map(it => ({ order_id: ord.id, ...it })));
      if (itmErr) return { error: itmErr };
    }
    return { data: ord, error: null };
  },

  /* ── REVIEWS ───────────────────────────────────────── */
  async getReviews(productId) {
    const { data, error } = await _sb
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  async saveReview(userId, review) {
    const { data, error } = await _sb
      .from('reviews')
      .upsert({ user_id: userId, ...review },
               { onConflict: 'user_id,product_id' });
    return { data, error };
  },

  /* ── WISHLIST ──────────────────────────────────────── */
  async getWishlist(userId) {
    const { data, error } = await _sb
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId);
    return { data: (data || []).map(r => r.product_id), error };
  },

  async addWishlist(userId, productId) {
    const { error } = await _sb.from('wishlist')
      .upsert({ user_id: userId, product_id: productId },
               { onConflict: 'user_id,product_id' });
    return { error };
  },

  async removeWishlist(userId, productId) {
    const { error } = await _sb.from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    return { error };
  },
};
