import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Database, Thermometer, Activity, Gauge as GaugeIcon, Calculator, User, BookOpen, Eye, Info, X } from 'lucide-react';
import { TankVisualization } from './TankVisualization';
import { detectFluidFromDatabase, getFluidColor } from '../constants/fluidConstants';

// Unit conversion factors
const PRESSURE_UNITS = {
  'Pa': { label: 'Pascal (Pa)', factor: 1 },
  'kPa': { label: 'Kilopascal (kPa)', factor: 1000 },
  'bar': { label: 'Bar', factor: 100000 },
  'psi': { label: 'PSI', factor: 6894.76 }
};

const VOLUME_UNITS = {
  'm³': { label: 'Cubic Meter (m³)', factor: 1 },
  'L': { label: 'Liter (L)', factor: 0.001 },
  'gal': { label: 'Gallon (gal)', factor: 0.00378541 },
  'bbl': { label: 'Barrel (bbl)', factor: 0.158987 }
};

const LENGTH_UNITS = {
  'm': { label: 'Meter (m)', factor: 1 },
  'cm': { label: 'Centimeter (cm)', factor: 0.01 },
  'ft': { label: 'Feet (ft)', factor: 0.3048 },
  'in': { label: 'Inch (in)', factor: 0.0254 }
};


export function InputVolumePage() {
  const { currentUser } = useAuth();
  const { getTankSettingsForUser, addTankData, calculateFillStatus, fluidDatabase } = useData();
  
  const [selectedTankIndex, setSelectedTankIndex] = useState(-1);
  const [temperature, setTemperature] = useState(20);
  const [pressure, setPressure] = useState(101325);
  const [fuelLevel, setFuelLevel] = useState(0);
  const [operatorName, setOperatorName] = useState('');
  const [showTankVisualization, setShowTankVisualization] = useState(false);
  const [showFluidDisclaimer, setShowFluidDisclaimer] = useState(false);
  
  // Unit selection states
  const [pressureUnit, setPressureUnit] = useState('Pa');
  const [volumeUnit, setVolumeUnit] = useState('m³');
  const [lengthUnit, setLengthUnit] = useState('m');
  
  const tankSettings = getTankSettingsForUser(currentUser || '');
  const selectedTankConfig = selectedTankIndex >= 0 ? tankSettings[selectedTankIndex] : null;

  // Convert input values to base units (SI)
  const pressureInPa = pressure * (PRESSURE_UNITS as any)[pressureUnit].factor;
  const fuelLevelInM = fuelLevel * (LENGTH_UNITS as any)[lengthUnit].factor;

  const calculateVolume = () => {
    if (!selectedTankConfig || fuelLevelInM <= 0) return 0;

    const { shape, area, height, radius } = selectedTankConfig;
    const h = Math.min(fuelLevelInM, height);

    if (shape === 'Spherical' && radius) {
      // Spherical cap volume formula
      const r = radius;
      if (h > 2 * r) {
        return (4/3) * Math.PI * r**3; // Full sphere
      }
      return (1/3) * Math.PI * h**2 * (3*r - h);
    }
    
    // For Cylindrical and Rectangular tanks
    return area * h;
  };

  const calculateDensity = (): number => {
    // Simplified density calculation based on temperature and pressure
    // Using average hydrocarbon properties as baseline
  return pressure / (9.81 * fuelLevel);
  };
  
  // Enhanced fluid detection function using shared database
  const detectFluidType = (density: number) => {
    return detectFluidFromDatabase(density, fluidDatabase);
  };

  const currentVolume = calculateVolume();
  const currentDensity = calculateDensity();
  const maxVolume = selectedTankConfig ? selectedTankConfig.area * selectedTankConfig.maxLevel : 0;
  const fillPercentage = maxVolume > 0 ? (currentVolume / maxVolume) * 100 : 0;
  const detectedFluidInfo = detectFluidType(currentDensity);
  const fillStatusObj = selectedTankConfig ? calculateFillStatus(fillPercentage, selectedTankConfig) : { status: 'Unknown', color: '#6b7280' };
  const fillStatus = fillStatusObj.status;
  const fillColor = fillStatusObj.color;

  // Convert display values from base units
  const displayVolume = currentVolume / (VOLUME_UNITS as any)[volumeUnit].factor;

  const handleSaveData = () => {
    if (selectedTankIndex < 0 || !selectedTankConfig) {
      alert('Please fill in all required fields');
      return;
    }

    const data = {
      vessel: selectedTankConfig.vesselName,
      tank: selectedTankConfig.tankName,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      volume: currentVolume,
      density: currentDensity,
      fluid: detectedFluidInfo.name,
      temperature,
      pressure: pressureInPa,
      fuelLevel: fuelLevelInM,
      vesselName: selectedTankConfig.vesselName,
      tankName: selectedTankConfig.tankName,
      area: selectedTankConfig.area,
      fillPercentage,
      fillStatus,
      detectedFluid: detectedFluidInfo.name
    };

    addTankData(data);
    alert('Data saved successfully!');
    
    // Reset form
    setSelectedTankIndex(-1);
    setTemperature(20);
    setPressure(101325);
    setFuelLevel(0);
  };

  const handleDailyReadings = () => {
    if (selectedTankIndex < 0 || !selectedTankConfig || !operatorName) {
      alert('Please select a tank and enter operator name');
      return;
    }

    const data = {
      vessel: selectedTankConfig.vesselName,
      tank: selectedTankConfig.tankName,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      volume: currentVolume,
      density: currentDensity,
      fluid: detectedFluidInfo.name,
      temperature,
      pressure: pressureInPa,
      fuelLevel: fuelLevelInM,
      operatorName,
      vesselName: selectedTankConfig.vesselName,
      tankName: selectedTankConfig.tankName,
      area: selectedTankConfig.area,
      fillPercentage,
      fillStatus,
      detectedFluid: detectedFluidInfo.name
    };

    addTankData(data);
    alert('Daily readings saved successfully!');
    
    // Reset readings but keep tank selection
    setTemperature(20);
    setPressure(101325);
    setFuelLevel(0);
    setOperatorName('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Input & Volume</h1>
        <p className="text-gray-600">Enter daily measurements and calculate tank volumes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Tank Information</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Tank *
              </label>
              <select
                value={selectedTankIndex}
                onChange={(e) => setSelectedTankIndex(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={-1}>Select a tank</option>
                {tankSettings.map((tank, index) => (
                  <option key={index} value={index}>
                    {tank.tankName} - {tank.vesselName} ({tank.shape})
                  </option>
                ))}
              </select>
            </div>

            {selectedTankConfig && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Vessel:</strong> {selectedTankConfig.vesselName}<br />
                  <strong>Tank:</strong> {selectedTankConfig.tankName}<br />
                  <strong>Tank Shape:</strong> {selectedTankConfig.shape}<br />
                  <strong>Max Level:</strong> {selectedTankConfig.maxLevel} m<br />
                  <strong>Area:</strong> {selectedTankConfig.area.toFixed(3)} m²
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Measurements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Thermometer className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Daily Measurements</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C)
              </label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pressure
              </label>
              <div className="flex space-x-2 mb-1">
                <select
                  value={pressureUnit}
                  onChange={(e) => setPressureUnit(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {Object.entries(PRESSURE_UNITS).map(([unit, config]) => (
                    <option key={unit} value={unit}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Activity className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="1"
                  value={pressure}
                  onChange={(e) => setPressure(parseFloat(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Level
              </label>
              <div className="flex space-x-2 mb-1">
                <select
                  value={lengthUnit}
                  onChange={(e) => setLengthUnit(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Object.entries(LENGTH_UNITS).map(([unit, config]) => (
                    <option key={unit} value={unit}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <GaugeIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(parseFloat(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  max={selectedTankConfig ? selectedTankConfig.maxLevel / (LENGTH_UNITS as any)[lengthUnit].factor : undefined}
                />
              </div>
              {selectedTankConfig && fuelLevelInM > selectedTankConfig.maxLevel && (
                <p className="text-sm text-red-600 mt-1">
                  Warning: Fuel level exceeds maximum tank level ({selectedTankConfig.maxLevel} m)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter operator name"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculations Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calculator className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Calculated Results</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <GaugeIcon className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Current Volume</p>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-2xl font-bold text-blue-600">{displayVolume.toFixed(3)}</p>
                <select
                  value={volumeUnit}
                  onChange={(e) => setVolumeUnit(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Object.entries(VOLUME_UNITS).map(([unit]) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Calculated Density</p>
              <p className="text-2xl font-bold text-green-600">{currentDensity.toFixed(2)} kg/m³</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Tank Area</p>
              <p className="text-2xl font-bold text-orange-600">{selectedTankConfig?.area.toFixed(3) || '0.000'} m²</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{
                backgroundColor: `${detectedFluidInfo.color}20`
              }}>
                <Thermometer className="w-8 h-8" style={{ color: detectedFluidInfo.color }} />
              </div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                <p className="text-sm font-medium text-gray-600">Detected Fluid</p>
                <button
                  onClick={() => setShowFluidDisclaimer(true)}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                  title="Important information about fluid detection"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lg font-bold" style={{ color: detectedFluidInfo.color }}>
                {detectedFluidInfo.name}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <GaugeIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Fill Percentage</p>
              <p className="text-2xl font-bold text-indigo-600">{fillPercentage.toFixed(1)}%</p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3`} style={{
                backgroundColor: `${fillColor}20`
              }}>
                <Activity className="w-8 h-8" style={{ color: fillColor }} />
              </div>
              <p className="text-sm font-medium text-gray-600">Fill Status</p>
              <button
                onClick={() => setShowTankVisualization(true)}
                className="text-2xl font-bold hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: fillColor }}
              >
                {fillStatus}
              </button>
              <div className="flex items-center justify-center mt-1">
                <Eye className="w-3 h-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-400">Click to visualize</span>
              </div>
            </div>
          </div>
          
          {/* Density Reference Chart */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Fluid Density Reference (kg/m³)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
              {Object.entries(fluidDatabase).map(([fluidName, range]) => {
                const fluidColor = getFluidColor(fluidName);
                return (
                  <div key={fluidName} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: fluidColor }}
                    ></div>
                    <span className="text-gray-700">
                      {fluidName}: {range.min}-{range.max}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-4">
              <button
                onClick={handleSaveData}
                disabled={selectedTankIndex < 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Save Volume
              </button>
              <button
                onClick={handleDailyReadings}
                disabled={selectedTankIndex < 0 || !operatorName}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <BookOpen className="w-4 h-4" />
                <span>Daily Readings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tank Visualization Modal */}
      {showTankVisualization && selectedTankConfig && (
        <TankVisualization
          tankConfig={selectedTankConfig}
          currentVolume={currentVolume}
          fillPercentage={fillPercentage}
          fillStatus={fillStatus}
          onClose={() => setShowTankVisualization(false)}
        />
      )}

      {/* Fluid Detection Disclaimer Modal */}
      {showFluidDisclaimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Info className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Fluid Detection Notice
                  </h3>
                </div>
                <button
                  onClick={() => setShowFluidDisclaimer(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-amber-800 text-sm font-medium mb-2">
                    ⚠️ Important Disclaimer
                  </p>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    The displayed liquid name is an approximation based on calculated density. 
                    Due to potential similarities in density between liquids, the actual liquid may differ. 
                    Use as a guide only and verify liquid identity through additional means if necessary.
                  </p>
                </div>
                
                <div className="text-gray-600 text-sm space-y-2">
                  <p><strong>Current Detection:</strong></p>
                  <div className="flex items-center space-x-2 pl-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: detectedFluidInfo.color }}
                    ></div>
                    <span className="font-medium" style={{ color: detectedFluidInfo.color }}>
                      {detectedFluidInfo.name}
                    </span>
                  </div>
                  <p className="pl-4 text-xs">
                    Based on density: {currentDensity.toFixed(2)} kg/m³
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowFluidDisclaimer(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}