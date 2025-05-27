// Data Storage (simulating a backend database)
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let activityLogs = JSON.parse(localStorage.getItem('activityLogs')) || [];
let kpis = JSON.parse(localStorage.getItem('kpis')) || [];
let internalMessages = JSON.parse(localStorage.getItem('internalMessages')) || [];

// --- Utility Functions ---

function generateUniqueId(prefix) {
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substring(2, 7);
    return `${prefix}-${timestamp}-${randomString}`.toUpperCase();
}

function saveToLocalStorage() {
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
    localStorage.setItem('kpis', JSON.stringify(kpis));
    localStorage.setItem('internalMessages', JSON.stringify(internalMessages));
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function displayMessage(message, type = 'success') {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('dashboard-message', type);
    messageContainer.textContent = message;

    document.querySelector('.content').prepend(messageContainer);

    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}

// --- Navigation ---
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const sections = document.querySelectorAll('section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and hide all sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(sec => sec.style.display = 'none');

            // Add active class to the clicked button
            button.classList.add('active');

            // Show the corresponding section
            const targetSectionId = button.dataset.section;
            document.getElementById(targetSectionId).style.display = 'block';

            // Re-render tables and charts when their sections become active
            if (targetSectionId === 'employee-records-section') {
                renderEmployeeTable();
            } else if (targetSectionId === 'activity-tracking-section') {
                renderActivityLogTable();
                updateCrmUsageChart();
            } else if (targetSectionId === 'performance-monitoring-section') {
                renderKpiTable();
                updatePerformanceLeaderboardChart();
            } else if (targetSectionId === 'internal-communication-section') {
                renderInternalMessages();
            }
        });
    });

    // Initialize the first section on load
    renderEmployeeTable();
    // For sections that might have charts, ensure they are updated when first viewed
    updateCrmUsageChart(); // Call this here in case activity section is default or visited early
    updatePerformanceLeaderboardChart(); // Same for performance section
    renderInternalMessages();
});

// --- Modal Functions ---
function openAddEmployeeModal() {
    document.getElementById('add-employee-modal').style.display = 'block';
    document.getElementById('add-employee-form').reset(); // Clear form on open
}

function closeAddEmployeeModal() {
    document.getElementById('add-employee-modal').style.display = 'none';
}

function openLogActivityModal() {
    document.getElementById('log-activity-modal').style.display = 'block';
    document.getElementById('log-activity-form').reset();
}

function closeLogActivityModal() {
    document.getElementById('log-activity-modal').style.display = 'none';
}

function openSetKpiModal() {
    document.getElementById('set-kpi-modal').style.display = 'block';
    document.getElementById('set-kpi-form').reset();
}

function closeSetKpiModal() {
    document.getElementById('set-kpi-modal').style.display = 'none';
}

// Communication Modals
document.getElementById('team-message-button').addEventListener('click', () => {
    document.getElementById('team-message-modal').style.display = 'block';
    document.getElementById('team-message-form').reset();
    toggleMessageRecipientInput(); // Ensure correct input is shown
});
document.querySelector('#team-message-modal .close-button').addEventListener('click', () => {
    document.getElementById('team-message-modal').style.display = 'none';
});

document.getElementById('broadcast-announcement-button').addEventListener('click', () => {
    document.getElementById('broadcast-announcement-modal').style.display = 'block';
    document.getElementById('broadcast-announcement-form').reset();
});
document.querySelector('#broadcast-announcement-modal .close-button').addEventListener('click', () => {
    document.getElementById('broadcast-announcement-modal').style.display = 'none';
});

document.getElementById('file-sharing-button').addEventListener('click', () => {
    document.getElementById('file-sharing-modal').style.display = 'block';
    document.getElementById('file-sharing-form').reset();
    toggleFileShareRecipientInput(); // Ensure correct input is shown
});
document.querySelector('#file-sharing-modal .close-button').addEventListener('click', () => {
    document.getElementById('file-sharing-modal').style.display = 'none';
});

document.getElementById('hr-feedback-button').addEventListener('click', () => {
    document.getElementById('hr-feedback-modal').style.display = 'block';
    document.getElementById('hr-feedback-form').reset();
    document.getElementById('hr-feedback-type').value = ""; // Reset dropdown to placeholder
});
document.querySelector('#hr-feedback-modal .close-button').addEventListener('click', () => {
    document.getElementById('hr-feedback-modal').style.display = 'none';
});


// Dashboard-Wide Feature Modals
function openRoleBasedAccessModal() {
    document.getElementById('role-based-access-modal').style.display = 'block';
}
function closeRoleBasedAccessModal() {
    document.getElementById('role-based-access-modal').style.display = 'none';
}

function openImportExportToolsModal() {
    document.getElementById('import-export-tools-modal').style.display = 'block';
}
function closeImportExportToolsModal() {
    document.getElementById('import-export-tools-modal').style.display = 'none';
}

function openAnomalyDetectionModal() {
    document.getElementById('anomaly-detection-modal').style.display = 'block';
}
function closeAnomalyDetectionModal() {
    document.getElementById('anomaly-detection-modal').style.display = 'none';
}

function openModuleSyncModal() {
    document.getElementById('module-sync-modal').style.display = 'block';
}
function closeModuleSyncModal() {
    document.getElementById('module-sync-modal').style.display = 'none';
}


