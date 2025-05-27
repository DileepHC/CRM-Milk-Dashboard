// customer-relations.js

// --- In-memory Data Storage ---
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

// Function to format date to YYYY-MM-DD
function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return ''; // Return empty string for invalid dates
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
}

function openAddCustomerModal() { openModal('add-customer-modal'); }
function closeAddCustomerModal() { closeModal('add-customer-modal'); }

function openAddInteractionModal() { openModal('add-interaction-modal'); }
function closeAddInteractionModal() { closeModal('add-interaction-modal'); }

function openCreateTicketModal() { openModal('create-ticket-modal'); }
function closeCreateTicketModal() { closeModal('create-ticket-modal'); }

function openSubmitFeedbackModal() { openModal('submit-feedback-modal'); }
function closeSubmitFeedbackModal() { closeModal('submit-feedback-modal'); }

function openManageRewardsModal() { openModal('manage-rewards-modal'); }
function closeManageRewardsModal() { closeModal('manage-rewards-modal'); }

function openLanguageSettingsModal() { openModal('language-settings-modal'); }
function closeLanguageSettingsModal() { closeModal('language-settings-modal'); }

function openAccessControlModal() { openModal('access-control-modal'); }
function closeAccessControlModal() { closeModal('access-control-modal'); }

function openDataImportExportModal() { openModal('data-import-export-modal'); }
function closeDataImportExportModal() { closeModal('data-import-export-modal'); }

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
    let errorElement = inputElement.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    }
    errorElement.textContent = message;
    inputElement.classList.add('invalid');
}

function clearValidationError(inputElement) {
    inputElement.classList.remove('invalid');
    const errorElement = inputElement.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
}

function clearValidationErrors(form) {
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
}

// --- Render Functions for Tables ---

function renderCustomers() {
    const tableBody = document.getElementById('customer-table-body');
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
        row.insertCell().textContent = customer.feedbackScore || 'N/A';
        row.insertCell().textContent = customer.kycUploads ? 'Uploaded' : 'No'; // Simple indicator
        row.insertCell().textContent = customer.behavioralSegmentation;
        row.insertCell().textContent = customer.aiTags;

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editButton.classList.add('action-icon-button', 'edit-button');
        editButton.onclick = () => editCustomer(customer.customerId);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        deleteButton.classList.add('action-icon-button', 'delete-button');
        deleteButton.onclick = () => deleteCustomer(customer.customerId);
        actionsCell.appendChild(deleteButton);
    });
    saveData();
}

function renderInteractions() {
    const tableBody = document.getElementById('interaction-table-body');
    tableBody.innerHTML = '';

    const currentFilters = getCurrentFilters('interaction-table');
    const filteredInteractions = interactions.filter(interaction => {
        return Object.keys(currentFilters).every(column => {
            const filterValue = currentFilters[column].toLowerCase();
            let cellValue;
            if (column.includes('Date')) { // Handle date filtering
                cellValue = formatDate(interaction[column]).toLowerCase();
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
        row.insertCell().textContent = formatDate(interaction.followUpDate);

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editButton.classList.add('action-icon-button', 'edit-button');
        editButton.onclick = () => editInteraction(interaction.interactionId);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        deleteButton.classList.add('action-icon-button', 'delete-button');
        deleteButton.onclick = () => deleteInteraction(interaction.interactionId);
        actionsCell.appendChild(deleteButton);
    });
    saveData();
}

function renderSupportTickets() {
    const tableBody = document.getElementById('support-ticket-table-body');
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
        row.insertCell().textContent = formatDate(ticket.slaDueDate);
        row.insertCell().textContent = ticket.resolutionDate ? formatDate(ticket.resolutionDate) : 'Pending';
        row.insertCell().textContent = ticket.csatScore || 'N/A';

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editButton.classList.add('action-icon-button', 'edit-button');
        editButton.onclick = () => editSupportTicket(ticket.ticketId);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        deleteButton.classList.add('action-icon-button', 'delete-button');
        deleteButton.onclick = () => deleteSupportTicket(ticket.ticketId);
        actionsCell.appendChild(deleteButton);
    });
    saveData();
    updateSupportMetricsChart();
}

function renderFeedbackEntries() {
    const tableBody = document.getElementById('feedback-table-body');
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
        row.insertCell().textContent = feedback.rating || 'N/A';
        row.insertCell().textContent = feedback.npsScore || 'N/A';
        row.insertCell().textContent = feedback.classifierTags || 'N/A';

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editButton.classList.add('action-icon-button', 'edit-button');
        editButton.onclick = () => editFeedback(feedback.feedbackId);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        deleteButton.classList.add('action-icon-button', 'delete-button');
        deleteButton.onclick = () => deleteFeedback(feedback.feedbackId);
        actionsCell.appendChild(deleteButton);
    });
    saveData();
    updateFeedbackTrendChart();
}

function renderLoyaltyData() {
    const tableBody = document.getElementById('loyalty-table-body');
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
        row.insertCell().textContent = item.personalizedOffers;

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editButton.classList.add('action-icon-button', 'edit-button');
        editButton.onclick = () => editLoyalty(item.customerId);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        deleteButton.classList.add('action-icon-button', 'delete-button');
        deleteButton.onclick = () => deleteLoyalty(item.customerId);
        actionsCell.appendChild(deleteButton);
    });
    saveData();
    updateLoyaltyEngagementChart();
}

// --- Form Submission Handlers ---

document.getElementById('add-customer-form').addEventListener('submit', function(event) {
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
        return; // Stop form submission if validation fails
    }

    const newCustomer = {
        customerId: generateUniqueId('CUST', 12),
        name: nameInput.value.trim(),
        contact: contactInput.value.trim(),
        location: locationInput.value.trim(),
        purchaseHistory: 'No recent purchases', // Placeholder
        preferences: preferencesInput.value.trim(),
        loyaltyTier: loyaltyTierInput.value,
        feedbackScore: null, // Initial value
        kycUploads: kycUploadsInput.files.length > 0, // Simple boolean check
        behavioralSegmentation: behavioralSegmentationInput.value.trim(),
        aiTags: 'New Customer' // Placeholder for AI tagging
    };

    customers.push(newCustomer);
    renderCustomers();
    closeAddCustomerModal();
    alert('Customer added successfully!');
});


