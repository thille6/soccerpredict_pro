/**
 * Expected Goals (xG) Calculations
 * Advanced xG model with multiple analysis layers
 * 
 * ACADEMIC REFERENCES:
 * - Caley, M. (2015). "Premier League Projections and New Expected Goals"
 * - Eastwood, M. (2015). "Expected Goals and Support Vector Machines"
 * - Lucey, P. et al. (2014). "Quality vs Quantity: Improved Shot Prediction in Soccer using Strategic Features from Spatiotemporal Data"
 *   DOI: 10.7551/mitpress/9780262027755.003.0101
 * - Spearman, W. (2018). "Beyond Expected Goals". MIT Sloan Sports Analytics Conference
 * - Anzer, G. & Bauer, P. (2021). "A goal scoring probability model for shots based on synchronized positional and event data in football"
 *   DOI: 10.3389/fspor.2021.624475
 * - Singh, K. (2019). "Introducing Expected Threat (xT)". Karun Singh Blog
 * - Fairchild, A. et al. (2018). "Spatial analysis of shots in MLS"
 *   DOI: 10.1515/jqas-2017-0007
 */

// Enhanced xG Calculator with Bayesian hierarchical model integration
import BayesianXGCalculator from './bayesianXG.js';
import EventSequenceAnalyzer from './eventSequenceXG.js';
import SpatialXGAnalyzer from './spatialXG.js';
import PsychologicalXGAnalyzer from './psychologicalXG.js';

// xG model based on shot location, type, and situation
export class XGCalculator {
  constructor() {
    this.bayesianCalculator = new BayesianXGCalculator();
    this.eventSequenceAnalyzer = new EventSequenceAnalyzer();
    this.spatialAnalyzer = new SpatialXGAnalyzer();
    this.psychologicalAnalyzer = new PsychologicalXGAnalyzer();
    
    // Historical xG values based on shot zones (simplified model)
    this.shotZones = {
      // Distance from goal (meters) -> base xG value
      penalty: 0.76,
      sixYardBox: 0.62,
      closeRange: 0.35,    // 0-6 meters
      midRange: 0.18,      // 6-12 meters
      longRange: 0.08,     // 12-18 meters
      veryLongRange: 0.03, // 18+ meters
      outsideBox: 0.04
    };

    // Shot type multipliers
    this.shotTypeMultipliers = {
      header: 0.7,
      leftFoot: 1.0,
      rightFoot: 1.0,
      volley: 1.2,
      halfVolley: 1.1,
      freekick: 0.6,
      penalty: 1.0
    };

    // Situation multipliers
    this.situationMultipliers = {
      openPlay: 1.0,
      counter: 1.3,
      setpiece: 0.8,
      corner: 0.6,
      throughball: 1.4,
      cross: 0.9,
      rebound: 1.2
    };

    // Defensive pressure multipliers
    this.pressureMultipliers = {
      none: 1.4,
      light: 1.2,
      moderate: 1.0,
      heavy: 0.7,
      blocked: 0.3
    };
  }

