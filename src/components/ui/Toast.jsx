import React, { useState, createContext, useContext } from 'react';

const ToastContext = createContext();

export { ToastContext };

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = {
    success: (message) => console.log('Success:', message),
    error: (message) => console.log('Error:', message),
    warning: (message) => console.log('Warning:', message),
    info: (message) => console.log('Info:', message)
  };

  const removeToast = () => {};

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useCalculationErrorToast = () => {
  const showCalculationError = (error) => {
    console.log('Calculation Error:', error?.message || 'Unknown error');
  };
  
  const showValidationError = (field, message) => {
    console.log('Validation Error:', field, message);
  };
  
  const showSuccess = (message) => {
    console.log('Success:', message);
  };
  
  return {
    showCalculationError,
    showValidationError,
    showSuccess
  };
};

export default ToastProvider;