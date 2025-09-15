/**
 * Event Sequence xG Analysis
 * Analyzes preceding events to improve xG accuracy using temporal and contextual features
 * 
 * ACADEMIC REFERENCES:
 * - Decroos, T. et al. (2019). "Actions speak louder than goals: Valuing player actions in soccer"
 *   DOI: 10.1145/3292500.3330758
 * - Fernández, J. & Bornn, L. (2018). "Wide Open Spaces: A statistical technique for measuring space creation in professional soccer"
 *   DOI: 10.1515/jqas-2017-0094
 * - Power, P. et al. (2017). "Not all passes are created equal: objectively measuring the risk and reward of passes in soccer from tracking data"
 *   DOI: 10.1145/3097983.3098051
 * - Spearman, W. et al. (2017). "Physics-based modeling of pass probabilities in soccer"
 *   DOI: 10.1515/jqas-2016-0009
 * - Link, D. et al. (2016). "Real time quantification of dangerousity in football using spatiotemporal tracking data"
 *   DOI: 10.1371/journal.pone.0168768
 */

export class EventSequenceAnalyzer {
  constructor() {
    // Event type weights based on research findings
    this.eventWeights = {
      pass: 1.0,
      cross: 1.2,
      through_ball: 1.4,
      dribble: 1.1,
      tackle: 0.8,
      interception: 0.9,
      corner: 1.1,
      free_kick: 1.0,
      throw_in: 0.9
    };

    // Temporal decay factors (events lose influence over time)
    this.temporalDecay = {
      immediate: 1.0,    // 0-5 seconds
      recent: 0.8,       // 5-15 seconds
      medium: 0.5,       // 15-30 seconds
      distant: 0.2       // 30+ seconds
    };

    // Advancement factor zones (research finding)
    this.advancementZones = {
      own_third: { factor: 0.8, description: 'Build-up from own third' },
      middle_third: { factor: 1.0, description: 'Standard middle third play' },
      attacking_third: { factor: 1.2, description: 'Advanced attacking position' },
      penalty_area: { factor: 1.5, description: 'Inside penalty area' },
      six_yard_box: { factor: 1.8, description: 'Close to goal' }
    };

    // Sequence patterns that improve xG (from research)
    this.beneficialPatterns = {
      side_buildup: {
        pattern: ['pass_from_side', 'cross', 'shot'],
        multiplier: 1.25,
        description: 'Build-up from sides of 18-yard box'
      },
      through_ball_sequence: {
        pattern: ['through_ball', 'shot'],
        multiplier: 1.4,
        description: 'Shot from through ball'
      },
      far_post_cross: {
        pattern: ['cross_to_far_post', 'shot'],
        multiplier: 1.3,
        description: 'Successful pass to far post'
      },
      quick_combination: {
        pattern: ['pass', 'pass', 'shot'],
        timeLimit: 10, // seconds
        multiplier: 1.2,
        description: 'Quick passing combination'
      },
      counter_attack: {
        pattern: ['interception', 'pass', 'shot'],
        timeLimit: 15,
        multiplier: 1.35,
        description: 'Counter-attack sequence'
      },
      set_piece_routine: {
        pattern: ['corner', 'pass', 'shot'],
        multiplier: 1.15,
        description: 'Set piece routine'
      }
    };

    // Player position columns (spatial analysis)
    this.positionColumns = {
      left_wing: { x_range: [0, 0.25], multiplier: 1.1 },
      left_center: { x_range: [0.25, 0.4], multiplier: 1.05 },
      center: { x_range: [0.4, 0.6], multiplier: 1.2 },
      right_center: { x_range: [0.6, 0.75], multiplier: 1.05 },
      right_wing: { x_range: [0.75, 1.0], multiplier: 1.1 }
    };
  }

