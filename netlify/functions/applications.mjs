import { createStore } from '../../lib/store.js';
import { createBlobAdapter } from '../../lib/blobAdapter.mjs';

const store = createStore(createBlobAdapter());

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async (req) => {
  if (req.method === 'GET') {
    const applications = await store.getAll();
    return json(applications);
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const application = await store.create(body);
      return json(application, 201);
    } catch (err) {
      return json({ error: err.message }, 400);
    }
  }

  return json({ error: 'method not allowed' }, 405);
};

export const config = {
  path: '/api/applications',
};
