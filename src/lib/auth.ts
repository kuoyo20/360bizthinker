import { supabase } from "./supabase";

const callbackPath = "/auth/callback";

/**
 * Send a 6-digit OTP code to the user's email.
 * NOTE: We intentionally do NOT pass `emailRedirectTo` here. When Supabase's
 * email template renders {{ .Token }}, the user types the code back into the
 * app — no clickable magic link involved. This avoids Gmail / extension
 * link-prefetch consuming the one-time token before the human can use it.
 */
export async function requestEmailOtp(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
}

export async function verifyEmailOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
}

/**
 * Legacy magic-link flow. Kept so any old email a user already received
 * still works via /auth/callback. New sign-ins use requestEmailOtp above.
 */
export async function signInWithMagicLink(email: string) {
  const emailRedirectTo = `${window.location.origin}${callbackPath}`;
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
