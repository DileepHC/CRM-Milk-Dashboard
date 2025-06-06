document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Element References ---
    const navButtons = document.querySelectorAll('.qc-navigation .nav-button');
    const sections = document.querySelectorAll('.content > section');

    // Modals
    const addCustomerModal = document.getElementById('add-customer-modal');
    const addInteractionModal = document.getElementById('add-interaction-modal');
    const createTicketModal = document.getElementById('create-ticket-modal');
    const submitFeedbackModal = document.getElementById('submit-feedback-modal');
    const manageRewardsModal = document.getElementById('manage-rewards-modal');
    const languageSettingsModal = document.getElementById('language-settings-modal');
    const accessControlModal = document.getElementById('access-control-modal');
    const dataImportExportModal = document.getElementById('data-import-export-modal');

    // Custom Message Box (dynamically created and appended to body)
    const customMessageBox = document.createElement('div');
    customMessageBox.id = 'custom-message-box';
    customMessageBox.classList.add('modal', 'content-display');
    customMessageBox.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h4 id="message-box-title"></h4>
            <p id="message-box-text"></p>
            <div class="form-actions">
            </div>
        </div>
    `;
    document.body.appendChild(customMessageBox);

    const messageBoxTitle = document.getElementById('message-box-title');
    const messageBoxText = document.getElementById('message-box-text');
    const messageBoxActions = customMessageBox.querySelector('.form-actions');

    // Table Bodies
    const customerTableBody = document.getElementById("customer-table-body");
    const interactionTableBody = document.getElementById("interaction-table-body");
    const supportTicketTableBody = document.getElementById("support-ticket-table-body");
    const feedbackTableBody = document.getElementById("feedback-table-body");
    const loyaltyTableBody = document.getElementById("loyalty-table-body");

    // Forms
    const addCustomerForm = document.getElementById("add-customer-form");
    const addInteractionForm = document.getElementById("add-interaction-form");
    const createTicketForm = document.getElementById("create-ticket-form");
    const submitFeedbackForm = document.getElementById("submit-feedback-form");
    const manageRewardsForm = document.getElementById("manage-rewards-form");

    // Hidden input for edit operations (ensure these exist in your HTML forms)
    const editCustomerIdInput = document.getElementById('edit-customer-id');
    const editInteractionIdInput = document.getElementById('edit-interaction-id');
    const editTicketIdInput = document.getElementById('edit-ticket-id');
    const editFeedbackIdInput = document.getElementById('edit-feedback-id');
    const editLoyaltyCustomerIdInput = document.getElementById('edit-loyalty-customer-id');


    // Charts Instances (to destroy and recreate/update)
    let interactionTrendChartInstance = null;
    let supportMetricsChartInstance = null;
    let feedbackTrendChartInstance = null;
    let loyaltyEngagementChartInstance = null;
    let kpiDashboardChartInstance = null;

    const interactionTrendChartCanvas = document.getElementById('interaction-trend-chart');
    const supportMetricsChartCanvas = document.getElementById('support-metrics-chart');
    const feedbackTrendChartCanvas = document.getElementById('feedback-trend-chart');
    const loyaltyEngagementChartCanvas = document.getElementById('loyalty-engagement-chart');
    const kpiDashboardChartCanvas = document.getElementById('kpi-dashboard-chart');

    // --- In-memory Data Storage (Loaded from localStorage) ---
    let customers = JSON.parse(localStorage.getItem('customers')) || [];
    let interactions = JSON.parse(localStorage.getItem('interactions')) || [];
    let supportTickets = JSON.parse(localStorage.getItem('supportTickets')) || [];
    let feedbackEntries = JSON.parse(localStorage.getItem('feedbackEntries')) || [];
    let loyaltyData = JSON.parse(localStorage.getItem('loyaltyData')) || [];

    // --- Helper Functions ---

    // Function to save data to localStorage
    function saveData() {
        localStorage.setItem('customers', JSON.stringify(customers));
        localStorage.setItem('interactions', JSON.stringify(interactions));
        localStorage.setItem('supportTickets', JSON.stringify(supportTickets));
        localStorage.setItem('feedbackEntries', JSON.stringify(feedbackEntries));
        localStorage.setItem('loyaltyData', JSON.stringify(loyaltyData));
    }

    // Generates a unique alphanumeric ID of a specified length
    function generateUniqueId(prefix, length = 12) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = prefix;
        const charactersLength = characters.length;
        for (let i = 0; i < length - prefix.length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    // Function to format date to DD/MM/YYYY
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return ''; // Return empty string for invalid dates
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Function to read file as Data URL
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // --- Custom Message Box Implementation ---
    window.showMessageBox = function(title, message, type = 'alert', callback = null) { // Made global
        messageBoxTitle.textContent = title;
        messageBoxText.textContent = message;
        messageBoxActions.innerHTML = ''; // Clear previous buttons

        if (type === 'alert') {
            const okButton = document.createElement('button');
            okButton.textContent = 'OK';
            okButton.classList.add('action-button', 'confirm-yes');
            okButton.onclick = () => {
                closeModal('custom-message-box');
                if (callback) callback(true);
            };
            messageBoxActions.appendChild(okButton);
        } else if (type === 'confirm') {
            const yesButton = document.createElement('button');
            yesButton.textContent = 'Yes';
            yesButton.classList.add('action-button', 'confirm-yes');
            yesButton.onclick = () => {
                closeModal('custom-message-box');
                if (callback) callback(true);
            };
            messageBoxActions.appendChild(yesButton);

            const noButton = document.createElement('button');
            noButton.textContent = 'No';
            noButton.classList.add('action-button', 'confirm-no');
            noButton.onclick = () => {
                closeModal('custom-message-box');
                if (callback) callback(false);
            };
            messageBoxActions.appendChild(noButton);
        }

        openModal('custom-message-box');
    }

    // --- Modal Management Functions ---
    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        const form = document.querySelector(`#${modalId} form`);
        if (form) {
            form.reset(); // Clear form fields
            clearValidationErrors(form); // Clear any validation errors
        }
        // Specific cleanup for edit ticket modal: remove dynamically added fields
        if (modalId === 'create-ticket-modal') {
            const statusFieldGroup = document.getElementById('ticket-status-group');
            if (statusFieldGroup) statusFieldGroup.remove();
            const resolutionDateFieldGroup = document.getElementById('ticket-resolution-date-group');
            if (resolutionDateFieldGroup) resolutionDateFieldGroup.remove();
            const csatScoreFieldGroup = document.getElementById('ticket-csat-score-group');
            if (csatScoreFieldGroup) csatScoreFieldGroup.remove();
            // Clear the hidden edit ID for tickets
            if (editTicketIdInput) editTicketIdInput.value = '';
        }
        // Ensure customer ID is re-enabled after loyalty edit
        if (modalId === 'manage-rewards-modal') {
            const customerIdInput = document.getElementById('reward-customer-id');
            if (customerIdInput) {
                customerIdInput.disabled = false;
            }
            // Clear the hidden edit ID for loyalty
            if (editLoyaltyCustomerIdInput) editLoyaltyCustomerIdInput.value = '';
        }
        // Clear other hidden edit IDs
        if (modalId === 'add-customer-modal' && editCustomerIdInput) editCustomerIdInput.value = '';
        if (modalId === 'add-interaction-modal' && editInteractionIdInput) editInteractionIdInput.value = '';
        if (modalId === 'submit-feedback-modal' && editFeedbackIdInput) editFeedbackIdInput.value = '';
    }

    window.openAddCustomerModal = function() { closeModal('add-customer-modal'); openModal('add-customer-modal'); } // Made global
    window.closeAddCustomerModal = function() { closeModal('add-customer-modal'); } // Made global

    window.openAddInteractionModal = function() { closeModal('add-interaction-modal'); openModal('add-interaction-modal'); } // Made global
    window.closeAddInteractionModal = function() { closeModal('add-interaction-modal'); } // Made global

    window.openCreateTicketModal = function() { closeModal('create-ticket-modal'); openModal('create-ticket-modal'); } // Made global
    window.closeCreateTicketModal = function() { closeModal('create-ticket-modal'); } // Made global

    window.openSubmitFeedbackModal = function() { closeModal('submit-feedback-modal'); openModal('submit-feedback-modal'); } // Made global
    window.closeSubmitFeedbackModal = function() { closeModal('submit-feedback-modal'); } // Made global

    window.openManageRewardsModal = function() { closeModal('manage-rewards-modal'); openModal('manage-rewards-modal'); } // Made global
    window.closeManageRewardsModal = function() { closeModal('manage-rewards-modal'); } // Made global

    window.openLanguageSettingsModal = function() { openModal('language-settings-modal'); showMessageBox("Language Settings", "Language selection and auto-translation configurations would go here.", "alert"); } // Made global
    window.closeLanguageSettingsModal = function() { closeModal('language-settings-modal'); } // Made global

    window.openAccessControlModal = function() { openModal('access-control-modal'); showMessageBox("Role-Based Access Control", "User roles and permissions management would go here.", "alert"); } // Made global
    window.closeAccessControlModal = function() { closeModal('access-control-modal'); } // Made global

    window.openDataImportExportModal = function() { openModal('data-import-export-modal'); showMessageBox("Data Import/Export", "Options for importing/exporting CRM data (e.g., Excel, PDF, JSON) would go here.", "alert"); } // Made global
    window.closeDataImportExportModal = function() { closeModal('data-import-export-modal'); } // Made global

    // Close modals when clicking outside
    window.onclick = function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target == modal) {
                closeModal(modal.id);
            }
        });
    }

    // --- Form Validation Helpers ---
    function showValidationError(inputElement, message) {
        // Clear any existing error message for this input first
        clearValidationError(inputElement);

        let errorElement = document.createElement('div');
        errorElement.classList.add('error-message'); // Changed to 'error-message'
        errorElement.textContent = message;

        // Insert the error message directly after the input element
        inputElement.insertAdjacentElement('afterend', errorElement);
        inputElement.classList.add('invalid');
        // If you want a red border on the input, you can add it to your CSS:
        // .invalid { border-color: red !important; }
    }

    function clearValidationError(inputElement) {
        inputElement.classList.remove('invalid');
        // Remove any dynamically added border styles if they were applied
        inputElement.style.removeProperty('border-color');
        
        let nextSibling = inputElement.nextElementSibling;
        if (nextSibling && nextSibling.classList.contains('error-message')) { // Changed to 'error-message'
            nextSibling.remove();
        }
    }

    function clearValidationErrors(formElement) {
        formElement.querySelectorAll('.error-message').forEach(el => el.remove()); // Changed to 'error-message'
        formElement.querySelectorAll('.invalid').forEach(el => {
            el.classList.remove('invalid');
            // Remove any dynamically added border styles if they were applied
            el.style.removeProperty('border-color');
        });
    }

    // --- Inline Filter Setup ---
    function getCurrentFilters(tableId) {
        const filters = {};
        const filterInputs = document.querySelectorAll(`#${tableId} .filter-row input`);
        filterInputs.forEach(input => {
            if (input.value.trim()) {
                filters[input.dataset.column] = input.value.trim();
            }
        });
        return filters;
    }

    // --- Table Filtering & Sorting ---
    document.querySelectorAll('.data-table').forEach(table => {
        const tableId = table.id;
        const filterRow = table.querySelector('.filter-row');

        // Toggle filter row visibility
        table.querySelectorAll('th.filterable').forEach(header => {
            header.addEventListener('click', (event) => {
                // Prevent toggling if click is on the filter input itself
                if (event.target.tagName === 'INPUT' || event.target.closest('.filter-input')) {
                    return;
                }
                // Toggle the visibility of the filter row
                filterRow.classList.toggle('hidden');
            });
        });

        // Apply filters on input change
        table.querySelectorAll('.filter-input').forEach(input => {
            input.addEventListener('input', () => {
                if (tableId === 'customer-table') renderCustomers();
                else if (tableId === 'interaction-table') renderInteractions();
                else if (tableId === 'support-ticket-table') renderSupportTickets();
                else if (tableId === 'feedback-table') renderFeedbackEntries();
                else if (tableId === 'loyalty-table') renderLoyaltyData();
            });
        });
    });

    // --- Table Sorting ---
    document.querySelectorAll('.data-table th.filterable').forEach(header => {
        header.addEventListener('click', (event) => {
            // Only sort if click is on the header, not the filter input
            if (event.target.tagName === 'INPUT' || event.target.closest('.filter-input')) {
                return;
            }

            const table = header.closest('.data-table');
            const column = header.dataset.column;
            const type = header.dataset.type; // 'text', 'number', 'date'
            let currentDirection = header.dataset.direction || 'none';
            let newDirection;

            // Reset arrows for all headers in the same table
            table.querySelectorAll('th.filterable').forEach(th => {
                if (th !== header) {
                    th.dataset.direction = 'none';
                    const arrow = th.querySelector('.arrow');
                    if (arrow) arrow.textContent = ''; // Clear arrow
                }
            });

            if (currentDirection === 'asc') {
                newDirection = 'desc';
                const arrow = header.querySelector('.arrow');
                if (arrow) arrow.textContent = '▼'; // Down arrow for descending
            } else {
                newDirection = 'asc';
                const arrow = header.querySelector('.arrow');
                if (arrow) arrow.textContent = '▲'; // Up arrow for ascending
            }
            header.dataset.direction = newDirection;

            let dataArray;
            if (table.id === 'customer-table') dataArray = customers;
            else if (table.id === 'interaction-table') dataArray = interactions;
            else if (table.id === 'support-ticket-table') dataArray = supportTickets;
            else if (table.id === 'feedback-table') dataArray = feedbackEntries;
            else if (table.id === 'loyalty-table') dataArray = loyaltyData;

            // Perform a shallow copy to trigger reactivity for sorting
            const sortedArray = [...dataArray];

            sortedArray.sort((a, b) => {
                const valA = a[column];
                const valB = b[column];

                let comparison = 0;
                if (type === 'number') {
                    comparison = (parseFloat(valA) || 0) - (parseFloat(valB) || 0);
                } else if (type === 'date') {
                    // ParseABCDEFGHIJKLMNOPQRSTUVWXYZ-MM-DD to Date objects for comparison
                    const dateA = new Date(valA);
                    const dateB = new Date(valB);
                    comparison = dateA.getTime() - dateB.getTime();
                } else { // text
                    comparison = String(valA).localeCompare(String(valB));
                }

                return newDirection === 'asc' ? comparison : -comparison;
            });

            // Update the original data array with the sorted array
            if (table.id === 'customer-table') customers = sortedArray;
            else if (table.id === 'interaction-table') interactions = sortedArray;
            else if (table.id === 'support-ticket-table') supportTickets = sortedArray;
            else if (table.id === 'feedback-table') feedbackEntries = sortedArray;
            else if (table.id === 'loyalty-table') loyaltyData = sortedArray;

            // Re-render the sorted table
            if (table.id === 'customer-table') renderCustomers();
            else if (table.id === 'interaction-table') renderInteractions();
            else if (table.id === 'support-ticket-table') renderSupportTickets();
            else if (table.id === 'feedback-table') renderFeedbackEntries();
            else if (table.id === 'loyalty-table') renderLoyaltyData();
        });
    });


    // --- Render Functions for Tables ---

    function renderCustomers() {
        const tableBody = document.getElementById('customer-table-body');
        if (!tableBody) return; // Guard clause
        tableBody.innerHTML = ''; // Clear existing rows

        const currentFilters = getCurrentFilters('customer-table');
        const filteredCustomers = customers.filter(customer => {
            return Object.keys(currentFilters).every(column => {
                const filterValue = currentFilters[column].toLowerCase();
                const cellValue = String(customer[column]).toLowerCase();
                return cellValue.includes(filterValue);
            });
        });

        filteredCustomers.forEach(customer => {
            const row = tableBody.insertRow();
            row.dataset.id = customer.customerId; // Store ID for editing/deleting

            row.insertCell().textContent = customer.customerId;
            row.insertCell().textContent = customer.name;
            row.insertCell().textContent = customer.contact;
            row.insertCell().textContent = customer.location;
            row.insertCell().textContent = customer.purchaseHistory; // This would typically be a summary or link
            row.insertCell().textContent = customer.preferences;
            row.insertCell().textContent = customer.loyaltyTier;
            row.insertCell().textContent = customer.feedbackScore !== null ? customer.feedbackScore : 'N/A';
            const kycCell = row.insertCell();
            if (customer.kycUploads && customer.kycUploads.length > 0) {
                customer.kycUploads.forEach((dataUrl, i) => {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.target = '_blank';
                    link.textContent = `KYC ${i + 1}`;
                    kycCell.appendChild(link);
                    if (i < customer.kycUploads.length - 1) {
                        kycCell.appendChild(document.createElement('br'));
                    }
                });
            } else {
                kycCell.textContent = 'No';
            }
            row.insertCell().textContent = customer.behavioralSegmentation;
            row.insertCell().textContent = customer.aiTags;

            const actionsCell = row.insertCell();
            actionsCell.classList.add('action-button-container'); // Add class for styling
            const editButton = document.createElement('button');
            editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
            editButton.classList.add('action-button', 'edit-button');
            editButton.title = 'Edit Customer';
            editButton.onclick = () => window.editCustomer(customer.customerId); // Made global
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
            deleteButton.classList.add('action-button', 'delete-button');
            deleteButton.title = 'Delete Customer';
            deleteButton.onclick = () => window.showMessageBox('Confirm Deletion', 'Are you sure you want to delete this customer?', 'confirm', (result) => {
                if (result) window.deleteCustomer(customer.customerId); // Made global
            });
            actionsCell.appendChild(deleteButton);
        });
        saveData();
    }

    function renderInteractions() {
        const tableBody = document.getElementById('interaction-table-body');
        if (!tableBody) return; // Guard clause
        tableBody.innerHTML = '';

        const currentFilters = getCurrentFilters('interaction-table');
        const filteredInteractions = interactions.filter(interaction => {
            return Object.keys(currentFilters).every(column => {
                const filterValue = currentFilters[column].toLowerCase();
                let cellValue;
                if (column.includes('Date')) { // Handle date filtering
                    cellValue = formatDate(interaction[column]).toLowerCase(); // Format for comparison
                    return cellValue.includes(filterValue);
                } else {
                    cellValue = String(interaction[column]).toLowerCase();
                    return cellValue.includes(filterValue);
                }
            });
        });

        filteredInteractions.forEach(interaction => {
            const row = tableBody.insertRow();
            row.dataset.id = interaction.interactionId;

            row.insertCell().textContent = interaction.customerId;
            row.insertCell().textContent = formatDate(interaction.interactionDate);
            row.insertCell().textContent = interaction.interactionType;
            row.insertCell().textContent = interaction.category;
            row.insertCell().textContent = interaction.description;
            row.insertCell().textContent = interaction.sentiment;
            row.insertCell().textContent = interaction.channel;
            row.insertCell().textContent = interaction.assignedTo;
            row.insertCell().textContent = interaction.followUpDate ? formatDate(interaction.followUpDate) : 'N/A';

            const actionsCell = row.insertCell();
            actionsCell.classList.add('action-button-container'); // Add class for styling
            const editButton = document.createElement('button');
            editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
            editButton.classList.add('action-button', 'edit-button');
            editButton.title = 'Edit Interaction';
            editButton.onclick = () => window.editInteraction(interaction.interactionId); // Made global
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
            deleteButton.classList.add('action-button', 'delete-button');
            deleteButton.title = 'Delete Interaction';
            deleteButton.onclick = () => window.showMessageBox('Confirm Deletion', 'Are you sure you want to delete this interaction record?', 'confirm', (result) => {
                if (result) window.deleteInteraction(interaction.interactionId); // Made global
            });
            actionsCell.appendChild(deleteButton);
        });
        saveData();
        updateInteractionChart();
    }

    function renderSupportTickets() {
        const tableBody = document.getElementById('support-ticket-table-body');
        if (!tableBody) return; // Guard clause
        tableBody.innerHTML = '';

        const currentFilters = getCurrentFilters('support-ticket-table');
        const filteredTickets = supportTickets.filter(ticket => {
            return Object.keys(currentFilters).every(column => {
                const filterValue = currentFilters[column].toLowerCase();
                let cellValue;
                if (column.includes('Date')) {
                    cellValue = formatDate(ticket[column]).toLowerCase();
                    return cellValue.includes(filterValue);
                } else if (typeof ticket[column] === 'number') { // Handle number filtering for CSAT
                    cellValue = String(ticket[column]); // Convert number to string for includes
                    return cellValue.includes(filterValue);
                }
                else {
                    cellValue = String(ticket[column]).toLowerCase();
                    return cellValue.includes(filterValue);
                }
            });
        });

        filteredTickets.forEach(ticket => {
            const row = tableBody.insertRow();
            row.dataset.id = ticket.ticketId;

            row.insertCell().textContent = ticket.ticketId;
            row.insertCell().textContent = ticket.customerId;
            row.insertCell().textContent = ticket.subject;
            row.insertCell().textContent = ticket.status;
            row.insertCell().textContent = ticket.priority;
            row.insertCell().textContent = ticket.assignedTo;
            row.insertCell().textContent = formatDate(ticket.createdDate);
            row.insertCell().textContent = ticket.slaDueDate ? formatDate(ticket.slaDueDate) : 'N/A';
            row.insertCell().textContent = ticket.resolutionDate ? formatDate(ticket.resolutionDate) : 'Pending';
            row.insertCell().textContent = ticket.csatScore !== null ? ticket.csatScore : 'N/A';

            const actionsCell = row.insertCell();
            actionsCell.classList.add('action-button-container'); // Add class for styling
            const editButton = document.createElement('button');
            editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
            editButton.classList.add('action-button', 'edit-button');
            editButton.title = 'Edit Ticket';
            editButton.onclick = () => window.editSupportTicket(ticket.ticketId); // Made global
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
            deleteButton.classList.add('action-button', 'delete-button');
            deleteButton.title = 'Delete Ticket';
            deleteButton.onclick = () => window.showMessageBox('Confirm Deletion', 'Are you sure you want to delete this support ticket?', 'confirm', (result) => {
                if (result) window.deleteSupportTicket(ticket.ticketId); // Made global
            });
            actionsCell.appendChild(deleteButton);
        });
        saveData();
        updateSupportMetricsChart();
    }

    function renderFeedbackEntries() {
        const tableBody = document.getElementById('feedback-table-body');
        if (!tableBody) return; // Guard clause
        tableBody.innerHTML = '';

        const currentFilters = getCurrentFilters('feedback-table');
        const filteredFeedback = feedbackEntries.filter(feedback => {
            return Object.keys(currentFilters).every(column => {
                const filterValue = currentFilters[column].toLowerCase();
                let cellValue;
                if (column.includes('Date')) {
                    cellValue = formatDate(feedback[column]).toLowerCase();
                    return cellValue.includes(filterValue);
                } else if (typeof feedback[column] === 'number') { // Handle number filtering for rating/NPS
                    cellValue = String(feedback[column]);
                    return cellValue.includes(filterValue);
                } else {
                    cellValue = String(feedback[column]).toLowerCase();
                    return cellValue.includes(filterValue);
                }
            });
        });

        filteredFeedback.forEach(feedback => {
            const row = tableBody.insertRow();
            row.dataset.id = feedback.feedbackId;

            row.insertCell().textContent = feedback.feedbackId;
            row.insertCell().textContent = feedback.customerId || 'N/A';
            row.insertCell().textContent = formatDate(feedback.feedbackDate);
            row.insertCell().textContent = feedback.type;
            row.insertCell().textContent = feedback.message;
            row.insertCell().textContent = feedback.rating !== null ? feedback.rating : 'N/A';
            row.insertCell().textContent = feedback.npsScore !== null ? feedback.npsScore : 'N/A';
            row.insertCell().textContent = feedback.classifierTags || 'N/A';

            const actionsCell = row.insertCell();
            actionsCell.classList.add('action-button-container'); // Add class for styling
            const editButton = document.createElement('button');
            editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
            editButton.classList.add('action-button', 'edit-button');
            editButton.title = 'Edit Feedback';
            editButton.onclick = () => window.editFeedback(feedback.feedbackId); // Made global
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
            deleteButton.classList.add('action-button', 'delete-button');
            deleteButton.title = 'Delete Feedback';
            deleteButton.onclick = () => window.showMessageBox('Confirm Deletion', 'Are you sure you want to delete this feedback record?', 'confirm', (result) => {
                if (result) window.deleteFeedback(feedback.feedbackId); // Made global
            });
            actionsCell.appendChild(deleteButton);
        });
        saveData();
        updateFeedbackTrendChart();
    }

    function renderLoyaltyData() {
        const tableBody = document.getElementById('loyalty-table-body');
        if (!tableBody) return; // Guard clause
        tableBody.innerHTML = '';

        const currentFilters = getCurrentFilters('loyalty-table');
        const filteredLoyalty = loyaltyData.filter(item => {
            return Object.keys(currentFilters).every(column => {
                const filterValue = currentFilters[column].toLowerCase();
                let cellValue;
                if (typeof item[column] === 'number') {
                    cellValue = String(item[column]);
                    return cellValue.includes(filterValue);
                } else {
                    cellValue = String(item[column]).toLowerCase();
                    return cellValue.includes(filterValue);
                }
            });
        });

        filteredLoyalty.forEach(item => {
            const row = tableBody.insertRow();
            row.dataset.id = item.customerId; // Assuming customerId is unique for loyalty data

            row.insertCell().textContent = item.customerId;
            row.insertCell().textContent = item.loyaltyTier;
            row.insertCell().textContent = item.points;
            row.insertCell().textContent = `₹${item.lifetimeValue.toFixed(2)}`;
            row.insertCell().textContent = item.rewardUsage;
            row.insertCell().textContent = item.churnRisk;
            row.insertCell().textContent = item.personalizedOffers.map(offer => `${offer.type} (${offer.value})`).join(', ');

            const actionsCell = row.insertCell();
            actionsCell.classList.add('action-button-container'); // Add class for styling
            const editButton = document.createElement('button');
            editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
            editButton.classList.add('action-button', 'edit-button');
            editButton.title = 'Edit Loyalty';
            editButton.onclick = () => window.editLoyalty(item.customerId); // Made global
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
            deleteButton.classList.add('action-button', 'delete-button');
            deleteButton.title = 'Delete Loyalty';
            deleteButton.onclick = () => window.showMessageBox('Confirm Deletion', 'Are you sure you want to delete this loyalty record?', 'confirm', (result) => {
                if (result) window.deleteLoyalty(item.customerId); // Made global
            });
            actionsCell.appendChild(deleteButton);
        });
        saveData();
        updateLoyaltyEngagementChart();
    }

    // --- Form Submission Handlers ---

    // Unified submit handler for Customer Add/Edit Form
    addCustomerForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        clearValidationErrors(this);

        const nameInput = document.getElementById('customer-name');
        const contactInput = document.getElementById('customer-contact');
        const locationInput = document.getElementById('customer-location');
        const preferencesInput = document.getElementById('customer-preferences');
        const loyaltyTierInput = document.getElementById('customer-loyalty-tier');
        const kycUploadsInput = document.getElementById('customer-kyc-uploads');
        const behavioralSegmentationInput = document.getElementById('customer-behavioral-segmentation');

        let isValid = true;

        // Validate Name
        if (!nameInput.value.trim()) {
            showValidationError(nameInput, 'Customer Name is required.');
            isValid = false;
        } else if (!/^[A-Za-z\s\-']+$/.test(nameInput.value.trim())) {
            showValidationError(nameInput, 'Name can only contain letters, spaces, hyphens, and apostrophes.');
            isValid = false;
        } else if (nameInput.value.trim().length > 50) {
            showValidationError(nameInput, 'Customer Name cannot exceed 50 characters.');
            isValid = false;
        } else {
            clearValidationError(nameInput);
        }

        // Validate Contact
        if (!contactInput.value.trim()) {
            showValidationError(contactInput, 'Contact is required.');
            isValid = false;
        } else if (!/^[6-9]{1}[0-9]{9}$/.test(contactInput.value.trim())) {
            showValidationError(contactInput, 'Contact number must be 10 digits and start with 6-9.');
            isValid = false;
        } else {
            clearValidationError(contactInput);
        }

        // Validate Location
        if (!locationInput.value.trim()) {
            showValidationError(locationInput, 'Location is required.');
            isValid = false;
        } else {
            clearValidationError(locationInput);
        }

        if (!isValid) {
            showMessageBox("Validation Error", "Please correct the errors in the form.");
            return; // Stop form submission if validation fails
        }

        const kycDataUrls = [];
        if (kycUploadsInput.files.length > 0) {
            for (const file of Array.from(kycUploadsInput.files)) {
                const maxSize = 5 * 1024 * 1024; // 5MB
                const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
                if (!allowedTypes.includes(file.type)) {
                    showValidationError(kycUploadsInput, `File '${file.name}' is not a valid image (JPG/PNG) or PDF.`);
                    isValid = false;
                } else if (file.size > maxSize) {
                    showValidationError(kycUploadsInput, `File '${file.name}' size must be less than 5MB.`);
                    isValid = false;
                } else {
                    try {
                        const dataUrl = await readFileAsDataURL(file);
                        kycDataUrls.push(dataUrl);
                    } catch (error) {
                        showMessageBox("File Error", `Could not read file ${file.name}: ${error.message}`);
                        isValid = false;
                    }
                }
            }
        }

        if (!isValid) return;

        const customerId = editCustomerIdInput.value; // Get ID from hidden input

        if (customerId) {
            // Edit existing customer
            const customer = customers.find(c => c.customerId === customerId);
            if (customer) {
                customer.name = nameInput.value.trim();
                customer.contact = contactInput.value.trim();
                customer.location = locationInput.value.trim();
                customer.preferences = preferencesInput.value.trim();
                customer.loyaltyTier = loyaltyTierInput.value;
                // If new KYC files are uploaded, replace old ones; otherwise, retain existing
                customer.kycUploads = kycDataUrls.length > 0 ? kycDataUrls : customer.kycUploads;
                customer.behavioralSegmentation = behavioralSegmentationInput.value.trim();
                showMessageBox('Success', 'Customer updated successfully!', 'alert');
            } else {
                showMessageBox('Error', 'Customer not found for update.', 'alert');
            }
        } else {
            // Add new customer
            const newCustomer = {
                customerId: generateUniqueId('CUST', 12),
                name: nameInput.value.trim(),
                contact: contactInput.value.trim(),
                location: locationInput.value.trim(),
                purchaseHistory: 'No recent purchases',
                preferences: preferencesInput.value.trim(),
                loyaltyTier: loyaltyTierInput.value,
                feedbackScore: null,
                kycUploads: kycDataUrls,
                behavioralSegmentation: behavioralSegmentationInput.value.trim(),
                aiTags: 'New Customer'
            };
            customers.push(newCustomer);
            showMessageBox('Success', 'Customer added successfully!', 'alert');
        }

        renderCustomers();
        closeAddCustomerModal();
    });

    // Unified submit handler for Interaction Add/Edit Form
    addInteractionForm.addEventListener('submit', function(event) {
        event.preventDefault();
        clearValidationErrors(this);

        const customerIdInput = document.getElementById('interaction-customer-id');
        const dateInput = document.getElementById('interaction-date');
        const typeInput = document.getElementById('interaction-type');
        const categoryInput = document.getElementById('interaction-category');
        const descriptionInput = document.getElementById('interaction-description');
        const sentimentInput = document.getElementById('interaction-sentiment');
        const channelInput = document.getElementById('interaction-channel');
        const assignedToInput = document.getElementById('interaction-assigned-to');
        const followUpDateInput = document.getElementById('interaction-follow-up-date');

        let isValid = true;
        if (!customerIdInput.value.trim()) { showValidationError(customerIdInput, 'Customer ID is required.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!customers.some(c => c.customerId === customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID does not exist.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!dateInput.value) { showValidationError(dateInput, 'Date is required.'); isValid = false; } else { clearValidationError(dateInput); }
        if (new Date(dateInput.value) > new Date()) { showValidationError(dateInput, 'Interaction date cannot be in the future.'); isValid = false; } else { clearValidationError(dateInput); }
        if (!typeInput.value) { showValidationError(typeInput, 'Interaction Type is required.'); isValid = false; } else { clearValidationError(typeInput); }
        if (!categoryInput.value) { showValidationError(categoryInput, 'Category is required.'); isValid = false; } else { clearValidationError(categoryInput); }
        if (!descriptionInput.value.trim()) { showValidationError(descriptionInput, 'Description is required.'); isValid = false; } else { clearValidationError(descriptionInput); }
        if (followUpDateInput.value && new Date(followUpDateInput.value) < new Date()) { showValidationError(followUpDateInput, 'Follow-up date cannot be in the past.'); isValid = false; } else { clearValidationError(followUpDateInput); }


        if (!isValid) {
            showMessageBox("Validation Error", "Please correct the errors in the form.");
            return;
        }

        const interactionId = editInteractionIdInput.value;

        if (interactionId) {
            // Edit existing interaction
            const interaction = interactions.find(i => i.interactionId === interactionId);
            if (interaction) {
                interaction.customerId = customerIdInput.value.trim();
                interaction.interactionDate = dateInput.value;
                interaction.interactionType = typeInput.value;
                interaction.category = categoryInput.value;
                interaction.description = descriptionInput.value.trim();
                interaction.sentiment = sentimentInput.value;
                interaction.channel = channelInput.value.trim();
                interaction.assignedTo = assignedToInput.value.trim();
                interaction.followUpDate = followUpDateInput.value || null;
                showMessageBox('Success', 'Interaction updated successfully!', 'alert');
            } else {
                showMessageBox('Error', 'Interaction not found for update.', 'alert');
            }
        } else {
            // Add new interaction
            const newInteraction = {
                interactionId: generateUniqueId('INT', 10),
                customerId: customerIdInput.value.trim(),
                interactionDate: dateInput.value, // Stored asYYYY-MM-DD
                interactionType: typeInput.value,
                category: categoryInput.value,
                description: descriptionInput.value.trim(),
                sentiment: sentimentInput.value,
                channel: channelInput.value.trim() || 'N/A',
                assignedTo: assignedToInput.value.trim() || 'Unassigned',
                followUpDate: followUpDateInput.value || null // Stored asYYYY-MM-DD
            };
            interactions.push(newInteraction);
            showMessageBox('Success', 'Interaction logged successfully!', 'alert');
        }
        renderInteractions();
        closeAddInteractionModal();
    });

    // Unified submit handler for Ticket Add/Edit Form
    createTicketForm.addEventListener('submit', function(event) {
        event.preventDefault();
        clearValidationErrors(this);

        const customerIdInput = document.getElementById('ticket-customer-id');
        const subjectInput = document.getElementById('ticket-subject');
        const descriptionInput = document.getElementById('ticket-description');
        const priorityInput = document.getElementById('ticket-priority');
        const assignedToInput = document.getElementById('ticket-assigned-to');
        // createdDateInput is dynamically added for edit, or assumed for new
        const createdDateInput = document.getElementById('ticket-created-date'); 
        const slaDueDateInput = document.getElementById('ticket-sla-due-date');
        // Dynamically added for edit
        const statusInput = document.getElementById('ticket-status'); 
        const resolutionDateInput = document.getElementById('ticket-resolution-date');
        const csatScoreInput = document.getElementById('ticket-csat-score');

        let isValid = true;
        if (!customerIdInput.value.trim()) { showValidationError(customerIdInput, 'Customer ID is required.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!customers.some(c => c.customerId === customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID does not exist.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!subjectInput.value.trim()) { showValidationError(subjectInput, 'Subject is required.'); isValid = false; } else { clearValidationError(subjectInput); }
        if (subjectInput.value.trim().length > 100) { showValidationError(subjectInput, 'Subject cannot exceed 100 characters.'); isValid = false; } else { clearValidationError(subjectInput); }
        if (!descriptionInput.value.trim()) { showValidationError(descriptionInput, 'Description is required.'); isValid = false; } else { clearValidationError(descriptionInput); }
        if (csatScoreInput && csatScoreInput.value && (parseInt(csatScoreInput.value) < 1 || parseInt(csatScoreInput.value) > 5)) { showValidationError(csatScoreInput, 'CSAT Score must be between 1 and 5.'); isValid = false; } else { clearValidationError(csatScoreInput); }

        // New validations for dates and status, considering if fields exist (edit mode)
        const currentCreatedDate = createdDateInput ? createdDateInput.value : new Date().toISOString().split('T')[0]; // Use current date for new ticket
        if (new Date(currentCreatedDate) > new Date()) { showValidationError(createdDateInput || subjectInput, 'Created Date cannot be in the future.'); isValid = false; } else { clearValidationError(createdDateInput || subjectInput); } // Use subjectInput for validation if createdDateInput is not present in add mode

        if (slaDueDateInput.value && new Date(slaDueDateInput.value) < new Date(currentCreatedDate)) { showValidationError(slaDueDateInput, 'SLA Due Date cannot be before Created Date.'); isValid = false; } else { clearValidationError(slaDueDateInput); }
        
        const currentStatus = statusInput ? statusInput.value : 'Open'; // Default to Open for new ticket
        if (currentStatus === 'Resolved' && resolutionDateInput && !resolutionDateInput.value) { showValidationError(resolutionDateInput, 'Resolution Date is required for Resolved status.'); isValid = false; } else { clearValidationError(resolutionDateInput); }
        if (currentStatus === 'Resolved' && resolutionDateInput && resolutionDateInput.value && (new Date(resolutionDateInput.value) < new Date(currentCreatedDate) || new Date(resolutionDateInput.value) > new Date())) { showValidationError(resolutionDateInput, 'Resolution Date must be between Created Date and today.'); isValid = false; } else { clearValidationError(resolutionDateInput); }


        if (!isValid) {
            showMessageBox("Validation Error", "Please correct the errors in the form.");
            return;
        }

        const ticketId = editTicketIdInput.value;

        if (ticketId) {
            // Edit existing ticket
            const ticket = supportTickets.find(t => t.ticketId === ticketId);
            if (ticket) {
                ticket.customerId = customerIdInput.value.trim();
                ticket.subject = subjectInput.value.trim();
                ticket.description = descriptionInput.value.trim();
                ticket.priority = priorityInput.value;
                ticket.assignedTo = assignedToInput.value.trim();
                ticket.slaDueDate = slaDueDateInput.value || null;
                ticket.status = statusInput ? statusInput.value : ticket.status; // Use existing if not dynamically added
                ticket.resolutionDate = resolutionDateInput ? resolutionDateInput.value || null : ticket.resolutionDate;
                ticket.csatScore = csatScoreInput && csatScoreInput.value ? parseInt(csatScoreInput.value) : ticket.csatScore;
                showMessageBox('Success', 'Support ticket updated successfully!', 'alert');
            } else {
                showMessageBox('Error', 'Support ticket not found for update.', 'alert');
            }
        } else {
            // Add new ticket
            const newTicket = {
                ticketId: generateUniqueId('TKT', 8),
                customerId: customerIdInput.value.trim(),
                subject: subjectInput.value.trim(),
                description: descriptionInput.value.trim(),
                status: 'Open',
                priority: priorityInput.value,
                assignedTo: assignedToInput.value.trim() || 'Unassigned',
                createdDate: new Date().toISOString().split('T')[0], // Stored asYYYY-MM-DD
                slaDueDate: slaDueDateInput.value || null, // Stored asYYYY-MM-DD
                resolutionDate: null,
                csatScore: null
            };
            supportTickets.push(newTicket);
            showMessageBox('Success', 'Support ticket created successfully!', 'alert');
        }
        renderSupportTickets();
        closeCreateTicketModal();
    });

    // Unified submit handler for Feedback Add/Edit Form
    submitFeedbackForm.addEventListener('submit', function(event) {
        event.preventDefault();
        clearValidationErrors(this);

        const customerIdInput = document.getElementById('feedback-customer-id');
        const feedbackTypeInput = document.getElementById('feedback-type');
        const messageInput = document.getElementById('feedback-message');
        const ratingInput = document.getElementById('feedback-rating');
        const npsInput = document.getElementById('feedback-nps');

        let isValid = true;
        if (customerIdInput.value.trim() && (!/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim()) || !customers.some(c => c.customerId === customerIdInput.value.trim()))) { 
            showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters and exist, or left empty.'); 
            isValid = false; 
        } else { clearValidationError(customerIdInput); }
        if (!feedbackTypeInput.value) { showValidationError(feedbackTypeInput, 'Feedback Type is required.'); isValid = false; } else { clearValidationError(feedbackTypeInput); }
        if (!messageInput.value.trim()) { showValidationError(messageInput, 'Feedback message is required.'); isValid = false; } else { clearValidationError(messageInput); }
        if (ratingInput.value && (parseInt(ratingInput.value) < 1 || parseInt(ratingInput.value) > 5)) { showValidationError(ratingInput, 'Rating must be between 1 and 5.'); isValid = false; } else { clearValidationError(ratingInput); }
        if (npsInput.value && (parseInt(npsInput.value) < 0 || parseInt(npsInput.value) > 10)) { showValidationError(npsInput, 'NPS must be between 0 and 10.'); isValid = false; } else { clearValidationError(npsInput); }

        if (!isValid) {
            showMessageBox("Validation Error", "Please correct the errors in the form.");
            return;
        }

        const feedbackId = editFeedbackIdInput.value;
        let targetFeedback;

        if (feedbackId) {
            // Edit existing feedback
            targetFeedback = feedbackEntries.find(f => f.feedbackId === feedbackId);
            if (targetFeedback) {
                targetFeedback.customerId = customerIdInput.value.trim() || null;
                targetFeedback.type = feedbackTypeInput.value;
                targetFeedback.message = messageInput.value.trim();
                targetFeedback.rating = ratingInput.value ? parseInt(ratingInput.value) : null;
                targetFeedback.npsScore = npsInput.value ? parseInt(npsInput.value) : null;
                showMessageBox('Success', 'Feedback updated successfully!', 'alert');
            } else {
                showMessageBox('Error', 'Feedback not found for update.', 'alert');
            }
        } else {
            // Add new feedback
            targetFeedback = {
                feedbackId: generateUniqueId('FB', 7),
                customerId: customerIdInput.value.trim() || null,
                feedbackDate: new Date().toISOString().split('T')[0], // Stored asYYYY-MM-DD
                type: feedbackTypeInput.value,
                message: messageInput.value.trim(),
                rating: ratingInput.value ? parseInt(ratingInput.value) : null,
                npsScore: npsInput.value ? parseInt(npsInput.value) : null,
                classifierTags: 'Auto-tagged'
            };
            feedbackEntries.push(targetFeedback);
            showMessageBox('Success', 'Feedback submitted successfully!', 'alert');
        }

        // Update customer feedback score if customer ID is provided
        if (targetFeedback.customerId) {
            const customerIndex = customers.findIndex(c => c.customerId === targetFeedback.customerId);
            if (customerIndex !== -1) {
                const customerFeedbacks = feedbackEntries.filter(f => f.customerId === targetFeedback.customerId && f.rating !== null);
                const totalRating = customerFeedbacks.reduce((sum, f) => sum + f.rating, 0);
                customers[customerIndex].feedbackScore = customerFeedbacks.length > 0 ? (totalRating / customerFeedbacks.length).toFixed(1) : null;
                renderCustomers();
            }
        }

        renderFeedbackEntries();
        closeSubmitFeedbackModal();
    });

    // Unified submit handler for Manage Rewards Add/Edit Form
    manageRewardsForm.addEventListener('submit', function(event) {
        event.preventDefault();
        clearValidationErrors(this);

        const customerIdInput = document.getElementById('reward-customer-id');
        const rewardTypeInput = document.getElementById('reward-type');
        const rewardValueInput = document.getElementById('reward-value');
        const rewardDescriptionInput = document.getElementById('reward-description');

        let isValid = true;
        if (!customerIdInput.value.trim()) { showValidationError(customerIdInput, 'Customer ID is required.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!customers.some(c => c.customerId === customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID does not exist.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!rewardTypeInput.value) { showValidationError(rewardTypeInput, 'Reward Type is required.'); isValid = false; } else { clearValidationError(rewardTypeInput); }
        if (rewardValueInput.value === '' || isNaN(parseFloat(rewardValueInput.value)) || parseFloat(rewardValueInput.value) < 0) { showValidationError(rewardValueInput, 'Valid positive reward value is required.'); isValid = false; } else { clearValidationError(rewardValueInput); }

        if (!isValid) {
            showMessageBox("Validation Error", "Please correct the errors in the form.");
            return;
        }

        const customerId = customerIdInput.value.trim();
        const rewardType = rewardTypeInput.value;
        const rewardValue = parseFloat(rewardValueInput.value);
        const rewardDescription = rewardDescriptionInput.value.trim();

        let loyaltyEntry = loyaltyData.find(item => item.customerId === customerId);

        if (editLoyaltyCustomerIdInput.value) { // This means we are editing an existing loyalty record
            if (loyaltyEntry) {
                // Update specific fields. For simplicity, just update points/LTV directly
                if (rewardType === 'Points') {
                    loyaltyEntry.points = rewardValue; // Set points to new value
                } else if (rewardType === 'Cashback' || rewardType === 'Discount' || rewardType === 'Gift') {
                    loyaltyEntry.lifetimeValue = rewardValue; // Set LTV to new value
                }
                // Update personalizedOffers: find existing or add new
                const existingOfferIndex = loyaltyEntry.personalizedOffers.findIndex(offer => offer.type === rewardType);
                if (existingOfferIndex !== -1) {
                    loyaltyEntry.personalizedOffers[existingOfferIndex] = { type: rewardType, value: rewardValue, description: rewardDescription, date: new Date().toISOString().split('T')[0] };
                } else {
                    loyaltyEntry.personalizedOffers.push({ type: rewardType, value: rewardValue, description: rewardDescription, date: new Date().toISOString().split('T')[0] });
                }
                showMessageBox('Success', `Loyalty data for ${customerId} updated successfully!`, 'alert');
            } else {
                showMessageBox('Error', 'Loyalty data not found for update.', 'alert');
            }
        } else {
            // Add new loyalty entry (or update if already exists in a fresh add context)
            if (!loyaltyEntry) { // If it doesn't exist, create a new one
                const customer = customers.find(c => c.customerId === customerId);
                loyaltyEntry = {
                    customerId: customerId,
                    loyaltyTier: customer ? customer.loyaltyTier : 'None',
                    points: 0,
                    lifetimeValue: 0,
                    rewardUsage: 0,
                    churnRisk: 'Low',
                    personalizedOffers: []
                };
                loyaltyData.push(loyaltyEntry);
            }

            if (rewardType === 'Points') {
                loyaltyEntry.points += rewardValue;
            } else if (rewardType === 'Cashback' || rewardType === 'Discount' || rewardType === 'Gift') {
                loyaltyEntry.lifetimeValue += rewardValue;
                loyaltyEntry.rewardUsage += rewardValue;
            }
            loyaltyEntry.personalizedOffers.push({ type: rewardType, value: rewardValue, description: rewardDescription, date: new Date().toISOString().split('T')[0] });
            showMessageBox('Success', `Reward "${rewardType}" with value ${rewardValue} applied successfully to ${customerId}!`, 'alert');
        }

        const customer = customers.find(c => c.customerId === customerId);
        if (customer) {
            if (loyaltyEntry.points >= 500 && customer.loyaltyTier !== 'Gold') {
                customer.loyaltyTier = 'Gold';
            } else if (loyaltyEntry.points >= 200 && customer.loyaltyTier !== 'Silver' && customer.loyaltyTier !== 'Gold') {
                customer.loyaltyTier = 'Silver';
            } else if (loyaltyEntry.points >= 50 && customer.loyaltyTier !== 'Bronze' && customer.loyaltyTier !== 'Silver' && customer.loyaltyTier !== 'Gold') {
                customer.loyaltyTier = 'Bronze';
            }
        }

        renderLoyaltyData();
        renderCustomers(); // To update loyalty tier display in customer table
        closeManageRewardsModal();
    });


    // --- Edit Functions (Populate Modals for Editing) ---

    window.editCustomer = function(customerId) { // Made global
        console.log(`Editing customer: ${customerId}`);
        const customer = customers.find(c => c.customerId === customerId);
        if (!customer) {
            showMessageBox('Error', 'Customer not found for editing.', 'alert');
            return;
        }

        openAddCustomerModal(); // Use the same modal for adding/editing

        // Set the hidden input to indicate edit mode and the ID of the item being edited
        editCustomerIdInput.value = customerId;

        document.getElementById('customer-name').value = customer.name;
        document.getElementById('customer-contact').value = customer.contact;
        document.getElementById('customer-location').value = customer.location;
        document.getElementById('customer-preferences').value = customer.preferences;
        document.getElementById('customer-loyalty-tier').value = customer.loyaltyTier;
        document.getElementById('customer-behavioral-segmentation').value = customer.behavioralSegmentation;
        // KYC uploads input cannot be pre-filled for security reasons, user must re-upload if needed.
    }


    window.editInteraction = function(interactionId) { // Made global
        console.log(`Editing interaction: ${interactionId}`);
        const interaction = interactions.find(i => i.interactionId === interactionId);
        if (!interaction) {
            showMessageBox('Error', 'Interaction not found for editing.', 'alert');
            return;
        }

        openAddInteractionModal();
        editInteractionIdInput.value = interactionId; // Set hidden ID for edit

        document.getElementById('interaction-customer-id').value = interaction.customerId;
        document.getElementById('interaction-date').value = interaction.interactionDate; //YYYY-MM-DD
        document.getElementById('interaction-type').value = interaction.interactionType;
        document.getElementById('interaction-category').value = interaction.category;
        document.getElementById('interaction-description').value = interaction.description;
        document.getElementById('interaction-sentiment').value = interaction.sentiment;
        document.getElementById('interaction-channel').value = interaction.channel;
        document.getElementById('interaction-assigned-to').value = interaction.assignedTo;
        document.getElementById('interaction-follow-up-date').value = interaction.followUpDate; //YYYY-MM-DD
    }

    window.editSupportTicket = function(ticketId) { // Made global
        console.log(`Editing ticket: ${ticketId}`);
        const ticket = supportTickets.find(t => t.ticketId === ticketId);
        if (!ticket) {
            showMessageBox('Error', 'Support ticket not found for editing.', 'alert');
            return;
        }

        openCreateTicketModal(); // Use the same modal
        editTicketIdInput.value = ticketId; // Set hidden ID for edit

        document.getElementById('ticket-customer-id').value = ticket.customerId;
        document.getElementById('ticket-subject').value = ticket.subject;
        document.getElementById('ticket-description').value = ticket.description;
        document.getElementById('ticket-priority').value = ticket.priority;
        document.getElementById('ticket-assigned-to').value = ticket.assignedTo;
        
        // Ensure createdDateInput is present for edit mode (it's hidden for add)
        let createdDateInput = document.getElementById('ticket-created-date');
        if (!createdDateInput) {
            createdDateInput = document.createElement('input');
            createdDateInput.type = 'hidden';
            createdDateInput.id = 'ticket-created-date';
            createdDateInput.name = 'created-date';
            document.getElementById('create-ticket-form').appendChild(createdDateInput);
        }
        createdDateInput.value = ticket.createdDate; // Set its value


        document.getElementById('ticket-sla-due-date').value = ticket.slaDueDate;

        // Dynamically add status, resolution date, and CSAT score fields if not present
        let statusFieldDiv = document.getElementById('ticket-status-group');
        if (!statusFieldDiv) {
            const priorityDiv = document.getElementById('ticket-priority').closest('.form-group');

            statusFieldDiv = document.createElement('div');
            statusFieldDiv.classList.add('form-group');
            statusFieldDiv.id = 'ticket-status-group';
            statusFieldDiv.innerHTML = `
                <label for="ticket-status">Status:</label>
                <select id="ticket-status" name="status">
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                </select>
            `;
            priorityDiv.parentNode.insertBefore(statusFieldDiv, priorityDiv.nextSibling);

            const resolutionDateFieldDiv = document.createElement('div');
            resolutionDateFieldDiv.classList.add('form-group');
            resolutionDateFieldDiv.id = 'ticket-resolution-date-group';
            resolutionDateFieldDiv.innerHTML = `
                <label for="ticket-resolution-date">Resolution Date:</label>
                <input type="date" id="ticket-resolution-date" name="resolution-date"/>
            `;
            statusFieldDiv.parentNode.insertBefore(resolutionDateFieldDiv, statusFieldDiv.nextSibling);

            const csatScoreFieldDiv = document.createElement('div');
            csatScoreFieldDiv.classList.add('form-group');
            csatScoreFieldDiv.id = 'ticket-csat-score-group';
            csatScoreFieldDiv.innerHTML = `
                <label for="ticket-csat-score">CSAT Score (1-5):</label>
                <input type="number" id="ticket-csat-score" name="csat-score" min="1" max="5" step="1"/>
            `;
            resolutionDateFieldDiv.parentNode.insertBefore(csatScoreFieldDiv, resolutionDateFieldDiv.nextSibling);
        }

        document.getElementById('ticket-status').value = ticket.status;
        document.getElementById('ticket-resolution-date').value = ticket.resolutionDate;
        document.getElementById('ticket-csat-score').value = ticket.csatScore;
    }


    window.editFeedback = function(feedbackId) { // Made global
        console.log(`Editing feedback: ${feedbackId}`);
        const feedback = feedbackEntries.find(f => f.feedbackId === feedbackId);
        if (!feedback) {
            showMessageBox('Error', 'Feedback entry not found for editing.', 'alert');
            return;
        }

        openSubmitFeedbackModal();
        editFeedbackIdInput.value = feedbackId; // Set hidden ID for edit

        document.getElementById('feedback-customer-id').value = feedback.customerId || '';
        document.getElementById('feedback-type').value = feedback.type;
        document.getElementById('feedback-message').value = feedback.message;
        document.getElementById('feedback-rating').value = feedback.rating !== null ? feedback.rating : '';
        document.getElementById('feedback-nps').value = feedback.npsScore !== null ? feedback.npsScore : '';
    }


    window.editLoyalty = function(customerId) { // Made global
        console.log(`Editing loyalty for customer: ${customerId}`);
        const loyaltyItem = loyaltyData.find(item => item.customerId === customerId);
        if (!loyaltyItem) {
            showMessageBox('Error', 'Loyalty data not found for editing.', 'alert');
            return;
        }

        openManageRewardsModal();
        editLoyaltyCustomerIdInput.value = customerId; // Set hidden ID for edit

        document.getElementById('reward-customer-id').value = loyaltyItem.customerId;
        document.getElementById('reward-customer-id').disabled = true; // Prevent changing customer ID for editing
        document.getElementById('reward-type').value = loyaltyItem.personalizedOffers[0]?.type || 'Points'; // Default to points for editing, user can change
        document.getElementById('reward-value').value = loyaltyItem.personalizedOffers[0]?.value || loyaltyItem.points; // Populate with current points as an example
        document.getElementById('reward-description').value = loyaltyItem.personalizedOffers[0]?.description || `Current Points: ${loyaltyItem.points}, LTV: ₹${loyaltyItem.lifetimeValue.toFixed(2)}, Churn Risk: ${loyaltyItem.churnRisk}`;
    }


    // --- Delete Functions ---

    window.deleteCustomer = function(customerId) { // Made global
        showMessageBox('Confirm Deletion', `Are you sure you want to delete customer ${customerId}? This will also delete related interactions, tickets, feedback, and loyalty data.`, 'confirm', (result) => {
            if (result) {
                customers = customers.filter(c => c.customerId !== customerId);
                interactions = interactions.filter(i => i.customerId !== customerId);
                supportTickets = supportTickets.filter(t => t.customerId !== customerId);
                feedbackEntries = feedbackEntries.filter(f => f.customerId !== customerId);
                loyaltyData = loyaltyData.filter(l => l.customerId !== customerId);

                renderCustomers();
                renderInteractions();
                renderSupportTickets();
                renderFeedbackEntries();
                renderLoyaltyData();
                showMessageBox('Success', 'Customer and related data deleted.', 'alert');
            }
        });
    }

    window.deleteInteraction = function(interactionId) { // Made global
        showMessageBox('Confirm Deletion', `Are you sure you want to delete interaction ${interactionId}?`, 'confirm', (result) => {
            if (result) {
                interactions = interactions.filter(i => i.interactionId !== interactionId);
                renderInteractions();
                showMessageBox('Success', 'Interaction deleted.', 'alert');
            }
        });
    }

    window.deleteSupportTicket = function(ticketId) { // Made global
        showMessageBox('Confirm Deletion', `Are you sure you want to delete support ticket ${ticketId}?`, 'confirm', (result) => {
            if (result) {
                supportTickets = supportTickets.filter(t => t.ticketId !== ticketId);
                renderSupportTickets();
                showMessageBox('Success', 'Support ticket deleted.', 'alert');
            }
        });
    }

    window.deleteFeedback = function(feedbackId) { // Made global
        showMessageBox('Confirm Deletion', `Are you sure you want to delete feedback entry ${feedbackId}?`, 'confirm', (result) => {
            if (result) {
                const deletedFeedback = feedbackEntries.find(f => f.feedbackId === feedbackId);
                feedbackEntries = feedbackEntries.filter(f => f.feedbackId !== feedbackId);

                // Re-calculate customer feedback score if the deleted feedback belonged to a customer
                if (deletedFeedback && deletedFeedback.customerId) {
                    const customerIndex = customers.findIndex(c => c.customerId === deletedFeedback.customerId);
                    if (customerIndex !== -1) {
                        const customerFeedbacks = feedbackEntries.filter(f => f.customerId === deletedFeedback.customerId && f.rating !== null);
                        const totalRating = customerFeedbacks.reduce((sum, f) => sum + f.rating, 0);
                        customers[customerIndex].feedbackScore = customerFeedbacks.length > 0 ? (totalRating / customerFeedbacks.length).toFixed(1) : null;
                        renderCustomers();
                    }
                }

                renderFeedbackEntries();
                showMessageBox('Success', 'Feedback entry deleted.', 'alert');
            }
        });
    }

    window.deleteLoyalty = function(customerId) { // Made global
        showMessageBox('Confirm Deletion', `Are you sure you want to delete loyalty data for customer ${customerId}?`, 'confirm', (result) => {
            if (result) {
                loyaltyData = loyaltyData.filter(l => l.customerId !== customerId);
                // Optionally reset loyalty tier in customer object if loyalty data is deleted
                const customer = customers.find(c => c.customerId === customerId);
                if (customer) {
                    customer.loyaltyTier = 'None';
                    renderCustomers();
                }
                renderLoyaltyData();
                showMessageBox('Success', 'Loyalty data deleted.', 'alert');
            }
        });
    }


    // --- Chart Update Functions ---
    function updateInteractionChart() {
        if (!interactionTrendChartCanvas) return;

        if (interactionTrendChartInstance) {
            interactionTrendChartInstance.destroy();
        }

        const interactionCounts = {};
        interactions.forEach(interaction => {
            interactionCounts[interaction.interactionType] = (interactionCounts[interaction.interactionType] || 0) + 1;
        });

        const labels = Object.keys(interactionCounts);
        const data = Object.values(interactionCounts);
        const backgroundColors = [
            'rgba(108, 92, 231, 0.6)', // Purple
            'rgba(54, 162, 235, 0.6)', // Blue
            'rgba(255, 206, 86, 0.6)', // Yellow
            'rgba(75, 192, 192, 0.6)', // Green
            'rgba(153, 102, 255, 0.6)', // Light Purple
            'rgba(255, 159, 64, 0.6)' // Orange
        ];

        interactionTrendChartInstance = new Chart(interactionTrendChartCanvas, {
            type: 'pie', // Pie chart for distribution
            data: {
                labels: labels,
                datasets: [{
                    label: 'Interactions by Type',
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 20
                        }
                    },
                    title: {
                        display: true,
                        text: 'Customer Interactions by Type'
                    }
                }
            }
        });
    }

    function updateSupportMetricsChart() {
        const ctx = document.getElementById('support-metrics-chart');
        if (!ctx) return; // Ensure canvas exists

        const statusCounts = supportTickets.reduce((acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(statusCounts);
        const data = Object.values(statusCounts);

        if (supportMetricsChartInstance) {
            supportMetricsChartInstance.data.labels = labels;
            supportMetricsChartInstance.data.datasets[0].data = data;
            supportMetricsChartInstance.update();
        } else {
            supportMetricsChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Tickets by Status',
                        data: data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)', // Open
                            'rgba(54, 162, 235, 0.6)', // In Progress
                            'rgba(75, 192, 192, 0.6)', // Resolved
                            'rgba(153, 102, 255, 0.6)' // Closed
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0 // Ensure integer ticks for counts
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Support Tickets by Status'
                        },
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    function updateFeedbackTrendChart() {
        const ctx = document.getElementById('feedback-trend-chart');
        if (!ctx) return;

        // Example: Feedback by Rating distribution
        const ratingCounts = feedbackEntries.reduce((acc, entry) => {
            if (entry.rating) {
                acc[entry.rating] = (acc[entry.rating] || 0) + 1;
            }
            return acc;
        }, {});

        const labels = ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'];
        const data = labels.map((_, index) => ratingCounts[index + 1] || 0);

        if (feedbackTrendChartInstance) {
            feedbackTrendChartInstance.data.labels = labels;
            feedbackTrendChartInstance.data.datasets[0].data = data;
            feedbackTrendChartInstance.update();
        } else {
            feedbackTrendChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Feedback by Rating',
                        data: data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(255, 159, 64, 0.6)',
                            'rgba(255, 205, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(54, 162, 235, 0.6)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(255, 205, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(54, 162, 235, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Customer Feedback Ratings'
                        },
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }
    }

    function updateLoyaltyEngagementChart() {
        const ctx = document.getElementById('loyalty-engagement-chart');
        if (!ctx) return;

        const tierCounts = loyaltyData.reduce((acc, item) => {
            acc[item.loyaltyTier] = (acc[item.loyaltyTier] || 0) + 1;
            return acc;
        }, {});

        const labels = ['None', 'Bronze', 'Silver', 'Gold'];
        const data = labels.map(tier => tierCounts[tier] || 0);

        if (loyaltyEngagementChartInstance) {
            loyaltyEngagementChartInstance.data.labels = labels;
            loyaltyEngagementChartInstance.data.datasets[0].data = data;
            loyaltyEngagementChartInstance.update();
        } else {
            loyaltyEngagementChartInstance = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Customers by Loyalty Tier',
                        data: data,
                        backgroundColor: [
                            'rgba(201, 203, 207, 0.6)', // None
                            'rgba(166, 108, 0, 0.6)',   // Bronze
                            'rgba(192, 192, 192, 0.6)', // Silver
                            'rgba(255, 215, 0, 0.6)'    // Gold
                        ],
                        borderColor: [
                            'rgba(201, 203, 207, 1)',
                            'rgba(166, 108, 0, 1)',
                            'rgba(192, 192, 192, 1)',
                            'rgba(255, 215, 0, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Customer Distribution by Loyalty Tier'
                        },
                        legend: {
                            position: 'left',
                        }
                    }
                }
            });
        }
    }

    function updateKpiDashboardChart() {
        const ctx = document.getElementById('kpi-dashboard-chart');
        if (!ctx) return;

        if (kpiDashboardChartInstance) { // Destroy existing chart if it exists
            kpiDashboardChartInstance.destroy();
        }

        // Example KPIs
        const totalCustomers = customers.length;
        const totalInteractions = interactions.length;
        const openTickets = supportTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
        const avgCsatScore = feedbackEntries.filter(f => f.rating !== null).reduce((sum, f) => sum + f.rating, 0) /
                                    (feedbackEntries.filter(f => f.rating !== null).length || 1); // Avoid division by zero
        const avgNpsScore = feedbackEntries.filter(f => f.npsScore !== null).reduce((sum, f) => sum + f.npsScore, 0) /
                                    (feedbackEntries.filter(f => f.npsScore !== null).length || 1); // Avoid division by zero

        const labels = ['Total Customers', 'Total Interactions', 'Open Tickets', 'Avg. CSAT', 'Avg. NPS'];
        const data = [
            totalCustomers,
            totalInteractions,
            openTickets,
            parseFloat(avgCsatScore.toFixed(1)), // Ensure numbers for chart
            parseFloat(avgNpsScore.toFixed(1))
        ];

        kpiDashboardChartInstance = new Chart(ctx, {
            type: 'radar', // Radar chart for multiple KPIs
            data: {
                labels: labels,
                datasets: [{
                    label: 'CRM Key Performance Indicators',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.4)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        angleLines: {
                            display: false
                        },
                        pointLabels: {
                            font: {
                                size: 12
                            }
                        },
                        ticks: {
                            backdropColor: 'rgba(0, 0, 0, 0)', // Make ticks transparent
                            color: 'black', // Color of the tick labels
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Real-Time CRM KPIs'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    function updateAllCharts() {
        updateInteractionChart();
        updateSupportMetricsChart();
        updateFeedbackTrendChart();
        updateLoyaltyEngagementChart();
        updateKpiDashboardChart();
    }

    // --- Section Navigation ---
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const targetSectionId = button.dataset.section;

            // Deactivate all sections and buttons
            document.querySelectorAll('section').forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
            });
            document.querySelectorAll('.nav-button').forEach(btn => {
                btn.classList.remove('active');
            });

            // Activate the selected section and button
            document.getElementById(targetSectionId).style.display = 'block';
            document.getElementById(targetSectionId).classList.add('active');
            button.classList.add('active');

            // Re-render data for the newly active section to apply any filters/sorting
            if (targetSectionId === 'customer-database-section') renderCustomers();
            if (targetSectionId === 'interaction-tracking-section') renderInteractions();
            if (targetSectionId === 'support-help-desk-section') renderSupportTickets();
            if (targetSectionId === 'feedback-analytics-section') renderFeedbackEntries();
            if (targetSectionId === 'loyalty-retention-section') renderLoyaltyData();
            if (targetSectionId === 'crm-wide-features-section') updateAllCharts(); // Update charts when KPI section is active
        });
    });


    // --- Initial Render and Setup ---
    // Ensure initial render happens after DOM is fully loaded
    renderCustomers(); // Render default active section (Customer Database)
    updateAllCharts(); // Render all charts initially

    // Set initial active navigation button and section
    // Find the first nav button and simulate a click to set initial active state
    const firstNavButton = document.querySelector('.qc-navigation .nav-button');
    if (firstNavButton) {
        firstNavButton.click();
    }
});
