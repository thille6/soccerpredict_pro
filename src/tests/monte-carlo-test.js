// Test för Monte Carlo-simuleringar med olika antal simuleringar
import { MonteCarloSimulator } from '../utils/improvedMath.js';

const monteCarloSimulator = new MonteCarloSimulator();

const testScenario = {
  homeGoalsAvg: 1.8,
  awayGoalsAvg: 1.2,
  homeDefenseStrength: 0.9,
  awayDefenseStrength: 1.1
};

const simulationCounts = [1000, 5000, 10000, 25000, 50000, 100000];

export async function runMonteCarloTests() {
  console.log('🎲 MONTE CARLO SIMULERINGSTEST');
  console.log('==============================');
  console.log(`Testscenario: Hemma ${testScenario.homeGoalsAvg} mål, Borta ${testScenario.awayGoalsAvg} mål`);
  console.log('');

  const results = [];
  
  for (const simCount of simulationCounts) {
    const startTime = Date.now();
    
    const result = monteCarloSimulator.simulate({
      ...testScenario,
      simulations: simCount
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const homeWin = parseFloat(result.homeWinProbability);
    const draw = parseFloat(result.drawProbability);
    const awayWin = parseFloat(result.awayWinProbability);
    const total = homeWin + draw + awayWin;
    
    results.push({
      simulations: simCount,
      homeWin: homeWin.toFixed(1),
      draw: draw.toFixed(1),
      awayWin: awayWin.toFixed(1),
      total: total.toFixed(1),
      duration,
      confidence: typeof result.confidence === 'number' ? result.confidence.toFixed(2) : 'N/A'
    });
    
    console.log(`📊 ${simCount.toLocaleString()} simuleringar:`);
    console.log(`   Resultat: H${homeWin.toFixed(1)}% D${draw.toFixed(1)}% A${awayWin.toFixed(1)}%`);
    console.log(`   Total: ${total.toFixed(1)}% | Tid: ${duration}ms | Konfidensgrad: ${typeof result.confidence === 'number' ? result.confidence.toFixed(2) : 'N/A'}`);
    console.log('');
  }
  
  // Analysera stabilitet
  console.log('📈 STABILITETSANALYS');
  console.log('====================');
  
  const baseResult = results[0]; // 1000 simuleringar som bas
  const finalResult = results[results.length - 1]; // 100000 simuleringar som referens
  
  for (let i = 1; i < results.length; i++) {
    const current = results[i];
    const homeDiff = Math.abs(parseFloat(current.homeWin) - parseFloat(finalResult.homeWin));
    const drawDiff = Math.abs(parseFloat(current.draw) - parseFloat(finalResult.draw));
    const awayDiff = Math.abs(parseFloat(current.awayWin) - parseFloat(finalResult.awayWin));
    const maxDiff = Math.max(homeDiff, drawDiff, awayDiff);
    
    const stability = maxDiff < 1.0 ? '✅ Stabil' : maxDiff < 2.0 ? '⚠️ Måttlig' : '❌ Instabil';
    
    console.log(`${current.simulations.toLocaleString()} sim: Max avvikelse ${maxDiff.toFixed(1)}% ${stability}`);
  }
  
  // Prestanda-analys
  console.log('');
  console.log('⚡ PRESTANDAANALYS');
  console.log('==================');
  
  results.forEach(result => {
    const simPerMs = result.simulations / result.duration;
    const efficiency = simPerMs > 100 ? '✅ Snabb' : simPerMs > 50 ? '⚠️ Måttlig' : '❌ Långsam';
    console.log(`${result.simulations.toLocaleString()} sim: ${result.duration}ms (${simPerMs.toFixed(0)} sim/ms) ${efficiency}`);
  });
  
  // Rekommendationer
  console.log('');
  console.log('💡 REKOMMENDATIONER');
  console.log('===================');
  
  const optimalSim = results.find(r => {
    const maxDiff = Math.max(
      Math.abs(parseFloat(r.homeWin) - parseFloat(finalResult.homeWin)),
      Math.abs(parseFloat(r.draw) - parseFloat(finalResult.draw)),
      Math.abs(parseFloat(r.awayWin) - parseFloat(finalResult.awayWin))
    );
    return maxDiff < 1.0 && r.duration < 100; // Stabil och snabb
  });
  
  if (optimalSim) {
    console.log(`✅ Optimal inställning: ${optimalSim.simulations.toLocaleString()} simuleringar`);
    console.log(`   Ger stabil noggrannhet (±1%) på ${optimalSim.duration}ms`);
  } else {
    console.log('⚠️ Ingen optimal inställning hittad inom testparametrarna');
  }
  
  return results;
}

// Kör testet om filen körs direkt
if (import.meta.url === `file://${process.argv[1]}`) {
  runMonteCarloTests();
}