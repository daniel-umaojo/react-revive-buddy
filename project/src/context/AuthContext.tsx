import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { hashPassword, generateOTP, sendOTP } from '../utils/auth';
import { signUpUser, signInUser, verifyUser, SupabaseUser } from '../lib/supabaseService';
import { signUpUserWithSupabaseAuth, signInUserWithSupabaseAuth } from '../lib/supabaseAuthService';

// Toggle between custom auth and Supabase Auth
const USE_SUPABASE_AUTH = false; // Set to true to use Supabase's built-in auth

interface User {
  email: string;
  hashedPassword: string;
  isVerified: boolean;
}

interface PendingUser {
  email: string;
  hashedPassword: string;
  otp: string;
  timestamp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
  users: User[];
  pendingUsers: PendingUser[];
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Keep backward compatibility with localStorage for pending users
    const storedPendingUsers = localStorage.getItem('glence_pending_users');
    if (storedPendingUsers) {
      setPendingUsers(JSON.parse(storedPendingUsers));
    }

    const storedAuth = localStorage.getItem('glence_auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      setIsAuthenticated(true);
      setCurrentUser(authData.email);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🚀 Starting Supabase Auth login for:', email);
      
      const { user, error: loginError } = await signInUser(email, password);
      
      console.log('📝 Supabase Auth login result:', { user, error: loginError });
      
      if (loginError || !user) {
        console.error('❌ Login error:', loginError);
        
        if (loginError?.message?.includes('Invalid login')) {
          setError('Invalid email or password');
        } else if (loginError?.message?.includes('Email not confirmed')) {
          setError('Please check your email and click the verification link first');
        } else {
          setError(loginError?.message || 'Login failed. Please try again.');
        }
        return false;
      }

      const userEmail = user.email || email;
      setIsAuthenticated(true);
      setCurrentUser(userEmail);
      localStorage.setItem('glence_auth', JSON.stringify({ email: userEmail }));
      
      console.log('✅ Login successful for:', userEmail);
      return true;
    } catch (err) {
      console.error('❌ Unexpected login error:', err);
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🚀 Starting Supabase Auth registration for:', email);
      
      // Use Supabase Auth for registration
      const result = await signUpUser(email, password);
      
      console.log('📝 Supabase Auth registration result:', result);
      
      if (result.error) {
        console.error('❌ Supabase Auth sign up error:', result.error);
        
        if (result.error.code === 'USER_ALREADY_REGISTERED' || result.error.message?.includes('already registered')) {
          setError('User already exists with this email');
        } else if (result.error.code === 'INVALID_EMAIL') {
          setError('Please enter a valid email address');
        } else if (result.error.code === 'WEAK_PASSWORD') {
          setError('Password must be at least 6 characters');
        } else if (result.error.code === 'SIGNUP_DISABLED') {
          setError('Registration is currently disabled');
        } else {
          setError(`Registration failed: ${result.error.message}`);
        }
        return false;
      }

      if (!result.user) {
        setError('Registration failed - no user data returned');
        return false;
      }

      console.log('✅ User registered with Supabase Auth successfully!');
      
      // Check if email verification is needed
      if (result.needsEmailConfirmation) {
        console.log('📧 Email verification required - Supabase sent confirmation email');
        setError('Registration successful! Please check your email and click the verification link to complete registration.');
      } else {
        console.log('🎉 User registration complete - no email verification required');
      }
      
      return true;
    } catch (err) {
      console.error('❌ Unexpected registration error:', err);
      setError(`Registration failed: ${err instanceof Error ? err.message : 'Please try again.'}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const pendingUser = pendingUsers.find(u => u.email === email);
      if (!pendingUser) {
        setError('No pending verification for this email');
        return false;
      }

      // Check if OTP is expired (5 minutes)
      if (Date.now() - pendingUser.timestamp > 5 * 60 * 1000) {
        setError('OTP has expired. Please register again.');
        return false;
      }

      if (pendingUser.otp !== otp) {
        setError('Invalid OTP');
        return false;
      }

      // Verify user in Supabase
      const { user, error: verifyError } = await verifyUser(email);
      
      if (verifyError) {
        setError('Verification failed. Please try again.');
        return false;
      }

      // Remove from pending users
      const updatedPendingUsers = pendingUsers.filter(u => u.email !== email);
      setPendingUsers(updatedPendingUsers);
      localStorage.setItem('glence_pending_users', JSON.stringify(updatedPendingUsers));

      return true;
    } catch (err) {
      setError('Verification failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setError(null);
    localStorage.removeItem('glence_auth');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      login,
      register,
      verifyOTP,
      logout,
      users,
      pendingUsers,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}