const test = require('node:test');
const assert = require('node:assert/strict');
const { searchReed } = require('../lib/jobSources/reed');

test('returns an empty array when no API key is configured', async () => {
  const results = await searchReed({ keywords: 'engineer' }, { apiKey: undefined });
  assert.deepEqual(results, []);
});

test('sends Basic auth with the API key and no password', async () => {
  let capturedAuth;
  const fetchImpl = async (url, options) => {
    capturedAuth = options.headers.Authorization;
    return { ok: true, json: async () => ({ results: [] }) };
  };

  await searchReed({ keywords: 'engineer' }, { apiKey: 'my-key', fetchImpl });

  const expected = `Basic ${Buffer.from('my-key:').toString('base64')}`;
  assert.equal(capturedAuth, expected);
});

test('includes keywords and location as query params', async () => {
  let capturedUrl;
  const fetchImpl = async (url) => {
    capturedUrl = url;
    return { ok: true, json: async () => ({ results: [] }) };
  };

  await searchReed({ keywords: 'engineer', location: 'London' }, { apiKey: 'my-key', fetchImpl });

  assert.equal(capturedUrl.searchParams.get('keywords'), 'engineer');
  assert.equal(capturedUrl.searchParams.get('locationName'), 'London');
});

test('normalizes Reed results into the common job shape', async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({
      results: [
        {
          jobId: 123,
          jobTitle: 'Software Engineer',
          employerName: 'Acme',
          locationName: 'London',
          jobUrl: 'https://reed.co.uk/jobs/123',
          date: '2026-07-01',
        },
      ],
    }),
  });

  const results = await searchReed({ keywords: 'engineer' }, { apiKey: 'my-key', fetchImpl });

  assert.deepEqual(results, [
    {
      id: 'reed-123',
      title: 'Software Engineer',
      company: 'Acme',
      location: 'London',
      url: 'https://reed.co.uk/jobs/123',
      source: 'Reed',
      publishedAt: '2026-07-01',
    },
  ]);
});

test('throws when the API responds with an error status', async () => {
  const fetchImpl = async () => ({ ok: false, status: 401 });
  await assert.rejects(
    () => searchReed({ keywords: 'engineer' }, { apiKey: 'bad-key', fetchImpl }),
    /Reed API request failed with status 401/
  );
});
