/**
 * Test för inputvalidering
 * Testar alla valideringsfunktioner för att säkerställa korrekt felhantering
 */

import {
  validateXG,
  validateHomeAdvantage,
  validateForm,
  validateMatchPredictionParams,
  sanitizeNumericInput,
  clampValue
} from '../utils/inputValidation.js';

/**
 * Testar xG-validering
 */
function testXGValidation() {
  console.log('\n🧪 TESTAR XG-VALIDERING');
  console.log('========================');
  
  const testCases = [
    { value: 1.5, expected: true, description: 'Giltigt xG-värde' },
    { value: 0, expected: true, description: 'Noll xG-värde' },
    { value: 6, expected: true, description: 'Max xG-värde' },
    { value: -1, expected: false, description: 'Negativt xG-värde' },
    { value: 7, expected: false, description: 'För högt xG-värde' },
    { value: 'abc', expected: false, description: 'Icke-numeriskt värde' },
    { value: NaN, expected: false, description: 'NaN-värde' },
    { value: null, expected: false, description: 'Null-värde' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const result = validateXG(testCase.value, 'testlag');
    const success = result.isValid === testCase.expected;
    
    if (success) {
      console.log(`   ✅ ${testCase.description}: ${testCase.value}`);
      passed++;
    } else {
      console.log(`   ❌ ${testCase.description}: ${testCase.value} - Förväntade ${testCase.expected}, fick ${result.isValid}`);
      if (result.error) console.log(`      Fel: ${result.error}`);
      failed++;
    }
  });
  
  console.log(`\n📊 xG-validering: ${passed} lyckades, ${failed} misslyckades`);
  return { passed, failed };
}

/**
 * Testar hemmafördelvalidering
 */
function testHomeAdvantageValidation() {
  console.log('\n🧪 TESTAR HEMMAFÖRDELVALIDERING');
  console.log('===============================');
  
  const testCases = [
    { value: 0.3, expected: true, description: 'Giltig hemmafördelar' },
    { value: 0, expected: true, description: 'Ingen hemmafördelar' },
    { value: 1, expected: true, description: 'Max hemmafördelar' },
    { value: -0.1, expected: false, description: 'Negativ hemmafördelar' },
    { value: 1.5, expected: false, description: 'För hög hemmafördelar' },
    { value: 'abc', expected: false, description: 'Icke-numeriskt värde' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const result = validateHomeAdvantage(testCase.value);
    const success = result.isValid === testCase.expected;
    
    if (success) {
      console.log(`   ✅ ${testCase.description}: ${testCase.value}`);
      passed++;
    } else {
      console.log(`   ❌ ${testCase.description}: ${testCase.value} - Förväntade ${testCase.expected}, fick ${result.isValid}`);
      if (result.error) console.log(`      Fel: ${result.error}`);
      failed++;
    }
  });
  
  console.log(`\n📊 Hemmafördelvalidering: ${passed} lyckades, ${failed} misslyckades`);
  return { passed, failed };
}

/**
 * Testar formvalidering
 */
function testFormValidation() {
  console.log('\n🧪 TESTAR FORMVALIDERING');
  console.log('========================');
  
  const testCases = [
    { value: 0, expected: true, description: 'Neutral form' },
    { value: 0.3, expected: true, description: 'Positiv form' },
    { value: -0.2, expected: true, description: 'Negativ form' },
    { value: 0.5, expected: true, description: 'Max positiv form' },
    { value: -0.5, expected: true, description: 'Max negativ form' },
    { value: 0.6, expected: false, description: 'För hög positiv form' },
    { value: -0.6, expected: false, description: 'För låg negativ form' },
    { value: 'abc', expected: false, description: 'Icke-numeriskt värde' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const result = validateForm(testCase.value);
    const success = result.isValid === testCase.expected;
    
    if (success) {
      console.log(`   ✅ ${testCase.description}: ${testCase.value}`);
      passed++;
    } else {
      console.log(`   ❌ ${testCase.description}: ${testCase.value} - Förväntade ${testCase.expected}, fick ${result.isValid}`);
      if (result.error) console.log(`      Fel: ${result.error}`);
      failed++;
    }
  });
  
  console.log(`\n📊 Formvalidering: ${passed} lyckades, ${failed} misslyckades`);
  return { passed, failed };
}

/**
 * Testar matchprediktionsvalidering
 */
