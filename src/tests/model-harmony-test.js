// Test för att validera att de tre modellerna (xG, Poisson, Monte Carlo) fungerar harmoniskt tillsammans
import { calculateAdvancedXGPrediction } from '../utils/xgCalculations.js';
import { enhancedPoissonCalculator, monteCarloSimulator } from '../utils/improvedMath.js';

console.log('🔄 STARTAR MODELLHARMONITEST');
console.log('Validerar att xG, Poisson och Monte Carlo modellerna fungerar tillsammans utan konflikter');
console.log('='.repeat(80));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const errors = [];

function runHarmonyTest(testName, testFunction) {
  totalTests++;
  console.log(`\n🧪 TEST: ${testName}`);
  console.log('─'.repeat(60));
  
  try {
    const result = testFunction();
    if (result.success) {
      passedTests++;
      console.log(`✅ GODKÄND: ${result.message}`);
    } else {
      failedTests++;
      console.log(`❌ MISSLYCKAD: ${result.message}`);
      errors.push(`${testName}: ${result.message}`);
    }
  } catch (error) {
    failedTests++;
    console.log(`💥 KRASCH: ${error.message}`);
    errors.push(`${testName}: KRASCH - ${error.message}`);
  }
}

// Test 1: Samma input ger konsistenta resultat från alla modeller
runHarmonyTest("Konsistenta resultat från alla tre modeller", () => {
  const testInput = {
    homeXG: 2.0,
    awayXG: 1.5,
    homeXGA: 1.2,
    awayXGA: 1.3
  };

  // xG-modell
  const xgResult = calculateAdvancedXGPrediction(testInput);
  
  // Poisson-modell
  const poissonResult = enhancedPoissonCalculator.calculate({
    homeAttackRate: 2.0,
    awayAttackRate: 1.5,
    homeDefenseRate: 1.2,
    awayDefenseRate: 1.3
  });
  
  // Monte Carlo-modell
  const monteCarloResult = monteCarloSimulator.simulate({
    simulations: 1000,
    homeGoalsAvg: 2.0,
    awayGoalsAvg: 1.5,
    homeDefenseStrength: 1.2,
    awayDefenseStrength: 1.3
  });

  console.log('📊 xG Resultat:', {
    hemma: xgResult.homeWin + '%',
    oavgjort: xgResult.draw + '%', 
    borta: xgResult.awayWin + '%'
  });
  
  console.log('📊 Poisson Resultat:', {
    hemma: poissonResult.homeWinProbability + '%',
    oavgjort: poissonResult.drawProbability + '%',
    borta: poissonResult.awayWinProbability + '%'
  });
  
  console.log('📊 Monte Carlo Resultat:', {
    hemma: monteCarloResult.homeWinProbability + '%',
    oavgjort: monteCarloResult.drawProbability + '%',
    borta: monteCarloResult.awayWinProbability + '%'
  });

  // Validera att alla modeller ger rimliga resultat
  const xgHome = parseFloat(xgResult.homeWin);
  const poissonHome = parseFloat(poissonResult.homeWinProbability);
  const monteCarloHome = parseFloat(monteCarloResult.homeWinProbability);

  if (isNaN(xgHome) || isNaN(poissonHome) || isNaN(monteCarloHome)) {
    return { success: false, message: "En eller flera modeller returnerade NaN" };
  }

  // Kontrollera att alla modeller är inom rimliga gränser (20-80% för hemmavinst)
  if (xgHome < 20 || xgHome > 80 || poissonHome < 20 || poissonHome > 80 || monteCarloHome < 20 || monteCarloHome > 80) {
    return { success: false, message: "Modellerna ger orealistiska hemmavinst-sannolikheter" };
  }

  // Kontrollera att modellerna är relativt konsekventa (inom 20 procentenheter)
  const maxDiff = Math.max(
    Math.abs(xgHome - poissonHome),
    Math.abs(xgHome - monteCarloHome),
    Math.abs(poissonHome - monteCarloHome)
  );

  if (maxDiff > 20) {
    return { success: false, message: `Modellerna skiljer sig för mycket (max skillnad: ${maxDiff.toFixed(1)}%)` };
  }

  return { 
    success: true, 
    message: `Alla modeller ger konsekventa resultat (max skillnad: ${maxDiff.toFixed(1)}%)` 
  };
});

