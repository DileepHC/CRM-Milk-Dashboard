document.addEventListener('DOMContentLoaded', function () {
    // --- Global DOM Element References ---
    const navButtons = document.querySelectorAll('.qc-navigation .nav-button');
    // Select sections by their new IDs
    const dashboardSection = document.getElementById('store-info-section'); // Dashboard is now 'store-info-section'
    const salesTrackingSection = document.getElementById('sales-tracking-section');
    const inventorySyncSection = document.getElementById('inventory-sync-section');
    const performanceCommSection = document.getElementById('performance-comm-section');
    const franchiseMgmtSection = document.getElementById('franchise-mgmt-section');

    const sections = [
        dashboardSection,
        salesTrackingSection,
        inventorySyncSection,
        performanceCommSection,
        franchiseMgmtSection
    ].filter(Boolean); // Filter out any nulls if an ID doesn't exist

    // Modals (Updated IDs based on your HTML comments for clarity, assuming they are within modals)
    const addStoreModal = document.getElementById('add-store-modal'); // Assuming a modal with this ID
    const addSalesRecordModal = document.getElementById('add-sales-modal'); // Assuming a modal with this ID
    const updateInventoryModal = document.getElementById('update-inventory-modal'); // Assuming a modal with this ID
    const reportShrinkageModal = document.getElementById('report-shrinkage-modal'); // Assuming a modal with this ID
    const uploadInventorySheetModal = document.getElementById('upload-inventory-sheet-modal'); // Assuming a modal with this ID
    const sendMessageModal = document.getElementById('send-message-modal'); // Assuming a modal with this ID
    const addFranchiseModal = document.getElementById('add-franchise-modal'); // Assuming a modal with this ID

    // Close buttons for modals (Updated to select children of the correct modal IDs)
    const closeStoreModal = addStoreModal ? addStoreModal.querySelector('.close-button') : null;
    const closeSalesRecordModal = addSalesRecordModal ? addSalesRecordModal.querySelector('.close-button') : null;
    const closeUpdateInventoryModal = updateInventoryModal ? updateInventoryModal.querySelector('.close-button') : null;
    const closeReportShrinkageModal = reportShrinkageModal ? reportShrinkageModal.querySelector('.close-button') : null;
    const closeUploadInventorySheetModal = uploadInventorySheetModal ? uploadInventorySheetModal.querySelector('.close-button') : null;
    const closeSendMessageModal = sendMessageModal ? sendMessageModal.querySelector('.close-button') : null;
    const closeFranchiseModal = addFranchiseModal ? addFranchiseModal.querySelector('.close-button') : null;

    // Table bodies
    const storeTableBody = document.getElementById("store-table-body");
    const salesTableBody = document.getElementById("sales-table-body");
    const storeInventoryBody = document.getElementById("store-inventory-body"); // Updated ID
    const shrinkageReportBody = document.getElementById("shrinkage-report-body"); // New ID
    const fpiTableBody = document.getElementById("fpi-table-body"); // New ID
    const messageLogBody = document.getElementById("message-log"); // Updated ID
    const franchiseAgreementBody = document.getElementById("franchise-agreement-body"); // Updated ID
    const franchiseePerformanceBody = document.getElementById("franchisee-performance-body"); // New ID

    // Forms (Updated IDs for consistency with HTML)
    const addStoreForm = document.getElementById("add-store-form"); // Assuming a form with this ID in the modal
    const addSalesRecordForm = document.getElementById("add-sales-record-form"); // Assuming a form with this ID in the modal
    const updateInventoryForm = document.getElementById("update-inventory-form"); // Assuming a form with this ID in the modal
    const reportShrinkageForm = document.getElementById("report-shrinkage-form"); // Assuming a form with this ID in the modal
    const uploadInventorySheetForm = document.getElementById("upload-inventory-sheet-form"); // Assuming a form with this ID in the modal
    const sendMessageForm = document.getElementById("send-message-form"); // Assuming a form with this ID in the modal
    const addFranchiseForm = document.getElementById("add-franchise-form"); // Assuming a form with this ID in the modal

    // Chart Canvas elements
    const salesOverviewChartCanvas = document.getElementById('sales-overview-chart');
    const performanceIndexChartCanvas = document.getElementById('performance-index-chart'); // You'll need to add this canvas ID to your HTML for performance section
    const franchiseePerformanceChartCanvas = document.getElementById('franchisee-performance-chart'); // You'll need to add this canvas ID to your HTML for franchise performance section

    // Other specific elements (Updated IDs from dashboard-cards in HTML)
    const activeStoresCard = document.querySelector('.dashboard-cards .active-stores .store-count');
    const inSetupStoresCard = document.querySelector('.dashboard-cards .in-setup-stores .store-count');
    const flaggedStoresCard = document.querySelector('.dashboard-cards .flagged-stores .store-count');
    const ownedStoresCard = document.querySelector('.dashboard-cards .owned-stores .store-count');
    const franchiseStoresCard = document.querySelector('.dashboard-cards .franchise-stores .store-count');

    // --- Data Storage Variables (Initialize from localStorage if available) ---
    let stores = localStorage.getItem("stores") ? JSON.parse(localStorage.getItem("stores")) : [];
    let salesRecords = localStorage.getItem("salesRecords") ? JSON.parse(localStorage.getItem("salesRecords")) : [];
    let inventoryItems = localStorage.getItem("inventoryItems") ? JSON.parse(localStorage.getItem("inventoryItems")) : []; // Changed from 'products'
    let shrinkageReports = localStorage.getItem("shrinkageReports") ? JSON.parse(localStorage.getItem("shrinkageReports")) : []; // New
    let fpiData = localStorage.getItem("fpiData") ? JSON.parse(localStorage.getItem("fpiData")) : []; // New
    let communications = localStorage.getItem("communications") ? JSON.parse(localStorage.getItem("communications")) : [];
    let franchiseAgreements = localStorage.getItem("franchiseAgreements") ? JSON.parse(localStorage.getItem("franchiseAgreements")) : []; // Changed from 'franchisees'

    let editStoreIndex = null;
    let editSalesRecordIndex = null;
    let editInventoryItemIndex = null; // Changed from editProductIndex
    let editFranchiseAgreementIndex = null; // Changed from editFranchiseeIndex

    // --- Utility Functions ---

    /**
     * Hides all content sections and deactivates all navigation buttons.
     */
    function hideAllSections() {
        sections.forEach(section => {
            if (section) { // Check if section exists
                section.style.display = 'none';
                section.classList.remove('active');
            }
        });
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
    }

    /**
     * Shows a specific content section and activates its corresponding navigation button.
     * @param {string} id The ID of the section to show.
     */
    function showSection(id) {
        const sectionToShow = document.getElementById(id);
        if (sectionToShow) {
            hideAllSections(); // Hide all first to ensure only one is active
            sectionToShow.style.display = 'block';
            sectionToShow.classList.add('active');
            // Find and activate the corresponding nav button
            const correspondingButton = document.querySelector(`.qc-navigation .nav-button[data-section="${id.replace('-section', '')}"]`); // Adjust data-section to match your HTML
            if (correspondingButton) {
                correspondingButton.classList.add('active');
            }
        }
    }

    /**
     * Displays an error message below an input element.
     * @param {HTMLElement} inputElement The input element to display the error for.
     * @param {string} message The error message to display.
     */
    function displayError(inputElement, message) {
        const errorDivId = `${inputElement.id}-error`;
        let errorDiv = document.getElementById(errorDivId);
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = errorDivId;
            errorDiv.className = 'error-message'; // Ensure you have this CSS class for styling
            inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
        }
        errorDiv.textContent = message;
    }

    /**
     * Clears any error message associated with an input element.
     * @param {HTMLElement} inputElement The input element to clear the error for.
     */
    function clearError(inputElement) {
        const errorDivId = `${inputElement.id}-error`;
        const errorDiv = document.getElementById(errorDivId);
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.remove(); // Remove the error div completely
        }
    }

    /**
     * Clears all error messages within a given form.
     * @param {HTMLElement} formElement The form element to clear errors from.
     */
    function clearAllErrors(formElement) {
        if (!formElement) return;
        const errorMessages = formElement.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
    }

    /**
     * Formats a date string from YYYY-MM-DD to DD-MM-YYYY.
     * @param {string} dateString The date string in YYYY-MM-DD format.
     * @returns {string} The formatted date string.
     */
    function formatDate(dateString) {
        if (!dateString) return "";
        try {
            const [year, month, day] = dateString.split("-");
            return `${day}-${month}-${year}`;
        } catch (error) {
            console.error("Error formatting date:", dateString, error);
            return dateString; // Return original if formatting fails
        }
    }

    /**
     * Sets up inline filtering for a data table.
     * @param {HTMLElement} tableElement The table element.
     * @param {function} applyFilterFunction The function to apply the filter.
     */
    function setupInlineFilters(tableElement, applyFilterFunction) {
        const headers = tableElement.querySelectorAll("thead th[data-column]"); // Only filterable headers
        let filterRow = tableElement.querySelector('thead .filter-row');

        // Ensure filter row exists and has correct number of cells
        if (filterRow) {
            const cells = filterRow.querySelectorAll('td');
            if (cells.length !== tableElement.querySelector('thead tr').children.length) {
                // If column count doesn't match, recreate the filter row
                filterRow.remove();
                filterRow = null;
            }
        }

        // Create filter row if it doesn't exist or was recreated
        if (!filterRow) {
            filterRow = document.createElement('tr');
            filterRow.classList.add('filter-row');
            filterRow.classList.add('hidden'); // Initially hidden
            const headerRow = tableElement.querySelector('thead tr');
            if (headerRow) {
                headerRow.parentNode.insertBefore(filterRow, headerRow.nextSibling);
            }

            Array.from(headerRow.children).forEach((header, index) => { // Iterate through all headers including non-filterable
                const td = document.createElement('td');
                if (header.hasAttribute('data-column')) { // Only add input for filterable columns
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = `Filter by ${header.textContent.trim().replace(' \u2193', '').replace(' \u2191', '')}`; // Remove arrow symbols
                    input.className = 'filter-input';
                    input.setAttribute('data-col-index', index); // Store column index
                    td.appendChild(input);
                }
                filterRow.appendChild(td);
            });
        }

        // Add click listener to each filterable header to toggle the filter row
        headers.forEach(header => {
            header.addEventListener('click', function (event) {
                // Prevent toggling if click was on a filter input within the filter row
                if (event.target.classList.contains('filter-input')) {
                    return;
                }

                filterRow.classList.toggle('hidden');
                // Clear and trigger input for all filter inputs when showing/hiding
                const filterInputs = filterRow.querySelectorAll('.filter-input');
                filterInputs.forEach(input => {
                    input.value = '';
                    input.dispatchEvent(new Event('input'));
                });
            });
        });

        // Add input event listeners to filter inputs
        const filterInputs = filterRow.querySelectorAll('.filter-input');
        filterInputs.forEach(input => {
            input.addEventListener('input', function () {
                const colIndex = parseInt(this.getAttribute('data-col-index'));
                applyFilterFunction(colIndex, this.value.trim().toLowerCase());
            });
        });
    }


    /**
     * Opens a specified modal.
     * @param {HTMLElement | string} modalIdentifier The modal DOM element or its ID.
     */
    window.openModal = function (modalIdentifier) {
        let modalElement;
        if (typeof modalIdentifier === 'string') {
            modalElement = document.getElementById(modalIdentifier);
        } else {
            modalElement = modalIdentifier;
        }

        if (modalElement) {
            modalElement.style.display = "block";
        }
    };

    /**
     * Closes a specified modal and resets its form.
     * @param {HTMLElement} modalElement The modal DOM element.
     * @param {HTMLElement} formElement The form DOM element within the modal.
     */
    function closeModal(modalElement, formElement) {
        if (modalElement) {
            modalElement.style.display = "none";
        }
        if (formElement) {
            formElement.reset();
            clearAllErrors(formElement); // Clear any previous error messages
        }
    }

    // --- Core Navigation and Modal Event Listeners ---

    // Initial section display
    // showSection('store-info-section'); // Initially show the Store Information section

    // Navigation button event listeners
    navButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetSectionId = this.getAttribute('data-section') + '-section'; // Append '-section' to match HTML IDs
            showSection(targetSectionId);
            // Re-render charts or update data specific to the section if needed
            if (targetSectionId === 'store-info-section') {
                renderStoreTable(); // Make sure dashboard cards update too
            } else if (targetSectionId === 'sales-tracking-section') {
                renderSalesTable();
                renderSalesOverviewChart();
            } else if (targetSectionId === 'inventory-sync-section') {
                renderStoreInventoryTable(); // Renamed function
                renderShrinkageReportTable(); // New table
                renderReorderSuggestions(); // New list
            } else if (targetSectionId === 'performance-comm-section') {
                renderFPITable(); // New table
                renderCommunicationLog();
                renderPerformanceIndexChart();
            } else if (targetSectionId === 'franchise-mgmt-section') {
                renderFranchiseAgreementTable(); // Renamed function
                renderFranchiseePerformanceTable(); // New table
                renderFranchiseePerformanceChart();
            }
        });
    });

    // Universal modal closing logic (by close button and outside click)
    [
        { modal: addStoreModal, closeBtn: closeStoreModal, form: addStoreForm, editIndex: 'editStoreIndex' },
        { modal: addSalesRecordModal, closeBtn: closeSalesRecordModal, form: addSalesRecordForm, editIndex: 'editSalesRecordIndex' },
        { modal: updateInventoryModal, closeBtn: closeUpdateInventoryModal, form: updateInventoryForm, editIndex: 'editInventoryItemIndex' },
        { modal: reportShrinkageModal, closeBtn: closeReportShrinkageModal, form: reportShrinkageForm, editIndex: null },
        { modal: uploadInventorySheetModal, closeBtn: closeUploadInventorySheetModal, form: uploadInventorySheetForm, editIndex: null },
        { modal: sendMessageModal, closeBtn: closeSendMessageModal, form: sendMessageForm, editIndex: null },
        { modal: addFranchiseModal, closeBtn: closeFranchiseModal, form: addFranchiseForm, editIndex: 'editFranchiseAgreementIndex' }
    ].forEach(({ modal, closeBtn, form, editIndex }) => {
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(modal, form);
                if (editIndex && window[editIndex] !== undefined) window[editIndex] = null; // Reset edit index
            });
        }
        if (modal) {
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal(modal, form);
                    if (editIndex && window[editIndex] !== undefined) window[editIndex] = null; // Reset edit index
                }
            });
        }
    });

    // --- Dashboard Section Logic ---

    /**
     * Updates the counts displayed on the dashboard cards.
     */
    function updateDashboardCards() {
        if (activeStoresCard) {
            activeStoresCard.textContent = stores.filter(store => store.status === 'Active').length;
        }
        if (inSetupStoresCard) {
            inSetupStoresCard.textContent = stores.filter(store => store.status === 'In Setup').length;
        }
        if (flaggedStoresCard) {
            flaggedStoresCard.textContent = stores.filter(store => store.status === 'Flagged').length;
        }
        if (ownedStoresCard) {
            ownedStoresCard.textContent = stores.filter(store => store.type === 'Company-Owned').length;
        }
        if (franchiseStoresCard) {
            franchiseStoresCard.textContent = stores.filter(store => store.type === 'Franchise').length;
        }
    }

    // --- Store Information & Structure Section Logic ---

    /**
     * Renders the stores data into the table.
     */
    function renderStoreTable() {
        if (!storeTableBody) return;
        storeTableBody.innerHTML = "";
        stores.forEach((store, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${store.storeId}</td>
                <td>${store.name}</td>
                <td>${store.type}</td>
                <td>${store.manager}</td>
                <td>${store.location}</td>
                <td>${store.status}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            storeTableBody.appendChild(row);
        });
        const storeTable = document.getElementById('store-table'); // Assuming you have a table with this ID
        if (storeTable) {
            setupInlineFilters(storeTable, applyStoreFilter);
        }
        updateDashboardCards(); // Update dashboard cards after rendering store table
    }

    /**
     * Applies filter to the store table.
     * @param {number} colIndex The index of the column to filter.
     * @param {string} filterValue The value to filter by.
     */
    function applyStoreFilter(colIndex, filterValue) {
        const rows = storeTableBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cellText = row.children[colIndex].textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        });
    }

    // Event listener for store table actions (edit/delete)
    if (storeTableBody) {
        storeTableBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editStore(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteStore(index);
            }
        });
    }

    /**
     * Opens the add store modal and populates it for editing.
     * @param {number} index The index of the store to edit.
     */
    function editStore(index) {
        const store = stores[index];
        // Ensure your modal form inputs have these IDs in your HTML
        document.getElementById("store-id").value = store.storeId;
        document.getElementById("store-name").value = store.name;
        document.getElementById("store-type").value = store.type; // New field
        document.getElementById("store-manager").value = store.manager;
        document.getElementById("store-location").value = store.location;
        document.getElementById("store-status").value = store.status;

        editStoreIndex = index;
        openModal('add-store-modal'); // Open modal by its ID
    }

    /**
     * Deletes a store from the data.
     * @param {number} index The index of the store to delete.
     */
    function deleteStore(index) {
        if (confirm("Are you sure you want to delete this store?")) {
            stores.splice(index, 1);
            localStorage.setItem("stores", JSON.stringify(stores));
            renderStoreTable();
        }
    }

    // Event listener for adding a new store (using its onclick from HTML)
    // No need to add here if you're using onclick="openModal('add-store-modal')" in HTML directly
    // const addStoreButton = document.querySelector('#store-info-section .inline-add-button');
    // if (addStoreButton) {
    //     addStoreButton.addEventListener('click', () => {
    //         openModal(addStoreModal);
    //         editStoreIndex = null; // Ensure add mode
    //         if (addStoreForm) {
    //             addStoreForm.reset();
    //             clearAllErrors(addStoreForm);
    //         }
    //     });
    // }

    // Form submission for adding/editing a store
    if (addStoreForm) {
        addStoreForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const storeIdInput = document.getElementById('store-id');
            const storeNameInput = document.getElementById('store-name');
            const storeTypeInput = document.getElementById('store-type'); // New field
            const storeLocationInput = document.getElementById('store-location');
            const storeManagerInput = document.getElementById('store-manager');
            const storeStatusInput = document.getElementById('store-status');

            const inputs = [
                storeIdInput, storeNameInput, storeTypeInput, storeLocationInput,
                storeManagerInput, storeStatusInput
            ];

            inputs.forEach(input => {
                input.dispatchEvent(new Event('input')); // Trigger validation
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const storeData = {
                    storeId: storeIdInput.value.trim(),
                    name: storeNameInput.value.trim(),
                    type: storeTypeInput.value, // Added type
                    location: storeLocationInput.value.trim(),
                    manager: storeManagerInput.value.trim(),
                    contact: '', // Placeholder, assuming contact isn't in your HTML form for store yet
                    status: storeStatusInput.value,
                    onlinePresence: '' // Placeholder
                };

                if (editStoreIndex !== null) {
                    stores[editStoreIndex] = storeData;
                } else {
                    stores.push(storeData);
                }
                localStorage.setItem('stores', JSON.stringify(stores));
                renderStoreTable();
                closeModal(addStoreModal, addStoreForm);
                editStoreIndex = null;
            } else {
                alert('Please correct the errors in the form.');
            }
        });

        // Real-time validation for store form
        addStoreForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.id === 'store-id') {
                if (!/^[A-Z0-9]{4,8}$/.test(target.value)) {
                    displayError(target, 'Store ID must be 4-8 uppercase alphanumeric characters.');
                } else if (stores.some(s => s.storeId === target.value.trim() && (editStoreIndex === null || s !== stores[editStoreIndex]))) {
                    displayError(target, 'Store ID already exists.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'store-name') {
                if (!/^[A-Za-z0-9\s\-'.&]{3,50}$/.test(target.value)) {
                    displayError(target, 'Store Name must be 3-50 characters (letters, numbers, spaces, hyphens, apostrophes, ampersands).');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'store-location') {
                if (target.value.trim().length < 3 || target.value.trim().length > 100) {
                    displayError(target, 'Location must be 3-100 characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'store-manager') {
                if (!/^[A-Za-z\s\-'.]{3,50}$/.test(target.value)) {
                    displayError(target, 'Manager Name must be 3-50 characters (letters, spaces, hyphens, apostrophes).');
                } else {
                    clearError(target);
                }
            }
            // Add validation for 'store-type' and 'store-status' if needed (e.g., if they are text inputs instead of selects)
        });
    }

    // --- Sales Tracking Section Logic ---

    /**
     * Renders the sales records data into the table.
     */
    function renderSalesTable() {
        if (!salesTableBody) return;
        salesTableBody.innerHTML = "";
        salesRecords.forEach((record, index) => {
            const storeName = stores.find(s => s.storeId === record.storeId)?.name || 'N/A';
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${storeName} (${record.storeId})</td>
                <td>${record.product}</td>
                <td>${record.quantity}</td>
                <td>$${record.unitPrice.toFixed(2)}</td>
                <td>$${record.totalAmount.toFixed(2)}</td>
                <td>${formatDate(record.saleDate)}</td>
                <td>${record.saleTime}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            salesTableBody.appendChild(row);
        });
        const salesTable = document.getElementById('sales-table'); // Assuming table has this ID
        if (salesTable) {
            setupInlineFilters(salesTable, applySalesFilter);
        }
        renderSalesOverviewChart(); // Update chart after rendering table
    }

    /**
     * Applies filter to the sales table.
     * @param {number} colIndex The index of the column to filter.
     * @param {string} filterValue The value to filter by.
     */
    function applySalesFilter(colIndex, filterValue) {
        const rows = salesTableBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cellText = row.children[colIndex].textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        });
    }

    // Event listener for sales table actions (edit/delete)
    if (salesTableBody) {
        salesTableBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editSalesRecord(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteSalesRecord(index);
            }
        });
    }

    /**
     * Opens the add sales record modal and populates it for editing.
     * @param {number} index The index of the sales record to edit.
     */
    function editSalesRecord(index) {
        const record = salesRecords[index];
        // Ensure your modal form inputs have these IDs in your HTML
        document.getElementById("sales-store-id").value = record.storeId;
        document.getElementById("sale-date").value = record.saleDate;
        document.getElementById("sale-time").value = record.saleTime; // New field
        document.getElementById("product-name").value = record.product; // Updated from productName
        document.getElementById("sales-quantity").value = record.quantity;
        document.getElementById("unit-price").value = record.unitPrice;
        // Assuming 'paymentMethod' is not in your HTML form based on your snippet, removed.

        editSalesRecordIndex = index;
        openModal('add-sales-modal'); // Open modal by its ID
    }

    /**
     * Deletes a sales record from the data.
     * @param {number} index The index of the sales record to delete.
     */
    function deleteSalesRecord(index) {
        if (confirm("Are you sure you want to delete this sales record?")) {
            salesRecords.splice(index, 1);
            localStorage.setItem("salesRecords", JSON.stringify(salesRecords));
            renderSalesTable();
        }
    }

    // Event listener for adding a new sales record (using its onclick from HTML)
    // No need to add here if you're using onclick="openModal('add-sales-modal')" in HTML directly

    // Form submission for adding/editing a sales record
    if (addSalesRecordForm) {
        addSalesRecordForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const storeIdInput = document.getElementById('sales-store-id');
            const saleDateInput = document.getElementById('sale-date');
            const saleTimeInput = document.getElementById('sale-time'); // New field
            const productNameInput = document.getElementById('product-name'); // Updated from productName
            const quantityInput = document.getElementById('sales-quantity');
            const unitPriceInput = document.getElementById('unit-price');

            const inputs = [
                storeIdInput, saleDateInput, saleTimeInput, productNameInput,
                quantityInput, unitPriceInput
            ];

            inputs.forEach(input => {
                input.dispatchEvent(new Event('input')); // Trigger validation
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const salesRecordData = {
                    storeId: storeIdInput.value.trim(),
                    saleDate: saleDateInput.value,
                    saleTime: saleTimeInput.value, // Added saleTime
                    product: productNameInput.value.trim(), // Updated property name
                    quantity: parseFloat(quantityInput.value),
                    unitPrice: parseFloat(unitPriceInput.value),
                    totalAmount: parseFloat(quantityInput.value) * parseFloat(unitPriceInput.value) // Updated property name
                };

                if (editSalesRecordIndex !== null) {
                    salesRecords[editSalesRecordIndex] = salesRecordData;
                } else {
                    salesRecords.push(salesRecordData);
                }
                localStorage.setItem('salesRecords', JSON.stringify(salesRecords));
                renderSalesTable();
                closeModal(addSalesRecordModal, addSalesRecordForm);
                editSalesRecordIndex = null;
            } else {
                alert('Please correct the errors in the form.');
            }
        });

        // Real-time validation for sales record form
        addSalesRecordForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.id === 'sales-store-id') {
                if (!/^[A-Z0-9]{4,8}$/.test(target.value)) {
                    displayError(target, 'Store ID must be 4-8 uppercase alphanumeric characters.');
                } else if (!stores.some(s => s.storeId === target.value.trim())) {
                    displayError(target, 'Store ID does not exist.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'sale-date') {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    displayError(target, 'Future dates are not allowed.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'product-name') {
                if (target.value.trim().length < 2 || target.value.trim().length > 50) {
                    displayError(target, 'Product Name must be 2-50 characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'sales-quantity') {
                const value = parseFloat(target.value);
                if (isNaN(value) || value <= 0 || !Number.isInteger(value)) {
                    displayError(target, 'Quantity must be a positive whole number.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'unit-price') {
                const value = parseFloat(target.value);
                if (isNaN(value) || value <= 0) {
                    displayError(target, 'Unit Price must be a positive number.');
                } else {
                    clearError(target);
                }
            }
            // Add validation for 'sale-time' if desired (e.g., regex for HH:MM format)
        });
    }

    let salesChartInstance = null; // To store the Chart.js instance

    /**
     * Renders the sales overview chart.
     */
    function renderSalesOverviewChart() {
        if (!salesOverviewChartCanvas) return;

        const salesByDate = {};
        salesRecords.forEach(record => {
            const date = record.saleDate;
            salesByDate[date] = (salesByDate[date] || 0) + record.totalAmount;
        });

        // Sort dates for proper chart display
        const sortedDates = Object.keys(salesByDate).sort();
        const salesData = sortedDates.map(date => salesByDate[date]);

        const labels = sortedDates.map(formatDate); // Format dates for display

        if (salesChartInstance) {
            salesChartInstance.destroy(); // Destroy existing chart instance
        }

        salesChartInstance = new Chart(salesOverviewChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Sales ($)',
                    data: salesData,
                    backgroundColor: 'rgba(52, 152, 219, 0.4)', // Light blue
                    borderColor: '#3498db', // Blue
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3, // Smooth the line
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
                            text: 'Total Sales ($)'
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
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Overall Sales Trend',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Sales: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }


    // --- Inventory Sync & Management Section Logic ---

    /**
     * Renders the store inventory data into the table.
     */
    function renderStoreInventoryTable() {
        if (!storeInventoryBody) return;
        storeInventoryBody.innerHTML = "";
        inventoryItems.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.storeId}</td>
                <td>${item.product}</td>
                <td>${item.currentStock}</td>
                <td>${item.reorderLevel}</td>
                <td>${formatDate(item.expiryDate)}</td>
                <td>${formatDate(item.lastSyncedDate)} ${item.lastSyncedTime}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            storeInventoryBody.appendChild(row);
        });
        const inventoryTable = document.getElementById('store-inventory-table'); // Assuming this table has this ID
        if (inventoryTable) {
            setupInlineFilters(inventoryTable, applyInventoryFilter);
        }
    }

    /**
     * Applies filter to the inventory table.
     * @param {number} colIndex The index of the column to filter.
     * @param {string} filterValue The value to filter by.
     */
    function applyInventoryFilter(colIndex, filterValue) {
        const rows = storeInventoryBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cellText = row.children[colIndex].textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        });
    }

    // Event listener for inventory table actions (edit/delete)
    if (storeInventoryBody) {
        storeInventoryBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editInventoryItem(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteInventoryItem(index);
            }
        });
    }

    /**
     * Opens the update inventory modal and populates it for editing.
     * @param {number} index The index of the inventory item to edit.
     */
    function editInventoryItem(index) {
        const item = inventoryItems[index];
        // Ensure your modal form inputs have these IDs in your HTML for 'update-inventory-modal'
        document.getElementById("update-store-id").value = item.storeId;
        document.getElementById("update-product-name").value = item.product;
        document.getElementById("update-current-stock").value = item.currentStock;
        document.getElementById("update-reorder-level").value = item.reorderLevel;
        document.getElementById("update-expiry-date").value = item.expiryDate;

        editInventoryItemIndex = index;
        openModal('update-inventory-modal');
    }

    /**
     * Deletes an inventory item from the data.
     * @param {number} index The index of the inventory item to delete.
     */
    function deleteInventoryItem(index) {
        if (confirm("Are you sure you want to delete this inventory item?")) {
            inventoryItems.splice(index, 1);
            localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));
            renderStoreInventoryTable();
        }
    }

    // Form submission for updating inventory (assuming a form with id 'update-inventory-form')
    if (updateInventoryForm) {
        updateInventoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let hasErrors = false;
            const storeIdInput = document.getElementById('update-store-id');
            const productNameInput = document.getElementById('update-product-name');
            const currentStockInput = document.getElementById('update-current-stock');
            const reorderLevelInput = document.getElementById('update-reorder-level');
            const expiryDateInput = document.getElementById('update-expiry-date');

            const inputs = [storeIdInput, productNameInput, currentStockInput, reorderLevelInput, expiryDateInput];
            inputs.forEach(input => {
                input.dispatchEvent(new Event('input'));
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const now = new Date();
                const inventoryData = {
                    storeId: storeIdInput.value.trim(),
                    product: productNameInput.value.trim(),
                    currentStock: parseInt(currentStockInput.value),
                    reorderLevel: parseInt(reorderLevelInput.value),
                    expiryDate: expiryDateInput.value,
                    lastSyncedDate: now.toISOString().split('T')[0],
                    lastSyncedTime: now.toTimeString().split(' ')[0].substring(0, 5)
                };

                if (editInventoryItemIndex !== null) {
                    inventoryItems[editInventoryItemIndex] = inventoryData;
                } else {
                    inventoryItems.push(inventoryData);
                }
                localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
                renderStoreInventoryTable();
                renderReorderSuggestions(); // Update suggestions after inventory change
                closeModal(updateInventoryModal, updateInventoryForm);
                editInventoryItemIndex = null;
            } else {
                alert('Please correct the errors in the form.');
            }
        });

        // Real-time validation for update inventory form
        updateInventoryForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.id === 'update-store-id') {
                if (!/^[A-Z0-9]{4,8}$/.test(target.value)) {
                    displayError(target, 'Store ID must be 4-8 uppercase alphanumeric characters.');
                } else if (!stores.some(s => s.storeId === target.value.trim())) {
                    displayError(target, 'Store ID does not exist.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'update-product-name') {
                if (target.value.trim().length < 2 || target.value.trim().length > 50) {
                    displayError(target, 'Product Name must be 2-50 characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'update-current-stock') {
                const value = parseInt(target.value);
                if (isNaN(value) || value < 0 || !Number.isInteger(value)) {
                    displayError(target, 'Current Stock must be a non-negative whole number.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'update-reorder-level') {
                const value = parseInt(target.value);
                if (isNaN(value) || value < 0 || !Number.isInteger(value)) {
                    displayError(target, 'Reorder Level must be a non-negative whole number.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'update-expiry-date') {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Compare only date part
                if (selectedDate < today) {
                    displayError(target, 'Expiry Date cannot be in the past.');
                } else {
                    clearError(target);
                }
            }
        });
    }

    /**
     * Renders the shrinkage reports table.
     */
    function renderShrinkageReportTable() {
        if (!shrinkageReportBody) return;
        shrinkageReportBody.innerHTML = "";
        shrinkageReports.forEach((report) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${report.storeId}</td>
                <td>${report.product}</td>
                <td>${report.quantityLost}</td>
                <td>${report.lossReason}</td>
                <td>${formatDate(report.reportDate)}</td>
            `;
            shrinkageReportBody.appendChild(row);
        });
        const shrinkageTable = document.getElementById('shrinkage-report-table'); // You'll need this ID in HTML
        if (shrinkageTable) {
            setupInlineFilters(shrinkageTable, applyShrinkageFilter);
        }
    }

    /**
     * Applies filter to the shrinkage table.
     * @param {number} colIndex The index of the column to filter.
     * @param {string} filterValue The value to filter by.
     */
    function applyShrinkageFilter(colIndex, filterValue) {
        const rows = shrinkageReportBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cellText = row.children[colIndex].textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        });
    }

    // Form submission for reporting shrinkage (assuming a form with id 'report-shrinkage-form')
    if (reportShrinkageForm) {
        reportShrinkageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let hasErrors = false;
            const storeIdInput = document.getElementById('shrinkage-store-id'); // Assuming these IDs in your modal HTML
            const productInput = document.getElementById('shrinkage-product');
            const quantityLostInput = document.getElementById('quantity-lost');
            const lossReasonInput = document.getElementById('loss-reason');
            const reportDateInput = document.getElementById('report-date');

            const inputs = [storeIdInput, productInput, quantityLostInput, lossReasonInput, reportDateInput];
            inputs.forEach(input => {
                input.dispatchEvent(new Event('input'));
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const shrinkageData = {
                    storeId: storeIdInput.value.trim(),
                    product: productInput.value.trim(),
                    quantityLost: parseInt(quantityLostInput.value),
                    lossReason: lossReasonInput.value,
                    reportDate: reportDateInput.value
                };
                shrinkageReports.push(shrinkageData);
                localStorage.setItem('shrinkageReports', JSON.stringify(shrinkageReports));
                renderShrinkageReportTable();
                closeModal(reportShrinkageModal, reportShrinkageForm);
            } else {
                alert('Please correct the errors in the form.');
            }
        });

        // Real-time validation for report shrinkage form
        reportShrinkageForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.id === 'shrinkage-store-id') {
                if (!/^[A-Z0-9]{4,8}$/.test(target.value)) {
                    displayError(target, 'Store ID must be 4-8 uppercase alphanumeric characters.');
                } else if (!stores.some(s => s.storeId === target.value.trim())) {
                    displayError(target, 'Store ID does not exist.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'shrinkage-product') {
                if (target.value.trim().length < 2 || target.value.trim().length > 50) {
                    displayError(target, 'Product Name must be 2-50 characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'quantity-lost') {
                const value = parseInt(target.value);
                if (isNaN(value) || value <= 0 || !Number.isInteger(value)) {
                    displayError(target, 'Quantity Lost must be a positive whole number.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'report-date') {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    displayError(target, 'Future dates are not allowed.');
                } else {
                    clearError(target);
                }
            }
        });
    }

    /**
     * Renders AI Reorder Suggestions.
     */
    function renderReorderSuggestions() {
        const reorderSuggestionsList = document.getElementById('reorder-suggestions-list');
        if (!reorderSuggestionsList) return;
        reorderSuggestionsList.innerHTML = "";

        const suggestions = [];
        inventoryItems.forEach(item => {
            if (item.currentStock <= item.reorderLevel) {
                suggestions.push(`<li>Store #${item.storeId}: Reorder ${item.product} (Current Stock: ${item.currentStock}, Reorder Level: ${item.reorderLevel})</li>`);
            }
        });

        if (suggestions.length === 0) {
            reorderSuggestionsList.innerHTML = '<li>No reorder suggestions at this time.</li>';
        } else {
            reorderSuggestionsList.innerHTML = suggestions.join('');
        }
    }


    // --- Performance & Communication Section Logic ---

    /**
     * Renders the Franchise Performance Index (FPI) table.
     */
    function renderFPITable() {
        if (!fpiTableBody) return;
        fpiTableBody.innerHTML = "";
        fpiData.forEach((data) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${data.storeId}</td>
                <td>${data.name}</td>
                <td>${data.fpiScore}</td>
                <td>${data.salesRank}</td>
                <td>${data.complianceScore}</td>
                <td>${data.attendance}%</td>
                <td>${data.timelinessRating}</td>
                <td>${data.cleanlinessRating}</td>
            `;
            fpiTableBody.appendChild(row);
        });
        const fpiTable = document.getElementById('fpi-table'); // You'll need this ID in HTML
        if (fpiTable) {
            setupInlineFilters(fpiTable, applyFPITableFilter);
        }
    }

    /**
     * Applies filter to the FPI table.
     * @param {number} colIndex The index of the column to filter.
     * @param {string} filterValue The value to filter by.
     */
    function applyFPITableFilter(colIndex, filterValue) {
        const rows = fpiTableBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cellText = row.children[colIndex].textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        });
    }


    /**
     * Renders the communication log.
     */
    function renderCommunicationLog() {
        if (!messageLogBody) return;
        messageLogBody.innerHTML = "";
        communications.forEach(comm => {
            const p = document.createElement("p");
            p.innerHTML = `<strong>${formatDate(comm.date)} - ${comm.sender} to ${comm.recipient} (${comm.subject}):</strong> ${comm.message}`;
            messageLogBody.appendChild(p);
        });
        messageLogBody.scrollTop = messageLogBody.scrollHeight; // Scroll to bottom
    }

    // Event listener for opening the send message modal (using its onclick from HTML)
    // No need to add here if you're using onclick="openModal('send-message-modal')" in HTML directly

    // Form submission for sending a message (assuming a form with id 'send-message-form')
    if (sendMessageForm) {
        sendMessageForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const messageTypeInput = document.getElementById('message-type'); // Assuming these IDs in your modal HTML
            const recipientStoreInput = document.getElementById('recipient-store');
            const messageSubjectInput = document.getElementById('message-subject');
            const messageContentInput = document.getElementById('message-text');
            const messageAttachmentInput = document.getElementById('message-attachment');
            const messageScheduleTimeInput = document.getElementById('message-schedule-time');
            const messageLanguageInput = document.getElementById('message-language');

            const inputs = [
                messageTypeInput, recipientStoreInput, messageSubjectInput,
                messageContentInput, messageLanguageInput
            ]; // Attachment and schedule are optional, can be validated separately if needed

            inputs.forEach(input => {
                input.dispatchEvent(new Event('input')); // Trigger validation
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const communicationData = {
                    date: new Date().toISOString().split('T')[0], // Current date
                    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
                    sender: "Admin", // Assuming Admin is the sender for now
                    type: messageTypeInput.value,
                    recipient: recipientStoreInput.value, // Can be "All" for broadcast
                    subject: messageSubjectInput.value.trim(),
                    message: messageContentInput.value.trim(),
                    attachment: messageAttachmentInput.files.length > 0 ? messageAttachmentInput.files[0].name : null,
                    scheduleTime: messageScheduleTimeInput.value || null,
                    language: messageLanguageInput.value
                };

                communications.push(communicationData);
                localStorage.setItem('communications', JSON.stringify(communications));
                renderCommunicationLog();
                closeModal(sendMessageModal, sendMessageForm);
            } else {
                alert('Please correct the errors in the form.');
            }
        });

        // Real-time validation for send message form
        sendMessageForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.id === 'message-recipient') { // You have a dropdown for this, adjust validation as needed
                if (target.value.trim() === '') {
                    displayError(target, 'Recipient cannot be empty.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'message-subject') {
                if (target.value.trim().length < 3 || target.value.trim().length > 100) {
                    displayError(target, 'Subject must be 3-100 characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'message-text') {
                if (target.value.trim().length < 10) {
                    displayError(target, 'Message content must be at least 10 characters.');
                } else {
                    clearError(target);
                }
            }
            // Add validation for file size for message-attachment if needed
            // Add validation for message-schedule-time if it needs to be in the future
        });
    }

    let performanceChartInstance = null; // To store the Chart.js instance

    /**
     * Renders the performance index chart (e.g., store sales over time, or average performance).
     * This is a placeholder for a more complex performance metric.
     */
    function renderPerformanceIndexChart() {
        if (!performanceIndexChartCanvas) return;

        // Example: Daily total sales as a simple performance metric
        const dailySales = {};
        salesRecords.forEach(record => {
            dailySales[record.saleDate] = (dailySales[record.saleDate] || 0) + record.totalAmount;
        });

        const sortedDates = Object.keys(dailySales).sort();
        const data = sortedDates.map(date => dailySales[date]);
        const labels = sortedDates.map(formatDate);

        if (performanceChartInstance) {
            performanceChartInstance.destroy();
        }

        performanceChartInstance = new Chart(performanceIndexChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Total Sales ($)',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.4)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
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
                            text: 'Total Sales ($)'
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
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Daily Sales Performance',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Sales: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }


    // --- Franchise Management Section Logic ---

    /**
     * Renders the franchise agreement data into the table.
     */
    function renderFranchiseAgreementTable() {
        if (!franchiseAgreementBody) return;
        franchiseAgreementBody.innerHTML = "";
        franchiseAgreements.forEach((agreement, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${agreement.agreementId}</td>
                <td>${agreement.franchiseeName}</td>
                <td>${agreement.storeId}</td>
                <td>${formatDate(agreement.startDate)}</td>
                <td>${formatDate(agreement.endDate)}</td>
                <td>${agreement.status}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            franchiseAgreementBody.appendChild(row);
        });
        const franchiseAgreementTable = document.getElementById('franchise-agreement-table'); // Assuming this table has this ID
        if (franchiseAgreementTable) {
            setupInlineFilters(franchiseAgreementTable, applyFranchiseAgreementFilter);
        }
        renderFranchiseePerformanceChart(); // Update chart
    }

    /**
     * Applies filter to the franchise agreement table.
     * @param {number} colIndex The index of the column to filter.
     * @param {string} filterValue The value to filter by.
     */
    function applyFranchiseAgreementFilter(colIndex, filterValue) {
        const rows = franchiseAgreementBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cellText = row.children[colIndex].textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        });
    }

    // Event listener for franchise agreement table actions (edit/delete)
    if (franchiseAgreementBody) {
        franchiseAgreementBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editFranchiseAgreement(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteFranchiseAgreement(index);
            }
        });
    }

    /**
     * Opens the add franchise modal and populates it for editing.
     * @param {number} index The index of the franchise agreement to edit.
     */
    function editFranchiseAgreement(index) {
        const agreement = franchiseAgreements[index];
        // Ensure your modal form inputs have these IDs in your HTML for 'add-franchise-modal'
        document.getElementById("agreement-id").value = agreement.agreementId;
        document.getElementById("franchisee-name").value = agreement.franchiseeName;
        document.getElementById("franchisee-store-id").value = agreement.storeId; // New field
        document.getElementById("agreement-start-date").value = agreement.startDate;
        document.getElementById("agreement-end-date").value = agreement.endDate;
        document.getElementById("agreement-status").value = agreement.status;

        editFranchiseAgreementIndex = index;
        openModal('add-franchise-modal');
    }

    /**
     * Deletes a franchise agreement from the data.
     * @param {number} index The index of the franchise agreement to delete.
     */
    function deleteFranchiseAgreement(index) {
        if (confirm("Are you sure you want to delete this franchise agreement?")) {
            franchiseAgreements.splice(index, 1);
            localStorage.setItem("franchiseAgreements", JSON.stringify(franchiseAgreements));
            renderFranchiseAgreementTable();
        }
    }

    // Form submission for adding/editing a franchise agreement (assuming a form with id 'add-franchise-form')
    if (addFranchiseForm) {
        addFranchiseForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const agreementIdInput = document.getElementById('agreement-id');
            const franchiseeNameInput = document.getElementById('franchisee-name');
            const franchiseeStoreIdInput = document.getElementById('franchisee-store-id'); // New field
            const agreementStartDateInput = document.getElementById('agreement-start-date');
            const agreementEndDateInput = document.getElementById('agreement-end-date');
            const agreementStatusInput = document.getElementById('agreement-status');

            const inputs = [
                agreementIdInput, franchiseeNameInput, franchiseeStoreIdInput,
                agreementStartDateInput, agreementEndDateInput, agreementStatusInput
            ];

            inputs.forEach(input => {
                input.dispatchEvent(new Event('input')); // Trigger validation
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const franchiseAgreementData = {
                    agreementId: agreementIdInput.value.trim(),
                    franchiseeName: franchiseeNameInput.value.trim(),
                    storeId: franchiseeStoreIdInput.value.trim(), // Added storeId
                    startDate: agreementStartDateInput.value,
                    endDate: agreementEndDateInput.value,
                    status: agreementStatusInput.value
                };

                if (editFranchiseAgreementIndex !== null) {
                    franchiseAgreements[editFranchiseAgreementIndex] = franchiseAgreementData;
                } else {
                    franchiseAgreements.push(franchiseAgreementData);
                }
                localStorage.setItem('franchiseAgreements', JSON.stringify(franchiseAgreements));
                renderFranchiseAgreementTable();
                closeModal(addFranchiseModal, addFranchiseForm);
                editFranchiseAgreementIndex = null;
            } else {
                alert('Please correct the errors in the form.');
            }
        });

        // Real-time validation for franchise agreement form
        addFranchiseForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.id === 'agreement-id') {
                if (!/^[A][G][0-9]{3,7}$/.test(target.value)) { // Example: AG001, AG12345
                    displayError(target, 'Agreement ID must start with "AG" followed by 3-7 digits.');
                } else if (franchiseAgreements.some(a => a.agreementId === target.value.trim() && (editFranchiseAgreementIndex === null || a !== franchiseAgreements[editFranchiseAgreementIndex]))) {
                    displayError(target, 'Agreement ID already exists.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'franchisee-name') {
                if (!/^[A-Za-z\s\-'.]{3,50}$/.test(target.value)) {
                    displayError(target, 'Franchisee Name must be 3-50 characters (letters, spaces, hyphens, apostrophes).');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'franchisee-store-id') {
                if (!/^[A-Z0-9]{4,8}$/.test(target.value)) {
                    displayError(target, 'Store ID must be 4-8 uppercase alphanumeric characters.');
                } else if (!stores.some(s => s.storeId === target.value.trim())) {
                    displayError(target, 'Store ID does not exist.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'agreement-start-date') {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    displayError(target, 'Start Date cannot be in the future.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'agreement-end-date') {
                const startDate = new Date(document.getElementById('agreement-start-date').value);
                const endDate = new Date(target.value);
                if (endDate <= startDate) {
                    displayError(target, 'End Date must be after Start Date.');
                } else {
                    clearError(target);
                }
            }
        });
    }

    /**
     * Renders the franchisee performance data into the table.
     */
    function renderFranchiseePerformanceTable() {
        if (!franchiseePerformanceBody) return;
        franchiseePerformanceBody.innerHTML = "";
        // This data would ideally be calculated or aggregated from sales, compliance, and feedback data.
        // For demonstration, let's use some dummy data or aggregate existing `fpiData` if available.
        // Assuming franchiseePerformanceBody lists aggregated data, not raw input.
        fpiData.forEach((data) => { // Using FPI data as a proxy for performance
            const row = document.createElement("tr");
            const salesPerformance = (data.salesRank && stores.length > 0) ? ((stores.length - data.salesRank + 1) / stores.length * 100).toFixed(2) : 'N/A'; // Simple rank-based performance
            const customerFeedback = data.fpiScore ? (data.fpiScore * 100 / 100).toFixed(2) : 'N/A'; // Assuming FPI score can be mapped to feedback
            row.innerHTML = `
                <td>${data.storeId}</td>
                <td>${data.name}</td>
                <td>${salesPerformance}%</td>
                <td>${data.complianceScore}</td>
                <td>${customerFeedback}%</td>
            `;
            franchiseePerformanceBody.appendChild(row);
        });
        const franchiseePerformanceTable = document.getElementById('franchisee-performance-table'); // You'll need this ID in HTML
        if (franchiseePerformanceTable) {
            setupInlineFilters(franchiseePerformanceTable, applyFranchiseePerformanceFilter);
        }
    }

    /**
     * Applies filter to the franchisee performance table.
     * @param {number} colIndex The index of the column to filter.
     * @param {string} filterValue The value to filter by.
     */
    function applyFranchiseePerformanceFilter(colIndex, filterValue) {
        const rows = franchiseePerformanceBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cellText = row.children[colIndex].textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        });
    }

    let franchiseeChartInstance = null;

    /**
     * Renders the franchisee performance chart (e.g., total sales by franchisee).
     */
    function renderFranchiseePerformanceChart() {
        if (!franchiseePerformanceChartCanvas) return;

        const salesByFranchisee = {};
        salesRecords.forEach(record => {
            const store = stores.find(s => s.storeId === record.storeId);
            if (store && store.type === 'Franchise') { // Only count sales from Franchise type stores
                // For simplicity, let's associate sales with the franchisee name if available, otherwise store ID
                const franchiseeName = franchiseAgreements.find(fa => fa.storeId === store.storeId)?.franchiseeName || store.name;
                salesByFranchisee[franchiseeName] = (salesByFranchisee[franchiseeName] || 0) + record.totalAmount;
            }
        });

        const labels = Object.keys(salesByFranchisee);
        const data = Object.values(salesByFranchisee);

        if (franchiseeChartInstance) {
            franchiseeChartInstance.destroy();
        }

        franchiseeChartInstance = new Chart(franchiseePerformanceChartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Sales ($) per Franchisee',
                    data: data,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)', // Orange
                    borderColor: 'rgba(255, 159, 64, 1)',
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
                            text: 'Total Sales ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Franchisee Name'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Franchisee Sales Performance',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Sales: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }


    // --- Initial Renders on Load ---
    renderStoreTable(); // This will also call updateDashboardCards()
    renderSalesTable();
    renderStoreInventoryTable();
    renderShrinkageReportTable();
    renderFPITable();
    renderCommunicationLog();
    renderReorderSuggestions(); // Render suggestions on load
    renderFranchiseAgreementTable();
    renderFranchiseePerformanceTable();

    // Set the initial active navigation button and section based on your HTML
    // Find the button that has 'active' class on load, and show its section
    const initialActiveButton = document.querySelector('.qc-navigation .nav-button.active');
    if (initialActiveButton) {
        const initialSectionId = initialActiveButton.getAttribute('data-section') + '-section';
        showSection(initialSectionId);
    } else {
        // Fallback to dashboard if no active button is explicitly set
        showSection('store-info-section');
    }
});