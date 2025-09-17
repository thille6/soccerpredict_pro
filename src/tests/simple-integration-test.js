// Enkelt test för att visa att de tre modellerna fungerar tillsammans utan konflikter
import { calculateAdvancedXGPrediction } from '../utils/xgCalculations.js';
import { enhancedPoissonCalculator, monteCarloSimulator } from '../utils/improvedMath.js';

console.log('🔄 ENKEL INTEGRATIONSTEST');
console.log('Visar att xG, Poisson och Monte Carlo modellerna fungerar tillsammans utan konflikter');
console.log('='.repeat(80));

// Testparametrar
const testInput = {
  homeXG: 2.1,
  awayXG: 1.4,
  homeXGA: 1.0,
  awayXGA: 1.3
};

console.log('📊 TESTPARAMETRAR:');
console.log(`   Hemma xG: ${testInput.homeXG}`);
console.log(`   Borta xG: ${testInput.awayXG}`);
console.log(`   Hemma xGA: ${testInput.homeXGA}`);
console.log(`   Borta xGA: ${testInput.awayXGA}`);
console.log('');

try {
  // Test 1: xG-modell
  console.log('🧮 TESTAR XG-MODELL...');
  const xgResult = calculateAdvancedXGPrediction(testInput);
  console.log(`✅ xG Resultat: Hemma ${xgResult.homeWin}%, Oavgjort ${xgResult.draw}%, Borta ${xgResult.awayWin}%`);
  
  // Test 2: Poisson-modell
  console.log('🧮 TESTAR POISSON-MODELL...');
  const poissonResult = enhancedPoissonCalculator.calculate({
    homeAttackRate: testInput.homeXG,
    awayAttackRate: testInput.awayXG,
    homeDefenseRate: testInput.homeXGA,
    awayDefenseRate: testInput.awayXGA
  });
  console.log(`✅ Poisson Resultat: Hemma ${poissonResult.homeWinProbability}%, Oavgjort ${poissonResult.drawProbability}%, Borta ${poissonResult.awayWinProbability}%`);
  
  // Test 3: Monte Carlo-modell
  console.log('🧮 TESTAR MONTE CARLO-MODELL...');
  const monteCarloResult = monteCarloSimulator.simulate({
    simulations: 5000,
    homeGoalsAvg: testInput.homeXG,
    awayGoalsAvg: testInput.awayXG,
    homeDefenseStrength: testInput.homeXGA,
    awayDefenseStrength: testInput.awayXGA
  });
  console.log(`✅ Monte Carlo Resultat: Hemma ${monteCarloResult.homeWinProbability}%, Oavgjort ${monteCarloResult.drawProbability}%, Borta ${monteCarloResult.awayWinProbability}%`);
  
  console.log('');
  console.log('📊 JÄMFÖRELSE AV RESULTAT:');
  console.log('─'.repeat(60));
  console.log('Modell        | Hemma  | Oavgjort | Borta  | Total');
  console.log('─'.repeat(60));
  
  const xgHome = parseFloat(xgResult.homeWin);
  const xgDraw = parseFloat(xgResult.draw);
  const xgAway = parseFloat(xgResult.awayWin);
  const xgTotal = xgHome + xgDraw + xgAway;
  
  const poissonHome = parseFloat(poissonResult.homeWinProbability);
  const poissonDraw = parseFloat(poissonResult.drawProbability);
  const poissonAway = parseFloat(poissonResult.awayWinProbability);
  const poissonTotal = poissonHome + poissonDraw + poissonAway;
  
  const mcHome = parseFloat(monteCarloResult.homeWinProbability);
  const mcDraw = parseFloat(monteCarloResult.drawProbability);
  const mcAway = parseFloat(monteCarloResult.awayWinProbability);
  const mcTotal = mcHome + mcDraw + mcAway;
  
  console.log(`xG            | ${xgHome.toFixed(1).padStart(5)}% | ${xgDraw.toFixed(1).padStart(7)}% | ${xgAway.toFixed(1).padStart(5)}% | ${xgTotal.toFixed(1)}%`);
  console.log(`Poisson       | ${poissonHome.toFixed(1).padStart(5)}% | ${poissonDraw.toFixed(1).padStart(7)}% | ${poissonAway.toFixed(1).padStart(5)}% | ${poissonTotal.toFixed(1)}%`);
  console.log(`Monte Carlo   | ${mcHome.toFixed(1).padStart(5)}% | ${mcDraw.toFixed(1).padStart(7)}% | ${mcAway.toFixed(1).padStart(5)}% | ${mcTotal.toFixed(1)}%`);
  
  console.log('');
  console.log('🔍 VALIDERING AV RESULTAT:');
  console.log('─'.repeat(40));
  
  // Kontrollera matematisk konsistens
  let allValid = true;
  
  if (Math.abs(xgTotal - 100) > 1) {
    console.log(`❌ xG-modell: Totalen är ${xgTotal.toFixed(1)}% (ska vara ~100%)`);
    allValid = false;
  } else {
    console.log(`✅ xG-modell: Matematiskt konsistent (${xgTotal.toFixed(1)}%)`);
  }
  
  if (Math.abs(poissonTotal - 100) > 1) {
    console.log(`❌ Poisson-modell: Totalen är ${poissonTotal.toFixed(1)}% (ska vara ~100%)`);
    allValid = false;
  } else {
    console.log(`✅ Poisson-modell: Matematiskt konsistent (${poissonTotal.toFixed(1)}%)`);
  }
  
  if (Math.abs(mcTotal - 100) > 1) {
    console.log(`❌ Monte Carlo-modell: Totalen är ${mcTotal.toFixed(1)}% (ska vara ~100%)`);
    allValid = false;
  } else {
    console.log(`✅ Monte Carlo-modell: Matematiskt konsistent (${mcTotal.toFixed(1)}%)`);
  }
  
  // Kontrollera att modellerna ger rimliga resultat
  const homeWinValues = [xgHome, poissonHome, mcHome];
  const maxHomeWinDiff = Math.max(...homeWinValues) - Math.min(...homeWinValues);
  
  if (maxHomeWinDiff > 25) {
    console.log(`⚠️  Stor skillnad mellan modellerna för hemmavinst: ${maxHomeWinDiff.toFixed(1)}%`);
  } else {
    console.log(`✅ Modellerna är relativt konsekventa (max skillnad: ${maxHomeWinDiff.toFixed(1)}%)`);
  }
  
  // Kontrollera att alla värden är rimliga
  const allValues = [xgHome, xgDraw, xgAway, poissonHome, poissonDraw, poissonAway, mcHome, mcDraw, mcAway];
  const hasInvalidValues = allValues.some(val => isNaN(val) || val < 0 || val > 100);
  
  if (hasInvalidValues) {
    console.log(`❌ Ogiltiga värden upptäckta`);
    allValid = false;
  } else {
    console.log(`✅ Alla sannolikheter är inom giltiga intervall (0-100%)`);
  }
  
  console.log('');
  console.log('🏆 SLUTRESULTAT:');
  console.log('='.repeat(40));
  
  if (allValid) {
    console.log('✅ ALLA TESTER GODKÄNDA!');
    console.log('De tre modellerna (xG, Poisson, Monte Carlo) fungerar perfekt tillsammans.');
    console.log('Inga konflikter eller fel upptäcktes.');
    console.log('Alla beräkningar är matematiskt konsekventa och realistiska.');
  } else {
    console.log('❌ PROBLEM UPPTÄCKTA!');
    console.log('En eller flera modeller har problem som behöver åtgärdas.');
  }
  
} catch (error) {
  console.log('💥 KRITISKT FEL:');
  console.log(`   ${error.message}`);
  console.log('   Modellerna kan inte köras tillsammans på grund av tekniska problem.');
}

console.log('');
console.log('🔄 ENKEL INTEGRATIONSTEST SLUTFÖRT');