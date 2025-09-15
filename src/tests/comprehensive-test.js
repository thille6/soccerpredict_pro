/**
 * Comprehensive Test Suite for Soccer Prediction Calculations
 * Tests all calculation methods and identifies potential issues
 */

import { calculateAdvancedXGPrediction } from '../utils/xgCalculations.js';
import { enhancedPoissonCalculator } from '../utils/improvedMath.js';
import { monteCarloSimulator } from '../utils/improvedMath.js';

// Test scenarios with different parameter combinations
const testScenarios = [
  {
    name: "Jämna lag (Equal teams)",
    xgParams: {
      homeXG: 1.5,
      awayXG: 1.5,
      homeDefensiveRating: 1.0,
      awayDefensiveRating: 1.0,
      homeFormFactor: 1.0,
      weatherConditions: 1.0,
      motivationFactor: 1.0,
      headToHeadFactor: 1.0
    },
    poissonParams: {
      homeAttackRate: 1.5,
      awayAttackRate: 1.5,
      homeDefenseRate: 1.0,
      awayDefenseRate: 1.0
    },
    monteCarloParams: {
      simulations: 10000,
      homeGoalsAvg: 1.5,
      awayGoalsAvg: 1.5,
      homeDefenseStrength: 1.0,
      awayDefenseStrength: 1.0
    }
  },
  {
    name: "Stark hemmafördeI (Strong home advantage)",
    xgParams: {
      homeXG: 2.5,
      awayXG: 1.0,
      homeDefensiveRating: 0.8,
      awayDefensiveRating: 1.2,
      homeFormFactor: 1.2,
      weatherConditions: 1.0,
      motivationFactor: 1.1,
      headToHeadFactor: 1.2
    },
    poissonParams: {
      homeAttackRate: 2.5,
      awayAttackRate: 1.0,
      homeDefenseRate: 0.8,
      awayDefenseRate: 1.2
    },
    monteCarloParams: {
      simulations: 10000,
      homeGoalsAvg: 2.5,
      awayGoalsAvg: 1.0,
      homeDefenseStrength: 0.8,
      awayDefenseStrength: 1.2
    }
  },
  {
    name: "Defensiv match (Defensive match)",
    xgParams: {
      homeXG: 0.8,
      awayXG: 0.6,
      homeDefensiveRating: 1.3,
      awayDefensiveRating: 1.4,
      homeFormFactor: 0.9,
      weatherConditions: 0.9,
      motivationFactor: 0.95,
      headToHeadFactor: 1.0
    },
    poissonParams: {
      homeAttackRate: 0.8,
      awayAttackRate: 0.6,
      homeDefenseRate: 1.3,
      awayDefenseRate: 1.4
    },
    monteCarloParams: {
      simulations: 10000,
      homeGoalsAvg: 0.8,
      awayGoalsAvg: 0.6,
      homeDefenseStrength: 1.3,
      awayDefenseStrength: 1.4
    }
  },
  {
    name: "Målrik match (High-scoring match)",
    xgParams: {
      homeXG: 3.2,
      awayXG: 2.8,
      homeDefensiveRating: 0.7,
      awayDefensiveRating: 0.8,
      homeFormFactor: 1.3,
      weatherConditions: 1.1,
      motivationFactor: 1.2,
      headToHeadFactor: 1.1
    },
    poissonParams: {
      homeAttackRate: 3.2,
      awayAttackRate: 2.8,
      homeDefenseRate: 0.7,
      awayDefenseRate: 0.8
    },
    monteCarloParams: {
      simulations: 10000,
      homeGoalsAvg: 3.2,
      awayGoalsAvg: 2.8,
      homeDefenseStrength: 0.7,
      awayDefenseStrength: 0.8
    }
  },
  {
    name: "Extrema värden (Extreme values)",
    xgParams: {
      homeXG: 5.0,
      awayXG: 0.2,
      homeDefensiveRating: 0.3,
      awayDefensiveRating: 2.0,
      homeFormFactor: 1.5,
      weatherConditions: 1.2,
      motivationFactor: 1.3,
      headToHeadFactor: 1.5
    },
    poissonParams: {
      homeAttackRate: 5.0,
      awayAttackRate: 0.2,
      homeDefenseRate: 0.3,
      awayDefenseRate: 2.0
    },
    monteCarloParams: {
      simulations: 10000,
      homeGoalsAvg: 5.0,
      awayGoalsAvg: 0.2,
      homeDefenseStrength: 0.3,
      awayDefenseStrength: 2.0
    }
  }
];

// Test results storage
const testResults = [];
const issues = [];

