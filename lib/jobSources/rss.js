function normalizeItem(item, feedLabel) {
  return {
    id: `rss-${item.guid || item.link}`,
    title: item.title || '(untitled)',
    company: feedLabel,
    location: '',
    url: item.link || '',
    source: feedLabel,
    publishedAt: item.isoDate || item.pubDate || null,
  };
}

async function fetchFeed(feed, { parser }) {
  try {
    const parsed = await parser.parseURL(feed.url);
    return (parsed.items || []).map((item) => normalizeItem(item, feed.label));
  } catch (err) {
    throw new Error(`Failed to fetch feed "${feed.label}": ${err.message}`);
  }
}

async function searchRssFeeds(feeds, { parser } = {}) {
  const results = await Promise.allSettled(feeds.map((feed) => fetchFeed(feed, { parser })));

  const jobs = [];
  const errors = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      jobs.push(...result.value);
    } else {
      errors.push(result.reason.message);
    }
  });

  return { jobs, errors };
}

module.exports = { searchRssFeeds };
