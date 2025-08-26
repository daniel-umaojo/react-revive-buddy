import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData, TankSettings, FluidDatabase } from '../context/DataContext';
import { getFluidColor, getDefaultFluidDatabase } from '../constants/fluidConstants';
import { Settings, Edit2, Plus, Trash2 } from 'lucide-react';

export function SettingsPage() {
  const { currentUser } = useAuth();
  const { getTankSettingsForUser, saveTankSettings, fluidDatabase, updateFluidDatabase } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingFluids, setIsEditingFluids] = useState(false);
  const [tankSettings, setTankSettings] = useState<TankSettings[]>([]);
  const [localFluidDatabase, setLocalFluidDatabase] = useState<FluidDatabase>({});


  // Sync with context when data changes
  useEffect(() => {
    console.log('Current user changed:', currentUser);
    if (currentUser) {
      const userSettings = getTankSettingsForUser(currentUser);
      console.log('Tank settings for user:', userSettings);
      setTankSettings(userSettings);
    }
  }, [currentUser, getTankSettingsForUser]);

  // Improved fluid database initialization logic
  useEffect(() => {
    // Get default fluid database for fallback
    const defaultFluids = getDefaultFluidDatabase();
    console.log('Default fluids available:', Object.keys(defaultFluids).length);
    
    // First check if fluidDatabase from context has data
    if (fluidDatabase && Object.keys(fluidDatabase).length > 0) {
      console.log('Using fluid database from context:', Object.keys(fluidDatabase));
      setLocalFluidDatabase(fluidDatabase);
    } 
    // Otherwise fall back to defaults
    else {
      console.log('Context fluid database empty, using defaults');
      setLocalFluidDatabase(defaultFluids);
      // Also update the context with defaults
      updateFluidDatabase(defaultFluids);
    }
  }, [fluidDatabase, updateFluidDatabase]);

  const addTank = () => {
    const newTank: TankSettings = {
      vesselName: tankSettings.length > 0 ? tankSettings[0].vesselName : '',
      tankName: `Tank${tankSettings.length + 1}`,
      shape: 'Cylindrical',
      maxLevel: 0,
      area: 0,
      height: 0,
      lowFillThreshold: { min: 0, max: 25 },
      halfFillThreshold: { min: 25, max: 75 },
      highFillThreshold: { min: 75, max: 90 },
      overflowThreshold: { min: 90, max: 100 }
    };
    setTankSettings([...tankSettings, newTank]);
  };

  const removeTank = (index: number) => {
    const updated = tankSettings.filter((_, i) => i !== index);
    setTankSettings(updated);
  };

  const updateTankSetting = (index: number, field: keyof TankSettings, value: unknown) => {
    const updated = [...tankSettings];
    updated[index] = { ...updated[index], [field]: value };
    
    // Update vessel name for all tanks if changed
    if (field === 'vesselName') {
      updated.forEach(tank => {
        tank.vesselName = value as string;
      });
    }
    
    // Recalculate area when dimensions change
    if (['radius', 'length', 'breadth', 'height'].includes(field as string)) {
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
    
    setTankSettings(updated);
  };

  const saveSettings = () => {
    if (currentUser) {
      saveTankSettings(currentUser, tankSettings);
      setIsEditing(false);
    }
  };

  const saveFluidSettings = () => {
    updateFluidDatabase(localFluidDatabase);
    setIsEditingFluids(false);
  };

  const cancelEditing = () => {
    setTankSettings(getTankSettingsForUser(currentUser || ''));
    setIsEditing(false);
  };

  const cancelFluidEditing = () => {
    setLocalFluidDatabase(fluidDatabase);
    setIsEditingFluids(false);
  };

  const addFluid = () => {
    const fluidName = prompt('Enter fluid name:');
    const minDensity = prompt('Enter minimum density (kg/m³):');
    const maxDensity = prompt('Enter maximum density (kg/m³):');
    if (fluidName && minDensity && maxDensity && !isNaN(parseFloat(minDensity)) && !isNaN(parseFloat(maxDensity))) {
      setLocalFluidDatabase({
        ...localFluidDatabase,
        [fluidName]: { min: parseFloat(minDensity), max: parseFloat(maxDensity) }
      });
    }
  };

  const removeFluid = (fluidName: string) => {
    const updated = { ...localFluidDatabase };
    delete updated[fluidName];
    setLocalFluidDatabase(updated);
  };

  const updateFluidDensity = (fluidName: string, field: 'min' | 'max', value: number) => {
    setLocalFluidDatabase({
      ...localFluidDatabase,
      [fluidName]: {
        ...localFluidDatabase[fluidName],
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tank Settings</h1>
          <p className="text-gray-600">Configure your tank parameters, specifications, and fluid database</p>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Settings</span>
            </button>
          ) : (
            <>
              <button
                onClick={cancelEditing}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fluid Database Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Fluid Database</h2>
            </div>
            <div className="flex space-x-3">
              {!isEditingFluids ? (
                <button
                  onClick={() => setIsEditingFluids(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Fluids</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={addFluid}
                    className="flex items-center space-x-2 px-3 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Fluid</span>
                  </button>
                  <button
                    onClick={cancelFluidEditing}
                    className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveFluidSettings}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Fluids
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          {(!localFluidDatabase || Object.keys(localFluidDatabase).length === 0) ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No fluid data available</p>
              <p className="text-sm text-gray-500 mt-1">Loading default fluids...</p>
              <button 
                onClick={() => {
                  const defaultFluids = getDefaultFluidDatabase();
                  console.log('Loading default fluids:', Object.keys(defaultFluids));
                  setLocalFluidDatabase(defaultFluids);
                  // Also update the context so it persists
                  updateFluidDatabase(defaultFluids);
                }}
                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Load Default Fluids
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(localFluidDatabase).map(([fluidName, range]) => {
                const fluidColor = getFluidColor(fluidName);
                return (
                  <div key={fluidName} className="p-3 bg-gray-50 rounded-lg border-l-4" style={{
                    borderLeftColor: fluidColor
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: fluidColor }}
                        ></div>
                        <span className="font-medium text-gray-900">{fluidName}</span>
                      </div>
                      {isEditingFluids && (
                        <button
                          onClick={() => removeFluid(fluidName)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  
                  {isEditingFluids ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Min Density</label>
                        <input
                          type="number"
                          step="0.1"
                          value={range.min}
                          onChange={(e) => updateFluidDensity(fluidName, 'min', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Max Density</label>
                        <input
                          type="number"
                          step="0.1"
                          value={range.max}
                          onChange={(e) => updateFluidDensity(fluidName, 'max', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <span>{range.min} - {range.max} kg/m³</span>
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tank Configurations Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Tank Configurations</h2>
            </div>
            {isEditing && (
              <button
                onClick={addTank}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tank</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {tankSettings.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tank settings configured</p>
              <p className="text-sm text-gray-500 mt-1">Click "Edit Settings" to add tank configurations</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tankSettings.map((tank, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tank.tankName} - {tank.vesselName}
                    </h3>
                    {isEditing && (
                      <button
                        onClick={() => removeTank(index)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vessel Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tank.vesselName || ''}
                          onChange={(e) => updateTankSetting(index, 'vesselName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                          {tank.vesselName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tank Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tank.tankName || ''}
                          onChange={(e) => updateTankSetting(index, 'tankName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                          {tank.tankName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tank Shape
                      </label>
                      {isEditing ? (
                        <select
                          value={tank.shape}
                          onChange={(e) => updateTankSetting(index, 'shape', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Cylindrical">Cylindrical</option>
                          <option value="Rectangular">Rectangular</option>
                          <option value="Spherical">Spherical</option>
                        </select>
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                          {tank.shape}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Fuel Level (m)
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={tank.maxLevel || ''}
                          onChange={(e) => updateTankSetting(index, 'maxLevel', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                          {tank.maxLevel} m
                        </p>
                      )}
                    </div>

                    {tank.shape === 'Cylindrical' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Radius (m)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={tank.radius || ''}
                              onChange={(e) => updateTankSetting(index, 'radius', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                              {tank.radius} m
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Height (m)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={tank.height || ''}
                              onChange={(e) => updateTankSetting(index, 'height', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                              {tank.height} m
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {tank.shape === 'Rectangular' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Length (m)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={tank.length || ''}
                              onChange={(e) => updateTankSetting(index, 'length', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                              {tank.length} m
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Breadth (m)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={tank.breadth || ''}
                              onChange={(e) => updateTankSetting(index, 'breadth', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                              {tank.breadth} m
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Height (m)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={tank.height || ''}
                              onChange={(e) => updateTankSetting(index, 'height', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                              {tank.height} m
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {tank.shape === 'Spherical' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Radius (m)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={tank.radius || ''}
                            onChange={(e) => updateTankSetting(index, 'radius', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                            {tank.radius} m
                          </p>
                        )}
                      </div>
                    )}

                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calculated Area (m²)
                      </label>
                      <p className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-medium">
                        {tank.area ? tank.area.toFixed(3) : '0.000'} m²
                      </p>
                    </div>
                  </div>

                  {/* Fill Level Thresholds */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Fill Level Thresholds (%)</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Low Fill Range (%)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {isEditing ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tank.lowFillThreshold?.min || ''}
                                onChange={(e) => updateTankSetting(index, 'lowFillThreshold', { ...tank.lowFillThreshold, min: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Min"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tank.lowFillThreshold?.max || ''}
                                onChange={(e) => updateTankSetting(index, 'lowFillThreshold', { ...tank.lowFillThreshold, max: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Max"
                              />
                            </>
                          ) : (
                            <>
                              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {tank.lowFillThreshold?.min}%
                              </p>
                              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {tank.lowFillThreshold?.max}%
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Half Fill Range (%)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {isEditing ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tank.halfFillThreshold?.min || ''}
                                onChange={(e) => updateTankSetting(index, 'halfFillThreshold', { ...tank.halfFillThreshold, min: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Min"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tank.halfFillThreshold?.max || ''}
                                onChange={(e) => updateTankSetting(index, 'halfFillThreshold', { ...tank.halfFillThreshold, max: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Max"
                              />
                            </>
                          ) : (
                            <>
                              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {tank.halfFillThreshold?.min}%
                              </p>
                              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {tank.halfFillThreshold?.max}%
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">High Fill Range (%)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {isEditing ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tank.highFillThreshold?.min || ''}
                                onChange={(e) => updateTankSetting(index, 'highFillThreshold', { ...tank.highFillThreshold, min: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Min"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tank.highFillThreshold?.max || ''}
                                onChange={(e) => updateTankSetting(index, 'highFillThreshold', { ...tank.highFillThreshold, max: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Max"
                              />
                            </>
                          ) : (
                            <>
                              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {tank.highFillThreshold?.min}%
                              </p>
                              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {tank.highFillThreshold?.max}%
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Overflow Range (%)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {isEditing ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tank.overflowThreshold?.min || ''}
                                onChange={(e) => updateTankSetting(index, 'overflowThreshold', { ...tank.overflowThreshold, min: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Min"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tank.overflowThreshold?.max || ''}
                                onChange={(e) => updateTankSetting(index, 'overflowThreshold', { ...tank.overflowThreshold, max: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Max"
                              />
                            </>
                          ) : (
                            <>
                              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {tank.overflowThreshold?.min}%
                              </p>
                              <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {tank.overflowThreshold?.max}%
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}