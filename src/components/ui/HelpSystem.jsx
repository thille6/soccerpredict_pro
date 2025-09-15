/**
 * Help System Component with tooltips, guides, and visualizations
 */
import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

// Tooltip Component
export const Tooltip = ({ children, content, position = 'top', delay = 500 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 max-w-xs shadow-lg">
            <div className="whitespace-pre-line">{content}</div>
            <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
              'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`} />
          </div>
        </div>
      )}
    </div>
  );
};

// Help Icon with Tooltip
export const HelpIcon = ({ content, size = 16 }) => (
  <Tooltip content={content}>
    <Icon 
      name="HelpCircle" 
      size={size} 
      className="text-gray-400 hover:text-gray-600 cursor-help transition-colors" 
    />
  </Tooltip>
);

// Method Explanation Component
export const MethodExplanation = ({ method }) => {
  const explanations = {
    'monte-carlo': {
      title: 'Monte Carlo Simulation',
      description: 'Använder slumpmässiga simuleringar för att beräkna sannolikheter',
      pros: [
        'Mycket flexibel och kan hantera komplexa scenarier',
        'Ger konfidensintervall för resultat',
        'Kan inkludera många variabler samtidigt'
      ],
      cons: [
        'Kräver många simuleringar för noggrannhet',
        'Resultaten kan variera mellan körningar',
        'Långsammare än matematiska modeller'
      ],
      bestFor: 'Komplexa matchanalyser med många okända faktorer'
    },
    'poisson': {
      title: 'Poisson Distribution',
      description: 'Matematisk modell baserad på målfrekvenser och lagstyrkorna',
      pros: [
        'Snabb och deterministisk',
        'Baserad på beprövad statistisk teori',
        'Ger konsekventa resultat'
      ],
      cons: [
        'Antar att mål är oberoende händelser',
        'Mindre flexibel än simulering',
        'Kan missa komplexa laginteraktioner'
      ],
      bestFor: 'Snabba beräkningar och grundläggande matchanalys'
    },
    'xg': {
      title: 'Expected Goals (xG)',
      description: 'Avancerad modell baserad på skottstatistik och spelkvalitet',
      pros: [
        'Baserad på verklig speldata',
        'Tar hänsyn till skottkvalitet',
        'Reflekterar modern fotbollsanalys'
      ],
      cons: [
        'Kräver detaljerad statistik',
        'Kan vara påverkad av spelstil',
        'Mindre historisk data tillgänglig'
      ],
      bestFor: 'Detaljerad analys av lag med tillgänglig xG-data'
    }
  };

  const explanation = explanations[method];
  if (!explanation) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-800 mb-2">{explanation.title}</h4>
          <p className="text-blue-700 mb-3">{explanation.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <h5 className="font-medium text-green-700 mb-1">Fördelar:</h5>
              <ul className="text-sm text-green-600 space-y-1">
                {explanation.pros.map((pro, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-orange-700 mb-1">Begränsningar:</h5>
              <ul className="text-sm text-orange-600 space-y-1">
                {explanation.cons.map((con, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-100 rounded p-2">
            <span className="font-medium text-blue-800">Bäst för: </span>
            <span className="text-blue-700">{explanation.bestFor}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Parameter Guide Component
export const ParameterGuide = ({ parameter }) => {
  const guides = {
    homeGoalsAvg: {
      title: 'Hemmalag Genomsnittliga Mål',
      description: 'Genomsnittligt antal mål som hemmalaget brukar göra per match',
      range: '0.5 - 4.0',
      examples: {
        'Svagt anfall': '0.8 - 1.2',
        'Genomsnittligt anfall': '1.5 - 2.0',
        'Starkt anfall': '2.5 - 3.5'
      },
      tips: 'Titta på lagets senaste 5-10 matcher för bästa uppskattning'
    },
    awayGoalsAvg: {
      title: 'Bortalag Genomsnittliga Mål',
      description: 'Genomsnittligt antal mål som bortalaget brukar göra per match',
      range: '0.5 - 4.0',
      examples: {
        'Svagt bortaanfall': '0.5 - 1.0',
        'Genomsnittligt bortaanfall': '1.2 - 1.8',
        'Starkt bortaanfall': '2.0 - 3.0'
      },
      tips: 'Bortalag gör vanligtvis färre mål än hemmalag'
    },
    homeDefenseStrength: {
      title: 'Hemmalag Försvarsstyrka',
      description: 'Hur bra hemmalagen är på att försvara sig (lägre = bättre)',
      range: '0.5 - 2.0',
      examples: {
        'Mycket starkt försvar': '0.6 - 0.8',
        'Genomsnittligt försvar': '0.9 - 1.1',
        'Svagt försvar': '1.3 - 1.8'
      },
      tips: 'Basera på insläppta mål per match jämfört med ligasnittet'
    },
    simulations: {
      title: 'Antal Simuleringar',
      description: 'Hur många slumpmässiga matcher som simuleras',
      range: '1,000 - 100,000',
      examples: {
        'Snabb uppskattning': '1,000 - 5,000',
        'Balanserad noggrannhet': '10,000 - 25,000',
        'Hög precision': '50,000 - 100,000'
      },
      tips: 'Fler simuleringar ger mer noggranna resultat men tar längre tid'
    }
  };

  const guide = guides[parameter];
  if (!guide) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
      <h4 className="font-semibold text-gray-800 mb-2">{guide.title}</h4>
      <p className="text-gray-700 mb-3">{guide.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-medium text-gray-700 mb-1">Rekommenderat intervall:</h5>
          <p className="text-sm text-gray-600 bg-gray-100 rounded px-2 py-1">{guide.range}</p>
        </div>
        
        <div>
          <h5 className="font-medium text-gray-700 mb-1">Exempel:</h5>
          <div className="text-sm text-gray-600 space-y-1">
            {Object.entries(guide.examples).map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span>{label}:</span>
                <span className="font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
        <div className="flex items-start space-x-2">
          <Icon name="Lightbulb" size={16} className="text-yellow-600 mt-0.5" />
          <p className="text-sm text-yellow-700">{guide.tips}</p>
        </div>
      </div>
    </div>
  );
};

// Quick Start Guide
export const QuickStartGuide = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: 'Välj Beräkningsmetod',
      content: 'Börja med att välja vilken metod du vill använda. Monte Carlo är bra för nybörjare.',
      icon: 'Target'
    },
    {
      title: 'Ange Lagstatistik',
      content: 'Fyll i statistik för båda lagen. Du kan använda snabbvalen eller ange egna värden.',
      icon: 'BarChart3'
    },
    {
      title: 'Kör Beräkning',
      content: 'Klicka på "Beräkna Sannolikheter" för att få dina resultat.',
      icon: 'Calculator'
    },
    {
      title: 'Tolka Resultaten',
      content: 'Resultaten visar sannolikheter för olika utfall samt förväntade mål.',
      icon: 'TrendingUp'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Snabbguide</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={16} />
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name={steps[currentStep].icon} size={16} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{steps[currentStep].title}</h4>
              <div className="text-sm text-gray-500">Steg {currentStep + 1} av {steps.length}</div>
            </div>
          </div>
          
          <p className="text-gray-700">{steps[currentStep].content}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Föregående
          </Button>
          
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Nästa
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={onClose}
            >
              Klar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Results Visualization Component
export const ResultsVisualization = ({ results }) => {
  if (!results) return null;

  const probabilities = [
    { label: 'Hemmavinst', value: parseFloat(results.homeWinProbability), color: 'bg-green-500' },
    { label: 'Oavgjort', value: parseFloat(results.drawProbability), color: 'bg-gray-500' },
    { label: 'Bortavinst', value: parseFloat(results.awayWinProbability), color: 'bg-red-500' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
        <Icon name="BarChart3" size={16} />
        <span>Sannolikhetsfördelning</span>
      </h4>
      
      <div className="space-y-3">
        {probabilities.map((prob, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600">{prob.label}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className={`${prob.color} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                style={{ width: `${prob.value}%` }}
              >
                <span className="text-white text-xs font-medium">
                  {prob.value.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Bredden på staplarna visar sannolikheten för varje utfall
      </div>
    </div>
  );
};

// Export all components
export default {
  Tooltip,
  HelpIcon,
  MethodExplanation,
  ParameterGuide,
  QuickStartGuide,
  ResultsVisualization
};