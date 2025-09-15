import React, { Suspense } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Lazy load components for better performance
const Calculator = React.lazy(() => import('./pages/calculator/index'));
const NotFound = React.lazy(() => import('pages/NotFound'));

// Get base name for GitHub Pages deployment
const basename = import.meta.env.MODE === 'production' ? '/soccerpredict_pro' : '';

const Routes = () => {
  return (
    <BrowserRouter basename={basename}>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner variant="spinner" size="lg" />
          </div>
        }>
          <RouterRoutes>
            {/* Define your route here */}
            <Route path="/" element={<Calculator />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;