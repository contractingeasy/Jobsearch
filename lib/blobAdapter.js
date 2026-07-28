const { getStore } = require('@netlify/blobs');

const KEY = 'applications';

function createBlobAdapter(storeName = 'jobsearch') {
  async function readAll() {
    const data = await getStore(storeName).get(KEY, { type: 'json' });
    return data || [];
  }

  async function writeAll(applications) {
    await getStore(storeName).setJSON(KEY, applications);
  }

  return { readAll, writeAll };
}

module.exports = { createBlobAdapter };
