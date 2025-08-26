import { supabase } from './supabase';

// RECOMMENDED: Using Supabase's built-in authentication
export async function signUpUserWithSupabaseAuth(email: string, password: string) {
  try {
    console.log('🔍 Starting Supabase Auth registration for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('❌ Supabase Auth error:', error);
      return { user: null, error: { message: error.message, code: error.status } };
    }

    console.log('✅ User registered with Supabase Auth:', data);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('❌ Unexpected auth error:', error);
    return { user: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function signInUserWithSupabaseAuth(email: string, password: string) {
  try {
    console.log('🔍 Starting Supabase Auth login for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Supabase Auth login error:', error);
      return { user: null, error: { message: error.message, code: error.status } };
    }

    console.log('✅ User logged in with Supabase Auth:', data);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('❌ Unexpected login error:', error);
    return { user: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Sign out error:', error);
      return { error };
    }

    console.log('✅ User signed out successfully');
    return { error: null };
  } catch (error) {
    console.error('❌ Unexpected sign out error:', error);
    return { error };
  }
}

// Listen for auth state changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