document.getElementById('add-interaction-form').addEventListener('submit', function(event) {
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

    // Validate Customer ID
    if (!customerIdInput.value.trim()) {
        showValidationError(customerIdInput, 'Customer ID is required.');
        isValid = false;
    } else if (!/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) {
        showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters.');
        isValid = false;
    } else {
        clearValidationError(customerIdInput);
    }

    // Validate Date
    if (!dateInput.value) {
        showValidationError(dateInput, 'Date is required.');
        isValid = false;
    } else {
        clearValidationError(dateInput);
    }

    // Validate Type
    if (!typeInput.value) {
        showValidationError(typeInput, 'Interaction Type is required.');
        isValid = false;
    } else {
        clearValidationError(typeInput);
    }

    // Validate Category
    if (!categoryInput.value) {
        showValidationError(categoryInput, 'Category is required.');
        isValid = false;
    } else {
        clearValidationError(categoryInput);
    }

    // Validate Description
    if (!descriptionInput.value.trim()) {
        showValidationError(descriptionInput, 'Description is required.');
        isValid = false;
    } else {
        clearValidationError(descriptionInput);
    }

    if (!isValid) {
        return;
    }

    const newInteraction = {
        interactionId: generateUniqueId('INT', 10),
        customerId: customerIdInput.value.trim(),
        interactionDate: dateInput.value,
        interactionType: typeInput.value,
        category: categoryInput.value,
        description: descriptionInput.value.trim(),
        sentiment: sentimentInput.value,
        channel: channelInput.value.trim() || 'N/A',
        assignedTo: assignedToInput.value.trim() || 'Unassigned',
        followUpDate: followUpDateInput.value || null
    };

    interactions.push(newInteraction);
    renderInteractions();
    closeAddInteractionModal();
    alert('Interaction logged successfully!');
});

document.getElementById('create-ticket-form').addEventListener('submit', function(event) {
    event.preventDefault();
    clearValidationErrors(this);

    const customerIdInput = document.getElementById('ticket-customer-id');
    const subjectInput = document.getElementById('ticket-subject');
    const descriptionInput = document.getElementById('ticket-description');
    const priorityInput = document.getElementById('ticket-priority');
    const assignedToInput = document.getElementById('ticket-assigned-to');
    const slaDueDateInput = document.getElementById('ticket-sla-due-date');

    let isValid = true;

    // Validate Customer ID
    if (!customerIdInput.value.trim()) {
        showValidationError(customerIdInput, 'Customer ID is required.');
        isValid = false;
    } else if (!/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) {
        showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters.');
        isValid = false;
    } else {
        clearValidationError(customerIdInput);
    }

    // Validate Subject
    if (!subjectInput.value.trim()) {
        showValidationError(subjectInput, 'Subject is required.');
        isValid = false;
    } else if (subjectInput.value.trim().length > 100) {
        showValidationError(subjectInput, 'Subject cannot exceed 100 characters.');
        isValid = false;
    } else {
        clearValidationError(subjectInput);
    }

    // Validate Description
    if (!descriptionInput.value.trim()) {
        showValidationError(descriptionInput, 'Description is required.');
        isValid = false;
    } else {
        clearValidationError(descriptionInput);
    }

    if (!isValid) {
        return;
    }

    const newTicket = {
        ticketId: generateUniqueId('TKT', 8),
        customerId: customerIdInput.value.trim(),
        subject: subjectInput.value.trim(),
        description: descriptionInput.value.trim(),
        status: 'Open', // Default status
        priority: priorityInput.value,
        assignedTo: assignedToInput.value.trim() || 'Unassigned',
        createdDate: new Date().toISOString().split('T')[0], // Current date
        slaDueDate: slaDueDateInput.value || null,
        resolutionDate: null,
        csatScore: null
    };

    supportTickets.push(newTicket);
    renderSupportTickets();
    closeCreateTicketModal();
    alert('Support ticket created successfully!');
});

document.getElementById('submit-feedback-form').addEventListener('submit', function(event) {
    event.preventDefault();
    clearValidationErrors(this);

    const customerIdInput = document.getElementById('feedback-customer-id');
    const feedbackTypeInput = document.getElementById('feedback-type');
    const messageInput = document.getElementById('feedback-message');
    const ratingInput = document.getElementById('feedback-rating');
    const npsInput = document.getElementById('feedback-nps');

    let isValid = true;

    // Validate Customer ID (optional, but if filled, validate format)
    if (customerIdInput.value.trim() && !/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) {
        showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters or left empty.');
        isValid = false;
    } else {
        clearValidationError(customerIdInput);
    }

    // Validate Feedback Type
    if (!feedbackTypeInput.value) {
        showValidationError(feedbackTypeInput, 'Feedback Type is required.');
        isValid = false;
    } else {
        clearValidationError(feedbackTypeInput);
    }

    // Validate Message
    if (!messageInput.value.trim()) {
        showValidationError(messageInput, 'Feedback message is required.');
        isValid = false;
    } else {
        clearValidationError(messageInput);
    }

    // Validate Rating (if filled)
    if (ratingInput.value && (ratingInput.value < 1 || ratingInput.value > 5)) {
        showValidationError(ratingInput, 'Rating must be between 1 and 5.');
        isValid = false;
    } else {
        clearValidationError(ratingInput);
    }

    // Validate NPS (if filled)
    if (npsInput.value && (npsInput.value < 0 || npsInput.value > 10)) {
        showValidationError(npsInput, 'NPS must be between 0 and 10.');
        isValid = false;
    } else {
        clearValidationError(npsInput);
    }

    if (!isValid) {
        return;
    }

    const newFeedback = {
        feedbackId: generateUniqueId('FB', 7),
        customerId: customerIdInput.value.trim() || null,
        feedbackDate: new Date().toISOString().split('T')[0],
        type: feedbackTypeInput.value,
        message: messageInput.value.trim(),
        rating: ratingInput.value ? parseInt(ratingInput.value) : null,
        npsScore: npsInput.value ? parseInt(npsInput.value) : null,
        classifierTags: 'Auto-tagged' // Placeholder for AI tagging
    };

    feedbackEntries.push(newFeedback);
    renderFeedbackEntries();

    // Update customer feedback score if customer ID is provided
    if (newFeedback.customerId) {
        const customerIndex = customers.findIndex(c => c.customerId === newFeedback.customerId);
        if (customerIndex !== -1) {
            // Simple average for demonstration, a real system would be more complex
            const customerFeedbacks = feedbackEntries.filter(f => f.customerId === newFeedback.customerId && f.rating !== null);
            const totalRating = customerFeedbacks.reduce((sum, f) => sum + f.rating, 0);
            customers[customerIndex].feedbackScore = (totalRating / customerFeedbacks.length).toFixed(1);
            renderCustomers(); // Re-render customer table to reflect score change
        }
    }

    closeSubmitFeedbackModal();
    alert('Feedback submitted successfully!');
});

