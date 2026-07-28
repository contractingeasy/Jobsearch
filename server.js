const path = require('path');
const express = require('express');
const { createStore } = require('./lib/store');

const dataFile = process.env.JOBSEARCH_DATA_FILE || path.join(__dirname, 'data', 'applications.json');
const store = createStore(dataFile);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/applications', (req, res) => {
  res.json(store.getAll());
});

app.post('/api/applications', (req, res) => {
  try {
    const application = store.create(req.body);
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/applications/:id', (req, res) => {
  try {
    const application = store.update(req.params.id, req.body);
    if (!application) return res.status(404).json({ error: 'application not found' });
    res.json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/applications/:id', (req, res) => {
  const removed = store.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'application not found' });
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Jobsearch running at http://localhost:${PORT}`));
}

module.exports = app;
