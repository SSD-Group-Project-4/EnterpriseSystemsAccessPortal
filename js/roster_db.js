let db;

// Open or create the database
const request = indexedDB.open("ESRosterDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("rosters")) {
        const objectStore = db.createObjectStore("rosters", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("semester", "semester", { unique: false });
        objectStore.createIndex("year", "year", { unique: false });
        objectStore.createIndex("date", "date", { unique: false });
        console.log("Object store 'rosters' created successfully.");
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("Database 'ESRosterDB' opened successfully");
};

request.onerror = function(event) {
    console.error("Database error:", event.target.errorCode);
};

document.getElementById("upload-roster-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const semester = document.getElementById("semester").value;
    const year = document.getElementById("year").value;
    const date = document.getElementById("date").value;
    const fileInput = document.getElementById("roster-file");

    if (!fileInput.files.length) {
        alert("Please select a file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Assume the first sheet contains the roster data
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rosterJSON = XLSX.utils.sheet_to_json(sheet);

        const rosterData = {
            semester: semester,
            year: year,
            date: date,
            fileContent: rosterJSON // Store the parsed JSON instead of the Data URL
        };

        console.log("Roster data with parsed JSON content:", rosterData);

        addRosterToDB(rosterData);
    };

    reader.onerror = function() {
        console.error("Error reading file");
    };

    reader.readAsArrayBuffer(file);
});



function addRosterToDB(rosterData) {
    if (!db) {
        console.error("Database not initialized");
        return;
    }

    const transaction = db.transaction("rosters", "readwrite");
    const store = transaction.objectStore("rosters");
    const request = store.add(rosterData);

    request.onsuccess = function() {
        console.log("Roster uploaded successfully!");
        alert("Roster uploaded successfully!");
        document.getElementById("upload-roster-form").reset();
    };

    request.onerror = function(event) {
        console.error("Error uploading roster:", event.target.errorCode);
        alert("Error uploading roster.");
    };
}
