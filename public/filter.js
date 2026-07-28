function filterApplications(list, { search = '', status = '' } = {}) {
  const query = search.trim().toLowerCase();
  return list.filter((application) => {
    const matchesStatus = !status || application.status === status;
    const matchesQuery =
      !query ||
      application.company.toLowerCase().includes(query) ||
      application.role.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });
}

if (typeof module !== 'undefined') {
  module.exports = { filterApplications };
}
