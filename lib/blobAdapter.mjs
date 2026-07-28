import { getStore } from '@netlify/blobs';

export function createBlobAdapter(key, storeName = 'jobsearch') {
  function store() {
    return getStore({ name: storeName, consistency: 'strong' });
  }

  async function readAll() {
    const data = await store().get(key, { type: 'json' });
    return data || [];
  }

  async function writeAll(items) {
    await store().setJSON(key, items);
  }

  return { readAll, writeAll };
}
