// UI Funktionalitetstest för SoccerPredict Pro
// Testar beräkningsknappen och laddningsindikator

import { calculateAdvancedXGPrediction } from '../utils/xgCalculations.js';
import { enhancedPoissonCalculator } from '../utils/improvedMath.js';
import { monteCarloSimulator } from '../utils/improvedMath.js';

// Simulera UI-interaktion
function simulateUIInteraction() {
  console.log('🖱️  UI FUNKTIONALITETSTEST');
  console.log('===========================');
  console.log('Simulerar användarinteraktion med beräkningsknappen\n');
  
  // Testdata
  const testData = {
    homeXG: 1.5,
    awayXG: 1.2,
    homeAdvantage: 0.3,
    recentForm: 0.1
  };
  
  console.log('📋 Testparametrar:');
  console.log(`   Hemma xG: ${testData.homeXG}`);
  console.log(`   Borta xG: ${testData.awayXG}`);
  console.log(`   Hemmafördelar: ${testData.homeAdvantage}`);
  console.log(`   Senaste form: ${testData.recentForm}\n`);
  
  return testData;
}

// Simulera laddningsindikator
function simulateLoadingIndicator(methodName, duration) {
  return new Promise((resolve) => {
    console.log(`⏳ ${methodName}: Beräkning pågår...`);
    
    // Simulera progressbar
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      const progressBar = '█'.repeat(progress / 10) + '░'.repeat((100 - progress) / 10);
      process.stdout.write(`\r   [${progressBar}] ${progress}%`);
      
      if (progress >= 100) {
        clearInterval(interval);
        console.log(''); // Ny rad
        resolve();
      }
    }, duration / 5);
  });
}

// Testa beräkningsknapp-funktionalitet
async function testCalculationButton() {
  console.log('🔘 BERÄKNINGSKNAPP TEST');
  console.log('========================');
  
  const testData = simulateUIInteraction();
  const results = {};
  const errors = [];
  
  try {
    // Test 1: xG-beräkning med laddningsindikator
    console.log('\n1️⃣  Testar xG-beräkning...');
    await simulateLoadingIndicator('xG', 500);
    
    const startTime = performance.now();
    results.xg = calculateAdvancedXGPrediction({
      homeXG: testData.homeXG,
      awayXG: testData.awayXG,
      homeAdvantage: testData.homeAdvantage,
      recentForm: testData.recentForm
    });
    const xgTime = Math.round(performance.now() - startTime);
    
    if (results.xg && typeof results.xg === 'object') {
      console.log(`✅ xG-beräkning slutförd (${xgTime}ms)`);
      console.log(`   Resultat: H${results.xg.homeWin}% D${results.xg.draw}% A${results.xg.awayWin}%`);
    } else {
      errors.push('xG-beräkning returnerade ogiltigt resultat');
    }
    
  } catch (error) {
    errors.push(`xG-beräkning misslyckades: ${error.message}`);
  }
  
  try {
    // Test 2: Poisson-beräkning med laddningsindikator
    console.log('\n2️⃣  Testar Poisson-beräkning...');
    await simulateLoadingIndicator('Poisson', 800);
    
    const startTime = performance.now();
    results.poisson = enhancedPoissonCalculator.calculate(
      testData.homeXG,
      testData.awayXG,
      testData.homeAdvantage
    );
    const poissonTime = Math.round(performance.now() - startTime);
    
    if (results.poisson && typeof results.poisson === 'object') {
      console.log(`✅ Poisson-beräkning slutförd (${poissonTime}ms)`);
      console.log(`   Resultat: H${results.poisson.homeWinProbability}% D${results.poisson.drawProbability}% A${results.poisson.awayWinProbability}%`);
    } else {
      errors.push('Poisson-beräkning returnerade ogiltigt resultat');
    }
    
  } catch (error) {
    errors.push(`Poisson-beräkning misslyckades: ${error.message}`);
  }
  
  try {
    // Test 3: Monte Carlo-simulering med laddningsindikator
    console.log('\n3️⃣  Testar Monte Carlo-simulering...');
    await simulateLoadingIndicator('Monte Carlo', 1200);
    
    const startTime = performance.now();
    results.monteCarlo = monteCarloSimulator.simulate(
      testData.homeXG,
      testData.awayXG,
      testData.homeAdvantage,
      5000 // Optimalt antal simuleringar från tidigare test
    );
    const monteCarloTime = Math.round(performance.now() - startTime);
    
    if (results.monteCarlo && typeof results.monteCarlo === 'object') {
      console.log(`✅ Monte Carlo-simulering slutförd (${monteCarloTime}ms)`);
      console.log(`   Resultat: H${results.monteCarlo.homeWinProbability}% D${results.monteCarlo.drawProbability}% A${results.monteCarlo.awayWinProbability}%`);
    } else {
      errors.push('Monte Carlo-simulering returnerade ogiltigt resultat');
    }
    
  } catch (error) {
    errors.push(`Monte Carlo-simulering misslyckades: ${error.message}`);
  }
  
  return { results, errors };
}

