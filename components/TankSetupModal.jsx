import { useState } from 'react';
import { useData, TankSettings } from '../context/DataContext';
import { X, Settings } from 'lucide-react';

export function TankSetupModal({ email, onComplete }) {
  const [numTanks, setNumTanks] = useState(1);
  const [vesselName, setVesselName] = useState('');
  const [tankConfigs, setTankConfigs] = useState([
    { 
      vesselName: '', 
      tankName: 'Tank1', 
      shape: 'Cylindrical',
      lowFillThreshold: { min: 0, max: 25 },
      halfFillThreshold: { min: 25, max: 75 },
      highFillThreshold: { min: 75, max: 95 },
      overflowThreshold: { min: 95, max: 100 }
    }
  ]);
  
  const { saveTankSettings } = useData();

  const updateTankConfig = (index, field, value) => {
    const updated = [...tankConfigs];
    updated[index] = { ...updated[index], [field]: value };
    
    // Recalculate area when dimensions change
    if (['radius', 'length', 'breadth', 'height'].includes(field)) {
      const config = updated[index];
      if (config.shape === 'Cylindrical' && config.radius) {
        config.area = Math.PI * config.radius * config.radius;
      } else if (config.shape === 'Rectangular' && config.length && config.breadth) {
        config.area = config.length * config.breadth;
      } else if (config.shape === 'Spherical' && config.radius) {
        config.area = Math.PI * config.radius * config.radius;
        config.height = config.radius * 2;
      }
    }
    
    setTankConfigs(updated);
  };

  const handleNumTanksChange = (num) => {
    setNumTanks(num);
    const newConfigs = Array.from({ length: num }, (_, i) => ({
      vesselName: vesselName,
      tankName: `Tank${i + 1}`,
      shape: 'Cylindrical' ,
      lowFillThreshold: { min: 0, max: 25 },
      halfFillThreshold: { min: 25, max: 75 },
      highFillThreshold: { min: 75, max: 95 },
      overflowThreshold: { min: 95, max: 100 },
      ...tankConfigs[i]
    }));
    setTankConfigs(newConfigs);
  };

  const handleVesselNameChange = (name) => {
    setVesselName(name);
    const updatedConfigs = tankConfigs.map(config => ({
      ...config,
      vesselName: name
    }));
    setTankConfigs(updatedConfigs);
  };

  const handleSave = () => {
    const validConfigs = tankConfigs.filter(config => 
      config.vesselName &&
      config.tankName && 
      config.shape && 
      config.maxLevel && 
      config.area && 
      config.height &&
      config.lowFillThreshold !== undefined &&
      config.halfFillThreshold !== undefined &&
      config.highFillThreshold !== undefined &&
      config.overflowThreshold !== undefined
    ) ;

    if (validConfigs.length === numTanks) {
      saveTankSettings(email, validConfigs);
      onComplete();
    } else {
      alert('Please fill in all required fields for all tanks');
    }
  };

  const isFormValid = tankConfigs.every(config => 
    config.vesselName &&
    config.tankName && 
    config.shape && 
    config.maxLevel && 
    config.area && 
    config.height &&
    config.lowFillThreshold !== undefined &&
    config.halfFillThreshold !== undefined &&
    config.highFillThreshold !== undefined &&
    config.overflowThreshold !== undefined
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Configure Tank Settings for {email}
              </h2>
            </div>
            <button
              onClick={onComplete}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vessel Name
            </label>
            <input
              type="text"
              value={vesselName}
              onChange={(e) => handleVesselNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Enter vessel name (e.g., Dijama, Queen Elizabeth)"
            />
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tanks
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={numTanks}
              onChange={(e) => handleNumTanksChange(parseInt(e.target.value) || 1)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-6">
            {tankConfigs.map((config, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {config.tankName} Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tank Name
                    </label>
                    <input
                      type="text"
                      value={config.tankName || ''}
                      onChange={(e) => updateTankConfig(index, 'tankName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter tank name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tank Shape
                    </label>
                    <select
                      value={config.shape || 'Cylindrical'}
                      onChange={(e) => updateTankConfig(index, 'shape', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cylindrical">Cylindrical</option>
                      <option value="Rectangular">Rectangular</option>
                      <option value="Spherical">Spherical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Fuel Level (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={config.maxLevel || ''}
                      onChange={(e) => updateTankConfig(index, 'maxLevel', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter max level"
                    />
                  </div>

                  {config.shape === 'Cylindrical' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Radius (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          value={config.radius || ''}
                          onChange={(e) => updateTankConfig(index, 'radius', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter radius"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Height (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          value={config.height || ''}
                          onChange={(e) => updateTankConfig(index, 'height', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter height"
                        />
                      </div>
                    </>
                  )}

                  {config.shape === 'Rectangular' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Length (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          value={config.length || ''}
                          onChange={(e) => updateTankConfig(index, 'length', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter length"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Breadth (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          value={config.breadth || ''}
                          onChange={(e) => updateTankConfig(index, 'breadth', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter breadth"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Height (m)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          value={config.height || ''}
                          onChange={(e) => updateTankConfig(index, 'height', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter height"
                        />
                      </div>
                    </>
                  )}

                  {config.shape === 'Spherical' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Radius (m)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        value={config.radius || ''}
                        onChange={(e) => updateTankConfig(index, 'radius', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter radius"
                      />
                    </div>
                  )}

                  {config.area && (
                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calculated Area (m²)
                      </label>
                      <input
                        type="text"
                        value={config.area.toFixed(3)}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Fill Level Thresholds (%)</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Low Fill Range (%)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.lowFillThreshold?.min || ''}
                          onChange={(e) => updateTankConfig(index, 'lowFillThreshold', { ...config.lowFillThreshold, min: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.lowFillThreshold?.max || ''}
                          onChange={(e) => updateTankConfig(index, 'lowFillThreshold', { ...config.lowFillThreshold, max: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Half Fill Range (%)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.halfFillThreshold?.min || ''}
                          onChange={(e) => updateTankConfig(index, 'halfFillThreshold', { ...config.halfFillThreshold, min: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.halfFillThreshold?.max || ''}
                          onChange={(e) => updateTankConfig(index, 'halfFillThreshold', { ...config.halfFillThreshold, max: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">High Fill Range (%)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.highFillThreshold?.min || ''}
                          onChange={(e) => updateTankConfig(index, 'highFillThreshold', { ...config.highFillThreshold, min: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.highFillThreshold?.max || ''}
                          onChange={(e) => updateTankConfig(index, 'highFillThreshold', { ...config.highFillThreshold, max: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Overflow Range (%)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.overflowThreshold?.min || ''}
                          onChange={(e) => updateTankConfig(index, 'overflowThreshold', { ...config.overflowThreshold, min: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.overflowThreshold?.max || ''}
                          onChange={(e) => updateTankConfig(index, 'overflowThreshold', { ...config.overflowThreshold, max: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onComplete}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Tank Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}