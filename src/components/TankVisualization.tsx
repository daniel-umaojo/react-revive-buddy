import React from 'react';
import { X } from 'lucide-react';
import { TankSettings } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

interface TankVisualizationProps {
  tankConfig: TankSettings;
  currentVolume: number;
  fillPercentage: number;
  fillStatus: string;
  onClose: () => void;
}

export function TankVisualization({ 
  tankConfig, 
  currentVolume, 
  fillPercentage, 
  fillStatus, 
  onClose 
}: TankVisualizationProps) {
  const { currentTheme } = useTheme();

  const getFillColor = (status: string) => {
    switch (status) {
      case 'Overflowing': return '#ef4444';
      case 'Overfull': return '#f97316';
      case 'Half Filled': return '#10b981';
      case 'Low': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderTank = () => {
    const fillHeight = Math.min(fillPercentage, 100);
    const fillColor = getFillColor(fillStatus);

    if (tankConfig.shape === 'Cylindrical') {
      return (
        <div className="relative">
          {/* Tank outline */}
          <div 
            className="border-4 rounded-b-full mx-auto relative overflow-hidden"
            style={{ 
              width: '200px', 
              height: '300px',
              borderColor: currentTheme.colors.border,
              backgroundColor: currentTheme.colors.background
            }}
          >
            {/* Fluid fill */}
            <div
              className="absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-1000 ease-in-out"
              style={{
                height: `${fillHeight}%`,
                backgroundColor: fillColor,
                opacity: 0.8
              }}
            />
            {/* Fill level indicator */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed"
              style={{
                bottom: `${fillHeight}%`,
                borderColor: fillColor
              }}
            />
          </div>
          {/* Tank cap */}
          <div 
            className="border-4 border-b-0 rounded-t-full mx-auto"
            style={{ 
              width: '200px', 
              height: '20px',
              borderColor: currentTheme.colors.border,
              backgroundColor: currentTheme.colors.surface
            }}
          />
        </div>
      );
    } else if (tankConfig.shape === 'Rectangular') {
      return (
        <div className="relative">
          {/* Tank outline */}
          <div 
            className="border-4 mx-auto relative overflow-hidden"
            style={{ 
              width: '200px', 
              height: '300px',
              borderColor: currentTheme.colors.border,
              backgroundColor: currentTheme.colors.background
            }}
          >
            {/* Fluid fill */}
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out"
              style={{
                height: `${fillHeight}%`,
                backgroundColor: fillColor,
                opacity: 0.8
              }}
            />
            {/* Fill level indicator */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed"
              style={{
                bottom: `${fillHeight}%`,
                borderColor: fillColor
              }}
            />
          </div>
        </div>
      );
    } else { // Spherical
      return (
        <div className="relative">
          {/* Tank outline */}
          <div 
            className="border-4 rounded-full mx-auto relative overflow-hidden"
            style={{ 
              width: '250px', 
              height: '250px',
              borderColor: currentTheme.colors.border,
              backgroundColor: currentTheme.colors.background
            }}
          >
            {/* Fluid fill */}
            <div
              className="absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-1000 ease-in-out"
              style={{
                height: `${fillHeight}%`,
                backgroundColor: fillColor,
                opacity: 0.8
              }}
            />
            {/* Fill level indicator */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed"
              style={{
                bottom: `${fillHeight}%`,
                borderColor: fillColor
              }}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="rounded-xl shadow-2xl max-w-md w-full p-6"
        style={{ 
          backgroundColor: currentTheme.colors.surface,
          color: currentTheme.colors.text
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold" style={{ color: currentTheme.colors.primary }}>
            Tank Visualization
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <h4 className="text-lg font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
            {tankConfig.tankName} - {tankConfig.vesselName}
          </h4>
          <p className="text-lg font-bold" style={{ color: getFillColor(fillStatus) }}>
            {tankConfig.shape} Tank
          </p>
        </div>

        <div className="flex justify-center mb-6">
          {renderTank()}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
            <p style={{ color: currentTheme.colors.textSecondary }}>Current Volume</p>
            <p className="text-lg font-bold" style={{ color: currentTheme.colors.primary }}>
              {currentVolume.toFixed(3)} m³
            </p>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
            <p style={{ color: currentTheme.colors.textSecondary }}>Fill Level</p>
            <p className="text-lg font-bold" style={{ color: getFillColor(fillStatus) }}>
              {fillPercentage.toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
            <p style={{ color: currentTheme.colors.textSecondary }}>Tank Area</p>
            <p className="text-lg font-bold" style={{ color: currentTheme.colors.text }}>
              {tankConfig.area.toFixed(2)} m²
            </p>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
            <p style={{ color: currentTheme.colors.textSecondary }}>Status</p>
            <p className="text-lg font-bold" style={{ color: getFillColor(fillStatus) }}>
              {fillStatus}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: currentTheme.colors.primary }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}