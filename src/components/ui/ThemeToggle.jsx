import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../AppIcon';

const ThemeToggle = () => {
  const { 
    isDynamic, 
    toggleDynamic
  } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      {/* Light Mode - Always Active */}
      <div className="p-2 rounded-md flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg ring-2 ring-yellow-400">
        <Icon name="Sun" size={18} />
      </div>

      {/* Dynamic Mode Button */}
      <button
        onClick={toggleDynamic}
        className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center relative ${
          isDynamic
            ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white shadow-xl ring-2 ring-red-400 animate-pulse'
            : 'bg-gray-100 text-gray-600 hover:bg-gradient-to-r hover:from-red-100 hover:via-green-100 hover:to-blue-100 hover:text-red-600'
        }`}
        title={`Dynamic Mode: ${isDynamic ? 'Enabled' : 'Disabled'}`}
      >
        <Icon name="Zap" size={18} />
        {isDynamic && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full animate-ping"></div>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;