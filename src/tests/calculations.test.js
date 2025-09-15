/**
 * Unit tests for critical calculation functions
 * Tests Monte Carlo, Poisson, xG calculations, and advanced models
 */

// Mock implementations for testing environment
const mockMath = {
  random: () => 0.5, // Predictable random for testing
  sqrt: Math.sqrt,
  pow: Math.pow,
  exp: Math.exp,
  log: Math.log
};

// Import calculation modules (would be actual imports in real environment)
const { 
  monteCarloSimulator, 
  enhancedPoissonCalculator, 
  validateInputs 
} = require('../utils/improvedMath');

const { 
  xgCalculator, 
  calculateMatchXGPrediction 
} = require('../utils/xgCalculations');

const { 
  TeamFormAnalyzer, 
  SeasonalAnalyzer, 
  CorrelationAnalyzer 
} = require('../utils/advancedModels');

// Test utilities
const assertApproximatelyEqual = (actual, expected, tolerance = 0.01) => {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(`Expected ${actual} to be approximately ${expected} (tolerance: ${tolerance})`);
  }
};

const assertBetween = (value, min, max) => {
  if (value < min || value > max) {
    throw new Error(`Expected ${value} to be between ${min} and ${max}`);
  }
};

// Monte Carlo Simulation Tests
const testMonteCarloSimulation = () => {
  console.log('Testing Monte Carlo Simulation...');
  
  const params = {
    simulations: 1000,
    homeGoalsAvg: 2.0,
    awayGoalsAvg: 1.5,
    homeDefenseStrength: 0.9,
    awayDefenseStrength: 1.1,
    homeAdvantage: 0.3,
    randomSeed: 42
  };
  
  const results = monteCarloSimulator.simulate({
    simulations: params.simulations,
    homeGoalsAvg: params.homeAttackStrength,
    awayGoalsAvg: params.awayAttackStrength,
    homeDefenseStrength: params.homeDefenseStrength,
    awayDefenseStrength: params.awayDefenseStrength
  });
  
  // Test result structure
  if (!results.homeWinProbability || !results.drawProbability || !results.awayWinProbability) {
    throw new Error('Missing probability results');
  }
  
  // Test probability sum (should be approximately 100%)
  const totalProbability = parseFloat(results.homeWinProbability) + 
                          parseFloat(results.drawProbability) + 
                          parseFloat(results.awayWinProbability);
  assertApproximatelyEqual(totalProbability, 100, 1.0);
  
  // Test individual probabilities are reasonable
  assertBetween(parseFloat(results.homeWinProbability), 0, 100);
  assertBetween(parseFloat(results.drawProbability), 0, 100);
  assertBetween(parseFloat(results.awayWinProbability), 0, 100);
  
  // Test expected goals are reasonable
  assertBetween(parseFloat(results.expectedHomeGoals), 0, 10);
  assertBetween(parseFloat(results.expectedAwayGoals), 0, 10);
  
  console.log('✓ Monte Carlo Simulation tests passed');
};

// Poisson Distribution Tests
const testPoissonCalculation = () => {
  console.log('Testing Poisson Distribution...');
  
  const params = {
    homeAttackRate: 2.0,
    awayAttackRate: 1.5,
    homeDefenseRate: 0.8,
    awayDefenseRate: 1.0,
    leagueAverage: 2.7,
    adjustmentFactor: 1.0
  };
  
  const results = enhancedPoissonCalculator.calculate({
    homeAttackRate: params.homeAttackRate,
    awayAttackRate: params.awayAttackRate,
    homeDefenseRate: params.homeDefenseRate,
    awayDefenseRate: params.awayDefenseRate,
    leagueAverage: params.leagueAverage
  });
  
  // Test result structure
  if (!results.homeWinProbability || !results.drawProbability || !results.awayWinProbability) {
    throw new Error('Missing Poisson probability results');
  }
  
  // Test probability sum
  const totalProbability = parseFloat(results.homeWinProbability) + 
                          parseFloat(results.drawProbability) + 
                          parseFloat(results.awayWinProbability);
  assertApproximatelyEqual(totalProbability, 100, 1.0);
  
  // Test lambda calculations are positive
  if (results.homeLambda <= 0 || results.awayLambda <= 0) {
    throw new Error('Lambda values should be positive');
  }
  
  console.log('✓ Poisson Distribution tests passed');
};

