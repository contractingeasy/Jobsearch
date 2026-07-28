const test = require('node:test');
const assert = require('node:assert/strict');
const { searchRssFeeds } = require('../lib/jobSources/rss');

function stubParser(responses) {
  return {
    async parseURL(url) {
      const response = responses[url];
      if (response instanceof Error) throw response;
      return response;
    },
  };
}

test('normalizes RSS items into the common job shape', async () => {
  const parser = stubParser({
    'https://example.com/feed.rss': {
      items: [
        {
          title: 'Backend Engineer',
          link: 'https://example.com/jobs/1',
          guid: 'guid-1',
          isoDate: '2026-07-01T00:00:00.000Z',
        },
      ],
    },
  });

  const { jobs, errors } = await searchRssFeeds(
    [{ label: 'Example Board', url: 'https://example.com/feed.rss' }],
    { parser }
  );

  assert.deepEqual(errors, []);
  assert.deepEqual(jobs, [
    {
      id: 'rss-guid-1',
      title: 'Backend Engineer',
      company: 'Example Board',
      location: '',
      url: 'https://example.com/jobs/1',
      source: 'Example Board',
      publishedAt: '2026-07-01T00:00:00.000Z',
    },
  ]);
});

test('falls back to link when guid is missing, and a default title', async () => {
  const parser = stubParser({
    'https://example.com/feed.rss': {
      items: [{ link: 'https://example.com/jobs/2' }],
    },
  });

  const { jobs } = await searchRssFeeds(
    [{ label: 'Example Board', url: 'https://example.com/feed.rss' }],
    { parser }
  );

  assert.equal(jobs[0].id, 'rss-https://example.com/jobs/2');
  assert.equal(jobs[0].title, '(untitled)');
});

test('continues past a failing feed and reports its error', async () => {
  const parser = stubParser({
    'https://good.example.com/feed.rss': { items: [{ title: 'Good Job', link: 'https://good.example.com/1' }] },
    'https://bad.example.com/feed.rss': new Error('ECONNREFUSED'),
  });

  const { jobs, errors } = await searchRssFeeds(
    [
      { label: 'Good Board', url: 'https://good.example.com/feed.rss' },
      { label: 'Bad Board', url: 'https://bad.example.com/feed.rss' },
    ],
    { parser }
  );

  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].title, 'Good Job');
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Bad Board/);
  assert.match(errors[0], /ECONNREFUSED/);
});

test('returns empty results for an empty feed list', async () => {
  const { jobs, errors } = await searchRssFeeds([], {});
  assert.deepEqual(jobs, []);
  assert.deepEqual(errors, []);
});
