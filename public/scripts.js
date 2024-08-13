function loadLogs() {
    fetch('/logs')
        .then(response => response.json())
        .then(logs => {
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
            <td>${log.ip}</td>
            <td>${log.visit_date}</td>
            <td>${log.visit_time}</td>
        `;
        logTableBody.appendChild(row);
    });
}

function displayViewCounts(logs) {
    const logTableBodyViews = document.getElementById('logTableBodyViews');
    logTableBodyViews.innerHTML = ''; 

    const viewCounts = {};
    logs.forEach(log => {
        if (viewCounts[log.image_id]) {
            viewCounts[log.image_id]++;
        } else {
            viewCounts[log.image_id] = 1;
        }
    });

    for (const [imageId, count] of Object.entries(viewCounts)) {
        const row = document.createElement('tr');
        row.innerHTML = 
           `<td>${imageId}</td> 
            <td>${count}</td>`
        ;
        logTableBodyViews.appendChild(row);
    };
}

function filterLogs() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const logTableBody = document.getElementById('logTableBody');
    const rows = logTableBody.getElementsByTagName('tr');

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

function filterLogsViews() {
    const searchInputViews = document.getElementById('searchInputViews').value.toLowerCase();
    const logTableBodyViews = document.getElementById('logTableBodyViews');
    const rows = logTableBodyViews.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let match = false;

        for (let j = 0; j < cells.length; j++) {
            if (cells[j].innerText.toLowerCase().includes(searchInputViews)) {
                match = true;
                break;
            }
        }

        rows[i].style.display = match ? '' : 'none';
    }
}

function sortLogs() {
    const filterSelect = document.getElementById('filterSelect').value;
    const logTableBody = document.getElementById('logTableBody');
    const rows = Array.from(logTableBody.getElementsByTagName('tr'));

    rows.sort((a, b) => {
        const aText = a.getElementsByTagName('td')[filterSelect === 'imageId' ? 0 : filterSelect === 'ip' ? 1 : filterSelect === 'date' ? 2 : 3].innerText;
        const bText = b.getElementsByTagName('td')[filterSelect === 'imageId' ? 0 : filterSelect === 'ip' ? 1 : filterSelect === 'date' ? 2 : 3].innerText;

        if (filterSelect === 'date' || filterSelect === 'time') {
            return new Date(aText) - new Date(bText);
        } else {
            return aText.localeCompare(bText);
        }
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

document.getElementById('searchInput').addEventListener('input', filterLogs);
document.getElementById('filterSelect').addEventListener('change', sortLogs);

document.getElementById('searchInputViews').addEventListener('input', filterLogsViews);
document.getElementById('filterSelectViews').addEventListener('change', sortLogsViews);

window.onload = loadLogs;
