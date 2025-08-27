// Fluid density ranges in kg/m³ - Centralized constants
const FLUID_DENSITY_RANGES = [
  { name: 'Gasoline', min: 720, max: 780, color: '#ff6b6b' },
  { name: 'Ethanol', min: 780, max: 800, color: '#4ecdc4' },
  { name: 'Diesel Fuel', min: 800, max: 840, color: '#45b7d1' },
  { name: 'Crude Oil', min: 840, max: 880, color: '#96ceb4' },
  { name: 'Biodiesel', min: 880, max: 900, color: '#ffeaa7' },
  { name: 'Lubricating Oil', min: 900, max: 940, color: '#dda0dd' },
  { name: 'Fuel Oil (Light)', min: 940, max: 960, color: '#98d8c8' },
  { name: 'Water', min: 990, max: 1010, color: '#74b9ff' },
  { name: 'Propylene Glycol', min: 1010, max: 1040, color: '#a29bfe' },
  { name: 'Acetic Acid', min: 1040, max: 1060, color: '#fd79a8' },
  { name: 'Glycerin', min: 1250, max: 1270, color: '#fdcb6e' },
  { name: 'Caustic Soda (50% solution)', min: 1500, max: 1530, color: '#e17055' },
  { name: 'Sulfuric Acid (concentrated)', min: 1800, max: 1840, color: '#d63031' }
];

// Convert FLUID_DENSITY_RANGES to FluidDatabase format
const getDefaultFluidDatabase = () => {
  const database = {};
  FLUID_DENSITY_RANGES.forEach(fluid => {
    database[fluid.name] = {
      min: fluid.min,
      max: fluid.max
    };
  });
  return database;
};

// Get color for a fluid name
const getFluidColor = (fluidName) => {
  const fluid = FLUID_DENSITY_RANGES.find(f => f.name === fluidName);
  return fluid?.color || '#6b7280';
};

// Enhanced fluid detection that returns both name and color
const detectFluidFromDatabase = (density, fluidDatabase) => {
  if (!density || density <= 0) return { name: 'Unknown', color: '#6b7280' };
  
  // Find fluid type based on density range from database
  for (const [fluidName, range] of Object.entries(fluidDatabase)) {
    if (density >= range.min && density <= range.max) {
      return { name: fluidName, color: getFluidColor(fluidName) };
    }
  }
  
  // If no exact match, find closest range
  let closestFluid = null;
  let minDistance = Infinity;
  
  for (const [fluidName, range] of Object.entries(fluidDatabase)) {
    let distance;
    if (density < range.min) {
      distance = range.min - density;
    } else if (density > range.max) {
      distance = density - range.max;
    } else {
      continue; // This shouldn't happen since we already checked exact matches
    }
    
    if (distance < minDistance) {
      minDistance = distance;
      closestFluid = { name: fluidName, color: getFluidColor(fluidName) };
    }
  }
  
  return closestFluid 
    ? { name: `${closestFluid.name} (estimated)`, color: closestFluid.color }
    : { name: 'Unknown', color: '#6b7280' };
};

// Export all functions and constants
module.exports = {
  FLUID_DENSITY_RANGES,
  getDefaultFluidDatabase,
  getFluidColor,
  detectFluidFromDatabase
};