/**
 * Bayesian Hierarchical xG Model
 * Evidence-based improvements using hierarchical Bayesian modeling
 * Implements player and position adjustments using Bayesian methodology
 * 
 * ACADEMIC REFERENCES:
 * - Gelman, A. et al. (2013). "Bayesian Data Analysis, Third Edition". CRC Press
 * - McHale, I. & Scarf, P. (2011). "Modelling the dependence of goals scored by opposing teams in international soccer matches"
 *   DOI: 10.1177/1471082X1001100201
 * - Baio, G. & Blangiardo, M. (2010). "Bayesian hierarchical model for the prediction of football results"
 *   DOI: 10.1080/02664760903487588
 * - Rue, H. & Salvesen, Ø. (2000). "Prediction and retrospective analysis of soccer matches in a league"
 *   DOI: 10.1111/1467-9884.00243
 * - Karlis, D. & Ntzoufras, I. (2003). "Analysis of sports data by using bivariate Poisson models"
 *   DOI: 10.1111/1467-9884.00366
 */

export class BayesianXGCalculator {
  constructor() {
    // Player skill adjustments (Bayesian priors)
    this.playerAdjustments = new Map();
    
    // Position-based priors from research (enhanced with sub-positions)
    this.positionPriors = {
      // Forwards
      striker: { mean: 0.18, variance: 0.06, shotMultiplier: 1.25 },
      center_forward: { mean: 0.16, variance: 0.05, shotMultiplier: 1.20 },
      false_nine: { mean: 0.14, variance: 0.05, shotMultiplier: 1.15 },
      
      // Wingers
      left_winger: { mean: 0.10, variance: 0.04, shotMultiplier: 1.10 },
      right_winger: { mean: 0.10, variance: 0.04, shotMultiplier: 1.10 },
      wing_back: { mean: 0.06, variance: 0.03, shotMultiplier: 1.05 },
      
      // Attacking Midfielders
      attacking_mid: { mean: 0.13, variance: 0.04, shotMultiplier: 1.15 },
      number_ten: { mean: 0.15, variance: 0.05, shotMultiplier: 1.18 },
      
      // Central Midfielders
      central_mid: { mean: 0.07, variance: 0.03, shotMultiplier: 1.02 },
      box_to_box: { mean: 0.09, variance: 0.04, shotMultiplier: 1.08 },
      playmaker: { mean: 0.08, variance: 0.03, shotMultiplier: 1.05 },
      
      // Defensive Midfielders
      defensive_mid: { mean: 0.04, variance: 0.02, shotMultiplier: 0.95 },
      holding_mid: { mean: 0.03, variance: 0.02, shotMultiplier: 0.90 },
      
      // Defenders
      fullback: { mean: 0.05, variance: 0.02, shotMultiplier: 1.00 },
      left_back: { mean: 0.04, variance: 0.02, shotMultiplier: 0.98 },
      right_back: { mean: 0.04, variance: 0.02, shotMultiplier: 0.98 },
      centerback: { mean: 0.02, variance: 0.01, shotMultiplier: 0.85 },
      sweeper: { mean: 0.03, variance: 0.02, shotMultiplier: 0.90 },
      
      // Goalkeeper
      goalkeeper: { mean: 0.008, variance: 0.001, shotMultiplier: 0.50 },
      
      // Generic fallbacks
      forward: { mean: 0.15, variance: 0.05, shotMultiplier: 1.20 },
      midfielder: { mean: 0.08, variance: 0.03, shotMultiplier: 1.05 },
      defender: { mean: 0.03, variance: 0.02, shotMultiplier: 0.95 }
    };

    // Player quality tiers (based on league/rating)
    this.qualityTiers = {
      elite: { multiplier: 1.25, confidence: 0.9 },     // Top 5% players
      high: { multiplier: 1.15, confidence: 0.8 },      // Top 15% players  
      above_average: { multiplier: 1.05, confidence: 0.7 },
      average: { multiplier: 1.0, confidence: 0.6 },
      below_average: { multiplier: 0.95, confidence: 0.7 },
      low: { multiplier: 0.85, confidence: 0.8 }
    };

    // Hierarchical structure for team effects
    this.teamEffects = new Map();
    
    // Prior distributions for hyperparameters
    this.hyperpriors = {
      position_effect_variance: 0.1,
      player_effect_variance: 0.05,
      team_effect_variance: 0.03
    };
  }

