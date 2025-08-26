import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Shield, 
  Users, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronRight,
  Settings,
  BarChart3,
  Download,
  LogOut,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  getAdminDashboardStats,
  getAllUsersOverview,
  getAllTankData,
  getAllTankSettings,
  getAuthUsersInfo,
  isCurrentUserAdmin
} from '../lib/supabaseService';

interface AdminPanelProps {
  setIsAdminAuthenticated: (value: boolean) => void;
  setAdminEmail: (value: string) => void;
  setAdminPassword: (value: string) => void;
}

export function AdminPanel({ setIsAdminAuthenticated, setAdminEmail, setAdminPassword }: AdminPanelProps) {
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [usersOverview, setUsersOverview] = useState<any[]>([]);
  const [allTankData, setAllTankData] = useState<any[]>([]);
  const [allTankSettings, setAllTankSettings] = useState<any[]>([]);
  const [authUsers, setAuthUsers] = useState<any[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Load admin data on component mount
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading admin dashboard data...');

      // Verify admin access first
      const { isAdmin } = await isCurrentUserAdmin();
      if (!isAdmin) {
        setError('Access denied - admin privileges required');
        return;
      }

      // Load all admin data in parallel
      const [statsResult, usersResult, tankDataResult, tankSettingsResult, authUsersResult] = await Promise.all([
        getAdminDashboardStats(),
        getAllUsersOverview(),
        getAllTankData(),
        getAllTankSettings(),
        getAuthUsersInfo()
      ]);

      // Handle results
      if (statsResult.data) {
        setDashboardStats(statsResult.data);
      } else if (statsResult.error) {
        console.error('❌ Error loading dashboard stats:', statsResult.error);
      }

      if (usersResult.data) {
        setUsersOverview(usersResult.data);
      } else if (usersResult.error) {
        console.error('❌ Error loading users overview:', usersResult.error);
      }

      if (tankDataResult.data) {
        setAllTankData(tankDataResult.data);
      } else if (tankDataResult.error) {
        console.error('❌ Error loading tank data:', tankDataResult.error);
      }

      if (tankSettingsResult.data) {
        setAllTankSettings(tankSettingsResult.data);
      } else if (tankSettingsResult.error) {
        console.error('❌ Error loading tank settings:', tankSettingsResult.error);
      }

      if (authUsersResult.data) {
        setAuthUsers(authUsersResult.data);
      } else if (authUsersResult.error) {
        console.error('❌ Error loading auth users:', authUsersResult.error);
      }

      console.log('✅ Admin dashboard data loaded successfully');
    } catch (err) {
      console.error('❌ Error loading admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const exportAllData = () => {
    if (!allTankData.length) {
      alert('No data to export');
      return;
    }

    const headers = [
      'User Email', 'Auth User ID', 'Vessel', 'Tank', 'Date', 'Time', 
      'Volume (m³)', 'Temperature (°C)', 'Pressure (Pa)', 'Density (kg/m³)', 
      'Fluid', 'Operator', 'Fill %', 'Status'
    ];
    
    const csvContent = [
      headers.join(','),
      ...allTankData.map(row => [
        row.user_email || '',
        row.auth_user_id || '',
        row.vessel_name || '',
        row.tank_name || '',
        row.date || '',
        row.time || '',
        row.volume || '',
        row.temperature || '',
        row.pressure || '',
        row.density || '',
        row.fluid || '',
        row.operator_name || '',
        row.fill_percentage || '',
        row.fill_status || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase_tank_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: currentTheme.colors.background
      }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ 
            borderColor: currentTheme.colors.primary 
          }}></div>
          <p style={{ color: currentTheme.colors.textSecondary }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: currentTheme.colors.background
      }}>
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 mx-auto" style={{ color: currentTheme.colors.error }} />
          <h2 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>Admin Access Error</h2>
          <p style={{ color: currentTheme.colors.textSecondary }}>{error}</p>
          <button
            onClick={() => {
              setIsAdminAuthenticated(false);
              setAdminEmail('');
              setAdminPassword('');
            }}
            className="px-4 py-2 rounded-lg" style={{ 
              backgroundColor: currentTheme.colors.primary,
              color: 'white'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ 
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text 
    }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
              backgroundColor: currentTheme.colors.primary 
            }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: currentTheme.colors.primary }}>
                Supabase Admin Dashboard
              </h1>
              <p style={{ color: currentTheme.colors.textSecondary }}>
                System overview and user management via Supabase Auth
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: currentTheme.colors.secondary,
                color: 'white',
                opacity: refreshing ? 0.6 : 1
              }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportAllData}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: currentTheme.colors.primary,
                color: 'white'
              }}
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
            <button
              onClick={() => {
                setIsAdminAuthenticated(false);
                setAdminEmail('');
                setAdminPassword('');
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: currentTheme.colors.error,
                color: 'white'
              }}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl shadow-sm border p-6" style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border 
          }}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ 
                backgroundColor: `${currentTheme.colors.primary}20` 
              }}>
                <Users className="w-6 h-6" style={{ color: currentTheme.colors.primary }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                  Total Users
                </p>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                  {dashboardStats?.totalUsers || usersOverview.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-sm border p-6" style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border 
          }}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ 
                backgroundColor: `${currentTheme.colors.success}20` 
              }}>
                <CheckCircle className="w-6 h-6" style={{ color: currentTheme.colors.success }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                  Verified Users
                </p>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                  {authUsers.filter(user => user.email_confirmed_at).length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-sm border p-6" style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border 
          }}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ 
                backgroundColor: `${currentTheme.colors.secondary}20` 
              }}>
                <Settings className="w-6 h-6" style={{ color: currentTheme.colors.secondary }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                  Tank Settings
                </p>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                  {dashboardStats?.totalTankSettings || allTankSettings.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl shadow-sm border p-6" style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border 
          }}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ 
                backgroundColor: `${currentTheme.colors.accent}20` 
              }}>
                <BarChart3 className="w-6 h-6" style={{ color: currentTheme.colors.accent }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                  Tank Data Records
                </p>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                  {dashboardStats?.totalTankData || allTankData.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Overview */}
        <div className="rounded-xl shadow-sm border" style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border 
        }}>
          <div className="p-6 border-b" style={{ borderColor: currentTheme.colors.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6" style={{ color: currentTheme.colors.primary }} />
                <h2 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
                  Supabase Auth Users
                </h2>
              </div>
              <div className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                {usersOverview.length} users total
              </div>
            </div>
          </div>

          <div className="p-6">
            {usersOverview.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4" style={{ color: currentTheme.colors.textSecondary }} />
                <p style={{ color: currentTheme.colors.textSecondary }}>No users found in database</p>
              </div>
            ) : (
              <div className="space-y-4">
                {usersOverview.map((user) => (
                  <div key={user.auth_user_id} className="border rounded-lg" style={{ borderColor: currentTheme.colors.border }}>
                    <div 
                      className="p-4 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => toggleUserExpansion(user.auth_user_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {expandedUsers.has(user.auth_user_id) ? 
                              <ChevronDown className="w-4 h-4" style={{ color: currentTheme.colors.textSecondary }} /> : 
                              <ChevronRight className="w-4 h-4" style={{ color: currentTheme.colors.textSecondary }} />
                            }
                            <div className={`w-3 h-3 rounded-full ${
                              user.email_confirmed_at ? 'bg-green-500' : 'bg-yellow-500'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                              {user.email}
                            </p>
                            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                              {user.email_confirmed_at ? 'Email Verified' : 'Pending Verification'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                          <span>{user.tank_settings_count || 0} tank settings</span>
                          <span>{user.tank_data_count || 0} data records</span>
                          <span className="text-xs">
                            ID: {user.auth_user_id?.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    {expandedUsers.has(user.auth_user_id) && (
                      <div className="px-4 pb-4 border-t" style={{ borderColor: currentTheme.colors.border }}>
                        <div className="mt-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <label className="block font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                                Auth User ID
                              </label>
                              <code className="block p-2 rounded text-xs font-mono break-all" style={{ 
                                backgroundColor: currentTheme.colors.background,
                                color: currentTheme.colors.text 
                              }}>
                                {user.auth_user_id}
                              </code>
                            </div>
                            <div>
                              <label className="block font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                                Created At
                              </label>
                              <p style={{ color: currentTheme.colors.text }}>
                                {user.auth_created_at ? new Date(user.auth_created_at).toLocaleString() : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="block font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                                Last Sign In
                              </label>
                              <p style={{ color: currentTheme.colors.text }}>
                                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                              </p>
                            </div>
                          </div>
                          
                          {user.display_name || user.company_name ? (
                            <div>
                              <label className="block font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                                Profile Info
                              </label>
                              <div className="p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                                {user.display_name && (
                                  <div className="mb-1">
                                    <span style={{ color: currentTheme.colors.textSecondary }}>Name: </span>
                                    <span style={{ color: currentTheme.colors.text }}>{user.display_name}</span>
                                  </div>
                                )}
                                {user.company_name && (
                                  <div>
                                    <span style={{ color: currentTheme.colors.textSecondary }}>Company: </span>
                                    <span style={{ color: currentTheme.colors.text }}>{user.company_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null}
                          
                          <div>
                            <label className="block font-medium mb-2" style={{ color: currentTheme.colors.textSecondary }}>
                              Data Summary
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                                <div className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
                                  {user.tank_settings_count || 0}
                                </div>
                                <div className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                                  Tank Settings
                                </div>
                              </div>
                              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                                <div className="text-2xl font-bold" style={{ color: currentTheme.colors.success }}>
                                  {user.tank_data_count || 0}
                                </div>
                                <div className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                                  Data Records
                                </div>
                              </div>
                              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                                <div className="text-2xl font-bold" style={{ color: currentTheme.colors.secondary }}>
                                  {user.fluid_database_count || 0}
                                </div>
                                <div className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                                  Fluid Types
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Tank Data */}
        {allTankData.length > 0 && (
          <div className="rounded-xl shadow-sm border" style={{ 
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border 
          }}>
            <div className="p-6 border-b" style={{ borderColor: currentTheme.colors.border }}>
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6" style={{ color: currentTheme.colors.primary }} />
                <h2 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
                  Recent Tank Data ({allTankData.length} total records)
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: currentTheme.colors.border }}>
                      <th className="text-left p-2" style={{ color: currentTheme.colors.textSecondary }}>User</th>
                      <th className="text-left p-2" style={{ color: currentTheme.colors.textSecondary }}>Vessel/Tank</th>
                      <th className="text-left p-2" style={{ color: currentTheme.colors.textSecondary }}>Date</th>
                      <th className="text-left p-2" style={{ color: currentTheme.colors.textSecondary }}>Volume</th>
                      <th className="text-left p-2" style={{ color: currentTheme.colors.textSecondary }}>Fluid</th>
                      <th className="text-left p-2" style={{ color: currentTheme.colors.textSecondary }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTankData.slice(0, 10).map((record, index) => (
                      <tr key={index} className="border-b" style={{ borderColor: currentTheme.colors.border }}>
                        <td className="p-2" style={{ color: currentTheme.colors.text }}>
                          {record.user_email || 'N/A'}
                        </td>
                        <td className="p-2" style={{ color: currentTheme.colors.text }}>
                          {record.vessel_name}/{record.tank_name}
                        </td>
                        <td className="p-2" style={{ color: currentTheme.colors.textSecondary }}>
                          {record.date}
                        </td>
                        <td className="p-2" style={{ color: currentTheme.colors.text }}>
                          {record.volume?.toFixed(2) || 'N/A'} m³
                        </td>
                        <td className="p-2" style={{ color: currentTheme.colors.textSecondary }}>
                          {record.fluid || 'N/A'}
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            record.fill_status === 'Normal' ? 'bg-green-100 text-green-800' :
                            record.fill_status === 'Low' ? 'bg-yellow-100 text-yellow-800' :
                            record.fill_status === 'High' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {record.fill_status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {allTankData.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                    Showing 10 of {allTankData.length} records. Use Export to download all data.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}