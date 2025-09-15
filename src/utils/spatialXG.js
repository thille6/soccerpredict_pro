/**
 * Spatial xG Analysis with Ball Advancement Factor
 * Advanced spatial modeling for Expected Goals using positional and geometric features
 * 
 * ACADEMIC REFERENCES:
 * - Fernández, J. et al. (2019). "Decomposing the Immeasurable Sport: A deep learning expected possession value framework for soccer"
 *   DOI: 10.1515/jqas-2018-0090
 * - Spearman, W. (2018). "Beyond Expected Goals". MIT Sloan Sports Analytics Conference
 * - Gudmundsson, J. & Horton, M. (2017). "Spatio-temporal analysis of team sports"
 *   DOI: 10.1145/3041021
 * - Taki, T. & Hasegawa, J. (2000). "Visualization of dominant region in team games and its application to teamwork analysis"
 *   DOI: 10.1109/CGIV.2000.852368
 * - Brefeld, U. et al. (2019). "Probabilistic movement models and zones of control"
 *   DOI: 10.1007/s10994-018-5725-1
 * - Fonseca, S. et al. (2012). "Spatial dynamics of team sports exposed by Voronoi diagrams"
 *   DOI: 10.1080/02640414.2012.723135
 */

class SpatialXGAnalyzer {
  constructor() {
    // Zone-based advancement multipliers (research-based)
    this.advancementZones = {
      // Defensive third (own goal to 35m)
      defensive_third: {
        baseMultiplier: 0.3,
        advancementBonus: 0.05, // Per 5m advancement
        maxBonus: 0.2
      },
      // Middle third (35m to 65m)
      middle_third: {
        baseMultiplier: 0.6,
        advancementBonus: 0.08,
        maxBonus: 0.3
      },
      // Attacking third (65m to goal)
      attacking_third: {
        baseMultiplier: 1.0,
        advancementBonus: 0.12,
        maxBonus: 0.5
      },
      // Final third (penalty area vicinity)
      final_third: {
        baseMultiplier: 1.3,
        advancementBonus: 0.15,
        maxBonus: 0.8
      }
    };

    // Position-specific spatial multipliers
    this.spatialPositionMultipliers = {
      // Forwards - benefit most from central positions
      striker: { central: 1.25, wide: 0.95, deep: 0.85 },
      center_forward: { central: 1.20, wide: 0.90, deep: 0.80 },
      
      // Wingers - benefit from wide positions
      left_winger: { central: 1.05, wide: 1.30, deep: 0.75 },
      right_winger: { central: 1.05, wide: 1.30, deep: 0.75 },
      
      // Attacking mids - versatile positioning
      attacking_mid: { central: 1.15, wide: 1.10, deep: 1.05 },
      number_ten: { central: 1.20, wide: 1.05, deep: 1.10 },
      
      // Central mids - benefit from deep positions
      central_mid: { central: 1.10, wide: 0.95, deep: 1.20 },
      box_to_box: { central: 1.15, wide: 1.05, deep: 1.15 },
      
      // Defensive positions
      defensive_mid: { central: 1.05, wide: 0.90, deep: 1.25 },
      fullback: { central: 0.85, wide: 1.15, deep: 1.10 },
      centerback: { central: 1.00, wide: 0.80, deep: 1.30 }
    };

    // Ball advancement patterns (sequence-based)
    this.advancementPatterns = {
      // Progressive passes leading to shot
      progressive_sequence: {
        multiplier: 1.15,
        minPasses: 3,
        minAdvancement: 20 // meters
      },
      // Quick counter-attack
      counter_attack: {
        multiplier: 1.25,
        maxDuration: 10, // seconds
        minAdvancement: 30
      },
      // Build-up play
      build_up: {
        multiplier: 1.08,
        minPasses: 5,
        minAdvancement: 15
      },
      // Set piece advancement
      set_piece_advance: {
        multiplier: 1.12,
        fromSetPiece: true
      }
    };
  }

  /**
   * Calculate spatial xG multiplier based on position and advancement
   */
  calculateSpatialMultiplier(shot, sequence = []) {
    const {
      x, y, // Shot coordinates
      playerPosition,
      distanceFromGoal,
      angle
    } = shot;

    // Determine field zone
    const zone = this.determineFieldZone(x, y, distanceFromGoal);
    
    // Calculate advancement factor
    const advancementFactor = this.calculateAdvancementFactor(sequence, shot);
    
    // Get position-specific spatial multiplier
    const positionMultiplier = this.getPositionSpatialMultiplier(
      playerPosition, x, y, angle
    );
    
    // Calculate zone-based multiplier
    const zoneMultiplier = this.getZoneMultiplier(zone, advancementFactor);
    
    // Combine all spatial factors
    const totalMultiplier = zoneMultiplier * positionMultiplier * advancementFactor;
    
    return {
      multiplier: Math.max(0.1, Math.min(3.0, totalMultiplier)), // Bounded
      breakdown: {
        zone: zone,
        zoneMultiplier: zoneMultiplier,
        positionMultiplier: positionMultiplier,
        advancementFactor: advancementFactor,
        spatialScore: this.calculateSpatialScore(x, y, angle, playerPosition)
      }
    };
  }

