# Jobsearch

A project for tracking and organizing job search activity.

## Getting Started

This repository is in early development. Contributions and issue reports are welcome.

Install dependencies and start the app:

```bash
npm install
npm start
```

Then open http://localhost:3000 in your browser.

Run the tests:

```bash
npm test
```

## Features

**My Applications**
- Add job applications with company, role, date applied, status, and a link to the posting.
- Edit or delete an existing application.
- Update an application's status (applied, interview, offer, rejected).
- Search by company/role and filter by status.
- Data is stored locally in `data/applications.json`.

**Find Jobs**
- Search live job listings by keywords and location.
- Pulls from [Reed.co.uk's public API](https://www.reed.co.uk/developers/jobseeker) (requires an API key, see below) and any RSS feeds you add.
- Add RSS feed URLs from saved searches on other job boards (TotalJobs, CWJobs, JobServe, Monster UK, Jobs.ac.uk, Hays UK, etc.) to include them in results.
- "Track" a result to pre-fill it into the My Applications form.

> Not included: LinkedIn, Indeed, or Glassdoor. All three prohibit automated scraping in their terms of service, so this app intentionally only pulls from sources with a public API or an RSS feed meant for this purpose.

### Configuring the Reed API key

1. Register for a free API key at Reed's developer portal (reed.co.uk/developers).
2. Set it as an environment variable named `REED_API_KEY` — **you'll need to set this yourself**, not via an assistant, since it's a secret:
   - Locally: create a `.env` file (gitignored) or set `REED_API_KEY` in your shell before `npm start`.
   - On Netlify: `npx netlify env:set REED_API_KEY <your-key>`, or add it in Site settings → Environment variables in the Netlify dashboard.

Without a key configured, Reed results are simply skipped — RSS feed sources still work.

## Deployment (Netlify)

The app also runs on [Netlify](https://www.netlify.com/) as static files + serverless functions, using [Netlify Blobs](https://docs.netlify.com/blobs/overview/) for storage instead of the local JSON file.

Test it locally against Netlify's runtime (requires the project to be linked with `netlify link` first):

```bash
npm run dev:netlify
```

Deploy:

```bash
npx netlify deploy --prod
```
