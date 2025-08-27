import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { ScatterPlot } from './ScatterPlot';

export function PredictionPage() {
  const { tankData } = useData();
  const [selectedTank, setSelectedTank] = useState('');
  const [daysToPredict, setDaysToPredict] = useState(7);

  const uniqueTanks = useMemo(() => {
    const tanks = new Set(tankData.map(data => data.tank));
    return Array.from(tanks);
  }, [tankData]);

  const filteredData = useMemo(() => {
    if (!selectedTank) return [];
    return tankData
      .filter(data => data.tank === selectedTank)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [tankData, selectedTank]);

  const prediction = useMemo(() => {
    if (filteredData.length < 2) return null;

    // Simple linear regression
    const n = filteredData.length;
    const dates = filteredData.map(d => new Date(d.date).getTime());
    const volumes = filteredData.map(d => d.volume);

    const sumX = dates.reduce((sum, x) => sum + x, 0);
    const sumY = volumes.reduce((sum, y) => sum + y, 0);
    const sumXY = dates.reduce((sum, x, i) => sum + x * volumes[i], 0);
    const sumXX = dates.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysToPredict);
    const futureTimestamp = futureDate.getTime();
    const predictedVolume = slope * futureTimestamp + intercept;

    return {
      date: futureDate.toISOString().split('T')[0], // Format as YYYY-MM-DD for consistency
      volume: Math.max(0, predictedVolume),
      slope,
      r2: calculateR2(dates, volumes, slope, intercept)
    };
  }, [filteredData, daysToPredict]);

  function calculateR2(x, y, slopeintercept) {
    const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
    const ssTotal = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const ssRes = x.reduce((sum, val, i) => {
      const predicted = slope * val + intercept;
      return sum + Math.pow(y[i] - predicted, 2);
    }, 0);
    return Math.max(0, 1 - (ssRes / ssTotal)); // Ensure R² is not negative
  }

  const chartData = useMemo(() => {
    if (!filteredData.length || !prediction) return [];
    
    const historical = filteredData.map(d => ({
      date: d.date,
      value: d.volume,
      volume: d.volume,
      temperature: d.temperature,
      pressure: d.pressure,
      density: d.density,
      operatorName: d.operatorName,
      vessel: d.vessel,
      tank: d.tank,
      id: d.id,
      type: 'historical' 
    }));

    const predicted = [{
      date: prediction.date,
      value: prediction.volume,
      volume: prediction.volume,
      temperature: undefined,
      pressure: undefined,
      density: undefined,
      operatorName: 'System Prediction',
      vessel: filteredData[0]?.vessel || '',
      tank: selectedTank,
      id: 'prediction',
      type: 'predicted' 
    }];

    return [...historical, ...predicted];
  }, [filteredData, prediction, selectedTank]);

  const getTrendDescription = (slope) => {
    const dailyChange = slope * 24 * 60 * 60 * 1000; // Convert from per-millisecond to per-day
    if (Math.abs(dailyChange) < 0.01) return 'Stable';
    return dailyChange > 0 ? 'Increasing' : 'Decreasing';
  };

  const getAccuracyDescription = (r2) => {
    if (r2 > 0.8) return 'High';
    if (r2 > 0.5) return 'Moderate';
    if (r2 > 0.2) return 'Low';
    return 'Very Low';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Predictive Analytics</h1>
        <p className="text-gray-600">Forecast tank volume trends using historical data patterns</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Volume Prediction Analysis</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Tank
              </label>
              <select
                value={selectedTank}
                onChange={(e) => setSelectedTank(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Days to Predict
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={daysToPredict}
                onChange={(e) => setDaysToPredict(parseInt(e.target.value) || 7)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {!selectedTank && (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a tank to view predictions</p>
            </div>
          )}

          {selectedTank && filteredData.length < 2 && (
            <div className="flex items-center justify-center py-8 text-amber-600">
              <AlertTriangle className="w-8 h-8 mr-3" />
              <div>
                <p className="font-medium">Insufficient Data</p>
                <p className="text-sm">At least 2 data points are required for prediction</p>
              </div>
            </div>
          )}

          {selectedTank && filteredData.length >= 2 && prediction && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-600">Predicted Volume</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {prediction.volume.toFixed(2)} m³
                  </p>
                  <p className="text-xs text-gray-500">
                    on {new Date(prediction.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-600">Trend Direction</p>
                  <p className={`text-2xl font-bold ${prediction.slope > 0 ? 'text-green-600' : prediction.slope < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {prediction.slope > 0 ? '↗' : prediction.slope < 0 ? '↘' : '→'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getTrendDescription(prediction.slope)}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-600">Model Accuracy</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(Math.max(0, prediction.r2) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {getAccuracyDescription(prediction.r2)} confidence
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-600">Data Points</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {filteredData.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    Historical records
                  </p>
                </div>
              </div>

              {prediction.r2 < 0.2 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Low Prediction Confidence</p>
                      <p className="text-xs text-amber-600">
                        The model has low accuracy. Consider collecting more data points or checking for data inconsistencies.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="h-80">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Volume Prediction Scatter Plot for {selectedTank}
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (Blue: Historical Data, Orange: Prediction)
                  </span>
                </h3>
                <ScatterPlot 
                  data={chartData} 
                  chartType="volume"
                  onDataPointClick={(point) => {
                    if (point.type === 'predicted') {
                      alert(`Predicted Volume: ${point.value?.toFixed(3)} m³ on ${new Date(point.date).toLocaleDateString()}`);
                    }
                  }}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Prediction Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Current Trend</h5>
                    <p className="text-gray-600">
                      Based on {filteredData.length} historical data points, the tank shows a{' '}
                      <span className={`font-medium ${prediction.slope > 0 ? 'text-green-600' : prediction.slope < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {getTrendDescription(prediction.slope).toLowerCase()}
                      </span>{' '}
                      volume trend.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Reliability</h5>
                    <p className="text-gray-600">
                      The prediction model has{' '}
                      <span className={`font-medium ${prediction.r2 > 0.8 ? 'text-green-600' : prediction.r2 > 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {getAccuracyDescription(prediction.r2).toLowerCase()}
                      </span>{' '}
                      accuracy with an R² value of {(prediction.r2 * 100).toFixed(1)}%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}