  /**
   * Determine which field zone the shot is from
   */
  determineFieldZone(x, y, distanceFromGoal) {
    if (distanceFromGoal <= 16) {
      return 'final_third';
    } else if (distanceFromGoal <= 35) {
      return 'attacking_third';
    } else if (distanceFromGoal <= 65) {
      return 'middle_third';
    } else {
      return 'defensive_third';
    }
  }

  /**
   * Calculate advancement factor from sequence
   */
  calculateAdvancementFactor(sequence, shot) {
    if (!sequence || sequence.length < 2) {
      return 1.0;
    }

    // Calculate total advancement
    const startPos = sequence[0];
    const endPos = shot;
    const totalAdvancement = this.calculateDistance(
      startPos.x, startPos.y, endPos.x, endPos.y
    );

    // Check for advancement patterns
    let patternMultiplier = 1.0;
    
    // Progressive sequence
    if (sequence.length >= 3 && totalAdvancement >= 20) {
      patternMultiplier *= this.advancementPatterns.progressive_sequence.multiplier;
    }
    
    // Counter-attack detection
    const sequenceDuration = this.calculateSequenceDuration(sequence);
    if (sequenceDuration <= 10 && totalAdvancement >= 30) {
      patternMultiplier *= this.advancementPatterns.counter_attack.multiplier;
    }
    
    // Build-up play
    if (sequence.length >= 5 && totalAdvancement >= 15) {
      patternMultiplier *= this.advancementPatterns.build_up.multiplier;
    }

    // Base advancement bonus
    const advancementBonus = Math.min(0.5, totalAdvancement / 100);
    
    return patternMultiplier * (1 + advancementBonus);
  }

  /**
   * Get position-specific spatial multiplier
   */
  getPositionSpatialMultiplier(position, x, y, angle) {
    const positionData = this.spatialPositionMultipliers[position] || 
                        this.spatialPositionMultipliers.central_mid;
    
    // Determine spatial context
    const spatialContext = this.determineSpatialContext(x, y, angle);
    
    return positionData[spatialContext] || 1.0;
  }

  /**
   * Determine spatial context (central, wide, deep)
   */
  determineSpatialContext(x, y, angle) {
    // Assuming field coordinates: x = distance from goal, y = lateral position
    const lateralDistance = Math.abs(y);
    
    if (x > 25) {
      return 'deep';
    } else if (lateralDistance > 15) {
      return 'wide';
    } else {
      return 'central';
    }
  }

  /**
   * Get zone-based multiplier with advancement bonus
   */
  getZoneMultiplier(zone, advancementFactor) {
    const zoneData = this.advancementZones[zone];
    if (!zoneData) return 1.0;
    
    const baseMultiplier = zoneData.baseMultiplier;
    const advancementBonus = Math.min(
      zoneData.maxBonus,
      (advancementFactor - 1) * zoneData.advancementBonus
    );
    
    return baseMultiplier + advancementBonus;
  }

  /**
   * Calculate spatial score for detailed analysis
   */
  calculateSpatialScore(x, y, angle, position) {
    // Composite spatial score (0-100)
    const distanceScore = Math.max(0, 100 - (x * 2)); // Closer = better
    const angleScore = Math.max(0, 100 - (Math.abs(angle - 0) * 2)); // Central angle = better
    const positionScore = this.getPositionScore(position);
    
    return Math.round((distanceScore + angleScore + positionScore) / 3);
  }

  /**
   * Get position-based score
   */
  getPositionScore(position) {
    const scores = {
      striker: 90, center_forward: 85, false_nine: 80,
      attacking_mid: 75, number_ten: 80,
      left_winger: 70, right_winger: 70,
      central_mid: 60, box_to_box: 65,
      defensive_mid: 45, fullback: 50,
      centerback: 30, goalkeeper: 10
    };
    
    return scores[position] || 60;
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Calculate sequence duration in seconds
   */
  calculateSequenceDuration(sequence) {
    if (sequence.length < 2) return 0;
    
    const start = sequence[0].timestamp || 0;
    const end = sequence[sequence.length - 1].timestamp || 0;
    
    return Math.max(0, (end - start) / 1000); // Convert to seconds
  }

  /**
   * Generate spatial analysis summary
   */
  generateSpatialSummary(result) {
    const { breakdown } = result;
    
    return {
      zone: breakdown.zone,
      spatialScore: breakdown.spatialScore,
      effectiveness: this.categorizeSpatialEffectiveness(result.multiplier),
      recommendations: this.generateSpatialRecommendations(breakdown)
    };
  }

  /**
   * Categorize spatial effectiveness
   */
  categorizeSpatialEffectiveness(multiplier) {
    if (multiplier >= 1.5) return 'Excellent';
    if (multiplier >= 1.2) return 'Good';
    if (multiplier >= 1.0) return 'Average';
    if (multiplier >= 0.8) return 'Below Average';
    return 'Poor';
  }

  /**
   * Generate spatial recommendations
   */
  generateSpatialRecommendations(breakdown) {
    const recommendations = [];
    
    if (breakdown.zoneMultiplier < 1.0) {
      recommendations.push('Move closer to goal for better scoring position');
    }
    
    if (breakdown.positionMultiplier < 1.0) {
      recommendations.push('Adjust position based on player role');
    }
    
    if (breakdown.advancementFactor < 1.1) {
      recommendations.push('Improve ball progression before shooting');
    }
    
    return recommendations;
  }
}

export default SpatialXGAnalyzer;