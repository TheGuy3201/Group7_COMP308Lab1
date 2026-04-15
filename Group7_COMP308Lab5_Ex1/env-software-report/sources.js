export const RECENT_SOURCES = [
  {
    id: 'microsoft-planetary-computer',
    provider: 'Microsoft',
    title: 'A Planetary Computer for a Sustainable Future',
    url: 'https://planetarycomputer.microsoft.com/',
    published: 'Platform overview (active in 2025)',
    recencyYear: 2025,
    excerpt:
      'Microsoft describes a multi-petabyte environmental data platform with APIs and applications that support sustainability decision-making at global scale.'
  },
  {
    id: 'amazon-aws-sustainability',
    provider: 'Amazon AWS',
    title: 'AWS Cloud Sustainability',
    url: 'https://www.aboutamazon.com/sustainability/aws-cloud',
    published: '2024 report summary with 2025 updates',
    recencyYear: 2025,
    excerpt:
      'AWS reports 100% renewable electricity matching in 2024, data center efficiency metrics, and cloud migration carbon reduction findings.'
  },
  {
    id: 'google-environmental-report-2025',
    provider: 'Google',
    title: 'Google 2025 Environmental Report',
    url: 'https://sustainability.google/',
    published: '2025 environmental report',
    recencyYear: 2025,
    excerpt:
      'Google outlines product-enabled emissions reductions, cleaner infrastructure operations, and sustainability programs supported by AI and cloud tooling.'
  },
  {
    id: 'google-sustainability-stories-2026',
    provider: 'Google',
    title: 'Google Sustainability Stories (Recent 2026 posts)',
    url: 'https://sustainability.google/stories/',
    published: 'Story feed with March and April 2026 posts',
    recencyYear: 2026,
    excerpt:
      'Recent stories include device life extension, water stewardship, and satellite imagery projects for forest protection.'
  },
  {
    id: 'meta-sustainability',
    provider: 'Meta',
    title: 'Meta Sustainability',
    url: 'https://sustainability.atmeta.com/',
    published: 'Sustainability program updates (2025)',
    recencyYear: 2025,
    excerpt:
      'Meta publishes ongoing sustainability initiatives related to data centers, emissions reduction, and operational efficiency.'
  }
];

export function getSourcesByIds(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return RECENT_SOURCES;
  }

  const idSet = new Set(ids);
  const filtered = RECENT_SOURCES.filter((source) => idSet.has(source.id));

  return filtered.length > 0 ? filtered : RECENT_SOURCES;
}
