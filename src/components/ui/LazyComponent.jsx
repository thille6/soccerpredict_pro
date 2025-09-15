import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { cn } from '../../utils/cn';

/**
 * LazyComponent wrapper för att enkelt implementera lazy loading
 * med anpassningsbara fallback-komponenter
 */
const LazyComponent = ({ 
  component: Component, 
  fallback, 
  className,
  containerClassName,
  errorBoundary = true,
  ...props 
}) => {
  const defaultFallback = (
    <div className={cn(
      "flex items-center justify-center p-8",
      containerClassName
    )}>
      <LoadingSpinner 
        variant="spinner" 
        size="md" 
        className={className}
      />
    </div>
  );

  const suspenseContent = (
    <Suspense fallback={fallback || defaultFallback}>
      <Component {...props} />
    </Suspense>
  );

  if (errorBoundary) {
    return (
      <LazyErrorBoundary>
        {suspenseContent}
      </LazyErrorBoundary>
    );
  }

  return suspenseContent;
};

/**
 * Error boundary specifikt för lazy-laddade komponenter
 */
class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Komponenten kunde inte laddas
          </h3>
          <p className="text-gray-600 mb-4">
            Ett fel uppstod när komponenten skulle laddas. Försök att ladda om sidan.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ladda om sidan
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook för att skapa lazy-laddade komponenter med förbättrad felhantering
 */
export const useLazyComponent = (importFunction, options = {}) => {
  const {
    retries = 3,
    retryDelay = 1000,
    fallback,
    onError
  } = options;

  const lazyComponent = React.lazy(() => {
    let retryCount = 0;
    
    const loadWithRetry = async () => {
      try {
        return await importFunction();
      } catch (error) {
        if (retryCount < retries) {
          retryCount++;
          console.warn(`Lazy loading failed, retrying (${retryCount}/${retries})...`, error);
          
          // Vänta innan retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
          return loadWithRetry();
        }
        
        if (onError) {
          onError(error);
        }
        
        throw error;
      }
    };
    
    return loadWithRetry();
  });

  return (props) => (
    <LazyComponent 
      component={lazyComponent} 
      fallback={fallback}
      {...props} 
    />
  );
};

/**
 * Preload funktion för att förladda komponenter
 */
export const preloadComponent = (importFunction) => {
  const componentImport = importFunction();
  return componentImport;
};

/**
 * Hook för att preload komponenter baserat på användarinteraktion
 */
export const useComponentPreloader = () => {
  const preloadedComponents = React.useRef(new Set());
  
  const preload = React.useCallback((importFunction, key) => {
    if (!preloadedComponents.current.has(key)) {
      preloadedComponents.current.add(key);
      preloadComponent(importFunction);
    }
  }, []);
  
  return { preload };
};

export default LazyComponent;