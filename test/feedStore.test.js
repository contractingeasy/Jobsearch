const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createFeedStore } = require('../lib/feedStore');
const { createFileAdapter } = require('../lib/fileAdapter');

function newStore() {
  const dataFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'jobsearch-feeds-')), 'feeds.json');
  return createFeedStore(createFileAdapter(dataFile));
}

test('getAll returns an empty array with no feeds', async () => {
  const store = newStore();
  assert.deepEqual(await store.getAll(), []);
});

test('create adds a feed, defaulting label to the url', async () => {
  const store = newStore();
  const feed = await store.create({ url: 'https://example.com/jobs.rss' });

  assert.equal(feed.url, 'https://example.com/jobs.rss');
  assert.equal(feed.label, 'https://example.com/jobs.rss');
  assert.ok(feed.id);
  assert.equal((await store.getAll()).length, 1);
});

test('create uses a provided label', async () => {
  const store = newStore();
  const feed = await store.create({ url: 'https://example.com/jobs.rss', label: 'Example Jobs' });
  assert.equal(feed.label, 'Example Jobs');
});

test('create requires a url', async () => {
  const store = newStore();
  await assert.rejects(() => store.create({ label: 'No URL' }), /url is required/);
});

test('create rejects an invalid url', async () => {
  const store = newStore();
  await assert.rejects(() => store.create({ url: 'not-a-url' }), /valid http\(s\) URL/);
  await assert.rejects(() => store.create({ url: 'ftp://example.com/feed' }), /valid http\(s\) URL/);
});

test('remove deletes a feed and returns true', async () => {
  const store = newStore();
  const feed = await store.create({ url: 'https://example.com/jobs.rss' });

  assert.equal(await store.remove(feed.id), true);
  assert.deepEqual(await store.getAll(), []);
});

test('remove returns false for an unknown id', async () => {
  const store = newStore();
  assert.equal(await store.remove('missing-id'), false);
});
