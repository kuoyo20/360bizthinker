import { supabase } from "./supabase";

const callbackPath = "/auth/callback";

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