function testMatchPredictionValidation() {
  console.log('\n🧪 TESTAR MATCHPREDIKTIONSVALIDERING');
  console.log('===================================');
  
  const testCases = [
    {
      params: { homeXG: 1.5, awayXG: 1.2, homeAdvantage: 0.3, recentForm: 0.1 },
      expected: true,
      description: 'Giltiga parametrar'
    },
    {
      params: { homeXG: 2.0, awayXG: 1.8 },
      expected: true,
      description: 'Endast xG-värden'
    },
    {
      params: { homeXG: -1, awayXG: 1.2 },
      expected: false,
      description: 'Negativt hemma-xG'
    },
    {
      params: { homeXG: 1.5, awayXG: 7 },
      expected: false,
      description: 'För högt borta-xG'
    },
    {
      params: { homeXG: 1.5, awayXG: 1.2, homeAdvantage: 1.5 },
      expected: false,
      description: 'För hög hemmafördelar'
    },
    {
      params: { homeXG: 1.5, awayXG: 1.2, recentForm: 0.8 },
      expected: false,
      description: 'För hög form'
    },
    {
      params: null,
      expected: false,
      description: 'Null parametrar'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const result = validateMatchPredictionParams(testCase.params);
    const success = result.isValid === testCase.expected;
    
    if (success) {
      console.log(`   ✅ ${testCase.description}`);
      passed++;
    } else {
      console.log(`   ❌ ${testCase.description} - Förväntade ${testCase.expected}, fick ${result.isValid}`);
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(error => console.log(`      Fel: ${error}`));
      }
      failed++;
    }
  });
  
  console.log(`\n📊 Matchprediktionsvalidering: ${passed} lyckades, ${failed} misslyckades`);
  return { passed, failed };
}

/**
 * Testar hjälpfunktioner
 */
function testUtilityFunctions() {
  console.log('\n🧪 TESTAR HJÄLPFUNKTIONER');
  console.log('=========================');
  
  let passed = 0;
  let failed = 0;
  
  // Test sanitizeNumericInput
  const sanitizeTests = [
    { input: '1.5', expected: 1.5, description: 'Sträng till nummer' },
    { input: 'abc', expected: 0, description: 'Ogiltig sträng till standard' },
    { input: null, expected: 0, description: 'Null till standard' },
    { input: 2.5, expected: 2.5, description: 'Nummer förblir nummer' }
  ];
  
  sanitizeTests.forEach(test => {
    const result = sanitizeNumericInput(test.input);
    if (result === test.expected) {
      console.log(`   ✅ sanitizeNumericInput - ${test.description}: ${test.input} → ${result}`);
      passed++;
    } else {
      console.log(`   ❌ sanitizeNumericInput - ${test.description}: ${test.input} → ${result} (förväntade ${test.expected})`);
      failed++;
    }
  });
  
  // Test clampValue
  const clampTests = [
    { value: 5, min: 0, max: 10, expected: 5, description: 'Värde inom intervall' },
    { value: -1, min: 0, max: 10, expected: 0, description: 'Värde under minimum' },
    { value: 15, min: 0, max: 10, expected: 10, description: 'Värde över maximum' }
  ];
  
  clampTests.forEach(test => {
    const result = clampValue(test.value, test.min, test.max);
    if (result === test.expected) {
      console.log(`   ✅ clampValue - ${test.description}: ${test.value} → ${result}`);
      passed++;
    } else {
      console.log(`   ❌ clampValue - ${test.description}: ${test.value} → ${result} (förväntade ${test.expected})`);
      failed++;
    }
  });
  
  console.log(`\n📊 Hjälpfunktioner: ${passed} lyckades, ${failed} misslyckades`);
  return { passed, failed };
}

/**
 * Huvudtestfunktion
 */
export function runInputValidationTest() {
  console.log('🔍 INPUTVALIDERINGSTEST STARTAR');
  console.log('================================');
  
  const startTime = Date.now();
  
  const xgResults = testXGValidation();
  const advantageResults = testHomeAdvantageValidation();
  const formResults = testFormValidation();
  const matchResults = testMatchPredictionValidation();
  const utilityResults = testUtilityFunctions();
  
  const totalPassed = xgResults.passed + advantageResults.passed + formResults.passed + 
                     matchResults.passed + utilityResults.passed;
  const totalFailed = xgResults.failed + advantageResults.failed + formResults.failed + 
                     matchResults.failed + utilityResults.failed;
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('\n📋 INPUTVALIDERINGSTEST SAMMANFATTNING');
  console.log('=====================================');
  
  if (totalFailed === 0) {
    console.log(`✅ Alla ${totalPassed} inputvalideringstester lyckades!`);
  } else {
    console.log(`❌ ${totalFailed} av ${totalPassed + totalFailed} inputvalideringstester misslyckades`);
  }
  
  console.log(`⏱️  Total testtid: ${duration}ms`);
  
  console.log('\n💡 REKOMMENDATIONER FÖR INPUTVALIDERING:');
  console.log('- Implementera dessa valideringar i UI-komponenter');
  console.log('- Visa användarvänliga felmeddelanden');
  console.log('- Lägg till realtidsvalidering för bättre UX');
  console.log('- Överväg att lägga till fler valideringsregler vid behov');
  
  return {
    totalTests: totalPassed + totalFailed,
    passed: totalPassed,
    failed: totalFailed,
    duration
  };
}