  /**
   * Calculate xG for a single shot
   * @param {Object} shot - Shot data
   * @param {boolean} useBayesian - Whether to use Bayesian player adjustments
   * @param {boolean} useEventSequence - Whether to use event sequence analysis
   * @param {boolean} useSpatial - Whether to use spatial analysis
   * @param {boolean} usePsychological - Whether to use psychological analysis
   * @returns {number|Object} xG value between 0 and 1, or detailed object if advanced
   */
  calculateShotXG(shot, useBayesian = false, useEventSequence = false, useSpatial = false, usePsychological = false) {
    const {
      distance = 12,
      angle = 0,
      shotType = 'rightFoot',
      situation = 'openPlay',
      pressure = 'moderate',
      isOneOnOne = false,
      defendersBetween = 1
    } = shot;

    // Base xG from distance
    let baseXG = this.getBaseXGFromDistance(distance);

    // Angle adjustment (shots from center are better)
    const angleMultiplier = Math.cos(Math.abs(angle) * Math.PI / 180) * 0.3 + 0.7;
    baseXG *= angleMultiplier;

    // Shot type adjustment
    baseXG *= this.shotTypeMultipliers[shotType] || 1.0;

    // Situation adjustment
    baseXG *= this.situationMultipliers[situation] || 1.0;

    // Pressure adjustment
    baseXG *= this.pressureMultipliers[pressure] || 1.0;

    // One-on-one bonus
    if (isOneOnOne) {
      baseXG *= 1.8;
    }

    // Defenders between shot and goal
    const defenderPenalty = Math.max(0.3, 1 - (defendersBetween * 0.15));
    baseXG *= defenderPenalty;

    // Ensure xG is between 0 and 1
    let finalXG = Math.min(0.95, Math.max(0.01, baseXG));
    
    // Apply spatial analysis if requested
    let spatialAnalysis = null;
    if (useSpatial && shot.spatialData) {
      spatialAnalysis = this.spatialAnalyzer.calculateSpatialMultiplier(
        {
          x: distance * Math.cos(angle * Math.PI / 180),
          y: distance * Math.sin(angle * Math.PI / 180),
          playerPosition: shot.spatialData.position || 'striker',
          distanceFromGoal: distance,
          angle: angle,
          ...shot.spatialData
        },
        shot.eventSequence || []
      );
      finalXG *= spatialAnalysis.multiplier;
      finalXG = Math.min(0.98, Math.max(0.005, finalXG));
    }
    
    // Apply psychological analysis if requested
    let psychologicalAnalysis = null;
    if (usePsychological && shot.psychologicalData) {
      psychologicalAnalysis = this.psychologicalAnalyzer.calculatePsychologicalMultiplier(
        shot.psychologicalData.matchContext || {},
        shot.psychologicalData.playerContext || {},
        shot.psychologicalData.teamContext || {}
      );
      finalXG *= psychologicalAnalysis.multiplier;
      finalXG = Math.min(0.98, Math.max(0.005, finalXG));
    }
    
    // Apply event sequence analysis if requested
    if (useEventSequence && shot.eventSequence) {
      const sequenceAnalysis = this.eventSequenceAnalyzer.analyzeSequence(
        shot.eventSequence,
        shot
      );
      finalXG *= sequenceAnalysis.multiplier;
      finalXG = Math.min(0.98, Math.max(0.005, finalXG));
      
      // If using multiple advanced methods, return detailed object
      if ((useBayesian && (shot.playerId || shot.playerName)) || useSpatial || usePsychological) {
        let result = {
          sequenceAnalysis,
          baseXG,
          sequenceMultiplier: sequenceAnalysis.multiplier
        };
        
        if (useBayesian && (shot.playerId || shot.playerName)) {
          const bayesianResult = this.bayesianCalculator.calculatePlayerAdjustedXG(shot, finalXG);
          result = {
            ...bayesianResult,
            ...result,
            combinedXG: bayesianResult.adjustedXG
          };
        } else {
          result.adjustedXG = finalXG;
        }
        
        if (useSpatial) {
          result.spatialAnalysis = spatialAnalysis;
          result.spatialMultiplier = spatialAnalysis.multiplier;
        }
        
        if (usePsychological) {
          result.psychologicalAnalysis = psychologicalAnalysis;
          result.psychologicalMultiplier = psychologicalAnalysis.multiplier;
        }
        
        return result;
      }
      
      // Return sequence analysis result
      return {
        adjustedXG: finalXG,
        baseXG,
        sequenceAnalysis,
        confidence: sequenceAnalysis.confidence
      };
    }
    
    // Apply Bayesian player adjustments if requested
    if (useBayesian && (shot.playerId || shot.playerName)) {
      return this.bayesianCalculator.calculatePlayerAdjustedXG(shot, finalXG);
    }
    
    return finalXG;
  }

