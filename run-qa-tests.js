#!/usr/bin/env node

/**
 * Automatiserad Testsvit för SoccerPredict Pro
 * Kör alla kvalitetstester och genererar rapport
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEST_FILES = [
  'src/tests/calculations.test.js',
  'src/tests/extreme-values-test.js',
  'src/tests/input-validation-test.js',
  'src/tests/ui-functionality-test.js',
  'src/tests/comprehensive-test.js'
];

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

class QATestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  log(message, color = COLORS.RESET) {
    console.log(`${color}${message}${COLORS.RESET}`);
  }

  async runTest(testFile) {
    const testName = path.basename(testFile, '.js');
    this.log(`\n🧪 Kör test: ${testName}`, COLORS.BLUE);
    
    try {
      const output = execSync(`node ${testFile}`, { 
        encoding: 'utf8',
        timeout: 30000 // 30 sekunder timeout
      });
      
      this.log(`✅ ${testName} - PASSERAD`, COLORS.GREEN);
      this.passedTests++;
      
      this.results.push({
        name: testName,
        status: 'PASSED',
        output: output,
        duration: this.measureDuration()
      });
      
      return true;
    } catch (error) {
      this.log(`❌ ${testName} - MISSLYCKAD`, COLORS.RED);
      this.log(`Fel: ${error.message}`, COLORS.RED);
      this.failedTests++;
      
      this.results.push({
        name: testName,
        status: 'FAILED',
        error: error.message,
        duration: this.measureDuration()
      });
      
      return false;
    }
  }

  measureDuration() {
    return Date.now() - this.startTime;
  }

  async runAllTests() {
    this.log(`${COLORS.BOLD}🚀 Startar QA-testsvit för SoccerPredict Pro${COLORS.RESET}`);
    this.log(`📅 Datum: ${new Date().toLocaleString('sv-SE')}`);
    this.log(`📁 Testar ${TEST_FILES.length} testfiler\n`);

    for (const testFile of TEST_FILES) {
      if (fs.existsSync(testFile)) {
        await this.runTest(testFile);
        this.totalTests++;
      } else {
        this.log(`⚠️  Testfil saknas: ${testFile}`, COLORS.YELLOW);
      }
    }

    this.generateReport();
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);

    this.log(`\n${COLORS.BOLD}📊 TESTRESULTAT SAMMANFATTNING${COLORS.RESET}`);
    this.log(`${'='.repeat(50)}`);
    this.log(`📈 Totala tester: ${this.totalTests}`);
    this.log(`✅ Passerade: ${this.passedTests}`, COLORS.GREEN);
    this.log(`❌ Misslyckade: ${this.failedTests}`, this.failedTests > 0 ? COLORS.RED : COLORS.GREEN);
    this.log(`📊 Framgångsgrad: ${successRate}%`, successRate >= 90 ? COLORS.GREEN : COLORS.YELLOW);
    this.log(`⏱️  Total tid: ${(duration / 1000).toFixed(2)}s`);

    // Generera detaljerad rapport
    this.saveDetailedReport();

    // Slutstatus
    if (this.failedTests === 0) {
      this.log(`\n🎉 ALLA TESTER PASSERADE! Applikationen är redo för release.`, COLORS.GREEN);
      process.exit(0);
    } else {
      this.log(`\n⚠️  ${this.failedTests} TESTER MISSLYCKADES! Granska fel innan release.`, COLORS.RED);
      process.exit(1);
    }
  }

  saveDetailedReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.totalTests,
        passed: this.passedTests,
        failed: this.failedTests,
        successRate: ((this.passedTests / this.totalTests) * 100).toFixed(1),
        duration: Date.now() - this.startTime
      },
      results: this.results,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    const reportPath = `qa-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    this.log(`\n📄 Detaljerad rapport sparad: ${reportPath}`, COLORS.BLUE);

    // Generera HTML-rapport
    this.generateHTMLReport(reportData, reportPath.replace('.json', '.html'));
  }

  generateHTMLReport(data, filename) {
    const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Test Rapport - SoccerPredict Pro</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 24px; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .warning { color: #ffc107; }
        .test-results { margin-top: 20px; }
        .test-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 6px; border-left: 4px solid #ddd; }
        .test-item.passed { border-left-color: #28a745; }
        .test-item.failed { border-left-color: #dc3545; }
        .test-name { font-weight: bold; margin-bottom: 5px; }
        .test-status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .error-details { background: #fff3cd; padding: 10px; margin-top: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 QA Test Rapport</h1>
            <h2>SoccerPredict Pro</h2>
            <p>Genererad: ${new Date(data.timestamp).toLocaleString('sv-SE')}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <h3>Totala Tester</h3>
                <div class="value">${data.summary.total}</div>
            </div>
            <div class="metric">
                <h3>Passerade</h3>
                <div class="value passed">${data.summary.passed}</div>
            </div>
            <div class="metric">
                <h3>Misslyckade</h3>
                <div class="value ${data.summary.failed > 0 ? 'failed' : 'passed'}">${data.summary.failed}</div>
            </div>
            <div class="metric">
                <h3>Framgångsgrad</h3>
                <div class="value ${data.summary.successRate >= 90 ? 'passed' : 'warning'}">${data.summary.successRate}%</div>
            </div>
            <div class="metric">
                <h3>Total Tid</h3>
                <div class="value">${(data.summary.duration / 1000).toFixed(2)}s</div>
            </div>
        </div>

        <div class="test-results">
            <h3>📋 Detaljerade Testresultat</h3>
            ${data.results.map(result => `
                <div class="test-item ${result.status.toLowerCase()}">
                    <div class="test-name">${result.name}</div>
                    <span class="test-status status-${result.status.toLowerCase()}">${result.status}</span>
                    ${result.error ? `<div class="error-details">Fel: ${result.error}</div>` : ''}
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #e9ecef; border-radius: 6px;">
            <h3>🔧 Systeminformation</h3>
            <p><strong>Node.js Version:</strong> ${data.environment.nodeVersion}</p>
            <p><strong>Platform:</strong> ${data.environment.platform}</p>
            <p><strong>Arkitektur:</strong> ${data.environment.arch}</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(filename, html);
    this.log(`📊 HTML-rapport sparad: ${filename}`, COLORS.BLUE);
  }
}

// Kör testsviten
const runner = new QATestRunner();
runner.runAllTests().catch(error => {
  console.error('Fel vid körning av testsvit:', error);
  process.exit(1);
});