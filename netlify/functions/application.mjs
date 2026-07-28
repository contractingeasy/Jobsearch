import { createStore } from '../../lib/store.js';
import { createBlobAdapter } from '../../lib/blobAdapter.mjs';

const store = createStore(createBlobAdapter('applications'));

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async (req, context) => {
  const { id } = context.params;

  if (req.method === 'PATCH') {
    try {
      const body = await req.json();
      const application = await store.update(id, body);
      if (!application) return json({ error: 'application not found' }, 404);
      return json(application);
    } catch (err) {
      return json({ error: err.message }, 400);
    }
  }

  if (req.method === 'DELETE') {
    const removed = await store.remove(id);
    if (!removed) return json({ error: 'application not found' }, 404);
    return new Response(null, { status: 204 });
  }

  return json({ error: 'method not allowed' }, 405);
};

export const config = {
  path: '/api/applications/:id',
};