  /**
   * Get base xG value from shot distance
   * @param {number} distance - Distance from goal in meters
   * @returns {number} Base xG value
   */
  getBaseXGFromDistance(distance) {
    if (distance <= 6) return this.shotZones.closeRange;
    if (distance <= 12) return this.shotZones.midRange;
    if (distance <= 18) return this.shotZones.longRange;
    return this.shotZones.veryLongRange;
  }

  /**
   * Calculate team xG from multiple shots
   * @param {Array} shots - Array of shot objects
   * @param {boolean} useBayesian - Whether to use Bayesian adjustments
   * @param {boolean} useEventSequence - Whether to use event sequence analysis
   * @param {boolean} useSpatial - Whether to use spatial analysis
   * @param {boolean} usePsychological - Whether to use psychological analysis
   * @returns {number|Object} Total team xG or detailed breakdown if advanced
   */
  calculateTeamXG(shots, useBayesian = false, useEventSequence = false, useSpatial = false, usePsychological = false) {
    if (!useBayesian && !useEventSequence && !useSpatial && !usePsychological) {
      return shots.reduce((total, shot) => total + this.calculateShotXG(shot), 0);
    }
    
    // Advanced calculation with detailed breakdown
    let totalXG = 0;
    let totalConfidence = 0;
    const shotDetails = [];
    let sequenceImprovements = 0;
    let playerAdjustments = 0;
    
    for (const shot of shots) {
      const result = this.calculateShotXG(shot, useBayesian, useEventSequence, useSpatial, usePsychological);
      if (typeof result === 'object') {
        totalXG += result.adjustedXG || result.combinedXG;
        totalConfidence += result.confidence;
        shotDetails.push(result);
        
        // Track improvements
        if (result.sequenceAnalysis) {
          sequenceImprovements += (result.sequenceAnalysis.multiplier - 1.0);
        }
        if (result.playerEffect) {
          playerAdjustments += result.playerEffect;
        }
      } else {
        totalXG += result;
        shotDetails.push({ adjustedXG: result, confidence: 0.5 });
      }
    }
    
    return {
      totalXG,
      averageConfidence: totalConfidence / shots.length,
      shotDetails,
      playerEffects: shotDetails.map(s => s.playerEffect || 0),
      qualityEffects: shotDetails.map(s => s.qualityEffect || 0),
      sequenceEffects: shotDetails.map(s => s.sequenceAnalysis?.multiplier || 1.0),
      spatialEffects: shotDetails.map(s => s.spatialAnalysis?.multiplier || 1.0),
      psychologicalEffects: shotDetails.map(s => s.psychologicalAnalysis?.multiplier || 1.0),
      improvements: {
        fromSequences: sequenceImprovements,
        fromPlayers: playerAdjustments,
        totalShots: shots.length
      }
    };
  }

  /**
   * Generate realistic shot data for simulation
   * @param {Object} teamStats - Team attacking statistics
   * @returns {Array} Array of simulated shots
   */
  generateShotsFromStats(teamStats) {
    const {
      shotsPerGame = 12,
      shotAccuracy = 0.35,
      bigChancesCreated = 2,
      attackingThird = 0.6,
      counterAttacks = 0.15
    } = teamStats;

    const shots = [];
    const numShots = Math.max(1, Math.round(shotsPerGame + (Math.random() - 0.5) * 4));

    for (let i = 0; i < numShots; i++) {
      const isBigChance = i < bigChancesCreated && Math.random() < 0.7;
      const isCounter = Math.random() < counterAttacks;
      
      const shot = {
        distance: this.generateShotDistance(isBigChance),
        angle: (Math.random() - 0.5) * 60, // -30 to +30 degrees
        shotType: this.generateShotType(),
        situation: isCounter ? 'counter' : this.generateSituation(),
        pressure: this.generatePressure(isBigChance),
        isOneOnOne: isBigChance && Math.random() < 0.3,
        defendersBetween: Math.floor(Math.random() * 3)
      };

      shots.push(shot);
    }

    return shots;
  }

