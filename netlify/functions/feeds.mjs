import { createFeedStore } from '../../lib/feedStore.js';
import { createBlobAdapter } from '../../lib/blobAdapter.mjs';

const feedStore = createFeedStore(createBlobAdapter('feeds'));

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async (req) => {
  if (req.method === 'GET') {
    const feeds = await feedStore.getAll();
    return json(feeds);
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const feed = await feedStore.create(body);
      return json(feed, 201);
    } catch (err) {
      return json({ error: err.message }, 400);
    }
  }

  return json({ error: 'method not allowed' }, 405);
};

export const config = {
  path: '/api/feeds',
};
