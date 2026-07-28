const test = require('node:test');
const assert = require('node:assert/strict');
const { filterApplications } = require('../public/filter');

const applications = [
  { id: '1', company: 'Acme', role: 'Software Engineer', status: 'applied' },
  { id: '2', company: 'Globex', role: 'Product Manager', status: 'interview' },
  { id: '3', company: 'Initech', role: 'Senior Engineer', status: 'rejected' },
];

test('with no filters, returns everything', () => {
  assert.deepEqual(filterApplications(applications), applications);
});

test('filters by status', () => {
  const result = filterApplications(applications, { status: 'interview' });
  assert.deepEqual(result.map((a) => a.id), ['2']);
});

test('filters by search matching company, case-insensitively', () => {
  const result = filterApplications(applications, { search: 'acme' });
  assert.deepEqual(result.map((a) => a.id), ['1']);
});

test('filters by search matching role, case-insensitively', () => {
  const result = filterApplications(applications, { search: 'engineer' });
  assert.deepEqual(result.map((a) => a.id), ['1', '3']);
});

test('combines search and status filters', () => {
  const result = filterApplications(applications, { search: 'engineer', status: 'rejected' });
  assert.deepEqual(result.map((a) => a.id), ['3']);
});

test('returns nothing when no application matches', () => {
  const result = filterApplications(applications, { search: 'nonexistent' });
  assert.deepEqual(result, []);
});
