const crypto = require('crypto');

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @param {{ readAll: () => Promise<Array>|Array, writeAll: (feeds: Array) => Promise<void>|void }} adapter
 */
function createFeedStore({ readAll, writeAll }) {
  async function getAll() {
    return readAll();
  }

  async function create({ label, url } = {}) {
    if (!url || !url.trim()) throw new Error('url is required');
    if (!isValidUrl(url.trim())) throw new Error('url must be a valid http(s) URL');

    const feeds = await readAll();
    const feed = {
      id: crypto.randomUUID(),
      label: label && label.trim() ? label.trim() : url.trim(),
      url: url.trim(),
    };
    feeds.push(feed);
    await writeAll(feeds);
    return feed;
  }

  async function remove(id) {
    const feeds = await readAll();
    const next = feeds.filter((f) => f.id !== id);
    if (next.length === feeds.length) return false;
    await writeAll(next);
    return true;
  }

  return { getAll, create, remove };
}

module.exports = { createFeedStore };
