import { supabase } from './supabase';
import { TankSettings, TankData, FluidDatabase } from '../context/DataContext';
import { AuthError, PostgrestError } from '@supabase/supabase-js';

export interface SupabaseUser {
  id: string;
  email: string;
  hashed_password: string;
  is_verified: boolean;
  created_at: string;
}

export interface SupabaseTankSettings {
  id?: string;
  auth_user_id?: string;
  user_email: string;
  vessel_name: string;
  tank_name: string;
  shape: string;
  max_level: number;
  area: number;
  height: number;
  radius?: number;
  length?: number;
  breadth?: number;
  low_fill_threshold: { min: number; max: number };
  half_fill_threshold: { min: number; max: number };
  high_fill_threshold: { min: number; max: number };
  overflow_threshold: { min: number; max: number };
  created_at?: string;
}

export interface SupabaseTankData {
  id?: string;
  auth_user_id?: string;
  user_email: string;
  vessel_name: string;
  tank_name: string;
  date: string;
  time?: string;
  volume: number;
  density: number;
  fluid: string;
  temperature: number;
  pressure: number;
  fuel_level: number;
  operator_name?: string;
  area: number;
  fill_percentage: number;
  fill_status: string;
  detected_fluid: string;
  created_at?: string;
}

export interface SupabaseFluidData {
  id?: string;
  auth_user_id?: string;
  user_email: string;
  fluid_name: string;
  density: number;
  created_at?: string;
}

// Authentication functions using Supabase Auth
export async function signUpUser(email: string, password: string) {
  try {
    console.log('🔍 Starting Supabase Auth signUp for email:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify`
      }
    });

    if (error) {
      console.error('❌ Supabase Auth signup error:', error);
      console.error('Auth error details:', {
        status: error.status,
        message: error.message,
        name: error.name,
        __isAuthError: true
      });
      
      // Handle specific Supabase Auth error cases
      if (error.message?.toLowerCase().includes('user already registered')) {
        return { user: null, error: { message: 'User already exists with this email', code: 'USER_ALREADY_REGISTERED' } };
      }
      if (error.message?.toLowerCase().includes('invalid email')) {
        return { user: null, error: { message: 'Please enter a valid email address', code: 'INVALID_EMAIL' } };
      }
      if (error.message?.toLowerCase().includes('password') && error.message?.toLowerCase().includes('6')) {
        return { user: null, error: { message: 'Password must be at least 6 characters', code: 'WEAK_PASSWORD' } };
      }
      if (error.message?.toLowerCase().includes('signup is disabled')) {
        return { user: null, error: { message: 'Registration is currently disabled', code: 'SIGNUP_DISABLED' } };
      }
      
      return { user: null, error: { message: error.message, code: error.status?.toString() || 'AUTH_ERROR' } };
    }

    console.log('✅ Supabase Auth signup successful:', {
      user: data.user,
      session: data.session,
      emailConfirmationSent: !!data.user && !data.session
    });
    
    // Check if email confirmation is required
    if (data.user && !data.session) {
      console.log('📧 Email verification required - Supabase sent confirmation email');
    }
    
    return { 
      user: data.user, 
      session: data.session,
      error: null,
      needsEmailConfirmation: !data.session
    };
  } catch (error) {
    console.error('❌ Unexpected signup error:', error);
    return { user: null, error: { message: error instanceof Error ? error.message : 'Unknown error', code: 'UNEXPECTED_ERROR' } };
  }
}

