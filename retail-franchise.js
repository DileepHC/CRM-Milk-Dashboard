document.addEventListener('DOMContentLoaded', function () {
    // --- Global DOM Element References ---
    const navButtons = document.querySelectorAll('.qc-navigation .nav-button');
    // Select sections by their new IDs
    const dashboardSection = document.getElementById('store-info-section');
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

    // Modals
    const addStoreModal = document.getElementById('add-store-modal');
    const addSalesModal = document.getElementById('add-sales-modal');
    const updateInventoryModal = document.getElementById('update-inventory-modal');
    const reportShrinkageModal = document.getElementById('report-shrinkage-modal');
    const uploadInventorySheetModal = document.getElementById('upload-inventory-sheet-modal');
    const sendMessageModal = document.getElementById('send-message-modal');
    const addFranchiseModal = document.getElementById('add-franchise-modal');
    const confirmModal = document.getElementById('confirm-modal'); // New: Generic confirmation modal

    // Close buttons for modals
    const closeStoreModal = addStoreModal ? addStoreModal.querySelector('.close-button') : null;
    const closeSalesModal = addSalesModal ? addSalesModal.querySelector('.close-button') : null;
    const closeUpdateInventoryModal = updateInventoryModal ? updateInventoryModal.querySelector('.close-button') : null;
    const closeReportShrinkageModal = reportShrinkageModal ? reportShrinkageModal.querySelector('.close-button') : null;
    const closeUploadInventorySheetModal = uploadInventorySheetModal ? uploadInventorySheetModal.querySelector('.close-button') : null;
    const closeSendMessageModal = sendMessageModal ? sendMessageModal.querySelector('.close-button') : null;
    const closeFranchiseModal = addFranchiseModal ? addFranchiseModal.querySelector('.close-button') : null;
    const closeConfirmModal = confirmModal ? confirmModal.querySelector('.close-button') : null; // New: Close button for confirm modal

    // Table bodies
    const storeTableBody = document.getElementById("store-table-body");
    const salesTableBody = document.getElementById("sales-table-body");
    const storeInventoryBody = document.getElementById("store-inventory-body");
    const shrinkageReportBody = document.getElementById("shrinkage-report-body");
    const fpiTableBody = document.getElementById("fpi-table-body");
    const messageLogBody = document.getElementById("message-log");
    const franchiseAgreementBody = document.getElementById("franchise-agreement-body");
    const franchiseePerformanceBody = document.getElementById("franchisee-performance-body");

    // Forms
    const addStoreForm = document.getElementById("add-store-form");
    const addSalesForm = document.getElementById("add-sales-form");
    const updateInventoryForm = document.getElementById("update-inventory-form");
    const reportShrinkageForm = document.getElementById("report-shrinkage-form");
    const uploadInventorySheetForm = document.getElementById("upload-inventory-sheet-form");
    const sendMessageForm = document.getElementById("send-message-form");
    const addFranchiseForm = document.getElementById("add-franchise-form");

    // Chart Canvas elements
    const salesOverviewChartCanvas = document.getElementById('sales-overview-chart');
    const performanceIndexChartCanvas = document.getElementById('performance-index-chart');
    const franchiseePerformanceChartCanvas = document.getElementById('franchisee-performance-chart');

    // Other specific elements
    const activeStoresCard = document.querySelector('.dashboard-cards .active-stores .store-count');
    const inSetupStoresCard = document.querySelector('.dashboard-cards .in-setup-stores .store-count');
    const flaggedStoresCard = document.querySelector('.dashboard-cards .flagged-stores .store-count');
    const ownedStoresCard = document.querySelector('.dashboard-cards .owned-stores .store-count');
    const franchiseStoresCard = document.querySelector('.dashboard-cards .franchise-stores .store-count');

    // Datalists
    const salesStoreIdSelect = document.getElementById('sales-store-id');
    const inventoryStoreIdSelect = document.getElementById('inventory-store-id');
    const shrinkageStoreIdSelect = document.getElementById('shrinkage-store-id');
    const linkedStoreIdSelect = document.getElementById('linked-store-id');
    const productSuggestionsDatalist = document.getElementById('product-suggestions');
    const productSuggestionsInventoryDatalist = document.getElementById('product-suggestions-inventory');
    const productSuggestionsShrinkageDatalist = document.getElementById('product-suggestions-shrinkage');

    // New: Confirmation modal elements
    const confirmMessageElement = document.getElementById('confirm-message');
    const confirmOkButton = document.getElementById('confirm-ok-button');
    const confirmCancelButton = document.getElementById('confirm-cancel-button');
    let confirmCallback = null; // Stores the callback function for the confirmation modal

    // --- Data Storage Variables (Initialize from localStorage if available) ---
    let stores = localStorage.getItem("stores") ? JSON.parse(localStorage.getItem("stores")) : [];
    let salesRecords = localStorage.getItem("salesRecords") ? JSON.parse(localStorage.getItem("salesRecords")) : [];
    let inventoryItems = localStorage.getItem("inventoryItems") ? JSON.parse(localStorage.getItem("inventoryItems")) : [];
    let shrinkageReports = localStorage.getItem("shrinkageReports") ? JSON.parse(localStorage.getItem("shrinkageReports")) : [];
    let fpiData = localStorage.getItem("fpiData") ? JSON.parse(localStorage.getItem("fpiData")) : [];
    let communications = localStorage.getItem("communications") ? JSON.parse(localStorage.getItem("communications")) : [];
    let franchiseAgreements = localStorage.getItem("franchiseAgreements") ? JSON.parse(localStorage.getItem("franchiseAgreements")) : [];

    // Master list of products (Example data, you'd load this dynamically in a real app)
    const productCatalog = [
        { name: "Full Cream Milk", unitPrice: 60.00 },
        { name: "Toned Milk", unitPrice: 50.00 },
        { name: "Fresh Curd", unitPrice: 40.00 },
        { name: "Paneer (200g)", unitPrice: 120.00 },
        { name: "Butter (100g)", unitPrice: 55.00 },
        { name: "Ghee (500ml)", unitPrice: 300.00 },
        { name: "Lassi (200ml)", unitPrice: 30.00 }
    ];

    let editStoreIndex = null;
    let editSalesRecordIndex = null;
    let editInventoryItemIndex = null;
    let editFranchiseAgreementIndex = null;

    // --- Utility Functions ---

    /**
     * Hides all content sections and deactivates all navigation buttons.
     */
    function hideAllSections() {
        sections.forEach(section => {
            if (section) {
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
            hideAllSections();
            sectionToShow.style.display = 'block';
            sectionToShow.classList.add('active');
            const correspondingButton = document.querySelector(`.qc-navigation .nav-button[data-section="${id.replace('-section', '')}"]`);
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
            errorDiv.className = 'error-message';
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
            errorDiv.remove();
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
            return dateString;
        }
    }

    /**
     * Populates store ID dropdowns in various forms.
     */
    function populateStoreDropdowns() {
        const dropdowns = [salesStoreIdSelect, inventoryStoreIdSelect, shrinkageStoreIdSelect, linkedStoreIdSelect];
        dropdowns.forEach(select => {
            if (select) {
                // Clear existing options, but keep the "Select Store" default
                while (select.options.length > 1) {
                    select.remove(1);
                }
                stores.forEach(store => {
                    const option = document.createElement('option');
                    option.value = store.storeId;
                    option.textContent = `${store.storeName} (${store.storeId})`; // Use storeName from new structure
                    select.appendChild(option);
                });
            }
        });
    }

    /**
     * Populates product datalists.
     */
    function populateProductDatalists() {
        const datalists = [productSuggestionsDatalist, productSuggestionsInventoryDatalist, productSuggestionsShrinkageDatalist];
        datalists.forEach(datalist => {
            if (datalist) {
                datalist.innerHTML = ""; // Clear existing options
                productCatalog.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.name;
                    datalist.appendChild(option);
                });
            }
        });
    }

    /**
     * Sets up inline filtering for a data table.
     * @param {HTMLElement} tableElement The table element.
     * @param {function} applyFilterFunction The function to apply the filter.
     */
    function setupInlineFilters(tableElement, applyFilterFunction) {
        // Find the "Filter" button associated with this table
        const filterButton = tableElement.closest('.data-table-container').querySelector('.toggle-filter-button');
        // If there's no specific filter button, assume the header click toggles it
        if (!filterButton) {
            const headers = tableElement.querySelectorAll("thead th[data-column]");
            headers.forEach(header => {
                header.addEventListener('click', function (event) {
                    // Prevent toggling if click was on a filter input within the filter row
                    if (event.target.classList.contains('filter-input')) {
                        return;
                    }
                    const filterRow = tableElement.querySelector('thead .filter-row');
                    if (filterRow) {
                        filterRow.classList.toggle('hidden');
                        filterRow.querySelectorAll('.filter-input').forEach(input => {
                            input.value = '';
                            input.dispatchEvent(new Event('input')); // Trigger input event to clear filters
                        });
                    }
                });
            });
        }

        let filterRow = tableElement.querySelector('thead .filter-row');

        // If filterRow doesn't exist, create it
        if (!filterRow) {
            filterRow = document.createElement('tr');
            filterRow.classList.add('filter-row', 'hidden'); // Initially hidden
            const headerRow = tableElement.querySelector('thead tr');
            if (headerRow) {
                headerRow.parentNode.insertBefore(filterRow, headerRow.nextSibling);

                // Create a cell for each header column
                Array.from(headerRow.children).forEach((header, index) => {
                    const td = document.createElement('td');
                    // Check if the header has a 'data-column' attribute to make it filterable
                    if (header.hasAttribute('data-column')) {
                        const input = document.createElement('input');
                        input.type = 'text';
                        // Remove potential sort indicators from placeholder
                        input.placeholder = `Filter by ${header.textContent.trim().replace(/ \u2191|\u2193/g, '')}`;
                        input.className = 'filter-input';
                        input.setAttribute('data-col-index', index);
                        td.appendChild(input);

                        // Add input event listener for real-time filtering
                        input.addEventListener('input', function () {
                            applyFilterFunction(parseInt(this.getAttribute('data-col-index')), this.value.trim().toLowerCase());
                        });
                    }
                    filterRow.appendChild(td);
                });
            }
        }

        // If a specific filter button exists, use it to toggle
        if (filterButton) {
            filterButton.onclick = () => {
                filterRow.classList.toggle('hidden');
                // Clear all filter inputs when showing/hiding the filter row
                filterRow.querySelectorAll('.filter-input').forEach(input => {
                    input.value = '';
                    // Trigger input event to clear applied filters visually
                    input.dispatchEvent(new Event('input'));
                });
            };
        }
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
            // Populate dropdowns/datalists when opening modals that need them
            if (modalElement === addSalesModal || modalElement === updateInventoryModal ||
                modalElement === reportShrinkageModal || modalElement === addFranchiseModal) {
                populateStoreDropdowns();
                populateProductDatalists();
            }
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
            clearAllErrors(formElement);
            // Clear specific fields if needed
            if (formElement === addSalesForm) {
                document.getElementById('sales-unit-price').value = '';
                document.getElementById('sales-total-amount').value = '';
            }
            if (formElement === addStoreForm) {
                // Clear specific fields
                document.getElementById('store-name').value = '';
                document.getElementById('store-type').value = 'Company-Owned'; // Reset to default
                document.getElementById('store-status').value = 'Active'; // Reset to default
                document.getElementById('store-address').value = '';
                document.getElementById('store-city').value = '';
                document.getElementById('store-state').value = '';
                document.getElementById('store-pincode').value = '';
                document.getElementById('store-gps').value = '';
                document.getElementById('store-manager-name').value = '';
                document.getElementById('store-manager-phone').value = '';
                document.getElementById('store-manager-email').value = '';
                document.getElementById('store-opening-date').value = '';
                document.getElementById('store-working-hours-start').value = '';
                document.getElementById('store-working-hours-end').value = '';
                const storePhotoInput = document.getElementById('store-photo');
                if (storePhotoInput) {
                    storePhotoInput.value = '';
                }
            }
            // Reset compliance checkboxes in addFranchiseForm
            if (formElement === addFranchiseForm) {
                document.querySelectorAll('#add-franchise-form input[name="complianceChecklist"]').forEach(cb => cb.checked = false);
            }
        }
    }

    /**
     * Shows a custom confirmation modal.
     * @param {string} message The message to display in the confirmation modal.
     * @param {function} onConfirmCallback The callback function to execute if the user confirms.
     */
    function showConfirmModal(message, onConfirmCallback) {
        if (confirmModal && confirmMessageElement && confirmOkButton && confirmCancelButton) {
            confirmMessageElement.textContent = message;
            confirmCallback = onConfirmCallback;
            confirmModal.style.display = 'block';
        } else {
            console.error("Confirmation modal elements not found, falling back to window.confirm.");
            // Fallback to direct execution if modal elements are missing (less ideal UX)
            if (window.confirm(message)) {
                onConfirmCallback();
            }
        }
    }

    /**
     * Hides the custom confirmation modal.
     */
    function hideConfirmModal() {
        if (confirmModal) {
            confirmModal.style.display = 'none';
            confirmCallback = null; // Clear the callback
        }
    }

    // --- Core Navigation and Modal Event Listeners ---

    // Initial section display
    showSection('store-info-section'); // Initially show the Store Information section

    // Navigation button event listeners
    navButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetSectionId = this.getAttribute('data-section') + '-section';
            showSection(targetSectionId);
            // Re-render charts or update data specific to the section if needed
            if (targetSectionId === 'store-info-section') {
                renderStoreTable();
            } else if (targetSectionId === 'sales-tracking-section') {
                renderSalesTable();
                renderSalesOverviewChart();
            } else if (targetSectionId === 'inventory-sync-section') {
                renderStoreInventoryTable();
                renderShrinkageReportTable();
                renderReorderSuggestions();
            } else if (targetSectionId === 'performance-comm-section') {
                renderFPITable();
                renderCommunicationLog();
                renderPerformanceIndexChart();
            } else if (targetSectionId === 'franchise-mgmt-section') {
                renderFranchiseAgreementTable();
                renderFranchiseePerformanceTable();
                renderFranchiseePerformanceChart();
            }
        });
    });

    // Universal modal closing logic (by close button and outside click)
    [
        { modal: addStoreModal, closeBtn: closeStoreModal, form: addStoreForm, editIndex: 'editStoreIndex' },
        { modal: addSalesModal, closeBtn: closeSalesModal, form: addSalesForm, editIndex: 'editSalesRecordIndex' },
        { modal: updateInventoryModal, closeBtn: closeUpdateInventoryModal, form: updateInventoryForm, editIndex: 'editInventoryItemIndex' },
        // Corrected typo from 'reportShrageForm' to 'reportShrinkageForm'
        { modal: reportShrinkageModal, closeBtn: closeReportShrinkageModal, form: reportShrinkageForm, editIndex: null },
        { modal: uploadInventorySheetModal, closeBtn: closeUploadInventorySheetModal, form: uploadInventorySheetForm, editIndex: null },
        { modal: sendMessageModal, closeBtn: closeSendMessageModal, form: sendMessageForm, editIndex: null },
        { modal: addFranchiseModal, closeBtn: closeFranchiseModal, form: addFranchiseForm, editIndex: 'editFranchiseAgreementIndex' }
    ].forEach(({ modal, closeBtn, form, editIndex }) => {
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(modal, form);
                if (editIndex && window[editIndex] !== undefined) window[editIndex] = null;
            });
        }
        if (modal) {
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal(modal, form);
                    if (editIndex && window[editIndex] !== undefined) window[editIndex] = null;
                }
            });
        }
    });

    // New: Event listeners for the custom confirmation modal
    if (confirmOkButton) {
        confirmOkButton.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback();
            }
            hideConfirmModal();
        });
    }
    if (confirmCancelButton) {
        confirmCancelButton.addEventListener('click', () => {
            hideConfirmModal();
        });
    }
    if (closeConfirmModal) {
        closeConfirmModal.addEventListener('click', () => {
            hideConfirmModal();
        });
    }
    if (confirmModal) {
        window.addEventListener('click', (event) => {
            if (event.target === confirmModal) {
                hideConfirmModal();
            }
        });
    }


    // --- Dashboard Section Logic ---

    /**
     * Updates the counts displayed on the dashboard cards.
     */
    function updateDashboardCards() {
        if (activeStoresCard) {
            activeStoresCard.textContent = stores.filter(store => store.storeStatus === 'Active').length;
        }
        if (inSetupStoresCard) {
            inSetupStoresCard.textContent = stores.filter(store => store.storeStatus === 'In Setup').length;
        }
        if (flaggedStoresCard) {
            flaggedStoresCard.textContent = stores.filter(store => store.storeStatus === 'Flagged').length;
        }
        if (ownedStoresCard) {
            ownedStoresCard.textContent = stores.filter(store => store.storeType === 'Company-Owned').length;
        }
        if (franchiseStoresCard) {
            franchiseStoresCard.textContent = stores.filter(store => store.storeType === 'Franchise').length;
        }
    }

    // --- Store Information & Structure Section Logic ---

    /**
     * Generates a unique 4-8 digit alphanumeric store ID.
     * @returns {string} A unique store ID.
     */
    function generateStoreId() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        const length = Math.floor(Math.random() * (8 - 4 + 1)) + 4; // Random length between 4 and 8
        do {
            result = '';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
        } while (stores.some(s => s.storeId === result)); // Ensure uniqueness
        return result;
    }


    /**
     * Renders the stores data into the table.
     */
    function renderStoreTable() {
        if (!storeTableBody) return;
        storeTableBody.innerHTML = "";
        stores.forEach((store, index) => {
            const row = document.createElement("tr");
            // Combine address fields for display
            const fullAddress = `${store.storeAddress}, ${store.storeCity}, ${store.storeState} - ${store.storePincode}`;
            row.innerHTML = `
                <td>${store.storeId}</td>
                <td>${store.storeName}</td>
                <td>${store.storeType}</td>
                <td>${store.managerName}</td>
                <td>${fullAddress}</td>
                <td>${store.storeStatus}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            storeTableBody.appendChild(row);
        });
        const storeTable = document.getElementById('store-table');
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
        // Populate the form fields with existing store data
        document.getElementById("store-name").value = store.storeName;
        document.getElementById("store-type").value = store.storeType;
        document.getElementById("store-status").value = store.storeStatus;
        document.getElementById("store-address").value = store.storeAddress;
        document.getElementById("store-city").value = store.storeCity;
        document.getElementById("store-state").value = store.storeState;
        document.getElementById("store-pincode").value = store.storePincode;
        document.getElementById("store-gps").value = store.storeGps || ''; // Optional field
        document.getElementById("store-manager-name").value = store.managerName;
        document.getElementById("store-manager-phone").value = store.managerPhone;
        document.getElementById("store-manager-email").value = store.managerEmail;
        document.getElementById("store-opening-date").value = store.openingDate;
        document.getElementById("store-working-hours-start").value = store.workingHoursStart;
        document.getElementById("store-working-hours-end").value = store.workingHoursEnd;

        editStoreIndex = index; // Set the index of the store being edited
        openModal('add-store-modal'); // Open modal by its ID
    }

    /**
     * Deletes a store from the data.
     * @param {number} index The index of the store to delete.
     */
    function deleteStore(index) {
        showConfirmModal("Are you sure you want to delete this store?", () => {
            stores.splice(index, 1);
            localStorage.setItem("stores", JSON.stringify(stores));
            renderStoreTable();
        });
    }

    // Form submission for adding/editing a store
    if (addStoreForm) {
        addStoreForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;

            // Get all required input elements from the form
            const storeNameInput = document.getElementById('store-name');
            const storeTypeInput = document.getElementById('store-type');
            const storeStatusInput = document.getElementById('store-status');
            const storeAddressInput = document.getElementById('store-address');
            const storeCityInput = document.getElementById('store-city');
            const storeStateInput = document.getElementById('store-state');
            const storePincodeInput = document.getElementById('store-pincode');
            const storeGpsInput = document.getElementById('store-gps'); // Optional
            const managerNameInput = document.getElementById('store-manager-name');
            const managerPhoneInput = document.getElementById('store-manager-phone');
            const managerEmailInput = document.getElementById('store-manager-email');
            const openingDateInput = document.getElementById('store-opening-date');
            const workingHoursStartInput = document.getElementById('store-working-hours-start');
            const workingHoursEndInput = document.getElementById('store-working-hours-end');
            const storePhotoInput = document.getElementById('store-photo'); // File input

            // All inputs to validate
            const inputs = [
                storeNameInput, storeTypeInput, storeStatusInput, storeAddressInput,
                storeCityInput, storeStateInput, storePincodeInput, managerNameInput,
                managerPhoneInput, managerEmailInput, openingDateInput,
                workingHoursStartInput, workingHoursEndInput
            ];

            // Trigger validation for each input and check for errors
            inputs.forEach(input => {
                // Manually trigger the 'input' event to run the real-time validation logic
                input.dispatchEvent(new Event('input'));
                // Check if an error message div exists and has content
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            // Validate optional GPS coordinates if provided
            if (storeGpsInput.value.trim() !== '') {
                storeGpsInput.dispatchEvent(new Event('input'));
                if (document.getElementById(`${storeGpsInput.id}-error`) && document.getElementById(`${storeGpsInput.id}-error`).textContent) {
                    hasErrors = true;
                }
            }

            // Validate file input (optional, but good to have basic checks)
            if (storePhotoInput.files.length > 0) {
                const file = storePhotoInput.files[0];
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    displayError(storePhotoInput, 'File size exceeds 5MB limit.');
                    hasErrors = true;
                } else {
                    clearError(storePhotoInput);
                }
            }


            if (!hasErrors) {
                const storeData = {
                    storeId: editStoreIndex !== null ? stores[editStoreIndex].storeId : generateStoreId(), // Keep existing ID or generate new
                    storeName: storeNameInput.value.trim(),
                    storeType: storeTypeInput.value,
                    storeStatus: storeStatusInput.value,
                    storeAddress: storeAddressInput.value.trim(),
                    storeCity: storeCityInput.value.trim(),
                    storeState: storeStateInput.value.trim(),
                    storePincode: storePincodeInput.value.trim(),
                    storeGps: storeGpsInput.value.trim(),
                    managerName: managerNameInput.value.trim(),
                    managerPhone: managerPhoneInput.value.trim(),
                    managerEmail: managerEmailInput.value.trim(),
                    openingDate: openingDateInput.value,
                    workingHoursStart: workingHoursStartInput.value,
                    workingHoursEnd: workingHoursEndInput.value,
                    // Note: Storing file paths/data directly in localStorage is not recommended.
                    // For a real app, you'd upload this to a server and store the URL.
                    // For this demo, we'll just store the file name if selected.
                    storePhoto: storePhotoInput.files.length > 0 ? storePhotoInput.files[0].name : (editStoreIndex !== null ? stores[editStoreIndex].storePhoto : '')
                };

                console.log("Store data to save:", storeData); // Added for debugging
                console.log("Current stores array before push/update:", [...stores]); // Added for debugging

                if (editStoreIndex !== null) {
                    stores[editStoreIndex] = storeData;
                    console.log("Store updated at index:", editStoreIndex, stores[editStoreIndex]); // Added for debugging
                } else {
                    stores.push(storeData);
                    console.log("New store added:", storeData); // Added for debugging
                }
                localStorage.setItem('stores', JSON.stringify(stores));
                console.log("Stores saved to localStorage:", localStorage.getItem('stores')); // Added for debugging
                renderStoreTable();
                console.log("renderStoreTable() called."); // Added for debugging
                closeModal(addStoreModal, addStoreForm);
                editStoreIndex = null; // Reset edit index
            } else {
                console.log("Form has errors, preventing submission."); // Added for debugging
            }
        });

        // Real-time validation for store form
        addStoreForm.addEventListener('input', function (e) {
            const target = e.target;
            const value = target.value.trim();

            clearError(target); // Clear previous error for this input

            if (target.hasAttribute('required') && value === '') {
                displayError(target, 'This field is required.');
                return; // Stop further validation for this input if it's empty and required
            }

            if (target.id === 'store-name') {
                if (!/^[A-Za-z0-9\s]+$/.test(value)) {
                    displayError(target, 'Store Name can only contain alphanumeric characters and spaces.');
                } else if (value.length < 3 || value.length > 100) {
                    displayError(target, 'Store Name must be between 3 and 100 characters.');
                }
            } else if (target.id === 'store-address') {
                if (!/^[A-Za-z0-9\s,.-]+$/.test(value)) {
                    displayError(target, 'Address can contain letters, numbers, spaces, commas, periods, and hyphens.');
                } else if (value.length < 5 || value.length > 200) {
                    displayError(target, 'Address must be between 5 and 200 characters.');
                }
            } else if (target.id === 'store-city') {
                if (!/^[A-Za-z\s]+$/.test(value)) {
                    displayError(target, 'City can only contain letters and spaces.');
                } else if (value.length < 2 || value.length > 50) {
                    displayError(target, 'City must be between 2 and 50 characters.');
                }
            } else if (target.id === 'store-state') {
                if (!/^[A-Za-z\s]+$/.test(value)) {
                    displayError(target, 'State can only contain letters and spaces.');
                } else if (value.length < 2 || value.length > 50) {
                    displayError(target, 'State must be between 2 and 50 characters.');
                }
            } else if (target.id === 'store-pincode') {
                if (!/^[0-9]{6}$/.test(value)) {
                    displayError(target, 'Pincode must be a 6-digit number.');
                }
            } else if (target.id === 'store-gps') {
                if (value !== '' && !/^-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+$/.test(value)) {
                    displayError(target, 'GPS Coordinates must be in "latitude, longitude" format (e.g., 12.9716, 77.5946).');
                }
            } else if (target.id === 'store-manager-name') {
                if (!/^[A-Za-z\s]+$/.test(value)) {
                    displayError(target, 'Manager Name can only contain letters and spaces.');
                } else if (value.length < 3 || value.length > 50) {
                    displayError(target, 'Manager Name must be between 3 and 50 characters.');
                }
            } else if (target.id === 'store-manager-phone') {
                if (!/^[0-9]{10}$/.test(value)) {
                    displayError(target, 'Phone number must be a 10-digit number.');
                }
            } else if (target.id === 'store-manager-email') {
                // Basic email regex, browser's built-in validation is usually better
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    displayError(target, 'Please enter a valid email address.');
                }
            } else if (target.id === 'store-opening-date') {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Compare only date part
                if (selectedDate > today) {
                    displayError(target, 'Opening Date cannot be in the future.');
                }
            } else if (target.id === 'store-working-hours-start' || target.id === 'store-working-hours-end') {
                // No specific regex for time, browser handles format.
                // You might add logic to ensure end time is after start time if needed.
                const startTime = document.getElementById('store-working-hours-start').value;
                const endTime = document.getElementById('store-working-hours-end').value;

                if (startTime && endTime && startTime >= endTime) {
                    displayError(document.getElementById('store-working-hours-end'), 'End time must be after start time.');
                } else {
                    clearError(document.getElementById('store-working-hours-end'));
                    clearError(document.getElementById('store-working-hours-start'));
                }
            }
            // No validation for store-photo here, as it's handled on form submission
            // and pattern attribute is not applicable for file inputs.
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
            const storeName = stores.find(s => s.storeId === record.storeId)?.storeName || 'N/A'; // Use storeName
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
        document.getElementById("sales-entry-mode").value = record.salesEntryMode || 'Manual'; // New field, default to Manual
        document.getElementById("sales-store-id").value = record.storeId;
        // For datetime-local, you need to combine date and time if stored separately, or store as ISO string
        // Assuming saleDate and saleTime are separate from your previous code.
        document.getElementById("sale-datetime").value = `${record.saleDate}T${record.saleTime}`; // Combined for datetime-local
        document.getElementById("sales-product-sold").value = record.product; // Updated from productName
        document.getElementById("sales-units-sold").value = record.quantity; // Updated from sales-quantity
        document.getElementById("sales-unit-price").value = record.unitPrice;
        document.getElementById("sales-total-amount").value = record.totalAmount;
        document.getElementById("sales-remarks").value = record.salesRemarks || ''; // New field, optional

        editSalesRecordIndex = index;
        openModal('add-sales-modal'); // Open modal by its ID
    }

    /**
     * Deletes a sales record from the data.
     * @param {number} index The index of the sales record to delete.
     */
    function deleteSalesRecord(index) {
        showConfirmModal("Are you sure you want to delete this sales record?", () => {
            salesRecords.splice(index, 1);
            localStorage.setItem("salesRecords", JSON.stringify(salesRecords));
            renderSalesTable();
        });
    }

    // Form submission for adding/editing a sales record
    if (addSalesForm) { // Corrected form reference
        addSalesForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;

            const salesEntryModeInput = document.getElementById('sales-entry-mode');
            const storeIdInput = document.getElementById('sales-store-id');
            const saleDatetimeInput = document.getElementById('sale-datetime'); // Combined datetime
            const productSoldInput = document.getElementById('sales-product-sold'); // Updated ID
            const unitsSoldInput = document.getElementById('sales-units-sold'); // Updated ID
            const unitPriceInput = document.getElementById('sales-unit-price');
            const totalAmountInput = document.getElementById('sales-total-amount'); // For display, not direct user input
            const salesRemarksInput = document.getElementById('sales-remarks'); // Optional

            const inputs = [
                salesEntryModeInput, storeIdInput, saleDatetimeInput, productSoldInput, unitsSoldInput
            ]; // unitPrice and totalAmount are calculated/readonly

            inputs.forEach(input => {
                input.dispatchEvent(new Event('input')); // Trigger validation
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            // Specific validation for unit price and total amount if they were manually editable
            // Since they are readonly, their values will be derived from productCatalog and unitsSold
            // Ensure product is valid to get unit price
            const selectedProduct = productCatalog.find(p => p.name === productSoldInput.value.trim());
            if (!selectedProduct) {
                displayError(productSoldInput, 'Product not found in catalog.');
                hasErrors = true;
            }

            if (!hasErrors) {
                const saleDateTime = new Date(saleDatetimeInput.value);
                const salesRecordData = {
                    salesEntryMode: salesEntryModeInput.value,
                    storeId: storeIdInput.value.trim(),
                    saleDate: saleDateTime.toISOString().split('T')[0], // Extract date part
                    saleTime: saleDateTime.toTimeString().split(' ')[0].substring(0, 5), // Extract time part HH:MM
                    product: productSoldInput.value.trim(),
                    quantity: parseFloat(unitsSoldInput.value),
                    unitPrice: parseFloat(unitPriceInput.value), // Use the displayed unit price
                    totalAmount: parseFloat(totalAmountInput.value), // Use the displayed total amount
                    salesRemarks: salesRemarksInput.value.trim()
                };

                if (editSalesRecordIndex !== null) {
                    salesRecords[editSalesRecordIndex] = salesRecordData;
                } else {
                    salesRecords.push(salesRecordData);
                }
                localStorage.setItem('salesRecords', JSON.stringify(salesRecords));
                renderSalesTable();
                closeModal(addSalesModal, addSalesForm); // Corrected modal and form references
                editSalesRecordIndex = null;
            } else {
                // No generic alert needed, errors are displayed per field.
            }
        });

        // Real-time validation for sales record form
        addSalesForm.addEventListener('input', function (e) { // Corrected form reference
            const target = e.target;
            const value = target.value.trim();
            clearError(target); // Clear previous error for this input

            if (target.hasAttribute('required') && value === '') {
                displayError(target, 'This field is required.');
                return;
            }

            if (target.id === 'sales-store-id') {
                if (!stores.some(s => s.storeId === value)) {
                    displayError(target, 'Store ID does not exist.');
                }
            } else if (target.id === 'sale-datetime') {
                const selectedDateTime = new Date(value);
                const now = new Date();
                if (selectedDateTime > now) {
                    displayError(target, 'Date & Time of Sale cannot be in the future.');
                }
            } else if (target.id === 'sales-product-sold') {
                const product = productCatalog.find(p => p.name.toLowerCase() === value.toLowerCase());
                if (!product) {
                    displayError(target, 'Product not found in catalog.');
                    document.getElementById('sales-unit-price').value = '';
                    document.getElementById('sales-total-amount').value = '';
                } else {
                    document.getElementById('sales-unit-price').value = product.unitPrice.toFixed(2);
                    const unitsSold = parseFloat(document.getElementById('sales-units-sold').value);
                    if (!isNaN(unitsSold) && unitsSold > 0) {
                        document.getElementById('sales-total-amount').value = (unitsSold * product.unitPrice).toFixed(2);
                    } else {
                        document.getElementById('sales-total-amount').value = '';
                    }
                }
            } else if (target.id === 'sales-units-sold') {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue <= 0 || !Number.isInteger(numValue)) {
                    displayError(target, 'Units Sold must be a positive whole number.');
                }
                // Recalculate total amount when units sold changes
                const unitPrice = parseFloat(document.getElementById('sales-unit-price').value);
                const totalAmountField = document.getElementById('sales-total-amount');
                if (!isNaN(numValue) && numValue > 0 && !isNaN(unitPrice)) {
                    totalAmountField.value = (numValue * unitPrice).toFixed(2);
                } else {
                    totalAmountField.value = '';
                }
            }
            // unit-price and total-amount are readonly, so no direct validation needed for them.
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
        document.getElementById("inventory-store-id").value = item.storeId;
        document.getElementById("inventory-product").value = item.product;
        document.getElementById("inventory-current-stock").value = item.currentStock;
        document.getElementById("inventory-reorder-level").value = item.reorderLevel;
        document.getElementById("inventory-restock-date").value = item.restockDate || '';
        document.getElementById("inventory-expiry-date").value = item.expiryDate;

        editInventoryItemIndex = index;
        openModal('update-inventory-modal');
    }

    /**
     * Deletes an inventory item from the data.
     * @param {number} index The index of the inventory item to delete.
     */
    function deleteInventoryItem(index) {
        showConfirmModal("Are you sure you want to delete this inventory item?", () => {
            inventoryItems.splice(index, 1);
            localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));
            renderStoreInventoryTable();
            renderReorderSuggestions(); // Update suggestions after inventory change
        });
    }

    // Form submission for updating inventory
    if (updateInventoryForm) {
        updateInventoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let hasErrors = false;
            const storeIdInput = document.getElementById('inventory-store-id');
            const productInput = document.getElementById('inventory-product');
            const currentStockInput = document.getElementById('inventory-current-stock');
            const reorderLevelInput = document.getElementById('inventory-reorder-level');
            const restockDateInput = document.getElementById('inventory-restock-date');
            const expiryDateInput = document.getElementById('inventory-expiry-date');

            const inputs = [storeIdInput, productInput, currentStockInput, reorderLevelInput];
            // Add optional fields to validation check if they have content
            if (restockDateInput.value.trim() !== '') inputs.push(restockDateInput);
            if (expiryDateInput.value.trim() !== '') inputs.push(expiryDateInput);


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
                    product: productInput.value.trim(),
                    currentStock: parseInt(currentStockInput.value),
                    reorderLevel: parseInt(reorderLevelInput.value),
                    restockDate: restockDateInput.value,
                    expiryDate: expiryDateInput.value,
                    lastSyncedDate: now.toISOString().split('T')[0],
                    lastSyncedTime: now.toTimeString().split(' ')[0].substring(0, 5)
                };

                if (editInventoryItemIndex !== null) {
                    inventoryItems[editInventoryItemIndex] = inventoryData;
                } else {
                    // Check for existing inventory item for same store and product
                    const existingItemIndex = inventoryItems.findIndex(item =>
                        item.storeId === inventoryData.storeId && item.product.toLowerCase() === inventoryData.product.toLowerCase()
                    );

                    if (existingItemIndex > -1) {
                        // If exists, update it instead of adding a new one
                        inventoryItems[existingItemIndex] = inventoryData;
                    } else {
                        inventoryItems.push(inventoryData);
                    }
                }
                localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
                renderStoreInventoryTable();
                renderReorderSuggestions(); // Update suggestions after inventory change
                closeModal(updateInventoryModal, updateInventoryForm);
                editInventoryItemIndex = null;
            } else {
                // No generic alert needed, errors are displayed per field.
            }
        });

        // Real-time validation for update inventory form
        updateInventoryForm.addEventListener('input', function (e) {
            const target = e.target;
            const value = target.value.trim();
            clearError(target);

            if (target.hasAttribute('required') && value === '') {
                displayError(target, 'This field is required.');
                return;
            }

            if (target.id === 'inventory-store-id') {
                if (!stores.some(s => s.storeId === value)) {
                    displayError(target, 'Store ID does not exist.');
                }
            } else if (target.id === 'inventory-product') {
                if (!productCatalog.some(p => p.name.toLowerCase() === value.toLowerCase())) {
                    displayError(target, 'Product not found in catalog.');
                }
            } else if (target.id === 'inventory-current-stock') {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
                    displayError(target, 'Current Stock must be a non-negative whole number.');
                }
            } else if (target.id === 'inventory-reorder-level') {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
                    displayError(target, 'Minimum Reorder Level must be a non-negative whole number.');
                }
            } else if (target.id === 'inventory-restock-date') {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (value && selectedDate > today) { // Allow empty, but validate if filled
                    displayError(target, 'Restock Date cannot be in the future.');
                }
            } else if (target.id === 'inventory-expiry-date') {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (value && selectedDate < today) { // Allow empty, but validate if filled
                    displayError(target, 'Expiry Date cannot be in the past.');
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
                <td>${report.shrinkageQuantity}</td>
                <td>${report.shrinkageReason}</td>
                <td>${formatDate(report.reportDate)}</td>
                <td class="action-button-container">
                    <button class="action-button delete-button" data-index="${shrinkageReports.indexOf(report)}"><span class="material-symbols-outlined">delete</span></button>
                </td>
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

    // Event listener for shrinkage table actions (delete)
    if (shrinkageReportBody) {
        shrinkageReportBody.addEventListener('click', function (e) {
            if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteShrinkageReport(index);
            }
        });
    }

    /**
     * Deletes a shrinkage report from the data.
     * @param {number} index The index of the shrinkage report to delete.
     */
    function deleteShrinkageReport(index) {
        showConfirmModal("Are you sure you want to delete this shrinkage report?", () => {
            shrinkageReports.splice(index, 1);
            localStorage.setItem("shrinkageReports", JSON.stringify(shrinkageReports));
            renderShrinkageReportTable();
        });
    }

    // Form submission for reporting shrinkage
    if (reportShrinkageForm) {
        reportShrinkageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let hasErrors = false;
            const storeIdInput = document.getElementById('shrinkage-store-id');
            const productInput = document.getElementById('shrinkage-product');
            const shrinkageQuantityInput = document.getElementById('shrinkage-quantity');
            const shrinkageReasonInput = document.getElementById('shrinkage-reason');
            // report-date is not in the HTML, assuming current date or adding a field if needed.
            // For now, I'll use the current date.

            const inputs = [storeIdInput, productInput, shrinkageQuantityInput, shrinkageReasonInput];

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
                    shrinkageQuantity: parseInt(shrinkageQuantityInput.value),
                    shrinkageReason: shrinkageReasonInput.value,
                    reportDate: new Date().toISOString().split('T')[0] // Auto-set current date
                };
                shrinkageReports.push(shrinkageData);
                localStorage.setItem('shrinkageReports', JSON.stringify(shrinkageReports));
                renderShrinkageReportTable();
                closeModal(reportShrinkageModal, reportShrinkageForm);
            } else {
                // No generic alert needed, errors are displayed per field.
            }
        });

        // Real-time validation for report shrinkage form
        reportShrinkageForm.addEventListener('input', function (e) {
            const target = e.target;
            const value = target.value.trim();
            clearError(target);

            if (target.hasAttribute('required') && value === '') {
                displayError(target, 'This field is required.');
                return;
            }

            if (target.id === 'shrinkage-store-id') {
                if (!stores.some(s => s.storeId === value)) {
                    displayError(target, 'Store ID does not exist.');
                }
            } else if (target.id === 'shrinkage-product') {
                if (!productCatalog.some(p => p.name.toLowerCase() === value.toLowerCase())) {
                    displayError(target, 'Product not found in catalog.');
                }
            } else if (target.id === 'shrinkage-quantity') {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue <= 0 || !Number.isInteger(numValue)) {
                    displayError(target, 'Shrinkage Quantity must be a positive whole number.');
                }
            } else if (target.id === 'shrinkage-reason') {
                if (value === '') { // Assuming it's a select, ensure a selection is made
                    displayError(target, 'Please select a reason for shrinkage.');
                }
            }
            // No validation for report-date here as it's not a user input field in HTML.
        });
    }

    // Form submission for uploading inventory sheet
    if (uploadInventorySheetForm) {
        uploadInventorySheetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let hasErrors = false;
            const fileInput = document.getElementById('inventory-sheet-file');

            if (fileInput.files.length === 0) {
                displayError(fileInput, 'Please select a file to upload.');
                hasErrors = true;
            } else {
                const file = fileInput.files[0];
                const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
                const maxSize = 10 * 1024 * 1024; // 10MB

                if (!allowedTypes.includes(file.type)) {
                    displayError(fileInput, 'Invalid file type. Only Excel (.xls, .xlsx) or CSV (.csv) files are allowed.');
                    hasErrors = true;
                } else if (file.size > maxSize) {
                    displayError(fileInput, 'File size exceeds 10MB limit.');
                    hasErrors = true;
                } else {
                    clearError(fileInput);
                }
            }

            if (!hasErrors) {
                // In a real application, you would send this file to a server for processing.
                // For this demo, we'll just simulate success.
                console.log('Simulating upload of file:', fileInput.files[0].name);
                // You might parse the CSV/Excel here using a library if this was a client-side only app
                // and then update inventoryItems array.
                // For now, just close the modal.
                closeModal(uploadInventorySheetModal, uploadInventorySheetForm);
                // Optionally, re-render inventory table if you processed the file data
                // renderStoreInventoryTable();
            } else {
                // Errors are already displayed.
            }
        });

        // Real-time validation for upload inventory sheet form
        uploadInventorySheetForm.addEventListener('change', function (e) {
            const target = e.target;
            clearError(target);

            if (target.id === 'inventory-sheet-file') {
                if (target.files.length === 0) {
                    displayError(target, 'Please select a file to upload.');
                } else {
                    const file = target.files[0];
                    const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
                    const maxSize = 10 * 1024 * 1024; // 10MB

                    if (!allowedTypes.includes(file.type)) {
                        displayError(target, 'Invalid file type. Only Excel (.xls, .xlsx) or CSV (.csv) files are allowed.');
                    } else if (file.size > maxSize) {
                        displayError(target, 'File size exceeds 10MB limit.');
                    }
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
        // For demonstration, let's derive FPI data from franchiseAgreements and salesRecords
        // In a real app, FPI would be a more complex calculated metric.
        const fpiCalculatedData = franchiseAgreements.map(agreement => {
            const relevantSales = salesRecords.filter(sale => sale.storeId === agreement.linkedStoreId); // Use linkedStoreId
            const totalSales = relevantSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

            // Dummy FPI calculation based on sales and compliance
            const salesPerformanceScore = Math.min(100, (totalSales / 10000) * 100); // Example: 10k sales = 100%
            // Ensure complianceChecklist is an array before accessing length
            const complianceScore = agreement.complianceChecklist && Array.isArray(agreement.complianceChecklist) ? (agreement.complianceChecklist.length / 4) * 100 : 0; // Assuming 4 items in checklist
            const customerComplaintsScore = Math.max(0, 100 - (agreement.customerComplaintCount * 10)); // Higher complaints = lower score
            const qualityAuditScore = agreement.qualityAuditScore || 0;
            const supplyConsistencyScore = (agreement.supplyConsistencyRating / 5) * 100;

            const fpiScore = ((salesPerformanceScore * 0.3) + (complianceScore * 0.2) + (customerComplaintsScore * 0.2) + (qualityAuditScore * 0.2) + (supplyConsistencyScore * 0.1)).toFixed(2);

            return {
                storeId: agreement.linkedStoreId, // Use linkedStoreId
                name: agreement.franchiseName,
                fpiScore: parseFloat(fpiScore),
                salesRank: 0, // Placeholder, would require sorting all stores
                complianceScore: complianceScore.toFixed(0),
                attendance: 100, // Placeholder
                timelinessRating: 5, // Placeholder
                cleanlinessRating: 5 // Placeholder
            };
        });

        // Sort by FPI score for a dummy rank
        fpiCalculatedData.sort((a, b) => b.fpiScore - a.fpiScore);
        fpiCalculatedData.forEach((data, index) => {
            data.salesRank = index + 1; // Assign rank after sorting
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${data.storeId}</td>
                <td>${data.name}</td>
                <td>${data.fpiScore}</td>
                <td>${data.salesRank}</td>
                <td>${data.complianceScore}%</td>
                <td>${data.attendance}%</td>
                <td>${data.timelinessRating}</td>
                <td>${data.cleanlinessRating}</td>
            `;
            fpiTableBody.appendChild(row);
        });

        const fpiTable = document.getElementById('fpi-table');
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
            p.innerHTML = `<strong>${formatDate(comm.date)} ${comm.time} - ${comm.sender} to ${comm.recipient} (${comm.subject}):</strong> ${comm.message}`;
            messageLogBody.appendChild(p);
        });
        messageLogBody.scrollTop = messageLogBody.scrollHeight; // Scroll to bottom
    }

    // Form submission for sending a message
    if (sendMessageForm) {
        sendMessageForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const messageTypeInput = document.getElementById('message-type');
            const recipientStoreInput = document.getElementById('recipient-store');
            const messageSubjectInput = document.getElementById('message-subject');
            const messageContentInput = document.getElementById('message-text');
            const messageAttachmentInput = document.getElementById('message-attachment');
            const messageScheduleTimeInput = document.getElementById('message-schedule-time');
            const messageLanguageInput = document.getElementById('message-language');

            const inputs = [
                messageTypeInput, recipientStoreInput, messageSubjectInput,
                messageContentInput, messageLanguageInput
            ];

            inputs.forEach(input => {
                input.dispatchEvent(new Event('input')); // Trigger validation
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            // Validate optional schedule time if provided
            if (messageScheduleTimeInput.value.trim() !== '') {
                messageScheduleTimeInput.dispatchEvent(new Event('input'));
                if (document.getElementById(`${messageScheduleTimeInput.id}-error`) && document.getElementById(`${messageScheduleTimeInput.id}-error`).textContent) {
                    hasErrors = true;
                }
            }

            // Validate file input
            if (messageAttachmentInput.files.length > 0) {
                const file = messageAttachmentInput.files[0];
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    displayError(messageAttachmentInput, 'File size exceeds 5MB limit.');
                    hasErrors = true;
                } else {
                    clearError(messageAttachmentInput);
                }
            }

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
                // Errors are already displayed.
            }
        });

        // Real-time validation for send message form
        sendMessageForm.addEventListener('input', function (e) {
            const target = e.target;
            const value = target.value.trim();
            clearError(target);

            if (target.hasAttribute('required') && value === '') {
                displayError(target, 'This field is required.');
                return;
            }

            if (target.id === 'recipient-store') {
                if (value === '') {
                    displayError(target, 'Please select a recipient store.');
                } else if (value !== 'All' && !stores.some(s => s.storeId === value)) {
                    displayError(target, 'Selected Store ID does not exist.');
                }
            } else if (target.id === 'message-subject') {
                if (value.length < 3 || value.length > 100) {
                    displayError(target, 'Subject must be between 3 and 100 characters.');
                }
            } else if (target.id === 'message-text') {
                if (value.length < 10) {
                    displayError(target, 'Message content must be at least 10 characters.');
                }
            } else if (target.id === 'message-schedule-time') {
                if (value !== '') { // Only validate if a time is provided
                    const selectedDateTime = new Date(value);
                    const now = new Date();
                    if (selectedDateTime < now) {
                        displayError(target, 'Scheduled time cannot be in the past.');
                    }
                }
            }
        });

        // Event listener for file input change to validate file size/type
        if (document.getElementById('message-attachment')) {
            document.getElementById('message-attachment').addEventListener('change', function(e) {
                const target = e.target;
                clearError(target);
                if (target.files.length > 0) {
                    const file = target.files[0];
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    if (file.size > maxSize) {
                        displayError(target, 'File size exceeds 5MB limit.');
                    }
                }
            });
        }
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
                <td>${agreement.franchiseName}</td>
                <td>${agreement.linkedStoreId}</td>
                <td>${formatDate(agreement.agreementStartDate)}</td>
                <td>${formatDate(agreement.agreementEndDate)}</td>
                <td>${agreement.agreementStatus}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            franchiseAgreementBody.appendChild(row);
        });
        const franchiseAgreementTable = document.getElementById('franchise-agreement-table');
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
        // Populate the form fields with existing agreement data
        document.getElementById("franchise-name").value = agreement.franchiseName;
        document.getElementById("linked-store-id").value = agreement.linkedStoreId;
        document.getElementById("agreement-start-date").value = agreement.agreementStartDate;
        document.getElementById("agreement-end-date").value = agreement.agreementEndDate;
        document.getElementById("contract-copy").value = ''; // File input cannot be pre-filled for security
        // Clear all compliance checkboxes first
        document.querySelectorAll('#add-franchise-form input[name="complianceChecklist"]').forEach(cb => cb.checked = false);
        // Then set the ones that are in the agreement's complianceChecklist
        if (agreement.complianceChecklist) {
            agreement.complianceChecklist.forEach(item => {
                const checkbox = document.querySelector(`#add-franchise-form input[name="complianceChecklist"][value="${item}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        document.getElementById("monthly-sales-target").value = agreement.monthlySalesTarget;
        document.getElementById("customer-complaint-count").value = agreement.customerComplaintCount;
        document.getElementById("quality-audit-score").value = agreement.qualityAuditScore;
        document.getElementById("supply-consistency-rating").value = agreement.supplyConsistencyRating;
        document.getElementById("agreement-status").value = agreement.agreementStatus;

        editFranchiseAgreementIndex = index;
        openModal('add-franchise-modal');
    }

    /**
     * Deletes a franchise agreement from the data.
     * @param {number} index The index of the franchise agreement to delete.
     */
    function deleteFranchiseAgreement(index) {
        showConfirmModal("Are you sure you want to delete this franchise agreement?", () => {
            franchiseAgreements.splice(index, 1);
            localStorage.setItem("franchiseAgreements", JSON.stringify(franchiseAgreements));
            renderFranchiseAgreementTable();
        });
    }

    // Form submission for adding/editing a franchise agreement
    if (addFranchiseForm) {
        addFranchiseForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;

            const franchiseNameInput = document.getElementById('franchise-name');
            const linkedStoreIdInput = document.getElementById('linked-store-id');
            const agreementStartDateInput = document.getElementById('agreement-start-date');
            const agreementEndDateInput = document.getElementById('agreement-end-date');
            const contractCopyInput = document.getElementById('contract-copy');
            const monthlySalesTargetInput = document.getElementById('monthly-sales-target');
            const customerComplaintCountInput = document.getElementById('customer-complaint-count');
            const qualityAuditScoreInput = document.getElementById('quality-audit-score');
            const supplyConsistencyRatingInput = document.getElementById('supply-consistency-rating');
            const agreementStatusInput = document.getElementById('agreement-status');

            // Collect all compliance checkboxes
            const complianceCheckboxes = document.querySelectorAll('#add-franchise-form input[name="complianceChecklist"]:checked');
            const complianceChecklistValues = Array.from(complianceCheckboxes).map(cb => cb.value);

            const inputs = [
                franchiseNameInput, linkedStoreIdInput, agreementStartDateInput, agreementEndDateInput,
                monthlySalesTargetInput, customerComplaintCountInput, qualityAuditScoreInput,
                supplyConsistencyRatingInput, agreementStatusInput
            ];

            inputs.forEach(input => {
                input.dispatchEvent(new Event('input')); // Trigger validation
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            // Specific validation for contract copy file input
            if (contractCopyInput.files.length === 0 && editFranchiseAgreementIndex === null) {
                displayError(contractCopyInput, 'Contract Copy is required for new agreements.');
                hasErrors = true;
            } else if (contractCopyInput.files.length > 0) {
                const file = contractCopyInput.files[0];
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.type !== 'application/pdf') {
                    displayError(contractCopyInput, 'Only PDF files are allowed.');
                    hasErrors = true;
                } else if (file.size > maxSize) {
                    displayError(contractCopyInput, 'File size exceeds 5MB limit.');
                    hasErrors = true;
                } else {
                    clearError(contractCopyInput);
                }
            }

            // Validate compliance checklist (at least one must be checked if required)
            if (complianceChecklistValues.length === 0) {
                // Find the first checkbox in the group to attach the error message
                const firstCheckbox = document.querySelector('#add-franchise-form input[name="complianceChecklist"]');
                if (firstCheckbox) {
                    displayError(firstCheckbox, 'At least one compliance item must be checked.');
                    hasErrors = true;
                }
            } else {
                 // Clear error if previously displayed
                 const firstCheckbox = document.querySelector('#add-franchise-form input[name="complianceChecklist"]');
                 if (firstCheckbox) {
                    clearError(firstCheckbox);
                 }
            }


            if (!hasErrors) {
                const franchiseAgreementData = {
                    agreementId: editFranchiseAgreementIndex !== null ? franchiseAgreements[editFranchiseAgreementIndex].agreementId : `AG${Date.now().toString().slice(-7)}`, // Simple unique ID
                    franchiseName: franchiseNameInput.value.trim(),
                    linkedStoreId: linkedStoreIdInput.value,
                    agreementStartDate: agreementStartDateInput.value,
                    agreementEndDate: agreementEndDateInput.value,
                    contractCopy: contractCopyInput.files.length > 0 ? contractCopyInput.files[0].name : (editFranchiseAgreementIndex !== null ? franchiseAgreements[editFranchiseAgreementIndex].contractCopy : null),
                    complianceChecklist: complianceChecklistValues,
                    monthlySalesTarget: parseInt(monthlySalesTargetInput.value),
                    customerComplaintCount: parseInt(customerComplaintCountInput.value),
                    qualityAuditScore: parseInt(qualityAuditScoreInput.value),
                    supplyConsistencyRating: parseInt(supplyConsistencyRatingInput.value),
                    agreementStatus: agreementStatusInput.value
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
                // Errors are already displayed.
            }
        });

        // Real-time validation for franchise agreement form
        addFranchiseForm.addEventListener('input', function (e) {
            const target = e.target;
            const value = target.value.trim();
            clearError(target);

            if (target.hasAttribute('required') && value === '' && target.type !== 'file' && target.type !== 'checkbox') {
                displayError(target, 'This field is required.');
                return;
            }

            if (target.id === 'franchise-name') {
                if (!/^[A-Za-z\s]+$/.test(value)) {
                    displayError(target, 'Franchise Name can only contain letters and spaces.');
                } else if (value.length < 3 || value.length > 100) {
                    displayError(target, 'Franchise Name must be between 3 and 100 characters.');
                }
            } else if (target.id === 'linked-store-id') {
                if (!stores.some(s => s.storeId === value)) {
                    displayError(target, 'Selected Store ID does not exist.');
                }
            } else if (target.id === 'agreement-start-date') {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    displayError(target, 'Agreement Start Date cannot be in the future.');
                }
                // Also re-validate end date if start date changes
                const endDateInput = document.getElementById('agreement-end-date');
                if (endDateInput.value) {
                    endDateInput.dispatchEvent(new Event('input'));
                }
            } else if (target.id === 'agreement-end-date') {
                const startDate = new Date(document.getElementById('agreement-start-date').value);
                const endDate = new Date(value);
                if (endDate <= startDate) {
                    displayError(target, 'Agreement End Date must be after Start Date.');
                }
            } else if (target.id === 'monthly-sales-target') {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 0 || numValue > 100) {
                    displayError(target, 'Monthly Sales Target must be a number between 0 and 100.');
                }
            } else if (target.id === 'customer-complaint-count') {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
                    displayError(target, 'Customer Complaint Count must be a non-negative whole number.');
                }
            } else if (target.id === 'quality-audit-score') {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 0 || numValue > 100) {
                    displayError(target, 'Quality Audit Score must be a number between 0 and 100.');
                }
            } else if (target.id === 'supply-consistency-rating') {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 1 || numValue > 5 || !Number.isInteger(numValue)) {
                    displayError(target, 'Supply Consistency Rating must be a whole number between 1 and 5.');
                }
            }
        });

        // Special handling for checkbox group validation (on change, not just input)
        const complianceCheckboxes = document.querySelectorAll('#add-franchise-form input[name="complianceChecklist"]');
        complianceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const checkedCount = document.querySelectorAll('#add-franchise-form input[name="complianceChecklist"]:checked').length;
                const firstCheckbox = document.querySelector('#add-franchise-form input[name="complianceChecklist"]');
                if (firstCheckbox) { // Ensure the element exists before trying to display error
                    if (checkedCount === 0) {
                        displayError(firstCheckbox, 'At least one compliance item must be checked.');
                    } else {
                        clearError(firstCheckbox);
                    }
                }
            });
        });

        // Event listener for contract copy file input change to validate file size/type
        if (document.getElementById('contract-copy')) {
            document.getElementById('contract-copy').addEventListener('change', function(e) {
                const target = e.target;
                clearError(target);
                if (target.files.length > 0) {
                    const file = target.files[0];
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    if (file.type !== 'application/pdf') {
                        displayError(target, 'Only PDF files are allowed.');
                    } else if (file.size > maxSize) {
                        displayError(target, 'File size exceeds 5MB limit.');
                    }
                }
            });
        }
    }

    /**
     * Renders the franchisee performance data into the table.
     */
    function renderFranchiseePerformanceTable() {
        if (!franchiseePerformanceBody) return;
        franchiseePerformanceBody.innerHTML = "";
        // This data would ideally be calculated or aggregated from sales, compliance, and feedback data.
        // For demonstration, let's use some dummy data or aggregate existing `franchiseAgreements` and `salesRecords`.
        const franchiseePerformanceData = franchiseAgreements.map(agreement => {
            const relevantSales = salesRecords.filter(sale => sale.storeId === agreement.linkedStoreId);
            const totalSales = relevantSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

            // Calculate sales performance percentage based on monthly target
            const salesPerformance = agreement.monthlySalesTarget || 0; // Directly use the target met %

            // Customer feedback could be derived from complaint count
            const customerFeedbackScore = Math.max(0, 100 - (agreement.customerComplaintCount * 5)); // Example: 1 complaint = -5 points

            return {
                storeId: agreement.linkedStoreId,
                franchiseName: agreement.franchiseName,
                salesPerformance: salesPerformance.toFixed(2), // Already a percentage
                complianceScore: agreement.qualityAuditScore.toFixed(2), // Using quality audit score as proxy
                customerFeedback: customerFeedbackScore.toFixed(2)
            };
        });

        franchiseePerformanceData.forEach((data) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${data.storeId}</td>
                <td>${data.franchiseName}</td>
                <td>${data.salesPerformance}%</td>
                <td>${data.complianceScore}%</td>
                <td>${data.customerFeedback}%</td>
            `;
            franchiseePerformanceBody.appendChild(row);
        });
        const franchiseePerformanceTable = document.getElementById('franchisee-performance-table');
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
            if (store && store.storeType === 'Franchise') { // Only count sales from Franchise type stores
                const franchiseeAgreement = franchiseAgreements.find(fa => fa.linkedStoreId === store.storeId);
                const franchiseeName = franchiseeAgreement ? franchiseeAgreement.franchiseName : store.storeName; // Use franchise name if agreement exists
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
