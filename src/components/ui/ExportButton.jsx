import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { exportToPDF, exportToCSV, exportComparisonResults } from '../../utils/exportUtils';
import { useToast } from './Toast';

const ExportButton = ({ 
  results, 
  params, 
  activeTab, 
  xgResults, 
  poissonResults, 
  monteCarloResults,
  allParams,
  isComparison = false 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const handleExport = async (format) => {
    if (!results && !isComparison) {
      addToast({
        type: 'error',
        message: 'Inga resultat att exportera. Kör en beräkning först.'
      });
      return;
    }

    setIsExporting(true);

    try {
      if (isComparison) {
        // Exportera jämförelseresultat
        const exportFunctions = exportComparisonResults(
          xgResults, 
          poissonResults, 
          monteCarloResults, 
          allParams
        );
        
        if (format === 'pdf') {
          exportFunctions.toPDF();
        } else {
          exportFunctions.toCSV();
        }
      } else {
        // Exportera enskilt resultat
        if (format === 'pdf') {
          exportToPDF(results, params, activeTab);
        } else {
          exportToCSV(results, params, activeTab);
        }
      }

      addToast({
        type: 'success',
        message: `Resultat exporterat som ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        type: 'error',
        message: `Fel vid export: ${error.message}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  const hasResults = results || (isComparison && (xgResults || poissonResults || monteCarloResults));

  if (!hasResults) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors text-sm font-medium"
        title="Exportera som PDF"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">PDF</span>
        {isExporting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      </button>
      
      <button
        onClick={() => handleExport('csv')}
        disabled={isExporting}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors text-sm font-medium"
        title="Exportera som CSV"
      >
        <Table className="w-4 h-4" />
        <span className="hidden sm:inline">CSV</span>
        {isExporting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      </button>
    </div>
  );
};

/**
 * Kompakt exportknapp för mindre utrymmen
 */
export const CompactExportButton = ({ 
  results, 
  params, 
  activeTab, 
  xgResults, 
  poissonResults, 
  monteCarloResults,
  allParams,
  isComparison = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const handleExport = async (format) => {
    if (!results && !isComparison) {
      addToast({
        type: 'error',
        message: 'Inga resultat att exportera. Kör en beräkning först.'
      });
      return;
    }

    setIsExporting(true);
    setIsOpen(false);

    try {
      if (isComparison) {
        const exportFunctions = exportComparisonResults(
          xgResults, 
          poissonResults, 
          monteCarloResults, 
          allParams
        );
        
        if (format === 'pdf') {
          exportFunctions.toPDF();
        } else {
          exportFunctions.toCSV();
        }
      } else {
        if (format === 'pdf') {
          exportToPDF(results, params, activeTab);
        } else {
          exportToCSV(results, params, activeTab);
        }
      }

      addToast({
        type: 'success',
        message: `Resultat exporterat som ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        type: 'error',
        message: `Fel vid export: ${error.message}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  const hasResults = results || (isComparison && (xgResults || poissonResults || monteCarloResults));

  if (!hasResults) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
        title="Exportera resultat"
      >
        <Download className="w-4 h-4" />
        <span>Exportera</span>
        {isExporting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-700 rounded-t-lg"
          >
            <FileText className="w-4 h-4 text-red-600" />
            PDF
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-700 rounded-b-lg"
          >
            <Table className="w-4 h-4 text-green-600" />
            CSV
          </button>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;