/**
 * Psychological xG Analysis
 * Incorporates psychological and environmental factors affecting shooting performance
 * 
 * ACADEMIC REFERENCES:
 * - Pollard, R. (2008). "Home advantage in football: A current review of an unsolved puzzle"
 *   DOI: 10.1080/02640410701736780
 * - Nevill, A.M. et al. (2002). "The influence of crowd noise and experience upon refereeing decisions in football"
 *   DOI: 10.1016/S0167-9457(01)00033-4
 * - Boyko, R.H. et al. (2007). "Referee bias contributes to home advantage in English Premiership football"
 *   DOI: 10.1098/rsif.2006.0209
 * - Carmichael, F. & Thomas, D. (2005). "Home-field effect and team performance"
 *   DOI: 10.1177/1527002504273773
 * - Seckin, A. & Pollard, R. (2008). "Home advantage in Turkish professional soccer"
 *   DOI: 10.2478/v10237-011-0041-2
 * - Goumas, C. (2014). "Home advantage and crowd size in soccer: A worldwide study"
 *   DOI: 10.1080/02640414.2013.878714
 */

class PsychologicalXGAnalyzer {
  constructor() {
    // Home advantage factors (research-based)
    this.homeAdvantageFactors = {
      // Base home advantage multiplier
      base: 1.08,
      
      // Crowd size effects
      crowdEffects: {
        empty: 0.95,        // No crowd (COVID-era research)
        small: 1.02,        // < 10,000
        medium: 1.05,       // 10,000 - 30,000
        large: 1.08,        // 30,000 - 50,000
        massive: 1.12,      // > 50,000
        hostile: 1.15       // Derby/rivalry matches
      },
      
      // Stadium atmosphere modifiers
      atmosphereModifiers: {
        intimate: 1.06,     // Close crowd to pitch
        traditional: 1.04,  // Historic stadium
        modern: 1.02,       // New stadium
        neutral: 1.00       // Neutral venue
      }
    };

    // Match importance weights
    this.matchImportance = {
      friendly: 0.95,
      league_regular: 1.00,
      league_crucial: 1.08,     // Top 6, relegation battles
      cup_early: 1.02,
      cup_quarter: 1.06,
      cup_semi: 1.10,
      cup_final: 1.15,
      derby: 1.12,
      european_group: 1.05,
      european_knockout: 1.12,
      world_cup_group: 1.08,
      world_cup_knockout: 1.18,
      champions_league_final: 1.20
    };

    // Pressure situations
    this.pressureSituations = {
      // Time-based pressure
      timeFactors: {
        early_game: 1.00,     // 0-30 min
        mid_game: 1.02,       // 30-60 min
        late_game: 1.08,      // 60-90 min
        injury_time: 1.15     // 90+ min
      },
      
      // Score-based pressure
      scoreFactors: {
        comfortable_lead: 0.95,  // Leading by 2+
        narrow_lead: 1.05,       // Leading by 1
        level: 1.08,             // 0-0 or tied
        narrow_deficit: 1.12,    // Behind by 1
        desperate: 1.18          // Behind by 2+ late
      },
      
      // Situational pressure
      situationalFactors: {
        penalty: 1.25,
        free_kick_close: 1.15,
        corner: 1.08,
        counter_attack: 1.12,
        last_chance: 1.20
      }
    };

    // Player psychological states
    this.playerPsychology = {
      // Confidence levels
      confidence: {
        very_low: 0.85,
        low: 0.92,
        normal: 1.00,
        high: 1.08,
        very_high: 1.15
      },
      
      // Recent form impact
      recentForm: {
        poor: 0.90,      // 0-1 goals in last 5 games
        average: 1.00,   // 2-4 goals in last 5 games
        good: 1.08,      // 5-7 goals in last 5 games
        excellent: 1.15  // 8+ goals in last 5 games
      },
      
      // Streak effects
      streakEffects: {
        goal_drought: 0.88,    // 5+ games without goal
        scoring_streak: 1.12,  // Goals in 3+ consecutive games
        debut: 0.95,           // First game for team
        return_from_injury: 0.92
      }
    };

    // Team psychological factors
    this.teamPsychology = {
      // Team morale
      morale: {
        very_low: 0.88,
        low: 0.94,
        normal: 1.00,
        high: 1.06,
        very_high: 1.12
      },
      
      // Recent results impact
      recentResults: {
        losing_streak: 0.90,   // 3+ losses
        mixed_form: 0.96,      // W-L-W pattern
        stable: 1.00,          // Consistent results
        winning_streak: 1.08,  // 3+ wins
        unbeaten_run: 1.12     // 5+ unbeaten
      }
    };
  }

