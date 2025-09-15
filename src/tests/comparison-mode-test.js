// Test för jämförelseläget - kontrollerar att alla tre metoder beräknas samtidigt
import { calculateAdvancedXGPrediction } from '../utils/xgCalculations.js';
import { enhancedPoissonCalculator } from '../utils/improvedMath.js';
import { monteCarloSimulator } from '../utils/improvedMath.js';

const testParams = {
  xgParams: {
    homeXG: 2.0,
    awayXG: 1.5,
    homeDefensiveRating: 0.9,
    awayDefensiveRating: 1.1,
    homeFormFactor: 1.1,
    weatherConditions: 1.0,
    motivationFactor: 1.0,
    headToHeadFactor: 1.0
  },
  poissonParams: {
    homeAttackRate: 2.0,
    awayAttackRate: 1.5,
    homeDefenseRate: 0.9,
    awayDefenseRate: 1.1
  },
  monteCarloParams: {
    simulations: 10000,
    homeGoalsAvg: 2.0,
    awayGoalsAvg: 1.5,
    homeDefenseStrength: 0.9,
    awayDefenseStrength: 1.1
  }
};

function validateResult(result, methodName) {
  const errors = [];
  
  // Normalisera egenskapsnamn (xG använder kortare namn)
  const normalizedResult = {
    homeWinProbability: result.homeWinProbability || result.homeWin,
    drawProbability: result.drawProbability || result.draw,
    awayWinProbability: result.awayWinProbability || result.awayWin
  };
  
  // Kontrollera att alla nödvändiga egenskaper finns
  const requiredProps = ['homeWinProbability', 'drawProbability', 'awayWinProbability'];
  
  for (const prop of requiredProps) {
    if (!normalizedResult[prop]) {
      errors.push(`${methodName}: Saknar egenskap för ${prop}`);
      continue;
    }
    
    const value = parseFloat(normalizedResult[prop]);
    if (isNaN(value) || value < 0 || value > 100) {
      errors.push(`${methodName}: Ogiltig sannolikhet för '${prop}': ${normalizedResult[prop]}`);
    }
  }
  
  // Kontrollera att sannolikheterna summerar till ungefär 100%
  if (errors.length === 0) {
    const total = parseFloat(normalizedResult.homeWinProbability) + 
                  parseFloat(normalizedResult.drawProbability) + 
                  parseFloat(normalizedResult.awayWinProbability);
    
    if (Math.abs(total - 100) > 1.0) {
      errors.push(`${methodName}: Sannolikheter summerar till ${total.toFixed(1)}% istället för 100%`);
    }
  }
  
  return errors;
}

function compareResults(xgResult, poissonResult, monteCarloResult) {
  const comparisons = [];
  
  // Normalisera resultat
  const xg = {
    homeWin: parseFloat(xgResult.homeWin || xgResult.homeWinProbability),
    draw: parseFloat(xgResult.draw || xgResult.drawProbability),
    awayWin: parseFloat(xgResult.awayWin || xgResult.awayWinProbability)
  };
  
  const poisson = {
    homeWin: parseFloat(poissonResult.homeWinProbability),
    draw: parseFloat(poissonResult.drawProbability),
    awayWin: parseFloat(poissonResult.awayWinProbability)
  };
  
  const monteCarlo = {
    homeWin: parseFloat(monteCarloResult.homeWinProbability),
    draw: parseFloat(monteCarloResult.drawProbability),
    awayWin: parseFloat(monteCarloResult.awayWinProbability)
  };
  
  // Jämför hemmavinst-sannolikheter
  const homeWinDiffs = [
    Math.abs(xg.homeWin - poisson.homeWin),
    Math.abs(xg.homeWin - monteCarlo.homeWin),
    Math.abs(poisson.homeWin - monteCarlo.homeWin)
  ];
  
  const maxHomeWinDiff = Math.max(...homeWinDiffs);
  
  // Jämför oavgjort-sannolikheter
  const drawDiffs = [
    Math.abs(xg.draw - poisson.draw),
    Math.abs(xg.draw - monteCarlo.draw),
    Math.abs(poisson.draw - monteCarlo.draw)
  ];
  
  const maxDrawDiff = Math.max(...drawDiffs);
  
  // Jämför bortavinst-sannolikheter
  const awayWinDiffs = [
    Math.abs(xg.awayWin - poisson.awayWin),
    Math.abs(xg.awayWin - monteCarlo.awayWin),
    Math.abs(poisson.awayWin - monteCarlo.awayWin)
  ];
  
  const maxAwayWinDiff = Math.max(...awayWinDiffs);
  
  comparisons.push({
    metric: 'Hemmavinst',
    maxDiff: maxHomeWinDiff.toFixed(1),
    status: maxHomeWinDiff < 50 ? '✅ Rimlig variation' : '⚠️ Stor variation'
  });
  
  comparisons.push({
    metric: 'Oavgjort',
    maxDiff: maxDrawDiff.toFixed(1),
    status: maxDrawDiff < 50 ? '✅ Rimlig variation' : '⚠️ Stor variation'
  });
  
  comparisons.push({
    metric: 'Bortavinst',
    maxDiff: maxAwayWinDiff.toFixed(1),
    status: maxAwayWinDiff < 50 ? '✅ Rimlig variation' : '⚠️ Stor variation'
  });
  
  return comparisons;
}