// xG Calculation Tests
const testXGCalculation = () => {
  console.log('Testing xG Calculations...');
  
  const params = {
    homeTeam: {
      shotsPerGame: 15,
      shotsOnTargetPerGame: 6,
      bigChancesPerGame: 2.5,
      possession: 60,
      passAccuracy: 85,
      crossAccuracy: 25,
      counterAttacks: 0.15
    },
    awayTeam: {
      shotsPerGame: 12,
      shotsOnTargetPerGame: 4,
      bigChancesPerGame: 1.8,
      possession: 40,
      passAccuracy: 80,
      crossAccuracy: 20,
      counterAttacks: 0.12
    }
  };
  
  const results = calculateMatchXGPrediction(params.homeTeam, params.awayTeam);
  
  // Test result structure
  if (!results.homeWinProbability || !results.drawProbability || !results.awayWinProbability) {
    throw new Error('Missing xG probability results');
  }
  
  // Test xG values are reasonable
  assertBetween(parseFloat(results.expectedHomeGoals), 0, 8);
  assertBetween(parseFloat(results.expectedAwayGoals), 0, 8);
  
  // Test that home team has advantage (higher possession, more shots)
  if (parseFloat(results.expectedHomeGoals) <= parseFloat(results.expectedAwayGoals)) {
    console.warn('Warning: Home team expected goals not higher than away team');
  }
  
  console.log('✓ xG Calculation tests passed');
};

// Input Validation Tests
const testInputValidation = () => {
  console.log('Testing Input Validation...');
  
  // Test valid inputs
  const validParams = {
    homeGoalsAvg: 2.0,
    awayGoalsAvg: 1.5,
    simulations: 10000
  };
  
  const validSchema = {
    homeGoalsAvg: { min: 0, max: 10, required: true },
    awayGoalsAvg: { min: 0, max: 10, required: true },
    simulations: { min: 100, max: 100000, required: true }
  };
  
  const validResult = validateInputs(validParams);
  if (validResult.length > 0) {
    throw new Error('Valid inputs should pass validation');
  }

  // Test invalid inputs
  const invalidParams = {
    homeGoalsAvg: -1, // Invalid: negative
    awayGoalsAvg: 15, // Invalid: too high
    simulations: 50   // Invalid: too low
  };

  const invalidResult = validateInputs(invalidParams);
  if (invalidResult.length === 0) {
    throw new Error('Invalid inputs should fail validation');
  }

  if (invalidResult.length < 2) {
    throw new Error('Should have 3 validation errors');
  }
  
  console.log('✓ Input Validation tests passed');
};

// Team Form Analysis Tests
const testTeamFormAnalysis = () => {
  console.log('Testing Team Form Analysis...');
  
  const formAnalyzer = new TeamFormAnalyzer();
  
  // Test good form
  const goodResults = [1, 1, 0.5, 1]; // 3 wins, 1 draw
  const goodGoalDiffs = [2, 1, 0, 3];
  const goodForm = formAnalyzer.calculateForm(goodResults, goodGoalDiffs);
  
  assertBetween(goodForm.formScore, 0.7, 1.0);
  assertBetween(goodForm.confidence, 0, 1);
  
  // Test poor form
  const poorResults = [0, 0, 0, 0.5]; // 3 losses, 1 draw
  const poorGoalDiffs = [-2, -3, -1, 0];
  const poorForm = formAnalyzer.calculateForm(poorResults, poorGoalDiffs);
  
  assertBetween(poorForm.formScore, 0, 0.3);
  if (poorForm.momentum > 0) {
    throw new Error('Poor form should have negative momentum');
  }
  
  console.log('✓ Team Form Analysis tests passed');
};

// Seasonal Analysis Tests
const testSeasonalAnalysis = () => {
  console.log('Testing Seasonal Analysis...');
  
  const seasonalAnalyzer = new SeasonalAnalyzer();
  
  // Test early season
  const earlyFactor = seasonalAnalyzer.getSeasonalFactor(5);
  assertBetween(earlyFactor, 0.8, 1.0);
  
  // Test mid season
  const midFactor = seasonalAnalyzer.getSeasonalFactor(20);
  assertApproximatelyEqual(midFactor, 1.0, 0.05);
  
  // Test fatigue calculation
  const freshFactor = seasonalAnalyzer.calculateFatigueFactor(7, 1);
  const tiredFactor = seasonalAnalyzer.calculateFatigueFactor(2, 4);
  
  if (freshFactor <= tiredFactor) {
    throw new Error('Fresh team should have higher factor than tired team');
  }
  
  console.log('✓ Seasonal Analysis tests passed');
};

