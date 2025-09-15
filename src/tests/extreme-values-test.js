// Extremvärdestest för SoccerPredict Pro
// Testar hur systemet hanterar mycket höga/låga xG-värden

import { calculateAdvancedXGPrediction } from '../utils/xgCalculations.js';
import { enhancedPoissonCalculator } from '../utils/improvedMath.js';
import { monteCarloSimulator } from '../utils/improvedMath.js';

// Testscenarier med extrema värden
const extremeScenarios = [
  {
    name: 'Mycket låga xG-värden',
    homeXG: 0.1,
    awayXG: 0.05,
    homeAdvantage: 0.1,
    expectedIssues: ['Låg precision', 'Orimliga sannolikheter']
  },
  {
    name: 'Mycket höga xG-värden',
    homeXG: 5.0,
    awayXG: 4.8,
    homeAdvantage: 0.5,
    expectedIssues: ['Sannolikheter över 100%', 'Numerisk instabilitet']
  },
  {
    name: 'Extremt ojämna xG-värden',
    homeXG: 4.5,
    awayXG: 0.2,
    homeAdvantage: 0.3,
    expectedIssues: ['Hemmavinst nära 100%', 'Orimligt låg bortavinst']
  },
  {
    name: 'Negativa värden (felaktig input)',
    homeXG: -0.5,
    awayXG: 1.2,
    homeAdvantage: 0.2,
    expectedIssues: ['Negativa sannolikheter', 'Matematiska fel']
  },
  {
    name: 'Noll-värden',
    homeXG: 0.0,
    awayXG: 0.0,
    homeAdvantage: 0.0,
    expectedIssues: ['Division med noll', 'Odefinierade sannolikheter']
  },
  {
    name: 'Mycket högt hemmafördelar',
    homeXG: 2.0,
    awayXG: 1.5,
    homeAdvantage: 2.0,
    expectedIssues: ['Överdriven hemmafördelar', 'Obalanserade sannolikheter']
  }
];

// Validera resultat från beräkningsmetod
function validateMethodResult(result, methodName, scenario) {
  const issues = [];
  
  if (!result || typeof result !== 'object') {
    issues.push(`${methodName}: Returnerade inget giltigt resultat`);
    return issues;
  }
  
  // Normalisera egenskapsnamn
  const homeWin = parseFloat(result.homeWin || result.homeWinProbability || 0);
  const draw = parseFloat(result.draw || result.drawProbability || 0);
  const awayWin = parseFloat(result.awayWin || result.awayWinProbability || 0);
  
  // Kontrollera för NaN-värden
  if (isNaN(homeWin) || isNaN(draw) || isNaN(awayWin)) {
    issues.push(`${methodName}: Innehåller NaN-värden (H:${homeWin}, D:${draw}, A:${awayWin})`);
  }
  
  // Kontrollera för negativa värden
  if (homeWin < 0 || draw < 0 || awayWin < 0) {
    issues.push(`${methodName}: Innehåller negativa sannolikheter (H:${homeWin}, D:${draw}, A:${awayWin})`);
  }
  
  // Kontrollera för värden över 100%
  if (homeWin > 100 || draw > 100 || awayWin > 100) {
    issues.push(`${methodName}: Innehåller sannolikheter över 100% (H:${homeWin}, D:${draw}, A:${awayWin})`);
  }
  
  // Kontrollera total summa
  const total = homeWin + draw + awayWin;
  if (Math.abs(total - 100) > 5.0) {
    issues.push(`${methodName}: Sannolikheter summerar till ${total.toFixed(1)}% (avvikelse: ${Math.abs(total - 100).toFixed(1)}%)`);
  }
  
  // Kontrollera för orimliga värden
  if (total > 0) {
    if (homeWin > 95 && scenario.homeXG < 3.0) {
      issues.push(`${methodName}: Orimligt hög hemmavinst (${homeWin.toFixed(1)}%) för xG ${scenario.homeXG}`);
    }
    
    if (awayWin > 95 && scenario.awayXG < 3.0) {
      issues.push(`${methodName}: Orimligt hög bortavinst (${awayWin.toFixed(1)}%) för xG ${scenario.awayXG}`);
    }
    
    if (draw < 1 && scenario.homeXG < 2.0 && scenario.awayXG < 2.0) {
      issues.push(`${methodName}: Orimligt låg oavgjort-sannolikhet (${draw.toFixed(1)}%)`);
    }
  }
  
  return issues;
}