export async function signInUser(email: string, password: string) {
  try {
    console.log('🔍 Starting Supabase Auth signIn for email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Supabase Auth signin error:', error);
      console.error('Auth signin error details:', {
        status: error.status,
        message: error.message,
        name: error.name
      });
      
      return { user: null, error: { message: error.message, code: error.status?.toString() } };
    }

    console.log('✅ Supabase Auth signin successful:', {
      user: data.user,
      session: data.session
    });
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error('❌ Unexpected signin error:', error);
    return { user: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

// Optional: Insert user profile into custom table after Supabase Auth signup
export async function insertUserProfile(email: string, authId: string, additionalData: any = {}) {
  try {
    console.log('🔍 Inserting user profile for:', email);
    
    const { data, error } = await supabase
      .from('user_profiles') // Use a separate table for additional user info
      .insert([{
        auth_user_id: authId,
        email,
        ...additionalData
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting user profile:', error);
      return { data: null, error };
    }

    console.log('✅ User profile created successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ Unexpected profile insert error:', error);
    return { data: null, error };
  }
}

// Get current authenticated user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Error getting current user:', error);
      return { user: null, error };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('❌ Unexpected get user error:', error);
    return { user: null, error };
  }
}

// Sign out user
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Error signing out:', error);
      return { error };
    }
    
    console.log('✅ User signed out successfully');
    return { error: null };
  } catch (error) {
    console.error('❌ Unexpected signout error:', error);
    return { error };
  }
}

// Legacy function for OTP verification (if you want to keep your custom OTP system)
export async function verifyUser(email: string) {
  try {
    // With Supabase Auth, email verification is handled automatically
    // This function is kept for backward compatibility with your OTP system
    console.log('📧 Email verification handled by Supabase Auth');
    return { user: { email }, error: null };
  } catch (error) {
    console.error('Verification error:', error);
    return { user: null, error };
  }
}

// Tank Settings functions
export async function saveTankSettingsToSupabase(userEmail: string, settings: TankSettings[]) {
  try {
    // Get current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User not authenticated:', userError);
      return { data: null, error: { message: 'User not authenticated' } };
    }

    console.log('🔍 Saving tank settings for user:', user.id, user.email);

    // First delete existing settings for the user
    const { error: deleteError } = await supabase
      .from('tank_settings')
      .delete()
      .eq('auth_user_id', user.id);

    if (deleteError) {
      console.error('❌ Error deleting existing tank settings:', deleteError);
      return { data: null, error: deleteError };
    }

    // Convert TankSettings to SupabaseTankSettings format with auth_user_id
    const supabaseSettings: SupabaseTankSettings[] = settings.map(setting => ({
      auth_user_id: user.id,
      user_email: userEmail, // Keep for backward compatibility
      vessel_name: setting.vesselName,
      tank_name: setting.tankName,
      shape: setting.shape,
      max_level: setting.maxLevel,
      area: setting.area,
      height: setting.height,
      radius: setting.radius,
      length: setting.length,
      breadth: setting.breadth,
      low_fill_threshold: setting.lowFillThreshold,
      half_fill_threshold: setting.halfFillThreshold,
      high_fill_threshold: setting.highFillThreshold,
      overflow_threshold: setting.overflowThreshold
    }));

    const { data, error } = await supabase
      .from('tank_settings')
      .insert(supabaseSettings)
      .select();

    if (error) {
      console.error('❌ Error saving tank settings:', error);
      return { data: null, error };
    }

    console.log('✅ Tank settings saved successfully:', data?.length, 'settings');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Save tank settings error:', error);
    return { data: null, error };
  }
}

export async function getTankSettingsFromSupabase(userEmail: string): Promise<{ data: TankSettings[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('tank_settings')
      .select('*')
      .eq('user_email', userEmail);

    if (error) {
      console.error('Error getting tank settings:', error);
      return { data: null, error };
    }

    // Convert from Supabase format to TankSettings format
    const tankSettings: TankSettings[] = (data || []).map((item: SupabaseTankSettings) => ({
      vesselName: item.vessel_name,
      tankName: item.tank_name,
      shape: item.shape as 'Cylindrical' | 'Rectangular' | 'Spherical',
      maxLevel: item.max_level,
      area: item.area,
      height: item.height,
      radius: item.radius,
      length: item.length,
      breadth: item.breadth,
      lowFillThreshold: item.low_fill_threshold,
      halfFillThreshold: item.half_fill_threshold,
      highFillThreshold: item.high_fill_threshold,
      overflowThreshold: item.overflow_threshold
    }));

    return { data: tankSettings, error: null };
  } catch (error) {
    console.error('Get tank settings error:', error);
    return { data: null, error };
  }
}

