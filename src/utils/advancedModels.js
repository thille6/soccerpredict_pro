/**
 * Advanced Statistical Models for Soccer Prediction
 * Includes correlation analysis, seasonal variation, and team form modeling
 */

// Team form and momentum calculator
export class TeamFormAnalyzer {
  constructor() {
    this.formWeights = [0.4, 0.3, 0.2, 0.1]; // Last 4 games weighted
    this.momentumDecay = 0.85; // How quickly momentum decays
  }

  /**
   * Calculate team form based on recent results
   * @param {Array} recentResults - Array of recent match results (1=win, 0.5=draw, 0=loss)
   * @param {Array} goalDifferences - Goal differences in recent matches
   * @returns {Object} Form metrics
   */
  calculateForm(recentResults, goalDifferences) {
    if (!recentResults || recentResults.length === 0) {
      return { formScore: 0.5, momentum: 0, confidence: 0 };
    }

    // Calculate weighted form score
    let formScore = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < Math.min(recentResults.length, this.formWeights.length); i++) {
      const weight = this.formWeights[i];
      formScore += recentResults[i] * weight;
      totalWeight += weight;
    }
    
    formScore = totalWeight > 0 ? formScore / totalWeight : 0.5;

    // Calculate momentum based on goal differences
    let momentum = 0;
    if (goalDifferences && goalDifferences.length > 0) {
      for (let i = 0; i < goalDifferences.length; i++) {
        const decay = Math.pow(this.momentumDecay, i);
        momentum += goalDifferences[i] * decay;
      }
      momentum = momentum / goalDifferences.length;
    }

    // Calculate confidence based on consistency
    const variance = this.calculateVariance(recentResults);
    const confidence = Math.max(0, 1 - variance);

    return {
      formScore: Math.max(0, Math.min(1, formScore)),
      momentum: Math.max(-3, Math.min(3, momentum)),
      confidence: Math.max(0, Math.min(1, confidence))
    };
  }

  calculateVariance(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }
}

// Seasonal variation and trend analysis
export class SeasonalAnalyzer {
  constructor() {
    this.seasonPhases = {
      early: { start: 1, end: 10, factor: 0.9 }, // Teams still finding form
      mid: { start: 11, end: 25, factor: 1.0 }, // Peak performance
      late: { start: 26, end: 38, factor: 0.95 } // Fatigue/motivation factors
    };
  }

  /**
   * Get seasonal adjustment factor
   * @param {number} gameWeek - Current game week (1-38)
   * @param {string} competition - Competition type
   * @returns {number} Adjustment factor
   */
  getSeasonalFactor(gameWeek, competition = 'league') {
    let phase = 'mid';
    
    for (const [phaseName, phaseData] of Object.entries(this.seasonPhases)) {
      if (gameWeek >= phaseData.start && gameWeek <= phaseData.end) {
        phase = phaseName;
        break;
      }
    }

    let factor = this.seasonPhases[phase].factor;

    // Adjust for competition type
    if (competition === 'cup') {
      factor *= 1.1; // Higher intensity in cup games
    } else if (competition === 'european') {
      factor *= 1.05; // Slightly higher for European competitions
    }

    return factor;
  }

  /**
   * Calculate fixture congestion impact
   * @param {number} daysSinceLastGame - Days since last match
   * @param {number} upcomingGames - Number of games in next 2 weeks
   * @returns {number} Fatigue factor (0.8-1.2)
   */
  calculateFatigueFactor(daysSinceLastGame, upcomingGames = 1) {
    let fatigueFactor = 1.0;

    // Rest impact
    if (daysSinceLastGame < 3) {
      fatigueFactor *= 0.9; // Tired from recent game
    } else if (daysSinceLastGame > 14) {
      fatigueFactor *= 0.95; // Rust from long break
    }

    // Fixture congestion
    if (upcomingGames > 3) {
      fatigueFactor *= 0.85; // Heavy fixture list
    } else if (upcomingGames === 1) {
      fatigueFactor *= 1.05; // Can focus on single game
    }

    return Math.max(0.8, Math.min(1.2, fatigueFactor));
  }
}

