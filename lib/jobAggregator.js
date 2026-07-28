const { searchReed } = require('./jobSources/reed');
const { searchRssFeeds } = require('./jobSources/rss');

function matchesFilter(job, { keywords, location } = {}) {
  const kw = (keywords || '').trim().toLowerCase();
  const loc = (location || '').trim().toLowerCase();

  const matchesKeywords =
    !kw || job.title.toLowerCase().includes(kw) || (job.company || '').toLowerCase().includes(kw);
  const matchesLocation = !loc || (job.location || '').toLowerCase().includes(loc);

  return matchesKeywords && matchesLocation;
}

function dedupe(jobs) {
  const seen = new Set();
  return jobs.filter((job) => {
    if (seen.has(job.id)) return false;
    seen.add(job.id);
    return true;
  });
}

function sortByDate(jobs) {
  return [...jobs].sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0;
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });
}

/**
 * @param {{keywords?: string, location?: string}} filter
 * @param {Array<{id: string, label: string, url: string}>} feeds
 */
async function aggregateJobs(
  filter = {},
  feeds = [],
  { reedOptions, rssOptions, searchReedFn = searchReed, searchRssFeedsFn = searchRssFeeds } = {}
) {
  const [reedOutcome, rssResult] = await Promise.all([
    searchReedFn(filter, reedOptions)
      .then((jobs) => ({ jobs }))
      .catch((err) => ({ jobs: [], error: err.message })),
    searchRssFeedsFn(feeds, rssOptions),
  ]);

  const errors = [...rssResult.errors];
  if (reedOutcome.error) errors.push(`Reed: ${reedOutcome.error}`);

  // Reed filters server-side by keywords/location already; RSS feeds don't support that, so filter them here.
  const filteredRssJobs = rssResult.jobs.filter((job) => matchesFilter(job, filter));
  const jobs = sortByDate(dedupe([...reedOutcome.jobs, ...filteredRssJobs]));

  return { jobs, errors };
}

module.exports = { aggregateJobs, matchesFilter };
