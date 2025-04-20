// Fetch and Display Dashboard Stats

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('totalUsers').textContent = '45'; // Example static data
    document.getElementById('totalDepartments').textContent = '8';
    document.getElementById('totalReports').textContent = '120';

    // Fetch initial data
    fetchColleges();
    setupEventListeners();
    populateTables();
});

function setupEventListeners() {
    // Fetch Departments on College Change
    document.getElementById('college_id').addEventListener('change', function () {
        console.log('College changed to:', this.value); // Debug log
        fetchDepartments(this.value);
    });

    // Fetch Levels on Department Change
    document.getElementById('department_id').addEventListener('change', function () {
        console.log('Department changed to:', this.value); // Debug log
        fetchLevels(this.value);
    });

    // Add College
    document.getElementById('addCollegeBtn').addEventListener('click', addCollege);

    // Add Department
    document.getElementById('addDepartmentBtn').addEventListener('click', addDepartment);

    // Add Level
    document.getElementById('addLevelBtn').addEventListener('click', addLevel);
    
    // Add Venue
    document.getElementById('addVenueBtn').addEventListener('click', addVenue);

    // Add Combined Course
    document.getElementById('addCombinedCourseBtn').addEventListener('click', addCombinedCourse);

    // Add Course
    document.getElementById('addCourseBtn').addEventListener('click', addCourse);

}

// Fetch Colleges
function fetchColleges() {
    console.log('Fetching colleges...');
    fetch('../backend/data_creation/get/get_colleges.php')
        .then(response => response.json())
        .then(data => {

            // Populate the college dropdowns
            populateDropdown('college_id', data, '-- Select College --');
            populateDropdown('college_id_levels', data, '-- Select College --');
            populateDropdown('college_id_combined', data, '-- Select College --');
            populateDropdown('college_id_course', data, '-- Select College --');

            
        })
        .catch(error => console.error('Error fetching colleges:', error));
}

// Fetch Departments based on College ID
function fetchDepartments(collegeId) {
    console.log('Fetching departments for college:', collegeId);
    fetch('../backend/data_creation/get/get_departments.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ college_id: collegeId }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Departments fetched:', data);
        if (Array.isArray(data) && data.length > 0) {
            populateDropdown('department_id', data, '-- Select Department --');
            populateDropdown('department_id_course', data, '-- Select Department --'); 
            populateDropdown('department_id_combined_courses', data, '-- Select Department --');
            populateDropdown('departments_combined', data, '-- Select Department --');

            
        } else {
            console.warn('No departments found for this college.');
            populateDropdown('department_id', [], '-- No Departments Available --');
            populateDropdown('department_id_course', [], '-- No Departments Available --');
            populateDropdown('department_id_combined_courses', [], '-- No Departments Available --');
            populateDropdown('departments_combined', [], '-- No Departments Available --');


        }
    })
    .catch(error => console.error('Error fetching departments:', error));
}




// Fetch Levels based on Department ID
function fetchLevels(departmentId) {
    console.log('Fetching levels for department:', departmentId);

    fetch('../backend/data_creation/get/get_levels.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department_id: departmentId }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Levels fetched:', data.data);
                
                // Populate dropdowns for levels
                populateDropdown('level', data.data, '-- Select Level --');
                populateDropdown('level_ccourse', data.data, '-- Select Level --'); // Combined Courses dropdown
                
                // Display students count in read-only input for Manage Courses
                const levelDropdown = document.getElementById('level');
                levelDropdown.addEventListener('change', function () {
                    const selectedLevel = data.data.find(level => level.id === parseInt(this.value));
                    if (selectedLevel) {
                        document.getElementById('students_count_display').value = selectedLevel.students_count;
                    }
                });
            } else {
                console.error('Error fetching levels:', data.message);
            }
        })
        .catch(error => console.error('Error fetching levels:', error));
}

function fetchCourses(levelId) {
    console.log('Fetching courses for level:', levelId);

    fetch('../backend/data_creation/get/get_courses.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level_id: levelId }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
                console.log('Courses fetched:', data.data);

                // Populate the dropdown with course code
                const courseOptions = data.data.map(course => ({
                    value: course.id, // Use course_id for the value
                    label: course.course_code, // Display course_code
                }));

                populateDropdown('course', courseOptions, '-- Select Course --');
            } else {
                console.warn('No courses found for this level.');
                populateDropdown('course', [], '-- No Courses Available --');
            }
        })
        .catch(error => console.error('Error fetching courses:', error));
}






