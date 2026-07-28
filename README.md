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

- Add job applications with company, role, date applied, status, and a link to the posting.
- Edit or delete an existing application.
- Update an application's status (applied, interview, offer, rejected).
- Search by company/role and filter by status.
- Data is stored locally in `data/applications.json`.

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
