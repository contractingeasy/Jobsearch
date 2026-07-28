const form = document.getElementById('application-form');
const tableBody = document.getElementById('applications-body');
const errorMessage = document.getElementById('error-message');

let applications = [];
let editingId = null;

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = '';
}

function textCell(text) {
  const cell = document.createElement('td');
  cell.textContent = text;
  return cell;
}

function makeEditCell(field, value, type) {
  const cell = document.createElement('td');
  const input = document.createElement('input');
  input.type = type;
  input.value = value || '';
  input.dataset.field = field;
  input.className = 'edit-input';
  cell.appendChild(input);
  return cell;
}

function makeStatusCell(application) {
  const cell = document.createElement('td');
  const select = document.createElement('select');
  ['applied', 'interview', 'offer', 'rejected'].forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    option.selected = status === application.status;
    select.appendChild(option);
  });
  select.addEventListener('change', async () => {
    await updateStatus(application.id, select.value);
  });
  cell.appendChild(select);
  return cell;
}

function makeLinkCell(link) {
  const cell = document.createElement('td');
  if (link) {
    const anchor = document.createElement('a');
    anchor.href = link;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = 'View';
    cell.appendChild(anchor);
  }
  return cell;
}

function makeViewActionsCell(application) {
  const cell = document.createElement('td');

  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => {
    editingId = application.id;
    render();
  });

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'delete';
  deleteButton.addEventListener('click', async () => {
    await deleteApplication(application.id);
  });

  cell.append(editButton, deleteButton);
  return cell;
}

function makeEditActionsCell(application, row) {
  const cell = document.createElement('td');

  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.addEventListener('click', async () => {
    const changes = {};
    row.querySelectorAll('.edit-input').forEach((input) => {
      changes[input.dataset.field] = input.value;
    });
    await saveEdits(application.id, changes);
  });

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => {
    editingId = null;
    render();
  });

  cell.append(saveButton, cancelButton);
  return cell;
}

function renderRow(application) {
  const row = document.createElement('tr');

  if (editingId === application.id) {
    row.appendChild(makeEditCell('company', application.company, 'text'));
    row.appendChild(makeEditCell('role', application.role, 'text'));
    row.appendChild(makeEditCell('dateApplied', application.dateApplied, 'date'));
    row.appendChild(makeStatusCell(application));
    row.appendChild(makeEditCell('link', application.link, 'url'));
    row.appendChild(makeEditActionsCell(application, row));
  } else {
    row.appendChild(textCell(application.company));
    row.appendChild(textCell(application.role));
    row.appendChild(textCell(application.dateApplied));
    row.appendChild(makeStatusCell(application));
    row.appendChild(makeLinkCell(application.link));
    row.appendChild(makeViewActionsCell(application));
  }

  return row;
}

function render() {
  tableBody.innerHTML = '';
  applications.forEach((application) => {
    tableBody.appendChild(renderRow(application));
  });
}

async function loadApplications() {
  const response = await fetch('/api/applications');
  applications = await response.json();
  render();
}

async function updateStatus(id, status) {
  clearError();
  const response = await fetch(`/api/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const { error } = await response.json();
    showError(error);
  }
}

async function saveEdits(id, changes) {
  clearError();
  const response = await fetch(`/api/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
  if (response.ok) {
    editingId = null;
    await loadApplications();
  } else {
    const { error } = await response.json();
    showError(error);
  }
}

async function deleteApplication(id) {
  clearError();
  const response = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
  if (response.ok) {
    await loadApplications();
  } else {
    const { error } = await response.json();
    showError(error);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  const body = {
    company: document.getElementById('company').value,
    role: document.getElementById('role').value,
    dateApplied: document.getElementById('dateApplied').value || undefined,
    link: document.getElementById('link').value,
    status: document.getElementById('status').value,
  };

  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    form.reset();
    await loadApplications();
  } else {
    const { error } = await response.json();
    showError(error);
  }
});

loadApplications();