// --- Employee Records & Profiles Section ---
const addEmployeeForm = document.getElementById('add-employee-form');
addEmployeeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const employeeName = document.getElementById('employee-name').value.trim();
    const designation = document.getElementById('employee-designation').value.trim();
    const department = document.getElementById('employee-department').value.trim();
    const contact = document.getElementById('employee-contact').value.trim();
    const shift = document.getElementById('employee-shift').value.trim();
    const location = document.getElementById('employee-location').value.trim();
    const joinDate = document.getElementById('employee-join-date').value;
    const status = document.getElementById('employee-status').value;
    const documents = document.getElementById('employee-documents').files.length > 0 ? Array.from(document.getElementById('employee-documents').files).map(f => f.name).join(', ') : 'None';

    // Basic validation matching HTML patterns for contact and name
    const contactPattern = /^[6-9]{1}[0-9]{9}$/;
    if (!contactPattern.test(contact)) {
        displayMessage('Invalid contact number. Must be 10 digits and start with 6-9.', 'error');
        return;
    }

    const namePattern = /^[A-Za-z\s\-']+$/;
    if (!namePattern.test(employeeName)) {
        displayMessage('Employee Name can only contain letters, spaces, hyphens, and apostrophes.', 'error');
        return;
    }
    if (employeeName.length > 50) {
        displayMessage('Employee Name should not exceed 50 characters.', 'error');
        return;
    }
    if (designation.length > 50) {
        displayMessage('Designation should not exceed 50 characters.', 'error');
        return;
    }
    if (department.length > 50) {
        displayMessage('Department should not exceed 50 characters.', 'error');
        return;
    }


    const newEmployee = {
        id: generateUniqueId('EMP'),
        employeeId: 'EMP' + (employees.length + 1).toString().padStart(3, '0'), // Simple incremental ID
        name: employeeName,
        designation: designation,
        department: department,
        contact: contact,
        shift: shift,
        location: location,
        joinDate: joinDate,
        status: status,
        documents: documents
    };

    employees.push(newEmployee);
    saveToLocalStorage();
    renderEmployeeTable();
    closeAddEmployeeModal();
    displayMessage('Employee added successfully!');
});

function renderEmployeeTable(data = employees) {
    const tableBody = document.getElementById('employee-table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="11" class="no-data">No employee records found.</td></tr>';
        return;
    }

    data.forEach(employee => {
        const row = tableBody.insertRow();
        row.dataset.id = employee.id; // Store unique ID for editing/deleting

        row.insertCell().textContent = employee.employeeId;
        row.insertCell().textContent = employee.name;
        row.insertCell().textContent = employee.designation;
        row.insertCell().textContent = employee.department;
        row.insertCell().textContent = employee.contact;
        row.insertCell().textContent = employee.shift;
        row.insertCell().textContent = employee.location;
        row.insertCell().textContent = formatDate(employee.joinDate);
        row.insertCell().textContent = employee.status;
        row.insertCell().textContent = employee.documents;

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.classList.add('action-button', 'edit-button');
        editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editButton.title = 'Edit Employee';
        editButton.onclick = () => editEmployee(employee.id);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('action-button', 'delete-button');
        deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        deleteButton.title = 'Delete Employee';
        deleteButton.onclick = () => deleteEmployee(employee.id);
        actionsCell.appendChild(deleteButton);
    });
}

function editEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) {
        displayMessage('Employee not found for editing.', 'error');
        return;
    }

    // Populate the modal with current employee data
    document.getElementById('employee-name').value = employee.name;
    document.getElementById('employee-designation').value = employee.designation;
    document.getElementById('employee-department').value = employee.department;
    document.getElementById('employee-contact').value = employee.contact;
    document.getElementById('employee-shift').value = employee.shift;
    document.getElementById('employee-location').value = employee.location;
    document.getElementById('employee-join-date').value = employee.joinDate;
    document.getElementById('employee-status').value = employee.status;
    // Documents cannot be pre-filled for security reasons, user would re-upload if needed

    // Change modal title and button text for editing
    const modalTitle = document.querySelector('#add-employee-modal h4');
    const submitButton = document.querySelector('#add-employee-form button[type="submit"]');
    modalTitle.textContent = 'Edit Employee';
    submitButton.textContent = 'Update Employee';

    // Set a data attribute on the form to store the ID of the employee being edited
    addEmployeeForm.dataset.editingId = id;

    // Open the modal
    openAddEmployeeModal();

    // Modify submit listener to handle update
    addEmployeeForm.onsubmit = (e) => {
        e.preventDefault();
        const updatedId = addEmployeeForm.dataset.editingId;
        const index = employees.findIndex(emp => emp.id === updatedId);

        if (index > -1) {
            const contactPattern = /^[6-9]{1}[0-9]{9}$/;
            if (!contactPattern.test(document.getElementById('employee-contact').value.trim())) {
                displayMessage('Invalid contact number. Must be 10 digits and start with 6-9.', 'error');
                return;
            }

            const namePattern = /^[A-Za-z\s\-']+$/;
            if (!namePattern.test(document.getElementById('employee-name').value.trim())) {
                displayMessage('Employee Name can only contain letters, spaces, hyphens, and apostrophes.', 'error');
                return;
            }
             if (document.getElementById('employee-name').value.trim().length > 50) {
                displayMessage('Employee Name should not exceed 50 characters.', 'error');
                return;
            }
            if (document.getElementById('employee-designation').value.trim().length > 50) {
                displayMessage('Designation should not exceed 50 characters.', 'error');
                return;
            }
            if (document.getElementById('employee-department').value.trim().length > 50) {
                displayMessage('Department should not exceed 50 characters.', 'error');
                return;
            }


            employees[index] = {
                ...employees[index], // Keep existing ID and employeeId
                name: document.getElementById('employee-name').value.trim(),
                designation: document.getElementById('employee-designation').value.trim(),
                department: document.getElementById('employee-department').value.trim(),
                contact: document.getElementById('employee-contact').value.trim(),
                shift: document.getElementById('employee-shift').value.trim(),
                location: document.getElementById('employee-location').value.trim(),
                joinDate: document.getElementById('employee-join-date').value,
                status: document.getElementById('employee-status').value,
                // Documents would require re-upload or separate management for updates
                documents: document.getElementById('employee-documents').files.length > 0 ? Array.from(document.getElementById('employee-documents').files).map(f => f.name).join(', ') : employees[index].documents
            };
            saveToLocalStorage();
            renderEmployeeTable();
            closeAddEmployeeModal();
            displayMessage('Employee updated successfully!');
        } else {
            displayMessage('Error updating employee: Employee not found.', 'error');
        }

        // Reset form and submit listener to original "Add Employee" state
        addEmployeeForm.reset();
        delete addEmployeeForm.dataset.editingId;
        modalTitle.textContent = 'Add New Employee';
        submitButton.textContent = 'Add Employee';
        addEmployeeForm.onsubmit = null; // Remove this specific listener
        addEmployeeForm.addEventListener('submit', (e) => { // Re-add the original listener
            // Re-adding the original listener logic here to avoid code duplication issues.
            // In a real app, this might be a helper function or a more structured event delegation.
            if (!addEmployeeForm.dataset.editingId) { // Only run if not in edit mode
                const employeeName = document.getElementById('employee-name').value.trim();
                const designation = document.getElementById('employee-designation').value.trim();
                const department = document.getElementById('employee-department').value.trim();
                const contact = document.getElementById('employee-contact').value.trim();
                const shift = document.getElementById('employee-shift').value.trim();
                const location = document.getElementById('employee-location').value.trim();
                const joinDate = document.getElementById('employee-join-date').value;
                const status = document.getElementById('employee-status').value;
                const documents = document.getElementById('employee-documents').files.length > 0 ? Array.from(document.getElementById('employee-documents').files).map(f => f.name).join(', ') : 'None';

                // Basic validation matching HTML patterns for contact and name
                const contactPattern = /^[6-9]{1}[0-9]{9}$/;
                if (!contactPattern.test(contact)) {
                    displayMessage('Invalid contact number. Must be 10 digits and start with 6-9.', 'error');
                    return;
                }

                const namePattern = /^[A-Za-z\s\-']+$/;
                if (!namePattern.test(employeeName)) {
                    displayMessage('Employee Name can only contain letters, spaces, hyphens, and apostrophes.', 'error');
                    return;
                }
                 if (employeeName.length > 50) {
                    displayMessage('Employee Name should not exceed 50 characters.', 'error');
                    return;
                }
                if (designation.length > 50) {
                    displayMessage('Designation should not exceed 50 characters.', 'error');
                    return;
                }
                if (department.length > 50) {
                    displayMessage('Department should not exceed 50 characters.', 'error');
                    return;
                }

                const newEmployee = {
                    id: generateUniqueId('EMP'),
                    employeeId: 'EMP' + (employees.length + 1).toString().padStart(3, '0'),
                    name: employeeName,
                    designation: designation,
                    department: department,
                    contact: contact,
                    shift: shift,
                    location: location,
                    joinDate: joinDate,
                    status: status,
                    documents: documents
                };

                employees.push(newEmployee);
                saveToLocalStorage();
                renderEmployeeTable();
                closeAddEmployeeModal();
                displayMessage('Employee added successfully!');
            }
        });
    };
}


function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee record? This action cannot be undone.')) {
        employees = employees.filter(emp => emp.id !== id);
        saveToLocalStorage();
        renderEmployeeTable();
        displayMessage('Employee deleted successfully!', 'info');
    }
}