  /**
   * Calculate psychological multiplier for xG
   */
  calculatePsychologicalMultiplier(matchContext, playerContext = {}, teamContext = {}) {
    const {
      isHome = false,
      crowdSize = 'medium',
      atmosphere = 'traditional',
      matchImportance = 'league_regular',
      minute = 45,
      scoreState = 'level',
      situation = 'open_play'
    } = matchContext;

    // Calculate home advantage
    const homeMultiplier = this.calculateHomeAdvantage(
      isHome, crowdSize, atmosphere
    );

    // Calculate match importance factor
    const importanceMultiplier = this.matchImportance[matchImportance] || 1.00;

    // Calculate pressure factors
    const pressureMultiplier = this.calculatePressureFactors(
      minute, scoreState, situation
    );

    // Calculate player psychological factors
    const playerMultiplier = this.calculatePlayerPsychology(playerContext);

    // Calculate team psychological factors
    const teamMultiplier = this.calculateTeamPsychology(teamContext);

    // Combine all factors with weighted importance
    const totalMultiplier = (
      homeMultiplier * 0.25 +
      importanceMultiplier * 0.20 +
      pressureMultiplier * 0.25 +
      playerMultiplier * 0.20 +
      teamMultiplier * 0.10
    );

    return {
      multiplier: Math.max(0.5, Math.min(2.0, totalMultiplier)), // Bounded
      breakdown: {
        homeAdvantage: homeMultiplier,
        matchImportance: importanceMultiplier,
        pressure: pressureMultiplier,
        playerPsychology: playerMultiplier,
        teamPsychology: teamMultiplier,
        psychologicalScore: this.calculatePsychologicalScore({
          homeMultiplier,
          importanceMultiplier,
          pressureMultiplier,
          playerMultiplier,
          teamMultiplier
        })
      }
    };
  }

  /**
   * Calculate home advantage multiplier
   */
  calculateHomeAdvantage(isHome, crowdSize, atmosphere) {
    if (!isHome) return 0.96; // Small away disadvantage

    const baseAdvantage = this.homeAdvantageFactors.base;
    const crowdEffect = this.homeAdvantageFactors.crowdEffects[crowdSize] || 1.05;
    const atmosphereEffect = this.homeAdvantageFactors.atmosphereModifiers[atmosphere] || 1.02;

    return baseAdvantage * crowdEffect * atmosphereEffect;
  }

  /**
   * Calculate pressure-based multipliers
   */
  calculatePressureFactors(minute, scoreState, situation) {
    // Time pressure
    let timeFactor = 1.00;
    if (minute <= 30) timeFactor = this.pressureSituations.timeFactors.early_game;
    else if (minute <= 60) timeFactor = this.pressureSituations.timeFactors.mid_game;
    else if (minute <= 90) timeFactor = this.pressureSituations.timeFactors.late_game;
    else timeFactor = this.pressureSituations.timeFactors.injury_time;

    // Score pressure
    const scoreFactor = this.pressureSituations.scoreFactors[scoreState] || 1.00;

    // Situational pressure
    const situationFactor = this.pressureSituations.situationalFactors[situation] || 1.00;

    return timeFactor * scoreFactor * situationFactor;
  }

