import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDynamic, setIsDynamic] = useState(() => {
    const savedDynamic = localStorage.getItem('soccerpredict-dynamic-mode');
    return savedDynamic === 'true';
  });

  // Apply theme to document (light mode with Mario colors only)
  const applyTheme = (dynamic) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Always apply light mode with Mario theme
    root.classList.add('light', 'mario-theme');
    
    // Apply dynamic mode
    if (dynamic) {
      root.classList.add('dynamic-mode');
      body.classList.add('dynamic-mode');
      body.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
      root.classList.remove('dynamic-mode');
      body.classList.remove('dynamic-mode');
    }
  };

  // Toggle dynamic mode
  const toggleDynamic = () => {
    const newDynamic = !isDynamic;
    setIsDynamic(newDynamic);
    localStorage.setItem('soccerpredict-dynamic-mode', newDynamic.toString());
    applyTheme(newDynamic);
  };

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(isDynamic);
  }, [isDynamic]);

  const value = {
    isDynamic,
    toggleDynamic
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};