// --- Activity Tracking & Logging Section ---
const logActivityForm = document.getElementById('log-activity-form');
logActivityForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const employeeId = document.getElementById('activity-employee-id').value.trim();
    const logDate = document.getElementById('activity-date').value;
    const activityType = document.getElementById('activity-type').value.trim();
    const description = document.getElementById('activity-description').value.trim();
    const hoursActive = parseFloat(document.getElementById('activity-hours').value);
    const moduleAccessed = document.getElementById('activity-module').value.trim();
    const geoTag = document.getElementById('activity-geo-tag').value.trim();

    const employeeIdPattern = /^[A-Za-z0-9]{5}$/;
    if (!employeeIdPattern.test(employeeId)) {
        displayMessage('Employee ID must be 5 alphanumeric characters.', 'error');
        return;
    }
    if (activityType.length > 100) {
        displayMessage('Activity Type should not exceed 100 characters.', 'error');
        return;
    }
    if (hoursActive <= 0) {
        displayMessage('Hours Active must be a positive number.', 'error');
        return;
    }
    if (!logDate) {
        displayMessage('Please select a log date.', 'error');
        return;
    }

    const newActivity = {
        id: generateUniqueId('ACT'),
        employeeId: employeeId,
        logDate: logDate,
        activityType: activityType,
        description: description,
        hoursActive: hoursActive,
        moduleAccessed: moduleAccessed,
        geoTag: geoTag
    };

    activityLogs.push(newActivity);
    saveToLocalStorage();
    renderActivityLogTable();
    updateCrmUsageChart();
    closeLogActivityModal();
    displayMessage('Activity logged successfully!');
});

function renderActivityLogTable(data = activityLogs) {
    const tableBody = document.getElementById('activity-log-table-body');
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="no-data">No activity logs found.</td></tr>';
        return;
    }

    data.forEach(activity => {
        const row = tableBody.insertRow();
        row.dataset.id = activity.id;

        row.insertCell().textContent = activity.employeeId;
        row.insertCell().textContent = formatDate(activity.logDate);
        row.insertCell().textContent = activity.activityType;
        row.insertCell().textContent = activity.description;
        row.insertCell().textContent = activity.hoursActive;
        row.insertCell().textContent = activity.moduleAccessed;
        row.insertCell().textContent = activity.geoTag;

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.classList.add('action-button', 'edit-button');
        editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editButton.title = 'Edit Activity';
        editButton.onclick = () => editActivity(activity.id);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('action-button', 'delete-button');
        deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        deleteButton.title = 'Delete Activity';
        deleteButton.onclick = () => deleteActivity(activity.id);
        actionsCell.appendChild(deleteButton);
    });
}

