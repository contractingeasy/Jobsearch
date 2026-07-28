const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createStore } = require('../lib/store');

function tempDataFile() {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'jobsearch-')), 'applications.json');
}

test('getAll returns an empty array when no data file exists', () => {
  const store = createStore(tempDataFile());
  assert.deepEqual(store.getAll(), []);
});

test('create adds an application with defaults', () => {
  const store = createStore(tempDataFile());
  const application = store.create({ company: 'Acme', role: 'Engineer' });

  assert.equal(application.company, 'Acme');
  assert.equal(application.role, 'Engineer');
  assert.equal(application.status, 'applied');
  assert.ok(application.id);
  assert.equal(store.getAll().length, 1);
});

test('create requires company and role', () => {
  const store = createStore(tempDataFile());
  assert.throws(() => store.create({ role: 'Engineer' }), /company is required/);
  assert.throws(() => store.create({ company: 'Acme' }), /role is required/);
});

test('create rejects an invalid status', () => {
  const store = createStore(tempDataFile());
  assert.throws(
    () => store.create({ company: 'Acme', role: 'Engineer', status: 'ghosted' }),
    /status must be one of/
  );
});

test('update changes an existing application', () => {
  const store = createStore(tempDataFile());
  const created = store.create({ company: 'Acme', role: 'Engineer' });

  const updated = store.update(created.id, { status: 'interview' });

  assert.equal(updated.status, 'interview');
  assert.equal(store.getAll()[0].status, 'interview');
});

test('update returns null for an unknown id', () => {
  const store = createStore(tempDataFile());
  assert.equal(store.update('missing-id', { status: 'interview' }), null);
});

test('update rejects an invalid status', () => {
  const store = createStore(tempDataFile());
  const created = store.create({ company: 'Acme', role: 'Engineer' });
  assert.throws(() => store.update(created.id, { status: 'ghosted' }), /status must be one of/);
});

test('remove deletes an application and returns true', () => {
  const store = createStore(tempDataFile());
  const created = store.create({ company: 'Acme', role: 'Engineer' });

  assert.equal(store.remove(created.id), true);
  assert.deepEqual(store.getAll(), []);
});

test('remove returns false for an unknown id', () => {
  const store = createStore(tempDataFile());
  assert.equal(store.remove('missing-id'), false);
});

test('data persists across store instances backed by the same file', () => {
  const dataFile = tempDataFile();
  const storeA = createStore(dataFile);
  storeA.create({ company: 'Acme', role: 'Engineer' });

  const storeB = createStore(dataFile);
  assert.equal(storeB.getAll().length, 1);
});
