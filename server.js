const path = require('path');
const express = require('express');
const RssParser = require('rss-parser');
const { createStore } = require('./lib/store');
const { createFeedStore } = require('./lib/feedStore');
const { createFileAdapter } = require('./lib/fileAdapter');
const { aggregateJobs } = require('./lib/jobAggregator');

const dataFile = process.env.JOBSEARCH_DATA_FILE || path.join(__dirname, 'data', 'applications.json');
const feedsFile = process.env.JOBSEARCH_FEEDS_FILE || path.join(__dirname, 'data', 'feeds.json');
const store = createStore(createFileAdapter(dataFile));
const feedStore = createFeedStore(createFileAdapter(feedsFile));
const rssParser = new RssParser();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/applications', async (req, res) => {
  res.json(await store.getAll());
});

app.post('/api/applications', async (req, res) => {
  try {
    const application = await store.create(req.body);
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/applications/:id', async (req, res) => {
  try {
    const application = await store.update(req.params.id, req.body);
    if (!application) return res.status(404).json({ error: 'application not found' });
    res.json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/applications/:id', async (req, res) => {
  const removed = await store.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'application not found' });
  res.status(204).end();
});

app.get('/api/feeds', async (req, res) => {
  res.json(await feedStore.getAll());
});

app.post('/api/feeds', async (req, res) => {
  try {
    const feed = await feedStore.create(req.body);
    res.status(201).json(feed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/feeds/:id', async (req, res) => {
  const removed = await feedStore.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'feed not found' });
  res.status(204).end();
});

app.get('/api/jobs', async (req, res) => {
  const feeds = await feedStore.getAll();
  const result = await aggregateJobs(
    { keywords: req.query.keywords, location: req.query.location },
    feeds,
    { rssOptions: { parser: rssParser } }
  );
  res.json(result);
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Jobsearch running at http://localhost:${PORT}`));
}

module.exports = app;
