import RssParser from 'rss-parser';
import { aggregateJobs } from '../../lib/jobAggregator.js';
import { createFeedStore } from '../../lib/feedStore.js';
import { createBlobAdapter } from '../../lib/blobAdapter.mjs';

const feedStore = createFeedStore(createBlobAdapter('feeds'));
const rssParser = new RssParser();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async (req) => {
  if (req.method !== 'GET') {
    return json({ error: 'method not allowed' }, 405);
  }

  const url = new URL(req.url);
  const keywords = url.searchParams.get('keywords') || undefined;
  const location = url.searchParams.get('location') || undefined;

  const feeds = await feedStore.getAll();
  const result = await aggregateJobs({ keywords, location }, feeds, {
    rssOptions: { parser: rssParser },
  });

  return json(result);
};

export const config = {
  path: '/api/jobs',
};
