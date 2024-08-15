let allLogs = [];

function loadLogs() {
    fetch('/logs')
        .then(response => response.json())
        .then(logs => {
            allLogs = logs;
            displayLogs(logs);
            displayViewCounts(logs);
        })
        .catch(error => console.error('Error loading logs:', error));
}

function displayLogs(logs) {
    const logTableBody = document.getElementById('logTableBody');
    logTableBody.innerHTML = ''; 

    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.image_id}</td>
            <td>${log.nickname || 'N/A'}</td>
            <td>${log.ip}</td>
            <td>${log.visit_date.split(' ')[0].replace("T05:00:00.000Z","")}</td>
            <td>${log.visit_time}</td>
            <td>${log.country || 'N/A'}</td>
            <td>${log.region || 'N/A'}</td>
            <td>${log.city || 'N/A'}</td>
            <td>${log.latitude || 'N/A'}</td>
            <td>${log.longitude || 'N/A'}</td>
        `;
        logTableBody.appendChild(row);
    });
}

function displayViewCounts(logs, date = null) {
    console.log("Displaying view counts for date:", date);
    console.log("Number of logs:", logs.length);

    const logTableBodyViews = document.getElementById('logTableBodyViews');
    logTableBodyViews.innerHTML = '';

    const viewCounts = {};
    logs.forEach(log => {
        const logDate = new Date(log.visit_date).toISOString().split('T')[0];
        console.log("Log date:", logDate, "Selected date:", date);
        if (date && logDate !== date) {
            return;
        }
        if (viewCounts[log.image_id]) {
            viewCounts[log.image_id]++;
        } else {
            viewCounts[log.image_id] = 1;
        }
    });

    console.log("View counts:", viewCounts);

    for (const [imageId, count] of Object.entries(viewCounts)) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${imageId}</td>
            <td>${count}</td>
        `;
        logTableBodyViews.appendChild(row);
    }
}



function filterLogs() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filterSelect = document.getElementById('filterSelect').value;
    const logTableBody = document.getElementById('logTableBody');
    const rows = logTableBody.getElementsByTagName('tr');

    const columnIndex = {
        'imageId': 0,
        'nickname': 1,
        'ip': 2,
        'date': 3,
        'time': 4,
        'country': 5,
        'region': 6,
        'city': 7,
        'latitude': 8,
        'longitude': 9
    }[filterSelect];

    for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName('td')[columnIndex];
        const cellText = cell.textContent || cell.innerText;

        if (cellText.toLowerCase().includes(searchInput)) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}

function filterLogsViews() {
    const searchInput = document.getElementById('searchInputViews').value.toLowerCase();
    const logTableBodyViews = document.getElementById('logTableBodyViews');
    const rows = logTableBodyViews.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let match = false;

        for (let j = 0; j < cells.length; j++) {
            if (cells[j].innerText.toLowerCase().includes(searchInput)) {
                match = true;
                break;
            }
        }

        rows[i].style.display = match ? '' : 'none';
    }
}

function sortLogs() {
    const filterSelect = document.getElementById('filterSelect').value;
    const sortAscending = document.getElementById('sortAscending').checked;
    const logTableBody = document.getElementById('logTableBody');
    const rows = Array.from(logTableBody.getElementsByTagName('tr'));

    rows.sort((a, b) => {
        const columnIndex = {
            'imageId': 0,
            'nickname': 1,
            'ip': 2,
            'date': 3,
            'time': 4,
            'country': 5,
            'region': 6,
            'city': 7
        }[filterSelect] || 0;

        let aText = a.getElementsByTagName('td')[columnIndex].innerText;
        let bText = b.getElementsByTagName('td')[columnIndex].innerText;

        if (filterSelect === 'date') {
            aText = new Date(aText);
            bText = new Date(bText);
        } else if (filterSelect === 'time') {
            aText = new Date(`1970-01-01T${aText}`);
            bText = new Date(`1970-01-01T${bText}`);
        }

        let comparison = 0;
        if (aText > bText) {
            comparison = 1;
        } else if (aText < bText) {
            comparison = -1;
        }

        return sortAscending ? comparison : -comparison;
    });

    logTableBody.innerHTML = '';
    rows.forEach(row => logTableBody.appendChild(row));
}

function sortLogsViews() {
    const filterSelectViews = document.getElementById('filterSelectViews').value;
    const logTableBodyViews = document.getElementById('logTableBodyViews');
    const rows = Array.from(logTableBodyViews.getElementsByTagName('tr'));

    rows.sort((a, b) => {
        const aText = a.getElementsByTagName('td')[filterSelectViews === 'imageId' ? 0 : 1].innerText;
        const bText = b.getElementsByTagName('td')[filterSelectViews === 'imageId' ? 0 : 1].innerText;

        if (filterSelectViews === 'views') {
            return parseInt(bText) - parseInt(aText);
        } else {
            return aText.localeCompare(bText);
        }
    });

    logTableBodyViews.innerHTML = '';
    rows.forEach(row => logTableBodyViews.appendChild(row));
}

function filterByDate() {
    const datePicker = document.getElementById('datePicker');
    const selectedDate = datePicker.value;
    
    if (!selectedDate) {
        alert('Please select a date');
        return;
    }

    const filteredLogs = allLogs.filter(log => log.visit_date.startsWith(selectedDate));
    displayLogs(filteredLogs);
}

function clearDateFilter() {
    document.getElementById('datePicker').value = '';
    displayLogs(allLogs);
}

function filterViewsByDate() {
    const datePickerViews = document.getElementById('datePickerViews');
    const selectedDate = datePickerViews.value;
    
    if (!selectedDate) {
        alert('Please select a date');
        return;
    }

    console.log("Filtering views for date:", selectedDate);
    console.log("All logs:", allLogs);

    displayViewCounts(allLogs, selectedDate);
}

function clearViewsDateFilter() {
    document.getElementById('datePickerViews').value = '';
    displayViewCounts(allLogs);
}

function updateSearchPlaceholder() {
    const filterSelect = document.getElementById('filterSelect');
    const searchInput = document.getElementById('searchInput');
    searchInput.placeholder = `Search by ${filterSelect.options[filterSelect.selectedIndex].text}`;
}

document.getElementById('filterSelect').addEventListener('change', () => {
    updateSearchPlaceholder();
    filterLogs();
    sortLogs();
});

// Update event listeners
document.getElementById('searchInput').addEventListener('input', filterLogs);
// document.getElementById('filterSelect').addEventListener('change', () => {
//     filterLogs();
//     sortLogs();
// });
document.getElementById('sortAscending').addEventListener('change', sortLogs);

document.getElementById('searchInputViews').addEventListener('input', filterLogsViews);
document.getElementById('filterSelectViews').addEventListener('change', sortLogsViews);

window.onload = loadLogs;
// Call this function on page load to set the initial placeholder
window.addEventListener('load', updateSearchPlaceholder);