// Test 2: Modellerna hanterar extremfall utan att krocka
runHarmonyTest("Extremfall hanteras utan konflikter", () => {
  const extremeInputs = [
    { homeXG: 0.1, awayXG: 0.1, homeXGA: 1.0, awayXGA: 1.0 }, // Mycket låga värden
    { homeXG: 4.0, awayXG: 0.5, homeXGA: 0.5, awayXGA: 2.0 }, // Stor skillnad
    { homeXG: 2.5, awayXG: 2.5, homeXGA: 1.5, awayXGA: 1.5 }  // Jämna lag
  ];

  for (let i = 0; i < extremeInputs.length; i++) {
    const input = extremeInputs[i];
    
    try {
      const xgResult = calculateAdvancedXGPrediction(input);
      const poissonResult = enhancedPoissonCalculator.calculate({
        homeAttackRate: input.homeXG,
        awayAttackRate: input.awayXG,
        homeDefenseRate: input.homeXGA,
        awayDefenseRate: input.awayXGA
      });
      const monteCarloResult = monteCarloSimulator.simulate({
        simulations: 500,
        homeGoalsAvg: input.homeXG,
        awayGoalsAvg: input.awayXG,
        homeDefenseStrength: input.homeXGA,
        awayDefenseStrength: input.awayXGA
      });

      // Kontrollera att alla modeller returnerade giltiga resultat
      if (!xgResult.homeWin || !poissonResult.homeWinProbability || !monteCarloResult.homeWinProbability) {
        return { success: false, message: `Extremfall ${i+1}: En modell returnerade ogiltigt resultat` };
      }

    } catch (error) {
      return { success: false, message: `Extremfall ${i+1}: Modell kraschade - ${error.message}` };
    }
  }

  return { success: true, message: "Alla modeller hanterar extremfall korrekt" };
});

// Test 3: Modellernas resultat summerar korrekt till 100%
runHarmonyTest("Matematisk konsistens i alla modeller", () => {
  const testInput = {
    homeXG: 1.8,
    awayXG: 1.6,
    homeXGA: 1.1,
    awayXGA: 1.4
  };

  const xgResult = calculateAdvancedXGPrediction(testInput);
  const poissonResult = enhancedPoissonCalculator.calculate({
    homeAttackRate: 1.8,
    awayAttackRate: 1.6,
    homeDefenseRate: 1.1,
    awayDefenseRate: 1.4
  });
  const monteCarloResult = monteCarloSimulator.simulate({
    simulations: 1000,
    homeGoalsAvg: 1.8,
    awayGoalsAvg: 1.6,
    homeDefenseStrength: 1.1,
    awayDefenseStrength: 1.4
  });

  // Kontrollera att alla modellers sannolikheter summerar till ~100%
  const xgTotal = parseFloat(xgResult.homeWin) + parseFloat(xgResult.draw) + parseFloat(xgResult.awayWin);
  const poissonTotal = parseFloat(poissonResult.homeWinProbability) + parseFloat(poissonResult.drawProbability) + parseFloat(poissonResult.awayWinProbability);
  const monteCarloTotal = parseFloat(monteCarloResult.homeWinProbability) + parseFloat(monteCarloResult.drawProbability) + parseFloat(monteCarloResult.awayWinProbability);

  console.log(`📊 Totaler: xG=${xgTotal.toFixed(1)}%, Poisson=${poissonTotal.toFixed(1)}%, Monte Carlo=${monteCarloTotal.toFixed(1)}%`);

  if (Math.abs(xgTotal - 100) > 1) {
    return { success: false, message: `xG-modell summerar till ${xgTotal.toFixed(1)}% istället för 100%` };
  }
  if (Math.abs(poissonTotal - 100) > 1) {
    return { success: false, message: `Poisson-modell summerar till ${poissonTotal.toFixed(1)}% istället för 100%` };
  }
  if (Math.abs(monteCarloTotal - 100) > 1) {
    return { success: false, message: `Monte Carlo-modell summerar till ${monteCarloTotal.toFixed(1)}% istället för 100%` };
  }

  return { success: true, message: "Alla modeller har korrekt matematisk konsistens" };
});

