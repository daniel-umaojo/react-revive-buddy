import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, UserPlus, Mail, Shield, Settings as SettingsIcon } from 'lucide-react';
import { AdminPanel } from './AdminPanel';
import { Logo } from './Logo';

export function AuthPage() {
  const [currentView, setCurrentView] = useState('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  const { login, register, verifyOTP } = useAuth();
  const { currentTheme } = useTheme();

  // Admin credentials (in production, this should be more secure)
  const ADMIN_EMAIL = 'admin@glence.com';
  const ADMIN_PASSWORD = 'glence-admin-2024';

  const handleAdminLogin = (e) => {
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
        backgroundColor: currentTheme?.colors.background 
      }}>
        <div className="rounded-2xl shadow-xl p-8 w-full max-w-md" style={{ 
          backgroundColor: currentTheme?.colors.surface 
        }}>
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ 
              backgroundColor: currentTheme?.colors.primary 
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
                  }}
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
                } }
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

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(email, password)) {
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleRegister = async (e) => {
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
        setRegistrationEmail(email);
        setShowOTPVerification(true);
      } else {
        setError('Registration failed. Email may already exist.');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = (e) => {
    e.preventDefault();
    if (verifyOTP(registrationEmail, otp)) {
      setError('');
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

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ 
            backgroundColor: `${currentTheme.colors.error}20`,
            color: currentTheme.colors.error 
          }}>
            {error}
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
                } }
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
                  } }
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
                } }
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