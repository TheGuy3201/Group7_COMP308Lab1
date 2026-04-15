import 'dotenv/config';
import { generateSummary, getRecentSources, prepareSummaryInput } from './summarizer.js';

function parseArgs(argv) {
  const options = {
    selectedSourceIds: [],
    additionalContext: '',
    listSources: false,
    modelName: '',
    dryRun: false
  };

  for (const arg of argv) {
    if (arg === '--list-sources') {
      options.listSources = true;
      continue;
    }

    if (arg.startsWith('--sources=')) {
      const rawIds = arg.replace('--sources=', '');
      options.selectedSourceIds = rawIds
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      continue;
    }

    if (arg.startsWith('--focus=')) {
      options.additionalContext = arg.replace('--focus=', '').trim();
      continue;
    }

    if (arg.startsWith('--model=')) {
      options.modelName = arg.replace('--model=', '').trim();
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

function printSourceList() {
  const sources = getRecentSources();
  console.log('Available source IDs for --sources=...');
  for (const source of sources) {
    console.log(`- ${source.id} | ${source.provider} | ${source.title}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.listSources) {
    printSourceList();
    return;
  }

  if (options.dryRun) {
    const { selectedSources, prompt } = prepareSummaryInput(options);

    console.log('===== DRY RUN (NO API CALL) =====');
    console.log('Selected sources:');
    for (const source of selectedSources) {
      console.log(`- ${source.title} (${source.url})`);
    }

    console.log('\nGenerated prompt:\n');
    console.log(prompt);
    console.log('\n===== END DRY RUN =====');
    return;
  }

  const { summary, selectedSources, modelUsed, providerUsed } = await generateSummary(options);

  console.log('===== SOURCES USED =====');
  for (const source of selectedSources) {
    console.log(`- ${source.title} (${source.url})`);
  }

  console.log('\n===== GENERATED REPORT (Markdown) =====\n');
  console.log(summary);

  console.log('\n===== METADATA =====');
  console.log(`Provider: ${providerUsed}`);
  console.log(`Model: ${modelUsed}`);
  console.log(`Source count: ${selectedSources.length}`);
}

main().catch((error) => {
  console.error('Error generating report:', error.message || error);
  process.exit(1);
});
