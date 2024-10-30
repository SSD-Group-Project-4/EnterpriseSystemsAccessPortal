function displayCourseTiles(courses) {
    const container = document.getElementById('courses-container');
    //container.innerHTML = ''; // Clear existing content

    courses.forEach(course => {
        // Create the course tile element
        const tile = document.createElement('div');
        tile.classList.add('course-tile');

        tile.innerHTML = `
            <div class="card-top">
                <h2>WALTON</h2>
                <h3>Information Systems</h3>
            </div>
            <div class="card-bottom">
                <h3 class="course-id">${course.courseNumber}</h3>
                <p class="course-title">${course.courseName}</p>
            </div>
        `;
        // Add click event listener to the entire tile
        tile.addEventListener('click', () => {
            viewPlaybook(course.courseNumber);
        });
        container.appendChild(tile);
    });
}

function viewPlaybook(courseNumber) {
    window.location.href = `view-playbook.html?courseNumber=${courseNumber}`;
}

