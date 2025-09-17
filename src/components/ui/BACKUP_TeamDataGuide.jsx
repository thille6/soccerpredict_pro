// ⚠️ VIKTIGT: DENNA FIL ÄR EN BACKUP AV TEAMDATAGUIDE - TA ALDRIG BORT! ⚠️
// Skapad: 2025-01-17
// Syfte: Säkerhetskopia av den viktiga lagdata-guiden
// Om originalet försvinner, kopiera innehållet från denna fil

import React, { useState } from 'react';
import Icon from '../AppIcon';

const TeamDataGuide = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = {
    overview: {
      title: 'Översikt - Lagdata för Fotbollsanalys',
      icon: 'Info',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            För att få korrekta förutsägelser behöver du samla in aktuell data om lagens 
            prestationer. Denna guide visar dig exakt vilka värden du behöver och var du hittar dem.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Lightbulb" size={20} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Viktigt att komma ihåg</h4>
                <p className="text-blue-700 text-sm">
                  Använd alltid den senaste datan (helst från de senaste 5-10 matcherna) 
                  för bästa resultat. Äldre data kan ge missvisande förutsägelser.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Vad du behöver samla in:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Expected Goals (xG) - anfallsstyrka</li>
                <li>• Expected Goals Against (xGA) - försvarsstyrka</li>
                <li>• Aktuell form (senaste matchernas resultat)</li>
                <li>• Genomsnittliga mål för/emot per match</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Bästa datakällor:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Understat.com (xG-statistik)</li>
                <li>• FBref.com (detaljerad statistik)</li>
                <li>• Officiella ligasajter</li>
                <li>• ESPN, BBC Sport</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    
    form: {
      title: 'Lagform - Hur man bedömer aktuell form',
      icon: 'TrendingUp',
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3">Steg-för-steg: Beräkna lagform</h4>
            
            <div className="space-y-4">
              <div className="border-l-4 border-green-400 pl-4">
                <h5 className="font-medium text-green-800">1. Samla resultat från senaste 5 matcherna</h5>
                <p className="text-sm text-green-700 mt-1">
                  Titta på de senaste 5 ligamatcherna (inte cupmatcher). Notera vinster, oavgjorda och förluster.
                </p>
              </div>
              
              <div className="border-l-4 border-green-400 pl-4">
                <h5 className="font-medium text-green-800">2. Beräkna poäng per match</h5>
                <div className="text-sm text-green-700 mt-1">
                  <p>• Vinst = 3 poäng</p>
                  <p>• Oavgjort = 1 poäng</p>
                  <p>• Förlust = 0 poäng</p>
                  <p className="mt-2 font-medium">Formfaktor = (Totala poäng ÷ 15) × 1.0</p>
                </div>
              </div>
              
              <div className="border-l-4 border-green-400 pl-4">
                <h5 className="font-medium text-green-800">3. Exempel på beräkning</h5>
                <div className="bg-white rounded p-3 mt-2 text-sm">
                  <p className="font-medium mb-2">Senaste 5 matcher: V-V-O-F-V</p>
                  <p>Poäng: 3+3+1+0+3 = 10 poäng</p>
                  <p>Formfaktor: (10 ÷ 15) × 1.0 = 0.67</p>
                  <p className="text-green-600 font-medium mt-1">→ Ange 0.67 i systemet</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Formfaktor-guide</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white rounded p-2">
                <div className="font-medium text-green-600">Utmärkt form</div>
                <div className="text-gray-600">1.1 - 1.3</div>
                <div className="text-xs text-gray-500">4-5 vinster av 5</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="font-medium text-blue-600">Normal form</div>
                <div className="text-gray-600">0.8 - 1.1</div>
                <div className="text-xs text-gray-500">2-3 vinster av 5</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="font-medium text-red-600">Dålig form</div>
                <div className="text-gray-600">0.5 - 0.8</div>
                <div className="text-xs text-gray-500">0-1 vinster av 5</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    
    defense: {
      title: 'Försvarsstyrka - Mätning och beräkning',
      icon: 'Shield',
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">Metoder för att mäta försvarsstyrka</h4>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-4">
                <h5 className="font-medium text-blue-800">Metod 1: Expected Goals Against (xGA)</h5>
                <p className="text-sm text-blue-700 mt-1">
                  Den mest exakta metoden. Visar kvaliteten på chanser som laget släpper in, 
                  inte bara antal mål. Hittas på Understat.com eller FBref.com.
                </p>
                <div className="bg-white rounded p-2 mt-2 text-xs">
                  <p><strong>Exempel:</strong> Om ett lag har xGA 1.2 per match = ange 1.2</p>
                </div>
              </div>
              
              <div className="border-l-4 border-blue-400 pl-4">
                <h5 className="font-medium text-blue-800">Metod 2: Genomsnittliga insläppta mål</h5>
                <p className="text-sm text-blue-700 mt-1">
                  Enklare metod när xGA inte finns tillgänglig. Räkna genomsnittet av 
                  insläppta mål per match de senaste 10 matcherna.
                </p>
                <div className="bg-white rounded p-2 mt-2 text-xs">
                  <p><strong>Beräkning:</strong> Totala insläppta mål ÷ Antal matcher</p>
                </div>
              </div>
              
              <div className="border-l-4 border-blue-400 pl-4">
                <h5 className="font-medium text-blue-800">Metod 3: Relativ försvarsstyrka</h5>
                <p className="text-sm text-blue-700 mt-1">
                  Jämför lagets försvar med ligasnittet. Mer avancerad men ger bättre kontext.
                </p>
                <div className="bg-white rounded p-2 mt-2 text-xs">
                  <p><strong>Formel:</strong> Lagets xGA ÷ Ligans genomsnittliga xGA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">Försvarsstyrka-guide</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white rounded p-2">
                <div className="font-medium text-green-600">Starkt försvar</div>
                <div className="text-gray-600">0.6 - 0.9</div>
                <div className="text-xs text-gray-500">Få insläppta mål/chanser</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="font-medium text-blue-600">Genomsnittligt</div>
                <div className="text-gray-600">1.0 - 1.3</div>
                <div className="text-xs text-gray-500">Ligagenomsnitt</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="font-medium text-red-600">Svagt försvar</div>
                <div className="text-gray-600">1.4 - 2.0+</div>
                <div className="text-xs text-gray-500">Många insläppta mål</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    
    sources: {
      title: 'Datakällor och verktyg',
      icon: 'Database',
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-3">Rekommenderade webbsidor</h4>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-purple-800">Understat.com</h5>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Bäst för xG</span>
                </div>
                <p className="text-sm text-purple-700 mb-2">
                  Den bästa källan för Expected Goals (xG) och Expected Goals Against (xGA) statistik.
                </p>
                <div className="text-xs text-purple-600">
                  <p>• Välj liga → Välj lag → Kolla "xG" och "xGA" kolumnerna</p>
                  <p>• Använd siffrorna från "Last 5" eller "Last 10" för aktuell form</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-purple-800">FBref.com</h5>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Mest detaljerad</span>
                </div>
                <p className="text-sm text-purple-700 mb-2">
                  Omfattande statistik inklusive xG, defensiva mått och formanalys.
                </p>
                <div className="text-xs text-purple-600">
                  <p>• Gå till "Squad Stats" → Välj lag</p>
                  <p>• Kolla "Expected" sektionen för xG/xGA data</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-purple-800">Officiella ligasajter</h5>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Grunddata</span>
                </div>
                <p className="text-sm text-purple-700 mb-2">
                  Bra för grundläggande statistik som mål för/emot och senaste resultat.
                </p>
                <div className="text-xs text-purple-600">
                  <p>• Premier League: premierleague.com</p>
                  <p>• Allsvenskan: svenskfotboll.se</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Snabba tips för datainsamling</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Tidsbesparande tips:</h5>
                <ul className="text-gray-600 space-y-1">
                  <li>• Bokmärk dina favoritlag på Understat</li>
                  <li>• Använd "Last 5" statistik för aktuell form</li>
                  <li>• Uppdatera data efter varje spelomgång</li>
                  <li>• Spara vanliga värden som snabbval</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Kvalitetskontroll:</h5>
                <ul className="text-gray-600 space-y-1">
                  <li>• Jämför data från flera källor</li>
                  <li>• Kontrollera att siffrorna är rimliga</li>
                  <li>• Använd senaste 5-10 matcher max</li>
                  <li>• Ignorera cupmatcher för ligaanalys</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Guide: Lagform och Försvarsstyrka</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {Object.entries(sections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === key
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon name={section.icon} size={16} />
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name={sections[activeSection].icon} size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {sections[activeSection].title}
                </h3>
              </div>
              
              {sections[activeSection].content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDataGuide;