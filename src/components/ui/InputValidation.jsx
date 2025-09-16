import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import Icon from '../AppIcon';
import { useCalculationErrorToast } from './Toast';

/**
 * Enhanced Input component with validation and error handling
 */
const ValidatedInput = forwardRef(({
  label,
  value,
  onChange,
  type = 'number',
  min,
  max,
  step = 0.1,
  required = false,
  helpText,
  placeholder,
  validationRules = [],
  className = '',
  debounceMs = 300, // Debounce delay in milliseconds
  ...props
}, ref) => {
  const [errors, setErrors] = useState([]);
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [localValue, setLocalValue] = useState(value || '');
  const debounceRef = useRef(null);
  const { showValidationError } = useCalculationErrorToast();

  // Validation function
  const validateValue = (val) => {
    const newErrors = [];
    const numValue = parseFloat(val);

    // Required validation
    if (required && (val === '' || val === null || val === undefined)) {
      newErrors.push('Detta fält är obligatoriskt');
    }

    // Type validation for numbers
    if (type === 'number' && val !== '' && isNaN(numValue)) {
      newErrors.push('Måste vara ett giltigt nummer');
    }

    // Range validation
    if (type === 'number' && !isNaN(numValue)) {
      if (min !== undefined && numValue < min) {
        newErrors.push(`Värdet måste vara minst ${min}`);
      }
      if (max !== undefined && numValue > max) {
        newErrors.push(`Värdet får inte överstiga ${max}`);
      }
    }

    // Custom validation rules
    validationRules.forEach(rule => {
      if (typeof rule === 'function') {
        const result = rule(val);
        if (result !== true && typeof result === 'string') {
          newErrors.push(result);
        }
      }
    });

    return newErrors;
  };

  // Validate on value change
  useEffect(() => {
    if (touched) {
      const newErrors = validateValue(value);
      setErrors(newErrors);
      setIsValid(newErrors.length === 0);
    }
  }, [value, touched]);

  // Debounced onChange handler
  const debouncedOnChange = useCallback((newValue) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  }, [onChange, debounceMs]);

  const handleChange = (e) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
    setLocalValue(newValue);
    
    // Immediate validation for better UX
    if (touched) {
      const newErrors = validateValue(newValue);
      setErrors(newErrors);
      setIsValid(newErrors.length === 0);
    }
    
    // Debounced onChange to parent
    debouncedOnChange(newValue);
  };
  
  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);
  
  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleBlur = () => {
    setTouched(true);
    const newErrors = validateValue(value);
    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
    
    // Show toast for validation errors on blur
    if (newErrors.length > 0) {
      showValidationError(label || 'Field', newErrors[0]);
    }
  };

  const inputClasses = `
    w-full px-3 py-2 border rounded-md bg-background text-foreground 
    focus:outline-none focus:ring-2 transition-colors
    ${isValid && touched ? 'border-green-300 focus:ring-green-500' : ''}
    ${!isValid && touched ? 'border-red-300 focus:ring-red-500' : 'border-border focus:ring-primary'}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type={type}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className={inputClasses}
          {...props}
        />
        
        {/* Validation icon */}
        {touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <Icon name="CheckCircle" size={16} className="text-green-500" />
            ) : (
              <Icon name="AlertCircle" size={16} className="text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Help text */}
      {helpText && !errors.length && (
        <p className="text-xs text-muted-foreground flex items-center space-x-1">
          <Icon name="Info" size={12} />
          <span>{helpText}</span>
        </p>
      )}

      {/* Error messages */}
      {errors.length > 0 && touched && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-red-600 flex items-center space-x-1">
              <Icon name="AlertTriangle" size={12} />
              <span>{error}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
});

/**
 * Form validation hook
 */
export const useFormValidation = (initialValues, validationSchema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (name, value) => {
    const fieldSchema = validationSchema[name];
    if (!fieldSchema) return [];

    const fieldErrors = [];
    
    // Required validation
    if (fieldSchema.required && (value === '' || value === null || value === undefined)) {
      fieldErrors.push(fieldSchema.requiredMessage || 'Detta fält är obligatoriskt');
    }

    // Type validation
    if (fieldSchema.type === 'number' && value !== '' && isNaN(parseFloat(value))) {
      fieldErrors.push('Måste vara ett giltigt nummer');
    }

    // Range validation
    if (fieldSchema.type === 'number' && !isNaN(parseFloat(value))) {
      const numValue = parseFloat(value);
      if (fieldSchema.min !== undefined && numValue < fieldSchema.min) {
        fieldErrors.push(`Värdet måste vara minst ${fieldSchema.min}`);
      }
      if (fieldSchema.max !== undefined && numValue > fieldSchema.max) {
        fieldErrors.push(`Värdet får inte överstiga ${fieldSchema.max}`);
      }
    }

    // Custom validation
    if (fieldSchema.validate && typeof fieldSchema.validate === 'function') {
      const result = fieldSchema.validate(value, values);
      if (result !== true && typeof result === 'string') {
        fieldErrors.push(result);
      }
    }

    return fieldErrors;
  };

  const validateForm = () => {
    const newErrors = {};
    let formIsValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, values[fieldName]);
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  };

  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate field if it has been touched
    if (touched[name]) {
      const fieldErrors = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors.length > 0 ? fieldErrors : undefined
      }));
    }
  };

  const setFieldTouched = (name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
    
    if (isTouched) {
      const fieldErrors = validateField(name, values[name]);
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors.length > 0 ? fieldErrors : undefined
      }));
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValid(false);
  };

  // Validate form whenever values change
  useEffect(() => {
    const hasAnyTouched = Object.values(touched).some(Boolean);
    if (hasAnyTouched) {
      validateForm();
    }
  }, [values, touched]);

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setFieldTouched,
    validateForm,
    resetForm
  };
};

/**
 * Error boundary for calculation errors
 */
export class CalculationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Calculation Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="AlertTriangle" size={20} className="text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Beräkningsfel</h3>
          </div>
          
          <p className="text-red-700 mb-4">
            Ett fel uppstod under beräkningen. Kontrollera dina inmatade värden och försök igen.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-sm text-red-600">
              <summary className="cursor-pointer font-medium mb-2">Teknisk information</summary>
              <pre className="whitespace-pre-wrap bg-red-100 p-2 rounded text-xs overflow-auto">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Försök igen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Validation schemas for different calculation methods
 */
export const validationSchemas = {
  monteCarlo: {
    simulations: {
      required: true,
      type: 'number',
      min: 1000,
      max: 1000000,
      validate: (value) => {
        if (value < 10000) {
          return 'Rekommenderat: minst 10,000 simuleringar för bättre noggrannhet';
        }
        return true;
      }
    },
    homeGoalsAvg: {
      required: true,
      type: 'number',
      min: 0,
      max: 10,
      validate: (value) => {
        if (value > 5) {
          return 'Ovanligt högt värde - kontrollera att det är korrekt';
        }
        return true;
      }
    },
    awayGoalsAvg: {
      required: true,
      type: 'number',
      min: 0,
      max: 10,
      validate: (value) => {
        if (value > 5) {
          return 'Ovanligt högt värde - kontrollera att det är korrekt';
        }
        return true;
      }
    },
    homeDefenseStrength: {
      required: true,
      type: 'number',
      min: 0.1,
      max: 3.0,
      validate: (value) => {
        if (value < 0.5 || value > 2.0) {
          return 'Typiska värden ligger mellan 0.5 och 2.0';
        }
        return true;
      }
    },
    awayDefenseStrength: {
      required: true,
      type: 'number',
      min: 0.1,
      max: 3.0,
      validate: (value) => {
        if (value < 0.5 || value > 2.0) {
          return 'Typiska värden ligger mellan 0.5 och 2.0';
        }
        return true;
      }
    },
    homeAdvantage: {
      required: true,
      type: 'number',
      min: 0,
      max: 1.0,
      validate: (value) => {
        if (value > 0.5) {
          return 'Hemmafördel över 0.5 är ovanligt hög';
        }
        return true;
      }
    }
  },
  
  poisson: {
    homeAttackRate: {
      required: true,
      type: 'number',
      min: 0,
      max: 10
    },
    awayAttackRate: {
      required: true,
      type: 'number',
      min: 0,
      max: 10
    },
    homeDefenseRate: {
      required: true,
      type: 'number',
      min: 0.1,
      max: 5.0
    },
    awayDefenseRate: {
      required: true,
      type: 'number',
      min: 0.1,
      max: 5.0
    },
    leagueAverage: {
      required: true,
      type: 'number',
      min: 1.0,
      max: 5.0,
      validate: (value) => {
        if (value < 2.0 || value > 4.0) {
          return 'Typiska ligagenomsitt ligger mellan 2.0 och 4.0 mål per match';
        }
        return true;
      }
    },
    adjustmentFactor: {
      required: true,
      type: 'number',
      min: 0.5,
      max: 2.0
    }
  },

  xg: {
    homeXG: {
      required: true,
      type: 'number',
      min: 0,
      max: 10
    },
    awayXG: {
      required: true,
      type: 'number',
      min: 0,
      max: 10
    },
    homeDefensiveRating: {
      required: true,
      type: 'number',
      min: 0.1,
      max: 3.0
    },
    awayDefensiveRating: {
      required: true,
      type: 'number',
      min: 0.1,
      max: 3.0
    },
    homeFormFactor: {
      required: true,
      type: 'number',
      min: 0.5,
      max: 2.0
    },

    weatherConditions: {
      required: true,
      type: 'number',
      min: 0.7,
      max: 1.3
    },
    motivationFactor: {
      required: true,
      type: 'number',
      min: 0.7,
      max: 1.5
    },
    headToHeadFactor: {
      required: true,
      type: 'number',
      min: 0.7,
      max: 1.3
    }
  }
};

export default ValidatedInput;