document.getElementById('manage-rewards-form').addEventListener('submit', function(event) {
    event.preventDefault();
    clearValidationErrors(this);

    const customerIdInput = document.getElementById('reward-customer-id');
    const rewardTypeInput = document.getElementById('reward-type');
    const rewardValueInput = document.getElementById('reward-value');
    const rewardDescriptionInput = document.getElementById('reward-description');

    let isValid = true;

    // Validate Customer ID
    if (!customerIdInput.value.trim()) {
        showValidationError(customerIdInput, 'Customer ID is required.');
        isValid = false;
    } else if (!/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) {
        showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters.');
        isValid = false;
    } else if (!customers.some(c => c.customerId === customerIdInput.value.trim())) {
        showValidationError(customerIdInput, 'Customer ID does not exist.');
        isValid = false;
    } else {
        clearValidationError(customerIdInput);
    }

    // Validate Reward Type
    if (!rewardTypeInput.value) {
        showValidationError(rewardTypeInput, 'Reward Type is required.');
        isValid = false;
    } else {
        clearValidationError(rewardTypeInput);
    }

    // Validate Reward Value
    if (rewardValueInput.value === '' || isNaN(rewardValueInput.value) || parseFloat(rewardValueInput.value) < 0) {
        showValidationError(rewardValueInput, 'Valid positive reward value is required.');
        isValid = false;
    } else {
        clearValidationError(rewardValueInput);
    }

    if (!isValid) {
        return;
    }

    const customerId = customerIdInput.value.trim();
    const rewardType = rewardTypeInput.value;
    const rewardValue = parseFloat(rewardValueInput.value);
    const rewardDescription = rewardDescriptionInput.value.trim();

    // Find or create loyalty entry for the customer
    let loyaltyEntry = loyaltyData.find(item => item.customerId === customerId);
    if (!loyaltyEntry) {
        // Find customer details to initialize loyalty entry
        const customer = customers.find(c => c.customerId === customerId);
        loyaltyEntry = {
            customerId: customerId,
            loyaltyTier: customer ? customer.loyaltyTier : 'None', // Inherit from customer or default
            points: 0,
            lifetimeValue: 0,
            rewardUsage: 0,
            churnRisk: 'Low', // Default
            personalizedOffers: []
        };
        loyaltyData.push(loyaltyEntry);
    }

    // Apply the reward
    if (rewardType === 'Points') {
        loyaltyEntry.points += rewardValue;
    } else if (rewardType === 'Cashback' || rewardType === 'Discount') {
        loyaltyEntry.lifetimeValue += rewardValue; // Assuming cashback/discount adds to LTV for tracking
        loyaltyEntry.rewardUsage += rewardValue;
    }
    // For 'Gift' or other types, you might just log them or increment a counter
    loyaltyEntry.personalizedOffers.push({ type: rewardType, value: rewardValue, description: rewardDescription, date: new Date().toISOString().split('T')[0] });

    // Update customer's loyalty tier if points or LTV thresholds are met (simplified logic)
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
    alert(`Reward "${rewardType}" with value ${rewardValue} applied successfully to ${customerId}!`);
});


// --- Edit Functions (Populate Modals for Editing) ---

function editCustomer(customerId) {
    const customer = customers.find(c => c.customerId === customerId);
    if (!customer) {
        alert('Customer not found for editing.');
        return;
    }

    openAddCustomerModal(); // Use the same modal for adding/editing

    document.getElementById('customer-name').value = customer.name;
    document.getElementById('customer-contact').value = customer.contact;
    document.getElementById('customer-location').value = customer.location;
    document.getElementById('customer-preferences').value = customer.preferences;
    document.getElementById('customer-loyalty-tier').value = customer.loyaltyTier;
    document.getElementById('customer-behavioral-segmentation').value = customer.behavioralSegmentation;

    // Change form submit to update
    const form = document.getElementById('add-customer-form');
    form.onsubmit = function(event) {
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
        if (!nameInput.value.trim()) { showValidationError(nameInput, 'Customer Name is required.'); isValid = false; } else { clearValidationError(nameInput); }
        if (!/^[6-9]{1}[0-9]{9}$/.test(contactInput.value.trim())) { showValidationError(contactInput, 'Contact number must be 10 digits and start with 6-9.'); isValid = false; } else { clearValidationError(contactInput); }
        if (!locationInput.value.trim()) { showValidationError(locationInput, 'Location is required.'); isValid = false; } else { clearValidationError(locationInput); }
        if (nameInput.value.trim().length > 50) { showValidationError(nameInput, 'Customer Name cannot exceed 50 characters.'); isValid = false; } else { clearValidationError(nameInput); }

        if (!isValid) return;

        customer.name = nameInput.value.trim();
        customer.contact = contactInput.value.trim();
        customer.location = locationInput.value.trim();
        customer.preferences = preferencesInput.value.trim();
        customer.loyaltyTier = loyaltyTierInput.value;
        customer.kycUploads = kycUploadsInput.files.length > 0 || customer.kycUploads; // Retain existing if no new upload
        customer.behavioralSegmentation = behavioralSegmentationInput.value.trim();

        renderCustomers();
        closeAddCustomerModal();
        alert('Customer updated successfully!');
        // Reset form submit handler to original add function
        form.onsubmit = null; // Remove the temporary handler
        document.getElementById('add-customer-form').addEventListener('submit', arguments.callee.caller); // Re-attach original listener (careful with 'arguments.callee.caller' in strict mode, better to re-add the named function if it exists)
        attachFormSubmitHandlers(); // A safer way to re-attach all handlers
    };
}


