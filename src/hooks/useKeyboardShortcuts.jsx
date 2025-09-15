import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook för att hantera tangentbordsgenvägar i applikationen
 */
export const useKeyboardShortcuts = (shortcuts = {}, options = {}) => {
  const {
    enabled = true,
    preventDefault = true,
    showToast = false,
    scope = 'global'
  } = options;

  const shortcutsRef = useRef(shortcuts);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
    enabledRef.current = enabled;
  }, [shortcuts, enabled]);

  const handleKeyDown = useCallback((event) => {
    if (!enabledRef.current) return;

    const activeElement = document.activeElement;
    const isInputActive = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    );

    if (isInputActive && scope === 'global') return;

    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey;
    const alt = event.altKey;
    const shift = event.shiftKey;
    const meta = event.metaKey;

    const modifiers = [];
    if (ctrl) modifiers.push('ctrl');
    if (alt) modifiers.push('alt');
    if (shift) modifiers.push('shift');
    if (meta) modifiers.push('meta');
    
    const shortcutKey = modifiers.length > 0 
      ? `${modifiers.join('+')}+${key}`
      : key;

    const shortcut = shortcutsRef.current[shortcutKey];
    
    if (shortcut) {
      if (preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (typeof shortcut === 'function') {
        shortcut(event);
      } else if (typeof shortcut === 'object' && shortcut.action) {
        shortcut.action(event);
        
        if (showToast && shortcut.description) {
          console.log(`Genväg: ${shortcut.description}`);
        }
      }
    }
  }, [preventDefault, showToast, scope]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    updateShortcuts: (newShortcuts) => {
      shortcutsRef.current = { ...shortcutsRef.current, ...newShortcuts };
    },
    removeShortcut: (key) => {
      const updated = { ...shortcutsRef.current };
      delete updated[key];
      shortcutsRef.current = updated;
    }
  };
};

/**
 * Hook specifikt för kalkylator-shortcuts
 */
export const useCalculatorShortcuts = ({
  onCalculate,
  onClear,
  onExport,
  onSave,
  onLoad,
  enabled = true
} = {}) => {
  const shortcuts = {
    'enter': {
      action: onCalculate,
      description: 'Beräkna resultat'
    },
    'ctrl+enter': {
      action: onCalculate,
      description: 'Beräkna resultat (Ctrl+Enter)'
    },
    'escape': {
      action: onClear,
      description: 'Rensa alla fält'
    },
    'ctrl+e': {
      action: onExport,
      description: 'Exportera resultat'
    },
    'ctrl+s': {
      action: onSave,
      description: 'Spara beräkning'
    },
    'ctrl+o': {
      action: onLoad,
      description: 'Ladda sparad beräkning'
    }
  };

  return useKeyboardShortcuts(shortcuts, {
    enabled,
    preventDefault: true,
    showToast: true,
    scope: 'global'
  });
};

/**
 * Komponent för att visa hjälp om tangentbordsgenvägar
 */
export const ShortcutHelpButton = ({ shortcuts = {}, className = '' }) => {
  const defaultShortcuts = {
    'Enter': 'Beräkna resultat',
    'Ctrl+Enter': 'Beräkna resultat',
    'Escape': 'Rensa alla fält',
    'Ctrl+E': 'Exportera resultat',
    'Ctrl+S': 'Spara beräkning',
    'Ctrl+O': 'Ladda sparad beräkning'
  };

  const allShortcuts = { ...defaultShortcuts, ...shortcuts };

  return (
    <div className={`shortcut-help ${className}`}>
      <button 
        type="button"
        className="help-button"
        title="Visa tangentbordsgenvägar"
        onClick={() => {
          const helpText = Object.entries(allShortcuts)
            .map(([key, desc]) => `${key}: ${desc}`)
            .join('\n');
          alert(`Tangentbordsgenvägar:\n\n${helpText}`);
        }}
      >
        ?
      </button>
    </div>
  );
};

export default useKeyboardShortcuts;