import React, { useState } from 'react';
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
  Trash2
} from 'lucide-react';

interface AdminPanelProps {
  setIsAdminAuthenticated: (value: boolean) => void;
  setAdminEmail: (value: string) => void;
  setAdminPassword: (value: string) => void;
}

export function AdminPanel({ setIsAdminAuthenticated, setAdminEmail, setAdminPassword }: AdminPanelProps) {
  const { users } = useAuth();
  const { tankData, tankSettings } = useData();
  const { currentTheme } = useTheme();
  const [showPasswords, setShowPasswords] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleUserExpansion = (email: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(email)) {
      newExpanded.delete(email);
    } else {
      newExpanded.add(email);
    }
    setExpandedUsers(newExpanded);
  };

  const handleDeleteUser = (email: string) => {
    if (window.confirm(`Are you sure you want to delete user: ${email}? This action cannot be undone.`)) {
      // Remove user from localStorage
      const storedUsers = localStorage.getItem('glence_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const updatedUsers = users.filter((user: { email: string }) => user.email !== email);
        localStorage.setItem('glence_users', JSON.stringify(updatedUsers));
      }

      // Remove user's tank settings
      const storedSettings = localStorage.getItem('glence_tank_settings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        delete settings[email];
        localStorage.setItem('glence_tank_settings', JSON.stringify(settings));
      }

      // Remove user's tank data
      const storedData = localStorage.getItem('glence_tank_data');
      if (storedData) {
        const data = JSON.parse(storedData);
        const userTanks = tankSettings[email] || [];
        const updatedData = data.filter((item: { vesselName: string; tankName: string }) => {
          return !userTanks.some((tank: { vesselName: string; tankName: string }) => 
            tank.vesselName === item.vesselName && tank.tankName === item.tankName
          );
        });
        localStorage.setItem('glence_tank_data', JSON.stringify(updatedData));
      }

      alert(`User ${email} has been deleted successfully.`);
      window.location.reload(); // Refresh to update the display
    }
  };
  const getUserTankCount = (email: string) => {
    return tankSettings[email]?.length || 0;
  };

  const getUserDataCount = (email: string) => {
    return tankData.filter(data => {
      const userTanks = tankSettings[email] || [];
      return userTanks.some(tank => 
        tank.vesselName === data.vesselName && tank.tankName === data.tankName
      );
    }).length;
  };

  const exportAllData = () => {
    const allUserData = [];
    
    // Collect all user data
    users.forEach(user => {
      const userTanks = tankSettings[user.email] || [];
      const userData = tankData.filter(data => {
        return userTanks.some(tank => 
          tank.vesselName === data.vesselName && tank.tankName === data.tankName
        );
      });
      
      userData.forEach(data => {
        allUserData.push({
          userEmail: user.email,
          vessel: data.vesselName,
          tank: data.tankName,
          date: data.date,
          time: data.time || '',
          volume: data.volume,
          temperature: data.temperature,
          pressure: data.pressure,
          density: data.density,
          fluid: data.detectedFluid,
          operator: data.operatorName || '',
          fillPercentage: data.fillPercentage,
          status: data.fillStatus
        });
      });
    });

    const headers = ['User Email', 'Vessel', 'Tank', 'Date', 'Time', 'Volume (m³)', 'Temperature (°C)', 'Pressure (Pa)', 'Density (kg/m³)', 'Fluid', 'Operator', 'Fill %', 'Status'];
    const csvContent = [
      headers.join(','),
      ...allUserData.map(row => 
        [row.userEmail, row.vessel, row.tank, row.date, row.time, row.volume, row.temperature, row.pressure, row.density, row.fluid, row.operator, row.fillPercentage, row.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_tank_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalTanks = Object.values(tankSettings).reduce((sum, tanks) => sum + tanks.length, 0);
  const verifiedUsers = users.filter(user => user.isVerified).length;

  return (
    <div className="min-h-screen p-6" style={{ 
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text 
    }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
            backgroundColor: currentTheme.colors.primary 
          }}>
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: currentTheme.colors.primary }}>
              Admin Dashboard
            </h1>
            <p style={{ color: currentTheme.colors.textSecondary }}>
              System overview and user management
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportAllData}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: currentTheme.colors.primary,
                color: 'white'
              }}
            >
              <Download className="w-4 h-4" />
              <span>Export All Data</span>
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
                  {users.length}
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
                <Shield className="w-6 h-6" style={{ color: currentTheme.colors.success }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                  Verified Users
                </p>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                  {verifiedUsers}
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
                  Total Tanks
                </p>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                  {totalTanks}
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
                  Data Points
                </p>
                <p className="text-2xl font-bold" style={{ color: currentTheme.colors.text }}>
                  {tankData.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="rounded-xl shadow-sm border" style={{ 
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border 
        }}>
          <div className="p-6 border-b" style={{ borderColor: currentTheme.colors.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6" style={{ color: currentTheme.colors.primary }} />
                <h2 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
                  User Management
                </h2>
              </div>
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: `${currentTheme.colors.primary}20`,
                  color: currentTheme.colors.primary 
                }}
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4" style={{ color: currentTheme.colors.textSecondary }} />
                <p style={{ color: currentTheme.colors.textSecondary }}>No users registered yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.email} className="border rounded-lg" style={{ borderColor: currentTheme.colors.border }}>
                    <div 
                      className="p-4 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => toggleUserExpansion(user.email)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {expandedUsers.has(user.email) ? 
                              <ChevronDown className="w-4 h-4" style={{ color: currentTheme.colors.textSecondary }} /> : 
                              <ChevronRight className="w-4 h-4" style={{ color: currentTheme.colors.textSecondary }} />
                            }
                            <div className={`w-3 h-3 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                              {user.email}
                            </p>
                            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                              {user.isVerified ? 'Verified' : 'Pending Verification'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                          <span>{getUserTankCount(user.email)} tanks</span>
                          <span>{getUserDataCount(user.email)} data points</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user.email);
                            }}
                            className="flex items-center space-x-1 px-2 py-1 rounded transition-colors text-xs"
                            style={{ 
                              backgroundColor: `${currentTheme.colors.error}20`,
                              color: currentTheme.colors.error 
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedUsers.has(user.email) && (
                      <div className="px-4 pb-4 border-t" style={{ borderColor: currentTheme.colors.border }}>
                        <div className="mt-4 space-y-3">
                          {showPasswords && (
                            <div>
                              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.textSecondary }}>
                                Password Hash
                              </label>
                              <code className="block p-2 rounded text-xs font-mono break-all" style={{ 
                                backgroundColor: currentTheme.colors.background,
                                color: currentTheme.colors.text 
                              }}>
                                {user.hashedPassword}
                              </code>
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.textSecondary }}>
                              Tank Configurations
                            </label>
                            {tankSettings[user.email] && tankSettings[user.email].length > 0 ? (
                              <div className="space-y-2">
                                {tankSettings[user.email].map((tank, index) => (
                                  <div key={index} className="p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                      <div>
                                        <span style={{ color: currentTheme.colors.textSecondary }}>Vessel:</span>
                                        <span className="ml-1 font-medium" style={{ color: currentTheme.colors.text }}>
                                          {tank.vesselName}
                                        </span>
                                      </div>
                                      <div>
                                        <span style={{ color: currentTheme.colors.textSecondary }}>Tank:</span>
                                        <span className="ml-1 font-medium" style={{ color: currentTheme.colors.text }}>
                                          {tank.tankName}
                                        </span>
                                      </div>
                                      <div>
                                        <span style={{ color: currentTheme.colors.textSecondary }}>Shape:</span>
                                        <span className="ml-1 font-medium" style={{ color: currentTheme.colors.text }}>
                                          {tank.shape}
                                        </span>
                                      </div>
                                      <div>
                                        <span style={{ color: currentTheme.colors.textSecondary }}>Area:</span>
                                        <span className="ml-1 font-medium" style={{ color: currentTheme.colors.text }}>
                                          {tank.area.toFixed(2)} m²
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                                No tank configurations found
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.textSecondary }}>
                              Recent Activity
                            </label>
                            {getUserDataCount(user.email) > 0 ? (
                              <div className="space-y-1">
                                {tankData
                                  .filter(data => {
                                    const userTanks = tankSettings[user.email] || [];
                                    return userTanks.some(tank => 
                                      tank.vesselName === data.vesselName && tank.tankName === data.tankName
                                    );
                                  })
                                  .slice(-3)
                                  .map((data, index) => (
                                    <div key={index} className="text-sm p-2 rounded" style={{ backgroundColor: currentTheme.colors.background }}>
                                      <span style={{ color: currentTheme.colors.text }}>
                                        {data.date} {data.time || ''} - {data.vesselName}/{data.tankName}: {data.volume.toFixed(2)} m³
                                      </span>
                                      {data.operatorName && (
                                        <span className="ml-2" style={{ color: currentTheme.colors.textSecondary }}>
                                          by {data.operatorName}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                                No activity recorded
                              </p>
                            )}
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
      </div>
    </div>
  );
}