function editActivity(id) {
    const activity = activityLogs.find(act => act.id === id);
    if (!activity) {
        displayMessage('Activity not found for editing.', 'error');
        return;
    }

    document.getElementById('activity-employee-id').value = activity.employeeId;
    document.getElementById('activity-date').value = activity.logDate;
    document.getElementById('activity-type').value = activity.activityType;
    document.getElementById('activity-description').value = activity.description;
    document.getElementById('activity-hours').value = activity.hoursActive;
    document.getElementById('activity-module').value = activity.moduleAccessed;
    document.getElementById('activity-geo-tag').value = activity.geoTag;

    const modalTitle = document.querySelector('#log-activity-modal h4');
    const submitButton = document.querySelector('#log-activity-form button[type="submit"]');
    modalTitle.textContent = 'Edit Employee Activity';
    submitButton.textContent = 'Update Activity';

    logActivityForm.dataset.editingId = id;
    openLogActivityModal();

    logActivityForm.onsubmit = (e) => {
        e.preventDefault();
        const updatedId = logActivityForm.dataset.editingId;
        const index = activityLogs.findIndex(act => act.id === updatedId);

        if (index > -1) {
            const employeeId = document.getElementById('activity-employee-id').value.trim();
            const employeeIdPattern = /^[A-Za-z0-9]{5}$/;
            if (!employeeIdPattern.test(employeeId)) {
                displayMessage('Employee ID must be 5 alphanumeric characters.', 'error');
                return;
            }
             if (document.getElementById('activity-type').value.trim().length > 100) {
                displayMessage('Activity Type should not exceed 100 characters.', 'error');
                return;
            }
            if (parseFloat(document.getElementById('activity-hours').value) <= 0) {
                displayMessage('Hours Active must be a positive number.', 'error');
                return;
            }
            if (!document.getElementById('activity-date').value) {
                displayMessage('Please select a log date.', 'error');
                return;
            }


            activityLogs[index] = {
                ...activityLogs[index],
                employeeId: employeeId,
                logDate: document.getElementById('activity-date').value,
                activityType: document.getElementById('activity-type').value.trim(),
                description: document.getElementById('activity-description').value.trim(),
                hoursActive: parseFloat(document.getElementById('activity-hours').value),
                moduleAccessed: document.getElementById('activity-module').value.trim(),
                geoTag: document.getElementById('activity-geo-tag').value.trim()
            };
            saveToLocalStorage();
            renderActivityLogTable();
            updateCrmUsageChart();
            closeLogActivityModal();
            displayMessage('Activity updated successfully!');
        } else {
            displayMessage('Error updating activity: Activity not found.', 'error');
        }

        logActivityForm.reset();
        delete logActivityForm.dataset.editingId;
        modalTitle.textContent = 'Log Employee Activity';
        submitButton.textContent = 'Log Activity';
        logActivityForm.onsubmit = null;
        logActivityForm.addEventListener('submit', (e) => {
             if (!logActivityForm.dataset.editingId) {
                const employeeId = document.getElementById('activity-employee-id').value.trim();
                const logDate = document.getElementById('activity-date').value;
                const activityType = document.getElementById('activity-type').value.trim();
                const description = document.getElementById('activity-description').value.trim();
                const hoursActive = parseFloat(document.getElementById('activity-hours').value);
                const moduleAccessed = document.getElementById('activity-module').value.trim();
                const geoTag = document.getElementById('activity-geo-tag').value.trim();

                const employeeIdPattern = /^[A-Za-z0-9]{5}$/;
                if (!employeeIdPattern.test(employeeId)) {
                    displayMessage('Employee ID must be 5 alphanumeric characters.', 'error');
                    return;
                }
                 if (activityType.length > 100) {
                    displayMessage('Activity Type should not exceed 100 characters;', 'error');
                    return;
                }
                if (hoursActive <= 0) {
                    displayMessage('Hours Active must be a positive number.', 'error');
                    return;
                }
                if (!logDate) {
                    displayMessage('Please select a log date.', 'error');
                    return;
                }


                const newActivity = {
                    id: generateUniqueId('ACT'),
                    employeeId: employeeId,
                    logDate: logDate,
                    activityType: activityType,
                    description: description,
                    hoursActive: hoursActive,
                    moduleAccessed: moduleAccessed,
                    geoTag: geoTag
                };

                activityLogs.push(newActivity);
                saveToLocalStorage();
                renderActivityLogTable();
                updateCrmUsageChart();
                closeLogActivityModal();
                displayMessage('Activity logged successfully!');
            }
        });
    };
}


function deleteActivity(id) {
    if (confirm('Are you sure you want to delete this activity log?')) {
        activityLogs = activityLogs.filter(act => act.id !== id);
        saveToLocalStorage();
        renderActivityLogTable();
        updateCrmUsageChart();
        displayMessage('Activity log deleted successfully!', 'info');
    }
}

// Chart.js for CRM Usage Summary
let crmUsageChart;
function updateCrmUsageChart() {
    const ctx = document.getElementById('crm-usage-chart').getContext('2d');

    // Aggregate data for the chart
    const dailyHours = {};
    activityLogs.forEach(log => {
        const date = formatDate(log.logDate);
        dailyHours[date] = (dailyHours[date] || 0) + log.hoursActive;
    });

    const labels = Object.keys(dailyHours).sort();
    const data = labels.map(date => dailyHours[date]);

    if (crmUsageChart) {
        crmUsageChart.destroy(); // Destroy existing chart before creating a new one
    }

    crmUsageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Hours Active on CRM',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + ' hours';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}


// --- Performance Monitoring Section ---
const setKpiForm = document.getElementById('set-kpi-form');
setKpiForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const employeeId = document.getElementById('kpi-employee-id').value.trim();
    const kpiName = document.getElementById('kpi-name').value.trim();
    const role = document.getElementById('kpi-role').value.trim();
    const target = parseFloat(document.getElementById('kpi-target').value);
    const actual = parseFloat(document.getElementById('kpi-actual').value);

    const employeeIdPattern = /^[A-Za-z0-9]{5}$/;
    if (!employeeIdPattern.test(employeeId)) {
        displayMessage('Employee ID must be 5 alphanumeric characters.', 'error');
        return;
    }
    if (kpiName.length > 100) {
        displayMessage('KPI Name should not exceed 100 characters.', 'error');
        return;
    }
    if (isNaN(target) || target < 0) {
        displayMessage('Target must be a non-negative number.', 'error');
        return;
    }
     if (isNaN(actual) || actual < 0) { // Actual can be 0 or more
        displayMessage('Actual must be a non-negative number.', 'error');
        return;
    }

    const achievement = target > 0 ? (actual / target * 100).toFixed(2) : 'N/A';
    const status = achievement === 'N/A' ? 'Not Set' : (parseFloat(achievement) >= 100 ? 'Achieved' : 'In Progress');

    const newKpi = {
        id: generateUniqueId('KPI'),
        employeeId: employeeId,
        kpiName: kpiName,
        role: role,
        target: target,
        actual: actual,
        achievement: achievement,
        status: status
    };

    // Check if KPI for this employee/kpiName already exists to update
    const existingKpiIndex = kpis.findIndex(k => k.employeeId === employeeId && k.kpiName === kpiName);
    if (existingKpiIndex > -1) {
        kpis[existingKpiIndex] = { ...newKpi, id: kpis[existingKpiIndex].id }; // Retain original ID
        displayMessage('KPI updated successfully!');
    } else {
        kpis.push(newKpi);
        displayMessage('KPI set successfully!');
    }

    saveToLocalStorage();
    renderKpiTable();
    updatePerformanceLeaderboardChart();
    closeSetKpiModal();
});


