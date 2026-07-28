import { getStore } from '@netlify/blobs';

const KEY = 'applications';

export function createBlobAdapter(storeName = 'jobsearch') {
  function store() {
    return getStore({ name: storeName, consistency: 'strong' });
  }

  async function readAll() {
    const data = await store().get(KEY, { type: 'json' });
    return data || [];
  }

  async function writeAll(applications) {
    await store().setJSON(KEY, applications);
  }

  return { readAll, writeAll };
}