// Tank Data functions
export async function saveTankDataToSupabase(userEmail: string, tankData: TankData) {
  try {
    // Get current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User not authenticated:', userError);
      return { data: null, error: { message: 'User not authenticated' } };
    }

    console.log('🔍 Saving tank data for user:', user.id, user.email);

    const supabaseData: SupabaseTankData = {
      auth_user_id: user.id,
      user_email: userEmail, // Keep for backward compatibility
      vessel_name: tankData.vesselName,
      tank_name: tankData.tankName,
      date: tankData.date,
      time: new Date(tankData.date).toTimeString().split(' ')[0], // Extract time from date
      volume: tankData.volume,
      density: tankData.density,
      fluid: tankData.fluid,
      temperature: tankData.temperature,
      pressure: tankData.pressure,
      fuel_level: tankData.fuelLevel,
      operator_name: tankData.operatorName,
      area: tankData.area,
      fill_percentage: tankData.fillPercentage,
      fill_status: tankData.fillStatus,
      detected_fluid: tankData.detectedFluid
    };

    const { data, error } = await supabase
      .from('tank_data')
      .insert([supabaseData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving tank data:', error);
      return { data: null, error };
    }

    console.log('✅ Tank data saved successfully');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Save tank data error:', error);
    return { data: null, error };
  }
}

export async function getTankDataFromSupabase(userEmail: string): Promise<{ data: TankData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('tank_data')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting tank data:', error);
      return { data: null, error };
    }

    // Convert from Supabase format to TankData format
    const tankData: TankData[] = (data || []).map((item: SupabaseTankData) => ({
      id: item.id || '',
      vessel: item.vessel_name,
      tank: item.tank_name,
      date: item.date,
      volume: item.volume,
      density: item.density,
      fluid: item.fluid,
      temperature: item.temperature,
      pressure: item.pressure,
      fuelLevel: item.fuel_level,
      operatorName: item.operator_name,
      vesselName: item.vessel_name,
      tankName: item.tank_name,
      area: item.area,
      fillPercentage: item.fill_percentage,
      fillStatus: item.fill_status,
      detectedFluid: item.detected_fluid
    }));

    return { data: tankData, error: null };
  } catch (error) {
    console.error('Get tank data error:', error);
    return { data: null, error };
  }
}

// Fluid Database functions
export async function saveFluidDatabaseToSupabase(userEmail: string, fluidDatabase: FluidDatabase) {
  try {
    // First delete existing fluid data for the user
    await supabase
      .from('fluid_database')
      .delete()
      .eq('user_email', userEmail);

    // Convert FluidDatabase to SupabaseFluidData format
    const fluidData: SupabaseFluidData[] = Object.entries(fluidDatabase).map(([fluidName, range]) => ({
      user_email: userEmail,
      fluid_name: fluidName,
      density: (range.min + range.max) / 2 // Store average density
    }));

    const { data, error } = await supabase
      .from('fluid_database')
      .insert(fluidData)
      .select();

    if (error) {
      console.error('Error saving fluid database:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Save fluid database error:', error);
    return { data: null, error };
  }
}

export async function getFluidDatabaseFromSupabase(userEmail: string): Promise<{ data: FluidDatabase | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('fluid_database')
      .select('*')
      .eq('user_email', userEmail);

    if (error) {
      console.error('Error getting fluid database:', error);
      return { data: null, error };
    }

    // Convert from Supabase format to FluidDatabase format
    const fluidDatabase: FluidDatabase = {};
    (data || []).forEach((item: SupabaseFluidData) => {
      // For now, create ranges around the stored density
      // This is a simplified approach - you might want to store min/max separately
      const density = item.density;
      fluidDatabase[item.fluid_name] = {
        min: density - 10, // ±10 range
        max: density + 10
      };
    });

    return { data: fluidDatabase, error: null };
  } catch (error) {
    console.error('Get fluid database error:', error);
    return { data: null, error };
  }
}

