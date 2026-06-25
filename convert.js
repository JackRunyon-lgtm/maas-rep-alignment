const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Find the Excel file - supports Book2.xlsx or any .xlsx in root
const xlsxFiles = fs.readdirSync('.').filter(f => f.endsWith('.xlsx'));
if (xlsxFiles.length === 0) {
  console.error('No .xlsx file found in repository root.');
  process.exit(1);
}

const filePath = xlsxFiles[0];
console.log(`Converting: ${filePath}`);

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

if (rows.length === 0) {
  console.error('No data found in sheet.');
  process.exit(1);
}

const headers = Object.keys(rows[0]);

const output = {
  headers,
  data: rows
};

fs.writeFileSync(
  path.join(__dirname, 'data.json'),
  JSON.stringify(output, null, 2),
  'utf8'
);

console.log(`Done. ${rows.length} records written to data.json`);
