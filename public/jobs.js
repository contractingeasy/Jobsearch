const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = {
  applications: document.getElementById('tab-applications'),
  'find-jobs': document.getElementById('tab-find-jobs'),
};

function activateTab(name) {
  tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === name);
  });
  Object.entries(tabPanels).forEach(([key, panel]) => {
    panel.hidden = key !== name;
  });
}

tabButtons.forEach((button) => {
  button.addEventListener('click', () => activateTab(button.dataset.tab));
});

activateTab('applications');

const jobSearchForm = document.getElementById('job-search-form');
const jobsBody = document.getElementById('jobs-body');
const jobSearchError = document.getElementById('job-search-error');
const jobSearchEmpty = document.getElementById('job-search-empty');

const feedForm = document.getElementById('feed-form');
const feedsList = document.getElementById('feeds-list');
const feedError = document.getElementById('feed-error');

function showJobSearchError(message) {
  jobSearchError.textContent = message;
  jobSearchError.hidden = false;
}

function clearJobSearchError() {
  jobSearchError.hidden = true;
  jobSearchError.textContent = '';
}

function formatDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function trackJob(job) {
  document.getElementById('company').value = job.company || '';
  document.getElementById('role').value = job.title || '';
  document.getElementById('link').value = job.url || '';
  activateTab('applications');
}

function renderJobRow(job) {
  const row = document.createElement('tr');

  const titleCell = document.createElement('td');
  titleCell.textContent = job.title;

  const companyCell = document.createElement('td');
  companyCell.textContent = job.company || '';

  const locationCell = document.createElement('td');
  locationCell.textContent = job.location || '';

  const sourceCell = document.createElement('td');
  sourceCell.textContent = job.source || '';

  const dateCell = document.createElement('td');
  dateCell.textContent = formatDate(job.publishedAt);

  const actionsCell = document.createElement('td');
  if (job.url) {
    const viewLink = document.createElement('a');
    viewLink.href = job.url;
    viewLink.target = '_blank';
    viewLink.rel = 'noopener noreferrer';
    viewLink.textContent = 'View';
    actionsCell.appendChild(viewLink);
  }

  const trackButton = document.createElement('button');
  trackButton.type = 'button';
  trackButton.textContent = 'Track';
  trackButton.addEventListener('click', () => trackJob(job));
  actionsCell.appendChild(trackButton);

  row.append(titleCell, companyCell, locationCell, sourceCell, dateCell, actionsCell);
  return row;
}

async function searchJobs() {
  clearJobSearchError();
  jobSearchEmpty.hidden = true;
  jobsBody.innerHTML = '';

  const keywords = document.getElementById('job-keywords').value;
  const location = document.getElementById('job-location').value;

  const params = new URLSearchParams();
  if (keywords) params.set('keywords', keywords);
  if (location) params.set('location', location);

  const response = await fetch(`/api/jobs?${params.toString()}`);
  if (!response.ok) {
    showJobSearchError('Failed to search for jobs.');
    return;
  }

  const { jobs, errors } = await response.json();

  if (errors && errors.length > 0) {
    showJobSearchError(errors.join(' | '));
  }

  if (jobs.length === 0) {
    jobSearchEmpty.textContent = 'No jobs found. Try different keywords, or add an RSS feed source below.';
    jobSearchEmpty.hidden = false;
    return;
  }

  jobs.forEach((job) => jobsBody.appendChild(renderJobRow(job)));
}

jobSearchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchJobs();
});

function showFeedError(message) {
  feedError.textContent = message;
  feedError.hidden = false;
}

function clearFeedError() {
  feedError.hidden = true;
  feedError.textContent = '';
}

function renderFeedItem(feed) {
  const item = document.createElement('li');

  const label = document.createElement('span');
  label.textContent = feed.label;

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.textContent = 'Remove';
  removeButton.className = 'delete';
  removeButton.addEventListener('click', async () => {
    await fetch(`/api/feeds/${feed.id}`, { method: 'DELETE' });
    await loadFeeds();
  });

  item.append(label, removeButton);
  return item;
}

async function loadFeeds() {
  const response = await fetch('/api/feeds');
  const feeds = await response.json();
  feedsList.innerHTML = '';
  feeds.forEach((feed) => feedsList.appendChild(renderFeedItem(feed)));
}

feedForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFeedError();

  const body = {
    label: document.getElementById('feed-label').value,
    url: document.getElementById('feed-url').value,
  };

  const response = await fetch('/api/feeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    feedForm.reset();
    await loadFeeds();
  } else {
    const { error } = await response.json();
    showFeedError(error);
  }
});

loadFeeds();
