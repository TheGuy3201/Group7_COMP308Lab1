const sourceListElement = document.getElementById('sourceList');
const summaryForm = document.getElementById('summaryForm');
const focusInput = document.getElementById('focusInput');
const reportOutput = document.getElementById('reportOutput');
const statusMessage = document.getElementById('statusMessage');
const generateButton = document.getElementById('generateButton');

function setStatus(message, kind = 'info') {
  statusMessage.textContent = message;
  statusMessage.dataset.kind = kind;
}

function renderSources(sources) {
  sourceListElement.innerHTML = '';

  for (const source of sources) {
    const label = document.createElement('label');
    label.className = 'source-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'sourceId';
    checkbox.value = source.id;
    checkbox.checked = true;

    const meta = document.createElement('div');
    meta.className = 'source-meta';

    const title = document.createElement('p');
    title.className = 'source-title';
    title.textContent = `${source.provider}: ${source.title}`;

    const details = document.createElement('p');
    details.className = 'source-details';
    details.textContent = `${source.published} | ${source.url}`;

    meta.appendChild(title);
    meta.appendChild(details);

    label.appendChild(checkbox);
    label.appendChild(meta);

    sourceListElement.appendChild(label);
  }
}

function getSelectedSourceIds() {
  const selected = Array.from(document.querySelectorAll('input[name="sourceId"]:checked'));
  return selected.map((checkbox) => checkbox.value);
}

async function loadSources() {
  setStatus('Loading recent sources...');
  try {
    const response = await fetch('/api/sources');
    if (!response.ok) {
      throw new Error(`Failed to load sources: ${response.status}`);
    }

    const data = await response.json();
    renderSources(data.sources || []);
    setStatus('Sources loaded. Select at least one and generate your report.', 'success');
  } catch (error) {
    setStatus(error.message || 'Could not load sources.', 'error');
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const selectedSourceIds = getSelectedSourceIds();
  if (selectedSourceIds.length === 0) {
    setStatus('Select at least one source before generating.', 'error');
    return;
  }

  generateButton.disabled = true;
  setStatus('Generating summary. This may take a moment...');
  reportOutput.textContent = 'Generating...';

  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selectedSourceIds,
        additionalContext: focusInput.value.trim()
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || `Request failed with ${response.status}`);
    }

    reportOutput.textContent = data.summary;
    const provider = data.providerUsed || 'unknown-provider';
    const model = data.modelUsed || 'unknown-model';
    setStatus(
      `Summary generated using ${data.selectedSources.length} source(s) via ${provider} (${model}).`,
      'success'
    );
  } catch (error) {
    const message = error.message || 'Generation failed.';
    const lower = message.toLowerCase();

    reportOutput.textContent = 'Generation failed.';
    if (lower.includes('quota') || lower.includes('429') || lower.includes('insufficient_quota')) {
      setStatus(
        'Generation failed due to OpenAI quota/billing limits. Your setup is correct; update quota and retry.',
        'error'
      );
      return;
    }

    setStatus(message, 'error');
  } finally {
    generateButton.disabled = false;
  }
}

summaryForm.addEventListener('submit', handleSubmit);
loadSources();
