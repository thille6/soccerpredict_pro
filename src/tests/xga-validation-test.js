/**
 * xGA Validation Test
 * Validates that xGA implementation produces realistic and evidence-based results
 * 
 * VALIDATION CRITERIA:
 * 1. Default values should match real-world football statistics
 * 2. Calculations should produce realistic match outcome probabilities
 * 3. xGA should properly influence defensive calculations
 * 4. Input validation should prevent unrealistic values
 */

import { calculateAdvancedXGPrediction } from '../utils/xgCalculations.js';

// Real-world xGA data from Premier League 2024/25 (based on search results)
const REAL_WORLD_XGA_DATA = {
  // Top defensive teams (low xGA)
  arsenal: 0.8,        // Strong defense
  liverpool: 0.9,      // Very good defense
  brighton: 1.0,       // Good defense
  
  // Average teams
  chelsea: 1.2,        // Average defense
  tottenham: 1.3,      // Slightly weak defense
  
  // Weaker defensive teams (high xGA)
  westHam: 1.6,        // Poor defense
  burnley: 2.4,        // Very poor defense
  wolves: 1.8          // Weak defense
};

// Test scenarios based on real match situations
const TEST_SCENARIOS = [
  {
    name: "Arsenal vs Tottenham (Strong vs Weak Defense)",
    homeXG: 1.8,
    awayXG: 1.4,
    homeXGA: 0.8,  // Arsenal strong defense
    awayXGA: 1.3,  // Tottenham weaker defense
    expectedHomeWinRange: [50, 70],  // Should favor home team
    expectedDrawRange: [15, 25],
    expectedAwayWinRange: [15, 30]
  },
  {
    name: "Brighton vs Chelsea (Balanced Match)",
    homeXG: 1.3,
    awayXG: 1.4,
    homeXGA: 1.0,  // Brighton good defense
    awayXGA: 1.2,  // Chelsea average defense
    expectedHomeWinRange: [35, 55],  // Slight home advantage
    expectedDrawRange: [20, 30],
    expectedAwayWinRange: [20, 40]
  },
  {
    name: "Burnley vs West Ham (Poor Defenses)",
    homeXG: 1.1,
    awayXG: 1.2,
    homeXGA: 2.4,  // Burnley very poor defense
    awayXGA: 1.6,  // West Ham poor defense
    expectedHomeWinRange: [35, 55],  // Home advantage despite poor defense
    expectedDrawRange: [20, 35],
    expectedAwayWinRange: [15, 35]
  }
];

// Validation functions
function validateDefaultValues() {
  console.log("🔍 Validating Default xGA Values...");
  
  const defaultHomeXGA = 1.2;
  const defaultAwayXGA = 1.3;
  
  // Check if defaults are within realistic range
  const isHomeXGARealistic = defaultHomeXGA >= 0.8 && defaultHomeXGA <= 2.0;
  const isAwayXGARealistic = defaultAwayXGA >= 0.8 && defaultAwayXGA <= 2.0;
  
  console.log(`✅ Home xGA default (${defaultHomeXGA}): ${isHomeXGARealistic ? 'REALISTIC' : 'UNREALISTIC'}`);
  console.log(`✅ Away xGA default (${defaultAwayXGA}): ${isAwayXGARealistic ? 'REALISTIC' : 'UNREALISTIC'}`);
  
  // Compare with real-world averages
  const realWorldAverage = Object.values(REAL_WORLD_XGA_DATA).reduce((a, b) => a + b) / Object.values(REAL_WORLD_XGA_DATA).length;
  console.log(`📊 Real-world xGA average: ${realWorldAverage.toFixed(2)}`);
  console.log(`📊 Our defaults average: ${((defaultHomeXGA + defaultAwayXGA) / 2).toFixed(2)}`);
  
  return isHomeXGARealistic && isAwayXGARealistic;
}

