/**
 * Improved Mathematical Utilities for Soccer Predictions
 * Fixes issues with Monte Carlo simulation and Poisson distribution
 */

/**
 * Seeded Random Number Generator for reproducible results
 */
export class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed;
  }

  // Linear Congruential Generator
  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  // Generate random number between min and max
  range(min, max) {
    return min + this.next() * (max - min);
  }

  // Reset seed
  setSeed(seed) {
    this.seed = seed;
  }
}

/**
 * Improved Poisson Distribution Generator
 */
export class PoissonGenerator {
  constructor(rng = new SeededRandom()) {
    this.rng = rng;
    this.factorialCache = new Map();
    this.expCache = new Map();
  }

  /**
   * Generate Poisson-distributed random number using Knuth's algorithm
   * @param {number} lambda - Expected value (rate parameter)
   * @returns {number} Poisson-distributed integer
   */
  generate(lambda) {
    if (lambda <= 0) return 0;
    if (lambda > 30) {
      // Use normal approximation for large lambda
      return Math.max(0, Math.round(this.normalApproximation(lambda)));
    }

    // Knuth's algorithm for small lambda
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;

    do {
      k++;
      p *= this.rng.next();
    } while (p > L);

    return k - 1;
  }

  /**
   * Normal approximation for large lambda values
   * @param {number} lambda - Expected value
   * @returns {number} Normally distributed value
   */
  normalApproximation(lambda) {
    // Box-Muller transformation
    const u1 = this.rng.next();
    const u2 = this.rng.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return lambda + Math.sqrt(lambda) * z;
  }

  /**
   * Calculate Poisson probability with caching
   * @param {number} lambda - Expected value
   * @param {number} k - Actual value
   * @returns {number} Probability
   */
  probability(lambda, k) {
    if (k < 0 || lambda <= 0) return 0;
    if (k === 0) return Math.exp(-lambda);

    const cacheKey = `${lambda.toFixed(3)}_${k}`;
    if (this.expCache.has(cacheKey)) {
      return this.expCache.get(cacheKey);
    }

    let result;
    if (k > 50 || lambda > 50) {
      // Use Stirling's approximation for large values
      result = this.stirlingApproximation(lambda, k);
    } else {
      // Standard calculation with cached factorial
      const factorial = this.getFactorial(k);
      result = (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
    }

    this.expCache.set(cacheKey, result);
    return result;
  }

  /**
   * Stirling's approximation for large factorials
   * @param {number} lambda - Expected value
   * @param {number} k - Actual value
   * @returns {number} Probability using Stirling's approximation
   */
  stirlingApproximation(lambda, k) {
    if (k === 0) return Math.exp(-lambda);
    
    const logProb = k * Math.log(lambda) - lambda - 0.5 * Math.log(2 * Math.PI * k) + k * Math.log(k) - k;
    return Math.exp(logProb);
  }

  /**
   * Get factorial with caching
   * @param {number} n - Number to calculate factorial for
   * @returns {number} Factorial of n
   */
  getFactorial(n) {
    if (n <= 1) return 1;
    if (this.factorialCache.has(n)) {
      return this.factorialCache.get(n);
    }

    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }

    this.factorialCache.set(n, result);
    return result;
  }

  /**
   * Clear caches to free memory
   */
  clearCaches() {
    this.factorialCache.clear();
    this.expCache.clear();
  }
}

/**
 * Improved Monte Carlo Simulation
 */
export class MonteCarloSimulator {
  constructor(seed = 42) {
    this.rng = new SeededRandom(seed);
    this.poissonGen = new PoissonGenerator(this.rng);
  }

