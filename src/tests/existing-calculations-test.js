// Test to verify existing calculations still work correctly with xGA integration
import { calculateAdvancedXGPrediction } from '../utils/xgCalculations.js';

console.log('🔍 Testing Existing Calculations Compatibility...\n');

// Test 1: Basic calculation without xGA (should use defaults)
console.log('--- Test 1: Basic Calculation (No xGA specified) ---');
try {
  const result1 = calculateAdvancedXGPrediction({
    homeXG: 1.5,
    awayXG: 1.2,
    homeDefensiveRating: 0.8,
    awayDefensiveRating: 0.9
  });
  
  console.log(`🏠 Home Win: ${result1.homeWin}%`);
  console.log(`🤝 Draw: ${result1.draw}%`);
  console.log(`✈️ Away Win: ${result1.awayWin}%`);
  
  const total = parseFloat(result1.homeWin) + parseFloat(result1.draw) + parseFloat(result1.awayWin);
  console.log(`✅ Probabilities sum: ${total.toFixed(1)}%`);
  
  if (Math.abs(total - 100) < 1) {
    console.log('✅ Basic calculation: PASS\n');
  } else {
    console.log('❌ Basic calculation: FAIL - Probabilities don\'t sum to 100%\n');
  }
} catch (error) {
  console.log(`❌ Basic calculation: FAIL - ${error.message}\n`);
}

// Test 2: Calculation with all parameters (including xGA)
console.log('--- Test 2: Full Calculation (With xGA) ---');
try {
  const result2 = calculateAdvancedXGPrediction({
    homeXG: 1.5,
    awayXG: 1.2,
    homeDefensiveRating: 0.8,
    awayDefensiveRating: 0.9,
    homeXGA: 1.0,
    awayXGA: 1.4
  });
  
  console.log(`🏠 Home Win: ${result2.homeWin}%`);
  console.log(`🤝 Draw: ${result2.draw}%`);
  console.log(`✈️ Away Win: ${result2.awayWin}%`);
  
  const total = parseFloat(result2.homeWin) + parseFloat(result2.draw) + parseFloat(result2.awayWin);
  console.log(`✅ Probabilities sum: ${total.toFixed(1)}%`);
  
  if (Math.abs(total - 100) < 1) {
    console.log('✅ Full calculation: PASS\n');
  } else {
    console.log('❌ Full calculation: FAIL - Probabilities don\'t sum to 100%\n');
  }
} catch (error) {
  console.log(`❌ Full calculation: FAIL - ${error.message}\n`);
}

// Test 3: Edge cases
console.log('--- Test 3: Edge Cases ---');
const edgeCases = [
  {
    name: "Very low xG values",
    params: { homeXG: 0.1, awayXG: 0.1, homeDefensiveRating: 1.0, awayDefensiveRating: 1.0 }
  },
  {
    name: "Very high xG values", 
    params: { homeXG: 4.0, awayXG: 3.5, homeDefensiveRating: 1.0, awayDefensiveRating: 1.0 }
  },
  {
    name: "Extreme defensive ratings",
    params: { homeXG: 1.5, awayXG: 1.2, homeDefensiveRating: 0.1, awayDefensiveRating: 2.0 }
  }
];

let edgeTestsPassed = 0;
for (const testCase of edgeCases) {
  try {
    const result = calculateAdvancedXGPrediction(testCase.params);
    const total = parseFloat(result.homeWin) + parseFloat(result.draw) + parseFloat(result.awayWin);
    
    if (Math.abs(total - 100) < 1 && 
        parseFloat(result.homeWin) >= 0 && parseFloat(result.homeWin) <= 100 &&
        parseFloat(result.draw) >= 0 && parseFloat(result.draw) <= 100 &&
        parseFloat(result.awayWin) >= 0 && parseFloat(result.awayWin) <= 100) {
      console.log(`✅ ${testCase.name}: PASS`);
      edgeTestsPassed++;
    } else {
      console.log(`❌ ${testCase.name}: FAIL - Invalid probabilities`);
    }
  } catch (error) {
    console.log(`❌ ${testCase.name}: FAIL - ${error.message}`);
  }
}

console.log(`\n📊 Edge cases passed: ${edgeTestsPassed}/${edgeCases.length}`);

// Test 4: Backward compatibility
console.log('\n--- Test 4: Backward Compatibility ---');
try {
  // Old style call (should still work)
  const oldResult = calculateAdvancedXGPrediction({
    homeXG: 1.8,
    awayXG: 1.3,
    homeDefensiveRating: 0.7,
    awayDefensiveRating: 1.1,
    homeFormFactor: 1.1,
    awayFormFactor: 0.9
  });
  
  // New style call with same base parameters
  const newResult = calculateAdvancedXGPrediction({
    homeXG: 1.8,
    awayXG: 1.3,
    homeDefensiveRating: 0.7,
    awayDefensiveRating: 1.1,
    homeFormFactor: 1.1,
    awayFormFactor: 0.9,
    homeXGA: 1.2, // defaults
    awayXGA: 1.3
  });
  
  const oldTotal = parseFloat(oldResult.homeWin) + parseFloat(oldResult.draw) + parseFloat(oldResult.awayWin);
  const newTotal = parseFloat(newResult.homeWin) + parseFloat(newResult.draw) + parseFloat(newResult.awayWin);
  
  console.log(`Old style result: ${oldResult.homeWin}% / ${oldResult.draw}% / ${oldResult.awayWin}%`);
  console.log(`New style result: ${newResult.homeWin}% / ${newResult.draw}% / ${newResult.awayWin}%`);
  
  if (Math.abs(oldTotal - 100) < 1 && Math.abs(newTotal - 100) < 1) {
    console.log('✅ Backward compatibility: PASS');
  } else {
    console.log('❌ Backward compatibility: FAIL');
  }
} catch (error) {
  console.log(`❌ Backward compatibility: FAIL - ${error.message}`);
}

console.log('\n🎯 EXISTING CALCULATIONS TEST COMPLETE');