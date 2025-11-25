let data = [];
let headers = [];
let currentResults = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentSortColumn = null;
let currentSortDirection = 'asc';

// Parse CSV text into array of objects
function parseCSV(text) {
    const lines = text.trim().split('\n');

    // Parse a single CSV line respecting quoted fields
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // Field separator
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        // Push last field
        result.push(current.trim());
        return result;
    }

    const headers = parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        rows.push(row);
    }

    return { headers, rows };
}

// Load CSV data
async function loadData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/venelinkochev/bin-list-data/refs/heads/master/bin-list-data.csv');
        const text = await response.text();

        const parsed = parseCSV(text);
        headers = parsed.headers;
        data = parsed.rows;

        document.getElementById('status-container').innerHTML =
            `<div class="alert alert-success mb-0">System Ready. Loaded ${data.length.toLocaleString()} records.</div>`;
    } catch (error) {
        document.getElementById('status-container').innerHTML =
            `<div class="alert alert-danger mb-0">Error loading data: ${error.message}</div>`;
    }
}

// BIN Search
function runBinSearch() {
    if (data.length === 0) return;

    const searchVal = document.getElementById('bin-input').value.trim();
    const limit = parseInt(document.getElementById('bin-limit').value);

    if (!searchVal) {
        document.getElementById('status-container').innerHTML =
            '<div class="alert alert-danger mb-0">Please enter a BIN number</div>';
        return;
    }

    try {
        // Search first column (BIN)
        const firstColumn = headers[0];
        const results = data.filter(row =>
            row[firstColumn] && row[firstColumn].startsWith(searchVal)
        );

        displayResults(results, limit, `BIN Search: ${searchVal}`);
    } catch (error) {
        document.getElementById('status-container').innerHTML =
            `<div class="alert alert-danger mb-0">Error: ${error.message}</div>`;
    }
}

// Keyword Search
function runKeywordSearch() {
    if (data.length === 0) return;

    const keywordsRaw = document.getElementById('keyword-input').value.trim();
    const limit = parseInt(document.getElementById('keyword-limit').value);

    if (!keywordsRaw) {
        document.getElementById('status-container').innerHTML =
            '<div class="alert alert-danger mb-0">Please enter keywords</div>';
        return;
    }

    try {
        const keywords = keywordsRaw.toLowerCase().split(/\s+/);

        // Search all columns for all keywords
        const results = data.filter(row => {
            const rowText = Object.values(row).join(' ').toLowerCase();
            return keywords.every(keyword => rowText.includes(keyword));
        });

        displayResults(results, limit, `Keyword Search: ${keywordsRaw}`);
    } catch (error) {
        document.getElementById('status-container').innerHTML =
            `<div class="alert alert-danger mb-0">Error: ${error.message}</div>`;
    }
}

// Display results as HTML table with pagination
function displayResults(results, limit, title) {
    document.getElementById('results-title').innerHTML = title;
    currentResults = results;
    itemsPerPage = limit;
    currentPage = 1;
    currentSortColumn = null;
    currentSortDirection = 'asc';

    if (results.length === 0) {
        document.getElementById('status-container').innerHTML =
            '<div class="alert alert-warning mb-0">No matching records found.</div>';
        document.getElementById('results').classList.add('d-none');
        document.getElementById('pagination-container').classList.add('d-none');
    } else {
        renderPage();
        renderPagination();
        document.getElementById('status-container').innerHTML =
            `<div class="alert alert-success mb-0">Found ${results.length.toLocaleString()} matches</div>`;
        document.getElementById('results').classList.remove('d-none');
    }
}

// Sort results by column
function sortResults(column) {
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }

    currentResults.sort((a, b) => {
        let valA = a[column] || '';
        let valB = b[column] || '';

        // Try to parse as numbers for numeric sorting
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
            return currentSortDirection === 'asc' ? numA - numB : numB - numA;
        }

        // String comparison
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();

        if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    currentPage = 1;
    renderPage();
    renderPagination();
}

// Render current page of results
function renderPage() {
    const totalPages = Math.ceil(currentResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageResults = currentResults.slice(startIndex, endIndex);

    // Build HTML table with Bootstrap classes
    let html = '<table class="table table-striped table-hover dataframe"><thead><tr>';
    headers.forEach(header => {
        const sortIndicator = currentSortColumn === header
            ? `<span class="ms-1">${currentSortDirection === 'asc' ? '▲' : '▼'}</span>`
            : '';
        html += `<th onclick="sortResults('${header}')">${header}${sortIndicator}</th>`;
    });
    html += '</tr></thead><tbody>';

    pageResults.forEach(row => {
        html += '<tr>';
        headers.forEach(header => {
            html += `<td>${row[header] || ''}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('table-output').innerHTML = html;
}

// Render pagination controls
function renderPagination() {
    const totalPages = Math.ceil(currentResults.length / itemsPerPage);

    if (totalPages <= 1) {
        document.getElementById('pagination-container').classList.add('d-none');
        return;
    }

    document.getElementById('pagination-container').classList.remove('d-none');

    let html = '';

    // Previous button
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="goToPage(${currentPage - 1}); return false;">Previous</a>
    </li>`;

    // Page numbers
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(1); return false;">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" onclick="goToPage(${i}); return false;">${i}</a>
        </li>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${totalPages}); return false;">${totalPages}</a></li>`;
    }

    // Next button
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="goToPage(${currentPage + 1}); return false;">Next</a>
    </li>`;

    document.getElementById('pagination').innerHTML = html;

    // Add page info below pagination
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, currentResults.length);
    const pageInfo = `<div class="text-center text-muted mt-2 small">Showing ${startItem.toLocaleString()}-${endItem.toLocaleString()} of ${currentResults.length.toLocaleString()}</div>`;
    document.getElementById('pagination-container').innerHTML =
        '<ul class="pagination justify-content-center flex-wrap" id="pagination">' + html + '</ul>' + pageInfo;
}

// Navigate to specific page
function goToPage(page) {
    const totalPages = Math.ceil(currentResults.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderPage();
    renderPagination();

    // Scroll to top of results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Add Enter key support
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    document.getElementById('bin-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') runBinSearch();
    });

    document.getElementById('keyword-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') runKeywordSearch();
    });
});