  /**
   * Run improved Monte Carlo simulation
   * @param {Object} params - Simulation parameters
   * @returns {Object} Simulation results
   */
  simulate(params) {
    const {
      simulations = 10000,
      homeGoalsAvg = 1.8,
      awayGoalsAvg = 1.5,
      homeDefenseStrength = 0.9,
      awayDefenseStrength = 1.1,
      homeAdvantage = 0.3,
      randomSeed = 42
    } = params;

    // Reset random seed for reproducibility
    this.rng.setSeed(randomSeed);

    // Calculate adjusted rates
    const homeRate = homeGoalsAvg * (1 + homeAdvantage) / awayDefenseStrength;
    const awayRate = awayGoalsAvg / homeDefenseStrength;

    // Simulation counters
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    let totalHomeGoals = 0;
    let totalAwayGoals = 0;
    let bothTeamsScore = 0;
    let over25Goals = 0;
    let under25Goals = 0;
    let over15Goals = 0;
    let over35Goals = 0;
    let cleanSheetHome = 0;
    let cleanSheetAway = 0;

    // Score distribution tracking
    const scoreDistribution = new Map();
    const goalDistribution = { home: new Array(10).fill(0), away: new Array(10).fill(0) };

    for (let i = 0; i < simulations; i++) {
      // Generate goals using proper Poisson distribution
      const homeGoals = this.poissonGen.generate(homeRate);
      const awayGoals = this.poissonGen.generate(awayRate);
      
      totalHomeGoals += homeGoals;
      totalAwayGoals += awayGoals;
      
      const totalGoals = homeGoals + awayGoals;
      const scoreKey = `${homeGoals}-${awayGoals}`;
      
      // Update score distribution
      scoreDistribution.set(scoreKey, (scoreDistribution.get(scoreKey) || 0) + 1);
      
      // Update goal distribution (cap at 9+ for display)
      goalDistribution.home[Math.min(homeGoals, 9)]++;
      goalDistribution.away[Math.min(awayGoals, 9)]++;
      
      // Match result
      if (homeGoals > awayGoals) homeWins++;
      else if (homeGoals === awayGoals) draws++;
      else awayWins++;
      
      // Various betting markets
      if (homeGoals > 0 && awayGoals > 0) bothTeamsScore++;
      if (totalGoals > 2.5) over25Goals++;
      else under25Goals++;
      if (totalGoals > 1.5) over15Goals++;
      if (totalGoals > 3.5) over35Goals++;
      if (awayGoals === 0) cleanSheetHome++;
      if (homeGoals === 0) cleanSheetAway++;
    }

    // Calculate confidence based on simulation size and variance
    const homeWinRate = homeWins / simulations;
    const variance = homeWinRate * (1 - homeWinRate);
    const standardError = Math.sqrt(variance / simulations);
    const confidence = Math.min(99, 90 + Math.log10(simulations) * 5 - standardError * 1000);

    // Get most likely scorelines
    const mostLikelyScores = Array.from(scoreDistribution.entries())
      .map(([score, count]) => ({
        score,
        probability: ((count / simulations) * 100).toFixed(1),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      homeWinProbability: ((homeWins / simulations) * 100).toFixed(1),
      drawProbability: ((draws / simulations) * 100).toFixed(1),
      awayWinProbability: ((awayWins / simulations) * 100).toFixed(1),
      expectedHomeGoals: (totalHomeGoals / simulations).toFixed(2),
      expectedAwayGoals: (totalAwayGoals / simulations).toFixed(2),
      bothTeamsScoreProbability: ((bothTeamsScore / simulations) * 100).toFixed(1),
      over25Probability: ((over25Goals / simulations) * 100).toFixed(1),
      under25Probability: ((under25Goals / simulations) * 100).toFixed(1),
      over15Probability: ((over15Goals / simulations) * 100).toFixed(1),
      over35Probability: ((over35Goals / simulations) * 100).toFixed(1),
      cleanSheetHomeProbability: ((cleanSheetHome / simulations) * 100).toFixed(1),
      cleanSheetAwayProbability: ((cleanSheetAway / simulations) * 100).toFixed(1),
      confidence: confidence.toFixed(1),
      mostLikelyScorelines: mostLikelyScores,
      goalDistribution,
      simulationStats: {
        totalSimulations: simulations,
        homeRate: homeRate.toFixed(3),
        awayRate: awayRate.toFixed(3),
        standardError: (standardError * 100).toFixed(2)
      }
    };
  }

  /**
   * Clear caches and reset state
   */
  reset() {
    this.poissonGen.clearCaches();
  }
}

/**
 * Enhanced Poisson Distribution Calculator
 */
export class EnhancedPoissonCalculator {
  constructor() {
    this.poissonGen = new PoissonGenerator();
  }

  /**
   * Calculate enhanced Poisson probabilities
   * @param {Object} params - Calculation parameters
   * @returns {Object} Calculation results
   */
  calculate(params) {
    const {
      homeAttackRate = 1.8,
      awayAttackRate = 1.5,
      homeDefenseRate = 0.8,
      awayDefenseRate = 1.0,
      leagueAverage = 2.7,
      adjustmentFactor = 1.0,
      homeAdvantage = 0.1
    } = params;

    // Calculate lambda values with home advantage
    const homeLambda = (homeAttackRate / leagueAverage) * 
                      (awayDefenseRate / leagueAverage) * 
                      leagueAverage * adjustmentFactor * (1 + homeAdvantage);
    
    const awayLambda = (awayAttackRate / leagueAverage) * 
                      (homeDefenseRate / leagueAverage) * 
                      leagueAverage * adjustmentFactor;

    // Calculate probabilities for extended range (0-10 goals)
    let homeWinProb = 0;
    let drawProb = 0;
    let awayWinProb = 0;
    let bothTeamsScoreProb = 0;
    let over25Prob = 0;
    let under25Prob = 0;
    let over15Prob = 0;
    let over35Prob = 0;
    let cleanSheetHomeProb = 0;
    let cleanSheetAwayProb = 0;

    const scorelineProbabilities = [];

    // Extended calculation range for better accuracy
    for (let homeGoals = 0; homeGoals <= 10; homeGoals++) {
      for (let awayGoals = 0; awayGoals <= 10; awayGoals++) {
        const homeProb = this.poissonGen.probability(homeLambda, homeGoals);
        const awayProb = this.poissonGen.probability(awayLambda, awayGoals);
        const combinedProb = homeProb * awayProb;
        const totalGoals = homeGoals + awayGoals;
        
        // Store scoreline probability
        if (homeGoals <= 6 && awayGoals <= 6) {
          scorelineProbabilities.push({
            score: `${homeGoals}-${awayGoals}`,
            probability: (combinedProb * 100).toFixed(2)
          });
        }
        
        // Match result
        if (homeGoals > awayGoals) homeWinProb += combinedProb;
        else if (homeGoals === awayGoals) drawProb += combinedProb;
        else awayWinProb += combinedProb;
        
        // Various markets
        if (homeGoals > 0 && awayGoals > 0) bothTeamsScoreProb += combinedProb;
        if (totalGoals > 2.5) over25Prob += combinedProb;
        else under25Prob += combinedProb;
        if (totalGoals > 1.5) over15Prob += combinedProb;
        if (totalGoals > 3.5) over35Prob += combinedProb;
        if (awayGoals === 0) cleanSheetHomeProb += combinedProb;
        if (homeGoals === 0) cleanSheetAwayProb += combinedProb;
      }
    }

    // Sort scorelines by probability
    const mostLikelyScorelines = scorelineProbabilities
      .sort((a, b) => parseFloat(b.probability) - parseFloat(a.probability))
      .slice(0, 8)
      .map(item => ({
        score: item.score,
        probability: parseFloat(item.probability).toFixed(1)
      }));

    // Normalize probabilities to ensure they sum to 100%
    const totalProb = homeWinProb + drawProb + awayWinProb;
    if (totalProb > 0) {
      homeWinProb = homeWinProb / totalProb;
      drawProb = drawProb / totalProb;
      awayWinProb = awayWinProb / totalProb;
    }

    // Calculate confidence based on lambda values
    const avgLambda = (homeLambda + awayLambda) / 2;
    const lambdaDiff = Math.abs(homeLambda - awayLambda);
    const confidence = Math.min(95, 75 + lambdaDiff * 10 + Math.min(avgLambda, 3) * 5);

    return {
      homeWinProbability: (homeWinProb * 100).toFixed(1),
      drawProbability: (drawProb * 100).toFixed(1),
      awayWinProbability: (awayWinProb * 100).toFixed(1),
      expectedHomeGoals: homeLambda.toFixed(2),
      expectedAwayGoals: awayLambda.toFixed(2),
      bothTeamsScoreProbability: (bothTeamsScoreProb * 100).toFixed(1),
      over25Probability: (over25Prob * 100).toFixed(1),
      under25Probability: (under25Prob * 100).toFixed(1),
      over15Probability: (over15Prob * 100).toFixed(1),
      over35Probability: (over35Prob * 100).toFixed(1),
      cleanSheetHomeProbability: (cleanSheetHomeProb * 100).toFixed(1),
      cleanSheetAwayProbability: (cleanSheetAwayProb * 100).toFixed(1),
      confidence: confidence.toFixed(1),
      mostLikelyScorelines,
      calculationStats: {
        homeLambda: homeLambda.toFixed(3),
        awayLambda: awayLambda.toFixed(3),
        homeAdvantageApplied: (homeAdvantage * 100).toFixed(1) + '%'
      }
    };
  }

  /**
   * Clear caches
   */
  reset() {
    this.poissonGen.clearCaches();
  }
}

// Export instances
export const monteCarloSimulator = new MonteCarloSimulator();
export const enhancedPoissonCalculator = new EnhancedPoissonCalculator();

// Utility functions
export const validateInputs = (params) => {
  const errors = [];
  
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${key} must be a valid number`);
    }
    
    if (value < 0) {
      errors.push(`${key} cannot be negative`);
    }
    
    if (key.includes('Rate') && value > 10) {
      errors.push(`${key} seems unrealistically high (>10)`);
    }
    
    if (key === 'simulations' && (value < 1000 || value > 1000000)) {
      errors.push('Simulations should be between 1,000 and 1,000,000');
    }
  });
  
  return errors;
};

export const formatResults = (results) => {
  // Ensure all probabilities add up to 100% (with rounding)
  const total = parseFloat(results.homeWinProbability) + 
                parseFloat(results.drawProbability) + 
                parseFloat(results.awayWinProbability);
  
  if (Math.abs(total - 100) > 0.5) {
    console.warn('Probabilities do not sum to 100%:', total);
  }
  
  return results;
};