function editInteraction(interactionId) {
    const interaction = interactions.find(i => i.interactionId === interactionId);
    if (!interaction) {
        alert('Interaction not found for editing.');
        return;
    }

    openAddInteractionModal();

    document.getElementById('interaction-customer-id').value = interaction.customerId;
    document.getElementById('interaction-date').value = interaction.interactionDate;
    document.getElementById('interaction-type').value = interaction.interactionType;
    document.getElementById('interaction-category').value = interaction.category;
    document.getElementById('interaction-description').value = interaction.description;
    document.getElementById('interaction-sentiment').value = interaction.sentiment;
    document.getElementById('interaction-channel').value = interaction.channel;
    document.getElementById('interaction-assigned-to').value = interaction.assignedTo;
    document.getElementById('interaction-follow-up-date').value = interaction.followUpDate;

    const form = document.getElementById('add-interaction-form');
    form.onsubmit = function(event) {
        event.preventDefault();
        clearValidationErrors(this);

        const customerIdInput = document.getElementById('interaction-customer-id');
        const dateInput = document.getElementById('interaction-date');
        const typeInput = document.getElementById('interaction-type');
        const categoryInput = document.getElementById('interaction-category');
        const descriptionInput = document.getElementById('interaction-description');

        let isValid = true;
        if (!customerIdInput.value.trim()) { showValidationError(customerIdInput, 'Customer ID is required.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!dateInput.value) { showValidationError(dateInput, 'Date is required.'); isValid = false; } else { clearValidationError(dateInput); }
        if (!typeInput.value) { showValidationError(typeInput, 'Interaction Type is required.'); isValid = false; } else { clearValidationError(typeInput); }
        if (!categoryInput.value) { showValidationError(categoryInput, 'Category is required.'); isValid = false; } else { clearValidationError(categoryInput); }
        if (!descriptionInput.value.trim()) { showValidationError(descriptionInput, 'Description is required.'); isValid = false; } else { clearValidationError(descriptionInput); }

        if (!isValid) return;

        interaction.customerId = customerIdInput.value.trim();
        interaction.interactionDate = dateInput.value;
        interaction.interactionType = typeInput.value;
        interaction.category = categoryInput.value;
        interaction.description = descriptionInput.value.trim();
        interaction.sentiment = sentimentInput.value;
        interaction.channel = channelInput.value.trim();
        interaction.assignedTo = assignedToInput.value.trim();
        interaction.followUpDate = followUpDateInput.value;

        renderInteractions();
        closeAddInteractionModal();
        alert('Interaction updated successfully!');
        form.onsubmit = null;
        attachFormSubmitHandlers();
    };
}


function editSupportTicket(ticketId) {
    const ticket = supportTickets.find(t => t.ticketId === ticketId);
    if (!ticket) {
        alert('Support ticket not found for editing.');
        return;
    }

    openCreateTicketModal(); // Use the same modal

    document.getElementById('ticket-customer-id').value = ticket.customerId;
    document.getElementById('ticket-subject').value = ticket.subject;
    document.getElementById('ticket-description').value = ticket.description;
    document.getElementById('ticket-priority').value = ticket.priority;
    document.getElementById('ticket-assigned-to').value = ticket.assignedTo;
    document.getElementById('ticket-sla-due-date').value = ticket.slaDueDate;

    // For editing, you might want to add status and resolution date fields to the modal
    // For simplicity, let's assume status and resolution can be updated separately or through other workflows.
    // Here, we just add them to the form for demonstration.
    let statusField = document.getElementById('ticket-status');
    if (!statusField) {
        const priorityDiv = document.getElementById('ticket-priority').closest('.form-group');
        statusField = document.createElement('div');
        statusField.classList.add('form-group');
        statusField.innerHTML = `
            <label for="ticket-status">Status:</label>
            <select id="ticket-status" name="status">
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
            </select>
        `;
        priorityDiv.parentNode.insertBefore(statusField, priorityDiv.nextSibling);

        const resolutionDateField = document.createElement('div');
        resolutionDateField.classList.add('form-group');
        resolutionDateField.innerHTML = `
            <label for="ticket-resolution-date">Resolution Date:</label>
            <input type="date" id="ticket-resolution-date" name="resolution-date"/>
        `;
        statusField.parentNode.insertBefore(resolutionDateField, statusField.nextSibling);

        const csatScoreField = document.createElement('div');
        csatScoreField.classList.add('form-group');
        csatScoreField.innerHTML = `
            <label for="ticket-csat-score">CSAT Score (1-5):</label>
            <input type="number" id="ticket-csat-score" name="csat-score" min="1" max="5" step="1"/>
        `;
        resolutionDateField.parentNode.insertBefore(csatScoreField, resolutionDateField.nextSibling);
    }
    document.getElementById('ticket-status').value = ticket.status;
    document.getElementById('ticket-resolution-date').value = ticket.resolutionDate;
    document.getElementById('ticket-csat-score').value = ticket.csatScore;


    const form = document.getElementById('create-ticket-form');
    form.onsubmit = function(event) {
        event.preventDefault();
        clearValidationErrors(this);

        const customerIdInput = document.getElementById('ticket-customer-id');
        const subjectInput = document.getElementById('ticket-subject');
        const descriptionInput = document.getElementById('ticket-description');

        let isValid = true;
        if (!customerIdInput.value.trim()) { showValidationError(customerIdInput, 'Customer ID is required.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!subjectInput.value.trim()) { showValidationError(subjectInput, 'Subject is required.'); isValid = false; } else { clearValidationError(subjectInput); }
        if (subjectInput.value.trim().length > 100) { showValidationError(subjectInput, 'Subject cannot exceed 100 characters.'); isValid = false; } else { clearValidationError(subjectInput); }
        if (!descriptionInput.value.trim()) { showValidationError(descriptionInput, 'Description is required.'); isValid = false; } else { clearValidationError(descriptionInput); }

        if (!isValid) return;

        ticket.customerId = customerIdInput.value.trim();
        ticket.subject = subjectInput.value.trim();
        ticket.description = descriptionInput.value.trim();
        ticket.priority = document.getElementById('ticket-priority').value;
        ticket.assignedTo = document.getElementById('ticket-assigned-to').value.trim();
        ticket.slaDueDate = document.getElementById('ticket-sla-due-date').value;
        ticket.status = document.getElementById('ticket-status').value;
        ticket.resolutionDate = document.getElementById('ticket-resolution-date').value || null;
        ticket.csatScore = document.getElementById('ticket-csat-score').value ? parseInt(document.getElementById('ticket-csat-score').value) : null;

        renderSupportTickets();
        closeCreateTicketModal();
        alert('Support ticket updated successfully!');
        form.onsubmit = null;
        // Clean up the dynamically added fields if they were added
        if (statusField) {
            statusField.remove();
            document.getElementById('ticket-resolution-date').parentNode.remove(); // Assuming it's in a div added right after statusField
            document.getElementById('ticket-csat-score').parentNode.remove();
        }
        attachFormSubmitHandlers();
    };
}


function editFeedback(feedbackId) {
    const feedback = feedbackEntries.find(f => f.feedbackId === feedbackId);
    if (!feedback) {
        alert('Feedback entry not found for editing.');
        return;
    }

    openSubmitFeedbackModal();

    document.getElementById('feedback-customer-id').value = feedback.customerId || '';
    document.getElementById('feedback-type').value = feedback.type;
    document.getElementById('feedback-message').value = feedback.message;
    document.getElementById('feedback-rating').value = feedback.rating || '';
    document.getElementById('feedback-nps').value = feedback.npsScore || '';

    const form = document.getElementById('submit-feedback-form');
    form.onsubmit = function(event) {
        event.preventDefault();
        clearValidationErrors(this);

        const customerIdInput = document.getElementById('feedback-customer-id');
        const feedbackTypeInput = document.getElementById('feedback-type');
        const messageInput = document.getElementById('feedback-message');
        const ratingInput = document.getElementById('feedback-rating');
        const npsInput = document.getElementById('feedback-nps');

        let isValid = true;
        if (customerIdInput.value.trim() && !/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters or left empty.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!feedbackTypeInput.value) { showValidationError(feedbackTypeInput, 'Feedback Type is required.'); isValid = false; } else { clearValidationError(feedbackTypeInput); }
        if (!messageInput.value.trim()) { showValidationError(messageInput, 'Feedback message is required.'); isValid = false; } else { clearValidationError(messageInput); }
        if (ratingInput.value && (ratingInput.value < 1 || ratingInput.value > 5)) { showValidationError(ratingInput, 'Rating must be between 1 and 5.'); isValid = false; } else { clearValidationError(ratingInput); }
        if (npsInput.value && (npsInput.value < 0 || npsInput.value > 10)) { showValidationError(npsInput, 'NPS must be between 0 and 10.'); isValid = false; } else { clearValidationError(npsInput); }

        if (!isValid) return;

        feedback.customerId = customerIdInput.value.trim() || null;
        feedback.type = feedbackTypeInput.value;
        feedback.message = messageInput.value.trim();
        feedback.rating = ratingInput.value ? parseInt(ratingInput.value) : null;
        feedback.npsScore = npsInput.value ? parseInt(npsInput.value) : null;

        // Update customer feedback score if customer ID is provided
        if (feedback.customerId) {
            const customerIndex = customers.findIndex(c => c.customerId === feedback.customerId);
            if (customerIndex !== -1) {
                const customerFeedbacks = feedbackEntries.filter(f => f.customerId === feedback.customerId && f.rating !== null);
                const totalRating = customerFeedbacks.reduce((sum, f) => sum + f.rating, 0);
                customers[customerIndex].feedbackScore = (totalRating / customerFeedbacks.length).toFixed(1);
                renderCustomers();
            }
        }

        renderFeedbackEntries();
        closeSubmitFeedbackModal();
        alert('Feedback updated successfully!');
        form.onsubmit = null;
        attachFormSubmitHandlers();
    };
}


function editLoyalty(customerId) {
    const loyaltyItem = loyaltyData.find(item => item.customerId === customerId);
    if (!loyaltyItem) {
        alert('Loyalty data not found for editing.');
        return;
    }

    openManageRewardsModal();

    document.getElementById('reward-customer-id').value = loyaltyItem.customerId;
    document.getElementById('reward-customer-id').disabled = true; // Prevent changing customer ID for editing
    document.getElementById('reward-type').value = 'Points'; // Default to points or first option
    document.getElementById('reward-value').value = loyaltyItem.points; // Populate with current points as an example
    document.getElementById('reward-description').value = `Current Points: ${loyaltyItem.points}, LTV: ₹${loyaltyItem.lifetimeValue}, Churn Risk: ${loyaltyItem.churnRisk}`;

    const form = document.getElementById('manage-rewards-form');
    form.onsubmit = function(event) {
        event.preventDefault();
        clearValidationErrors(this);

        const customerIdInput = document.getElementById('reward-customer-id');
        const rewardTypeInput = document.getElementById('reward-type');
        const rewardValueInput = document.getElementById('reward-value');

        let isValid = true;
        if (!rewardTypeInput.value) { showValidationError(rewardTypeInput, 'Reward Type is required.'); isValid = false; } else { clearValidationError(rewardTypeInput); }
        if (rewardValueInput.value === '' || isNaN(rewardValueInput.value) || parseFloat(rewardValueInput.value) < 0) { showValidationError(rewardValueInput, 'Valid positive reward value is required.'); isValid = false; } else { clearValidationError(rewardValueInput); }

        if (!isValid) return;

        // Apply the changes (e.g., updating points or LTV directly based on edited value)
        const newRewardValue = parseFloat(rewardValueInput.value);
        if (rewardTypeInput.value === 'Points') {
            loyaltyItem.points = newRewardValue;
        } else if (rewardTypeInput.value === 'LifetimeValue') { // A hypothetical edit for LTV directly
            loyaltyItem.lifetimeValue = newRewardValue;
        }
        // You would need more sophisticated logic here based on what 'editing' a reward means.
        // For now, it updates the "points" value directly as an example.

        renderLoyaltyData();
        closeManageRewardsModal();
        document.getElementById('reward-customer-id').disabled = false; // Re-enable for next add
        alert('Loyalty data updated successfully!');
        form.onsubmit = null;
        attachFormSubmitHandlers();
    };
}


// --- Delete Functions ---

function deleteCustomer(customerId) {
    if (confirm(`Are you sure you want to delete customer ${customerId}? This will also delete related interactions, tickets, feedback, and loyalty data.`)) {
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
        alert('Customer and related data deleted.');
    }
}

function deleteInteraction(interactionId) {
    if (confirm(`Are you sure you want to delete interaction ${interactionId}?`)) {
        interactions = interactions.filter(i => i.interactionId !== interactionId);
        renderInteractions();
        alert('Interaction deleted.');
    }
}

function deleteSupportTicket(ticketId) {
    if (confirm(`Are you sure you want to delete support ticket ${ticketId}?`)) {
        supportTickets = supportTickets.filter(t => t.ticketId !== ticketId);
        renderSupportTickets();
        alert('Support ticket deleted.');
    }
}

function deleteFeedback(feedbackId) {
    if (confirm(`Are you sure you want to delete feedback entry ${feedbackId}?`)) {
        feedbackEntries = feedbackEntries.filter(f => f.feedbackId !== feedbackId);
        renderFeedbackEntries();
        alert('Feedback entry deleted.');
    }
}

function deleteLoyalty(customerId) {
    if (confirm(`Are you sure you want to delete loyalty data for customer ${customerId}?`)) {
        loyaltyData = loyaltyData.filter(l => l.customerId !== customerId);
        // Optionally reset loyalty tier in customer object if loyalty data is deleted
        const customer = customers.find(c => c.customerId === customerId);
        if (customer) {
            customer.loyaltyTier = 'None';
            renderCustomers();
        }
        renderLoyaltyData();
        alert('Loyalty data deleted.');
    }
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
        // Charts also need to be re-rendered or updated when their section is active
        updateAllCharts();
    });
});

// --- Table Filtering (AND logic) ---
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

document.querySelectorAll('.data-table').forEach(table => {
    const tableId = table.id;
    const filterRow = table.querySelector('.filter-row');

    // Toggle filter row visibility
    table.querySelectorAll('th.filterable').forEach(header => {
        header.addEventListener('click', (event) => {
            // Prevent toggling if click is on the filter input itself
            if (event.target.tagName === 'INPUT') {
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
        if (event.target.tagName === 'INPUT') {
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
                th.querySelector('.arrow').textContent = '▼';
            }
        });

        if (currentDirection === 'asc') {
            newDirection = 'desc';
            header.querySelector('.arrow').textContent = '▲';
        } else {
            newDirection = 'asc';
            header.querySelector('.arrow').textContent = '▼';
        }
        header.dataset.direction = newDirection;

        let dataArray;
        if (table.id === 'customer-table') dataArray = customers;
        else if (table.id === 'interaction-table') dataArray = interactions;
        else if (table.id === 'support-ticket-table') dataArray = supportTickets;
        else if (table.id === 'feedback-table') dataArray = feedbackEntries;
        else if (table.id === 'loyalty-table') dataArray = loyaltyData;

        dataArray.sort((a, b) => {
            const valA = a[column];
            const valB = b[column];

            let comparison = 0;
            if (type === 'number') {
                comparison = (parseFloat(valA) || 0) - (parseFloat(valB) || 0);
            } else if (type === 'date') {
                const dateA = new Date(valA);
                const dateB = new Date(valB);
                comparison = dateA.getTime() - dateB.getTime();
            } else { // text
                comparison = String(valA).localeCompare(String(valB));
            }

            return newDirection === 'asc' ? comparison : -comparison;
        });

        // Re-render the sorted table
        if (table.id === 'customer-table') renderCustomers();
        else if (table.id === 'interaction-table') renderInteractions();
        else if (table.id === 'support-ticket-table') renderSupportTickets();
        else if (table.id === 'feedback-table') renderFeedbackEntries();
        else if (table.id === 'loyalty-table') renderLoyaltyData();
    });
});


// --- Chart.js Instances ---
let supportMetricsChart;
let feedbackTrendChart;
let loyaltyEngagementChart;
let kpiDashboardChart;

function updateSupportMetricsChart() {
    const ctx = document.getElementById('support-metrics-chart');
    if (!ctx) return; // Ensure canvas exists

    const statusCounts = supportTickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    if (supportMetricsChart) {
        supportMetricsChart.data.labels = labels;
        supportMetricsChart.data.datasets[0].data = data;
        supportMetricsChart.update();
    } else {
        supportMetricsChart = new Chart(ctx, {
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

    if (feedbackTrendChart) {
        feedbackTrendChart.data.labels = labels;
        feedbackTrendChart.data.datasets[0].data = data;
        feedbackTrendChart.update();
    } else {
        feedbackTrendChart = new Chart(ctx, {
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

    if (loyaltyEngagementChart) {
        loyaltyEngagementChart.data.labels = labels;
        loyaltyEngagementChart.data.datasets[0].data = data;
        loyaltyEngagementChart.update();
    } else {
        loyaltyEngagementChart = new Chart(ctx, {
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

    // Example KPIs
    const totalCustomers = customers.length;
    const totalInteractions = interactions.length;
    const openTickets = supportTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const avgCsatScore = feedbackEntries.filter(f => f.rating !== null).reduce((sum, f) => sum + f.rating, 0) /
                         feedbackEntries.filter(f => f.rating !== null).length || 0;
    const avgNpsScore = feedbackEntries.filter(f => f.npsScore !== null).reduce((sum, f) => sum + f.npsScore, 0) /
                        feedbackEntries.filter(f => f.npsScore !== null).length || 0;
    const bronzeCount = loyaltyData.filter(l => l.loyaltyTier === 'Bronze').length;
    const silverCount = loyaltyData.filter(l => l.loyaltyTier === 'Silver').length;
    const goldCount = loyaltyData.filter(l => l.loyaltyTier === 'Gold').length;


    const labels = ['Total Customers', 'Total Interactions', 'Open Tickets', 'Avg. CSAT', 'Avg. NPS'];
    const data = [
        totalCustomers,
        totalInteractions,
        openTickets,
        avgCsatScore.toFixed(1), // Format to 1 decimal place
        avgNpsScore.toFixed(1)
    ];

    if (kpiDashboardChart) {
        kpiDashboardChart.data.labels = labels;
        kpiDashboardChart.data.datasets[0].data = data;
        kpiDashboardChart.update();
    } else {
        kpiDashboardChart = new Chart(ctx, {
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
}


function updateAllCharts() {
    updateSupportMetricsChart();
    updateFeedbackTrendChart();
    updateLoyaltyEngagementChart();
    updateKpiDashboardChart();
}


// --- Initial Render and Setup ---
document.addEventListener('DOMContentLoaded', () => {
    renderCustomers(); // Render default active section
    updateAllCharts(); // Render all charts initially

    // Attach initial form submit handlers
    attachFormSubmitHandlers();
});

function attachFormSubmitHandlers() {
    // Remove previous handlers to prevent multiple bindings if attachFormSubmitHandlers is called again
    document.getElementById('add-customer-form').onsubmit = null;
    document.getElementById('add-interaction-form').onsubmit = null;
    document.getElementById('create-ticket-form').onsubmit = null;
    document.getElementById('submit-feedback-form').onsubmit = null;
    document.getElementById('manage-rewards-form').onsubmit = null;

    // Re-attach the handlers
    document.getElementById('add-customer-form').addEventListener('submit', function(event) {
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

        if (!contactInput.value.trim()) {
            showValidationError(contactInput, 'Contact is required.');
            isValid = false;
        } else if (!/^[6-9]{1}[0-9]{9}$/.test(contactInput.value.trim())) {
            showValidationError(contactInput, 'Contact number must be 10 digits and start with 6-9.');
            isValid = false;
        } else {
            clearValidationError(contactInput);
        }

        if (!locationInput.value.trim()) {
            showValidationError(locationInput, 'Location is required.');
            isValid = false;
        } else {
            clearValidationError(locationInput);
        }

        if (!isValid) {
            return;
        }

        const newCustomer = {
            customerId: generateUniqueId('CUST', 12),
            name: nameInput.value.trim(),
            contact: contactInput.value.trim(),
            location: locationInput.value.trim(),
            purchaseHistory: 'No recent purchases',
            preferences: preferencesInput.value.trim(),
            loyaltyTier: loyaltyTierInput.value,
            feedbackScore: null,
            kycUploads: kycUploadsInput.files.length > 0,
            behavioralSegmentation: behavioralSegmentationInput.value.trim(),
            aiTags: 'New Customer'
        };

        customers.push(newCustomer);
        renderCustomers();
        closeAddCustomerModal();
        alert('Customer added successfully!');
    });


    document.getElementById('add-interaction-form').addEventListener('submit', function(event) {
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
        if (!/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!dateInput.value) { showValidationError(dateInput, 'Date is required.'); isValid = false; } else { clearValidationError(dateInput); }
        if (!typeInput.value) { showValidationError(typeInput, 'Interaction Type is required.'); isValid = false; } else { clearValidationError(typeInput); }
        if (!categoryInput.value) { showValidationError(categoryInput, 'Category is required.'); isValid = false; } else { clearValidationError(categoryInput); }
        if (!descriptionInput.value.trim()) { showValidationError(descriptionInput, 'Description is required.'); isValid = false; } else { clearValidationError(descriptionInput); }

        if (!isValid) return;

        const newInteraction = {
            interactionId: generateUniqueId('INT', 10),
            customerId: customerIdInput.value.trim(),
            interactionDate: dateInput.value,
            interactionType: typeInput.value,
            category: categoryInput.value,
            description: descriptionInput.value.trim(),
            sentiment: sentimentInput.value,
            channel: channelInput.value.trim() || 'N/A',
            assignedTo: assignedToInput.value.trim() || 'Unassigned',
            followUpDate: followUpDateInput.value || null
        };

        interactions.push(newInteraction);
        renderInteractions();
        closeAddInteractionModal();
        alert('Interaction logged successfully!');
    });

    document.getElementById('create-ticket-form').addEventListener('submit', function(event) {
        event.preventDefault();
        clearValidationErrors(this);

        const customerIdInput = document.getElementById('ticket-customer-id');
        const subjectInput = document.getElementById('ticket-subject');
        const descriptionInput = document.getElementById('ticket-description');
        const priorityInput = document.getElementById('ticket-priority');
        const assignedToInput = document.getElementById('ticket-assigned-to');
        const slaDueDateInput = document.getElementById('ticket-sla-due-date');

        let isValid = true;
        if (!customerIdInput.value.trim()) { showValidationError(customerIdInput, 'Customer ID is required.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!subjectInput.value.trim()) { showValidationError(subjectInput, 'Subject is required.'); isValid = false; } else { clearValidationError(subjectInput); }
        if (subjectInput.value.trim().length > 100) { showValidationError(subjectInput, 'Subject cannot exceed 100 characters.'); isValid = false; } else { clearValidationError(subjectInput); }
        if (!descriptionInput.value.trim()) { showValidationError(descriptionInput, 'Description is required.'); isValid = false; } else { clearValidationError(descriptionInput); }

        if (!isValid) return;

        const newTicket = {
            ticketId: generateUniqueId('TKT', 8),
            customerId: customerIdInput.value.trim(),
            subject: subjectInput.value.trim(),
            description: descriptionInput.value.trim(),
            status: 'Open',
            priority: priorityInput.value,
            assignedTo: assignedToInput.value.trim() || 'Unassigned',
            createdDate: new Date().toISOString().split('T')[0],
            slaDueDate: slaDueDateInput.value || null,
            resolutionDate: null,
            csatScore: null
        };

        supportTickets.push(newTicket);
        renderSupportTickets();
        closeCreateTicketModal();
        alert('Support ticket created successfully!');
    });

    document.getElementById('submit-feedback-form').addEventListener('submit', function(event) {
        event.preventDefault();
        clearValidationErrors(this);

        const customerIdInput = document.getElementById('feedback-customer-id');
        const feedbackTypeInput = document.getElementById('feedback-type');
        const messageInput = document.getElementById('feedback-message');
        const ratingInput = document.getElementById('feedback-rating');
        const npsInput = document.getElementById('feedback-nps');

        let isValid = true;
        if (customerIdInput.value.trim() && !/^[A-Za-z0-9]{12}$/.test(customerIdInput.value.trim())) { showValidationError(customerIdInput, 'Customer ID must be 12 alphanumeric characters or left empty.'); isValid = false; } else { clearValidationError(customerIdInput); }
        if (!feedbackTypeInput.value) { showValidationError(feedbackTypeInput, 'Feedback Type is required.'); isValid = false; } else { clearValidationError(feedbackTypeInput); }
        if (!messageInput.value.trim()) { showValidationError(messageInput, 'Feedback message is required.'); isValid = false; } else { clearValidationError(messageInput); }
        if (ratingInput.value && (ratingInput.value < 1 || ratingInput.value > 5)) { showValidationError(ratingInput, 'Rating must be between 1 and 5.'); isValid = false; } else { clearValidationError(ratingInput); }
        if (npsInput.value && (npsInput.value < 0 || npsInput.value > 10)) { showValidationError(npsInput, 'NPS must be between 0 and 10.'); isValid = false; } else { clearValidationError(npsInput); }

        if (!isValid) return;

        const newFeedback = {
            feedbackId: generateUniqueId('FB', 7),
            customerId: customerIdInput.value.trim() || null,
            feedbackDate: new Date().toISOString().split('T')[0],
            type: feedbackTypeInput.value,
            message: messageInput.value.trim(),
            rating: ratingInput.value ? parseInt(ratingInput.value) : null,
            npsScore: npsInput.value ? parseInt(npsInput.value) : null,
            classifierTags: 'Auto-tagged'
        };

        feedbackEntries.push(newFeedback);
        renderFeedbackEntries();

        if (newFeedback.customerId) {
            const customerIndex = customers.findIndex(c => c.customerId === newFeedback.customerId);
            if (customerIndex !== -1) {
                const customerFeedbacks = feedbackEntries.filter(f => f.customerId === newFeedback.customerId && f.rating !== null);
                const totalRating = customerFeedbacks.reduce((sum, f) => sum + f.rating, 0);
                customers[customerIndex].feedbackScore = (totalRating / customerFeedbacks.length).toFixed(1);
                renderCustomers();
            }
        }

        closeSubmitFeedbackModal();
        alert('Feedback submitted successfully!');
    });

    document.getElementById('manage-rewards-form').addEventListener('submit', function(event) {
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
        if (rewardValueInput.value === '' || isNaN(rewardValueInput.value) || parseFloat(rewardValueInput.value) < 0) { showValidationError(rewardValueInput, 'Valid positive reward value is required.'); isValid = false; } else { clearValidationError(rewardValueInput); }

        if (!isValid) return;

        const customerId = customerIdInput.value.trim();
        const rewardType = rewardTypeInput.value;
        const rewardValue = parseFloat(rewardValueInput.value);
        const rewardDescription = rewardDescriptionInput.value.trim();

        let loyaltyEntry = loyaltyData.find(item => item.customerId === customerId);
        if (!loyaltyEntry) {
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
        } else if (rewardType === 'Cashback' || rewardType === 'Discount') {
            loyaltyEntry.lifetimeValue += rewardValue;
            loyaltyEntry.rewardUsage += rewardValue;
        }
        loyaltyEntry.personalizedOffers.push({ type: rewardType, value: rewardValue, description: rewardDescription, date: new Date().toISOString().split('T')[0] });

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
        renderCustomers();
        closeManageRewardsModal();
        alert(`Reward "${rewardType}" with value ${rewardValue} applied successfully to ${customerId}!`);
    });
}