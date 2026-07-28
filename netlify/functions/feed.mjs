import { createFeedStore } from '../../lib/feedStore.js';
import { createBlobAdapter } from '../../lib/blobAdapter.mjs';

const feedStore = createFeedStore(createBlobAdapter('feeds'));

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async (req, context) => {
  const { id } = context.params;

  if (req.method === 'DELETE') {
    const removed = await feedStore.remove(id);
    if (!removed) return json({ error: 'feed not found' }, 404);
    return new Response(null, { status: 204 });
  }

  return json({ error: 'method not allowed' }, 405);
};

export const config = {
  path: '/api/feeds/:id',
};
