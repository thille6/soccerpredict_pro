import React, { useState } from 'react';
import CombinedCalculator from '../../components/CombinedCalculator';

const Calculator = () => {
  const [activeTab, setActiveTab] = useState('xg');
  const [xgParams, setXgParams] = useState({
    homeXG: 1.5,
    awayXG: 1.2,
    homeDefense: 1.0,
    awayDefense: 1.0,
    homeForm: 1.0,
    awayForm: 1.0,
    motivation: 1.0
  });
  const [poissonParams, setPoissonParams] = useState({
    homeGoals: 1.5,
    awayGoals: 1.2,
    homeDefense: 1.0,
    awayDefense: 1.0
  });
  const [monteCarloParams, setMonteCarloParams] = useState({
    simulations: 10000,
    homeAttack: 1.5,
    awayAttack: 1.2,
    homeDefense: 1.0,
    awayDefense: 1.0
  });

  const handleXgChange = (field, value) => {
    setXgParams(prev => ({ ...prev, [field]: value }));
  };

  const handlePoissonChange = (field, value) => {
    setPoissonParams(prev => ({ ...prev, [field]: value }));
  };

  const handleMonteCarloChange = (field, value) => {
    setMonteCarloParams(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Fotbollsberäkningar
        </h1>
        <CombinedCalculator
          activeTab={activeTab}
          xgParams={xgParams}
          poissonParams={poissonParams}
          monteCarloParams={monteCarloParams}
          onXgChange={handleXgChange}
          onPoissonChange={handlePoissonChange}
          onMonteCarloChange={handleMonteCarloChange}
        />
      </div>
    </div>
  );
};

export default Calculator;