// Testa en enskild metod med extrema värden
function testMethod(methodName, calculateFunction, scenario) {
  const issues = [];
  let result = null;
  let executionTime = 0;
  
  try {
    const startTime = performance.now();
    result = calculateFunction(scenario);
    executionTime = Math.round(performance.now() - startTime);
    
    const validationIssues = validateMethodResult(result, methodName, scenario);
    issues.push(...validationIssues);
    
  } catch (error) {
    issues.push(`${methodName}: Kastade fel - ${error.message}`);
  }
  
  return {
    result,
    issues,
    executionTime
  };
}

// Huvudtestfunktion
export function runExtremeValuesTest() {
  console.log('🔥 EXTREMVÄRDESTEST');
  console.log('===================');
  console.log('Testar hur systemet hanterar extrema xG-värden\n');
  
  let totalIssues = 0;
  const methodResults = {};
  
  for (const scenario of extremeScenarios) {
    console.log(`📊 ${scenario.name}`);
    console.log(`   xG: H${scenario.homeXG} A${scenario.awayXG} (Hemmafördelar: ${scenario.homeAdvantage})`);
    console.log('   ' + '='.repeat(50));
    
    // Test xG-metod
    const xgTest = testMethod('xG', (s) => {
      return calculateAdvancedXGPrediction({
        homeXG: s.homeXG,
        awayXG: s.awayXG,
        homeAdvantage: s.homeAdvantage,
        recentForm: 0
      });
    }, scenario);
    
    // Test Poisson-metod
    const poissonTest = testMethod('Poisson', (s) => {
      return enhancedPoissonCalculator.calculate(
        s.homeXG,
        s.awayXG,
        s.homeAdvantage
      );
    }, scenario);
    
    // Test Monte Carlo-metod
    const monteCarloTest = testMethod('Monte Carlo', (s) => {
      return monteCarloSimulator.simulate(
        s.homeXG,
        s.awayXG,
        s.homeAdvantage,
        1000 // Färre simuleringar för snabbare test
      );
    }, scenario);
    
    // Visa resultat
    const tests = [xgTest, poissonTest, monteCarloTest];
    const methods = ['xG', 'Poisson', 'Monte Carlo'];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const methodName = methods[i];
      
      if (test.issues.length === 0) {
        const result = test.result;
        const homeWin = result.homeWin || result.homeWinProbability || 'N/A';
        const draw = result.draw || result.drawProbability || 'N/A';
        const awayWin = result.awayWin || result.awayWinProbability || 'N/A';
        
        console.log(`   ✅ ${methodName}: H${homeWin}% D${draw}% A${awayWin}% (${test.executionTime}ms)`);
      } else {
        console.log(`   ❌ ${methodName}: ${test.issues.length} problem`);
        test.issues.forEach(issue => {
          console.log(`      • ${issue}`);
        });
        totalIssues += test.issues.length;
      }
    }
    
    console.log('');
  }
  
  // Sammanfattning
  console.log('📋 EXTREMVÄRDESTEST SAMMANFATTNING');
  console.log('===================================');
  
  if (totalIssues === 0) {
    console.log('✅ Alla extrema värden hanteras korrekt!');
    console.log('✅ Inga numeriska instabiliteter upptäckta');
    console.log('✅ Alla sannolikheter är rimliga');
  } else {
    console.log(`❌ ${totalIssues} problem upptäckta med extrema värden`);
    console.log('⚠️  Systemet kan behöva förbättrad felhantering');
  }
  
  console.log('\n💡 REKOMMENDATIONER FÖR EXTREMVÄRDEN:');
  console.log('- Lägg till inputvalidering för att förhindra negativa xG-värden');
  console.log('- Implementera gränser för maximala xG-värden (t.ex. 6.0)');
  console.log('- Lägg till varningar för orimliga hemmafördelar');
  console.log('- Förbättra numerisk stabilitet för mycket låga värden');
  console.log('- Överväg att använda logaritmisk skala för extrema värden');
  
  return totalIssues;
}

// Kör test om filen körs direkt
if (import.meta.url === `file://${process.argv[1]}`) {
  runExtremeValuesTest();
}