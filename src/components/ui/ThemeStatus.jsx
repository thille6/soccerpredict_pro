import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeStatus = () => {
  const { theme, colorScheme, isDynamic, currentTheme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-3 text-xs shadow-lg z-50">
      <div className="space-y-1">
        <div className="font-semibold text-foreground">Tema Status:</div>
        <div className="text-muted-foreground">
          <div>Mode: <span className="font-medium text-foreground">{currentTheme}</span></div>
          <div>Färg: <span className="font-medium text-foreground">{colorScheme}</span></div>
          <div>Dynamisk: <span className="font-medium text-foreground">{isDynamic ? 'På' : 'Av'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default ThemeStatus;