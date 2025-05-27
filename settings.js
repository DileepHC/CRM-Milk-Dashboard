document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Element References ---
    const navButtons = document.querySelectorAll('.qc-navigation .nav-button');
    const sections = document.querySelectorAll('.content > section');

    // Modals
    const addUserModal = document.getElementById('add-user-modal');
    const manageRolesModal = document.getElementById('manage-roles-modal');
    const addNotificationRuleModal = document.getElementById('add-notification-rule-modal');
    const reminderRulesModal = document.getElementById('reminder-rules-modal');
    const customFieldsModal = document.getElementById('custom-fields-modal');
    const workflowAutomationModal = document.getElementById('workflow-automation-modal');
    const formBuilderModal = document.getElementById('form-builder-modal');
    const brandingOptionsModal = document.getElementById('branding-options-modal');
    const backupSchedulerModal = document.getElementById('backup-scheduler-modal');
    const importToolsModal = document.getElementById('import-tools-modal');
    const exportToolsModal = document.getElementById('export-tools-modal');
    const restoreManagerModal = document.getElementById('restore-manager-modal');
    const encryptionSettingsModal = document.getElementById('encryption-settings-modal');
    const externalSystemLinkingModal = document.getElementById('external-system-linking-modal');
    const apiManagementModal = document.getElementById('api-management-modal');
    const webhookConfigModal = document.getElementById('webhook-config-modal');
    const smartMappingEngineModal = document.getElementById('smart-mapping-engine-modal');
    const multiLocationConfigModal = document.getElementById('multi-location-config-modal');
    const autoSyncControlsModal = document.getElementById('auto-sync-controls-modal');
    const systemHealthMonitorModal = document.getElementById('system-health-monitor-modal');
    const alertConsoleModal = document.getElementById('alert-console-modal');
    const betaTestEnvironmentModal = document.getElementById('beta-test-environment-modal');


    // Table Bodies
    const userTableBody = document.getElementById("user-table-body");
    const notificationRulesTableBody = document.getElementById("notification-rules-table-body");
    const integrationStatusTableBody = document.getElementById("integration-status-table-body");
    const auditTrailTableBody = document.getElementById("audit-trail-table-body");
    const activeSessionsList = document.getElementById("active-sessions-list"); // For Session Monitoring
    const alertLogList = document.getElementById("alert-log-list"); // For Alert Console

    // Forms
    const addUserForm = document.getElementById("add-user-form");
    const addNotificationRuleForm = document.getElementById("add-notification-rule-form"); // Assuming this will be added to HTML for notification rules
    const brandingOptionsForm = brandingOptionsModal ? brandingOptionsModal.querySelector('form') : null; // Form inside branding modal
    const backupSchedulerForm = backupSchedulerModal ? backupSchedulerModal.querySelector('form') : null; // Form inside backup modal
    const betaTestEnvironmentForm = betaTestEnvironmentModal ? betaTestEnvironmentModal.querySelector('form') : null; // Form inside beta test modal


    // --- Data Storage Variables (Initialize from localStorage if available) ---
    let users = JSON.parse(localStorage.getItem("users")) || [
        { userId: 'USR001', name: 'Alice Johnson', email: 'alice.j@example.com', department: 'Sales', designation: 'Manager', role: 'Admin', status: 'Active', twoFAEnabled: true },
        { userId: 'USR002', name: 'Bob Williams', email: 'bob.w@example.com', department: 'Marketing', designation: 'Executive', role: 'Staff', status: 'Active', twoFAEnabled: false },
        { userId: 'USR003', name: 'Charlie Brown', email: 'charlie.b@example.com', department: 'HR', designation: 'Specialist', role: 'Staff', status: 'Inactive', twoFAEnabled: true }
    ];
    let notificationRules = JSON.parse(localStorage.getItem("notificationRules")) || [
        { ruleName: 'New Lead Alert', triggerEvent: 'New Lead Created', channel: 'Email', recipient: 'All Managers', priority: 'High' },
        { ruleName: 'Payment Due Reminder', triggerEvent: 'Invoice Due Date', channel: 'SMS', recipient: 'Field Agent', priority: 'Medium' }
    ];
    let integrationStatus = JSON.parse(localStorage.getItem("integrationStatus")) || [
        { integrationName: 'QuickBooks Sync', status: 'Active', lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), dataFlow: 'Bi-directional' },
        { integrationName: 'SMS Gateway', status: 'Active', lastSync: new Date(Date.now() - 1000 * 60 * 30).toISOString(), dataFlow: 'Outbound' },
        { integrationName: 'Zoho CRM', status: 'Inactive', lastSync: 'N/A', dataFlow: 'N/A' }
    ];
    let auditTrail = JSON.parse(localStorage.getItem("auditTrail")) || [
        { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), userName: 'Admin', action: 'Update', details: 'Updated user USR001 role to Admin' },
        { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), userName: 'Admin', action: 'Add', details: 'Added new notification rule: New Lead Alert' }
    ];
    let activeSessions = JSON.parse(localStorage.getItem("activeSessions")) || [ // Dummy active sessions
        { userId: 'USR001', name: 'Alice Johnson', loginTime: new Date(Date.now() - 3600000).toISOString(), device: 'Desktop (Chrome)', ipAddress: '192.168.1.100' },
        { userId: 'USR002', name: 'Bob Williams', loginTime: new Date(Date.now() - 1800000).toISOString(), device: 'Mobile (Safari)', ipAddress: '10.0.0.50' }
    ];
    let alertLogs = JSON.parse(localStorage.getItem("alertLogs")) || [ // Dummy alert logs
        { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), type: 'Error', message: 'Integration failed: QuickBooks API unreachable', severity: 'High' },
        { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), type: 'Warning', message: 'High CPU usage detected (95%)', severity: 'Medium' }
    ];

    // Edit/Add State Variables
    let editUserIndex = null;
    let editNotificationRuleIndex = null;
    let editIntegrationStatusIndex = null; // Assuming edit for integration status table


    // --- Utility Functions ---

    /**
     * Displays an error message for a given input element.
     * @param {HTMLElement} inputElement - The input element to display the error for.
     * @param {string} message - The error message to display.
     */
    function displayError(inputElement, message) {
        const errorDivId = `${inputElement.id}-error`;
        let errorDiv = document.getElementById(errorDivId);
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = errorDivId;
            errorDiv.className = 'error-message';
            inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
        }
        errorDiv.textContent = message;
    }

    /**
     * Clears the error message for a given input element.
     * @param {HTMLElement} inputElement - The input element to clear the error for.
     */
    function clearError(inputElement) {
        const errorDivId = `${inputElement.id}-error`;
        const errorDiv = document.getElementById(errorDivId);
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }

    /**
     * Clears all error messages within a given form element.
     * @param {HTMLElement} formElement - The form element to clear errors from.
     */
    function clearAllErrors(formElement) {
        const errorMessages = formElement.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
    }

    /**
     * Formats a date string from ISO format to DD-MM-YYYY.
     * @param {string} dateString - The date string in ISO format.
     * @returns {string} The formatted date string.
     */
    function formatDate(dateString) {
        if (!dateString || dateString === 'N/A') return "N/A";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    /**
     * Sets up inline filtering for a given table.
     * @param {HTMLElement} tableElement - The table element to apply filters to.
     * @param {Function} applyFilterFunction - The function to call to apply the filter.
     */
    function setupInlineFilters(tableElement, applyFilterFunction) {
        const headers = tableElement.querySelectorAll("thead th.filterable");
        headers.forEach(header => {
            // Remove existing click listener to prevent duplicates
            header.removeEventListener("click", toggleFilterRowVisibility);
            header.addEventListener("click", toggleFilterRowVisibility);
        });

        function toggleFilterRowVisibility() {
            const filterRow = this.closest('thead').querySelector('.filter-row');
            if (filterRow) {
                filterRow.classList.toggle('hidden');
                // Clear all filter values when showing/hiding the filter row
                const filterInputs = filterRow.querySelectorAll('.filter-input');
                filterInputs.forEach(input => {
                    input.value = '';
                    input.dispatchEvent(new Event('input')); // Trigger filter reset
                });
            }
        }

        const filterInputs = tableElement.querySelectorAll('thead .filter-row .filter-input');
        filterInputs.forEach(input => {
            // Remove existing input listener to prevent duplicates
            input.removeEventListener('input', applyFilterFunction);
            input.addEventListener('input', applyFilterFunction);
        });
    }

    /**
     * Displays a custom message modal instead of alert().
     * @param {string} message - The message to display.
     * @param {string} title - The title of the modal (optional).
     */
    function showMessageModal(message, title = 'Notification') {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h4>${title}</h4>
                <p>${message}</p>
                <div class="form-actions">
                    <button class="action-button close-message-modal">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        const closeButton = modal.querySelector('.close-button');
        const okButton = modal.querySelector('.close-message-modal');

        const closeHandler = () => {
            document.body.removeChild(modal);
        };

        closeButton.addEventListener('click', closeHandler);
        okButton.addEventListener('click', closeHandler);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeHandler();
            }
        });
    }

    /**
     * Displays a custom confirmation modal instead of confirm().
     * @param {string} message - The confirmation message.
     * @param {Function} onConfirm - Callback function if confirmed.
     * @param {string} title - The title of the modal (optional).
     */
    function showConfirmationModal(message, onConfirm, title = 'Confirm Action') {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h4>${title}</h4>
                <p>${message}</p>
                <div class="form-actions">
                    <button class="action-button confirm-button">Yes</button>
                    <button class="action-button cancel-button">No</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        const closeButton = modal.querySelector('.close-button');
        const confirmButton = modal.querySelector('.confirm-button');
        const cancelButton = modal.querySelector('.cancel-button');

        const closeHandler = () => {
            document.body.removeChild(modal);
        };

        closeButton.addEventListener('click', closeHandler);
        cancelButton.addEventListener('click', closeHandler);
        confirmButton.addEventListener('click', () => {
            onConfirm();
            closeHandler();
        });
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeHandler();
            }
        });
    }

    /**
     * Adds an entry to the audit trail.
     * @param {string} action - The action performed (e.g., 'Add', 'Update', 'Delete').
     * @param {string} details - Details about the action.
     * @param {string} userName - The user who performed the action (placeholder for now).
     */
    function addAuditLog(action, details, userName = 'Admin') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            userName: userName,
            action: action,
            details: details
        };
        auditTrail.push(logEntry);
        localStorage.setItem('auditTrail', JSON.stringify(auditTrail));
        renderAuditTrailTable(); // Re-render audit trail table
    }

    /**
     * Generic function to open a modal.
     * @param {HTMLElement} modalElement - The modal element to open.
     * @param {HTMLElement} formElement - The form element inside the modal (optional).
     * @param {Function} setupFunction - A function to call for specific modal setup (e.g., populating dropdowns).
     */
    function openModal(modalElement, formElement = null, setupFunction = null) {
        if (modalElement) {
            modalElement.style.display = "block";
            if (formElement) {
                formElement.reset();
                clearAllErrors(formElement);
            }
            if (setupFunction) {
                setupFunction();
            }
        } else {
            // Fallback for modals not explicitly defined in HTML but called
            showMessageModal('This feature is a placeholder and would open a dedicated modal for configuration.', 'Feature Placeholder');
        }
    }

    /**
     * Generic function to close a modal.
     * @param {HTMLElement} modalElement - The modal element to close.
     */
    function closeModal(modalElement) {
        if (modalElement) {
            modalElement.style.display = "none";
        }
    }

    // --- Navigation Logic ---
    function hideAllSections() {
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
    }

    function showSection(id) {
        const sectionToShow = document.getElementById(id);
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
            sectionToShow.classList.add('active');
            // Re-render tables/lists when their section becomes active
            if (id === 'user-role-management-section') {
                renderUserTable();
                renderActiveSessions();
            } else if (id === 'notification-settings-section') {
                renderNotificationRulesTable();
            } else if (id === 'data-management-security-section') {
                renderAuditTrailTable();
            } else if (id === 'integrations-hub-section') {
                renderIntegrationStatusTable();
            } else if (id === 'global-admin-features-section') {
                // Update system health monitor and alert console when this section is active
                updateSystemHealthMonitor();
                renderAlertConsole();
            }
        }
    }

    navButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetSectionId = this.getAttribute('data-section');
            hideAllSections();
            showSection(targetSectionId);
            this.classList.add('active');
        });
    });

    // --- Modals Close Event Listeners (Generic) ---
    document.querySelectorAll('.modal .close-button').forEach(button => {
        button.addEventListener('click', function () {
            closeModal(this.closest('.modal'));
        });
    });

    window.addEventListener('click', function (event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    // --- User & Role Management Section Logic ---

    /**
     * Generates a simple unique user ID.
     * @returns {string} A unique user ID.
     */
    function generateUserId() {
        return 'USR' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    /**
     * Renders the user table with data from the users array.
     */
    function renderUserTable() {
        if (!userTableBody) return;
        userTableBody.innerHTML = "";
        users.forEach((user, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.userId}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.department || 'N/A'}</td>
                <td>${user.designation || 'N/A'}</td>
                <td>${user.role}</td>
                <td>${user.status}</td>
                <td>${user.twoFAEnabled ? 'Yes' : 'No'}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                    <button class="action-button reset-password-button" data-index="${index}"><span class="material-symbols-outlined">vpn_key</span></button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
        const userTable = document.getElementById('user-table');
        if (userTable) {
            setupInlineFilters(userTable, applyUserFilter);
        }
    }

    /**
     * Applies filter to the user table.
     * Filters rows based on all active filter inputs (AND logic).
     */
    function applyUserFilter() {
        const rows = userTableBody.querySelectorAll("tr");
        const filterInputs = document.getElementById('user-table').querySelectorAll('thead .filter-row .filter-input');

        rows.forEach(row => {
            let matchesAllFilters = true;
            filterInputs.forEach(input => {
                const colIndex = parseInt(input.closest('td').dataset.colIndex); // Get column index from data attribute
                const cellText = row.children[colIndex].textContent.toLowerCase();
                const filterValue = input.value.trim().toLowerCase();
                const dataType = input.closest('th').dataset.type; // Get data type from header

                if (filterValue) {
                    if (dataType === 'boolean') {
                        const boolValue = filterValue === 'true' ? 'yes' : 'no';
                        if (cellText !== boolValue) {
                            matchesAllFilters = false;
                        }
                    } else if (!cellText.includes(filterValue)) {
                        matchesAllFilters = false;
                    }
                }
            });
            row.style.display = matchesAllFilters ? "" : "none";
        });
    }

    // Set data-col-index for filter inputs on load
    const userTableHeaders = document.getElementById('user-table')?.querySelectorAll('thead th');
    if (userTableHeaders) {
        userTableHeaders.forEach((header, index) => {
            header.dataset.colIndex = index;
            const filterInput = header.closest('thead').querySelector(`.filter-row td:nth-child(${index + 1}) .filter-input`);
            if (filterInput) {
                filterInput.closest('td').dataset.colIndex = index;
            }
        });
    }

    // Event listener for user table actions (edit/delete/reset password)
    if (userTableBody) {
        userTableBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editUser(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteUser(index);
            } else if (e.target.closest('.reset-password-button')) {
                const index = parseInt(e.target.closest('.reset-password-button').getAttribute('data-index'));
                resetUserPassword(index);
            }
        });
    }

    /**
     * Renders the active sessions list.
     */
    function renderActiveSessions() {
        if (!activeSessionsList) return;
        activeSessionsList.innerHTML = "";
        if (activeSessions.length === 0) {
            activeSessionsList.innerHTML = '<li class="text-gray-500">No active sessions.</li>';
            return;
        }
        activeSessions.forEach(session => {
            const listItem = document.createElement('li');
            listItem.className = 'flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0';
            listItem.innerHTML = `
                <div>
                    <strong>${session.name}</strong> (${session.userId}) <br>
                    <span class="text-sm text-gray-600">Logged in since ${new Date(session.loginTime).toLocaleString()} from ${session.device} (${session.ipAddress})</span>
                </div>
                <button class="action-button terminate-session-button" data-user-id="${session.userId}">
                    <span class="material-symbols-outlined text-sm">logout</span> Terminate
                </button>
            `;
            activeSessionsList.appendChild(listItem);
        });

        // Add event listeners for terminate buttons
        activeSessionsList.querySelectorAll('.terminate-session-button').forEach(button => {
            button.addEventListener('click', function() {
                const userIdToTerminate = this.getAttribute('data-user-id');
                terminateSession(userIdToTerminate);
            });
        });
    }

    /**
     * Terminates a user session (placeholder).
     * @param {string} userId - The ID of the user whose session to terminate.
     */
    function terminateSession(userId) {
        showConfirmationModal(`Are you sure you want to terminate the session for User ID: ${userId}?`, () => {
            activeSessions = activeSessions.filter(session => session.userId !== userId);
            localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
            renderActiveSessions();
            showMessageModal(`Session for User ID: ${userId} terminated.`, 'Session Terminated');
            addAuditLog('Terminate Session', `Terminated session for User ID: ${userId}`);
        });
    }

    /**
     * Opens the Add User modal.
     */
    window.openAddUserModal = function () {
        editUserIndex = null; // Ensure we are in "add" mode
        openModal(addUserModal, addUserForm, () => {
            // Reset password field for new user
            document.getElementById("user-password").value = '';
            document.getElementById("user-password").setAttribute('placeholder', 'Enter Password');
            document.getElementById("user-password").setAttribute('required', 'required');
            document.getElementById("user-password").setAttribute('minlength', '8');
        });
    };

    /**
     * Closes the Add User modal.
     */
    window.closeAddUserModal = function () {
        closeModal(addUserModal);
        addUserForm.reset();
        clearAllErrors(addUserForm);
        editUserIndex = null;
    };

    /**
     * Populates the Add User modal with data for editing.
     * @param {number} index - The index of the user to edit.
     */
    function editUser(index) {
        const user = users[index];
        document.getElementById("user-name").value = user.name;
        document.getElementById("user-email").value = user.email;
        document.getElementById("user-department").value = user.department;
        document.getElementById("user-designation").value = user.designation;
        document.getElementById("user-role").value = user.role;
        document.getElementById("user-2fa").checked = user.twoFAEnabled;
        // Password field is not pre-filled for security, user can set new password
        document.getElementById("user-password").value = '';
        document.getElementById("user-password").setAttribute('placeholder', 'Leave blank to keep current password');
        document.getElementById("user-password").removeAttribute('required'); // Password is not required for edit
        document.getElementById("user-password").removeAttribute('minlength'); // No minlength if not required
        editUserIndex = index;
        openAddUserModal();
    }

    /**
     * Deletes a user record.
     * @param {number} index - The index of the user to delete.
     */
    function deleteUser(index) {
        showConfirmationModal("Are you sure you want to delete this user?", () => {
            const deletedUser = users[index];
            users.splice(index, 1);
            localStorage.setItem("users", JSON.stringify(users));
            renderUserTable();
            addAuditLog('Delete', `User deleted: ${deletedUser?.name || 'N/A'} (${deletedUser?.userId || 'N/A'})`);
        });
    }

    /**
     * Resets a user's password (placeholder).
     * @param {number} index - The index of the user.
     */
    function resetUserPassword(index) {
        const user = users[index];
        showConfirmationModal(`Are you sure you want to reset the password for ${user.name} (${user.email})?`, () => {
            showMessageModal(`Password reset initiated for ${user.name}. An email with instructions would be sent.`, 'Password Reset');
            addAuditLog('Password Reset', `Password reset initiated for user: ${user.name} (${user.userId})`);
        });
    }

    // Add User Form Validation and Submission
    if (addUserForm) {
        addUserForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.validity.valueMissing) {
                displayError(target, 'This field is required.');
            } else if (target.type === 'email' && !target.validity.valid) {
                displayError(target, 'Please enter a valid email address.');
            } else if (target.id === 'user-name' && target.validity.patternMismatch) {
                displayError(target, target.title);
            } else if (target.id === 'user-password' && target.hasAttribute('required') && target.value.length < 8) {
                displayError(target, target.title);
            } else {
                clearError(target);
            }
        });

        addUserForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const inputs = addUserForm.querySelectorAll('input:not([type="checkbox"]), select');
            inputs.forEach(input => {
                // Manually trigger input event for validation
                input.dispatchEvent(new Event('input'));
                if (document.getElementById(`${input.id}-error`)?.textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const newUserData = {
                    userId: editUserIndex !== null ? users[editUserIndex].userId : generateUserId(),
                    name: document.getElementById("user-name").value.trim(),
                    email: document.getElementById("user-email").value.trim(),
                    department: document.getElementById("user-department").value.trim(),
                    designation: document.getElementById("user-designation").value.trim(),
                    role: document.getElementById("user-role").value,
                    status: editUserIndex !== null ? users[editUserIndex].status : 'Active', // Default status for new users
                    twoFAEnabled: document.getElementById("user-2fa").checked,
                    // Password is not stored directly in localStorage for security reasons.
                    // In a real app, this would be hashed and sent to a backend.
                    // For this demo, we'll just acknowledge it.
                };

                if (editUserIndex !== null) {
                    users[editUserIndex] = newUserData;
                    addAuditLog('Update', `User updated: ${newUserData.name} (${newUserData.userId})`);
                } else {
                    users.push(newUserData);
                    addAuditLog('Add', `New user created: ${newUserData.name} (${newUserData.userId})`);
                }
                localStorage.setItem('users', JSON.stringify(users));
                renderUserTable();
                closeAddUserModal();
                showMessageModal('User account saved successfully!', 'Success');
            } else {
                showMessageModal('Please correct the errors in the form.', 'Error');
            }
        });
    }

    /**
     * Opens the Manage Roles modal.
     */
    window.openManageRolesModal = function () {
        openModal(manageRolesModal);
        // No form to reset, just show content
        addAuditLog('Open Settings', 'Opened Manage Roles settings');
    };

    /**
     * Closes the Manage Roles modal.
     */
    window.closeManageRolesModal = function () {
        closeModal(manageRolesModal);
    };


    // --- System Configuration Section Logic ---

    /**
     * Opens the Custom Fields & Layouts modal.
     */
    window.openCustomFieldsModal = function () {
        openModal(customFieldsModal);
        showMessageModal('This section allows you to add, edit, or reorder custom fields for specific modules and customize layouts.', 'Custom Fields & Layouts');
        addAuditLog('Open Settings', 'Opened Custom Fields & Layouts settings');
    };

    /**
     * Closes the Custom Fields & Layouts modal.
     */
    window.closeCustomFieldsModal = function () {
        closeModal(customFieldsModal);
    };

    /**
     * Opens the Workflow Automation modal.
     */
    window.openWorkflowAutomationModal = function () {
        openModal(workflowAutomationModal);
        showMessageModal('Here you can set up automated triggers and actions for various CRM events.', 'Workflow Automation');
        addAuditLog('Open Settings', 'Opened Workflow Automation settings');
    };

    /**
     * Closes the Workflow Automation modal.
     */
    window.closeWorkflowAutomationModal = function () {
        closeModal(workflowAutomationModal);
    };

    /**
     * Opens the Form Builders modal.
     */
    window.openFormBuilderModal = function () {
        openModal(formBuilderModal);
        showMessageModal('Customize the layout and fields of data entry forms across the CRM using a drag-and-drop interface.', 'Form Builders');
        addAuditLog('Open Settings', 'Opened Form Builders settings');
    };

    /**
     * Closes the Form Builders modal.
     */
    window.closeFormBuilderModal = function () {
        closeModal(formBuilderModal);
    };

    /**
     * Opens the Branding Options modal.
     */
    window.openBrandingOptionsModal = function () {
        openModal(brandingOptionsModal, brandingOptionsForm, () => {
            // Placeholder for loading existing branding settings if any
            // For now, just set default color
            document.getElementById('primary-color').value = '#4CAF50';
        });
        addAuditLog('Open Settings', 'Opened Branding Options settings');
    };

    /**
     * Closes the Branding Options modal.
     */
    window.closeBrandingOptionsModal = function () {
        closeModal(brandingOptionsModal);
        if (brandingOptionsForm) {
            brandingOptionsForm.reset();
            clearAllErrors(brandingOptionsForm);
        }
    };

    // Branding Options Form Submission (placeholder for now)
    if (brandingOptionsForm) {
        brandingOptionsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // In a real app, you would handle file upload (logo) and save color settings
            showMessageModal('Branding options saved (placeholder functionality).', 'Branding Saved');
            addAuditLog('Update Settings', 'Saved Branding Options');
            closeBrandingOptionsModal();
        });
    }

    // UI Language Toggle (simple handler)
    const uiLanguageToggle = document.getElementById('ui-language-toggle');
    if (uiLanguageToggle) {
        uiLanguageToggle.addEventListener('change', function () {
            showMessageModal(`UI Language set to: ${this.options[this.selectedIndex].text} (feature not fully implemented).`, 'Language Change');
            addAuditLog('Update Settings', `Changed UI Language to: ${this.value}`);
        });
    }

    // --- Notification Settings Section Logic ---

    /**
     * Renders the notification rules table.
     */
    function renderNotificationRulesTable() {
        if (!notificationRulesTableBody) return;
        notificationRulesTableBody.innerHTML = "";
        notificationRules.forEach((rule, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${rule.ruleName}</td>
                <td>${rule.triggerEvent}</td>
                <td>${rule.channel}</td>
                <td>${rule.recipient}</td>
                <td>${rule.priority}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            notificationRulesTableBody.appendChild(row);
        });
        const notificationRulesTable = document.getElementById('notification-rules-table');
        if (notificationRulesTable) {
            setupInlineFilters(notificationRulesTable, applyNotificationRuleFilter);
        }
    }

    /**
     * Applies filter to the notification rules table.
     * Filters rows based on all active filter inputs (AND logic).
     */
    function applyNotificationRuleFilter() {
        const rows = notificationRulesTableBody.querySelectorAll("tr");
        const filterInputs = document.getElementById('notification-rules-table').querySelectorAll('thead .filter-row .filter-input');

        rows.forEach(row => {
            let matchesAllFilters = true;
            filterInputs.forEach(input => {
                const colIndex = parseInt(input.closest('td').dataset.colIndex);
                const cellText = row.children[colIndex].textContent.toLowerCase();
                const filterValue = input.value.trim().toLowerCase();

                if (filterValue && !cellText.includes(filterValue)) {
                    matchesAllFilters = false;
                }
            });
            row.style.display = matchesAllFilters ? "" : "none";
        });
    }

    // Set data-col-index for filter inputs on load for notification rules
    const notificationRulesTableHeaders = document.getElementById('notification-rules-table')?.querySelectorAll('thead th');
    if (notificationRulesTableHeaders) {
        notificationRulesTableHeaders.forEach((header, index) => {
            header.dataset.colIndex = index;
            const filterInput = header.closest('thead').querySelector(`.filter-row td:nth-child(${index + 1}) .filter-input`);
            if (filterInput) {
                filterInput.closest('td').dataset.colIndex = index;
            }
        });
    }

    // Event listener for notification rules table actions (edit/delete)
    if (notificationRulesTableBody) {
        notificationRulesTableBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editNotificationRule(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteNotificationRule(index);
            }
        });
    }

    /**
     * Opens the Add Notification Rule modal.
     */
    window.openAddNotificationRuleModal = function () {
        editNotificationRuleIndex = null; // Ensure we are in "add" mode
        openModal(addNotificationRuleModal, addNotificationRuleForm);
    };

    /**
     * Closes the Add Notification Rule modal.
     */
    window.closeAddNotificationRuleModal = function () {
        closeModal(addNotificationRuleModal);
        if (addNotificationRuleForm) {
            addNotificationRuleForm.reset();
            clearAllErrors(addNotificationRuleForm);
        }
        editNotificationRuleIndex = null;
    };

    /**
     * Populates the Add Notification Rule modal with data for editing.
     * @param {number} index - The index of the notification rule to edit.
     */
    function editNotificationRule(index) {
        const rule = notificationRules[index];
        document.getElementById("notification-rule-name").value = rule.ruleName;
        document.getElementById("notification-trigger-event").value = rule.triggerEvent;
        document.getElementById("notification-channel").value = rule.channel;
        document.getElementById("notification-recipient").value = rule.recipient;
        document.getElementById("notification-priority").value = rule.priority;
        editNotificationRuleIndex = index;
        openAddNotificationRuleModal();
    }

    /**
     * Deletes a notification rule.
     * @param {number} index - The index of the notification rule to delete.
     */
    function deleteNotificationRule(index) {
        showConfirmationModal("Are you sure you want to delete this notification rule?", () => {
            const deletedRule = notificationRules[index];
            notificationRules.splice(index, 1);
            localStorage.setItem("notificationRules", JSON.stringify(notificationRules));
            renderNotificationRulesTable();
            addAuditLog('Delete', `Notification Rule deleted: ${deletedRule?.ruleName || 'N/A'}`);
        });
    }

    // Add Notification Rule Form Validation and Submission
    if (addNotificationRuleForm) {
        addNotificationRuleForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.validity.valueMissing) {
                displayError(target, 'This field is required.');
            } else {
                clearError(target);
            }
        });

        addNotificationRuleForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const inputs = addNotificationRuleForm.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.dispatchEvent(new Event('input'));
                if (document.getElementById(`${input.id}-error`)?.textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const newRule = {
                    ruleName: document.getElementById("notification-rule-name").value.trim(),
                    triggerEvent: document.getElementById("notification-trigger-event").value.trim(),
                    channel: document.getElementById("notification-channel").value,
                    recipient: document.getElementById("notification-recipient").value.trim(),
                    priority: document.getElementById("notification-priority").value
                };

                if (editNotificationRuleIndex !== null) {
                    notificationRules[editNotificationRuleIndex] = newRule;
                    addAuditLog('Update', `Notification Rule updated: ${newRule.ruleName}`);
                } else {
                    notificationRules.push(newRule);
                    addAuditLog('Add', `New Notification Rule added: ${newRule.ruleName}`);
                }
                localStorage.setItem('notificationRules', JSON.stringify(notificationRules));
                renderNotificationRulesTable();
                closeAddNotificationRuleModal();
                showMessageModal('Notification rule saved successfully!', 'Success');
            } else {
                showMessageModal('Please correct the errors in the form.', 'Error');
            }
        });
    }

    /**
     * Opens the Reminder Rules modal.
     */
    window.openReminderRulesModal = function () {
        openModal(reminderRulesModal);
        showMessageModal('This section allows you to set up and manage recurring reminders for various operational events.', 'Reminder Rules');
        addAuditLog('Open Settings', 'Opened Reminder Rules settings');
    };

    /**
     * Closes the Reminder Rules modal.
     */
    window.closeReminderRulesModal = function () {
        closeModal(reminderRulesModal);
    };

    // --- Data Management & Security Section Logic ---

    /**
     * Opens the Backup Scheduler modal.
     */
    window.openBackupSchedulerModal = function () {
        openModal(backupSchedulerModal, backupSchedulerForm);
        addAuditLog('Open Settings', 'Opened Backup Scheduler settings');
    };

    /**
     * Closes the Backup Scheduler modal.
     */
    window.closeBackupSchedulerModal = function () {
        closeModal(backupSchedulerModal);
        if (backupSchedulerForm) {
            backupSchedulerForm.reset();
            clearAllErrors(backupSchedulerForm);
        }
    };

    // Backup Scheduler Form Submission (placeholder)
    if (backupSchedulerForm) {
        backupSchedulerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const frequency = document.getElementById('backup-frequency').value;
            const destination = document.getElementById('backup-destination').value;
            showMessageModal(`Backup schedule saved: Frequency - ${frequency}, Destination - ${destination} (placeholder functionality).`, 'Backup Scheduled');
            addAuditLog('Update Settings', `Configured backup schedule: ${frequency} to ${destination}`);
            closeBackupSchedulerModal();
        });
        // Add event listener for "Run Manual Backup" button
        const manualBackupButton = backupSchedulerForm.querySelector('button.action-button:nth-child(2)');
        if (manualBackupButton) {
            manualBackupButton.addEventListener('click', function() {
                showMessageModal('Manual backup initiated. This may take a few moments...', 'Manual Backup');
                addAuditLog('Action', 'Initiated manual data backup');
            });
        }
    }

    /**
     * Opens the Import Tools modal.
     */
    window.openImportToolsModal = function () {
        openModal(importToolsModal);
        showMessageModal('Bulk import data from CSV or Excel files with guided field mapping. (Functionality to be implemented)', 'Import Tools');
        addAuditLog('Open Tools', 'Opened Import Tools');
    };

    /**
     * Closes the Import Tools modal.
     */
    window.closeImportToolsModal = function () {
        closeModal(importToolsModal);
    };

    /**
     * Opens the Export Tools modal.
     */
    window.openExportToolsModal = function () {
        openModal(exportToolsModal);
        showMessageModal('Export filtered CRM data to various formats (Excel, PDF, JSON) for analysis or compliance. (Functionality to be implemented)', 'Export Tools');
        addAuditLog('Open Tools', 'Opened Export Tools');
    };

    /**
     * Closes the Export Tools modal.
     */
    window.closeExportToolsModal = function () {
        closeModal(exportToolsModal);
    };

    /**
     * Opens the Restore Manager modal.
     */
    window.openRestoreManagerModal = function () {
        openModal(restoreManagerModal);
        showMessageModal('Restore previous versions of data or the entire system state from backups. (Functionality to be implemented)', 'Restore Manager');
        addAuditLog('Open Tools', 'Opened Restore Manager');
    };

    /**
     * Closes the Restore Manager modal.
     */
    window.closeRestoreManagerModal = function () {
        closeModal(restoreManagerModal);
    };

    /**
     * Opens the Data Encryption Settings modal.
     */
    window.openEncryptionSettingsModal = function () {
        openModal(encryptionSettingsModal);
        showMessageModal('Manage encryption protocols for data in transit and at rest. All data is secured with industry-standard encryption.', 'Data Encryption Settings');
        addAuditLog('Open Settings', 'Opened Data Encryption Settings');
    };

    /**
     * Closes the Data Encryption Settings modal.
     */
    window.closeEncryptionSettingsModal = function () {
        closeModal(encryptionSettingsModal);
    };

    /**
     * Renders the audit trail table.
     */
    function renderAuditTrailTable() {
        if (!auditTrailTableBody) return;
        auditTrailTableBody.innerHTML = "";
        auditTrail.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first
        auditTrail.forEach(log => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${formatDate(log.timestamp.split('T')[0])} ${new Date(log.timestamp).toLocaleTimeString()}</td>
                <td>${log.userName}</td>
                <td>${log.action}</td>
                <td>${log.details}</td>
            `;
            auditTrailTableBody.appendChild(row);
        });
        const auditTrailTable = document.getElementById('audit-trail-table');
        if (auditTrailTable) {
            setupInlineFilters(auditTrailTable, applyAuditTrailFilter);
        }
    }

    /**
     * Applies filter to the audit trail table.
     * Filters rows based on all active filter inputs (AND logic).
     */
    function applyAuditTrailFilter() {
        const rows = auditTrailTableBody.querySelectorAll("tr");
        const filterInputs = document.getElementById('audit-trail-table').querySelectorAll('thead .filter-row .filter-input');

        rows.forEach(row => {
            let matchesAllFilters = true;
            filterInputs.forEach(input => {
                const colIndex = parseInt(input.closest('td').dataset.colIndex);
                const cellText = row.children[colIndex].textContent.toLowerCase();
                const filterValue = input.value.trim().toLowerCase();

                if (filterValue && !cellText.includes(filterValue)) {
                    matchesAllFilters = false;
                }
            });
            row.style.display = matchesAllFilters ? "" : "none";
        });
    }

    // Set data-col-index for filter inputs on load for audit trail
    const auditTrailTableHeaders = document.getElementById('audit-trail-table')?.querySelectorAll('thead th');
    if (auditTrailTableHeaders) {
        auditTrailTableHeaders.forEach((header, index) => {
            header.dataset.colIndex = index;
            const filterInput = header.closest('thead').querySelector(`.filter-row td:nth-child(${index + 1}) .filter-input`);
            if (filterInput) {
                filterInput.closest('td').dataset.colIndex = index;
            }
        });
    }

    // --- Integrations Hub Section Logic ---

    /**
     * Opens the External System Linking modal.
     */
    window.openExternalSystemLinkingModal = function () {
        openModal(externalSystemLinkingModal);
        showMessageModal('Connect with third-party systems like POS, accounting software, SMS gateways. (Functionality to be implemented)', 'External System Linking');
        addAuditLog('Open Integrations', 'Opened External System Linking');
    };

    /**
     * Closes the External System Linking modal.
     */
    window.closeExternalSystemLinkingModal = function () {
        closeModal(externalSystemLinkingModal);
    };

    /**
     * Opens the API Management modal.
     */
    window.openApiManagementModal = function () {
        openModal(apiManagementModal);
        showMessageModal('Generate and manage API keys for secure programmatic access to CRM data. (Functionality to be implemented)', 'API Management');
        addAuditLog('Open Integrations', 'Opened API Management');
    };

    /**
     * Closes the API Management modal.
     */
    window.closeApiManagementModal = function () {
        closeModal(apiManagementModal);
    };

    /**
     * Opens the Webhook Configuration modal.
     */
    window.openWebhookConfigModal = function () {
        openModal(webhookConfigModal);
        showMessageModal('Set up webhooks for real-time data pushes to external systems based on CRM events. (Functionality to be implemented)', 'Webhook Configuration');
        addAuditLog('Open Integrations', 'Opened Webhook Configuration');
    };

    /**
     * Closes the Webhook Configuration modal.
     */
    window.closeWebhookConfigModal = function () {
        closeModal(webhookConfigModal);
    };

    /**
     * Opens the Smart Mapping Engine modal.
     */
    window.openSmartMappingEngineModal = function () {
        openModal(smartMappingEngineModal);
        showMessageModal('Map CRM fields to external system fields dynamically for seamless data exchange. (Functionality to be implemented)', 'Smart Mapping Engine');
        addAuditLog('Open Integrations', 'Opened Smart Mapping Engine');
    };

    /**
     * Closes the Smart Mapping Engine modal.
     */
    window.closeSmartMappingEngineModal = function () {
        closeModal(smartMappingEngineModal);
    };

    /**
     * Renders the integration status table.
     */
    function renderIntegrationStatusTable() {
        if (!integrationStatusTableBody) return;
        integrationStatusTableBody.innerHTML = "";
        integrationStatus.forEach((integration, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${integration.integrationName}</td>
                <td>${integration.status}</td>
                <td>${formatDate(integration.lastSync)} ${integration.lastSync !== 'N/A' ? new Date(integration.lastSync).toLocaleTimeString() : ''}</td>
                <td>${integration.dataFlow}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            integrationStatusTableBody.appendChild(row);
        });
        const integrationStatusTable = document.getElementById('integration-status-table');
        if (integrationStatusTable) {
            setupInlineFilters(integrationStatusTable, applyIntegrationStatusFilter);
        }
    }

    /**
     * Applies filter to the integration status table.
     * Filters rows based on all active filter inputs (AND logic).
     */
    function applyIntegrationStatusFilter() {
        const rows = integrationStatusTableBody.querySelectorAll("tr");
        const filterInputs = document.getElementById('integration-status-table').querySelectorAll('thead .filter-row .filter-input');

        rows.forEach(row => {
            let matchesAllFilters = true;
            filterInputs.forEach(input => {
                const colIndex = parseInt(input.closest('td').dataset.colIndex);
                const cellText = row.children[colIndex].textContent.toLowerCase();
                const filterValue = input.value.trim().toLowerCase();

                if (filterValue && !cellText.includes(filterValue)) {
                    matchesAllFilters = false;
                }
            });
            row.style.display = matchesAllFilters ? "" : "none";
        });
    }

    // Set data-col-index for filter inputs on load for integration status
    const integrationStatusTableHeaders = document.getElementById('integration-status-table')?.querySelectorAll('thead th');
    if (integrationStatusTableHeaders) {
        integrationStatusTableHeaders.forEach((header, index) => {
            header.dataset.colIndex = index;
            const filterInput = header.closest('thead').querySelector(`.filter-row td:nth-child(${index + 1}) .filter-input`);
            if (filterInput) {
                filterInput.closest('td').dataset.colIndex = index;
            }
        });
    }

    // Event listener for integration status table actions (edit/delete)
    if (integrationStatusTableBody) {
        integrationStatusTableBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editIntegrationStatus(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteIntegrationStatus(index);
            }
        });
    }

    /**
     * Edits an integration status record (placeholder).
     * @param {number} index - The index of the integration status to edit.
     */
    function editIntegrationStatus(index) {
        const integration = integrationStatus[index];
        showMessageModal(`Editing Integration: ${integration.integrationName}. (Functionality to be implemented)`, 'Edit Integration');
        addAuditLog('Edit Integration', `Attempted to edit integration: ${integration.integrationName}`);
    }

    /**
     * Deletes an integration status record (placeholder).
     * @param {number} index - The index of the integration status to delete.
     */
    function deleteIntegrationStatus(index) {
        showConfirmationModal("Are you sure you want to delete this integration record?", () => {
            const deletedIntegration = integrationStatus[index];
            integrationStatus.splice(index, 1);
            localStorage.setItem("integrationStatus", JSON.stringify(integrationStatus));
            renderIntegrationStatusTable();
            addAuditLog('Delete', `Integration Status deleted: ${deletedIntegration?.integrationName || 'N/A'}`);
        });
    }

    // --- Global Admin Features Section Logic ---

    /**
     * Opens the Multi-Location Configuration modal.
     */
    window.openMultiLocationConfigModal = function () {
        openModal(multiLocationConfigModal);
        showMessageModal('Customize CRM settings for each plant, region, or franchise outlet. (Functionality to be implemented)', 'Multi-Location Configuration');
        addAuditLog('Open Admin Features', 'Opened Multi-Location Configuration');
    };

    /**
     * Closes the Multi-Location Configuration modal.
     */
    window.closeMultiLocationConfigModal = function () {
        closeModal(multiLocationConfigModal);
    };

    /**
     * Opens the Auto-Sync Controls modal.
     */
    window.openAutoSyncControlsModal = function () {
        openModal(autoSyncControlsModal);
        showMessageModal('Enable or disable automatic data synchronization between connected modules. (Functionality to be implemented)', 'Auto-Sync Controls');
        addAuditLog('Open Admin Features', 'Opened Auto-Sync Controls');
    };

    /**
     * Closes the Auto-Sync Controls modal.
     */
    window.closeAutoSyncControlsModal = function () {
        closeModal(autoSyncControlsModal);
    };

    /**
     * Opens the System Health Monitor modal.
     */
    window.openSystemHealthMonitorModal = function () {
        openModal(systemHealthMonitorModal, null, updateSystemHealthMonitor);
        addAuditLog('Open Admin Features', 'Opened System Health Monitor');
    };

    /**
     * Closes the System Health Monitor modal.
     */
    window.closeSystemHealthMonitorModal = function () {
        closeModal(systemHealthMonitorModal);
    };

    /**
     * Updates dummy system health metrics.
     */
    function updateSystemHealthMonitor() {
        const cpuUsageSpan = document.getElementById('cpu-usage');
        const memoryUsageSpan = document.getElementById('memory-usage');
        const uptimeSpan = document.getElementById('uptime');

        if (cpuUsageSpan && memoryUsageSpan && uptimeSpan) {
            cpuUsageSpan.textContent = `${(Math.random() * (90 - 20) + 20).toFixed(1)}%`; // 20-90%
            memoryUsageSpan.textContent = `${(Math.random() * (80 - 30) + 30).toFixed(1)}%`; // 30-80%
            const uptimeHours = Math.floor(Math.random() * 720) + 24; // 1 day to 30 days
            const days = Math.floor(uptimeHours / 24);
            const hours = uptimeHours % 24;
            uptimeSpan.textContent = `${days} days, ${hours} hours`;
        }
    }

    /**
     * Opens the Alert Console modal.
     */
    window.openAlertConsoleModal = function () {
        openModal(alertConsoleModal, null, renderAlertConsole);
        addAuditLog('Open Admin Features', 'Opened Alert Console');
    };

    /**
     * Closes the Alert Console modal.
     */
    window.closeAlertConsoleModal = function () {
        closeModal(alertConsoleModal);
    };

    /**
     * Renders the alert log list.
     */
    function renderAlertConsole() {
        if (!alertLogList) return;
        alertLogList.innerHTML = "";
        if (alertLogs.length === 0) {
            alertLogList.innerHTML = '<li class="text-gray-500">No alerts to display.</li>';
            return;
        }
        alertLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first
        alertLogs.forEach(alert => {
            const listItem = document.createElement('li');
            listItem.className = 'py-2 border-b border-gray-200 last:border-b-0';
            let textColor = 'text-gray-800';
            if (alert.severity === 'High' || alert.type === 'Error') {
                textColor = 'text-red-600 font-semibold';
            } else if (alert.severity === 'Medium' || alert.type === 'Warning') {
                textColor = 'text-yellow-600';
            }
            listItem.innerHTML = `
                <span class="${textColor}">[${alert.type} - ${alert.severity}]</span> 
                ${formatDate(alert.timestamp.split('T')[0])} ${new Date(alert.timestamp).toLocaleTimeString()}: 
                ${alert.message}
            `;
            alertLogList.appendChild(listItem);
        });
    }


    /**
     * Opens the Beta/Test Environment Toggle modal.
     */
    window.openBetaTestEnvironmentModal = function () {
        openModal(betaTestEnvironmentModal, betaTestEnvironmentForm);
        addAuditLog('Open Admin Features', 'Opened Beta/Test Environment Toggle');
    };

    /**
     * Closes the Beta/Test Environment Toggle modal.
     */
    window.closeBetaTestEnvironmentModal = function () {
        closeModal(betaTestEnvironmentModal);
        if (betaTestEnvironmentForm) {
            betaTestEnvironmentForm.reset();
            clearAllErrors(betaTestEnvironmentForm);
        }
    };

    // Beta/Test Environment Toggle Form Submission (placeholder)
    if (betaTestEnvironmentForm) {
        const switchEnvironmentButton = betaTestEnvironmentForm.querySelector('button.action-button');
        if (switchEnvironmentButton) {
            switchEnvironmentButton.addEventListener('click', function() {
                const selectedEnvironment = document.getElementById('environment-toggle').value;
                showMessageModal(`Switched to ${selectedEnvironment.toUpperCase()} environment. (This is a simulated change)`, 'Environment Switched');
                addAuditLog('Action', `Switched environment to: ${selectedEnvironment}`);
                closeBetaTestEnvironmentModal();
            });
        }
    }


    // --- Initial Rendering ---
    renderUserTable();
    renderActiveSessions();
    renderNotificationRulesTable();
    renderIntegrationStatusTable();
    renderAuditTrailTable();
    renderAlertConsole(); // Render initially for the section, even if not active

    // Set the initial active section based on the first nav button
    if (navButtons.length > 0) {
        const initialSectionId = navButtons[0].getAttribute('data-section');
        hideAllSections();
        showSection(initialSectionId);
        navButtons[0].classList.add('active');
    }
});
