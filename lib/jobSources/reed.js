const REED_SEARCH_URL = 'https://www.reed.co.uk/api/1.0/search';

async function searchReed({ keywords, location } = {}, { apiKey = process.env.REED_API_KEY, fetchImpl = fetch } = {}) {
  if (!apiKey) return [];

  const url = new URL(REED_SEARCH_URL);
  if (keywords) url.searchParams.set('keywords', keywords);
  if (location) url.searchParams.set('locationName', location);

  const auth = Buffer.from(`${apiKey}:`).toString('base64');
  const response = await fetchImpl(url, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    throw new Error(`Reed API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return (data.results || []).map((job) => ({
    id: `reed-${job.jobId}`,
    title: job.jobTitle,
    company: job.employerName,
    location: job.locationName,
    url: job.jobUrl,
    source: 'Reed',
    publishedAt: job.date || null,
  }));
}

module.exports = { searchReed };