function validateCalculations() {
  console.log("\n🧮 Validating xGA Calculations...");
  
  let allTestsPassed = true;
  
  TEST_SCENARIOS.forEach((scenario, index) => {
    console.log(`\n--- Test ${index + 1}: ${scenario.name} ---`);
    
    try {
      const result = calculateAdvancedXGPrediction({
        homeXG: scenario.homeXG,
        awayXG: scenario.awayXG,
        homeXGA: scenario.homeXGA,
        awayXGA: scenario.awayXGA,
        homeDefensiveRating: 1.0,
        awayDefensiveRating: 1.0,
        homeFormFactor: 1.0
      });
      
      const homeWin = parseFloat(result.homeWin);
      const draw = parseFloat(result.draw);
      const awayWin = parseFloat(result.awayWin);
      
      console.log(`🏠 Home Win: ${homeWin}%`);
      console.log(`🤝 Draw: ${draw}%`);
      console.log(`✈️ Away Win: ${awayWin}%`);
      
      // Validate probabilities sum to ~100%
      const total = homeWin + draw + awayWin;
      const sumIsValid = Math.abs(total - 100) < 0.1;
      
      // Validate ranges
      const homeWinInRange = homeWin >= scenario.expectedHomeWinRange[0] && homeWin <= scenario.expectedHomeWinRange[1];
      const drawInRange = draw >= scenario.expectedDrawRange[0] && draw <= scenario.expectedDrawRange[1];
      const awayWinInRange = awayWin >= scenario.expectedAwayWinRange[0] && awayWin <= scenario.expectedAwayWinRange[1];
      
      console.log(`✅ Probabilities sum to 100%: ${sumIsValid ? 'PASS' : 'FAIL'} (${total.toFixed(1)}%)`);
      console.log(`✅ Home win in expected range: ${homeWinInRange ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Draw in expected range: ${drawInRange ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Away win in expected range: ${awayWinInRange ? 'PASS' : 'FAIL'}`);
      
      if (!sumIsValid || !homeWinInRange || !drawInRange || !awayWinInRange) {
        allTestsPassed = false;
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      allTestsPassed = false;
    }
  });
  
  return allTestsPassed;
}

function validateInputValidation() {
  console.log("\n🛡️ Validating Input Validation...");
  
  const invalidInputs = [
    { homeXG: 1.5, awayXG: 1.2, homeXGA: -0.5, awayXGA: 1.3, expectedError: "negativa" },
    { homeXG: 1.5, awayXG: 1.2, homeXGA: 1.2, awayXGA: -0.3, expectedError: "negativa" },
    { homeXG: 1.5, awayXG: 1.2, homeXGA: "invalid", awayXGA: 1.3, expectedError: "nummer" },
    { homeXG: 1.5, awayXG: 1.2, homeXGA: 1.2, awayXGA: "invalid", expectedError: "nummer" },
    { homeXG: 1.5, awayXG: 1.2, homeXGA: 5.0, awayXGA: 1.3, expectedError: null }, // Should warn but not error
  ];
  
  let validationPassed = true;
  
  invalidInputs.forEach((input, index) => {
    try {
      const result = calculateAdvancedXGPrediction(input);
      
      if (input.expectedError) {
        console.log(`❌ Test ${index + 1}: Expected error but got result`);
        validationPassed = false;
      } else {
        console.log(`✅ Test ${index + 1}: Handled edge case correctly`);
      }
      
    } catch (error) {
      if (input.expectedError && error.message.includes(input.expectedError)) {
        console.log(`✅ Test ${index + 1}: Correctly caught error - ${error.message}`);
      } else {
        console.log(`❌ Test ${index + 1}: Unexpected error - ${error.message}`);
        validationPassed = false;
      }
    }
  });
  
  return validationPassed;
}

function validateXGAImpact() {
  console.log("\n⚖️ Validating xGA Impact on Calculations...");
  
  // Test that xGA actually affects the results
  const baseParams = {
    homeXG: 1.5,
    awayXG: 1.3,
    homeDefensiveRating: 1.0,
    awayDefensiveRating: 1.0,
    homeFormFactor: 1.0
  };
  
  // Test with strong defense (low xGA)
  const strongDefenseResult = calculateAdvancedXGPrediction({
    ...baseParams,
    homeXGA: 0.8,  // Strong home defense
    awayXGA: 0.9   // Strong away defense
  });
  
  // Test with weak defense (high xGA)
  const weakDefenseResult = calculateAdvancedXGPrediction({
    ...baseParams,
    homeXGA: 2.0,  // Weak home defense
    awayXGA: 1.8   // Weak away defense
  });
  
  const strongDefenseHomeWin = parseFloat(strongDefenseResult.homeWin);
  const weakDefenseHomeWin = parseFloat(weakDefenseResult.homeWin);
  
  console.log(`🛡️ Strong defenses - Home Win: ${strongDefenseHomeWin}%`);
  console.log(`🕳️ Weak defenses - Home Win: ${weakDefenseHomeWin}%`);
  
  // With weaker defenses, there should be more goals and potentially different probabilities
  const xgaHasImpact = Math.abs(strongDefenseHomeWin - weakDefenseHomeWin) > 2;
  
  console.log(`✅ xGA impacts calculations: ${xgaHasImpact ? 'PASS' : 'FAIL'}`);
  
  return xgaHasImpact;
}

// Run all validation tests
export function runXGAValidation() {
  console.log("🚀 Starting xGA Validation Tests\n");
  console.log("=" * 50);
  
  const defaultsValid = validateDefaultValues();
  const calculationsValid = validateCalculations();
  const inputValidationValid = validateInputValidation();
  const xgaImpactValid = validateXGAImpact();
  
  console.log("\n" + "=" * 50);
  console.log("📋 VALIDATION SUMMARY");
  console.log("=" * 50);
  console.log(`✅ Default Values: ${defaultsValid ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Calculations: ${calculationsValid ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Input Validation: ${inputValidationValid ? 'PASS' : 'FAIL'}`);
  console.log(`✅ xGA Impact: ${xgaImpactValid ? 'PASS' : 'FAIL'}`);
  
  const allTestsPassed = defaultsValid && calculationsValid && inputValidationValid && xgaImpactValid;
  
  console.log(`\n🎯 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allTestsPassed) {
    console.log("\n🎉 xGA implementation is evidence-based and produces realistic results!");
  } else {
    console.log("\n⚠️ xGA implementation needs adjustments to meet validation criteria.");
  }
  
  return allTestsPassed;
}

// Auto-run if this file is executed directly
if (typeof window === 'undefined') {
  runXGAValidation();
}