// Correlation and dependency analysis
export class CorrelationAnalyzer {
  constructor() {
    this.correlationThreshold = 0.3;
  }

  /**
   * Calculate correlation between two statistical series
   * @param {Array} x - First data series
   * @param {Array} y - Second data series
   * @returns {number} Correlation coefficient (-1 to 1)
   */
  calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Analyze team performance correlations
   * @param {Object} teamStats - Team statistics object
   * @returns {Object} Correlation insights
   */
  analyzeTeamCorrelations(teamStats) {
    const correlations = {};
    const stats = Object.keys(teamStats);

    // Calculate all pairwise correlations
    for (let i = 0; i < stats.length; i++) {
      for (let j = i + 1; j < stats.length; j++) {
        const stat1 = stats[i];
        const stat2 = stats[j];
        const correlation = this.calculateCorrelation(teamStats[stat1], teamStats[stat2]);
        
        if (Math.abs(correlation) > this.correlationThreshold) {
          correlations[`${stat1}_${stat2}`] = correlation;
        }
      }
    }

    return correlations;
  }

  /**
   * Calculate match outcome dependencies
   * @param {Object} homeTeamStats - Home team statistics
   * @param {Object} awayTeamStats - Away team statistics
   * @returns {Object} Dependency factors
   */
  calculateMatchDependencies(homeTeamStats, awayTeamStats) {
    // Attack vs Defense correlation
    const attackDefenseCorr = this.calculateCorrelation(
      homeTeamStats.attackStrength || [1],
      awayTeamStats.defenseStrength || [1]
    );

    // Possession vs Goals correlation
    const possessionGoalsCorr = this.calculateCorrelation(
      homeTeamStats.possession || [50],
      homeTeamStats.goalsScored || [1]
    );

    // Form correlation between teams
    const formCorrelation = this.calculateCorrelation(
      homeTeamStats.recentForm || [0.5],
      awayTeamStats.recentForm || [0.5]
    );

    return {
      attackDefense: attackDefenseCorr,
      possessionGoals: possessionGoalsCorr,
      formCorrelation: formCorrelation,
      overallDependency: (Math.abs(attackDefenseCorr) + Math.abs(possessionGoalsCorr)) / 2
    };
  }
}

// Weather and external factors
export class ExternalFactorsAnalyzer {
  constructor() {
    this.weatherImpact = {
      rain: { goals: 0.9, possession: 0.95 },
      snow: { goals: 0.8, possession: 0.9 },
      wind: { goals: 0.95, possession: 0.98 },
      clear: { goals: 1.0, possession: 1.0 }
    };
  }

  /**
   * Calculate weather impact on match
   * @param {string} weather - Weather condition
   * @param {number} temperature - Temperature in Celsius
   * @returns {Object} Weather adjustment factors
   */
  calculateWeatherImpact(weather = 'clear', temperature = 15) {
    const baseImpact = this.weatherImpact[weather] || this.weatherImpact.clear;
    
    // Temperature adjustments
    let tempFactor = 1.0;
    if (temperature < 0) {
      tempFactor = 0.9; // Very cold reduces performance
    } else if (temperature > 30) {
      tempFactor = 0.95; // Very hot reduces performance
    }

    return {
      goalsFactor: baseImpact.goals * tempFactor,
      possessionFactor: baseImpact.possession * tempFactor,
      overallFactor: (baseImpact.goals + baseImpact.possession) / 2 * tempFactor
    };
  }

  /**
   * Calculate crowd impact
   * @param {number} attendance - Stadium attendance
   * @param {number} capacity - Stadium capacity
   * @param {boolean} isHomeTeam - Whether calculating for home team
   * @returns {number} Crowd impact factor
   */
  calculateCrowdImpact(attendance, capacity, isHomeTeam = true) {
    const attendanceRatio = Math.min(1, attendance / capacity);
    
    if (isHomeTeam) {
      // Home team benefits from crowd support
      return 1.0 + (attendanceRatio * 0.1);
    } else {
      // Away team slightly hindered by hostile crowd
      return 1.0 - (attendanceRatio * 0.05);
    }
  }
}

