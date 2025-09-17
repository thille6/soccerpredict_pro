/**
 * Omfattande hårdtest för SoccerPredict Pro
 * Testar alla beräkningar och resultatpresentationer för realism och funktionalitet
 */

import { calculateAdvancedXGPrediction } from '../utils/xgCalculations.js';
import { EnhancedPoissonCalculator } from '../utils/improvedMath.js';
import { MonteCarloSimulator } from '../utils/improvedMath.js';

console.log('🔥 STARTAR OMFATTANDE HÅRDTEST AV SOCCERPREDICT PRO 🔥\n');

// Test utilities
const assertBetween = (value, min, max, description) => {
  if (value < min || value > max) {
    throw new Error(`${description}: ${value} är inte mellan ${min} och ${max}`);
  }
};

const assertApproximatelyEqual = (actual, expected, tolerance, description) => {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${description}: ${actual} är inte ungefär ${expected} (tolerans: ${tolerance})`);
  }
};

// Realistiska testscenarier baserade på verkliga lag
const realisticScenarios = [
  {
    name: "Manchester City vs Brighton (Stark favorit)",
    homeTeam: "Manchester City",
    awayTeam: "Brighton",
    homeAttack: 2.8,
    homeDefense: 0.6,
    awayAttack: 1.2,
    awayDefense: 1.3,
    expectedHomeWin: 70,
    expectedDraw: 20,
    expectedAwayWin: 10
  },
  {
    name: "Arsenal vs Chelsea (Jämn match)",
    homeTeam: "Arsenal", 
    awayTeam: "Chelsea",
    homeAttack: 2.1,
    homeDefense: 0.9,
    awayAttack: 1.9,
    awayDefense: 1.0,
    expectedHomeWin: 45,
    expectedDraw: 30,
    expectedAwayWin: 25
  },
  {
    name: "Burnley vs Liverpool (Underdog hemma)",
    homeTeam: "Burnley",
    awayTeam: "Liverpool", 
    homeAttack: 1.0,
    homeDefense: 1.4,
    awayAttack: 2.5,
    awayDefense: 0.8,
    expectedHomeWin: 15,
    expectedDraw: 25,
    expectedAwayWin: 60
  },
  {
    name: "Real Madrid vs Barcelona (El Clasico)",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeAttack: 2.6,
    homeDefense: 0.8,
    awayAttack: 2.4,
    awayDefense: 0.9,
    expectedHomeWin: 40,
    expectedDraw: 25,
    expectedAwayWin: 35
  }
];

// Extrema testfall
const extremeScenarios = [
  {
    name: "Extremt stark hemmalag",
    homeAttack: 5.0,
    homeDefense: 0.1,
    awayAttack: 0.5,
    awayDefense: 2.0
  },
  {
    name: "Extremt defensiv match",
    homeAttack: 0.3,
    homeDefense: 2.5,
    awayAttack: 0.2,
    awayDefense: 2.8
  },
  {
    name: "Målrikt scenario",
    homeAttack: 4.0,
    homeDefense: 1.8,
    awayAttack: 3.5,
    awayDefense: 1.9
  }
];

// 1. HÅRDTEST AV XG-BERÄKNINGAR
console.log('📊 TESTAR XG-BERÄKNINGAR MED REALISTISKA SCENARIER\n');

const testXGCalculations = () => {
  let passedTests = 0;
  let totalTests = 0;

  realisticScenarios.forEach(scenario => {
    totalTests++;
    console.log(`🏟️  Testar: ${scenario.name}`);
    
    try {
      const result = calculateAdvancedXGPrediction({
        homeAttackStrength: scenario.homeAttack,
        homeDefenseStrength: scenario.homeDefense,
        awayAttackStrength: scenario.awayAttack,
        awayDefenseStrength: scenario.awayDefense,
        homeAdvantage: 0.3,
        leagueAverage: 1.35
      });

      // Kontrollera att alla värden finns
      if (!result.homeWin || !result.draw || !result.awayWin) {
        throw new Error('Saknade sannolikhetsvärden');
      }

      const homeWin = parseFloat(result.homeWin);
      const draw = parseFloat(result.draw);
      const awayWin = parseFloat(result.awayWin);

      // Kontrollera att sannolikheter är realistiska
      assertBetween(homeWin, 0, 100, 'Hemmavinst sannolikhet');
      assertBetween(draw, 0, 100, 'Oavgjort sannolikhet');
      assertBetween(awayWin, 0, 100, 'Bortavinst sannolikhet');

      // Kontrollera att summan är ungefär 100%
      const total = homeWin + draw + awayWin;
      assertApproximatelyEqual(total, 100, 2.0, 'Total sannolikhet');

      // Kontrollera att resultatet är rimligt jämfört med förväntningar
      const homeWinTolerance = 15; // 15% tolerans
      if (Math.abs(homeWin - scenario.expectedHomeWin) > homeWinTolerance) {
        console.warn(`⚠️  Hemmavinst ${homeWin}% avviker från förväntat ${scenario.expectedHomeWin}%`);
      }

      console.log(`   ✅ Hemma: ${homeWin.toFixed(1)}%, Oavgjort: ${draw.toFixed(1)}%, Borta: ${awayWin.toFixed(1)}%`);
      passedTests++;

    } catch (error) {
      console.error(`   ❌ Fel: ${error.message}`);
    }
  });

  console.log(`\n📈 XG-test resultat: ${passedTests}/${totalTests} tester godkända\n`);
  return passedTests === totalTests;
};

// 2. HÅRDTEST AV POISSON-BERÄKNINGAR
console.log('🎲 TESTAR POISSON-BERÄKNINGAR\n');

const testPoissonCalculations = () => {
  const poissonCalc = new EnhancedPoissonCalculator();
  let passedTests = 0;
  let totalTests = 0;

  realisticScenarios.forEach(scenario => {
    totalTests++;
    console.log(`🏟️  Testar Poisson: ${scenario.name}`);
    
    try {
      const result = poissonCalc.calculateMatchProbabilities({
        homeGoalsAvg: scenario.homeAttack,
        awayGoalsAvg: scenario.awayAttack,
        homeAdvantage: 0.3
      });

      const homeWin = parseFloat(result.homeWinProbability);
      const draw = parseFloat(result.drawProbability);
      const awayWin = parseFloat(result.awayWinProbability);

      // Kontrollera sannolikheter
      assertBetween(homeWin, 0, 100, 'Poisson hemmavinst');
      assertBetween(draw, 0, 100, 'Poisson oavgjort');
      assertBetween(awayWin, 0, 100, 'Poisson bortavinst');

      // Kontrollera summa
      const total = homeWin + draw + awayWin;
      assertApproximatelyEqual(total, 100, 1.0, 'Poisson total sannolikhet');

      console.log(`   ✅ Hemma: ${homeWin.toFixed(1)}%, Oavgjort: ${draw.toFixed(1)}%, Borta: ${awayWin.toFixed(1)}%`);
      passedTests++;

    } catch (error) {
      console.error(`   ❌ Poisson fel: ${error.message}`);
    }
  });

  console.log(`\n📊 Poisson-test resultat: ${passedTests}/${totalTests} tester godkända\n`);
  return passedTests === totalTests;
};

// 3. HÅRDTEST AV MONTE CARLO-SIMULERINGAR
console.log('🎰 TESTAR MONTE CARLO-SIMULERINGAR\n');

const testMonteCarloSimulations = () => {
  const monteCarloSim = new MonteCarloSimulator();
  let passedTests = 0;
  let totalTests = 0;

  realisticScenarios.forEach(scenario => {
    totalTests++;
    console.log(`🏟️  Testar Monte Carlo: ${scenario.name}`);
    
    try {
      const result = monteCarloSim.simulate({
        simulations: 10000,
        homeGoalsAvg: scenario.homeAttack,
        awayGoalsAvg: scenario.awayAttack,
        homeDefenseStrength: scenario.homeDefense,
        awayDefenseStrength: scenario.awayDefense
      });

      const homeWin = parseFloat(result.homeWinProbability);
      const draw = parseFloat(result.drawProbability);
      const awayWin = parseFloat(result.awayWinProbability);

      // Kontrollera sannolikheter
      assertBetween(homeWin, 0, 100, 'Monte Carlo hemmavinst');
      assertBetween(draw, 0, 100, 'Monte Carlo oavgjort');
      assertBetween(awayWin, 0, 100, 'Monte Carlo bortavinst');

      // Kontrollera summa
      const total = homeWin + draw + awayWin;
      assertApproximatelyEqual(total, 100, 2.0, 'Monte Carlo total sannolikhet');

      console.log(`   ✅ Hemma: ${homeWin.toFixed(1)}%, Oavgjort: ${draw.toFixed(1)}%, Borta: ${awayWin.toFixed(1)}%`);
      passedTests++;

    } catch (error) {
      console.error(`   ❌ Monte Carlo fel: ${error.message}`);
    }
  });

  console.log(`\n🎲 Monte Carlo-test resultat: ${passedTests}/${totalTests} tester godkända\n`);
  return passedTests === totalTests;
};

// 4. TEST AV EXTREMFALL
console.log('⚡ TESTAR EXTREMFALL OCH ROBUSTHET\n');

const testExtremeScenarios = () => {
  let passedTests = 0;
  let totalTests = 0;

  extremeScenarios.forEach(scenario => {
    totalTests++;
    console.log(`🔥 Testar extremfall: ${scenario.name}`);
    
    try {
      const xgResult = calculateAdvancedXGPrediction({
        homeAttackStrength: scenario.homeAttack,
        homeDefenseStrength: scenario.homeDefense,
        awayAttackStrength: scenario.awayAttack,
        awayDefenseStrength: scenario.awayDefense,
        homeAdvantage: 0.3,
        leagueAverage: 1.35
      });

      // Kontrollera att extrema värden hanteras korrekt
      const homeWin = parseFloat(xgResult.homeWin);
      const draw = parseFloat(xgResult.draw);
      const awayWin = parseFloat(xgResult.awayWin);

      assertBetween(homeWin, 0, 100, 'Extremfall hemmavinst');
      assertBetween(draw, 0, 100, 'Extremfall oavgjort');
      assertBetween(awayWin, 0, 100, 'Extremfall bortavinst');

      const total = homeWin + draw + awayWin;
      assertApproximatelyEqual(total, 100, 3.0, 'Extremfall total');

      console.log(`   ✅ Hemma: ${homeWin.toFixed(1)}%, Oavgjort: ${draw.toFixed(1)}%, Borta: ${awayWin.toFixed(1)}%`);
      passedTests++;

    } catch (error) {
      console.error(`   ❌ Extremfall fel: ${error.message}`);
    }
  });

  console.log(`\n⚡ Extremfall-test resultat: ${passedTests}/${totalTests} tester godkända\n`);
  return passedTests === totalTests;
};

// 5. KONSISTENSTEST MELLAN METODER
console.log('🔄 TESTAR KONSISTENS MELLAN METODER\n');

const testMethodConsistency = () => {
  let passedTests = 0;
  let totalTests = 0;

  const testScenario = {
    homeAttack: 2.0,
    homeDefense: 1.0,
    awayAttack: 1.5,
    awayDefense: 1.1
  };

  totalTests++;
  console.log('🔍 Testar konsistens mellan alla tre metoder...');

  try {
    // Kör alla tre metoder
    const xgResult = calculateAdvancedXGPrediction({
      homeAttackStrength: testScenario.homeAttack,
      homeDefenseStrength: testScenario.homeDefense,
      awayAttackStrength: testScenario.awayAttack,
      awayDefenseStrength: testScenario.awayDefense,
      homeAdvantage: 0.3,
      leagueAverage: 1.35
    });

    const poissonCalc = new EnhancedPoissonCalculator();
    const poissonResult = poissonCalc.calculateMatchProbabilities({
      homeGoalsAvg: testScenario.homeAttack,
      awayGoalsAvg: testScenario.awayAttack,
      homeAdvantage: 0.3
    });

    const monteCarloSim = new MonteCarloSimulator();
    const mcResult = monteCarloSim.simulate({
      simulations: 10000,
      homeGoalsAvg: testScenario.homeAttack,
      awayGoalsAvg: testScenario.awayAttack,
      homeDefenseStrength: testScenario.homeDefense,
      awayDefenseStrength: testScenario.awayDefense
    });

    // Jämför resultaten
    const xgHome = parseFloat(xgResult.homeWin);
    const poissonHome = parseFloat(poissonResult.homeWinProbability);
    const mcHome = parseFloat(mcResult.homeWinProbability);

    console.log(`   📊 xG Hemmavinst: ${xgHome.toFixed(1)}%`);
    console.log(`   📊 Poisson Hemmavinst: ${poissonHome.toFixed(1)}%`);
    console.log(`   📊 Monte Carlo Hemmavinst: ${mcHome.toFixed(1)}%`);

    // Kontrollera att metoderna ger rimligt liknande resultat (inom 20%)
    const maxDiff = Math.max(
      Math.abs(xgHome - poissonHome),
      Math.abs(xgHome - mcHome),
      Math.abs(poissonHome - mcHome)
    );

    if (maxDiff > 20) {
      console.warn(`⚠️  Stor skillnad mellan metoder: ${maxDiff.toFixed(1)}%`);
    } else {
      console.log(`   ✅ Metoderna är konsistenta (max skillnad: ${maxDiff.toFixed(1)}%)`);
      passedTests++;
    }

  } catch (error) {
    console.error(`   ❌ Konsistenstest fel: ${error.message}`);
  }

  console.log(`\n🔄 Konsistenstest resultat: ${passedTests}/${totalTests} tester godkända\n`);
  return passedTests === totalTests;
};

// KÖR ALLA TESTER
const runAllTests = async () => {
  console.log('🚀 STARTAR FULLSTÄNDIG HÅRDTESTNING...\n');
  
  const results = {
    xg: testXGCalculations(),
    poisson: testPoissonCalculations(),
    monteCarlo: testMonteCarloSimulations(),
    extremes: testExtremeScenarios(),
    consistency: testMethodConsistency()
  };

  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log('🏆 SLUTRESULTAT AV HÅRDTESTNING:');
  console.log('=====================================');
  console.log(`✅ xG-beräkningar: ${results.xg ? 'GODKÄND' : 'MISSLYCKAD'}`);
  console.log(`✅ Poisson-beräkningar: ${results.poisson ? 'GODKÄND' : 'MISSLYCKAD'}`);
  console.log(`✅ Monte Carlo-simuleringar: ${results.monteCarlo ? 'GODKÄND' : 'MISSLYCKAD'}`);
  console.log(`✅ Extremfall-hantering: ${results.extremes ? 'GODKÄND' : 'MISSLYCKAD'}`);
  console.log(`✅ Metodkonsistens: ${results.consistency ? 'GODKÄND' : 'MISSLYCKAD'}`);
  console.log('=====================================');
  console.log(`🎯 TOTALT RESULTAT: ${totalPassed}/${totalTests} testområden godkända`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 ALLA TESTER GODKÄNDA! Applikationen är redo för produktion.');
  } else {
    console.log('⚠️  VISSA TESTER MISSLYCKADES. Granskning krävs.');
  }

  return totalPassed === totalTests;
};

// Exportera för användning i andra tester
export { runAllTests, testXGCalculations, testPoissonCalculations, testMonteCarloSimulations };

// Kör tester om filen körs direkt
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}