  /**
   * Calculate player-adjusted xG using Bayesian hierarchical model
   * @param {Object} shot - Shot data with player information
   * @param {number} baseXG - Base xG from traditional model
   * @returns {Object} Adjusted xG with confidence interval
   */
  calculatePlayerAdjustedXG(shot, baseXG) {
    const {
      playerId,
      playerName,
      position,
      playerQuality = 'average',
      teamId,
      seasonGoals = 0,
      seasonShots = 1,
      careerGoals = 0,
      careerShots = 1
    } = shot;

    // Get position prior (with fallback logic)
    let positionPrior = this.positionPriors[position];
    
    // Fallback to generic positions if specific position not found
    if (!positionPrior) {
      if (position.includes('forward') || position.includes('striker')) {
        positionPrior = this.positionPriors.forward;
      } else if (position.includes('mid') || position.includes('playmaker')) {
        positionPrior = this.positionPriors.midfielder;
      } else if (position.includes('back') || position.includes('defender')) {
        positionPrior = this.positionPriors.defender;
      } else {
        positionPrior = this.positionPriors.central_mid;
      }
    }
    
    // Get or initialize player adjustment
    let playerAdjustment = this.getPlayerAdjustment(playerId, playerName, position);
    
    // Update player adjustment with Bayesian learning
    playerAdjustment = this.updatePlayerAdjustment(
      playerAdjustment,
      seasonGoals,
      seasonShots,
      careerGoals,
      careerShots,
      positionPrior
    );

    // Get quality tier adjustment
    const qualityAdjustment = this.qualityTiers[playerQuality] || this.qualityTiers.average;
    
    // Get team effect
    const teamEffect = this.getTeamEffect(teamId);
    
    // Apply position-specific shot multiplier
    const positionAdjustedXG = baseXG * (positionPrior.shotMultiplier || 1.0);
    
    // Combine adjustments using Bayesian inference
    const adjustedXG = this.combineAdjustments(
      positionAdjustedXG,
      playerAdjustment,
      qualityAdjustment,
      teamEffect,
      positionPrior
    );

    // Calculate confidence interval
    const confidence = this.calculateConfidence(
      playerAdjustment.observations,
      qualityAdjustment.confidence
    );

    return {
      adjustedXG: Math.min(0.98, Math.max(0.005, adjustedXG)),
      confidence,
      playerEffect: playerAdjustment.effect,
      positionEffect: positionPrior.mean,
      positionMultiplier: positionPrior.shotMultiplier || 1.0,
      qualityEffect: qualityAdjustment.multiplier - 1,
      teamEffect: teamEffect.effect
    };
  }

  /**
   * Get or initialize player adjustment
   */
  getPlayerAdjustment(playerId, playerName, position) {
    const key = playerId || playerName;
    
    if (!this.playerAdjustments.has(key)) {
      const positionPrior = this.positionPriors[position] || this.positionPriors.central_mid;
      
      this.playerAdjustments.set(key, {
        effect: positionPrior.mean,
        variance: positionPrior.variance,
        observations: 0,
        totalGoals: 0,
        totalShots: 0,
        position
      });
    }
    
    return this.playerAdjustments.get(key);
  }

  /**
   * Update player adjustment using Bayesian learning
   */
  updatePlayerAdjustment(playerAdjustment, seasonGoals, seasonShots, careerGoals, careerShots, positionPrior) {
    // Combine season and career data with appropriate weighting
    const totalGoals = seasonGoals + careerGoals * 0.3; // Weight recent performance higher
    const totalShots = seasonShots + careerShots * 0.3;
    
    if (totalShots > 0) {
      const observedRate = totalGoals / totalShots;
      const observations = Math.min(totalShots, 100); // Cap influence of very high shot counts
      
      // Bayesian update: combine prior with observed data
      const priorWeight = 1 / (positionPrior.variance + this.hyperpriors.player_effect_variance);
      const dataWeight = observations;
      
      const totalWeight = priorWeight + dataWeight;
      const updatedEffect = (priorWeight * positionPrior.mean + dataWeight * observedRate) / totalWeight;
      const updatedVariance = 1 / totalWeight;
      
      playerAdjustment.effect = updatedEffect;
      playerAdjustment.variance = updatedVariance;
      playerAdjustment.observations = observations;
      playerAdjustment.totalGoals = totalGoals;
      playerAdjustment.totalShots = totalShots;
    }
    
    return playerAdjustment;
  }

