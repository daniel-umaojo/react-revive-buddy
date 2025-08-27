import { Gauge } from 'lucide-react';



const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl'
};

export function Logo({ 
  size = 'md', 
  showText = true, 
  className = '', 
  variant = 'default' 
}) {
  const iconSize = sizeClasses[size];
  const textSize = textSizeClasses[size];
  
  // Color variants
  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          icon: 'text-white',
          text: 'text-white',
          gradient: 'from-white to-gray-200'
        };
      case 'dark':
        return {
          icon: 'text-gray-800',
          text: 'text-gray-800',
          gradient: 'from-gray-800 to-gray-600'
        };
      default:
        return {
          icon: 'text-blue-600',
          text: 'text-gray-900',
          gradient: 'from-blue-600 to-purple-600'
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Custom logo image - falls back to Gauge icon if image not available */}
      <div className="relative">
        {/* Try to load custom logo first */}
        <img 
          src="/glence-logo.svg" 
          alt="GlenceGauge Logo"
          className={`${iconSize} object-contain`}
          onError={(e) => {
            // Hide image and show icon fallback if logo doesn't exist
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling ;
            if (fallback) fallback.style.display = 'block';
          }}
        />
        {/* Fallback icon - hidden by default, shown if image fails */}
        <Gauge 
          className={`${iconSize} ${colors.icon} hidden`} 
          style={{ display: 'none' }}
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSize} ${colors.text} leading-tight`}>
            Glence
            <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
              Gauge
            </span>
          </span>
          {size === 'lg' || size === 'xl' ? (
            <span className={`text-xs ${variant === 'white' ? 'text-gray-200' : 'text-gray-500'} -mt-1`}>
              Tank Monitoring
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Alternative simple logo for very small spaces
export function LogoIcon({ size = 'md', className = '', variant = 'default' }) {
  const iconSize = sizeClasses[size];
  const colors = variant === 'white' ? 'text-white' : variant === 'dark' ? 'text-gray-800' : 'text-blue-600';
  
  return (
    <div className={className}>
      <img 
        src="/glence-logo.svg" 
        alt="GlenceGauge"
        className={`${iconSize} object-contain`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling ;
          if (fallback) fallback.style.display = 'block';
        }}
      />
      <Gauge 
        className={`${iconSize} ${colors} hidden`}
        style={{ display: 'none' }}
      />
    </div>
  );
}
