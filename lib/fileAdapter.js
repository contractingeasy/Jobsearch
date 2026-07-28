const fs = require('fs');
const path = require('path');

function createFileAdapter(dataFile) {
  function readAll() {
    if (!fs.existsSync(dataFile)) return [];
    const raw = fs.readFileSync(dataFile, 'utf8').trim();
    return raw ? JSON.parse(raw) : [];
  }

  function writeAll(applications) {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(applications, null, 2));
  }

  return { readAll, writeAll };
}

module.exports = { createFileAdapter };