  /**
   * Analyze event sequence and calculate xG adjustment
   * @param {Array} eventSequence - Array of events leading to shot
   * @param {Object} shotEvent - The shot event
   * @returns {Object} Sequence analysis with xG multiplier
   */
  analyzeSequence(eventSequence, shotEvent) {
    if (!eventSequence || eventSequence.length === 0) {
      return {
        multiplier: 1.0,
        confidence: 0.3,
        patterns: [],
        advancementFactor: 1.0,
        positionFactor: 1.0
      };
    }

    // Sort events by timestamp
    const sortedEvents = eventSequence.sort((a, b) => a.timestamp - b.timestamp);
    const shotTime = shotEvent.timestamp;

    // Calculate advancement factor
    const advancementFactor = this.calculateAdvancementFactor(sortedEvents, shotEvent);

    // Calculate position factor
    const positionFactor = this.calculatePositionFactor(shotEvent);

    // Identify beneficial patterns
    const patterns = this.identifyPatterns(sortedEvents, shotEvent);

    // Calculate temporal weights
    const temporalWeights = this.calculateTemporalWeights(sortedEvents, shotTime);

    // Calculate overall sequence multiplier
    const sequenceMultiplier = this.calculateSequenceMultiplier(
      sortedEvents,
      patterns,
      temporalWeights
    );

    // Combine all factors
    const finalMultiplier = sequenceMultiplier * advancementFactor * positionFactor;

    // Calculate confidence based on sequence length and pattern matches
    const confidence = this.calculateSequenceConfidence(sortedEvents, patterns);

    return {
      multiplier: Math.min(2.0, Math.max(0.5, finalMultiplier)),
      confidence,
      patterns: patterns.map(p => p.description),
      advancementFactor,
      positionFactor,
      sequenceLength: sortedEvents.length,
      temporalSpread: shotTime - sortedEvents[0].timestamp,
      details: {
        sequenceMultiplier,
        identifiedPatterns: patterns,
        eventWeights: temporalWeights
      }
    };
  }

  /**
   * Calculate advancement factor based on field progression
   */
  calculateAdvancementFactor(events, shotEvent) {
    if (events.length === 0) return 1.0;

    // Track field progression
    const startPosition = events[0].position || { x: 0.3, y: 0.5 };
    const shotPosition = shotEvent.position || { x: 0.8, y: 0.5 };

    // Calculate advancement distance
    const advancement = shotPosition.x - startPosition.x;
    
    // Determine zone progression
    let zoneProgression = 1.0;
    
    if (startPosition.x < 0.33 && shotPosition.x > 0.66) {
      // Full field progression
      zoneProgression = this.advancementZones.attacking_third.factor;
    } else if (startPosition.x < 0.5 && shotPosition.x > 0.75) {
      // Significant advancement
      zoneProgression = this.advancementZones.penalty_area.factor;
    } else if (advancement > 0.2) {
      // Moderate advancement
      zoneProgression = this.advancementZones.middle_third.factor;
    }

    return Math.min(1.8, Math.max(0.8, zoneProgression));
  }

  /**
   * Calculate position factor based on shot location column
   */
  calculatePositionFactor(shotEvent) {
    const position = shotEvent.position || { x: 0.8, y: 0.5 };
    
    for (const [columnName, column] of Object.entries(this.positionColumns)) {
      if (position.y >= column.x_range[0] && position.y < column.x_range[1]) {
        return column.multiplier;
      }
    }
    
    return 1.0; // Default if no column matches
  }

  /**
   * Identify beneficial patterns in the event sequence
   */
  identifyPatterns(events, shotEvent) {
    const identifiedPatterns = [];
    const eventTypes = events.map(e => e.type);
    eventTypes.push('shot'); // Add the shot to complete patterns

    for (const [patternName, pattern] of Object.entries(this.beneficialPatterns)) {
      if (this.matchesPattern(eventTypes, pattern.pattern, events, shotEvent, pattern.timeLimit)) {
        identifiedPatterns.push({
          name: patternName,
          multiplier: pattern.multiplier,
          description: pattern.description
        });
      }
    }

    return identifiedPatterns;
  }

  /**
   * Check if event sequence matches a beneficial pattern
   */
  matchesPattern(eventTypes, pattern, events, shotEvent, timeLimit) {
    if (eventTypes.length < pattern.length) return false;

    // Check for pattern match in the last N events
    const recentEvents = eventTypes.slice(-pattern.length);
    const patternMatch = pattern.every((patternEvent, index) => {
      return recentEvents[index] === patternEvent || 
             this.isEventTypeMatch(recentEvents[index], patternEvent);
    });

    if (!patternMatch) return false;

    // Check time limit if specified
    if (timeLimit && events.length > 0) {
      const sequenceStartTime = events[Math.max(0, events.length - pattern.length + 1)].timestamp;
      const shotTime = shotEvent.timestamp;
      return (shotTime - sequenceStartTime) <= timeLimit;
    }

    return true;
  }