  /**
   * Get team effect (simplified implementation)
   */
  getTeamEffect(teamId) {
    if (!this.teamEffects.has(teamId)) {
      this.teamEffects.set(teamId, {
        effect: 0,
        variance: this.hyperpriors.team_effect_variance,
        observations: 0
      });
    }
    
    return this.teamEffects.get(teamId);
  }

  /**
   * Combine all adjustments using Bayesian inference
   */
  combineAdjustments(baseXG, playerAdjustment, qualityAdjustment, teamEffect, positionPrior) {
    // Convert xG to log-odds for easier combination
    const logOdds = Math.log(baseXG / (1 - baseXG));
    
    // Add adjustments in log-odds space
    const playerLogAdjustment = Math.log((playerAdjustment.effect + 0.001) / (1 - playerAdjustment.effect + 0.001));
    const qualityLogAdjustment = Math.log(qualityAdjustment.multiplier);
    const teamLogAdjustment = teamEffect.effect;
    
    const adjustedLogOdds = logOdds + 
      (playerLogAdjustment - Math.log((positionPrior.mean + 0.001) / (1 - positionPrior.mean + 0.001))) * 0.3 +
      qualityLogAdjustment * 0.2 +
      teamLogAdjustment * 0.1;
    
    // Convert back to probability
    const adjustedXG = 1 / (1 + Math.exp(-adjustedLogOdds));
    
    return adjustedXG;
  }

  /**
   * Calculate confidence in the prediction
   */
  calculateConfidence(observations, qualityConfidence) {
    // Confidence increases with more observations but plateaus
    const observationConfidence = 1 - Math.exp(-observations / 20);
    
    // Combine with quality confidence
    return (observationConfidence * 0.7 + qualityConfidence * 0.3);
  }

  /**
   * Batch update player adjustments from historical data
   */
  trainFromHistoricalData(historicalShots) {
    console.log('Training Bayesian xG model from historical data...');
    
    for (const shot of historicalShots) {
      if (shot.playerId && shot.wasGoal !== undefined) {
        const playerAdjustment = this.getPlayerAdjustment(
          shot.playerId,
          shot.playerName,
          shot.position
        );
        
        // Update based on actual outcome
        this.updatePlayerAdjustmentFromOutcome(
          playerAdjustment,
          shot.wasGoal ? 1 : 0
        );
      }
    }
    
    console.log(`Trained on ${historicalShots.length} historical shots`);
  }

  /**
   * Update player adjustment from actual shot outcome
   */
  updatePlayerAdjustmentFromOutcome(playerAdjustment, outcome) {
    playerAdjustment.observations += 1;
    playerAdjustment.totalGoals += outcome;
    playerAdjustment.totalShots += 1;
    
    // Bayesian update with new observation
    const priorWeight = 1 / playerAdjustment.variance;
    const newWeight = 1;
    
    const totalWeight = priorWeight + newWeight;
    const updatedEffect = (priorWeight * playerAdjustment.effect + newWeight * outcome) / totalWeight;
    
    playerAdjustment.effect = updatedEffect;
    playerAdjustment.variance = 1 / totalWeight;
  }

  /**
   * Get model diagnostics
   */
  getModelDiagnostics() {
    const playerCount = this.playerAdjustments.size;
    const teamCount = this.teamEffects.size;
    
    const playerEffects = Array.from(this.playerAdjustments.values())
      .map(p => p.effect)
      .filter(e => !isNaN(e));
    
    const avgPlayerEffect = playerEffects.reduce((a, b) => a + b, 0) / playerEffects.length;
    const playerEffectVariance = playerEffects.reduce((sum, effect) => 
      sum + Math.pow(effect - avgPlayerEffect, 2), 0) / playerEffects.length;
    
    return {
      playerCount,
      teamCount,
      avgPlayerEffect,
      playerEffectVariance,
      totalObservations: Array.from(this.playerAdjustments.values())
        .reduce((sum, p) => sum + p.observations, 0)
    };
  }
}

// Export singleton instance
export const bayesianXG = new BayesianXGCalculator();

export default BayesianXGCalculator;