// Comprehensive match predictor using all models
export class AdvancedMatchPredictor {
  constructor() {
    this.formAnalyzer = new TeamFormAnalyzer();
    this.seasonalAnalyzer = new SeasonalAnalyzer();
    this.correlationAnalyzer = new CorrelationAnalyzer();
    this.externalFactorsAnalyzer = new ExternalFactorsAnalyzer();
  }

  /**
   * Generate comprehensive match prediction
   * @param {Object} matchData - Complete match data
   * @returns {Object} Enhanced prediction with all factors
   */
  predictMatch(matchData) {
    const {
      homeTeam,
      awayTeam,
      gameWeek = 20,
      weather = 'clear',
      temperature = 15,
      attendance = 30000,
      stadiumCapacity = 40000
    } = matchData;

    // Calculate team forms
    const homeForm = this.formAnalyzer.calculateForm(
      homeTeam.recentResults,
      homeTeam.goalDifferences
    );
    const awayForm = this.formAnalyzer.calculateForm(
      awayTeam.recentResults,
      awayTeam.goalDifferences
    );

    // Seasonal adjustments
    const seasonalFactor = this.seasonalAnalyzer.getSeasonalFactor(gameWeek);
    const homeFatigue = this.seasonalAnalyzer.calculateFatigueFactor(
      homeTeam.daysSinceLastGame,
      homeTeam.upcomingGames
    );
    const awayFatigue = this.seasonalAnalyzer.calculateFatigueFactor(
      awayTeam.daysSinceLastGame,
      awayTeam.upcomingGames
    );

    // External factors
    const weatherImpact = this.externalFactorsAnalyzer.calculateWeatherImpact(weather, temperature);
    const homeCrowdImpact = this.externalFactorsAnalyzer.calculateCrowdImpact(
      attendance,
      stadiumCapacity,
      true
    );
    const awayCrowdImpact = this.externalFactorsAnalyzer.calculateCrowdImpact(
      attendance,
      stadiumCapacity,
      false
    );

    // Correlation analysis
    const dependencies = this.correlationAnalyzer.calculateMatchDependencies(homeTeam, awayTeam);

    // Combine all factors
    const homeAdjustment = homeForm.formScore * homeFatigue * homeCrowdImpact * seasonalFactor * weatherImpact.overallFactor;
    const awayAdjustment = awayForm.formScore * awayFatigue * awayCrowdImpact * seasonalFactor * weatherImpact.overallFactor;

    return {
      homeTeamFactors: {
        form: homeForm,
        fatigue: homeFatigue,
        crowdSupport: homeCrowdImpact,
        overallAdjustment: homeAdjustment
      },
      awayTeamFactors: {
        form: awayForm,
        fatigue: awayFatigue,
        crowdImpact: awayCrowdImpact,
        overallAdjustment: awayAdjustment
      },
      matchFactors: {
        seasonal: seasonalFactor,
        weather: weatherImpact,
        dependencies: dependencies
      },
      adjustedPrediction: {
        homeAdvantage: homeAdjustment / awayAdjustment,
        confidenceLevel: (homeForm.confidence + awayForm.confidence) / 2,
        volatility: dependencies.overallDependency
      }
    };
  }
}

// Export utility functions
export const calculateTeamStrengthIndex = (teamStats) => {
  const weights = {
    attack: 0.3,
    defense: 0.3,
    midfield: 0.2,
    form: 0.2
  };

  return Object.entries(weights).reduce((total, [stat, weight]) => {
    return total + (teamStats[stat] || 0.5) * weight;
  }, 0);
};

export const normalizeStatistic = (value, min, max) => {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

export const calculateConfidenceInterval = (prediction, sampleSize) => {
  const standardError = Math.sqrt(prediction * (1 - prediction) / sampleSize);
  const marginOfError = 1.96 * standardError; // 95% confidence
  
  return {
    lower: Math.max(0, prediction - marginOfError),
    upper: Math.min(1, prediction + marginOfError),
    margin: marginOfError
  };
};