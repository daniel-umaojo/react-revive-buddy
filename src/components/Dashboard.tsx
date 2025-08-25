import React from 'react';
import { useData } from '../context/DataContext';
import { Activity, Beaker, Thermometer, Gauge as GaugeIcon } from 'lucide-react';

export function Dashboard() {
  const { tankData } = useData();

  const latestData = tankData.slice(-5).reverse();
  const totalVolume = tankData.reduce((sum, data) => sum + data.volume, 0);
  const avgTemperature = tankData.length > 0 
    ? tankData.reduce((sum, data) => sum + data.temperature, 0) / tankData.length 
    : 0;
  const avgPressure = tankData.length > 0 
    ? tankData.reduce((sum, data) => sum + data.pressure, 0) / tankData.length 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your tank monitoring system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <GaugeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">{totalVolume.toFixed(2)} m³</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Temperature</p>
              <p className="text-2xl font-bold text-gray-900">{avgTemperature.toFixed(1)}°C</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Pressure</p>
              <p className="text-2xl font-bold text-gray-900">{avgPressure.toFixed(0)} Pa</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Beaker className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Data Points</p>
              <p className="text-2xl font-bold text-gray-900">{tankData.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {latestData.length > 0 ? (
            <div className="space-y-4">
              {latestData.map((data) => (
                <div key={data.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{data.vesselName} - {data.tankName}</p>
                    <p className="text-sm text-gray-600">
                      {data.detectedFluid} • {data.volume.toFixed(2)} m³ • {data.fillPercentage.toFixed(1)}% • {data.fillStatus}
                    </p>
                    {data.operatorName && (
                      <p className="text-xs text-gray-500">Operator: {data.operatorName}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{data.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GaugeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No data recorded yet</p>
              <p className="text-sm text-gray-500 mt-1">Start by adding some tank measurements</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}