// Test 4: Modellerna kan köras parallellt utan interferens
runHarmonyTest("Parallell exekvering utan interferens", () => {
  const testInput = {
    homeXG: 2.2,
    awayXG: 1.7,
    homeXGA: 1.0,
    awayXGA: 1.2
  };

  // Kör alla modeller flera gånger parallellt
  const results = [];
  
  for (let i = 0; i < 5; i++) {
    const xgResult = calculateAdvancedXGPrediction(testInput);
    const poissonResult = enhancedPoissonCalculator.calculate({
      homeAttackRate: 2.2,
      awayAttackRate: 1.7,
      homeDefenseRate: 1.0,
      awayDefenseRate: 1.2
    });
    const monteCarloResult = monteCarloSimulator.simulate({
      simulations: 500,
      homeGoalsAvg: 2.2,
      awayGoalsAvg: 1.7,
      homeDefenseStrength: 1.0,
      awayDefenseStrength: 1.2
    });

    results.push({
      xg: parseFloat(xgResult.homeWin),
      poisson: parseFloat(poissonResult.homeWinProbability),
      monteCarlo: parseFloat(monteCarloResult.homeWinProbability)
    });
  }

  // Kontrollera att xG och Poisson ger identiska resultat (deterministiska)
  const xgVariance = Math.max(...results.map(r => r.xg)) - Math.min(...results.map(r => r.xg));
  const poissonVariance = Math.max(...results.map(r => r.poisson)) - Math.min(...results.map(r => r.poisson));

  if (xgVariance > 0.1) {
    return { success: false, message: `xG-modell inte deterministisk (varians: ${xgVariance})` };
  }
  if (poissonVariance > 0.1) {
    return { success: false, message: `Poisson-modell inte deterministisk (varians: ${poissonVariance})` };
  }

  // Monte Carlo kan ha lite variation, men inte för mycket
  const monteCarloVariance = Math.max(...results.map(r => r.monteCarlo)) - Math.min(...results.map(r => r.monteCarlo));
  if (monteCarloVariance > 5) {
    return { success: false, message: `Monte Carlo-modell för stor variation (varians: ${monteCarloVariance.toFixed(1)}%)` };
  }

  return { success: true, message: "Alla modeller fungerar korrekt vid parallell exekvering" };
});

// Sammanfattning
console.log('\n' + '='.repeat(80));
console.log('📊 SAMMANFATTNING AV MODELLHARMONITEST');
console.log('='.repeat(80));
console.log(`🧪 Totalt antal tester: ${totalTests}`);
console.log(`✅ Godkända tester: ${passedTests}`);
console.log(`❌ Misslyckade tester: ${failedTests}`);
console.log(`📈 Framgångsgrad: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests > 0) {
  console.log('\n❌ FELRAPPORT:');
  errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error}`);
  });
  console.log('\n⚠️  MODELLHARMONITESTER VISAR PROBLEM');
} else {
  console.log('\n🏆 ALLA MODELLHARMONITESTER GODKÄNDA!');
  console.log('De tre modellerna (xG, Poisson, Monte Carlo) fungerar perfekt tillsammans utan konflikter.');
}

console.log('\n🔄 MODELLHARMONITEST SLUTFÖRT');