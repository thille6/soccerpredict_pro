import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Exporterar beräkningsresultat till PDF
 */
export const exportToPDF = (results, params, activeTab) => {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString('sv-SE');
  const currentTime = new Date().toLocaleTimeString('sv-SE');

  // Titel och metadata
  doc.setFontSize(20);
  doc.text('SoccerPredict Pro - Beräkningsresultat', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Genererat: ${currentDate} ${currentTime}`, 20, 35);
  doc.text(`Beräkningsmetod: ${getMethodName(activeTab)}`, 20, 45);

  let yPosition = 60;

  // Parametrar
  doc.setFontSize(14);
  doc.text('Inmatade parametrar:', 20, yPosition);
  yPosition += 10;

  const paramData = getParameterData(params, activeTab);
  doc.autoTable({
    startY: yPosition,
    head: [['Parameter', 'Värde']],
    body: paramData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 20, right: 20 }
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // Resultat
  doc.setFontSize(14);
  doc.text('Beräkningsresultat:', 20, yPosition);
  yPosition += 10;

  if (results.comparison) {
    // Jämförelseresultat
    const comparisonData = [
      ['Metod', 'Hemmavinst (%)', 'Oavgjort (%)', 'Bortavinst (%)', 'Hemma xG', 'Borta xG'],
      [
        'Expected Goals (xG)',
        results.xg?.homeWinProbability || 'N/A',
        results.xg?.drawProbability || 'N/A',
        results.xg?.awayWinProbability || 'N/A',
        results.xg?.expectedHomeGoals?.toFixed(2) || 'N/A',
        results.xg?.expectedAwayGoals?.toFixed(2) || 'N/A'
      ],
      [
        'Poisson-fördelning',
        results.poisson?.homeWinProbability || 'N/A',
        results.poisson?.drawProbability || 'N/A',
        results.poisson?.awayWinProbability || 'N/A',
        results.poisson?.expectedHomeGoals?.toFixed(2) || 'N/A',
        results.poisson?.expectedAwayGoals?.toFixed(2) || 'N/A'
      ],
      [
        'Monte Carlo',
        results.montecarlo?.homeWinProbability || 'N/A',
        results.montecarlo?.drawProbability || 'N/A',
        results.montecarlo?.awayWinProbability || 'N/A',
        results.montecarlo?.expectedHomeGoals?.toFixed(2) || 'N/A',
        results.montecarlo?.expectedAwayGoals?.toFixed(2) || 'N/A'
      ]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [comparisonData[0]],
      body: comparisonData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10 }
    });
  } else {
    // Enskilt resultat
    const singleResult = results[activeTab];
    if (singleResult) {
      const resultData = [
        ['Hemmavinst', `${singleResult.homeWinProbability}%`],
        ['Oavgjort', `${singleResult.drawProbability}%`],
        ['Bortavinst', `${singleResult.awayWinProbability}%`],
        ['Förväntade mål hemmalag', singleResult.expectedHomeGoals?.toFixed(2) || 'N/A'],
        ['Förväntade mål bortalag', singleResult.expectedAwayGoals?.toFixed(2) || 'N/A']
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Resultat', 'Värde']],
        body: resultData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 20, right: 20 }
      });
    }
  }

  // Spara PDF
  const fileName = `soccerpredict-resultat-${currentDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};

/**
 * Exporterar beräkningsresultat till CSV
 */
export const exportToCSV = (results, params, activeTab) => {
  const currentDate = new Date().toLocaleDateString('sv-SE');
  const currentTime = new Date().toLocaleTimeString('sv-SE');
  
  let csvContent = '';
  
  // Metadata
  csvContent += `SoccerPredict Pro - Beräkningsresultat\n`;
  csvContent += `Genererat,${currentDate} ${currentTime}\n`;
  csvContent += `Beräkningsmetod,${getMethodName(activeTab)}\n\n`;
  
  // Parametrar
  csvContent += `Inmatade parametrar\n`;
  const paramData = getParameterData(params, activeTab);
  csvContent += `Parameter,Värde\n`;
  paramData.forEach(([param, value]) => {
    csvContent += `"${param}","${value}"\n`;
  });
  csvContent += `\n`;
  
  // Resultat
  csvContent += `Beräkningsresultat\n`;
  
  if (results.comparison) {
    // Jämförelseresultat
    csvContent += `Metod,Hemmavinst (%),Oavgjort (%),Bortavinst (%),Hemma xG,Borta xG\n`;
    
    if (results.xg) {
      csvContent += `"Expected Goals (xG)",${results.xg.homeWinProbability},${results.xg.drawProbability},${results.xg.awayWinProbability},${results.xg.expectedHomeGoals?.toFixed(2) || 'N/A'},${results.xg.expectedAwayGoals?.toFixed(2) || 'N/A'}\n`;
    }
    
    if (results.poisson) {
      csvContent += `"Poisson-fördelning",${results.poisson.homeWinProbability},${results.poisson.drawProbability},${results.poisson.awayWinProbability},${results.poisson.expectedHomeGoals?.toFixed(2) || 'N/A'},${results.poisson.expectedAwayGoals?.toFixed(2) || 'N/A'}\n`;
    }
    
    if (results.montecarlo) {
      csvContent += `"Monte Carlo",${results.montecarlo.homeWinProbability},${results.montecarlo.drawProbability},${results.montecarlo.awayWinProbability},${results.montecarlo.expectedHomeGoals?.toFixed(2) || 'N/A'},${results.montecarlo.expectedAwayGoals?.toFixed(2) || 'N/A'}\n`;
    }
  } else {
    // Enskilt resultat
    const singleResult = results[activeTab];
    if (singleResult) {
      csvContent += `Resultat,Värde\n`;
      csvContent += `"Hemmavinst","${singleResult.homeWinProbability}%"\n`;
      csvContent += `"Oavgjort","${singleResult.drawProbability}%"\n`;
      csvContent += `"Bortavinst","${singleResult.awayWinProbability}%"\n`;
      csvContent += `"Förväntade mål hemmalag","${singleResult.expectedHomeGoals?.toFixed(2) || 'N/A'}"\n`;
      csvContent += `"Förväntade mål bortalag","${singleResult.expectedAwayGoals?.toFixed(2) || 'N/A'}"\n`;
    }
  }
  
  // Skapa och ladda ner fil
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `soccerpredict-resultat-${currentDate.replace(/\//g, '-')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Hjälpfunktion för att få metodnamn
 */
const getMethodName = (activeTab) => {
  switch (activeTab) {
    case 'xg': return 'Expected Goals (xG)';
    case 'poisson': return 'Poisson-fördelning';
    case 'montecarlo': return 'Monte Carlo-simulering';
    default: return 'Okänd metod';
  }
};

/**
 * Hjälpfunktion för att få parameterdata
 */
const getParameterData = (params, activeTab) => {
  const data = [];
  
  switch (activeTab) {
    case 'xg':
      if (params.xgParams) {
        data.push(['Hemmalag xG', params.xgParams.homeXG || 'N/A']);
        data.push(['Bortalag xG', params.xgParams.awayXG || 'N/A']);
        data.push(['Hemmalag försvar', params.xgParams.homeDefense || 'N/A']);
        data.push(['Bortalag försvar', params.xgParams.awayDefense || 'N/A']);
        data.push(['Hemmalag form', params.xgParams.homeForm || 'N/A']);
        data.push(['Motivation', params.xgParams.motivation || 'N/A']);
      }
      break;
      
    case 'poisson':
      if (params.poissonParams) {
        data.push(['Hemmalag mål/match', params.poissonParams.homeGoals || 'N/A']);
        data.push(['Bortalag mål/match', params.poissonParams.awayGoals || 'N/A']);
        data.push(['Hemmalag försvar', params.poissonParams.homeDefense || 'N/A']);
        data.push(['Bortalag försvar', params.poissonParams.awayDefense || 'N/A']);
      }
      break;
      
    case 'montecarlo':
      if (params.monteCarloParams) {
        data.push(['Simuleringar', params.monteCarloParams.simulations || 'N/A']);
        data.push(['Hemmalag attack', params.monteCarloParams.homeAttack || 'N/A']);
        data.push(['Bortalag attack', params.monteCarloParams.awayAttack || 'N/A']);
        data.push(['Hemmalag försvar', params.monteCarloParams.homeDefense || 'N/A']);
        data.push(['Bortalag försvar', params.monteCarloParams.awayDefense || 'N/A']);
      }
      break;
  }
  
  return data;
};

/**
 * Exporterar jämförelseresultat
 */
export const exportComparisonResults = (xgResults, poissonResults, monteCarloResults, allParams) => {
  const results = {
    comparison: true,
    xg: xgResults,
    poisson: poissonResults,
    montecarlo: monteCarloResults
  };
  
  return {
    toPDF: () => exportToPDF(results, allParams, 'comparison'),
    toCSV: () => exportToCSV(results, allParams, 'comparison')
  };
};

export default {
  exportToPDF,
  exportToCSV,
  exportComparisonResults
};