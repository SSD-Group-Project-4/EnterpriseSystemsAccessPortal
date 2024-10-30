let db;

// Open IndexedDB
const request = indexedDB.open('EnterpriseSystemsAccessPortalDB', 1);

/**
 * IndexedDB database initialization and configuration
 * Creates a database named 'ESAP_DB' to store user information
 * 
 * @type {IDBDatabase} db - The IndexedDB database instance
 */

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('courses', { keyPath: 'courseNumber' });
    objectStore.createIndex('courseNumber', 'courseNumber', { unique: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('Database opened successfully');
    document.dispatchEvent(new Event('dbReady'));
};

request.onerror = function(event) {
    console.error('Database error:', event.target.errorCode);
};

