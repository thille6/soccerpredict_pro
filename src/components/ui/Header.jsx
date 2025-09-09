import React from 'react';
import Icon from '../AppIcon';
import ThemeToggle from './ThemeToggle';

const Header = ({ savedCalculationsCount = 0, onShowSave, onShowLoad, canSave = false }) => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={20} color="white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-none">
                SoccerPredict
              </span>
              <span className="text-xs font-medium text-secondary leading-none">
                Pro
              </span>
            </div>
          </div>

          {/* Center - Page Title and Save/Load Buttons */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-foreground hidden sm:block">
              Matchkalkylator
            </h1>
            
            {/* Save/Load Buttons */}
            <div className="flex items-center space-x-2">
              {savedCalculationsCount > 0 && (
                <button
                  onClick={onShowLoad}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-400 rounded-md hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Icon name="Upload" size={16} />
                  <span className="hidden sm:inline">Ladda Sparad</span>
                  <span className="bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {savedCalculationsCount}
                  </span>
                </button>
              )}
              
              {canSave && (
                <button
                  onClick={onShowSave}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 border border-red-400 rounded-md hover:from-red-600 hover:to-red-700 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Icon name="Save" size={16} />
                  <span className="hidden sm:inline">Spara Beräkning</span>
                </button>
              )}
            </div>
          </div>

          {/* Right side - Theme Toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>
      {/* Header Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;