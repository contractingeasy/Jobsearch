const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STATUSES = ['applied', 'interview', 'offer', 'rejected'];

function createStore(dataFile) {
  function readAll() {
    if (!fs.existsSync(dataFile)) return [];
    const raw = fs.readFileSync(dataFile, 'utf8').trim();
    return raw ? JSON.parse(raw) : [];
  }

  function writeAll(applications) {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(applications, null, 2));
  }

  function getAll() {
    return readAll();
  }

  function create({ company, role, dateApplied, status, link } = {}) {
    if (!company || !company.trim()) throw new Error('company is required');
    if (!role || !role.trim()) throw new Error('role is required');
    const finalStatus = status || 'applied';
    if (!STATUSES.includes(finalStatus)) {
      throw new Error(`status must be one of: ${STATUSES.join(', ')}`);
    }

    const applications = readAll();
    const application = {
      id: crypto.randomUUID(),
      company: company.trim(),
      role: role.trim(),
      dateApplied: dateApplied || new Date().toISOString().slice(0, 10),
      status: finalStatus,
      link: link ? link.trim() : '',
    };
    applications.push(application);
    writeAll(applications);
    return application;
  }

  function update(id, changes = {}) {
    if (changes.status !== undefined && !STATUSES.includes(changes.status)) {
      throw new Error(`status must be one of: ${STATUSES.join(', ')}`);
    }
    if (changes.company !== undefined && !changes.company.trim()) {
      throw new Error('company is required');
    }
    if (changes.role !== undefined && !changes.role.trim()) {
      throw new Error('role is required');
    }

    const applications = readAll();
    const index = applications.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const updated = { ...applications[index], ...changes, id };
    if (changes.company !== undefined) updated.company = changes.company.trim();
    if (changes.role !== undefined) updated.role = changes.role.trim();
    if (changes.link !== undefined) updated.link = changes.link ? changes.link.trim() : '';

    applications[index] = updated;
    writeAll(applications);
    return applications[index];
  }

  function remove(id) {
    const applications = readAll();
    const next = applications.filter((a) => a.id !== id);
    if (next.length === applications.length) return false;
    writeAll(next);
    return true;
  }

  return { getAll, create, update, remove };
}

module.exports = { createStore, STATUSES };
