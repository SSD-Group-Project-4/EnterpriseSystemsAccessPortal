// this JS is related to export-roster And does not interfere with any other HTML
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
    document.getElementById("export-roster-button").addEventListener("click", exportRoster);

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

function exportRoster() {
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
            downloadCSV(roster.fileContent);
        } else {
            alert("No roster found for the selected date.");
        }
    };

    request.onerror = function() {
        alert("Error retrieving roster.");
    };
}

function downloadCSV(data) {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => JSON.stringify(row[header] || "")).join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "roster.csv";
    a.click();

    URL.revokeObjectURL(url);
}