// Admin functions - Only accessible by admin users via RLS policies
export async function getAllUsersOverview() {
  try {
    console.log('🔍 Admin fetching users overview...');
    
    const { data, error } = await supabase
      .from('admin_user_overview')
      .select('*')
      .order('auth_created_at', { ascending: false });

    if (error) {
      console.error('❌ Error getting users overview:', error);
      return { data: null, error };
    }

    console.log('✅ Admin users overview fetched:', data?.length, 'users');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Get users overview error:', error);
    return { data: null, error };
  }
}

export async function getAllTankData() {
  try {
    console.log('🔍 Admin fetching all tank data...');
    
    const { data, error } = await supabase
      .from('tank_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error getting all tank data:', error);
      return { data: null, error };
    }

    console.log('✅ Admin tank data fetched:', data?.length, 'records');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Get all tank data error:', error);
    return { data: null, error };
  }
}

export async function getAllTankSettings() {
  try {
    console.log('🔍 Admin fetching all tank settings...');
    
    const { data, error } = await supabase
      .from('tank_settings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error getting all tank settings:', error);
      return { data: null, error };
    }

    console.log('✅ Admin tank settings fetched:', data?.length, 'settings');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Get all tank settings error:', error);
    return { data: null, error };
  }
}

export async function getAuthUsersInfo() {
  try {
    console.log('🔍 Admin fetching auth users info...');
    
    const { data, error } = await supabase
      .from('auth_users_info')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error getting auth users info:', error);
      return { data: null, error };
    }

    console.log('✅ Admin auth users info fetched:', data?.length, 'users');
    return { data, error: null };
  } catch (error) {
    console.error('❌ Get auth users info error:', error);
    return { data: null, error };
  }
}

// Check if current user is admin
export async function isCurrentUserAdmin(): Promise<{ isAdmin: boolean; user: any; error: any }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { isAdmin: false, user: null, error };
    }
    
    const isAdmin = user.email === 'admin@glence.com';
    console.log('🔍 Admin check for user:', user.email, 'isAdmin:', isAdmin);
    
    return { isAdmin, user, error: null };
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return { isAdmin: false, user: null, error };
  }
}

// Get comprehensive dashboard statistics (admin only)
export async function getAdminDashboardStats() {
  try {
    console.log('🔍 Fetching admin dashboard statistics...');
    
    // Check if user is admin first
    const { isAdmin } = await isCurrentUserAdmin();
    if (!isAdmin) {
      return { data: null, error: { message: 'Access denied - admin only' } };
    }
    
    // Fetch all stats in parallel
    const [usersResult, tankDataResult, tankSettingsResult] = await Promise.all([
      getAllUsersOverview(),
      getAllTankData(),
      getAllTankSettings()
    ]);
    
    if (usersResult.error || tankDataResult.error || tankSettingsResult.error) {
      const errors = [usersResult.error, tankDataResult.error, tankSettingsResult.error].filter(Boolean);
      console.error('❌ Error fetching admin dashboard stats:', errors);
      return { data: null, error: errors[0] };
    }
    
    const stats = {
      totalUsers: usersResult.data?.length || 0,
      totalTankData: tankDataResult.data?.length || 0,
      totalTankSettings: tankSettingsResult.data?.length || 0,
      users: usersResult.data || [],
      recentTankData: (tankDataResult.data || []).slice(0, 10), // Latest 10 entries
      tankDataByUser: {} as Record<string, number>
    };
    
    // Calculate tank data count by user
    (tankDataResult.data || []).forEach((entry: SupabaseTankData) => {
      const userEmail = entry.user_email;
      stats.tankDataByUser[userEmail] = (stats.tankDataByUser[userEmail] || 0) + 1;
    });
    
    console.log('✅ Admin dashboard stats compiled:', stats);
    return { data: stats, error: null };
  } catch (error) {
    console.error('❌ Error compiling admin dashboard stats:', error);
    return { data: null, error };
  }
}