// Helper function to validate probabilities
function validateProbabilities(result, methodName, scenarioName) {
  const homeWin = parseFloat(result.homeWinProbability || result.homeWin || 0);
  const draw = parseFloat(result.drawProbability || result.draw || 0);
  const awayWin = parseFloat(result.awayWinProbability || result.awayWin || 0);
  
  const total = homeWin + draw + awayWin;
  const tolerance = 0.1; // Allow 0.1% tolerance
  
  const validationResult = {
    method: methodName,
    scenario: scenarioName,
    homeWin: homeWin.toFixed(1),
    draw: draw.toFixed(1),
    awayWin: awayWin.toFixed(1),
    total: total.toFixed(1),
    valid: Math.abs(total - 100) <= tolerance,
    drawRealistic: draw >= 5.0 // Draw should be at least 5% in most scenarios
  };
  
  if (!validationResult.valid) {
    issues.push(`${methodName} - ${scenarioName}: Sannolikheter summerar till ${total.toFixed(1)}% istället för 100%`);
  }
  
  if (!validationResult.drawRealistic && scenarioName !== "Extrema värden") {
    issues.push(`${methodName} - ${scenarioName}: Oavgjort sannolikhet (${draw.toFixed(1)}%) verkar orealistiskt låg`);
  }
  
  return validationResult;
}

// Run comprehensive tests
export function runComprehensiveTests() {
  console.log('🧪 Startar omfattande tester av beräkningsmetoder...');
  
  testScenarios.forEach((scenario, index) => {
    console.log(`\n📊 Testar scenario ${index + 1}: ${scenario.name}`);
    
    try {
      // Test xG calculations
      const xgResult = calculateAdvancedXGPrediction(scenario.xgParams);
      const xgValidation = validateProbabilities(xgResult, 'xG', scenario.name);
      testResults.push(xgValidation);
      
      // Test Poisson calculations
      const poissonResult = enhancedPoissonCalculator.calculate(scenario.poissonParams);
      const poissonValidation = validateProbabilities(poissonResult, 'Poisson', scenario.name);
      testResults.push(poissonValidation);
      
      // Test Monte Carlo simulations
      const monteCarloResult = monteCarloSimulator.simulate(scenario.monteCarloParams);
      const monteCarloValidation = validateProbabilities(monteCarloResult, 'Monte Carlo', scenario.name);
      testResults.push(monteCarloValidation);
      
      console.log(`✅ xG: H${xgValidation.homeWin}% D${xgValidation.draw}% A${xgValidation.awayWin}%`);
      console.log(`✅ Poisson: H${poissonValidation.homeWin}% D${poissonValidation.draw}% A${poissonValidation.awayWin}%`);
      console.log(`✅ Monte Carlo: H${monteCarloValidation.homeWin}% D${monteCarloValidation.draw}% A${monteCarloValidation.awayWin}%`);
      
    } catch (error) {
      issues.push(`Fel vid beräkning av scenario "${scenario.name}": ${error.message}`);
      console.error(`❌ Fel i scenario ${scenario.name}:`, error);
    }
  });
  
  // Generate test report
  generateTestReport();
  
  return {
    results: testResults,
    issues: issues,
    summary: {
      totalTests: testResults.length,
      validTests: testResults.filter(r => r.valid).length,
      realisticDraws: testResults.filter(r => r.drawRealistic).length,
      issuesFound: issues.length
    }
  };
}

function generateTestReport() {
  console.log('\n📋 TESTRAPPORT');
  console.log('================');
  
  const validTests = testResults.filter(r => r.valid).length;
  const realisticDraws = testResults.filter(r => r.drawRealistic).length;
  
  console.log(`Totalt antal tester: ${testResults.length}`);
  console.log(`Giltiga sannolikheter: ${validTests}/${testResults.length}`);
  console.log(`Realistiska oavgjort: ${realisticDraws}/${testResults.length}`);
  console.log(`Identifierade problem: ${issues.length}`);
  
  if (issues.length > 0) {
    console.log('\n🚨 IDENTIFIERADE PROBLEM:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  } else {
    console.log('\n✅ Inga problem identifierade!');
  }
  
  console.log('\n📊 DETALJERADE RESULTAT:');
  testResults.forEach(result => {
    const status = result.valid ? '✅' : '❌';
    const drawStatus = result.drawRealistic ? '✅' : '⚠️';
    console.log(`${status} ${result.method} - ${result.scenario}: H${result.homeWin}% D${result.draw}% A${result.awayWin}% (Total: ${result.total}%) ${drawStatus}`);
  });
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runComprehensiveTests = runComprehensiveTests;
  console.log('🔧 Testerna är tillgängliga! Kör: runComprehensiveTests()');
}

export default { runComprehensiveTests, testScenarios, validateProbabilities };