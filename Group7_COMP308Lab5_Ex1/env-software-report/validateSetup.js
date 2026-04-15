import assert from 'node:assert/strict';
import { buildPrompt, getRecentSources } from './summarizer.js';

const sources = getRecentSources();
assert.ok(sources.length >= 4, 'Expected at least 4 recent sources.');

for (const source of sources) {
  assert.ok(source.recencyYear >= 2024, `Source is not recent enough: ${source.id}`);
  assert.ok(source.url.startsWith('https://'), `Source URL must use https: ${source.id}`);
}

const selectedIds = sources.slice(0, 2).map((source) => source.id);
const prompt = buildPrompt({
  selectedSourceIds: selectedIds,
  additionalContext: 'Compare data center energy and water initiatives.'
});

assert.ok(prompt.includes('Recent source links'), 'Prompt must require source links section.');
assert.ok(
  prompt.includes('Compare data center energy and water initiatives.'),
  'Prompt must include additional user focus.'
);
for (const source of sources.slice(0, 2)) {
  assert.ok(prompt.includes(source.url), `Prompt should include selected source URL: ${source.id}`);
}

console.log('Validation passed: source set and prompt requirements are configured correctly.');