export async function runComparisonModeTest() {
  console.log('🔄 JÄMFÖRELSELÄGE TEST');
  console.log('======================');
  console.log('Testar att alla tre metoder fungerar samtidigt med samma parametrar\n');
  
  const results = {};
  const errors = [];
  
  try {
    // Testa xG-beräkning
    console.log('📊 Testar xG-beräkning...');
    const startXG = Date.now();
    results.xg = calculateAdvancedXGPrediction(testParams.xgParams);
    const xgTime = Date.now() - startXG;
    
    const xgErrors = validateResult(results.xg, 'xG');
    errors.push(...xgErrors);
    
    if (xgErrors.length === 0) {
      const homeWin = results.xg.homeWin || results.xg.homeWinProbability;
      const draw = results.xg.draw || results.xg.drawProbability;
      const awayWin = results.xg.awayWin || results.xg.awayWinProbability;
      console.log(`✅ xG: H${homeWin}% D${draw}% A${awayWin}% (${xgTime}ms)`);
    } else {
      console.log(`❌ xG: ${xgErrors.join(', ')}`);
    }
    
  } catch (error) {
    const errorMsg = `xG-beräkning misslyckades: ${error.message}`;
    errors.push(errorMsg);
    console.log(`❌ ${errorMsg}`);
  }
  
  try {
    // Testa Poisson-beräkning
    console.log('📊 Testar Poisson-beräkning...');
    const startPoisson = Date.now();
    results.poisson = enhancedPoissonCalculator.calculate(testParams.poissonParams);
    const poissonTime = Date.now() - startPoisson;
    
    const poissonErrors = validateResult(results.poisson, 'Poisson');
    errors.push(...poissonErrors);
    
    if (poissonErrors.length === 0) {
      console.log(`✅ Poisson: H${results.poisson.homeWinProbability}% D${results.poisson.drawProbability}% A${results.poisson.awayWinProbability}% (${poissonTime}ms)`);
    } else {
      console.log(`❌ Poisson: ${poissonErrors.join(', ')}`);
    }
    
  } catch (error) {
    const errorMsg = `Poisson-beräkning misslyckades: ${error.message}`;
    errors.push(errorMsg);
    console.log(`❌ ${errorMsg}`);
  }
  
  try {
    // Testa Monte Carlo-simulering
    console.log('📊 Testar Monte Carlo-simulering...');
    const startMC = Date.now();
    results.monteCarlo = monteCarloSimulator.simulate(testParams.monteCarloParams);
    const mcTime = Date.now() - startMC;
    
    const mcErrors = validateResult(results.monteCarlo, 'Monte Carlo');
    errors.push(...mcErrors);
    
    if (mcErrors.length === 0) {
      console.log(`✅ Monte Carlo: H${results.monteCarlo.homeWinProbability}% D${results.monteCarlo.drawProbability}% A${results.monteCarlo.awayWinProbability}% (${mcTime}ms)`);
    } else {
      console.log(`❌ Monte Carlo: ${mcErrors.join(', ')}`);
    }
    
  } catch (error) {
    const errorMsg = `Monte Carlo-simulering misslyckades: ${error.message}`;
    errors.push(errorMsg);
    console.log(`❌ ${errorMsg}`);
  }
  
  console.log('');
  
  // Jämför resultaten om alla metoder fungerade
  if (results.xg && results.poisson && results.monteCarlo && errors.length === 0) {
    console.log('📈 RESULTATJÄMFÖRELSE');
    console.log('====================');
    
    const comparisons = compareResults(results.xg, results.poisson, results.monteCarlo);
    
    comparisons.forEach(comp => {
      console.log(`${comp.metric}: Max skillnad ${comp.maxDiff}% ${comp.status}`);
    });
    
    console.log('');
    console.log('📋 DETALJERAD JÄMFÖRELSE');
    console.log('========================');
    const xgHome = results.xg.homeWin || results.xg.homeWinProbability;
    const xgDraw = results.xg.draw || results.xg.drawProbability;
    const xgAway = results.xg.awayWin || results.xg.awayWinProbability;
    
    console.log(`xG:          H${xgHome}% D${xgDraw}% A${xgAway}%`);
    console.log(`Poisson:     H${results.poisson.homeWinProbability}% D${results.poisson.drawProbability}% A${results.poisson.awayWinProbability}%`);
    console.log(`Monte Carlo: H${results.monteCarlo.homeWinProbability}% D${results.monteCarlo.drawProbability}% A${results.monteCarlo.awayWinProbability}%`);
  }
  
  // Sammanfattning
  console.log('');
  console.log('📋 TESTSAMMANFATTNING');
  console.log('=====================');
  
  const successfulMethods = Object.keys(results).length;
  const totalMethods = 3;
  
  console.log(`Fungerande metoder: ${successfulMethods}/${totalMethods}`);
  console.log(`Totala fel: ${errors.length}`);
  
  if (errors.length === 0) {
    console.log('✅ Alla metoder fungerar korrekt i jämförelseläge!');
  } else {
    console.log('❌ Problem identifierade:');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  return {
    success: errors.length === 0,
    results,
    errors,
    methodsWorking: successfulMethods
  };
}

// Kör testet om filen körs direkt
if (import.meta.url === `file://${process.argv[1]}`) {
  runComparisonModeTest();
}