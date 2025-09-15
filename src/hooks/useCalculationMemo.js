/**
 * Custom hooks for memoization and performance optimization
 */
import { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Memoized calculation hook that caches expensive calculations
 * @param {Function} calculationFn - The calculation function to memoize
 * @param {Array} dependencies - Dependencies that trigger recalculation
 * @param {number} cacheSize - Maximum number of cached results (default: 10)
 * @returns {Function} Memoized calculation function
 */
export const useCalculationMemo = (calculationFn, dependencies = [], cacheSize = 10) => {
  const cacheRef = useRef(new Map());
  const cacheKeysRef = useRef([]);

  const memoizedCalculation = useCallback((...args) => {
    // Create cache key from arguments
    const cacheKey = JSON.stringify(args);
    
    // Check if result is already cached
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }

    // Calculate new result
    const result = calculationFn(...args);
    
    // Manage cache size
    if (cacheKeysRef.current.length >= cacheSize) {
      const oldestKey = cacheKeysRef.current.shift();
      cacheRef.current.delete(oldestKey);
    }
    
    // Store new result
    cacheRef.current.set(cacheKey, result);
    cacheKeysRef.current.push(cacheKey);
    
    return result;
  }, dependencies);

  // Clear cache when dependencies change
  useEffect(() => {
    cacheRef.current.clear();
    cacheKeysRef.current.length = 0;
  }, dependencies);

  return memoizedCalculation;
};

/**
 * Debounced calculation hook for input validation
 * @param {Function} validationFn - Validation function
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced validation function
 */
export const useDebouncedValidation = (validationFn, delay = 300) => {
  const timeoutRef = useRef(null);

  const debouncedValidation = useCallback((value, callback) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const result = validationFn(value);
      if (callback) callback(result);
    }, delay);
  }, [validationFn, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedValidation;
};

/**
 * Performance monitoring hook
 * @param {string} operationName - Name of the operation to monitor
 * @returns {Object} Performance monitoring functions
 */
export const usePerformanceMonitor = (operationName) => {
  const startTimeRef = useRef(null);
  const metricsRef = useRef({
    totalTime: 0,
    callCount: 0,
    averageTime: 0,
    maxTime: 0,
    minTime: Infinity
  });

  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endTimer = useCallback(() => {
    if (startTimeRef.current === null) return;
    
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    
    const metrics = metricsRef.current;
    metrics.totalTime += duration;
    metrics.callCount += 1;
    metrics.averageTime = metrics.totalTime / metrics.callCount;
    metrics.maxTime = Math.max(metrics.maxTime, duration);
    metrics.minTime = Math.min(metrics.minTime, duration);
    
    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${operationName} took ${duration.toFixed(2)}ms`);
    }
    
    startTimeRef.current = null;
    return duration;
  }, [operationName]);

  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      totalTime: 0,
      callCount: 0,
      averageTime: 0,
      maxTime: 0,
      minTime: Infinity
    };
  }, []);

  return {
    startTimer,
    endTimer,
    getMetrics,
    resetMetrics
  };
};

/**
 * Memoized results hook for calculation results
 * @param {Object} calculationParams - Parameters for calculation
 * @param {Function} calculationFn - Calculation function
 * @returns {Object} Memoized calculation results
 */
export const useMemoizedResults = (calculationParams, calculationFn) => {
  const memoizedResults = useMemo(() => {
    if (!calculationParams || !calculationFn) return null;
    
    try {
      return calculationFn(calculationParams);
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }, [calculationParams, calculationFn]);

  return memoizedResults;
};

/**
 * Optimized state update hook
 * @param {*} initialState - Initial state value
 * @returns {Array} [state, optimizedSetState]
 */
export const useOptimizedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const previousStateRef = useRef(initialState);

  const optimizedSetState = useCallback((newState) => {
    // Only update if state actually changed
    if (typeof newState === 'function') {
      setState(prevState => {
        const nextState = newState(prevState);
        if (JSON.stringify(nextState) !== JSON.stringify(prevState)) {
          previousStateRef.current = nextState;
          return nextState;
        }
        return prevState;
      });
    } else {
      if (JSON.stringify(newState) !== JSON.stringify(previousStateRef.current)) {
        previousStateRef.current = newState;
        setState(newState);
      }
    }
  }, []);

  return [state, optimizedSetState];
};

/**
 * Calculation cache hook with persistence
 * @param {string} cacheKey - Unique key for the cache
 * @param {number} maxAge - Maximum age of cached data in milliseconds
 * @returns {Object} Cache management functions
 */
export const useCalculationCache = (cacheKey, maxAge = 5 * 60 * 1000) => {
  const getCachedResult = useCallback((params) => {
    try {
      const cached = localStorage.getItem(`calc_cache_${cacheKey}`);
      if (!cached) return null;
      
      const { data, timestamp, params: cachedParams } = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`calc_cache_${cacheKey}`);
        return null;
      }
      
      // Check if parameters match
      if (JSON.stringify(params) === JSON.stringify(cachedParams)) {
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }, [cacheKey, maxAge]);

  const setCachedResult = useCallback((params, result) => {
    try {
      const cacheData = {
        data: result,
        timestamp: Date.now(),
        params: params
      };
      localStorage.setItem(`calc_cache_${cacheKey}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }, [cacheKey]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(`calc_cache_${cacheKey}`);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }, [cacheKey]);

  return {
    getCachedResult,
    setCachedResult,
    clearCache
  };
};

/**
 * Batch calculation hook for processing multiple calculations efficiently
 * @param {Function} calculationFn - Single calculation function
 * @param {number} batchSize - Number of calculations to process in each batch
 * @returns {Function} Batch calculation function
 */
export const useBatchCalculation = (calculationFn, batchSize = 5) => {
  const queueRef = useRef([]);
  const processingRef = useRef(false);

  const processBatch = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) return;
    
    processingRef.current = true;
    
    while (queueRef.current.length > 0) {
      const batch = queueRef.current.splice(0, batchSize);
      
      // Process batch with small delay to prevent UI blocking
      await new Promise(resolve => {
        setTimeout(() => {
          batch.forEach(({ params, resolve: itemResolve, reject: itemReject }) => {
            try {
              const result = calculationFn(params);
              itemResolve(result);
            } catch (error) {
              itemReject(error);
            }
          });
          resolve();
        }, 10);
      });
    }
    
    processingRef.current = false;
  }, [calculationFn, batchSize]);

  const addToBatch = useCallback((params) => {
    return new Promise((resolve, reject) => {
      queueRef.current.push({ params, resolve, reject });
      processBatch();
    });
  }, [processBatch]);

  return addToBatch;
};