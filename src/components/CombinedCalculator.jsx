import React, { useState, useEffect, useRef } from 'react';
import ValidatedInput from './ui/InputValidation';
import { validationSchemas } from './ui/InputValidation';
import LoadingSpinner, { CalculationLoader } from './ui/LoadingSpinner';
import { useCalculationErrorToast } from './ui/Toast';
import { useCalculatorShortcuts, ShortcutHelpButton } from '../hooks/useKeyboardShortcuts.jsx';
import { useServiceWorker, useOfflineData } from '../hooks/useServiceWorker';
import { OfflineBanner } from './ui/OfflineStatus';
import ExportButton, { CompactExportButton } from './ui/ExportButton';
import { enhancedPoissonCalculator, monteCarloSimulator } from '../utils/improvedMath';
import { calculateAdvancedXGPrediction } from '../utils/xgCalculations';
import Icon from './AppIcon';

const CombinedCalculator = ({ 
  activeTab = 'xg', 
  xgParams = { homeXG: 1.5, awayXG: 1.2, homeXGA: 1.2, awayXGA: 1.3, homeDefense: 1.0, awayDefense: 1.0, homeForm: 1.0, awayForm: 1.0, motivation: 1.0 }, 
  poissonParams = { homeGoals: 1.5, awayGoals: 1.2, homeDefense: 1.0, awayDefense: 1.0 }, 
  monteCarloParams = { simulations: 10000, homeAttack: 1.5, awayAttack: 1.2, homeDefense: 1.0, awayDefense: 1.0 }, 
  onXgChange = () => {}, 
  onPoissonChange = () => {}, 
  onMonteCarloChange = () => {}, 
  xgErrors = {}, 
  poissonErrors = {}, 
  monteCarloErrors = {}, 
  validateXgField = () => {}, 
  validatePoissonField = () => {}, 
  validateMonteCarloField = () => {}, 
  method = 'xg' 
} = {}) => {
  const [xgResults, setXgResults] = useState(null);
  const [poissonResults, setPoissonResults] = useState(null);
  const [monteCarloResults, setMonteCarloResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [currentCalculationStep, setCurrentCalculationStep] = useState('');
  const { showCalculationError, showSuccess } = useCalculationErrorToast();
  const { isOnline } = useServiceWorker();
  const { saveOfflineData, loadOfflineData } = useOfflineData();
  const firstInputRef = useRef(null);

  // Keyboard shortcuts för bättre navigation
  const handleClear = () => {
    setXgResults(null);
    setPoissonResults(null);
    setMonteCarloResults(null);
    setCalculationProgress(0);
    setCurrentCalculationStep('');
  };

  const handleToggleComparison = () => {
    setShowComparison(prev => !prev);
  };

  const handleFocusFirstInput = () => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  };

  const calculateResults = async () => {
    setIsCalculating(true);
    setCalculationProgress(0);
    setCurrentCalculationStep('Förbereder beräkningar...');
    
    // Simulate calculation steps for better UX
    const updateProgress = (step, progress) => {
      setCurrentCalculationStep(step);
      setCalculationProgress(progress);
      return new Promise(resolve => setTimeout(resolve, 100)); // Small delay for visual feedback
    };
    
    try {
      if (showComparison) {
        // Calculate all methods for comparison
        await updateProgress('Beräknar xG-modell...', 10);
        const xgData = calculateAdvancedXGPrediction({
          homeXG: xgParams.homeXG,
          awayXG: xgParams.awayXG,
          homeXGA: xgParams.homeXGA,
          awayXGA: xgParams.awayXGA,
          homeDefensiveRating: xgParams.homeDefense,
          awayDefensiveRating: xgParams.awayDefense,
          homeFormFactor: xgParams.homeForm,
          weatherConditions: 1.0,
          motivationFactor: xgParams.motivation,
          headToHeadFactor: 1.0
        });
        setXgResults({
              homeWinProbability: xgData.homeWin,
              drawProbability: xgData.draw,
              awayWinProbability: xgData.awayWin,
              expectedHomeGoals: parseFloat(xgData.adjustedHomeXG),
              expectedAwayGoals: parseFloat(xgData.adjustedAwayXG)
            });

        await updateProgress('Beräknar Poisson-modell...', 40);
        const poissonData = enhancedPoissonCalculator.calculate({
          homeAttackRate: poissonParams.homeGoals,
          awayAttackRate: poissonParams.awayGoals,
          homeDefenseRate: poissonParams.homeDefense,
          awayDefenseRate: poissonParams.awayDefense
        });
        setPoissonResults(poissonData);

        await updateProgress('Beräknar Monte Carlo-simulering...', 70);
        const monteCarloData = monteCarloSimulator.simulate({
          simulations: monteCarloParams.simulations,
          homeGoalsAvg: monteCarloParams.homeAttack,
          awayGoalsAvg: monteCarloParams.awayAttack,
          homeDefenseStrength: monteCarloParams.homeDefense,
          awayDefenseStrength: monteCarloParams.awayDefense
        });
        setMonteCarloResults(monteCarloData);
        
        // Spara alla resultat offline
        const allResults = {
          xg: {
            homeWinProbability: xgData.homeWin,
            drawProbability: xgData.draw,
            awayWinProbability: xgData.awayWin,
            expectedHomeGoals: parseFloat(xgData.adjustedHomeXG),
            expectedAwayGoals: parseFloat(xgData.adjustedAwayXG)
          },
          poisson: poissonData,
          montecarlo: monteCarloData,
          timestamp: Date.now(),
          params: { xgParams, poissonParams, monteCarloParams }
        };
        await saveOfflineData('last_calculation', allResults);
        
        await updateProgress('Slutför beräkningar...', 100);
      } else {
        // Calculate only the active tab method
        switch (activeTab) {
          case 'xg':
            await updateProgress('Beräknar xG-modell...', 30);
            const xgData = calculateAdvancedXGPrediction({
              homeXG: xgParams.homeXG,
              awayXG: xgParams.awayXG,
              homeXGA: xgParams.homeXGA,
              awayXGA: xgParams.awayXGA,
              homeDefensiveRating: xgParams.homeDefense,
              awayDefensiveRating: xgParams.awayDefense,
              homeFormFactor: xgParams.homeForm,
              weatherConditions: 1.0,
              motivationFactor: xgParams.motivation,
              headToHeadFactor: 1.0
            });
            await updateProgress('Slutför xG-beräkning...', 80);
            const xgResult = {
              homeWinProbability: xgData.homeWin,
              drawProbability: xgData.draw,
              awayWinProbability: xgData.awayWin,
              expectedHomeGoals: parseFloat(xgData.adjustedHomeXG),
              expectedAwayGoals: parseFloat(xgData.adjustedAwayXG)
            };
            setXgResults(xgResult);
            await saveOfflineData('last_xg_calculation', { result: xgResult, params: xgParams, timestamp: Date.now() });
            await updateProgress('Klar!', 100);
            break;
            
          case 'poisson':
            await updateProgress('Beräknar Poisson-modell...', 30);
            const poissonData = enhancedPoissonCalculator.calculate({
              homeAttackRate: poissonParams.homeGoals,
              awayAttackRate: poissonParams.awayGoals,
              homeDefenseRate: poissonParams.homeDefense,
              awayDefenseRate: poissonParams.awayDefense
            });
            await updateProgress('Slutför Poisson-beräkning...', 80);
            setPoissonResults(poissonData);
            await saveOfflineData('last_poisson_calculation', { result: poissonData, params: poissonParams, timestamp: Date.now() });
            await updateProgress('Klar!', 100);
            break;
            
          case 'montecarlo':
            await updateProgress('Beräknar Monte Carlo-simulering...', 30);
            const monteCarloData = monteCarloSimulator.simulate({
              simulations: monteCarloParams.simulations,
              homeGoalsAvg: monteCarloParams.homeAttack,
              awayGoalsAvg: monteCarloParams.awayAttack,
              homeDefenseStrength: monteCarloParams.homeDefense,
              awayDefenseStrength: monteCarloParams.awayDefense
            });
            await updateProgress('Slutför Monte Carlo-beräkning...', 80);
            setMonteCarloResults(monteCarloData);
            await saveOfflineData('last_montecarlo_calculation', { result: monteCarloData, params: monteCarloParams, timestamp: Date.now() });
            await updateProgress('Klar!', 100);
            break;
        }
      }
      // Show success message
      if (showComparison) {
        showSuccess('Alla beräkningar slutförda', 'xG, Poisson och Monte Carlo modeller har beräknats');
      } else {
        const methodNames = {
          xg: 'xG-modell',
          poisson: 'Poisson-modell',
          montecarlo: 'Monte Carlo-simulering'
        };
        showSuccess(`${methodNames[activeTab]} slutförd`, 'Beräkningen har genomförts framgångsrikt');
      }
    } catch (error) {
      console.error('Calculation error:', error);
      showCalculationError(error, `Fel vid beräkning av ${activeTab} metod`);
    } finally {
      setIsCalculating(false);
      setCalculationProgress(0);
      setCurrentCalculationStep('');
    }
  };

  useCalculatorShortcuts({
    onCalculate: calculateResults,
    onClear: handleClear,
    onToggleComparison: handleToggleComparison,
    onSwitchTab: (tab) => {
      // Denna funktion skulle behöva implementeras i parent component
      console.log(`Switching to tab: ${tab}`);
    },
    onFocusInput: handleFocusFirstInput,
    activeTab
  });

  // Auto-calculate on tab change or comparison mode change
  useEffect(() => {
    if (xgResults || poissonResults || monteCarloResults) {
      calculateResults();
    }
  }, [activeTab, showComparison]);

  // Initial calculation when component mounts
  useEffect(() => {
    calculateResults();
  }, []);

  const ResultCard = ({ title, results, method, params: methodParams }) => {
    if (!results && isCalculating) return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <CalculationLoader 
          currentStep={currentCalculationStep}
          progress={calculationProgress}
          steps={showComparison ? 
            ['xG-modell', 'Poisson-modell', 'Monte Carlo-simulering'] :
            [title]
          }
        />
      </div>
    );
    
    if (!results) return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500 text-sm sm:text-base">Inga resultat att visa</p>
        </div>
      </div>
    );

    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">{title}</h3>
        
        {/* Win Probabilities */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-gray-700">Vinstsannolikheter</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {results.homeWinProbability}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Hemmavinst</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {results.drawProbability}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Oavgjort</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {results.awayWinProbability}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Bortavinst</div>
            </div>
          </div>
        </div>

        {/* Expected Goals */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-gray-700">Förväntade mål</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {typeof results.expectedHomeGoals === 'number' ? results.expectedHomeGoals.toFixed(2) : results.expectedHomeGoals || 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Hemmalag</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-purple-600">
                {typeof results.expectedAwayGoals === 'number' ? results.expectedAwayGoals.toFixed(2) : results.expectedAwayGoals || 'N/A'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Bortalag</div>
            </div>
          </div>
        </div>

        {/* Method-specific info and Export */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
          <div className="text-xs text-gray-500">
            {method === 'poisson' && 'Baserat på Poisson-fördelning'}
            {method === 'montecarlo' && methodParams && `Baserat på ${methodParams.simulations.toLocaleString()} simuleringar`}
          </div>
          <CompactExportButton
            results={{ [method]: results }}
            params={methodParams}
            activeTab={method}
          />
        </div>
      </div>
    );
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'xg': return 'Expected Goals (xG) - Kvalitetsbaserad Analys';
      case 'poisson': return 'Poisson-modell - Statistisk Sannolikhetsberäkning';
      case 'montecarlo': return 'Monte Carlo - Avancerad Simuleringsanalys';
      default: return 'Professionell Matchanalys';
    }
  };

  const getDescription = () => {
    switch (activeTab) {
      case 'xg': return 'Analyserar matchutfall genom Expected Goals (xG) - den mest moderna metoden inom fotbollsanalytik. Baserat på skottchansornas kvalitet och position ger denna metod djupgående insikter om lagens verkliga prestanda bortom bara mål och resultat.';
      case 'poisson': return 'Använder Poisson-fördelning, en beprövad matematisk modell som är standard inom professionell sportsbetting. Perfekt för att förutsäga exakta resultat och målantal baserat på lagens historiska attack- och försvarsstyrka.';
      case 'montecarlo': return 'Kör tusentals virtuella matcher med realistisk slumpvariation - samma teknik som används av professionella analysföretag. Ger de mest tillförlitliga sannolikheterna genom att simulera matchernas naturliga osäkerhet och variation.';
      default: return 'Välj en analysmetod för att börja din professionella matchanalys.';
    }
  };

  // Ladda offline-data vid start
  useEffect(() => {
    const loadLastCalculation = async () => {
      if (!isOnline) {
        const lastCalc = await loadOfflineData('last_calculation');
        if (lastCalc) {
          setXgResults(lastCalc.xg);
          setPoissonResults(lastCalc.poisson);
          setMonteCarloResults(lastCalc.montecarlo);
          console.log('Loaded offline calculation data');
        }
      }
    };
    loadLastCalculation();
  }, [isOnline, loadOfflineData]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <OfflineBanner />
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          <Icon name="calculator" className="inline mr-2 sm:mr-3" />
          {getTitle()}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{getDescription()}</p>
        
        {/* Expandable Help Section */}
        <details className="mb-4 sm:mb-6 bg-blue-50 rounded-lg p-3 sm:p-4">
          <summary className="cursor-pointer font-semibold text-blue-800 hover:text-blue-900">
            💡 Hur hittar jag rätt värden? (Klicka för att expandera)
          </summary>
          <div className="mt-3 text-sm text-blue-700 space-y-2">
            {activeTab === 'xg' && (
              <div>
                <p><strong>Expected Goals (xG) och xGA värden:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>xG (anfall):</strong> Genomsnittliga Expected Goals per match - hämta från FBref, Understat eller SofaScore</li>
                  <li><strong>xGA (försvar):</strong> Expected Goals Against per match - kvaliteten på chanser som laget släpper in</li>
                  <li><strong>Datakällor:</strong> Använd genomsnittliga värden från senaste 5-10 matcherna</li>
                  <li><strong>Hemmaplansjustering:</strong> xG +0.1-0.3, xGA -0.1-0.2 (bättre hemma)</li>
                  <li><strong>Exempel:</strong> Lag med 1.4 xG och 1.1 xGA hemma → använd 1.6 xG, 0.9 xGA</li>
                  <li><strong>Typiska värden:</strong> xG: 0.8-2.5, xGA: 0.8-2.2 (lägre xGA = bättre försvar)</li>
                </ul>
              </div>
            )}
            {activeTab === 'poisson' && (
              <div>
                <p><strong>Poisson-fördelning parametrar:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Attackstyrka:</strong> Genomsnittliga mål per match för laget</li>
                  <li><strong>Försvarsstyrka:</strong> Genomsnittliga insläppta mål per match</li>
                  <li>Använd data från senaste 10-15 matcherna för bästa precision</li>
                  <li>Justera för hemmaplan: +0.2-0.4 mål för hemmalaget</li>
                </ul>
              </div>
            )}
            {activeTab === 'montecarlo' && (
              <div>
                <p><strong>Monte Carlo-simulering parametrar:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Simuleringar:</strong> Fler simuleringar = högre precision (10,000-100,000)</li>
                  <li><strong>Attack/Försvar:</strong> Liknande Poisson men justerat för slumpmässighet</li>
                  <li>Bäst för komplexa scenarier med många variabler</li>
                </ul>
              </div>
            )}
          </div>
        </details>

        {/* Input Form Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
              Parametrar för {getTitle()}
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={calculateResults}
                disabled={isCalculating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                {isCalculating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Beräknar...
                  </>
                ) : (
                  <>
                    <Icon name="calculator" className="mr-2" />
                    Beräkna
                  </>
                )}
              </button>
              <ShortcutHelpButton />
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openTeamDataGuide'))}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center text-sm"
                title="Guide för lagdata"
              >
                <Icon name="HelpCircle" size={16} className="mr-1" />
                <span className="hidden sm:inline">Lagdata</span>
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            {activeTab === 'xg' && (
              <div className="space-y-4">
                <ValidatedInput
                  label="Hemmalag xG"
                  type="number"
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  value={xgParams.homeXG}
                  onChange={(value) => onXgChange('homeXG', value)}
                  validationRules={xgErrors.homeXG ? [] : [() => true]}
                  helpText="Expected Goals för hemmalaget. Min: 0.1, Max: 5.0. Vanliga värden: 0.8-2.5. Exempel: 1.8 = starkt anfall, 1.2 = genomsnitt, 0.9 = svagt anfall."
                />
                <ValidatedInput
                  label="Bortalag xG"
                  type="number"
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  value={xgParams.awayXG}
                  onChange={(value) => onXgChange('awayXG', value)}
                  validationRules={xgErrors.awayXG ? [] : [() => true]}
                  helpText="Expected Goals för bortalaget. Min: 0.1, Max: 5.0. Vanliga värden: 0.6-2.2. Exempel: 1.5 = starkt anfall, 1.0 = genomsnitt, 0.7 = svagt anfall."
                />
                <ValidatedInput
                  label="Hemmalag xGA"
                  type="number"
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  value={xgParams.homeXGA || 1.2}
                  onChange={(value) => onXgChange('homeXGA', value)}
                  validationRules={xgErrors.homeXGA ? [] : [() => true]}
                  helpText="Expected Goals Against för hemmalaget. Min: 0.1, Max: 5.0. Vanliga värden: 0.8-2.0. Exempel: 0.9 = starkt försvar, 1.2 = genomsnitt, 1.8 = svagt försvar."
                />
                <ValidatedInput
                  label="Bortalag xGA"
                  type="number"
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  value={xgParams.awayXGA || 1.3}
                  onChange={(value) => onXgChange('awayXGA', value)}
                  validationRules={xgErrors.awayXGA ? [] : [() => true]}
                  helpText="Expected Goals Against för bortalaget. Min: 0.1, Max: 5.0. Vanliga värden: 0.9-2.2. Exempel: 1.0 = starkt försvar, 1.3 = genomsnitt, 2.0 = svagt försvar."
                />
                <ValidatedInput
                  label="Hemmalag Försvarsstyrka"
                  type="number"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={xgParams.homeDefense}
                  onChange={(value) => onXgChange('homeDefense', value)}
                  validationRules={xgErrors.homeDefense ? [] : [() => true]}
                  helpText="Defensiv multiplikator för hemmalaget. Min: 0.5, Max: 2.0. Vanliga värden: 0.8-1.3. Exempel: 0.9 = starkt försvar, 1.0 = genomsnitt, 1.2 = svagt försvar."
                />
                <ValidatedInput
                  label="Bortalag Försvarsstyrka"
                  type="number"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={xgParams.awayDefense}
                  onChange={(value) => onXgChange('awayDefense', value)}
                  validationRules={xgErrors.awayDefense ? [] : [() => true]}
                  helpText="Defensiv multiplikator för bortalaget. Min: 0.5, Max: 2.0. Vanliga värden: 0.8-1.3. Exempel: 0.8 = starkt försvar, 1.0 = genomsnitt, 1.4 = svagt försvar."
                />
                <ValidatedInput
                  label="Hemmalag Form"
                  type="number"
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  value={xgParams.homeForm}
                  onChange={(value) => onXgChange('homeForm', value)}
                  validationRules={xgErrors.homeForm ? [] : [() => true]}
                  helpText="Formfaktor för hemmalaget. Min: 0.5, Max: 1.5. Vanliga värden: 0.8-1.2. Exempel: 1.1 = bra form, 1.0 = normal form, 0.9 = dålig form."
                />
                <ValidatedInput
                  label="Bortalag Form"
                  type="number"
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  value={xgParams.awayForm}
                  onChange={(value) => onXgChange('awayForm', value)}
                  validationRules={xgErrors.awayForm ? [] : [() => true]}
                  helpText="Formfaktor för bortalaget. Min: 0.5, Max: 1.5. Vanliga värden: 0.8-1.2. Exempel: 1.0 = bra form, 1.0 = normal form, 0.8 = dålig form."
                />
                <ValidatedInput
                  label="Motivationsfaktor"
                  type="number"
                  min={0.8}
                  max={1.3}
                  step={0.1}
                  value={xgParams.motivation}
                  onChange={(value) => onXgChange('motivation', value)}
                  validationRules={xgErrors.motivation ? [] : [() => true]}
                  helpText="Motivationsfaktor för matchen. Min: 0.8, Max: 1.3. Vanliga värden: 0.9-1.2. Exempel: 1.2 = hög motivation, 1.0 = normal, 0.9 = låg motivation."
                />
              </div>
            )}
            {activeTab === 'poisson' && (
              <div className="space-y-4">
                <ValidatedInput
                  label="Hemmalag Attackstyrka"
                  type="number"
                  min={0.1}
                  max={4.0}
                  step={0.1}
                  value={poissonParams.homeGoals}
                  onChange={(value) => onPoissonChange('homeGoals', value)}
                  validationRules={poissonErrors.homeGoals ? [] : [() => true]}
                  helpText="Offensiv styrka baserat på genomsnittliga mål per match. Min: 0.1, Max: 4.0. Vanliga värden: 0.5-2.5. Exempel: 1.8 = starkt anfall, 1.0 = genomsnitt, 0.6 = svagt anfall."
                />
                <ValidatedInput
                  label="Bortalag Attackstyrka"
                  type="number"
                  min={0.1}
                  max={4.0}
                  step={0.1}
                  value={poissonParams.awayGoals}
                  onChange={(value) => onPoissonChange('awayGoals', value)}
                  validationRules={poissonErrors.awayGoals ? [] : [() => true]}
                  helpText="Offensiv styrka baserat på genomsnittliga mål per match. Min: 0.1, Max: 4.0. Vanliga värden: 0.5-2.5. Exempel: 1.5 = starkt anfall, 1.0 = genomsnitt, 0.7 = svagt anfall."
                />
                <ValidatedInput
                  label="Hemmalag Försvarsstyrka"
                  type="number"
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  value={poissonParams.homeDefense}
                  onChange={(value) => onPoissonChange('homeDefense', value)}
                  validationRules={poissonErrors.homeDefense ? [] : [() => true]}
                  helpText="Defensiv styrka baserat på insläppta mål per match. Min: 0.1, Max: 3.0. Vanliga värden: 0.6-1.8. Exempel: 0.8 = starkt försvar, 1.0 = genomsnitt, 1.4 = svagt försvar. Lägre värde = bättre försvar."
                />
                <ValidatedInput
                  label="Bortalag Försvarsstyrka"
                  type="number"
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  value={poissonParams.awayDefense}
                  onChange={(value) => onPoissonChange('awayDefense', value)}
                  validationRules={poissonErrors.awayDefense ? [] : [() => true]}
                  helpText="Defensiv styrka baserat på insläppta mål per match. Min: 0.1, Max: 3.0. Vanliga värden: 0.6-1.8. Exempel: 1.0 = starkt försvar, 1.2 = genomsnitt, 1.6 = svagt försvar. Lägre värde = bättre försvar."
                />
              </div>
            )}
            {activeTab === 'montecarlo' && (
              <div className="space-y-4">
                <ValidatedInput
                  label="Antal simuleringar"
                  type="number"
                  min={1000}
                  max={1000000}
                  step={1000}
                  value={monteCarloParams.simulations}
                  onChange={(value) => onMonteCarloChange('simulations', value)}
                  validationRules={monteCarloErrors.simulations ? [] : [() => true]}
                  helpText="Antal Monte Carlo-simuleringar att köra. Min: 1,000, Max: 1,000,000. Vanliga värden: 10,000-100,000. Exempel: 10,000 = snabbt resultat, 100,000 = högre precision."
                />
                <ValidatedInput
                  label="Hemmalag Attackstyrka (MC)"
                  type="number"
                  min={0.1}
                  max={4.0}
                  step={0.1}
                  value={monteCarloParams.homeAttack}
                  onChange={(value) => onMonteCarloChange('homeAttack', value)}
                  validationRules={monteCarloErrors.homeAttack ? [] : [() => true]}
                  helpText="Offensiv styrka för Monte Carlo-simulering. Min: 0.1, Max: 4.0. Vanliga värden: 0.5-2.5. Exempel: 1.7 = starkt anfall, 1.0 = genomsnitt, 0.8 = svagt anfall."
                />
                <ValidatedInput
                  label="Hemmalag Försvarsstyrka (MC)"
                  type="number"
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  value={monteCarloParams.homeDefense}
                  onChange={(value) => onMonteCarloChange('homeDefense', value)}
                  validationRules={monteCarloErrors.homeDefense ? [] : [() => true]}
                  helpText="Defensiv styrka för Monte Carlo-simulering. Min: 0.1, Max: 3.0. Vanliga värden: 0.6-1.8. Exempel: 0.9 = starkt försvar, 1.0 = genomsnitt, 1.3 = svagt försvar. Lägre värde = bättre försvar."
                />
                <ValidatedInput
                  label="Bortalag Attackstyrka (MC)"
                  type="number"
                  min={0.1}
                  max={4.0}
                  step={0.1}
                  value={monteCarloParams.awayAttack}
                  onChange={(value) => onMonteCarloChange('awayAttack', value)}
                  validationRules={monteCarloErrors.awayAttack ? [] : [() => true]}
                  helpText="Offensiv styrka för Monte Carlo-simulering. Min: 0.1, Max: 4.0. Vanliga värden: 0.5-2.5. Exempel: 1.4 = starkt anfall, 1.0 = genomsnitt, 0.8 = svagt anfall."
                />
                <ValidatedInput
                   label="Bortalag Försvarsstyrka (MC)"
                   type="number"
                   min={0.1}
                   max={3.0}
                   step={0.1}
                   value={monteCarloParams.awayDefense}
                   onChange={(value) => onMonteCarloChange('awayDefense', value)}
                   validationRules={monteCarloErrors.awayDefense ? [] : [() => true]}
                   helpText="Defensiv styrka för Monte Carlo-simulering. Min: 0.1, Max: 3.0. Vanliga värden: 0.6-1.8. Exempel: 1.1 = starkt försvar, 1.2 = genomsnitt, 1.5 = svagt försvar. Lägre värde = bättre försvar."
                 />
               </div>
             )}
           </div>
          </div>
       </div>

       {/* Results Toggle */}
       <div className="mb-6 flex justify-center">
         <div className="bg-gray-100 p-1 rounded-lg">
           <button
             onClick={() => setShowComparison(false)}
             className={`px-4 py-2 rounded-md transition-colors ${
               !showComparison 
                 ? 'bg-white text-blue-600 shadow-sm' 
                 : 'text-gray-600 hover:text-gray-800'
             }`}
           >
             Individuella Resultat
           </button>
           <button
             onClick={() => setShowComparison(true)}
             className={`px-4 py-2 rounded-md transition-colors ${
               showComparison 
                 ? 'bg-white text-blue-600 shadow-sm' 
                 : 'text-gray-600 hover:text-gray-800'
             }`}
           >
             Jämför Alla Metoder
           </button>
         </div>
       </div>

       {/* Results */}
       {!showComparison ? (
         <div className="grid grid-cols-1 gap-8">
           {activeTab === 'xg' && (
             <ResultCard 
               title="xG-Analys: Kvalitetsbaserade Prediktioner" 
               results={xgResults} 
               method="xg"
               params={xgParams}
             />
           )}
           {activeTab === 'poisson' && (
             <ResultCard 
               title="Poisson-Modell: Statistiska Sannolikheter" 
               results={poissonResults} 
               method="poisson"
               params={poissonParams}
             />
           )}
           {activeTab === 'montecarlo' && (
             <ResultCard 
               title="Monte Carlo: Simuleringsbaserade Resultat" 
               results={monteCarloResults} 
               method="montecarlo"
               params={monteCarloParams}
             />
           )}
         </div>
       ) : (
         <div className="space-y-8">
           {/* Comparison View */}
           <div className="bg-white rounded-lg shadow-md p-6">
             <h3 className="text-xl font-bold mb-6 text-gray-800">Komplett Analysöversikt - Alla Metoder</h3>
             
             {/* Win Probabilities Comparison */}
             <div className="mb-8">
               <h4 className="font-semibold mb-4 text-gray-700">Vinstsannolikheter (%)</h4>
               <div className="overflow-x-auto">
                 <table className="w-full border-collapse text-sm">
                   <thead>
                     <tr className="bg-gray-50">
                       <th className="border p-2 sm:p-3 text-left text-xs sm:text-sm">Metod</th>
                       <th className="border p-2 sm:p-3 text-center text-green-600 text-xs sm:text-sm">Hemmavinst</th>
                       <th className="border p-2 sm:p-3 text-center text-yellow-600 text-xs sm:text-sm">Oavgjort</th>
                       <th className="border p-2 sm:p-3 text-center text-red-600 text-xs sm:text-sm">Bortavinst</th>
                     </tr>
                   </thead>
                   <tbody>
                     {xgResults && (
                       <tr>
                         <td className="border p-2 sm:p-3 font-medium text-xs sm:text-sm">Expected Goals (xG)</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{xgResults.homeWinProbability}%</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{xgResults.drawProbability}%</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{xgResults.awayWinProbability}%</td>
                       </tr>
                     )}
                     {poissonResults && (
                       <tr>
                         <td className="border p-2 sm:p-3 font-medium text-xs sm:text-sm">Poisson-fördelning</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{poissonResults.homeWinProbability}%</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{poissonResults.drawProbability}%</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{poissonResults.awayWinProbability}%</td>
                       </tr>
                     )}
                     {monteCarloResults && (
                       <tr>
                         <td className="border p-2 sm:p-3 font-medium text-xs sm:text-sm">Monte Carlo</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{monteCarloResults.homeWinProbability}%</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{monteCarloResults.drawProbability}%</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{monteCarloResults.awayWinProbability}%</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div>

             {/* Expected Goals Comparison */}
             <div className="mb-6">
               <h4 className="font-semibold mb-4 text-gray-700">Förväntade Mål</h4>
               <div className="overflow-x-auto">
                 <table className="w-full border-collapse text-sm">
                   <thead>
                     <tr className="bg-gray-50">
                       <th className="border p-2 sm:p-3 text-left text-xs sm:text-sm">Metod</th>
                       <th className="border p-2 sm:p-3 text-center text-blue-600 text-xs sm:text-sm">Hemmalag</th>
                       <th className="border p-2 sm:p-3 text-center text-purple-600 text-xs sm:text-sm">Bortalag</th>
                     </tr>
                   </thead>
                   <tbody>
                     {xgResults && (
                       <tr>
                         <td className="border p-2 sm:p-3 font-medium text-xs sm:text-sm">Expected Goals (xG)</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{typeof xgResults.expectedHomeGoals === 'number' ? xgResults.expectedHomeGoals.toFixed(2) : xgResults.expectedHomeGoals || 'N/A'}</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{typeof xgResults.expectedAwayGoals === 'number' ? xgResults.expectedAwayGoals.toFixed(2) : xgResults.expectedAwayGoals || 'N/A'}</td>
                       </tr>
                     )}
                     {poissonResults && (
                       <tr>
                         <td className="border p-2 sm:p-3 font-medium text-xs sm:text-sm">Poisson-fördelning</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{typeof poissonResults.expectedHomeGoals === 'number' ? poissonResults.expectedHomeGoals.toFixed(2) : poissonResults.expectedHomeGoals || 'N/A'}</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{typeof poissonResults.expectedAwayGoals === 'number' ? poissonResults.expectedAwayGoals.toFixed(2) : poissonResults.expectedAwayGoals || 'N/A'}</td>
                       </tr>
                     )}
                     {monteCarloResults && (
                       <tr>
                         <td className="border p-2 sm:p-3 font-medium text-xs sm:text-sm">Monte Carlo</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{typeof monteCarloResults.expectedHomeGoals === 'number' ? monteCarloResults.expectedHomeGoals.toFixed(2) : monteCarloResults.expectedHomeGoals || 'N/A'}</td>
                         <td className="border p-2 sm:p-3 text-center text-xs sm:text-sm">{typeof monteCarloResults.expectedAwayGoals === 'number' ? monteCarloResults.expectedAwayGoals.toFixed(2) : monteCarloResults.expectedAwayGoals || 'N/A'}</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div>

             {/* Method Insights */}
             <div className="bg-blue-50 rounded-lg p-4">
               <h4 className="font-semibold mb-2 text-blue-800">Metodjämförelse</h4>
               <div className="text-sm text-blue-700 space-y-1">
                 <p><strong>xG:</strong> Baserat på skottstatistik och kvalitet - bäst för lag med tillgänglig xG-data</p>
                 <p><strong>Poisson:</strong> Matematisk modell baserad på målgenomsnitt - pålitlig för de flesta matcher</p>
                 <p><strong>Monte Carlo:</strong> Simuleringsbaserad med variation - visar osäkerhetsintervall</p>
               </div>
             </div>
             
             {/* Export Comparison Results */}
             <div className="flex justify-center mt-6">
               <ExportButton
                 xgResults={xgResults}
                 poissonResults={poissonResults}
                 monteCarloResults={monteCarloResults}
                 allParams={{ xgParams, poissonParams, monteCarloParams }}
                 isComparison={true}
               />
             </div>
           </div>

           {/* Individual Results */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {xgResults && (
               <ResultCard 
                 title="Expected Goals (xG)" 
                 results={xgResults} 
                 method="xg"
                 params={xgParams}
               />
             )}
             {poissonResults && (
               <ResultCard 
                 title="Poisson-fördelning" 
                 results={poissonResults} 
                 method="poisson"
                 params={poissonParams}
               />
             )}
             {monteCarloResults && (
               <ResultCard 
                 title="Monte Carlo" 
                 results={monteCarloResults} 
                 method="montecarlo"
                 params={monteCarloParams}
               />
             )}
           </div>
         </div>
       )}
     </div>
   );
};

export default CombinedCalculator;