// General Function to Populate Dropdown
function populateDropdown(elementId, data, defaultText) {
    const selectElement = document.getElementById(elementId);
    if (!selectElement) {
        console.error(`Dropdown with id "${elementId}" not found.`);
        return;
    }
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value || item.id;
        option.textContent = item.label || item.name || `Level ${item.level}`;
        selectElement.appendChild(option);
    });
}


// Add College
// Reusable function to show alerts
function showAlert(message, type = 'success') {
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;

    // Append alert to the body or a specific container
    document.body.appendChild(alertBox);

    // Automatically remove the alert after 3 seconds
    setTimeout(() => {
        alertBox.remove();
    }, 3000);
}

// Add College with Alert
function addCollege(event) {
    event.preventDefault();
    const collegeName = document.getElementById('college_name').value;

    fetch('../backend/data_creation/adding/add_college.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: collegeName }),
    })
        .then(response => response.json())
        .then(data => {
            showAlert(data.message, data.status === 'success' ? 'success' : 'error');
            if (data.status === 'success') {
                document.getElementById('college_name').value = '';
                fetchColleges();
            }
        })
        .catch(error => {
            console.error('Error adding college:', error);
            showAlert('An error occurred while adding the college.', 'error');
        });
}

// Add Department with Alert
function addDepartment(event) {
    event.preventDefault();
    const collegeId = document.getElementById('college_id').value;
    const departmentName = document.getElementById('department_name').value;

    fetch('../backend/data_creation/adding/add_department.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ college_id: collegeId, name: departmentName }),
    })
        .then(response => response.json())
        .then(data => {
            showAlert(data.message, data.status === 'success' ? 'success' : 'error');
            if (data.status === 'success') {
                document.getElementById('department_name').value = '';
                fetchDepartments(collegeId);
            }
        })
        .catch(error => {
            console.error('Error adding department:', error);
            showAlert('An error occurred while adding the department.', 'error');
        });
}

// Add Level with Alert
function addLevel(event) {
    event.preventDefault();
    const departmentId = document.getElementById('department_id').value;
    const level = document.getElementById('level_value').value;
    const studentsCount = document.getElementById('students_count').value;

    if (!departmentId || !level || !studentsCount || studentsCount <= 0) {
        showAlert('Please fill out all fields correctly.', 'error');
        return;
    }

    fetch('../backend/data_creation/adding/add_level.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department_id: departmentId, level: level, students_count: studentsCount }),
    })
        .then(response => response.json())
        .then(data => {
            showAlert(data.message, data.status === 'success' ? 'success' : 'error');
            if (data.status === 'success') {
                document.getElementById('level_value').value = '';
                document.getElementById('students_count').value = '';
                fetchLevels(departmentId);
            }
        })
        .catch(error => {
            console.error('Error adding level:', error);
            showAlert('An error occurred while adding the level.', 'error');
        });
}

// Add Course
function addCourse(event) {
    event.preventDefault();
    const courseCode = document.getElementById('course_code').value;
    const courseName = document.getElementById('course_name').value;
    const levelId = document.getElementById('level').value;

    fetch('../backend/data_creation/adding/add_course.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_code: courseCode, course_name: courseName, level_id: levelId }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.status === 'success') {
                document.getElementById('course_code').value = '';
                document.getElementById('course_name').value = '';
                document.getElementById('level').value = '';
            }
        })
        .catch(error => console.error('Error adding course:', error));
}

// Populate Tables
function populateTables() {
    populateTable('../backend/data_creation/get/get_departments.php', 'departments_table', ['id', 'name', 'college_name']);
    populateTable('../backend/data_creation/get/get_venues.php', 'venues_table', ['name', 'capacity']);
    populateTable('../backend/data_creation/get/get_combined_courses.php', 'combined_courses_table', ['course_code', 'course_name', 'departments', 'students_count']);
}

// General Function to Populate Table
function populateTable(apiUrl, tableElementId, columns) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const tableElement = document.getElementById(tableElementId);
            let tableHTML = `
                <table>
                    <thead>
                        <tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
            `;

            data.forEach(row => {
                tableHTML += `<tr>${columns.map(col => `<td>${row[col]}</td>`).join('')}</tr>`;
            });

            tableHTML += '</tbody></table>';
            tableElement.innerHTML = tableHTML;
        })
        .catch(error => console.error(`Error fetching data for ${tableElementId}:`, error));
}
