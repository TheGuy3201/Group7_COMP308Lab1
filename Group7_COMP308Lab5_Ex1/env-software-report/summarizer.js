import { RECENT_SOURCES, getSourcesByIds } from './sources.js';

function formatSourcesForPrompt(selectedSources) {
  return selectedSources
    .map(
      (source, index) =>
        [
          `Source ${index + 1}:`,
          `- Provider: ${source.provider}`,
          `- Title: ${source.title}`,
          `- URL: ${source.url}`,
          `- Published info: ${source.published}`,
          `- Recency year: ${source.recencyYear}`,
          `- Key details: ${source.excerpt}`
        ].join('\n')
    )
    .join('\n\n');
}

export function getRecentSources() {
  return RECENT_SOURCES;
}

export function buildPrompt({ selectedSourceIds = [], additionalContext = '' } = {}) {
  const selectedSources = getSourcesByIds(selectedSourceIds);
  const sourcesText = formatSourcesForPrompt(selectedSources);

  const focusText = additionalContext
    ? `Additional focus from the user: ${additionalContext}`
    : 'Additional focus from the user: none';

  return `
You are writing an academic-style summary report in formal English.

Goal:
- Analyze environmental impacts of emerging software technologies.
- Discuss sustainable initiatives from major software makers.
- Keep findings up to date using the recent sources below.

Recent sources:
${sourcesText}

${focusText}

Requirements:
1) Produce around 850-1200 words.
2) Use clear section headings:
   - Introduction
   - Environmental impact of emerging software technologies
   - Current sustainability initiatives by major software makers
   - Challenges and trade-offs
   - Conclusion
3) Include a section titled "Recent source links" with bullet points containing title + URL from the provided sources.
4) Do not invent citations, DOIs, or URLs.
5) Explicitly mention that the findings are based on the latest available public updates from these sources.
6) Output in Markdown.
`.trim();
}

export function prepareSummaryInput({ selectedSourceIds = [], additionalContext = '' } = {}) {
  const selectedSources = getSourcesByIds(selectedSourceIds);
  const prompt = buildPrompt({ selectedSourceIds, additionalContext });

  return {
    selectedSources,
    prompt
  };
}

export async function generateSummary({
  selectedSourceIds = [],
  additionalContext = '',
  modelName
} = {}) {
  const { selectedSources, prompt } = prepareSummaryInput({
    selectedSourceIds,
    additionalContext
  });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in .env');
  }

  const activeModelName = modelName || process.env.OPENAI_MODEL || 'gpt-4o-mini';

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: activeModelName,
        messages: [
          {
            role: 'system',
            content:
              'You are an academic writing assistant. Follow instructions exactly and return structured Markdown output.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4
      })
    });
  } catch (error) {
    throw new Error(`Network error while calling OpenAI API: ${error.message || String(error)}`);
  }

  if (!response.ok) {
    const detail = await response.text();

    let parsedDetail;
    try {
      parsedDetail = JSON.parse(detail);
    } catch {
      parsedDetail = null;
    }

    const apiMessage = parsedDetail?.error?.message;
    const apiCode = parsedDetail?.error?.code;

    if (response.status === 429 || apiCode === 'insufficient_quota') {
      throw new Error(
        'OpenAI quota exceeded for this API key. Update billing/quota, then retry generation.'
      );
    }

    throw new Error(
      `OpenAI request failed (${response.status})${apiMessage ? `: ${apiMessage}` : `: ${detail}`}`
    );
  }

  const data = await response.json();
  const summary = data?.choices?.[0]?.message?.content?.trim();

  if (!summary) {
    throw new Error('OpenAI response did not include summary content.');
  }

  return {
    summary,
    selectedSources,
    modelUsed: activeModelName,
    providerUsed: 'openai'
  };
}
