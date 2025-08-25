import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { BarChart3, Download, FileText, Calendar, Trash2, TrendingUp } from 'lucide-react';
import { ScatterPlot } from './ScatterPlot';

export function ChartsPage() {
  const { tankData, getTankSettingsForUser } = useData();
  const { currentUser } = useAuth();
  const [selectedVessel, setSelectedVessel] = useState('');
  const [selectedTank, setSelectedTank] = useState('');
  const [chartType, setChartType] = useState<'volume' | 'pressure' | 'density' | 'temperature'>('volume');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);
  const [showAllData, setShowAllData] = useState(false);

  // Get user's tank settings to filter data
  const userTankSettings = getTankSettingsForUser(currentUser || '');
  
  // Filter tank data to only show user's tanks
  const userTankData = tankData.filter(data => {
    return userTankSettings.some(tank => 
      tank.vesselName === data.vesselName && tank.tankName === data.tankName
    );
  });

  const uniqueVessels = useMemo(() => {
    const vessels = new Set(userTankData.map(data => data.vessel));
    return Array.from(vessels);
  }, [userTankData]);

  const uniqueTanks = useMemo(() => {
    if (!selectedVessel) return [];
    const tanks = new Set(
      userTankData
        .filter(data => data.vessel === selectedVessel)
        .map(data => data.tank)
    );
    return Array.from(tanks);
  }, [userTankData, selectedVessel]);

  const chartData = useMemo(() => {
    if (!selectedVessel || !selectedTank) return [];
    
    let filtered = userTankData
      .filter(data => data.vessel === selectedVessel && data.tank === selectedTank)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Apply date range filter
    if (startDate) {
      filtered = filtered.filter(data => data.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(data => data.date <= endDate);
    }

    return filtered
      .map(data => ({
        date: data.date,
        time: data.time || '00:00:00',
        volume: data.volume,
        temperature: data.temperature,
        pressure: data.pressure / 1000, // Convert to kPa for better display
        density: data.density,
        operatorName: data.operatorName || 'Unknown',
        id: data.id
      }));
  }, [userTankData, selectedVessel, selectedTank, startDate, endDate]);

  const allTankData = useMemo(() => {
    let filtered = userTankData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Apply date range filter
    if (startDate) {
      filtered = filtered.filter(data => data.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(data => data.date <= endDate);
    }

    return filtered.map(data => ({
      date: data.date,
      time: data.time || '00:00:00',
      volume: data.volume,
      temperature: data.temperature,
      pressure: data.pressure / 1000,
      density: data.density,
      operatorName: data.operatorName || 'Unknown',
      vessel: data.vessel,
      tank: data.tank,
      id: data.id
    }));
  }, [userTankData, startDate, endDate]);

  const exportToCSV = () => {
    const dataToExport = showAllData ? allTankData : chartData;
    if (!dataToExport.length) return;

    const headers = showAllData 
      ? ['Date', 'Time', 'Vessel', 'Tank', 'Volume (m³)', 'Temperature (°C)', 'Pressure (kPa)', 'Density (kg/m³)', 'Operator']
      : ['Date', 'Time', 'Volume (m³)', 'Temperature (°C)', 'Pressure (kPa)', 'Density (kg/m³)', 'Operator'];
    
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        showAllData 
          ? [row.date, row.time, row.vessel, row.tank, row.volume, row.temperature, row.pressure, row.density, row.operatorName].join(',')
          : [row.date, row.time, row.volume, row.temperature, row.pressure, row.density, row.operatorName].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = showAllData ? 'all_tank_data.csv' : `${selectedVessel}_${selectedTank}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const dataToExport = showAllData ? allTankData : chartData;
    const content = dataToExport.map(row => 
      showAllData 
        ? `Date: ${row.date} ${row.time} | Vessel: ${row.vessel} | Tank: ${row.tank} | Volume: ${row.volume.toFixed(3)} m³ | Temp: ${row.temperature}°C | Pressure: ${row.pressure.toFixed(1)} kPa | Density: ${row.density.toFixed(2)} kg/m³ | Operator: ${row.operatorName}`
        : `Date: ${row.date} ${row.time} | Volume: ${row.volume.toFixed(3)} m³ | Temp: ${row.temperature}°C | Pressure: ${row.pressure.toFixed(1)} kPa | Density: ${row.density.toFixed(2)} kg/m³ | Operator: ${row.operatorName}`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(url);
    const a = document.createElement('a');
    a.href = url;
    a.download = showAllData ? 'all_tank_report.txt' : `${selectedVessel}_${selectedTank}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSelectedData = () => {
    if (!selectedDataPoint) return;
    
    if (window.confirm(`Are you sure you want to delete this data point from ${selectedDataPoint.date} ${selectedDataPoint.time}?`)) {
      const storedData = localStorage.getItem('glence_tank_data');
      if (storedData) {
        const data = JSON.parse(storedData);
        const updatedData = data.filter((item: any) => item.id !== selectedDataPoint.id);
        localStorage.setItem('glence_tank_data', JSON.stringify(updatedData));
        alert('Data point deleted successfully.');
        window.location.reload();
      }
    }
  };

  const handleResetAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL your tank data? This action cannot be undone.')) {
      const storedData = localStorage.getItem('glence_tank_data');
      if (storedData) {
        const data = JSON.parse(storedData);
        // Only remove data for current user's tanks
        const updatedData = data.filter((item: any) => {
          return !userTankSettings.some(tank => 
            tank.vesselName === item.vesselName && tank.tankName === item.tankName
          );
        });
        localStorage.setItem('glence_tank_data', JSON.stringify(updatedData));
        alert('Your tank data has been reset.');
      }
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Volume Scatter Plots & Export</h1>
        <p className="text-gray-600">Visualize tank data distributions and export reports</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Data Visualization</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAllData(!showAllData)}
                className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
                  showAllData 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'text-blue-600 border-blue-300 hover:bg-blue-50'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{showAllData ? 'Show Selected' : 'Show All Data'}</span>
              </button>
              {((showAllData && allTankData.length > 0) || (!showAllData && chartData.length > 0)) && (
                <>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center space-x-2 px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center space-x-2 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export Report</span>
                  </button>
                </>
              )}
              <button
                onClick={handleResetAllData}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset All Data</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Vessel
              </label>
              <select
                value={selectedVessel}
                onChange={(e) => {
                  setSelectedVessel(e.target.value);
                  setSelectedTank('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a vessel</option>
                {uniqueVessels.map((vessel) => (
                  <option key={vessel} value={vessel}>
                    {vessel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Tank
              </label>
              <select
                value={selectedTank}
                onChange={(e) => setSelectedTank(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedVessel}
              >
                <option value="">Select a tank</option>
                {uniqueTanks.map((tank) => (
                  <option key={tank} value={tank}>
                    {tank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'volume' | 'pressure' | 'density' | 'temperature')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="volume">Volume Distribution</option>
                <option value="pressure">Pressure Distribution</option>
                <option value="density">Density Distribution</option>
                <option value="temperature">Temperature Distribution</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {!showAllData && (!selectedVessel || !selectedTank) ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a vessel and tank to view scatter plots</p>
            </div>
          ) : (!showAllData && chartData.length === 0) || (showAllData && allTankData.length === 0) ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No data available for this selection</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="h-80">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  {showAllData 
                    ? `${chartType} Distribution for All Tanks` 
                    : `${chartType} Distribution for ${selectedTank} in ${selectedVessel}`
                  }
                  {(startDate || endDate) && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({startDate || 'Start'} to {endDate || 'End'})
                    </span>
                  )}
                </h3>
                <ScatterPlot 
                  data={(showAllData ? allTankData : chartData).map(d => ({ 
                    date: d.date, 
                    time: d.time,
                    value: chartType === 'volume' ? d.volume : 
                          chartType === 'pressure' ? d.pressure : 
                          chartType === 'temperature' ? d.temperature : d.density,
                    volume: d.volume,
                    temperature: d.temperature,
                    pressure: d.pressure,
                    density: d.density,
                    type: 'historical' as const,
                    operatorName: d.operatorName,
                    vessel: d.vessel,
                    tank: d.tank,
                    id: d.id
                  }))}
                  onDataPointClick={setSelectedDataPoint}
                  chartType={chartType}
                />
              </div>

              {selectedDataPoint && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Data Point Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                    <div><span className="text-gray-600">Date:</span> <span className="font-medium">{selectedDataPoint.date}</span></div>
                    <div><span className="text-gray-600">Time:</span> <span className="font-medium">{selectedDataPoint.time}</span></div>
                    <div><span className="text-gray-600">Value:</span> <span className="font-medium">{selectedDataPoint.value?.toFixed(3)}</span></div>
                    <div><span className="text-gray-600">Operator:</span> <span className="font-medium">{selectedDataPoint.operatorName}</span></div>
                    {showAllData && (
                      <>
                        <div><span className="text-gray-600">Vessel:</span> <span className="font-medium">{selectedDataPoint.vessel}</span></div>
                        <div><span className="text-gray-600">Tank:</span> <span className="font-medium">{selectedDataPoint.tank}</span></div>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDeleteSelectedData}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={() => setSelectedDataPoint(null)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Temperature Trend</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {(showAllData ? allTankData : chartData)[(showAllData ? allTankData : chartData).length - 1]?.temperature || 0}°C
                  </div>
                  <p className="text-sm text-gray-500">Latest reading</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Pressure Trend</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {(() => {
                      const data = showAllData ? allTankData : chartData;
                      const latest = data[data.length - 1];
                      return latest?.pressure?.toFixed(1) || '0.0';
                    })()} kPa
                  </div>
                  <p className="text-sm text-gray-500">Latest reading</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Density Trend</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const data = showAllData ? allTankData : chartData;
                      const latest = data[data.length - 1];
                      return latest?.density?.toFixed(2) || '0.00';
                    })()} kg/m³
                  </div>
                  <p className="text-sm text-gray-500">Latest reading</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Data Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Records:</span>
                    <span className="ml-2 font-medium">{(showAllData ? allTankData : chartData).length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Volume:</span>
                    <span className="ml-2 font-medium">
                      {(() => {
                        const data = showAllData ? allTankData : chartData;
                        if (data.length === 0) return '0.00';
                        const validData = data.filter(d => d.volume && !isNaN(d.volume));
                        if (validData.length === 0) return '0.00';
                        return (validData.reduce((sum, d) => sum + d.volume, 0) / validData.length).toFixed(2);
                      })()} m³
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Volume:</span>
                    <span className="ml-2 font-medium">
                      {(() => {
                        const data = showAllData ? allTankData : chartData;
                        const validData = data.filter(d => d.volume && !isNaN(d.volume));
                        if (validData.length === 0) return '0.00';
                        return Math.max(...validData.map(d => d.volume)).toFixed(2);
                      })()} m³
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Min Volume:</span>
                    <span className="ml-2 font-medium">
                      {(() => {
                        const data = showAllData ? allTankData : chartData;
                        const validData = data.filter(d => d.volume && !isNaN(d.volume));
                        if (validData.length === 0) return '0.00';
                        return Math.min(...validData.map(d => d.volume)).toFixed(2);
                      })()} m³
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setShowAllData(!showAllData)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      showAllData 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>{showAllData ? 'Show Individual Tank' : 'Show All Tanks Combined'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}