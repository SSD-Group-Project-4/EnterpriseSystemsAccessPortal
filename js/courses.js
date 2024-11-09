const allSoftware = [
    "SAS EG", "SAS EM", "SAS Viya", 
    "SAP HANA", "SAP S/4Hana", "SAP Solution Manager", "SQL Server (Read)", "SQL Server (Individual DB)", 
    "Teradata", "Tableau", "Power BI"
]; 

const softwareCategories = {
    "SAS": ["SAS EG", "SAS EM", "SAS Viya"],
    "SAP": ["SAP HANA", "SAP S/4Hana", "SAP Solution Manager"],
    "Databases": ["SQL Server (Read)", "SQL Server (Individual DB)", "Teradata"],
    "Programming": ["Visual Studio", "JupyterHub Access (Azure)"],
    "Visualization Tools": ["Tableau", "Power BI"]
};
console.log('courses.js loaded');
function addCourse() {
    console.log('addCourse function called');
    // Get form values
    const courseNumber = document.getElementById('course-number').value;
    const courseName = document.getElementById('course-name').value;
    const courseDescription = document.getElementById('course-description').value;
    // Get selected software
    const requiredSoftwares = Array.from(document.querySelectorAll('input[name="software"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Create course object
    const courseData = {
        courseNumber: courseNumber,
        courseName: courseName,
        courseDescription: courseDescription,
        requiredSoftwares: requiredSoftwares
    };
    addCourseInDB(courseData);

}

function addCourseInDB(courseData) {
    const transaction = db.transaction('courses', 'readwrite');
    const store = transaction.objectStore('courses');
    const request = store.add(courseData);

    request.onsuccess = function() {
        console.log('Added course to the database');
    };
    request.onerror = function(event) {
        console.error('Error adding course:', event.target.errorCode);
    };
}

function getAllCourses(callback) {
    console.log("Getting all courses...");
    
    const request = indexedDB.open('EnterpriseSystemsAccessPortalDB', 1);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction('courses', 'readonly');
        const store = transaction.objectStore('courses');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = function(event) {
            callback(null, event.target.result);
        };

        getAllRequest.onerror = function(event) {
            callback('Request error: ' + event.target.errorCode, null);
        };
    };

    request.onerror = function(event) {
        console.error('Error opening database:', event.target.errorCode);
        callback('Error opening database: ' + event.target.errorCode, null);
    };
}

function createCourseTable(courses) {
    const allSoftware = [
        "SAS EG", "SAS EM", "SAS Viya", 
        "SAP HANA", "SAP S/4Hana", "SAP Solution Manager", "SQL Server (Read)", "SQL Server (Individual DB)", 
        "Teradata", "Tableau", "Power BI"
    ]; 

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Course Number</th>
                    <th>Course Name</th>
                    ${allSoftware.map(software => `<th>${software}</th>`).join('')}
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    courses.forEach(course => {
        tableHTML += `
            <tr>
                <td>${course.courseNumber}</td>
                <td>${course.courseName}</td>
                ${allSoftware.map(software => `
                    <td>
                        <input type="checkbox" disabled ${course.requiredSoftwares.includes(software) ? 'checked' : ''}>
                    </td>
                `).join('')}
                <td>

                    <button onclick="editCourse('${course.courseNumber}')" class="icon-button">
                        <img src="icons/Edit.png" alt="Edit" class="icon">
                    </button>
                    <button onclick="deleteCourse('${course.courseNumber}')" class="icon-button">
                        <img src="icons/Delete.png" alt="Delete" class="icon">
                    </button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    document.getElementById('courseTable').innerHTML = tableHTML;
}

function showError(message) {
    document.getElementById('courseTable').innerHTML = `
        <div class="error-message">
            Error: ${message}
        </div>
    `;
}

function editCourse(courseNumber) {
    const request = indexedDB.open('EnterpriseSystemsAccessPortalDB', 1);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction('courses', 'readonly');
        const store = transaction.objectStore('courses');
        const getRequest = store.get(courseNumber);

        getRequest.onsuccess = function(event) {
            const course = event.target.result;
            populateEditForm(course);
            openModal();
        };

        getRequest.onerror = function(event) {
            console.error('Error retrieving course:', event.target.errorCode);
        };
    };

    request.onerror = function(event) {
        console.error('Error opening database:', event.target.errorCode);
    };
}

function populateEditForm(course) {
    document.getElementById('edit-course-number').value = course.courseNumber;
    document.getElementById('edit-course-name').value = course.courseName;
    document.getElementById('edit-course-description').value = course.courseDescription;

    populateSoftwareAccordion(course); // Populate accordion with checkboxes

    /*populateSoftwareCheckboxes(); // Populate checkboxes

    const checkboxes = document.querySelectorAll('input[name="edit-software"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = course.requiredSoftwares.includes(checkbox.value);
    });*/
}

function openModal() {
    document.getElementById('editCourseModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('editCourseModal').style.display = 'none';
}

function saveCourseChanges() {
    const updatedCourse = {
        courseNumber: document.getElementById('edit-course-number').value,
        courseName: document.getElementById('edit-course-name').value,
        courseDescription: document.getElementById('edit-course-description').value,
        requiredSoftwares: Array.from(document.querySelectorAll('input[name="edit-software"]:checked'))
            .map(checkbox => checkbox.value)
    };

    updateCourseInDB(updatedCourse);
    closeModal();
    // Optionally, refresh the table to reflect changes
    getAllCourses((error, courses) => {
        if (!error) {
            createCourseTable(courses);
        }
    });
}

function updateCourseInDB(course) {
    const request = indexedDB.open('EnterpriseSystemsAccessPortalDB', 1);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction('courses', 'readwrite');
        const store = transaction.objectStore('courses');

        const updateRequest = store.put(course);

        updateRequest.onsuccess = function() {
            console.log('Course updated successfully');
            // Optionally, you can refresh the table or provide feedback to the user here
        };

        updateRequest.onerror = function(event) {
            console.error('Error updating course:', event.target.errorCode);
        };
    };

    request.onerror = function(event) {
        console.error('Error opening database:', event.target.errorCode);
    };
}

function populateSoftwareCheckboxes() {
    const softwareContainer = document.getElementById('software-checkboxes');
    softwareContainer.innerHTML = allSoftware.map(software => `
        <label style="display: inline-block; margin-right: 10px;">
            <input type="checkbox" name="edit-software" value="${software}"> ${software}
        </label>
    `).join('');
}

function populateSoftwareAccordion(course) {
    const accordion = document.querySelector('.accordion');
    accordion.innerHTML = ''; // Clear existing content

    for (const [category, products] of Object.entries(softwareCategories)) {
        accordion.innerHTML += `
            <div class="accordion-item">
                <h4 class="accordion-header">${category}</h4>
                <div class="accordion-content">
                    ${products.map(product => `
                        <label>
                            <input type="checkbox" name="edit-software" value="${product}" ${course.requiredSoftwares.includes(product) ? 'checked' : ''}> ${product}
                        </label><br>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Add accordion toggle functionality
    accordion.addEventListener('click', function (e) {
        if (e.target.classList.contains('accordion-header')) {
            const content = e.target.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        }
    });
}

function deleteCourse(courseNumber) {
    if (confirm(`Are you sure you want to delete course ${courseNumber}?`)) {
        // Delete the course from the database
        deleteCourseFromDB(courseNumber, (error) => {
            if (error) {
                console.error('Error deleting course:', error);
                // Optionally, display an error message to the user
                alert(`Error deleting course ${courseNumber}: ${error}`);
            } else {
                // Display a confirmation message after successful deletion
                alert(`Course ${courseNumber} has been deleted.`);
                // Refresh the page to reflect the changes
                location.reload();
            }
        });
    }
}

function deleteCourseFromDB(courseNumber, callback) {
    const request = indexedDB.open('EnterpriseSystemsAccessPortalDB', 1);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction('courses', 'readwrite');
        const store = transaction.objectStore('courses');
        const deleteRequest = store.delete(courseNumber);

        deleteRequest.onsuccess = function() {
            callback(null);
        };

        deleteRequest.onerror = function(event) {
            callback(event.target.errorCode);
        };
    };

    request.onerror = function(event) {
        callback(event.target.errorCode);
    };
}