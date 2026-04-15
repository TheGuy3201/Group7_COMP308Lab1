import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { RECENT_SOURCES } from './sources.js';

const projectRoot = process.cwd();

const checks = [];

function addCheck(name, passed, weight, detail = '') {
  checks.push({ name, passed, weight, detail });
}

async function fileExists(relativePath) {
  try {
    await access(path.join(projectRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const requiredFiles = [
    'README.md',
    'Exercise1_Report.md',
    'generateReport.js',
    'summarizer.js',
    'server.js',
    'public/index.html',
    'public/app.js',
    'public/styles.css'
  ];

  const existenceResults = await Promise.all(requiredFiles.map((file) => fileExists(file)));
  const allRequiredFiles = existenceResults.every(Boolean);
  const missingFiles = requiredFiles.filter((_, idx) => !existenceResults[idx]);

  addCheck(
    'Required project files present',
    allRequiredFiles,
    20,
    allRequiredFiles ? '' : `Missing: ${missingFiles.join(', ')}`
  );

  const readme = await readFile(path.join(projectRoot, 'README.md'), 'utf-8');
  const report = await readFile(path.join(projectRoot, 'Exercise1_Report.md'), 'utf-8');
  const packageJsonRaw = await readFile(path.join(projectRoot, 'package.json'), 'utf-8');
  const packageJson = JSON.parse(packageJsonRaw);

  const hasReadmeProcessDocs =
    readme.includes('How the Summarizer Was Implemented') &&
    readme.includes('How Articles Were Selected') &&
    readme.includes('How Testing Was Done');
  addCheck('README process documentation sections', hasReadmeProcessDocs, 15);

  const hasReadmeRunGuide =
    readme.includes('Run Instructions (Code + UI)') &&
    readme.includes('npm run summarize') &&
    readme.includes('npm run ui');
  addCheck('README run instructions for CLI and UI', hasReadmeRunGuide, 15);

  const readmeHasGemini = /gemini/i.test(readme);
  addCheck(
    'README is OpenAI-only (no Gemini references)',
    !readmeHasGemini,
    5,
    readmeHasGemini ? 'Found Gemini references in README.' : ''
  );

  const hasReportSections =
    report.includes('## I. Impact of Emerging Technologies to the Environment') &&
    report.includes('## II. Sustainable Solutions Provided by Top Software Makers');
  addCheck('Report includes both required summary sections', hasReportSections, 15);

  const reportLinks = report.match(/https:\/\//g) || [];
  addCheck(
    'Report includes recent article links',
    reportLinks.length >= 4,
    10,
    reportLinks.length >= 4 ? '' : `Found ${reportLinks.length} links.`
  );

  const scripts = packageJson?.scripts || {};
  const hasCoreScripts =
    Boolean(scripts.summarize) &&
    Boolean(scripts['summarize:list-sources']) &&
    Boolean(scripts.ui) &&
    Boolean(scripts.test);
  addCheck('Core npm scripts are configured', hasCoreScripts, 10);

  const sources = RECENT_SOURCES;
  const sourceQuality =
    sources.length >= 4 &&
    sources.every((source) => source.url.startsWith('https://') && source.recencyYear >= 2024);
  addCheck('Source catalog quality (recent + HTTPS)', sourceQuality, 10);

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);

  console.log('Submission Check (Excluding OpenAI Billing)');
  console.log('-------------------------------------------');
  for (const check of checks) {
    const mark = check.passed ? 'PASS' : 'FAIL';
    const suffix = check.detail ? ` | ${check.detail}` : '';
    console.log(`[${mark}] ${check.name} (${check.weight} pts)${suffix}`);
  }
  console.log('-------------------------------------------');
  console.log(`Score: ${earned}/${totalWeight}`);

  if (earned < totalWeight) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error('Submission check failed:', error.message || error);
  process.exit(1);
});
