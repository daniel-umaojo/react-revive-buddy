
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Gauge, 
  Settings, 
  BarChart3, 
  TrendingUp, 
  Database,
  LogOut,
  Palette,
  Calendar,
  TrendingDown
} from 'lucide-react';



export function Sidebar({ currentSection, onSectionChange }) {
  const { currentUser, logout } = useAuth();
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();
  const { tankData } = useData();

  const sections = [
    { id: 'Input & Volume', icon: Database, label: 'Input & Volume' },
    { id: 'Prediction Tool', icon: TrendingUp, label: 'Prediction Tool' },
    { id: 'Volume Charts', icon: BarChart3, label: 'Volume Charts' },
    { id: 'Settings', icon: Settings, label: 'Settings' }
  ];

  const totalVolume = tankData.reduce((sum, data) => sum + data.volume, 0);
  
  // Calculate today's volume
  const today = new Date().toISOString().split('T')[0];
  const todayData = tankData.filter(data => data.date === today);
  const volumeToday = todayData.reduce((sum, data) => sum + data.volume, 0);
  
  // Calculate average volume
  const avgVolume = tankData.length > 0 
    ? tankData.reduce((sum, data) => sum + data.volume, 0) / tankData.length 
    : 0;
  
  const avgDensity = tankData.length > 0 
    ? tankData.reduce((sum, data) => sum + data.density, 0) / tankData.length 
    : 0;
    
  const tanksMonitored = new Set(tankData.map(data => `${data.vesselName}-${data.tankName}`)).size;
  const vesselsMonitored = new Set(tankData.map(data => data.vesselName)).size;
  const lastUpdate = tankData.length > 0 
    ? new Date(Math.max(...tankData.map(data => new Date(data.date).getTime())))
    : null;

  return (
    <div className="w-80 border-r flex flex-col transition-all duration-300" style={{ 
      backgroundColor: currentTheme.colors.surface,
      color: currentTheme.colors.text,
      borderColor: currentTheme.colors.border
    }}>
      <div className="p-6 border-b" style={{ borderColor: currentTheme.colors.border }}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ 
            backgroundColor: currentTheme.colors.primary 
          }}>
            <Gauge className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>
              GlenceGauge®
            </h1>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              Tank Monitoring
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b" style={{ borderColor: currentTheme.colors.border }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ 
          color: currentTheme.colors.textSecondary 
        }}>
          Theme Settings
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Theme Mode</span>
            <select
              value={themeName}
              onChange={(e) => setTheme(e.target.value)}
              className="px-3 py-1 rounded-lg text-sm transition-colors"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text,
                borderColor: currentTheme.colors.border
              }}
            >
              {availableThemes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Current Theme</span>
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <div 
                className="w-6 h-6 rounded border-2 cursor-pointer"
                style={{ 
                  backgroundColor: currentTheme.colors.primary,
                  borderColor: currentTheme.colors.border
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ 
          color: currentTheme.colors.textSecondary 
        }}>
          Navigation
        </h3>
        <div className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = currentSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors"
                style={{
                  backgroundColor: isActive ? currentTheme.colors.primary : 'transparent',
                  color: isActive ? 'white' : currentTheme.colors.text
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = currentTheme.colors.background;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t" style={{ borderColor: currentTheme.colors.border }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ 
          color: currentTheme.colors.textSecondary 
        }}>
          Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Volume:</span>
            <span className="font-medium" style={{ color: currentTheme.colors.text }}>
              {totalVolume.toFixed(2)} m³
            </span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Volume Today:</span>
            </div>
            <span className="font-medium" style={{ color: currentTheme.colors.primary }}>
              {volumeToday.toFixed(2)} m³
            </span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center space-x-1">
              <TrendingDown className="w-3 h-3" />
              <span>Avg Volume:</span>
            </div>
            <span className="font-medium" style={{ color: currentTheme.colors.secondary }}>
              {avgVolume.toFixed(2)} m³
            </span>
          </div>
          <div className="flex justify-between">
            <span>Avg Density:</span>
            <span className="font-medium" style={{ color: currentTheme.colors.text }}>
              {avgDensity.toFixed(2)} kg/m³
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tanks Monitored:</span>
            <span className="font-medium" style={{ color: currentTheme.colors.text }}>
              {tanksMonitored}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Vessels Monitored:</span>
            <span className="font-medium" style={{ color: currentTheme.colors.text }}>
              {vesselsMonitored}
            </span>
          </div>
          {lastUpdate && (
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="font-medium" style={{ color: currentTheme.colors.text }}>
                {lastUpdate.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t" style={{ borderColor: currentTheme.colors.border }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
              Logged in as:
            </p>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              {currentUser}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
            style={{ 
              color: currentTheme.colors.error,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${currentTheme.colors.error}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}