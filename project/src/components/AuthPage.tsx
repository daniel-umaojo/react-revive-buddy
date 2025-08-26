import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Gauge, Lock, UserPlus, Mail, Shield, Settings as SettingsIcon } from 'lucide-react';
import { AdminPanel } from './AdminPanel';
import { Logo } from './Logo';
import { supabase } from '../lib/supabase';

export function AuthPage() {
  const [currentView, setCurrentView] = useState<'auth' | 'admin'>('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'verified' | 'none'>('none');
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  const { login, register, verifyOTP, loading: authLoading, error: authError } = useAuth();
  const { currentTheme } = useTheme();

  // Admin credentials (in production, this should be more secure)
  const ADMIN_EMAIL = 'admin@glence.com';
  const ADMIN_PASSWORD = 'glence-admin-2024';

  // Check for email verification on page load
  useEffect(() => {
    const handleEmailVerification = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const type = urlParams.get('type');
      
      if (type === 'signup' && accessToken && refreshToken) {
        console.log('🔍 Processing email verification from URL params');
        setVerificationStatus('checking');
        
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('❌ Email verification failed:', error);
            setError('Email verification failed. Please try registering again.');
          } else if (data.user) {
            console.log('✅ Email verified successfully for:', data.user.email);
            setVerificationStatus('verified');
            setError('');
            alert('Email verified successfully! You can now sign in.');
            setIsLogin(true);
            
            // Clean the URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          console.error('❌ Verification error:', err);
          setError('An error occurred during verification.');
        } finally {
          setVerificationStatus('none');
        }
      }
    };

    handleEmailVerification();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin credentials');
    }
  };

  if (currentView === 'admin') {
    if (isAdminAuthenticated) {
      return <AdminPanel 
        setIsAdminAuthenticated={setIsAdminAuthenticated}
        setAdminEmail={setAdminEmail}
        setAdminPassword={setAdminPassword}
      />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ 
        backgroundColor: currentTheme.colors.background 
      }}>
        <div className="rounded-2xl shadow-xl p-8 w-full max-w-md" style={{ 
          backgroundColor: currentTheme.colors.surface 
        }}>
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ 
              backgroundColor: currentTheme.colors.primary 
            }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
              Admin Panel
            </h1>
            <p className="mt-2" style={{ color: currentTheme.colors.textSecondary }}>
              System Administration Access
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ 
              backgroundColor: `${currentTheme.colors.error}20`,
              color: currentTheme.colors.error 
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4" style={{ color: currentTheme.colors.textSecondary }} />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text,
                    '--tw-ring-color': currentTheme.colors.primary
                  } as React.CSSProperties}
                  placeholder="Enter admin email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text,
                  '--tw-ring-color': currentTheme.colors.primary
                } as React.CSSProperties}
                placeholder="Enter admin password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg transition-colors font-medium text-white"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              Access Admin Panel
            </button>
          </form>

          <button
            onClick={() => setCurrentView('auth')}
            className="w-full mt-4 py-2 px-4 rounded-lg transition-colors font-medium"
            style={{ 
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.textSecondary 
            }}
          >
            Back to User Login
          </button>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials or user not verified');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const success = await register(email, password);
      if (success) {
        // With Supabase Auth, show success message instead of OTP verification
        setError('');
        alert(`Registration successful! Please check your email (${email}) for the verification link from Supabase, then return here to login.`);
        setEmail('');
        setPassword('');
        setIsLogin(true);
      } else {
        // Error is already set in the register function
        console.log('Registration failed, error should be displayed');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const success = await verifyOTP(registrationEmail, otp);
      if (success) {
        setShowOTPVerification(false);
        setEmail('');
        setPassword('');
        setOtp('');
        setRegistrationEmail('');
        setIsLogin(true);
        alert('Registration successful! You can now login.');
      } else {
        setError('Invalid or expired OTP');
      }
    } catch {
      setError('OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ 
      background: `linear-gradient(135deg, ${currentTheme.colors.background} 0%, ${currentTheme.colors.surface} 100%)` 
    }}>
      <div className="rounded-2xl shadow-xl p-8 w-full max-w-md" style={{ 
        backgroundColor: currentTheme.colors.surface 
      }}>
        <div className="text-center mb-8">
          <div className="mx-auto mb-4">
            <Logo 
              size="xl" 
              showText={true} 
              variant={currentTheme.name === 'dark' ? 'white' : 'default'}
              className="justify-center"
            />
          </div>
          <p className="mt-2" style={{ color: currentTheme.colors.textSecondary }}>
            Precision Tank Monitoring & Volume Analytics
          </p>
        </div>

        {!showOTPVerification && (
          <div className="flex rounded-lg p-1 mb-6" style={{ backgroundColor: currentTheme.colors.background }}>
            <button
              onClick={() => setIsLogin(true)}
              className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: isLogin ? currentTheme.colors.surface : 'transparent',
                color: isLogin ? currentTheme.colors.primary : currentTheme.colors.textSecondary,
                boxShadow: isLogin ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: !isLogin ? currentTheme.colors.surface : 'transparent',
                color: !isLogin ? currentTheme.colors.primary : currentTheme.colors.textSecondary,
                boxShadow: !isLogin ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Register
            </button>
          </div>
        )}

        {(error || authError) && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ 
            backgroundColor: `${currentTheme.colors.error}20`,
            color: currentTheme.colors.error 
          }}>
            {authError || error}
          </div>
        )}

        {verificationStatus === 'checking' && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ 
            backgroundColor: `${currentTheme.colors.primary}20`,
            color: currentTheme.colors.primary 
          }}>
            <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            Verifying your email...
          </div>
        )}

        {showOTPVerification ? (
          <form onSubmit={handleOTPVerification} className="space-y-4">
            <div>
              <div className="text-center mb-4">
                <Shield className="w-12 h-12 mx-auto mb-2" style={{ color: currentTheme.colors.primary }} />
                <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                  Verify Your Email
                </h3>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  We've sent a 6-digit code to {registrationEmail}
                </p>
              </div>
              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text,
                  '--tw-ring-color': currentTheme.colors.primary
                } as React.CSSProperties}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg transition-colors font-medium text-white"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setShowOTPVerification(false);
                setOtp('');
                setRegistrationEmail('');
                setError('');
              }}
              className="w-full py-2 px-4 rounded-lg transition-colors font-medium"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.textSecondary 
              }}
            >
              Back to Registration
            </button>
          </form>
        ) : (
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4" style={{ color: currentTheme.colors.textSecondary }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text,
                    '--tw-ring-color': currentTheme.colors.primary
                  } as React.CSSProperties}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text,
                  '--tw-ring-color': currentTheme.colors.primary
                } as React.CSSProperties}
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-white"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentView('admin')}
            className="flex items-center space-x-2 mx-auto px-3 py-2 rounded-lg transition-colors text-sm"
            style={{ 
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.textSecondary 
            }}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Admin Panel</span>
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Developed by <a 
            href="https://glence.live" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline"
            style={{ color: currentTheme.colors.primary }}
          >
            Glence®
          </a> © 2024
        </div>
      </div>
    </div>
  );
}