function renderKpiTable(data = kpis) {
    const tableBody = document.getElementById('kpi-table-body');
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="no-data">No KPI records found.</td></tr>';
        return;
    }

    data.forEach(kpi => {
        const row = tableBody.insertRow();
        row.dataset.id = kpi.id;

        row.insertCell().textContent = kpi.employeeId;
        row.insertCell().textContent = kpi.kpiName;
        row.insertCell().textContent = kpi.role;
        row.insertCell().textContent = kpi.target;
        row.insertCell().textContent = kpi.actual;
        row.insertCell().textContent = kpi.achievement + '%';
        row.insertCell().textContent = kpi.status;

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.classList.add('action-button', 'edit-button');
        editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editButton.title = 'Edit KPI';
        editButton.onclick = () => editKpi(kpi.id);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('action-button', 'delete-button');
        deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        deleteButton.title = 'Delete KPI';
        deleteButton.onclick = () => deleteKpi(kpi.id);
        actionsCell.appendChild(deleteButton);
    });
}

function editKpi(id) {
    const kpi = kpis.find(k => k.id === id);
    if (!kpi) {
        displayMessage('KPI not found for editing.', 'error');
        return;
    }

    document.getElementById('kpi-employee-id').value = kpi.employeeId;
    document.getElementById('kpi-name').value = kpi.kpiName;
    document.getElementById('kpi-role').value = kpi.role;
    document.getElementById('kpi-target').value = kpi.target;
    document.getElementById('kpi-actual').value = kpi.actual;

    const modalTitle = document.querySelector('#set-kpi-modal h4');
    const submitButton = document.querySelector('#set-kpi-form button[type="submit"]');
    modalTitle.textContent = 'Edit Employee KPI';
    submitButton.textContent = 'Update KPI';

    setKpiForm.dataset.editingId = id;
    openSetKpiModal();

    setKpiForm.onsubmit = (e) => {
        e.preventDefault();
        const updatedId = setKpiForm.dataset.editingId;
        const index = kpis.findIndex(k => k.id === updatedId);

        if (index > -1) {
            const employeeId = document.getElementById('kpi-employee-id').value.trim();
            const employeeIdPattern = /^[A-Za-z0-9]{5}$/;
            if (!employeeIdPattern.test(employeeId)) {
                displayMessage('Employee ID must be 5 alphanumeric characters.', 'error');
                return;
            }
             if (document.getElementById('kpi-name').value.trim().length > 100) {
                displayMessage('KPI Name should not exceed 100 characters.', 'error');
                return;
            }
            if (isNaN(parseFloat(document.getElementById('kpi-target').value)) || parseFloat(document.getElementById('kpi-target').value) < 0) {
                displayMessage('Target must be a non-negative number.', 'error');
                return;
            }
             if (isNaN(parseFloat(document.getElementById('kpi-actual').value)) || parseFloat(document.getElementById('kpi-actual').value) < 0) {
                displayMessage('Actual must be a non-negative number.', 'error');
                return;
            }

            const updatedTarget = parseFloat(document.getElementById('kpi-target').value);
            const updatedActual = parseFloat(document.getElementById('kpi-actual').value);
            const updatedAchievement = updatedTarget > 0 ? (updatedActual / updatedTarget * 100).toFixed(2) : 'N/A';
            const updatedStatus = updatedAchievement === 'N/A' ? 'Not Set' : (parseFloat(updatedAchievement) >= 100 ? 'Achieved' : 'In Progress');

            kpis[index] = {
                ...kpis[index],
                employeeId: employeeId,
                kpiName: document.getElementById('kpi-name').value.trim(),
                role: document.getElementById('kpi-role').value.trim(),
                target: updatedTarget,
                actual: updatedActual,
                achievement: updatedAchievement,
                status: updatedStatus
            };
            saveToLocalStorage();
            renderKpiTable();
            updatePerformanceLeaderboardChart();
            closeSetKpiModal();
            displayMessage('KPI updated successfully!');
        } else {
            displayMessage('Error updating KPI: KPI not found.', 'error');
        }

        setKpiForm.reset();
        delete setKpiForm.dataset.editingId;
        modalTitle.textContent = 'Set/Update Employee KPI';
        submitButton.textContent = 'Save KPI';
        setKpiForm.onsubmit = null;
        setKpiForm.addEventListener('submit', (e) => {
             if (!setKpiForm.dataset.editingId) {
                const employeeId = document.getElementById('kpi-employee-id').value.trim();
                const kpiName = document.getElementById('kpi-name').value.trim();
                const role = document.getElementById('kpi-role').value.trim();
                const target = parseFloat(document.getElementById('kpi-target').value);
                const actual = parseFloat(document.getElementById('kpi-actual').value);

                const employeeIdPattern = /^[A-Za-z0-9]{5}$/;
                if (!employeeIdPattern.test(employeeId)) {
                    displayMessage('Employee ID must be 5 alphanumeric characters.', 'error');
                    return;
                }
                if (kpiName.length > 100) {
                    displayMessage('KPI Name should not exceed 100 characters.', 'error');
                    return;
                }
                if (isNaN(target) || target < 0) {
                    displayMessage('Target must be a non-negative number.', 'error');
                    return;
                }
                 if (isNaN(actual) || actual < 0) {
                    displayMessage('Actual must be a non-negative number.', 'error');
                    return;
                }

                const achievement = target > 0 ? (actual / target * 100).toFixed(2) : 'N/A';
                const status = achievement === 'N/A' ? 'Not Set' : (parseFloat(achievement) >= 100 ? 'Achieved' : 'In Progress');

                const newKpi = {
                    id: generateUniqueId('KPI'),
                    employeeId: employeeId,
                    kpiName: kpiName,
                    role: role,
                    target: target,
                    actual: actual,
                    achievement: achievement,
                    status: status
                };

                const existingKpiIndex = kpis.findIndex(k => k.employeeId === employeeId && k.kpiName === kpiName);
                if (existingKpiIndex > -1) {
                    kpis[existingKpiIndex] = { ...newKpi, id: kpis[existingKpiIndex].id };
                    displayMessage('KPI updated successfully!');
                } else {
                    kpis.push(newKpi);
                    displayMessage('KPI set successfully!');
                }

                saveToLocalStorage();
                renderKpiTable();
                updatePerformanceLeaderboardChart();
                closeSetKpiModal();
            }
        });
    };
}


