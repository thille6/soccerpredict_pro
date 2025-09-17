import React, { useState, useEffect } from 'react';
import CombinedCalculator from '../../components/CombinedCalculator';
import TeamDataGuide from '../../components/ui/TeamDataGuide';
import Icon from '../../components/AppIcon';

const Calculator = () => {
  const [activeTab, setActiveTab] = useState('xg');
  const [showTeamDataGuide, setShowTeamDataGuide] = useState(false);
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

  useEffect(() => {
    const handleOpenTeamDataGuide = () => {
      setShowTeamDataGuide(true);
    };

    window.addEventListener('openTeamDataGuide', handleOpenTeamDataGuide);
    
    return () => {
      window.removeEventListener('openTeamDataGuide', handleOpenTeamDataGuide);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Professionell Matchanalys & Prediktioner
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Använd avancerade statistiska modeller för att förutsäga matchresultat med vetenskaplig precision. 
            Kombinera Expected Goals (xG), Poisson-fördelning och Monte Carlo-simuleringar för djupgående insikter.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Vetenskapligt baserat
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Tre beräkningsmetoder
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Professionell analys
            </span>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => setShowTeamDataGuide(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <Icon name="HelpCircle" size={16} />
              <span>Guide: Hur man tar fram lagdata</span>
            </button>
          </div>
        </div>
        <CombinedCalculator
          activeTab={activeTab}
          xgParams={xgParams}
          poissonParams={poissonParams}
          monteCarloParams={monteCarloParams}
          onXgChange={handleXgChange}
          onPoissonChange={handlePoissonChange}
          onMonteCarloChange={handleMonteCarloChange}
        />
        
        {showTeamDataGuide && (
          <TeamDataGuide onClose={() => setShowTeamDataGuide(false)} />
        )}
      </div>
    </div>
  );
};

export default Calculator;