  generateShotDistance(isBigChance) {
    if (isBigChance) {
      return Math.random() * 8 + 2; // 2-10 meters for big chances
    }
    
    const rand = Math.random();
    if (rand < 0.3) return Math.random() * 6 + 6;   // 6-12m
    if (rand < 0.6) return Math.random() * 6 + 12;  // 12-18m
    return Math.random() * 15 + 18; // 18-33m
  }

  generateShotType() {
    const types = ['rightFoot', 'leftFoot', 'header', 'volley'];
    const weights = [0.5, 0.3, 0.15, 0.05];
    
    const rand = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) return types[i];
    }
    
    return 'rightFoot';
  }

  generateSituation() {
    const situations = ['openPlay', 'cross', 'setpiece', 'corner', 'throughball'];
    const weights = [0.4, 0.25, 0.15, 0.1, 0.1];
    
    const rand = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < situations.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) return situations[i];
    }
    
    return 'openPlay';
  }

  generatePressure(isBigChance) {
    if (isBigChance) {
      return Math.random() < 0.6 ? 'light' : 'none';
    }
    
    const pressures = ['none', 'light', 'moderate', 'heavy'];
    const weights = [0.1, 0.25, 0.45, 0.2];
    
    const rand = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < pressures.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) return pressures[i];
    }
    
    return 'moderate';
  }

  /**
   * Calculate match xG prediction
   * @param {Object} homeTeam - Home team statistics
   * @param {Object} awayTeam - Away team statistics
   * @returns {Object} Match xG prediction
   */
  calculateMatchXG(homeTeam, awayTeam) {
    // Generate shots for both teams
    const homeShots = this.generateShotsFromStats(homeTeam);
    const awayShots = this.generateShotsFromStats(awayTeam);

    // Calculate team xG
    const homeXG = this.calculateTeamXG(homeShots);
    const awayXG = this.calculateTeamXG(awayShots);

    // Calculate probabilities based on xG
    const homeWinProb = this.xgToWinProbability(homeXG, awayXG, 'home');
    const awayWinProb = this.xgToWinProbability(awayXG, homeXG, 'away');
    const drawProb = Math.max(0, 100 - homeWinProb - awayWinProb);

    return {
      homeXG: homeXG.toFixed(2),
      awayXG: awayXG.toFixed(2),
      homeWinProbability: homeWinProb.toFixed(1),
      drawProbability: drawProb.toFixed(1),
      awayWinProbability: awayWinProb.toFixed(1),
      homeShots: homeShots.length,
      awayShots: awayShots.length,
      bigChancesHome: homeShots.filter(s => this.calculateShotXG(s) > 0.3).length,
      bigChancesAway: awayShots.filter(s => this.calculateShotXG(s) > 0.3).length
    };
  }

  /**
   * Convert xG to win probability
   * @param {number} teamXG - Team's xG
   * @param {number} opponentXG - Opponent's xG
   * @param {string} venue - 'home' or 'away'
   * @returns {number} Win probability percentage
   */
  xgToWinProbability(teamXG, opponentXG, venue = 'neutral') {
    // Home advantage adjustment
    const homeAdvantage = venue === 'home' ? 1.15 : (venue === 'away' ? 0.9 : 1.0);
    const adjustedXG = teamXG * homeAdvantage;
    
    // Use Poisson distribution to calculate win probability
    let winProb = 0;
    
    for (let teamGoals = 1; teamGoals <= 8; teamGoals++) {
      for (let oppGoals = 0; oppGoals < teamGoals; oppGoals++) {
        const teamProb = this.poissonProbability(adjustedXG, teamGoals);
        const oppProb = this.poissonProbability(opponentXG, oppGoals);
        winProb += teamProb * oppProb;
      }
    }
    
    return Math.min(95, Math.max(5, winProb * 100));
  }

  /**
   * Poisson probability calculation
   * @param {number} lambda - Expected value
   * @param {number} k - Actual value
   * @returns {number} Probability
   */
  poissonProbability(lambda, k) {
    if (k < 0) return 0;
    if (lambda <= 0) return k === 0 ? 1 : 0;
    
    // Use Stirling's approximation for large factorials
    if (k > 20) {
      const logProb = k * Math.log(lambda) - lambda - 0.5 * Math.log(2 * Math.PI * k) + k * Math.log(k) - k;
      return Math.exp(logProb);
    }
    
    // Standard calculation for smaller values
    let factorial = 1;
    for (let i = 2; i <= k; i++) {
      factorial *= i;
    }
    
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
  }
}

