/**
 * Inputvalidering för SoccerPredict Pro
 * Säkerställer att användarinmatningar är giltiga och säkra
 */

/**
 * Validerar xG-värden
 * @param {number} xg - xG-värdet att validera
 * @param {string} teamName - Lagnamn för felmeddelanden
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateXG = (xg, teamName = 'lag') => {
  if (typeof xg !== 'number' || isNaN(xg)) {
    return {
      isValid: false,
      error: `xG-värde för ${teamName} måste vara ett giltigt nummer`
    };
  }

  if (xg < 0) {
    return {
      isValid: false,
      error: `xG-värde för ${teamName} kan inte vara negativt`
    };
  }

  if (xg > 6) {
    return {
      isValid: false,
      error: `xG-värde för ${teamName} är orealistiskt högt (max 6.0)`
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validerar hemmafördelsvärde
 * @param {number} advantage - Hemmafördelsvärdet
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateHomeAdvantage = (advantage) => {
  if (typeof advantage !== 'number' || isNaN(advantage)) {
    return {
      isValid: false,
      error: 'Hemmafördelar måste vara ett giltigt nummer'
    };
  }

  if (advantage < 0 || advantage > 1) {
    return {
      isValid: false,
      error: 'Hemmafördelar måste vara mellan 0 och 1'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validerar formfaktor
 * @param {number} form - Formfaktorn
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateForm = (form) => {
  if (typeof form !== 'number' || isNaN(form)) {
    return {
      isValid: false,
      error: 'Formfaktor måste vara ett giltigt nummer'
    };
  }

  if (form < -0.5 || form > 0.5) {
    return {
      isValid: false,
      error: 'Formfaktor måste vara mellan -0.5 och 0.5'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validerar alla parametrar för en matchprediktion
 * @param {Object} params - Parametrar för matchprediktion
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateMatchPredictionParams = (params) => {
  const errors = [];
  
  if (!params || typeof params !== 'object') {
    return {
      isValid: false,
      errors: ['Ogiltiga parametrar för matchprediktion']
    };
  }

  const { homeXG, awayXG, homeAdvantage, recentForm } = params;

  // Validera hemma-xG
  const homeXGValidation = validateXG(homeXG, 'hemmalaget');
  if (!homeXGValidation.isValid) {
    errors.push(homeXGValidation.error);
  }

  // Validera borta-xG
  const awayXGValidation = validateXG(awayXG, 'bortalaget');
  if (!awayXGValidation.isValid) {
    errors.push(awayXGValidation.error);
  }

  // Validera hemmafördelar (om angivet)
  if (homeAdvantage !== undefined) {
    const advantageValidation = validateHomeAdvantage(homeAdvantage);
    if (!advantageValidation.isValid) {
      errors.push(advantageValidation.error);
    }
  }

  // Validera form (om angivet)
  if (recentForm !== undefined) {
    const formValidation = validateForm(recentForm);
    if (!formValidation.isValid) {
      errors.push(formValidation.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Saniterar numerisk input från användare
 * @param {any} value - Värdet att sanitera
 * @param {number} defaultValue - Standardvärde om input är ogiltig
 * @returns {number} - Saniterat numeriskt värde
 */
export const sanitizeNumericInput = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Begränsar ett värde till ett angivet intervall
 * @param {number} value - Värdet att begränsa
 * @param {number} min - Minimivärde
 * @param {number} max - Maximivärde
 * @returns {number} - Begränsat värde
 */
export const clampValue = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};