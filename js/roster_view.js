// Open the database
let db;
const request = indexedDB.open("ESRosterDB", 1);

request.onsuccess = function(event) {
    db = event.target.result;
    loadRosterDates();
};

request.onerror = function(event) {
    console.error("Database error:", event.target.errorCode);
};

// Load available roster dates based on selected semester and year
function loadRosterDates() {
    document.getElementById("view-roster-button").addEventListener("click", viewRoster);

    const semesterSelect = document.getElementById("semester");
    const yearSelect = document.getElementById("year");

    semesterSelect.addEventListener("change", populateDatesDropdown);
    yearSelect.addEventListener("change", populateDatesDropdown);
}

function populateDatesDropdown() {
    const semester = document.getElementById("semester").value;
    const year = document.getElementById("year").value;
    const dateSelect = document.getElementById("date");

    if (!semester || !year) return;

    // Clear previous options
    dateSelect.innerHTML = '<option value="" disabled selected>Select Date</option>';

    const transaction = db.transaction("rosters", "readonly");
    const store = transaction.objectStore("rosters");
    const index = store.index("date");

    index.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const roster = cursor.value;
            if (roster.semester === semester && roster.year === year) {
                const option = document.createElement("option");
                option.value = roster.date;
                option.textContent = roster.date;
                dateSelect.appendChild(option);
            }
            cursor.continue();
        }
    };
}

function viewRoster() {
    const semester = document.getElementById("semester").value;
    const year = document.getElementById("year").value;
    const date = document.getElementById("date").value;

    if (!semester || !year || !date) {
        alert("Please select Semester, Year, and Date.");
        return;
    }

    const transaction = db.transaction("rosters", "readonly");
    const store = transaction.objectStore("rosters");
    const index = store.index("date");

    const request = index.get(date);
    request.onsuccess = function(event) {
        const roster = event.target.result;
        if (roster) {
            toggleVisibility();
            displayRosterTable(roster.fileContent);
        } else {
            alert("No roster found for the selected date.");
        }
    };

    request.onerror = function() {
        alert("Error retrieving roster.");
    };
}

function toggleVisibility() {
    document.getElementById("form-container").classList.add("hidden");
    document.getElementById("roster-table-container").classList.remove("hidden");
}

function displayRosterTable(rosterData) {
    const container = document.getElementById("roster-table-container");
    container.innerHTML = ""; // Clear previous content

    const table = document.createElement("table");
    const headers = Object.keys(rosterData[0]);

    // Create table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");
    rosterData.forEach(row => {
        const tr = document.createElement("tr");
        headers.forEach(header => {
            const td = document.createElement("td");
            td.textContent = row[header];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.appendChild(table);
}