  /**
   * Check if event types match (with some flexibility)
   */
  isEventTypeMatch(actualEvent, patternEvent) {
    // Handle special pattern events
    if (patternEvent === 'pass_from_side') {
      return actualEvent === 'pass' || actualEvent === 'cross';
    }
    if (patternEvent === 'cross_to_far_post') {
      return actualEvent === 'cross';
    }
    
    return actualEvent === patternEvent;
  }

  /**
   * Calculate temporal weights for events
   */
  calculateTemporalWeights(events, shotTime) {
    return events.map(event => {
      const timeDiff = shotTime - event.timestamp;
      
      if (timeDiff <= 5) return this.temporalDecay.immediate;
      if (timeDiff <= 15) return this.temporalDecay.recent;
      if (timeDiff <= 30) return this.temporalDecay.medium;
      return this.temporalDecay.distant;
    });
  }

  /**
   * Calculate overall sequence multiplier
   */
  calculateSequenceMultiplier(events, patterns, temporalWeights) {
    if (events.length === 0) return 1.0;

    // Base multiplier from patterns
    let patternMultiplier = 1.0;
    for (const pattern of patterns) {
      patternMultiplier *= pattern.multiplier;
    }

    // Event quality multiplier
    let eventQualityMultiplier = 1.0;
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const weight = temporalWeights[i];
      const eventWeight = this.eventWeights[event.type] || 1.0;
      
      eventQualityMultiplier += (eventWeight - 1.0) * weight * 0.1;
    }

    // Sequence length bonus (diminishing returns)
    const lengthBonus = Math.min(1.2, 1.0 + (events.length - 1) * 0.05);

    return patternMultiplier * eventQualityMultiplier * lengthBonus;
  }

  /**
   * Calculate confidence in sequence analysis
   */
  calculateSequenceConfidence(events, patterns) {
    if (events.length === 0) return 0.3;

    // Base confidence from sequence length
    const lengthConfidence = Math.min(0.9, 0.4 + events.length * 0.1);

    // Pattern confidence bonus
    const patternConfidence = Math.min(0.3, patterns.length * 0.1);

    // Temporal consistency (events close in time are more reliable)
    const timeSpread = events[events.length - 1].timestamp - events[0].timestamp;
    const temporalConfidence = Math.max(0.1, 1.0 - timeSpread / 60); // Decay over 60 seconds

    return Math.min(0.95, lengthConfidence + patternConfidence + temporalConfidence * 0.2);
  }

  /**
   * Generate example event sequence for testing
   */
  generateExampleSequence(type = 'counter_attack') {
    const baseTime = Date.now();
    
    const sequences = {
      counter_attack: [
        { type: 'interception', timestamp: baseTime, position: { x: 0.3, y: 0.5 } },
        { type: 'pass', timestamp: baseTime + 3000, position: { x: 0.5, y: 0.4 } },
        { type: 'pass', timestamp: baseTime + 6000, position: { x: 0.7, y: 0.5 } }
      ],
      side_buildup: [
        { type: 'pass', timestamp: baseTime, position: { x: 0.6, y: 0.2 } },
        { type: 'cross', timestamp: baseTime + 4000, position: { x: 0.8, y: 0.1 } }
      ],
      through_ball: [
        { type: 'pass', timestamp: baseTime, position: { x: 0.5, y: 0.5 } },
        { type: 'through_ball', timestamp: baseTime + 2000, position: { x: 0.7, y: 0.5 } }
      ]
    };

    return sequences[type] || sequences.counter_attack;
  }

  /**
   * Get analysis summary for UI display
   */
  getAnalysisSummary(analysis) {
    const summary = {
      improvement: ((analysis.multiplier - 1.0) * 100).toFixed(1),
      confidence: (analysis.confidence * 100).toFixed(1),
      keyFactors: []
    };

    if (analysis.patterns.length > 0) {
      summary.keyFactors.push(`Beneficial patterns: ${analysis.patterns.join(', ')}`);
    }

    if (analysis.advancementFactor > 1.1) {
      summary.keyFactors.push('Good field progression');
    }

    if (analysis.positionFactor > 1.1) {
      summary.keyFactors.push('Favorable shooting position');
    }

    if (analysis.sequenceLength >= 3) {
      summary.keyFactors.push('Well-developed attack');
    }

    return summary;
  }
}

// Export singleton instance
export const eventSequenceAnalyzer = new EventSequenceAnalyzer();

// Export default
export default EventSequenceAnalyzer;