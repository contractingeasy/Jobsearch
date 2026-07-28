const test = require('node:test');
const assert = require('node:assert/strict');
const { aggregateJobs, matchesFilter } = require('../lib/jobAggregator');

function job(overrides) {
  return {
    id: 'id-1',
    title: 'Software Engineer',
    company: 'Acme',
    location: 'London',
    url: 'https://example.com/1',
    source: 'Example',
    publishedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

test('matchesFilter matches on title or company, case-insensitively', () => {
  assert.equal(matchesFilter(job({ title: 'Backend Engineer' }), { keywords: 'engineer' }), true);
  assert.equal(matchesFilter(job({ company: 'Reedster' }), { keywords: 'reedster' }), true);
  assert.equal(matchesFilter(job({ title: 'Designer', company: 'Acme' }), { keywords: 'engineer' }), false);
});

test('matchesFilter matches on location substring', () => {
  assert.equal(matchesFilter(job({ location: 'Central London' }), { location: 'london' }), true);
  assert.equal(matchesFilter(job({ location: 'Manchester' }), { location: 'london' }), false);
});

test('aggregates and dedupes jobs from Reed and RSS sources', async () => {
  const searchReedFn = async () => [job({ id: 'reed-1', publishedAt: '2026-07-02T00:00:00.000Z' })];
  const searchRssFeedsFn = async () => ({
    jobs: [job({ id: 'rss-1', title: 'Frontend Engineer', publishedAt: '2026-07-01T00:00:00.000Z' })],
    errors: [],
  });

  const { jobs, errors } = await aggregateJobs({}, [], { searchReedFn, searchRssFeedsFn });

  assert.deepEqual(errors, []);
  assert.equal(jobs.length, 2);
  assert.equal(jobs[0].id, 'reed-1');
  assert.equal(jobs[1].id, 'rss-1');
});

test('removes duplicate ids across sources', async () => {
  const searchReedFn = async () => [job({ id: 'shared-id' })];
  const searchRssFeedsFn = async () => ({ jobs: [job({ id: 'shared-id' })], errors: [] });

  const { jobs } = await aggregateJobs({}, [], { searchReedFn, searchRssFeedsFn });

  assert.equal(jobs.length, 1);
});

test('filters RSS jobs by keyword/location client-side', async () => {
  const searchReedFn = async () => [];
  const searchRssFeedsFn = async () => ({
    jobs: [
      job({ id: 'rss-1', title: 'Software Engineer', location: 'London' }),
      job({ id: 'rss-2', title: 'Sales Manager', location: 'London' }),
    ],
    errors: [],
  });

  const { jobs } = await aggregateJobs({ keywords: 'engineer' }, [], { searchReedFn, searchRssFeedsFn });

  assert.deepEqual(jobs.map((j) => j.id), ['rss-1']);
});

test('collects Reed and RSS errors without failing the whole request', async () => {
  const searchReedFn = async () => {
    throw new Error('Reed is down');
  };
  const searchRssFeedsFn = async () => ({ jobs: [], errors: ['Failed to fetch feed "Bad Board": timeout'] });

  const { jobs, errors } = await aggregateJobs({}, [], { searchReedFn, searchRssFeedsFn });

  assert.deepEqual(jobs, []);
  assert.deepEqual(errors, ['Failed to fetch feed "Bad Board": timeout', 'Reed: Reed is down']);
});

test('sorts jobs by publishedAt descending, with undated jobs last', async () => {
  const searchReedFn = async () => [
    job({ id: 'a', publishedAt: '2026-06-01T00:00:00.000Z' }),
    job({ id: 'b', publishedAt: null }),
    job({ id: 'c', publishedAt: '2026-07-01T00:00:00.000Z' }),
  ];
  const searchRssFeedsFn = async () => ({ jobs: [], errors: [] });

  const { jobs } = await aggregateJobs({}, [], { searchReedFn, searchRssFeedsFn });

  assert.deepEqual(jobs.map((j) => j.id), ['c', 'a', 'b']);
});
