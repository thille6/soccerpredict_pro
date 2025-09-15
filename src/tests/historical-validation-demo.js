/**
 * Historical Validation Demo
 * Demonstrates the historical validation system with sample data
 */

import { HistoricalValidator, createSampleHistoricalData } from '../utils/historicalValidation.js';
import { BenchmarkingEngine } from '../utils/benchmarking.js';

/**
 * Demo function to showcase historical validation capabilities
 */
export async function runHistoricalValidationDemo() {
  console.log('🚀 Starting Historical Validation Demo...');
  console.log('=' .repeat(60));
  
  try {
    // Initialize validation system
    const validator = new HistoricalValidator();
    const benchmarking = new BenchmarkingEngine();
    
    // Generate sample historical data
    console.log('📊 Generating sample historical match data...');
    const historicalMatches = createSampleHistoricalData();
    console.log(`✅ Generated ${historicalMatches.length} sample matches`);
    
    // Validate each model type
    const modelTypes = ['xg', 'poisson', 'montecarlo'];
    const validationResults = {};
    
    console.log('\n🔍 Running validation for each model type...');
    
    for (const modelType of modelTypes) {
      console.log(`\n--- Validating ${modelType.toUpperCase()} Model ---`);
      
      try {
        const results = await validator.validateModel(historicalMatches, modelType);
        validationResults[modelType] = results;
        
        console.log(`✅ ${modelType} validation completed:`);
        console.log(`   📈 Accuracy: ${results.accuracy.toFixed(2)}%`);
        console.log(`   📊 Brier Score: ${results.brierScore.toFixed(4)} (lower is better)`);
        console.log(`   🎯 Log Likelihood: ${results.logLikelihood.toFixed(4)}`);
        console.log(`   ⚖️  Reliability: ${results.reliability.toFixed(3)}`);
        console.log(`   🔍 Sharpness: ${results.sharpness.toFixed(3)}`);
        
        // Display calibration info
        if (results.calibration.isWellCalibrated) {
          console.log(`   ✅ Model is well-calibrated (error: ${results.calibration.overallCalibrationError.toFixed(3)})`);
        } else {
          console.log(`   ⚠️  Model needs calibration improvement (error: ${results.calibration.overallCalibrationError.toFixed(3)})`);
        }
        
      } catch (error) {
        console.error(`❌ Error validating ${modelType}: ${error.message}`);
        validationResults[modelType] = { error: error.message };
      }
    }
    
    // Generate comprehensive validation report
    console.log('\n📋 Generating comprehensive validation report...');
    const validationReport = validator.generateValidationReport();
    
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('=' .repeat(40));
    
    if (validationReport.comparison && Object.keys(validationReport.comparison).length > 0) {
      console.log(`🏆 Best Accuracy: ${validationReport.comparison.bestAccuracy.name} (${validationReport.comparison.bestAccuracy.accuracy.toFixed(2)}%)`);
      console.log(`📊 Best Brier Score: ${validationReport.comparison.bestBrierScore.name} (${validationReport.comparison.bestBrierScore.brierScore.toFixed(4)})`);
      console.log(`⚖️  Best Calibration: ${validationReport.comparison.bestCalibration.name} (${validationReport.comparison.bestCalibration.reliability.toFixed(3)})`);
      console.log(`🎖️  Overall Recommendation: ${validationReport.comparison.overallRecommendation}`);
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    validationReport.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    // Run benchmarking analysis
    console.log('\n🏆 Running Benchmarking Analysis...');
    console.log('=' .repeat(50));
    
    try {
      const benchmarkReport = await benchmarking.runComprehensiveBenchmark(
        historicalMatches, 
        modelTypes
      );
      
      console.log('\n🎯 COMPETITIVE ANALYSIS');
      console.log('=' .repeat(30));
      
      if (benchmarkReport.competitivePosition.bestModel) {
        const bestModel = benchmarkReport.competitivePosition.bestModel;
        console.log(`🥇 Best Performing Model: ${bestModel.name}`);
        console.log(`   Score: ${bestModel.score.toFixed(2)}`);
        console.log(`   Accuracy: ${bestModel.performance.accuracy.toFixed(2)}%`);
      }
      
      if (benchmarkReport.competitivePosition.marketReadiness) {
        const readiness = benchmarkReport.competitivePosition.marketReadiness;
        console.log(`\n🚀 Market Readiness: ${readiness.readinessLevel}`);
        console.log(`   Readiness Score: ${readiness.readinessScore.toFixed(1)}%`);
        console.log(`   Criteria Met: ${readiness.metCriteria}/${readiness.totalCriteria}`);
        
        if (readiness.blockers.length > 0) {
          console.log(`   Blockers: ${readiness.blockers.join(', ')}`);
        }
      }
      
      // Display industry comparison for best model
      const bestModelType = benchmarkReport.competitivePosition.bestModel?.name;
      if (bestModelType && benchmarkReport.industryComparison[bestModelType]) {
        const comparison = benchmarkReport.industryComparison[bestModelType];
        console.log(`\n📈 Industry Position (${bestModelType.toUpperCase()}):`);
        console.log(`   Ranking: ${comparison.ranking}/${comparison.totalProviders}`);
        console.log(`   Market Position: ${comparison.marketPosition}`);
        console.log(`   Outperforms: ${comparison.betterThanCount} providers`);
        
        if (comparison.strengthAreas.length > 0) {
          console.log(`   Strengths: ${comparison.strengthAreas.join(', ')}`);
        }
        if (comparison.improvementAreas.length > 0) {
          console.log(`   Improvement Areas: ${comparison.improvementAreas.join(', ')}`);
        }
      }
      
      // Display competitive advantages
      if (benchmarkReport.competitivePosition.competitiveAdvantages) {
        console.log('\n💪 Competitive Advantages:');
        benchmarkReport.competitivePosition.competitiveAdvantages.forEach((advantage, index) => {
          console.log(`   ${index + 1}. ${advantage}`);
        });
      }
      
      // Display development priorities
      if (benchmarkReport.competitivePosition.developmentPriorities) {
        console.log('\n🎯 Development Priorities:');
        benchmarkReport.competitivePosition.developmentPriorities.forEach((priority, index) => {
          console.log(`   ${index + 1}. [${priority.priority}] ${priority.area} (Target: ${priority.target})`);
        });
      }
      
      // Display recommendations
      if (benchmarkReport.recommendations.length > 0) {
        console.log('\n📋 Strategic Recommendations:');
        benchmarkReport.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. [${rec.priority}] ${rec.description}`);
          if (rec.actions && rec.actions.length > 0) {
            rec.actions.forEach(action => {
              console.log(`      • ${action}`);
            });
          }
        });
      }
      
    } catch (error) {
      console.error(`❌ Benchmarking error: ${error.message}`);
    }
    
    // Performance summary
    console.log('\n⚡ PERFORMANCE SUMMARY');
    console.log('=' .repeat(30));
    
    const validModels = Object.entries(validationResults).filter(([_, results]) => !results.error);
    if (validModels.length > 0) {
      const avgAccuracy = validModels.reduce((sum, [_, results]) => sum + results.accuracy, 0) / validModels.length;
      const avgBrierScore = validModels.reduce((sum, [_, results]) => sum + results.brierScore, 0) / validModels.length;
      const avgReliability = validModels.reduce((sum, [_, results]) => sum + results.reliability, 0) / validModels.length;
      
      console.log(`📊 Average Accuracy: ${avgAccuracy.toFixed(2)}%`);
      console.log(`📈 Average Brier Score: ${avgBrierScore.toFixed(4)}`);
      console.log(`⚖️  Average Reliability: ${avgReliability.toFixed(3)}`);
      
      // Performance assessment
      if (avgAccuracy >= 52) {
        console.log('✅ Excellent accuracy performance!');
      } else if (avgAccuracy >= 48) {
        console.log('👍 Good accuracy performance');
      } else {
        console.log('⚠️  Accuracy needs improvement');
      }
      
      if (avgBrierScore <= 0.25) {
        console.log('✅ Excellent probability calibration!');
      } else if (avgBrierScore <= 0.30) {
        console.log('👍 Good probability calibration');
      } else {
        console.log('⚠️  Probability calibration needs improvement');
      }
    }
    
    console.log('\n🎉 Historical Validation Demo completed successfully!');
    console.log('\n📁 Next Steps:');
    console.log('   1. Review validation results and recommendations');
    console.log('   2. Implement suggested improvements');
    console.log('   3. Run validation with real historical data');
    console.log('   4. Set up automated validation pipeline');
    console.log('   5. Monitor model performance over time');
    
    return {
      validationResults,
      validationReport,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error(error.stack);
    return {
      error: error.message,
      success: false
    };
  }
}

/**
 * Quick validation test for a single model
 * @param {string} modelType - Model to test ('xg', 'poisson', 'montecarlo')
 * @param {number} sampleSize - Number of matches to test (default: 50)
 */
export async function quickValidationTest(modelType = 'xg', sampleSize = 50) {
  console.log(`🔍 Quick validation test for ${modelType.toUpperCase()} model...`);
  
  try {
    const validator = new HistoricalValidator();
    const testData = createSampleHistoricalData().slice(0, sampleSize);
    
    const results = await validator.validateModel(testData, modelType);
    
    console.log('\n📊 Quick Test Results:');
    console.log(`   Accuracy: ${results.accuracy.toFixed(2)}%`);
    console.log(`   Brier Score: ${results.brierScore.toFixed(4)}`);
    console.log(`   Reliability: ${results.reliability.toFixed(3)}`);
    console.log(`   Well Calibrated: ${results.calibration.isWellCalibrated ? 'Yes' : 'No'}`);
    
    return results;
    
  } catch (error) {
    console.error(`❌ Quick test failed: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Compare two models head-to-head
 * @param {string} model1 - First model type
 * @param {string} model2 - Second model type
 * @param {number} sampleSize - Number of matches to test
 */
export async function compareModels(model1 = 'xg', model2 = 'poisson', sampleSize = 100) {
  console.log(`⚔️  Head-to-head comparison: ${model1.toUpperCase()} vs ${model2.toUpperCase()}`);
  
  try {
    const validator = new HistoricalValidator();
    const testData = createSampleHistoricalData().slice(0, sampleSize);
    
    const results1 = await validator.validateModel(testData, model1);
    const results2 = await validator.validateModel(testData, model2);
    
    console.log('\n🥊 Comparison Results:');
    console.log('\nAccuracy:');
    console.log(`   ${model1.toUpperCase()}: ${results1.accuracy.toFixed(2)}%`);
    console.log(`   ${model2.toUpperCase()}: ${results2.accuracy.toFixed(2)}%`);
    console.log(`   Winner: ${results1.accuracy > results2.accuracy ? model1.toUpperCase() : model2.toUpperCase()}`);
    
    console.log('\nBrier Score (lower is better):');
    console.log(`   ${model1.toUpperCase()}: ${results1.brierScore.toFixed(4)}`);
    console.log(`   ${model2.toUpperCase()}: ${results2.brierScore.toFixed(4)}`);
    console.log(`   Winner: ${results1.brierScore < results2.brierScore ? model1.toUpperCase() : model2.toUpperCase()}`);
    
    console.log('\nReliability:');
    console.log(`   ${model1.toUpperCase()}: ${results1.reliability.toFixed(3)}`);
    console.log(`   ${model2.toUpperCase()}: ${results2.reliability.toFixed(3)}`);
    console.log(`   Winner: ${results1.reliability > results2.reliability ? model1.toUpperCase() : model2.toUpperCase()}`);
    
    // Overall winner
    const score1 = (results1.accuracy * 0.4) + ((1 - results1.brierScore) * 30) + (results1.reliability * 30);
    const score2 = (results2.accuracy * 0.4) + ((1 - results2.brierScore) * 30) + (results2.reliability * 30);
    
    console.log(`\n🏆 Overall Winner: ${score1 > score2 ? model1.toUpperCase() : model2.toUpperCase()}`);
    console.log(`   ${model1.toUpperCase()} Score: ${score1.toFixed(2)}`);
    console.log(`   ${model2.toUpperCase()} Score: ${score2.toFixed(2)}`);
    
    return { results1, results2, winner: score1 > score2 ? model1 : model2 };
    
  } catch (error) {
    console.error(`❌ Comparison failed: ${error.message}`);
    return { error: error.message };
  }
}

// Export demo functions
export default {
  runHistoricalValidationDemo,
  quickValidationTest,
  compareModels
};