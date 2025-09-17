// Omfattande test för extremfall och felhantering
import { calculateAdvancedXGPrediction } from '../utils/xgCalculations.js';

console.log('🧪 STARTAR EXTREMFALL OCH ROBUSTHETSTEST');
console.log('==========================================');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const errors = [];

function runTest(testName, testFunction) {
  totalTests++;
  console.log(`\n🔬 TEST: ${testName}`);
  console.log('─'.repeat(50));
  
  try {
    const result = testFunction();
    console.log(`📊 Resultat:`, result);
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

function validateResult(result, testName) {
  if (!result || typeof result.homeWin !== 'string') {
    return { success: false, message: "Inget giltigt resultat returnerat" };
  }
  
  const homeWin = parseFloat(result.homeWin);
  const draw = parseFloat(result.draw);
  const awayWin = parseFloat(result.awayWin);
  const total = homeWin + draw + awayWin;
  
  if (isNaN(homeWin) || isNaN(draw) || isNaN(awayWin)) {
    return { success: false, message: "Ogiltiga sannolikhetsvärden (NaN)" };
  }
  
  if (Math.abs(total - 100) > 1) {
    return { success: false, message: `Sannolikheter summerar till ${total.toFixed(1)}% istället för 100%` };
  }
  
  if (homeWin < 0 || homeWin > 100 || draw < 0 || draw > 100 || awayWin < 0 || awayWin > 100) {
    return { success: false, message: `Sannolikheter utanför giltigt intervall: H:${homeWin}%, O:${draw}%, B:${awayWin}%` };
  }
  
  return { success: true, homeWin, draw, awayWin, total };
}

// Test 1: Extremt höga xG-värden
runTest("Extremt höga xG-värden", () => {
  const result = calculateAdvancedXGPrediction({
    homeXG: 10.0,
    awayXG: 8.5,
    homeXGA: 0.1,
    awayXGA: 0.2
  });
  
  const validation = validateResult(result, "Extremt höga xG-värden");
  if (!validation.success) return validation;
  
  return { success: true, message: `Hemmavinst: ${validation.homeWin.toFixed(1)}%, Total: ${validation.total.toFixed(1)}%` };
});

// Test 2: Extremt låga xG-värden
runTest("Extremt låga xG-värden", () => {
  const result = calculateAdvancedXGPrediction({
    homeXG: 0.01,
    awayXG: 0.02,
    homeXGA: 3.0,
    awayXGA: 2.8
  });

  const validation = validateResult(result, "Extremt låga xG-värden");
  if (!validation.success) return validation;
  
  // Vid extremt låga xG borde oavgjort vara vanligast
  if (validation.draw < 30) {
    return { success: false, message: `Oavgjort-sannolikhet för låg vid låga xG: ${validation.draw.toFixed(1)}%` };
  }
  
  return { success: true, message: `Oavgjort: ${validation.draw.toFixed(1)}%, Total: ${validation.total.toFixed(1)}%` };
});

// Test 3: Negativa värden (ska kasta fel)
runTest("Negativa xG-värden", () => {
  try {
    const result = calculateAdvancedXGPrediction({
      homeXG: -1.0,
      awayXG: 2.0,
      homeXGA: 1.0,
      awayXGA: 1.0
    });
    return { success: false, message: "Negativa värden borde kasta fel" };
  } catch (error) {
    return { success: true, message: `Negativa värden kastade fel som förväntat: ${error.message}` };
  }
});

// Test 4: Noll-värden
runTest("Noll xG-värden", () => {
  const result = calculateAdvancedXGPrediction({
    homeXG: 0,
    awayXG: 0,
    homeXGA: 1.0,
    awayXGA: 1.0
  });
  
  const validation = validateResult(result, "Noll xG-värden");
  if (!validation.success) return validation;
  
  // Vid 0-0 xG borde oavgjort dominera
  if (validation.draw < 50) {
    return { success: false, message: `Oavgjort-sannolikhet för låg vid 0-0 xG: ${validation.draw.toFixed(1)}%` };
  }
  
  return { success: true, message: `Oavgjort dominerar som förväntat: ${validation.draw.toFixed(1)}%` };
});

// Test 5: Mycket ojämna styrkeförhållanden
runTest("Extremt ojämna styrkeförhållanden", () => {
  const result = calculateAdvancedXGPrediction({
    homeXG: 5.0,
    awayXG: 0.1,
    homeXGA: 0.1,
    awayXGA: 3.0
  });
  
  const validation = validateResult(result, "Extremt ojämna styrkeförhållanden");
  if (!validation.success) return validation;
  
  // Hemmalaget borde ha överväldigande fördel
  if (validation.homeWin < 80) {
    return { success: false, message: `Hemmavinst-sannolikhet för låg vid extrema styrkeförhållanden: ${validation.homeWin.toFixed(1)}%` };
  }
  
  return { success: true, message: `Stark favorit korrekt identifierad: ${validation.homeWin.toFixed(1)}% hemmavinst` };
});

// Test 6: Felaktiga datatyper
runTest("Felaktiga datatyper", () => {
  try {
    const result = calculateAdvancedXGPrediction({
      homeXG: "2.0",
      awayXG: "1.5",
      homeXGA: "1.0",
      awayXGA: "1.2"
    });
    return { success: false, message: "String-värden borde kasta fel" };
  } catch (error) {
    return { success: true, message: `String-värden kastade fel som förväntat: ${error.message}` };
  }
});

// Test 7: Undefined/null värden
runTest("Undefined/null värden", () => {
  try {
    const result = calculateAdvancedXGPrediction({
      homeXG: undefined,
      awayXG: null,
      homeXGA: 1.0,
      awayXGA: 1.0
    });
    return { success: false, message: "Undefined/null värden borde kasta fel" };
  } catch (error) {
    return { success: true, message: `Undefined/null värden kastade fel korrekt: ${error.message}` };
  }
});

// Test 8: Mycket stora tal (infinity)
runTest("Infinity-värden", () => {
  try {
    const result = calculateAdvancedXGPrediction({
      homeXG: Infinity,
      awayXG: 2.0,
      homeXGA: 1.0,
      awayXGA: 1.0
    });
    return { success: false, message: "Infinity-värden borde kasta fel eller hanteras" };
  } catch (error) {
    return { success: true, message: `Infinity-värden kastade fel som förväntat: ${error.message}` };
  }
});

// Test 9: NaN-värden
runTest("NaN-värden", () => {
  try {
    const result = calculateAdvancedXGPrediction({
      homeXG: NaN,
      awayXG: 2.0,
      homeXGA: 1.0,
      awayXGA: 1.0
    });
    return { success: false, message: "NaN-värden borde kasta fel" };
  } catch (error) {
    return { success: true, message: `NaN-värden kastade fel korrekt: ${error.message}` };
  }
});

// Test 10: Konsistens över flera körningar
runTest("Konsistens över flera körningar", () => {
  const runs = [];
  const testParams = {
    homeXG: 2.1,
    awayXG: 1.8,
    homeXGA: 0.9,
    awayXGA: 1.1
  };
  
  for (let i = 0; i < 5; i++) {
    const result = calculateAdvancedXGPrediction(testParams);
    const validation = validateResult(result, "Konsistens");
    if (!validation.success) {
      return { success: false, message: `Körning ${i+1} misslyckades: ${validation.message}` };
    }
    runs.push(validation.homeWin);
  }
  
  // Alla körningar borde ge samma resultat (deterministisk)
  const allSame = runs.every(val => Math.abs(val - runs[0]) < 0.01);
  
  if (allSame) {
    return { success: true, message: `Konsistent resultat över 5 körningar: ${runs[0].toFixed(1)}%` };
  } else {
    return { success: false, message: `Inkonsistenta resultat: ${runs.map(r => r.toFixed(1)).join(', ')}%` };
  }
});

// Sammanfattning
console.log('\n' + '='.repeat(60));
console.log('📊 SAMMANFATTNING AV ROBUSTHETSTEST');
console.log('='.repeat(60));
console.log(`🧪 Totalt antal tester: ${totalTests}`);
console.log(`✅ Godkända tester: ${passedTests}`);
console.log(`❌ Misslyckade tester: ${failedTests}`);
console.log(`📈 Framgångsgrad: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (errors.length > 0) {
  console.log('\n❌ FELRAPPORT:');
  errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error}`);
  });
}

if (passedTests === totalTests) {
  console.log('\n🏆 ALLA ROBUSTHETSTESTER GODKÄNDA!');
  console.log('Applikationen hanterar extremfall och fel korrekt.');
} else if (passedTests / totalTests >= 0.8) {
  console.log('\n✅ ROBUSTHETSTESTER MESTADELS GODKÄNDA');
  console.log('Applikationen är robust men kan förbättras.');
} else {
  console.log('\n⚠️  ROBUSTHETSTESTER VISAR PROBLEM');
  console.log('Applikationen behöver förbättringar för extremfall.');
}

console.log('\n🔬 ROBUSTHETSTEST SLUTFÖRT');