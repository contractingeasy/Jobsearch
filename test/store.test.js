const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createStore } = require('../lib/store');
const { createFileAdapter } = require('../lib/fileAdapter');

function newStore() {
  const dataFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'jobsearch-')), 'applications.json');
  return { store: createStore(createFileAdapter(dataFile)), dataFile };
}

test('getAll returns an empty array when no data file exists', async () => {
  const { store } = newStore();
  assert.deepEqual(await store.getAll(), []);
});

test('create adds an application with defaults', async () => {
  const { store } = newStore();
  const application = await store.create({ company: 'Acme', role: 'Engineer' });

  assert.equal(application.company, 'Acme');
  assert.equal(application.role, 'Engineer');
  assert.equal(application.status, 'applied');
  assert.ok(application.id);
  assert.equal((await store.getAll()).length, 1);
});

test('create requires company and role', async () => {
  const { store } = newStore();
  await assert.rejects(() => store.create({ role: 'Engineer' }), /company is required/);
  await assert.rejects(() => store.create({ company: 'Acme' }), /role is required/);
});

test('create rejects an invalid status', async () => {
  const { store } = newStore();
  await assert.rejects(
    () => store.create({ company: 'Acme', role: 'Engineer', status: 'ghosted' }),
    /status must be one of/
  );
});

test('update changes an existing application', async () => {
  const { store } = newStore();
  const created = await store.create({ company: 'Acme', role: 'Engineer' });

  const updated = await store.update(created.id, { status: 'interview' });

  assert.equal(updated.status, 'interview');
  assert.equal((await store.getAll())[0].status, 'interview');
});

test('update returns null for an unknown id', async () => {
  const { store } = newStore();
  assert.equal(await store.update('missing-id', { status: 'interview' }), null);
});

test('update rejects an invalid status', async () => {
  const { store } = newStore();
  const created = await store.create({ company: 'Acme', role: 'Engineer' });
  await assert.rejects(() => store.update(created.id, { status: 'ghosted' }), /status must be one of/);
});

test('update rejects clearing company or role', async () => {
  const { store } = newStore();
  const created = await store.create({ company: 'Acme', role: 'Engineer' });
  await assert.rejects(() => store.update(created.id, { company: '  ' }), /company is required/);
  await assert.rejects(() => store.update(created.id, { role: '' }), /role is required/);
});

test('update trims company, role, and link', async () => {
  const { store } = newStore();
  const created = await store.create({ company: 'Acme', role: 'Engineer' });

  const updated = await store.update(created.id, {
    company: '  Globex  ',
    role: '  Senior Engineer  ',
    link: '  https://example.com/job  ',
  });

  assert.equal(updated.company, 'Globex');
  assert.equal(updated.role, 'Senior Engineer');
  assert.equal(updated.link, 'https://example.com/job');
});

test('remove deletes an application and returns true', async () => {
  const { store } = newStore();
  const created = await store.create({ company: 'Acme', role: 'Engineer' });

  assert.equal(await store.remove(created.id), true);
  assert.deepEqual(await store.getAll(), []);
});

test('remove returns false for an unknown id', async () => {
  const { store } = newStore();
  assert.equal(await store.remove('missing-id'), false);
});

test('data persists across store instances backed by the same file', async () => {
  const { store: storeA, dataFile } = newStore();
  await storeA.create({ company: 'Acme', role: 'Engineer' });

  const storeB = createStore(createFileAdapter(dataFile));
  assert.equal((await storeB.getAll()).length, 1);
});
