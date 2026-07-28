const crypto = require('crypto');

const STATUSES = ['applied', 'interview', 'offer', 'rejected'];

/**
 * @param {{ readAll: () => Promise<Array>|Array, writeAll: (applications: Array) => Promise<void>|void }} adapter
 */
function createStore({ readAll, writeAll }) {
  async function getAll() {
    return readAll();
  }

  async function create({ company, role, dateApplied, status, link } = {}) {
    if (!company || !company.trim()) throw new Error('company is required');
    if (!role || !role.trim()) throw new Error('role is required');
    const finalStatus = status || 'applied';
    if (!STATUSES.includes(finalStatus)) {
      throw new Error(`status must be one of: ${STATUSES.join(', ')}`);
    }

    const applications = await readAll();
    const application = {
      id: crypto.randomUUID(),
      company: company.trim(),
      role: role.trim(),
      dateApplied: dateApplied || new Date().toISOString().slice(0, 10),
      status: finalStatus,
      link: link ? link.trim() : '',
    };
    applications.push(application);
    await writeAll(applications);
    return application;
  }

  async function update(id, changes = {}) {
    if (changes.status !== undefined && !STATUSES.includes(changes.status)) {
      throw new Error(`status must be one of: ${STATUSES.join(', ')}`);
    }
    if (changes.company !== undefined && !changes.company.trim()) {
      throw new Error('company is required');
    }
    if (changes.role !== undefined && !changes.role.trim()) {
      throw new Error('role is required');
    }

    const applications = await readAll();
    const index = applications.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const updated = { ...applications[index], ...changes, id };
    if (changes.company !== undefined) updated.company = changes.company.trim();
    if (changes.role !== undefined) updated.role = changes.role.trim();
    if (changes.link !== undefined) updated.link = changes.link ? changes.link.trim() : '';

    applications[index] = updated;
    await writeAll(applications);
    return applications[index];
  }

  async function remove(id) {
    const applications = await readAll();
    const next = applications.filter((a) => a.id !== id);
    if (next.length === applications.length) return false;
    await writeAll(next);
    return true;
  }

  return { getAll, create, update, remove };
}

module.exports = { createStore, STATUSES };
