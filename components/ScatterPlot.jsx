

export function ScatterPlot({ data, chartType = 'volume', onDataPointClick }) {
  if (!data.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No data to display
      </div>
    );
  }

  // Filter out invalid values and ensure we have valid data
  const validData = data.filter(d => d.value !== null && d.value !== undefined && !isNaN(d.value));
  
  if (validData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No valid data to display
      </div>
    );
  }

  const maxValue = Math.max(...validData.map(d => d.value));
  const minValue = Math.min(...validData.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  // Add some padding to the value range for better visualization
  const paddedMin = minValue - valueRange * 0.05;
  const paddedMax = maxValue + valueRange * 0.05;
  const paddedRange = paddedMax - paddedMin;

  const width = 800;
  const height = 300;
  const padding = 60;

  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const getX = (index) => {
    const divisor = Math.max(validData.length - 1, 1);
    return padding + (index / divisor) * chartWidth;
  };
  
  const getY = (value) => {
    if (isNaN(value) || value === null || value === undefined) return padding + chartHeight / 2;
    return padding + chartHeight - ((value - paddedMin) / paddedRange) * chartHeight;
  };

  const historicalData = data.filter(d => d.type === 'historical');
  const predictedData = data.filter(d => d.type === 'predicted');

  return (
    <div className="w-full h-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#6b7280" strokeWidth="2" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#6b7280" strokeWidth="2" />

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const value = paddedMin + ratio * paddedRange;
          const y = getY(value);
          return (
            <g key={ratio}>
              <line x1={padding - 5} y1={y} x2={padding + 5} y2={y} stroke="#6b7280" strokeWidth="1" />
              <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
                {value.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((point, index) => {
          if (index % Math.ceil(data.length / 6) === 0 || index === data.length - 1) {
            const x = getX(index);
            return (
              <g key={index}>
                <line x1={x} y1={height - padding - 5} x2={x} y2={height - padding + 5} stroke="#6b7280" strokeWidth="1" />
                <text x={x} y={height - padding + 20} textAnchor="middle" fontSize="10" fill="#6b7280">
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Historical data points */}
        {historicalData.map((point, index) => {
          const originalIndex = data.findIndex(d => d === point);
          return (
            <g key={`historical-${index}`}>
              <circle
                cx={getX(originalIndex)}
                cy={getY(point.value)}
                r="5"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onClick={() => onDataPointClick && onDataPointClick(point)}
                className="hover:r-6 transition-all duration-200"
              />
              {/* Add a subtle shadow for better visibility */}
              <circle
                cx={getX(originalIndex)}
                cy={getY(point.value)}
                r="8"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1"
                opacity="0.3"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          );
        })}

        {/* Predicted data points */}
        {predictedData.map((point, index) => {
          const originalIndex = data.findIndex(d => d === point);
          return (
            <g key={`predicted-${index}`}>
              <circle
                cx={getX(originalIndex)}
                cy={getY(point.value)}
                r="5"
                fill="#f97316"
                stroke="white"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onClick={() => onDataPointClick && onDataPointClick(point)}
                className="hover:r-6 transition-all duration-200"
              />
              {/* Add a subtle shadow for better visibility */}
              <circle
                cx={getX(originalIndex)}
                cy={getY(point.value)}
                r="8"
                fill="none"
                stroke="#f97316"
                strokeWidth="1"
                opacity="0.3"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          );
        })}

        {/* Add trend line (optional) - uncomment if you want a trend line */}
        {/* {historicalData.length > 1 && (
          <g>
            <defs>
              <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            <line 
              x1={getX(0)} 
              y1={getY(historicalData[0].value)} 
              x2={getX(historicalData.length - 1)} 
              y2={getY(historicalData[historicalData.length - 1].value)}
              stroke="url(#trendGradient)"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          </g>
        )} */}

        {/* Legend */}
        <g transform={`translate(${width - 150}, 30)`}>
          <rect x="0" y="0" width="140" height="60" fill="white" stroke="#e5e7eb" rx="4" />
          <circle cx="15" cy="20" r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />
          <text x="25" y="24" fontSize="12" fill="#374151">Historical</text>
          {predictedData.length > 0 && (
            <>
              <circle cx="15" cy="40" r="5" fill="#f97316" stroke="white" strokeWidth="2" />
              <text x="25" y="44" fontSize="12" fill="#374151">Predicted</text>
            </>
          )}
        </g>

        {/* Axis labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="14" fill="#374151" fontWeight="500">
          Date
        </text>
        <text x="20" y={height / 2} textAnchor="middle" fontSize="14" fill="#374151" fontWeight="500" transform={`rotate(-90, 20, ${height / 2})`}>
          {chartType === 'volume' ? 'Volume (m³)' : 
           chartType === 'pressure' ? 'Pressure (kPa)' : 
           chartType === 'temperature' ? 'Temperature (°C)' : 'Density (kg/m³)'}
        </text>
      </svg>
    </div>
  );
}