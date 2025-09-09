import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ThemeStatus from '../../components/ui/ThemeStatus';

const Calculator = () => {
  // Monte Carlo Simulation Parameters
  const [monteCarloParams, setMonteCarloParams] = useState({
    simulations: 10000,
    homeGoalsAvg: 1.8,
    awayGoalsAvg: 1.5,
    homeDefenseStrength: 0.9,
    awayDefenseStrength: 1.1,
    homeAdvantage: 0.3,
    randomSeed: 42
  });

  // Poisson Distribution Parameters
  const [poissonParams, setPoissonParams] = useState({
    homeAttackRate: 1.8,
    awayAttackRate: 1.5,
    homeDefenseRate: 0.8,
    awayDefenseRate: 1.0,
    leagueAverage: 2.7,
    adjustmentFactor: 1.0
  });

  // Results
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('monte-carlo');

  // Save functionality
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveCalculationName, setSaveCalculationName] = useState('');
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Monte Carlo Simulation Logic
  const runMonteCarloSimulation = () => {
    const { simulations, homeGoalsAvg, awayGoalsAvg, homeDefenseStrength, awayDefenseStrength, homeAdvantage } = monteCarloParams;
    
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let totalHomeGoals = 0;
    let totalAwayGoals = 0;
    let bothTeamsScore = 0;
    let over25Goals = 0;
    let under25Goals = 0;

    // Adjusted goal rates
    const adjustedHomeRate = homeGoalsAvg * (1 + homeAdvantage) / awayDefenseStrength;
    const adjustedAwayRate = awayGoalsAvg / homeDefenseStrength;

    for (let i = 0; i < simulations; i++) {
      // Poisson distribution approximation
      let homeGoals = Math.max(0, Math.round(-Math.log(Math.random()) * adjustedHomeRate));
      let awayGoals = Math.max(0, Math.round(-Math.log(Math.random()) * adjustedAwayRate));
      
      totalHomeGoals += homeGoals;
      totalAwayGoals += awayGoals;
      
      const totalGoals = homeGoals + awayGoals;
      
      // Match result
      if (homeGoals > awayGoals) homeWins++;
      else if (homeGoals === awayGoals) draws++;
      else awayWins++;
      
      // Both teams to score
      if (homeGoals > 0 && awayGoals > 0) bothTeamsScore++;
      
      // Over/Under 2.5 goals
      if (totalGoals > 2.5) over25Goals++;
      else under25Goals++;
    }

    return {
      homeWinProbability: (homeWins / simulations * 100)?.toFixed(1),
      drawProbability: (draws / simulations * 100)?.toFixed(1),
      awayWinProbability: (awayWins / simulations * 100)?.toFixed(1),
      expectedHomeGoals: (totalHomeGoals / simulations)?.toFixed(2),
      expectedAwayGoals: (totalAwayGoals / simulations)?.toFixed(2),
      bothTeamsScoreProbability: (bothTeamsScore / simulations * 100)?.toFixed(1),
      over25Probability: (over25Goals / simulations * 100)?.toFixed(1),
      under25Probability: (under25Goals / simulations * 100)?.toFixed(1),
      confidence: Math.min(95, 70 + (simulations / 1000))?.toFixed(1)
    };
  };

  // Poisson Distribution Logic
  const calculatePoissonProbabilities = () => {
    const { homeAttackRate, awayAttackRate, homeDefenseRate, awayDefenseRate, leagueAverage, adjustmentFactor } = poissonParams;
    
    // Calculate lambda values (expected goals)
    const homeLambda = (homeAttackRate / leagueAverage) * (awayDefenseRate / leagueAverage) * leagueAverage * adjustmentFactor;
    const awayLambda = (awayAttackRate / leagueAverage) * (homeDefenseRate / leagueAverage) * leagueAverage * adjustmentFactor;

    // Poisson probability function
    const poissonProbability = (lambda, k) => {
      return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
    };

    const factorial = (n) => {
      if (n <= 1) return 1;
      return n * factorial(n - 1);
    };

    // Calculate probabilities for different scorelines
    let homeWinProb = 0;
    let drawProb = 0;
    let awayWinProb = 0;
    let bothTeamsScoreProb = 0;
    let over25Prob = 0;
    let under25Prob = 0;

    // Calculate for scorelines up to 6-6 for better accuracy
    for (let homeGoals = 0; homeGoals <= 6; homeGoals++) {
      for (let awayGoals = 0; awayGoals <= 6; awayGoals++) {
        const prob = poissonProbability(homeLambda, homeGoals) * poissonProbability(awayLambda, awayGoals);
        const totalGoals = homeGoals + awayGoals;
        
        // Match result
        if (homeGoals > awayGoals) homeWinProb += prob;
        else if (homeGoals === awayGoals) drawProb += prob;
        else awayWinProb += prob;
        
        // Both teams to score
        if (homeGoals > 0 && awayGoals > 0) bothTeamsScoreProb += prob;
        
        // Over/Under 2.5 goals
        if (totalGoals > 2.5) over25Prob += prob;
        else under25Prob += prob;
      }
    }

    return {
      homeWinProbability: (homeWinProb * 100)?.toFixed(1),
      drawProbability: (drawProb * 100)?.toFixed(1),
      awayWinProbability: (awayWinProb * 100)?.toFixed(1),
      expectedHomeGoals: homeLambda?.toFixed(2),
      expectedAwayGoals: awayLambda?.toFixed(2),
      bothTeamsScoreProbability: (bothTeamsScoreProb * 100)?.toFixed(1),
      over25Probability: (over25Prob * 100)?.toFixed(1),
      under25Probability: (under25Prob * 100)?.toFixed(1),
      confidence: 85.0
    };
  };

  // Calculate most likely scorelines for Poisson
  const calculateMostLikelyScorelines = (homeLambda, awayLambda) => {
    const poissonProbability = (lambda, k) => {
      const factorial = (n) => {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
      };
      return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
    };

    const scorelines = [];
    
    for (let homeGoals = 0; homeGoals <= 4; homeGoals++) {
      for (let awayGoals = 0; awayGoals <= 4; awayGoals++) {
        const prob = poissonProbability(homeLambda, homeGoals) * poissonProbability(awayLambda, awayGoals);
        scorelines.push({
          score: `${homeGoals}-${awayGoals}`,
          probability: (prob * 100)?.toFixed(1)
        });
      }
    }
    
    return scorelines.sort((a, b) => parseFloat(b.probability) - parseFloat(a.probability)).slice(0, 6);
  };

  // Calculate most likely scorelines for Monte Carlo
  const simulateMostLikelyScorelines = () => {
    const { simulations, homeGoalsAvg, awayGoalsAvg, homeDefenseStrength, awayDefenseStrength, homeAdvantage } = monteCarloParams;
    const adjustedHomeRate = homeGoalsAvg * (1 + homeAdvantage) / awayDefenseStrength;
    const adjustedAwayRate = awayGoalsAvg / homeDefenseStrength;
    
    const scorelineCount = {};
    
    for (let i = 0; i < Math.min(simulations, 10000); i++) {
      let homeGoals = Math.max(0, Math.round(-Math.log(Math.random()) * adjustedHomeRate));
      let awayGoals = Math.max(0, Math.round(-Math.log(Math.random()) * adjustedAwayRate));
      
      // Limit to realistic scorelines
      homeGoals = Math.min(homeGoals, 6);
      awayGoals = Math.min(awayGoals, 6);
      
      const score = `${homeGoals}-${awayGoals}`;
      scorelineCount[score] = (scorelineCount[score] || 0) + 1;
    }
    
    const simulationCount = Math.min(simulations, 10000);
    const scorelines = Object.entries(scorelineCount)
      .map(([score, count]) => ({
        score,
        probability: ((count / simulationCount) * 100)?.toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.probability) - parseFloat(a.probability))
      .slice(0, 6);
    
    return scorelines;
  };

  // Load saved calculations from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('soccerpredict-calculations');
    if (saved) {
      setSavedCalculations(JSON.parse(saved));
    }
  }, []);

  // Save calculation with name
  const saveCalculation = () => {
    if (!results || !saveCalculationName.trim()) return;
    
    const calculationData = {
      id: Date.now().toString(),
      name: saveCalculationName.trim(),
      date: new Date().toLocaleString('sv-SE'),
      method: activeTab,
      parameters: activeTab === 'monte-carlo' ? monteCarloParams : poissonParams,
      results: results
    };
    
    const updated = [...savedCalculations, calculationData];
    setSavedCalculations(updated);
    localStorage.setItem('soccerpredict-calculations', JSON.stringify(updated));
    
    setSaveCalculationName('');
    setShowSaveDialog(false);
  };

  // Load saved calculation
  const loadCalculation = (calculation) => {
    setActiveTab(calculation.method);
    
    if (calculation.method === 'monte-carlo') {
      setMonteCarloParams(calculation.parameters);
    } else {
      setPoissonParams(calculation.parameters);
    }
    
    setResults(calculation.results);
    setShowLoadDialog(false);
  };

  // Delete saved calculation
  const deleteCalculation = (calculationId) => {
    const updated = savedCalculations.filter(calc => calc.id !== calculationId);
    setSavedCalculations(updated);
    localStorage.setItem('soccerpredict-calculations', JSON.stringify(updated));
  };

  // Handle calculation
  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let calculationResults;
    if (activeTab === 'monte-carlo') {
      calculationResults = runMonteCarloSimulation();
      calculationResults.method = 'Monte Carlo Simulation';
      calculationResults.simulations = monteCarloParams?.simulations;
      calculationResults.mostLikelyScorelines = simulateMostLikelyScorelines();
    } else {
      calculationResults = calculatePoissonProbabilities();
      calculationResults.method = 'Poisson Distribution';
      calculationResults.simulations = 'Mathematical Model';
      
      // Calculate most likely scorelines for Poisson
      const homeLambda = (poissonParams.homeAttackRate / poissonParams.leagueAverage) * (poissonParams.awayDefenseRate / poissonParams.leagueAverage) * poissonParams.leagueAverage * poissonParams.adjustmentFactor;
      const awayLambda = (poissonParams.awayAttackRate / poissonParams.leagueAverage) * (poissonParams.homeDefenseRate / poissonParams.leagueAverage) * poissonParams.leagueAverage * poissonParams.adjustmentFactor;
      calculationResults.mostLikelyScorelines = calculateMostLikelyScorelines(homeLambda, awayLambda);
    }
    
    setResults(calculationResults);
    setIsCalculating(false);
  };

  // Handle parameter changes
  const handleMonteCarloChange = (field, value) => {
    setMonteCarloParams(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handlePoissonChange = (field, value) => {
    setPoissonParams(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  // Reset parameters
  const resetParameters = () => {
    if (activeTab === 'monte-carlo') {
      setMonteCarloParams({
        simulations: 10000,
        homeGoalsAvg: 1.8,
        awayGoalsAvg: 1.5,
        homeDefenseStrength: 0.9,
        awayDefenseStrength: 1.1,
        homeAdvantage: 0.3,
        randomSeed: 42
      });
    } else {
      setPoissonParams({
        homeAttackRate: 1.8,
        awayAttackRate: 1.5,
        homeDefenseRate: 0.8,
        awayDefenseRate: 1.0,
        leagueAverage: 2.7,
        adjustmentFactor: 1.0
      });
    }
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        savedCalculationsCount={savedCalculations.length}
        onShowSave={() => setShowSaveDialog(true)}
        onShowLoad={() => setShowLoadDialog(true)}
        canSave={!!results}
      />
      
      {/* Main Content */}
      <div className="px-6 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Simple Calculator Form */}
        <div className="bg-card border border-border rounded-lg p-6 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Matchkalkylator</h2>
            <Button
              variant="outline"
              size="sm"
              iconName="RefreshCw"
              iconPosition="left"
              onClick={resetParameters}
              className="transition-all duration-200 hover:scale-105"
            >
              Återställ
            </Button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Snabbval - Välj matchtyp:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (activeTab === 'monte-carlo') {
                    setMonteCarloParams({
                      simulations: 10000,
                      homeGoalsAvg: 2.1,
                      awayGoalsAvg: 1.3,
                      homeDefenseStrength: 0.8,
                      awayDefenseStrength: 1.3,
                      homeAdvantage: 0.3,
                      randomSeed: 42
                    });
                  } else {
                    setPoissonParams({
                      homeAttackRate: 2.1,
                      awayAttackRate: 1.3,
                      homeDefenseRate: 0.8,
                      awayDefenseRate: 1.3,
                      leagueAverage: 2.7,
                      adjustmentFactor: 1.0
                    });
                  }
                }}
                className="h-auto p-4 text-left border-green-200 hover:border-green-300 transition-all duration-200 hover:scale-102 hover:shadow-green-200/50 hover:shadow-md"
              >
                <div>
                  <div className="font-semibold text-green-700 mb-1">Stark hemma vs Svag borta</div>
                  <div className="text-xs text-gray-600 mb-2">T.ex. Manchester City vs nykomling</div>
                  <div className="text-xs text-gray-500">
                    Hemma: 2.1 mål, 0.8 insläppta<br/>
                    Borta: 1.3 mål, 1.3 insläppta
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  if (activeTab === 'monte-carlo') {
                    setMonteCarloParams({
                      simulations: 10000,
                      homeGoalsAvg: 1.7,
                      awayGoalsAvg: 1.8,
                      homeDefenseStrength: 0.95,
                      awayDefenseStrength: 0.9,
                      homeAdvantage: 0.3,
                      randomSeed: 42
                    });
                  } else {
                    setPoissonParams({
                      homeAttackRate: 1.7,
                      awayAttackRate: 1.8,
                      homeDefenseRate: 0.95,
                      awayDefenseRate: 0.9,
                      leagueAverage: 2.7,
                      adjustmentFactor: 1.0
                    });
                  }
                }}
                className="h-auto p-4 text-left border-yellow-200 hover:border-yellow-300 transition-all duration-200 hover:scale-102 hover:shadow-yellow-200/50 hover:shadow-md"
              >
                <div>
                  <div className="font-semibold text-yellow-700 mb-1">Jämna lag</div>
                  <div className="text-xs text-gray-600 mb-2">T.ex. Arsenal vs Liverpool</div>
                  <div className="text-xs text-gray-500">
                    Hemma: 1.7 mål, 0.95 insläppta<br/>
                    Borta: 1.8 mål, 0.9 insläppta
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  if (activeTab === 'monte-carlo') {
                    setMonteCarloParams({
                      simulations: 10000,
                      homeGoalsAvg: 1.2,
                      awayGoalsAvg: 2.2,
                      homeDefenseStrength: 1.4,
                      awayDefenseStrength: 0.7,
                      homeAdvantage: 0.25,
                      randomSeed: 42
                    });
                  } else {
                    setPoissonParams({
                      homeAttackRate: 1.2,
                      awayAttackRate: 2.2,
                      homeDefenseRate: 1.4,
                      awayDefenseRate: 0.7,
                      leagueAverage: 2.7,
                      adjustmentFactor: 1.0
                    });
                  }
                }}
                className="h-auto p-4 text-left border-red-200 hover:border-red-300 transition-all duration-200 hover:scale-102 hover:shadow-red-200/50 hover:shadow-md"
              >
                <div>
                  <div className="font-semibold text-red-700 mb-1">Svag hemma vs Stark borta</div>
                  <div className="text-xs text-gray-600 mb-2">T.ex. Nykomling vs Real Madrid</div>
                  <div className="text-xs text-gray-500">
                    Hemma: 1.2 mål, 1.4 insläppta<br/>
                    Borta: 2.2 mål, 0.7 insläppta
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Method Selection */}
          <div className="flex space-x-1 mb-6 bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('monte-carlo')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'monte-carlo' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monte Carlo
            </button>
            <button
              onClick={() => setActiveTab('poisson')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'poisson' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Poisson
            </button>
          </div>

          {/* Input Fields */}
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <Icon name="Lightbulb" size={16} className="text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">Komplett exempel - Arsenal vs Liverpool:</p>
                  <div className="text-yellow-700 space-y-1">
                    <p><strong>Arsenal (hemma):</strong> Gör 1.8 mål/match, släpper in 0.9 mål/match</p>
                    <p><strong>Liverpool (borta):</strong> Gör 1.6 mål/match, släpper in 1.1 mål/match</p>
                    <p><strong>Hemmafördel:</strong> 0.3 (standard), <strong>Simuleringar:</strong> 10000</p>
                    <p className="text-xs mt-2 italic">Alla värden är enkla genomsnitt från senaste matcherna!</p>
                  </div>
                </div>
              </div>
            </div>
          
          {activeTab === 'monte-carlo' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Input
                  label="Hemmalag - Mål per match"
                  type="number"
                  step="0.1"
                  value={monteCarloParams?.homeGoalsAvg}
                  onChange={(e) => handleMonteCarloChange('homeGoalsAvg', e?.target?.value)}
                  placeholder="1.8"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Exempel:</strong> Man City 2.1, Arsenal 1.8, Brighton 1.4 mål/match
                </div>
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Bortlag - Mål per match"
                  type="number"
                  step="0.1"
                  value={monteCarloParams?.awayGoalsAvg}
                  onChange={(e) => handleMonteCarloChange('awayGoalsAvg', e?.target?.value)}
                  placeholder="1.5"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Tips:</strong> Bortlag gör ofta 0.2-0.4 färre mål än hemma
                </div>
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Hemmalag - Insläppta mål per match"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={monteCarloParams?.homeDefenseStrength}
                  onChange={(e) => handleMonteCarloChange('homeDefenseStrength', e?.target?.value)}
                  placeholder="0.9"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Så fyller du i:</strong> Räkna genomsnitt insläppta mål senaste 5-10 matcher.<br/>
                  <strong>Exempel:</strong> City 0.7, Arsenal 1.0, Burnley 1.6 mål insläppta/match
                </div>
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Bortlag - Insläppta mål per match"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={monteCarloParams?.awayDefenseStrength}
                  onChange={(e) => handleMonteCarloChange('awayDefenseStrength', e?.target?.value)}
                  placeholder="1.1"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Tips:</strong> Bortlag släpper ofta in 0.2-0.3 fler mål än hemma på grund av bortaspel<br/>
                  <strong>Enkelt:</strong> Ta hemmalaget + 0.2 som utgångspunkt
                </div>
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Hemmaplansfördel"
                  type="number"
                  step="0.1"
                  min="0"
                  max="0.6"
                  value={monteCarloParams?.homeAdvantage}
                  onChange={(e) => handleMonteCarloChange('homeAdvantage', e?.target?.value)}
                  placeholder="0.3"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Standard:</strong> 0.3 (30%), 0.4 för stark hemmapublik, 0.2 för tomma arenor
                </div>
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Antal Simuleringar"
                  type="number"
                  value={monteCarloParams?.simulations}
                  onChange={(e) => handleMonteCarloChange('simulations', e?.target?.value)}
                  placeholder="10000"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Rekommendation:</strong> 10,000+ för bästa resultat (högre = långsammare)
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Input
                  label="Hemmalag Anfallsstyrka"
                  type="number"
                  step="0.1"
                  value={poissonParams?.homeAttackRate}
                  onChange={(e) => handlePoissonChange('homeAttackRate', e?.target?.value)}
                  placeholder="1.8"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Förklaring:</strong> Antal mål laget gör per match i genomsnitt
                </div>
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Bortlag Anfallsstyrka"
                  type="number"
                  step="0.1"
                  value={poissonParams?.awayAttackRate}
                  onChange={(e) => handlePoissonChange('awayAttackRate', e?.target?.value)}
                  placeholder="1.5"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Tips:</strong> Oftast lägre än hemmalagen på grund av bortaspel
                </div>
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Hemmalag - Insläppta mål per match"
                  type="number"
                  step="0.1"
                  value={poissonParams?.homeDefenseRate}
                  onChange={(e) => handlePoissonChange('homeDefenseRate', e?.target?.value)}
                  placeholder="0.8"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Enkelt:</strong> Räkna genomsnitt insläppta mål senaste matcher (samma som försvarsstyrka)
                </div>
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Bortlag - Insläppta mål per match"
                  type="number"
                  step="0.1"
                  value={poissonParams?.awayDefenseRate}
                  onChange={(e) => handlePoissonChange('awayDefenseRate', e?.target?.value)}
                  placeholder="1.0"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Tips:</strong> Använd samma logik som ovan - genomsnitt insläppta mål per match
                </div>
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Ligagenomsnitt"
                  type="number"
                  step="0.1"
                  value={poissonParams?.leagueAverage}
                  onChange={(e) => handlePoissonChange('leagueAverage', e?.target?.value)}
                  placeholder="2.7"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Exempel:</strong> Premier League 2.7, Serie A 2.4, Bundesliga 3.1
                </div>
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Justeringsfaktor"
                  type="number"
                  step="0.1"
                  value={poissonParams?.adjustmentFactor}
                  onChange={(e) => handlePoissonChange('adjustmentFactor', e?.target?.value)}
                  placeholder="1.0"
                />
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Standard:</strong> 1.0 (ingen justering), 1.1 för målrika matcher
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Calculate Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={handleCalculate}
              loading={isCalculating}
              size="lg"
              iconName="Calculator"
              iconPosition="left"
              className="px-8 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              {isCalculating ? 'Beräknar...' : 'Beräkna Sannolikheter'}
            </Button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Beräkningsresultat</h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Info" size={16} />
                <span>Metod: {results?.method}</span>
              </div>
            </div>

            {/* Results Explanation */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <Icon name="TrendingUp" size={16} className="text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800 mb-1">Resultatförklaring:</p>
                  <p className="text-green-700">
                    <strong>Sannolikheter:</strong> Visar chansen för varje utfall. Högre värde = mer troligt.
                    <strong> BTTS:</strong> Sannolikhet att båda lagen gör minst 1 mål.
                    <strong> Ö/U 2.5:</strong> Chans för fler/färre än 2.5 totala mål i matchen.
                  </p>
                </div>
              </div>
            </div>

            {/* Probability Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700">
                    Hemmavinst
                  </span>
                  <Icon name="Home" size={16} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-800">
                  {results?.homeWinProbability}%
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Oavgjort
                  </span>
                  <Icon name="Minus" size={16} className="text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {results?.drawProbability}%
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-700">
                    Bortavinst
                  </span>
                  <Icon name="Plane" size={16} className="text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-800">
                  {results?.awayWinProbability}%
                </div>
              </div>
            </div>

            {/* Additional Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted rounded-lg mb-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Förväntade hemmalag mål</div>
                <div className="text-lg font-semibold text-foreground">{results?.expectedHomeGoals}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Förväntade bortalag mål</div>
                <div className="text-lg font-semibold text-foreground">{results?.expectedAwayGoals}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Konfidensgrad</div>
                <div className="text-lg font-semibold text-foreground">{results?.confidence}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Simuleringar</div>
                <div className="text-lg font-semibold text-foreground">{results?.simulations}</div>
              </div>
            </div>

            {/* Special Bets - BTTS and Over/Under 2.5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Both Teams to Score */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-800">
                    Båda lagen gör mål (BTTS)
                  </h3>
                  <Icon name="Target" size={20} className="text-blue-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-blue-600 mb-1">Ja</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {results?.bothTeamsScoreProbability}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-blue-600 mb-1">Nej</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {(100 - parseFloat(results?.bothTeamsScoreProbability || 0))?.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Over/Under 2.5 Goals */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-800">
                    Över/Under 2.5 mål
                  </h3>
                  <Icon name="BarChart3" size={20} className="text-purple-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-purple-600 mb-1">Över 2.5</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {results?.over25Probability}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-purple-600 mb-1">Under 2.5</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {results?.under25Probability}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Likely Scorelines */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Mest sannolika slutresultat
                </h3>
                <Icon name="Grid3x3" size={20} className="text-gray-600" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {results?.mostLikelyScorelines?.map((scoreline, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {scoreline.score}
                    </div>
                    <div className="text-sm text-gray-600">
                      {scoreline.probability}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Spara Beräkning</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveCalculationName('');
                  }}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Namn på beräkningen
                  </label>
                  <input
                    type="text"
                    value={saveCalculationName}
                    onChange={(e) => setSaveCalculationName(e.target.value)}
                    placeholder="T.ex. Arsenal vs Liverpool"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    <strong>Metod:</strong> {results?.method}<br/>
                    <strong>Hemmavinst:</strong> {results?.homeWinProbability}%<br/>
                    <strong>Oavgjort:</strong> {results?.drawProbability}%<br/>
                    <strong>Bortavinst:</strong> {results?.awayWinProbability}%
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSaveDialog(false);
                      setSaveCalculationName('');
                    }}
                  >
                    Avbryt
                  </Button>
                  <Button
                    onClick={saveCalculation}
                    disabled={!saveCalculationName.trim()}
                    iconName="Save"
                    iconPosition="left"
                  >
                    Spara
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Load Dialog */}
        {showLoadDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Sparade Beräkningar</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => setShowLoadDialog(false)}
                />
              </div>
              
              {savedCalculations.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="FileX" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Inga sparade beräkningar ännu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedCalculations.map((calculation) => (
                    <div key={calculation.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">{calculation.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {calculation.date} • {calculation.method === 'monte-carlo' ? 'Monte Carlo' : 'Poisson'}
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-green-600 font-medium">Hemma: {calculation.results.homeWinProbability}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Oavgjort: {calculation.results.drawProbability}%</span>
                            </div>
                            <div>
                              <span className="text-red-600 font-medium">Borta: {calculation.results.awayWinProbability}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Upload"
                            onClick={() => loadCalculation(calculation)}
                          >
                            Ladda
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="Trash2"
                            onClick={() => deleteCalculation(calculation.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowLoadDialog(false)}
                >
                  Stäng
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Theme Status Indicator */}
      <ThemeStatus />
    </div>
  );
};

export default Calculator;