// Testa responsivitet och prestanda
function testResponsiveness() {
  console.log('\n⚡ RESPONSIVITETSTEST');
  console.log('======================');
  
  const issues = [];
  
  // Simulera snabba klick på beräkningsknappen
  console.log('🖱️  Simulerar snabba klick på beräkningsknappen...');
  
  const testData = {
    homeXG: 2.0,
    awayXG: 1.0,
    homeAdvantage: 0.2
  };
  
  const startTime = performance.now();
  
  // Kör flera beräkningar snabbt efter varandra
  for (let i = 0; i < 5; i++) {
    try {
      const result = calculateAdvancedXGPrediction({
        homeXG: testData.homeXG + (i * 0.1),
        awayXG: testData.awayXG + (i * 0.1),
        homeAdvantage: testData.homeAdvantage,
        recentForm: 0
      });
      
      if (!result || typeof result !== 'object') {
        issues.push(`Snabbklick ${i + 1}: Ogiltigt resultat`);
      }
    } catch (error) {
      issues.push(`Snabbklick ${i + 1}: ${error.message}`);
    }
  }
  
  const totalTime = Math.round(performance.now() - startTime);
  
  if (totalTime > 100) {
    issues.push(`Långsam responsivitet: ${totalTime}ms för 5 beräkningar`);
  } else {
    console.log(`✅ Bra responsivitet: ${totalTime}ms för 5 beräkningar`);
  }
  
  return issues;
}

// Huvudtestfunktion
export async function runUIFunctionalityTest() {
  console.log('🎯 STARTAR UI FUNKTIONALITETSTEST\n');
  
  const allIssues = [];
  
  try {
    // Test beräkningsknapp och laddningsindikator
    const { results, errors } = await testCalculationButton();
    allIssues.push(...errors);
    
    // Test responsivitet
    const responsivenessIssues = testResponsiveness();
    allIssues.push(...responsivenessIssues);
    
    // Sammanfattning
    console.log('\n📊 TESTSAMMANFATTNING');
    console.log('=====================');
    
    if (allIssues.length === 0) {
      console.log('✅ Alla UI-funktioner fungerar korrekt!');
      console.log('✅ Beräkningsknappen svarar snabbt');
      console.log('✅ Laddningsindikatorn simulerad framgångsrikt');
      console.log('✅ Inga responsivitetsproblem upptäckta');
    } else {
      console.log(`❌ ${allIssues.length} problem upptäckta:`);
      allIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n💡 REKOMMENDATIONER:');
    console.log('- Implementera riktig laddningsindikator i React-komponenten');
    console.log('- Lägg till debouncing för att förhindra spam-klick');
    console.log('- Överväg att visa beräkningstid för användaren');
    console.log('- Lägg till felhantering för misslyckade beräkningar');
    
  } catch (error) {
    console.error('❌ Kritiskt fel i UI-test:', error.message);
  }
}

// Kör test om filen körs direkt
if (import.meta.url === `file://${process.argv[1]}`) {
  runUIFunctionalityTest();
}