function deleteKpi(id) {
    if (confirm('Are you sure you want to delete this KPI record?')) {
        kpis = kpis.filter(kpi => kpi.id !== id);
        saveToLocalStorage();
        renderKpiTable();
        updatePerformanceLeaderboardChart();
        displayMessage('KPI record deleted successfully!', 'info');
    }
}

// Chart.js for Performance Leaderboard
let performanceLeaderboardChart;
function updatePerformanceLeaderboardChart() {
    const ctx = document.getElementById('performance-leaderboard-chart').getContext('2d');

    // Aggregate average achievement per employee
    const employeePerformance = {}; // {employeeId: {totalAchievement: X, count: Y}}
    kpis.forEach(kpi => {
        if (kpi.achievement !== 'N/A') {
            const achievement = parseFloat(kpi.achievement);
            if (!employeePerformance[kpi.employeeId]) {
                employeePerformance[kpi.employeeId] = { totalAchievement: 0, count: 0 };
            }
            employeePerformance[kpi.employeeId].totalAchievement += achievement;
            employeePerformance[kpi.employeeId].count++;
        }
    });

    const leaderboardData = [];
    for (const empId in employeePerformance) {
        const avgAchievement = (employeePerformance[empId].totalAchievement / employeePerformance[empId].count).toFixed(2);
        leaderboardData.push({ employeeId: empId, avgAchievement: parseFloat(avgAchievement) });
    }

    // Sort by average achievement descending
    leaderboardData.sort((a, b) => b.avgAchievement - a.avgAchievement);

    const labels = leaderboardData.map(item => {
        const employee = employees.find(emp => emp.employeeId === item.employeeId);
        return employee ? employee.name : item.employeeId; // Show name if available, else ID
    });
    const data = leaderboardData.map(item => item.avgAchievement);

    if (performanceLeaderboardChart) {
        performanceLeaderboardChart.destroy(); // Destroy existing chart
    }

    performanceLeaderboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average KPI Achievement (%)',
                data: data,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Horizontal bars for leaderboard
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Achievement (%)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Employee'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                label += context.parsed.x + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}


// --- Internal Communication Section ---
const messageRecipientType = document.getElementById('message-recipient-type');
const messageIndividualRecipientGroup = document.getElementById('message-individual-recipient-group');
const messageDepartmentRecipientGroup = document.getElementById('message-department-recipient-group');

if (messageRecipientType) { // Check if element exists before adding listener
    messageRecipientType.addEventListener('change', toggleMessageRecipientInput);
}

function toggleMessageRecipientInput() {
    if (messageRecipientType.value === 'individual') {
        messageIndividualRecipientGroup.style.display = 'block';
        messageDepartmentRecipientGroup.style.display = 'none';
        document.getElementById('message-employee-id').setAttribute('required', 'required');
        document.getElementById('message-department').removeAttribute('required');
    } else if (messageRecipientType.value === 'department') {
        messageIndividualRecipientGroup.style.display = 'none';
        messageDepartmentRecipientGroup.style.display = 'block';
        document.getElementById('message-employee-id').removeAttribute('required');
        document.getElementById('message-department').setAttribute('required', 'required');
    }
}

const teamMessageForm = document.getElementById('team-message-form');
teamMessageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const recipientType = document.getElementById('message-recipient-type').value;
    let recipient = '';
    if (recipientType === 'individual') {
        recipient = document.getElementById('message-employee-id').value.trim();
        const employeeIdPattern = /^[A-Za-z0-9]{5}$/;
        if (!employeeIdPattern.test(recipient)) {
            displayMessage('Employee ID must be 5 alphanumeric characters.', 'error');
            return;
        }
        if (!employees.some(emp => emp.employeeId === recipient)) {
             displayMessage('Employee ID not found.', 'error');
             return;
        }
    } else if (recipientType === 'department') {
        recipient = document.getElementById('message-department').value.trim();
        if (recipient.length === 0) {
            displayMessage('Department name cannot be empty.', 'error');
            return;
        }
    }
    const messageContent = document.getElementById('message-content').value.trim();

    if (messageContent.length === 0) {
        displayMessage('Message content cannot be empty.', 'error');
        return;
    }

    const newMessage = {
        type: 'Team Message',
        timestamp: new Date().toLocaleString(),
        sender: 'Admin/CRM System', // In a real system, this would be the logged-in user
        recipientType: recipientType,
        recipient: recipient,
        content: messageContent
    };
    internalMessages.push(newMessage);
    saveToLocalStorage();
    renderInternalMessages();
    document.getElementById('team-message-modal').style.display = 'none';
    displayMessage('Team message sent successfully!');
});