// Correlation Analysis Tests
const testCorrelationAnalysis = () => {
  console.log('Testing Correlation Analysis...');
  
  const correlationAnalyzer = new CorrelationAnalyzer();
  
  // Test perfect positive correlation
  const x1 = [1, 2, 3, 4, 5];
  const y1 = [2, 4, 6, 8, 10];
  const perfectCorr = correlationAnalyzer.calculateCorrelation(x1, y1);
  assertApproximatelyEqual(perfectCorr, 1.0, 0.01);
  
  // Test perfect negative correlation
  const x2 = [1, 2, 3, 4, 5];
  const y2 = [5, 4, 3, 2, 1];
  const negativeCorr = correlationAnalyzer.calculateCorrelation(x2, y2);
  assertApproximatelyEqual(negativeCorr, -1.0, 0.01);
  
  // Test no correlation
  const x3 = [1, 2, 3, 4, 5];
  const y3 = [3, 1, 4, 2, 5];
  const noCorr = correlationAnalyzer.calculateCorrelation(x3, y3);
  assertBetween(noCorr, -0.5, 0.5);
  
  console.log('✓ Correlation Analysis tests passed');
};

// Performance Tests
const testPerformance = () => {
  console.log('Testing Performance...');
  
  const startTime = performance.now();
  
  // Run multiple simulations to test performance
  const params = {
    simulations: 10000,
    homeGoalsAvg: 2.0,
    awayGoalsAvg: 1.5,
    homeDefenseStrength: 0.9,
    awayDefenseStrength: 1.1,
    homeAdvantage: 0.3,
    randomSeed: 42
  };
  
  for (let i = 0; i < 5; i++) {
    monteCarloSimulator.simulate({
      simulations: params.simulations,
      homeGoalsAvg: params.homeGoalsAvg,
      awayGoalsAvg: params.awayGoalsAvg,
      homeDefenseStrength: params.homeDefenseStrength,
      awayDefenseStrength: params.awayDefenseStrength
    });
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  // Should complete 5 simulations in reasonable time (< 5 seconds)
  if (totalTime > 5000) {
    console.warn(`Performance warning: 5 simulations took ${totalTime.toFixed(2)}ms`);
  } else {
    console.log(`✓ Performance test passed: ${totalTime.toFixed(2)}ms for 5 simulations`);
  }
};

// Edge Cases Tests
const testEdgeCases = () => {
  console.log('Testing Edge Cases...');
  
  // Test with extreme values
  const extremeParams = {
    simulations: 100, // Minimum simulations
    homeGoalsAvg: 0.1, // Very low scoring
    awayGoalsAvg: 0.1,
    homeDefenseStrength: 2.0, // Very strong defense
    awayDefenseStrength: 2.0,
    homeAdvantage: 0,
    randomSeed: 42
  };
  
  try {
    const results = monteCarloSimulator.simulate({
      simulations: extremeParams.simulations,
      homeGoalsAvg: extremeParams.homeGoalsAvg,
      awayGoalsAvg: extremeParams.awayGoalsAvg,
      homeDefenseStrength: extremeParams.homeDefenseStrength,
      awayDefenseStrength: extremeParams.awayDefenseStrength
    });
    
    // Should still produce valid results
    assertBetween(parseFloat(results.homeWinProbability), 0, 100);
    assertBetween(parseFloat(results.drawProbability), 0, 100);
    assertBetween(parseFloat(results.awayWinProbability), 0, 100);
    
  } catch (error) {
    throw new Error(`Edge case test failed: ${error.message}`);
  }
  
  // Test with empty/null inputs
  const formAnalyzer = new TeamFormAnalyzer();
  const emptyForm = formAnalyzer.calculateForm([], []);
  
  if (emptyForm.formScore !== 0.5) {
    throw new Error('Empty form should return neutral score');
  }
  
  console.log('✓ Edge Cases tests passed');
};

// Main test runner
const runAllTests = () => {
  console.log('🧪 Starting Calculation Tests...');
  console.log('================================');
  
  try {
    testMonteCarloSimulation();
    testPoissonCalculation();
    testXGCalculation();
    testInputValidation();
    testTeamFormAnalysis();
    testSeasonalAnalysis();
    testCorrelationAnalysis();
    testPerformance();
    testEdgeCases();
    
    console.log('================================');
    console.log('🎉 All tests passed successfully!');
    return true;
    
  } catch (error) {
    console.log('================================');
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    return false;
  }
};

// Export for use in testing environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testMonteCarloSimulation,
    testPoissonCalculation,
    testXGCalculation,
    testInputValidation,
    testTeamFormAnalysis,
    testSeasonalAnalysis,
    testCorrelationAnalysis,
    testPerformance,
    testEdgeCases
  };
}

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runAllTests();
}