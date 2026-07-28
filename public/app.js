const form = document.getElementById('application-form');
const tableBody = document.getElementById('applications-body');
const errorMessage = document.getElementById('error-message');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = '';
}

function renderRow(application) {
  const row = document.createElement('tr');

  const statusSelect = document.createElement('select');
  ['applied', 'interview', 'offer', 'rejected'].forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    option.selected = status === application.status;
    statusSelect.appendChild(option);
  });
  statusSelect.addEventListener('change', async () => {
    await updateStatus(application.id, statusSelect.value);
  });

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.className = 'delete';
  deleteButton.addEventListener('click', async () => {
    await deleteApplication(application.id);
  });

  const linkCell = document.createElement('td');
  if (application.link) {
    const anchor = document.createElement('a');
    anchor.href = application.link;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = 'View';
    linkCell.appendChild(anchor);
  }

  const companyCell = document.createElement('td');
  companyCell.textContent = application.company;
  const roleCell = document.createElement('td');
  roleCell.textContent = application.role;
  const dateCell = document.createElement('td');
  dateCell.textContent = application.dateApplied;
  const statusCell = document.createElement('td');
  statusCell.appendChild(statusSelect);
  const actionsCell = document.createElement('td');
  actionsCell.appendChild(deleteButton);

  row.append(companyCell, roleCell, dateCell, statusCell, linkCell, actionsCell);
  return row;
}

async function loadApplications() {
  const response = await fetch('/api/applications');
  const applications = await response.json();
  tableBody.innerHTML = '';
  applications.forEach((application) => {
    tableBody.appendChild(renderRow(application));
  });
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
