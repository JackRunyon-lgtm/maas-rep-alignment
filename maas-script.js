// Fetch data from data.json (auto-generated from Book2.xlsx by GitHub Actions)
let allData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 50;
let sortColumn = null;
let sortDirection = 'asc';

async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('data.json not found');
    const json = await response.json();
    allData = json.data || [];
    initDashboard();
  } catch (err) {
    console.error('Failed to load data.json:', err);
    document.getElementById('resultsCount').textContent =
      'Error loading data. Make sure data.json exists in the same folder.';
  }
}

function initDashboard() {
  populateFilters();
  resetView();
}

function populateFilters() {
  populateSelect('marketNameFilter',         unique('MARKET_NAME'));
  populateSelect('coverageClientTypeFilter', unique('COVE_CLIENT_TYPE_DESC'));
  populateSelect('coverageClientSubtypeFilter', unique('COV_CLIENT_SUB_TYPE_DESC'));
  populateSelect('coverageNameFilter',       unique('COVERAGE_NAME'));
  populateSelect('coverageIdFilter',         unique('COVERAGE_TYPE_ID'));
  populateSelect('repFilter',                unique('Rep'));
  populateSelect('techRepFilter',            unique('Tech Rep'));
  populateSelect('managerFilter',            unique('Manager'));
  populateSelect('techManagerFilter',        unique('Tech Manager'));
}

function unique(field) {
  return [...new Set(allData.map(r => r[field]).filter(Boolean))].sort();
}

function populateSelect(id, values) {
  const select = document.getElementById(id);
  const current = select.value;
  // Keep the first placeholder option, replace the rest
  while (select.options.length > 1) select.remove(1);
  values.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
  if (current) select.value = current;
}

function getFilteredData() {
  const search  = document.getElementById('searchInput').value.toLowerCase().trim();
  const market  = document.getElementById('marketNameFilter').value;
  const covType = document.getElementById('coverageClientTypeFilter').value;
  const covSub  = document.getElementById('coverageClientSubtypeFilter').value;
  const covName = document.getElementById('coverageNameFilter').value;
  const covId   = document.getElementById('coverageIdFilter').value;
  const rep     = document.getElementById('repFilter').value;
  const techRep = document.getElementById('techRepFilter').value;
  const mgr     = document.getElementById('managerFilter').value;
  const techMgr = document.getElementById('techManagerFilter').value;

  const anyFilter = search || market || covType || covSub || covName ||
                    covId || rep || techRep || mgr || techMgr;
  if (!anyFilter) return [];

  return allData.filter(row => {
    if (market  && row['MARKET_NAME']            !== market)  return false;
    if (covType && row['COVE_CLIENT_TYPE_DESC']   !== covType) return false;
    if (covSub  && row['COV_CLIENT_SUB_TYPE_DESC'] !== covSub)  return false;
    if (covName && row['COVERAGE_NAME']           !== covName) return false;
    if (covId   && row['COVERAGE_TYPE_ID']        !== covId)   return false;
    if (rep     && row['Rep']                     !== rep)     return false;
    if (techRep && row['Tech Rep']                !== techRep) return false;
    if (mgr     && row['Manager']                 !== mgr)     return false;
    if (techMgr && row['Tech Manager']            !== techMgr) return false;
    if (search) {
      const haystack = Object.values(row).join(' ').toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function applySorting(data) {
  if (!sortColumn) return data;
  return [...data].sort((a, b) => {
    const va = (a[sortColumn] || '').toString().toLowerCase();
    const vb = (b[sortColumn] || '').toString().toLowerCase();
    if (va < vb) return sortDirection === 'asc' ? -1 : 1;
    if (va > vb) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

function renderTable() {
  const sorted = applySorting(filteredData);
  const start  = (currentPage - 1) * rowsPerPage;
  const page   = sorted.slice(start, start + rowsPerPage);
  const tbody  = document.getElementById('tableBody');
  tbody.innerHTML = '';

  if (page.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 17;
    td.textContent = filteredData.length === 0
      ? 'Select a filter or search to view data'
      : 'No records match the current filters.';
    td.style.textAlign = 'center';
    td.style.padding = '2rem';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  page.forEach(row => {
    const tr = document.createElement('tr');
    [
      'GEOGRAPHY_NAME', 'MARKET_NAME', 'SUB_MARKET_NAME', 'SALES_GROUP_NAME',
      'COVE_CLIENT_TYPE_DESC', 'BRANCH_NAME', 'BRANCH_UNIT_NAME', 'COVERAGE_NAME',
      'Rep', 'Role', 'Rep Email', 'Tech Rep', 'Tech Rep Email',
      'Manager', 'Manager Email', 'Tech Manager', 'Tech Manager Email'
    ].forEach(col => {
      const td = document.createElement('td');
      td.textContent = row[col] || '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function updatePagination() {
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prevPage').disabled = currentPage <= 1;
  document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

function updateResultsCount() {
  const el = document.getElementById('resultsCount');
  if (filteredData.length === 0) {
    el.textContent = 'Select a filter or search to view data';
  } else {
    el.textContent = `Showing ${filteredData.length.toLocaleString()} of ${allData.length.toLocaleString()} records`;
  }
}

function resetView() {
  filteredData = [];
  currentPage  = 1;
  updateResultsCount();
  renderTable();
  updatePagination();
}

function applyFilters() {
  filteredData = getFilteredData();
  currentPage  = 1;
  updateResultsCount();
  renderTable();
  updatePagination();
}

// --- Event listeners ---

document.getElementById('searchInput').addEventListener('input', applyFilters);

['marketNameFilter','coverageClientTypeFilter','coverageClientSubtypeFilter',
 'coverageNameFilter','coverageIdFilter','repFilter','techRepFilter',
 'managerFilter','techManagerFilter'].forEach(id => {
  document.getElementById(id).addEventListener('change', applyFilters);
});

document.getElementById('clearFilters').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  ['marketNameFilter','coverageClientTypeFilter','coverageClientSubtypeFilter',
   'coverageNameFilter','coverageIdFilter','repFilter','techRepFilter',
   'managerFilter','techManagerFilter'].forEach(id => {
    document.getElementById(id).value = '';
  });
  resetView();
});

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) { currentPage--; renderTable(); updatePagination(); }
});

document.getElementById('nextPage').addEventListener('click', () => {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  if (currentPage < totalPages) { currentPage++; renderTable(); updatePagination(); }
});

document.querySelectorAll('th[data-sort]').forEach(th => {
  th.style.cursor = 'pointer';
  th.addEventListener('click', () => {
    const col = th.getAttribute('data-sort');
    if (sortColumn === col) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn    = col;
      sortDirection = 'asc';
    }
    renderTable();
  });
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const dataToExport = filteredData.length > 0 ? filteredData : allData;
  const cols = [
    'GEOGRAPHY_NAME', 'MARKET_NAME', 'SUB_MARKET_NAME', 'SALES_GROUP_NAME',
    'COVE_CLIENT_TYPE_DESC', 'BRANCH_NAME', 'BRANCH_UNIT_NAME', 'COVERAGE_NAME',
    'Rep', 'Role', 'Rep Email', 'Tech Rep', 'Tech Rep Email',
    'Manager', 'Manager Email', 'Tech Manager', 'Tech Manager Email'
  ];
  const header = cols.join(',');
  const rows   = dataToExport.map(row =>
    cols.map(c => `"${(row[c] || '').toString().replace(/"/g, '""')}"`).join(',')
  );
  const csv  = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'maas-rep-alignment-export.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// --- Init ---
loadData();