const broadcastAnnouncementForm = document.getElementById('broadcast-announcement-form');
broadcastAnnouncementForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('announcement-title').value.trim();
    const message = document.getElementById('announcement-message').value.trim();

    if (title.length === 0) {
        displayMessage('Announcement title cannot be empty.', 'error');
        return;
    }
     if (title.length > 100) {
        displayMessage('Announcement title should not exceed 100 characters.', 'error');
        return;
    }
    if (message.length === 0) {
        displayMessage('Announcement message cannot be empty.', 'error');
        return;
    }

    const newAnnouncement = {
        type: 'Broadcast Announcement',
        timestamp: new Date().toLocaleString(),
        sender: 'Admin/CRM System',
        title: title,
        content: message
    };
    internalMessages.push(newAnnouncement);
    saveToLocalStorage();
    renderInternalMessages();
    document.getElementById('broadcast-announcement-modal').style.display = 'none';
    displayMessage('Broadcast announcement sent successfully!');
});


const fileShareRecipientType = document.getElementById('file-share-recipient-type');
const fileShareIndividualRecipientGroup = document.getElementById('file-share-individual-recipient-group');
const fileShareDepartmentRecipientGroup = document.getElementById('file-share-department-recipient-group');

if (fileShareRecipientType) { // Check if element exists before adding listener
    fileShareRecipientType.addEventListener('change', toggleFileShareRecipientInput);
}

function toggleFileShareRecipientInput() {
    const selectedType = fileShareRecipientType.value;
    if (selectedType === 'individual') {
        fileShareIndividualRecipientGroup.style.display = 'block';
        fileShareDepartmentRecipientGroup.style.display = 'none';
        document.getElementById('file-share-employee-id').setAttribute('required', 'required');
        document.getElementById('file-share-department').removeAttribute('required');
    } else if (selectedType === 'department') {
        fileShareIndividualRecipientGroup.style.display = 'none';
        fileShareDepartmentRecipientGroup.style.display = 'block';
        document.getElementById('file-share-employee-id').removeAttribute('required');
        document.getElementById('file-share-department').setAttribute('required', 'required');
    } else { // 'all'
        fileShareIndividualRecipientGroup.style.display = 'none';
        fileShareDepartmentRecipientGroup.style.display = 'none';
        document.getElementById('file-share-employee-id').removeAttribute('required');
        document.getElementById('file-share-department').removeAttribute('required');
    }
}

const fileSharingForm = document.getElementById('file-sharing-form');
fileSharingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const files = document.getElementById('file-upload').files;
    const recipientType = document.getElementById('file-share-recipient-type').value;
    let recipient = '';
    const description = document.getElementById('file-description').value.trim();

    if (files.length === 0) {
        displayMessage('Please select files to share.', 'error');
        return;
    }

    const fileNames = Array.from(files).map(f => f.name).join(', ');

    if (recipientType === 'individual') {
        recipient = document.getElementById('file-share-employee-id').value.trim();
        const employeeIdPattern = /^[A-Za-z0-9]{5}$/;
        if (!employeeIdPattern.test(recipient)) {
            displayMessage('Employee ID must be 5 alphanumeric characters.', 'error');
            return;
        }
         if (!employees.some(emp => emp.employeeId === recipient)) {
             displayMessage('Employee ID not found.', 'error');
             return;
        }
    } else if (recipientType === 'department') {
        recipient = document.getElementById('file-share-department').value.trim();
        if (recipient.length === 0) {
            displayMessage('Department name cannot be empty.', 'error');
            return;
        }
    } else if (recipientType === 'all') {
        recipient = 'All Employees';
    }

    const newFileShare = {
        type: 'File Share',
        timestamp: new Date().toLocaleString(),
        sender: 'Admin/CRM System',
        files: fileNames,
        recipientType: recipientType,
        recipient: recipient,
        description: description
    };
    internalMessages.push(newFileShare);
    saveToLocalStorage();
    renderInternalMessages();
    document.getElementById('file-sharing-modal').style.display = 'none';
    displayMessage('Files shared successfully!');
});


const hrFeedbackForm = document.getElementById('hr-feedback-form');
hrFeedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const employeeId = document.getElementById('hr-feedback-employee-id').value.trim();
    const feedbackType = document.getElementById('hr-feedback-type').value;
    const message = document.getElementById('hr-feedback-message').value.trim();

    const employeeIdPattern = /^[A-Za-z0-9]{5}$/;
    if (!employeeIdPattern.test(employeeId)) {
        displayMessage('Employee ID must be 5 alphanumeric characters.', 'error');
        return;
    }
    if (!employees.some(emp => emp.employeeId === employeeId)) {
        displayMessage('Your Employee ID is not registered.', 'error');
        return;
    }
    if (feedbackType.length === 0) {
        displayMessage('Please select a type of request/feedback.', 'error');
        return;
    }
    if (message.length === 0) {
        displayMessage('Message/Details cannot be empty.', 'error');
        return;
    }

    const newFeedback = {
        type: 'HR Feedback',
        timestamp: new Date().toLocaleString(),
        employeeId: employeeId,
        feedbackType: feedbackType,
        content: message,
        status: 'Pending' // Initial status
    };
    internalMessages.push(newFeedback);
    saveToLocalStorage();
    renderInternalMessages();
    document.getElementById('hr-feedback-modal').style.display = 'none';
    displayMessage('HR feedback submitted successfully! HR will review it shortly.', 'success');
});