  /**
   * Calculate player psychological multiplier
   */
  calculatePlayerPsychology(playerContext) {
    const {
      confidence = 'normal',
      recentForm = 'average',
      streak = null,
      isDebut = false,
      returningFromInjury = false
    } = playerContext;

    let multiplier = 1.00;

    // Confidence factor
    multiplier *= this.playerPsychology.confidence[confidence] || 1.00;

    // Recent form factor
    multiplier *= this.playerPsychology.recentForm[recentForm] || 1.00;

    // Streak effects
    if (streak) {
      multiplier *= this.playerPsychology.streakEffects[streak] || 1.00;
    }

    // Special situations
    if (isDebut) {
      multiplier *= this.playerPsychology.streakEffects.debut;
    }
    if (returningFromInjury) {
      multiplier *= this.playerPsychology.streakEffects.return_from_injury;
    }

    return multiplier;
  }

  /**
   * Calculate team psychological multiplier
   */
  calculateTeamPsychology(teamContext) {
    const {
      morale = 'normal',
      recentResults = 'stable'
    } = teamContext;

    const moraleMultiplier = this.teamPsychology.morale[morale] || 1.00;
    const resultsMultiplier = this.teamPsychology.recentResults[recentResults] || 1.00;

    return moraleMultiplier * resultsMultiplier;
  }

  /**
   * Calculate overall psychological score (0-100)
   */
  calculatePsychologicalScore(factors) {
    const {
      homeMultiplier,
      importanceMultiplier,
      pressureMultiplier,
      playerMultiplier,
      teamMultiplier
    } = factors;

    // Convert multipliers to scores
    const homeScore = (homeMultiplier - 0.5) * 100;
    const importanceScore = (importanceMultiplier - 0.5) * 66.7;
    const pressureScore = (pressureMultiplier - 0.5) * 50;
    const playerScore = (playerMultiplier - 0.5) * 100;
    const teamScore = (teamMultiplier - 0.5) * 100;

    const totalScore = (
      homeScore * 0.25 +
      importanceScore * 0.20 +
      pressureScore * 0.25 +
      playerScore * 0.20 +
      teamScore * 0.10
    );

    return Math.max(0, Math.min(100, Math.round(50 + totalScore)));
  }

  /**
   * Generate psychological analysis summary
   */
  generatePsychologicalSummary(result) {
    const { breakdown } = result;

    return {
      overallImpact: this.categorizePsychologicalImpact(result.multiplier),
      keyFactors: this.identifyKeyFactors(breakdown),
      psychologicalScore: breakdown.psychologicalScore,
      recommendations: this.generatePsychologicalRecommendations(breakdown)
    };
  }

  /**
   * Categorize psychological impact
   */
  categorizePsychologicalImpact(multiplier) {
    if (multiplier >= 1.3) return 'Very Positive';
    if (multiplier >= 1.1) return 'Positive';
    if (multiplier >= 0.95) return 'Neutral';
    if (multiplier >= 0.8) return 'Negative';
    return 'Very Negative';
  }

  /**
   * Identify key psychological factors
   */
  identifyKeyFactors(breakdown) {
    const factors = [];

    if (breakdown.homeAdvantage > 1.1) factors.push('Strong home advantage');
    if (breakdown.matchImportance > 1.1) factors.push('High-stakes match');
    if (breakdown.pressure > 1.1) factors.push('High pressure situation');
    if (breakdown.playerPsychology > 1.1) factors.push('Confident player');
    if (breakdown.teamPsychology > 1.1) factors.push('High team morale');

    if (breakdown.homeAdvantage < 0.95) factors.push('Away disadvantage');
    if (breakdown.playerPsychology < 0.95) factors.push('Low player confidence');
    if (breakdown.teamPsychology < 0.95) factors.push('Poor team morale');

    return factors;
  }

  /**
   * Generate psychological recommendations
   */
  generatePsychologicalRecommendations(breakdown) {
    const recommendations = [];

    if (breakdown.homeAdvantage < 1.0) {
      recommendations.push('Consider crowd support and venue familiarity');
    }

    if (breakdown.pressure > 1.2) {
      recommendations.push('High pressure situation - expect increased performance');
    }

    if (breakdown.playerPsychology < 0.95) {
      recommendations.push('Player confidence may affect performance');
    }

    if (breakdown.teamPsychology < 0.95) {
      recommendations.push('Team morale issues may impact collective performance');
    }

    return recommendations;
  }
}

export default PsychologicalXGAnalyzer;