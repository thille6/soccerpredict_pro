import React from 'react';
import CombinedCalculator from '../../components/CombinedCalculator';

const Calculator = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Fotbollsberäkningar
        </h1>
        <CombinedCalculator />
      </div>
    </div>
  );
};

export default Calculator;