function renderInternalMessages() {
    const messageList = document.getElementById('internal-message-list');
    messageList.innerHTML = ''; // Clear existing messages

    if (internalMessages.length === 0) {
        messageList.innerHTML = '<li class="no-data">No communication logs found.</li>';
        return;
    }

    // Sort messages by timestamp, newest first
    const sortedMessages = [...internalMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    sortedMessages.forEach(msg => {
        const listItem = document.createElement('li');
        listItem.classList.add('message-item');

        let messageHtml = `
            <div class="message-header">
                <span class="message-type">${msg.type}</span>
                <span class="message-timestamp">${msg.timestamp}</span>
            </div>
            <div class="message-body">
        `;

        if (msg.type === 'Team Message') {
            const employee = employees.find(emp => emp.employeeId === msg.recipient);
            const recipientName = employee ? employee.name : msg.recipient;
            messageHtml += `<p><strong>To:</strong> ${msg.recipientType === 'individual' ? recipientName : msg.recipient} (${msg.recipientType})</p>`;
            messageHtml += `<p>${msg.content}</p>`;
        } else if (msg.type === 'Broadcast Announcement') {
            messageHtml += `<p><strong>Title:</strong> ${msg.title}</p>`;
            messageHtml += `<p>${msg.content}</p>`;
        } else if (msg.type === 'File Share') {
            messageHtml += `<p><strong>Files:</strong> ${msg.files}</p>`;
            messageHtml += `<p><strong>Shared With:</strong> ${msg.recipientType === 'individual' ? employees.find(emp => emp.employeeId === msg.recipient)?.name || msg.recipient : msg.recipient}</p>`;
            if (msg.description) {
                messageHtml += `<p><strong>Description:</strong> ${msg.description}</p>`;
            }
        } else if (msg.type === 'HR Feedback') {
            const employee = employees.find(emp => emp.employeeId === msg.employeeId);
            const employeeName = employee ? employee.name : msg.employeeId;
            messageHtml += `<p><strong>From:</strong> ${employeeName} (ID: ${msg.employeeId})</p>`;
            messageHtml += `<p><strong>Type:</strong> ${msg.feedbackType}</p>`;
            messageHtml += `<p>${msg.content}</p>`;
            messageHtml += `<p><strong>Status:</strong> <span class="feedback-status feedback-status-${msg.status.toLowerCase().replace(' ', '-')}">${msg.status}</span></p>`;
        }

        messageHtml += `</div>`;
        listItem.innerHTML = messageHtml;
        messageList.appendChild(listItem);
    });
}


// --- Table Filtering and Sorting Logic (General) ---
document.querySelectorAll('.data-table thead th.filterable').forEach(header => {
    header.addEventListener('click', (e) => {
        const table = header.closest('table');
        const columnIndex = Array.from(header.parentNode.children).indexOf(header);
        sortTable(table.id, columnIndex, header);
    });
});

document.querySelectorAll('.data-table thead th.filterable').forEach(header => {
    header.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Prevent default right-click menu
        const filterRow = header.closest('thead').querySelector('.filter-row');
        filterRow.classList.toggle('hidden');
    });
});

document.querySelectorAll('.filter-input').forEach(input => {
    input.addEventListener('input', (e) => {
        const table = e.target.closest('table');
        applyFilters(table.id);
    });
});

function applyFilters(tableId) {
    const table = document.getElementById(tableId);
    const filterInputs = table.querySelectorAll('.filter-input');
    const filters = {};

    filterInputs.forEach(input => {
        const column = input.dataset.column;
        const value = input.value.trim().toLowerCase();
        if (value) {
            filters[column] = value;
        }
    });

    let filteredData = [];
    if (tableId === 'employee-table') {
        filteredData = employees.filter(row => {
            return Object.keys(filters).every(key => {
                const rowValue = String(row[key]).toLowerCase();
                return rowValue.includes(filters[key]);
            });
        });
        renderEmployeeTable(filteredData);
    } else if (tableId === 'activity-log-table') {
        filteredData = activityLogs.filter(row => {
            return Object.keys(filters).every(key => {
                let rowValue = String(row[key]).toLowerCase();
                if (key === 'logDate') {
                    rowValue = new Date(row[key]).toISOString().split('T')[0]; // Compare date strings directly from input
                    return rowValue.includes(filters[key]);
                }
                return rowValue.includes(filters[key]);
            });
        });
        renderActivityLogTable(filteredData);
    } else if (tableId === 'kpi-table') {
        filteredData = kpis.filter(row => {
            return Object.keys(filters).every(key => {
                const rowValue = String(row[key]).toLowerCase();
                return rowValue.includes(filters[key]);
            });
        });
        renderKpiTable(filteredData);
    }
}


function sortTable(tableId, columnIndex, header) {
    const table = document.getElementById(tableId);
    const tableBody = table.querySelector('tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr:not(.no-data)')); // Exclude "no data" row

    // Determine data type for correct comparison
    const dataType = header.dataset.type;
    const isAsc = header.classList.contains('asc');

    // Remove existing sort indicators
    header.closest('thead').querySelectorAll('.arrow').forEach(arrow => {
        arrow.textContent = '▼';
        arrow.style.transform = 'rotate(0deg)';
    });
    header.closest('thead').querySelectorAll('th').forEach(th => {
        th.classList.remove('asc', 'desc');
    });

    // Sort rows
    rows.sort((rowA, rowB) => {
        let cellA = rowA.cells[columnIndex].textContent.trim();
        let cellB = rowB.cells[columnIndex].textContent.trim();

        if (dataType === 'number') {
            cellA = parseFloat(cellA);
            cellB = parseFloat(cellB);
        } else if (dataType === 'date') {
            cellA = new Date(cellA);
            cellB = new Date(cellB);
        } else if (dataType === 'text') {
            // No conversion needed, just compare strings
        }

        if (cellA < cellB) {
            return isAsc ? -1 : 1;
        }
        if (cellA > cellB) {
            return isAsc ? 1 : -1;
        }
        return 0;
    });

    // Append sorted rows back to the table body
    rows.forEach(row => tableBody.appendChild(row));

    // Update sort indicator
    header.classList.toggle('asc', !isAsc);
    header.classList.toggle('desc', isAsc);
    const arrow = header.querySelector('.arrow');
    if (arrow) {
        arrow.textContent = '▲';
        arrow.style.transform = isAsc ? 'rotate(180deg)' : 'rotate(0deg)';
    } else {
        // If no arrow icon, just show/hide filter row
    }
}

// Initial renders on page load
document.addEventListener('DOMContentLoaded', () => {
    renderEmployeeTable();
    renderActivityLogTable();
    renderKpiTable();
    renderInternalMessages(); // Ensure messages are loaded on startup
    updateCrmUsageChart();
    updatePerformanceLeaderboardChart();
});