// Export singleton instance
export const xgCalculator = new XGCalculator();

// Export utility functions
export const calculateTeamXGFromStats = (teamStats) => {
  if (!teamStats || typeof teamStats !== 'object') {
    throw new Error('Ogiltiga lagstatistik för xG-beräkning');
  }
  
  try {
    return xgCalculator.calculateTeamXG(xgCalculator.generateShotsFromStats(teamStats));
  } catch (error) {
    console.error('Fel vid beräkning av lag-xG:', error);
    return 0;
  }
};

export const calculateMatchXGPrediction = (homeTeam, awayTeam) => {
  if (!homeTeam || !awayTeam || typeof homeTeam !== 'object' || typeof awayTeam !== 'object') {
    throw new Error('Ogiltiga lagdata för matchprediktion');
  }
  
  try {
    return xgCalculator.calculateMatchXG(homeTeam, awayTeam);
  } catch (error) {
    console.error('Fel vid beräkning av match-xG:', error);
    return { homeXG: 0, awayXG: 0 };
  }
};

// Enhanced xG calculation with advanced factors
export const calculateAdvancedXGPrediction = (xgParams) => {
  // Input validation
  if (!xgParams || typeof xgParams !== 'object') {
    throw new Error('Ogiltiga parametrar för xG-beräkning');
  }

  const {
    homeXG,
    awayXG,
    homeXGA = 1.2,
    awayXGA = 1.3,
    homeAdvantage = 0.3,
    recentForm = 0,
    homeDefensiveRating = 1.0,
    awayDefensiveRating = 1.0,
    homeFormFactor = 1.0,
    weatherConditions = 1.0,
    motivationFactor = 1.0,
    headToHeadFactor = 1.0
  } = xgParams;

  // Validate required parameters
  if (typeof homeXG !== 'number' || typeof awayXG !== 'number') {
    throw new Error('homeXG och awayXG måste vara nummer');
  }

  if (typeof homeXGA !== 'number' || typeof awayXGA !== 'number') {
    throw new Error('homeXGA och awayXGA måste vara nummer');
  }

  // Check for NaN and Infinity values
  if (isNaN(homeXG) || isNaN(awayXG) || isNaN(homeXGA) || isNaN(awayXGA)) {
    throw new Error('xG- och xGA-värden kan inte vara NaN');
  }

  if (!isFinite(homeXG) || !isFinite(awayXG) || !isFinite(homeXGA) || !isFinite(awayXGA)) {
    throw new Error('xG- och xGA-värden kan inte vara Infinity');
  }

  if (homeXG < 0 || awayXG < 0 || homeXGA < 0 || awayXGA < 0) {
    throw new Error('xG- och xGA-värden kan inte vara negativa');
  }

  if (homeXG > 6 || awayXG > 6) {
    console.warn('Mycket höga xG-värden kan ge opålitliga resultat');
  }

  if (homeXGA > 4 || awayXGA > 4) {
    console.warn('Mycket höga xGA-värden kan ge opålitliga resultat');
  }

  // Apply defensive adjustments with safe defaults, incorporating xGA values
  // xGA represents Expected Goals Against - higher values indicate weaker defense
  // More balanced approach: combine traditional defensive rating with xGA
  const homeDefensiveBase = Math.max(0.5, Math.min(1.5, awayDefensiveRating));
  const awayDefensiveBase = Math.max(0.5, Math.min(1.5, homeDefensiveRating));
  
  // xGA adjustment: normalize around 1.2 (average), with noticeable impact
  const homeXGAAdjustment = 1 + (awayXGA - 1.2) * 0.25; // Increased for more noticeable impact
  const awayXGAAdjustment = 1 + (homeXGA - 1.2) * 0.25;
  
  const homeDefensiveStrength = homeDefensiveBase * homeXGAAdjustment;
  const awayDefensiveStrength = awayDefensiveBase * awayXGAAdjustment;
  
  // More conservative adjustment to prevent extreme values
  let adjustedHomeXG = homeXG * (1.8 - Math.max(0.6, Math.min(1.4, homeDefensiveStrength)));
  let adjustedAwayXG = awayXG * (1.8 - Math.max(0.6, Math.min(1.4, awayDefensiveStrength)));

  // Apply form factors with bounds checking
  const safeHomeFormFactor = Math.max(0.5, Math.min(1.5, homeFormFactor));
  adjustedHomeXG *= safeHomeFormFactor;
  adjustedAwayXG *= safeHomeFormFactor;

  // Apply external factors with bounds checking
  const safeWeatherConditions = Math.max(0.8, Math.min(1.2, weatherConditions));
  const safeMotivationFactor = Math.max(0.8, Math.min(1.2, motivationFactor));
  const safeHeadToHeadFactor = Math.max(0.8, Math.min(1.2, headToHeadFactor));
  
  adjustedHomeXG *= safeWeatherConditions * safeMotivationFactor * safeHeadToHeadFactor;
  adjustedAwayXG *= safeWeatherConditions * safeMotivationFactor * (2.0 - safeHeadToHeadFactor);

  // Apply home advantage
  adjustedHomeXG *= (1 + Math.max(0, Math.min(1, homeAdvantage)));
  
  // Apply recent form
  const formAdjustment = 1 + (Math.max(-0.5, Math.min(0.5, recentForm)));
  adjustedHomeXG *= formAdjustment;
  adjustedAwayXG *= (2 - formAdjustment);

  // Ensure realistic bounds
  adjustedHomeXG = Math.max(0.1, Math.min(8.0, adjustedHomeXG));
  adjustedAwayXG = Math.max(0.1, Math.min(8.0, adjustedAwayXG));

  // Calculate all match outcome probabilities using Poisson distribution
  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;

  // Home advantage adjustment - more moderate for balanced results
  const homeAdvantageMultiplier = 1.08; // Reduced from 1.15
  const awayAdvantageMultiplier = 0.95;  // Increased from 0.9
  const adjustedHomeXGWithAdvantage = adjustedHomeXG * homeAdvantageMultiplier;
  const adjustedAwayXGWithAdvantage = adjustedAwayXG * awayAdvantageMultiplier;

  // Calculate probabilities for all possible scorelines (0-0 to 8-8)
  for (let homeGoals = 0; homeGoals <= 8; homeGoals++) {
    for (let awayGoals = 0; awayGoals <= 8; awayGoals++) {
      const homeProb = xgCalculator.poissonProbability(adjustedHomeXGWithAdvantage, homeGoals);
      const awayProb = xgCalculator.poissonProbability(adjustedAwayXGWithAdvantage, awayGoals);
      const combinedProb = homeProb * awayProb;
      
      if (homeGoals > awayGoals) {
        homeWinProb += combinedProb;
      } else if (homeGoals === awayGoals) {
        drawProb += combinedProb;
      } else {
        awayWinProb += combinedProb;
      }
    }
  }

  // Convert to percentages and ensure they sum to 100%
  const total = homeWinProb + drawProb + awayWinProb;
  
  return {
    homeWin: ((homeWinProb / total) * 100).toFixed(1),
    draw: ((drawProb / total) * 100).toFixed(1),
    awayWin: ((awayWinProb / total) * 100).toFixed(1),
    adjustedHomeXG: adjustedHomeXG.toFixed(2),
    adjustedAwayXG: adjustedAwayXG.toFixed(2),
    confidence: Math.min(95, Math.max(60, 85 - Math.abs(adjustedHomeXG - adjustedAwayXG) * 10))
  };
};