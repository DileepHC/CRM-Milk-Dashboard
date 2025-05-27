document.addEventListener('DOMContentLoaded', function () {
    const navButtons = document.querySelectorAll('.qc-navigation .nav-button');
    const sections = document.querySelectorAll('.content > section');
    const modalFarmer = document.getElementById('add-farmer-modal');
    const modalMilkRecord = document.getElementById('add-milk-record-modal');
    const modalPayment = document.getElementById('add-payment-modal');
    const closeFarmerModal = modalFarmer.querySelector('.close-button');
    const closeMilkRecordModal = modalMilkRecord.querySelector('.close-button');
    const closePaymentModal = modalPayment.querySelector('.close-button');

    // Function to hide all sections
    function hideAllSections() {
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
    }

    // Function to show a specific section
    function showSection(id) {
        const sectionToShow = document.getElementById(id);
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
            sectionToShow.classList.add('active');
        }
    }

    // Navigation button event listeners
    navButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetSectionId = this.getAttribute('data-section');
            hideAllSections();
            showSection(targetSectionId);
            this.classList.add('active');
        });
    });

    // Modal open functions
    window.openAddFarmerModal = function () {
        modalFarmer.style.display = 'block';
    };

    window.openAddMilkRecordModal = function () {
        modalMilkRecord.style.display = 'block';
    };

    window.openAddPaymentModal = function () {
        modalPayment.style.display = 'block';
    };

    // Modal close functions
    closeFarmerModal.addEventListener('click', function () {
        modalFarmer.style.display = 'none';
    });

    closeMilkRecordModal.addEventListener('click', function () {
        modalMilkRecord.style.display = 'none';
    });

    closePaymentModal.addEventListener('click', function () {
        modalPayment.style.display = 'none';
    });

    // Close modal if clicked outside
    window.addEventListener('click', function (event) {
        if (event.target === modalFarmer) {
            modalFarmer.style.display = 'none';
        }
        if (event.target === modalMilkRecord) {
            modalMilkRecord.style.display = 'none';
        }
        if (event.target === modalPayment) {
            modalPayment.style.display = 'none';
        }
    });

    // --- Implement the core logic from the previous JavaScript code here ---

    // ----------------------
    // DOM Element References (within the active content area)
    // ----------------------
    const farmerTableBody = document.getElementById("farmer-table-body");
    const paymentTableBody = document.getElementById("payment-history-table-body");
    const milkRecordsTableBody = document.getElementById("milk-records-table-body");

    const addFarmerForm = document.getElementById("add-farmer-form");
    const addMilkRecordForm = document.getElementById("add-milk-record-form");
    const addPaymentForm = document.getElementById("add-payment-form");

    const paymentMethodSelect = document.getElementById("payment-method");
    const receiptUploadContainer = document.getElementById("receipt-upload-container");
    const receiptInput = document.getElementById("payment-receipt");

    const milkQuantityChartCanvas = document.getElementById('milk-quantity-chart');
    const paymentModeChartCanvas = document.getElementById('payment-mode-chart');
    const leaderboardTableBody = document.getElementById('leaderboard-table-body');
    const farmerScorecardChartCanvas = document.getElementById('farmer-scorecard-chart');
    const heatmapContainer = document.getElementById('heatmap-container');
    const messageList = document.getElementById('message-list');

    // ----------------------
    // Data Storage Variables (Initialize from localStorage if available)
    // ----------------------
    let farmers = localStorage.getItem("farmers") ? JSON.parse(localStorage.getItem("farmers")) : [];
    let milkSupplies = localStorage.getItem("milkSupplies") ? JSON.parse(localStorage.getItem("milkSupplies")) : [];
    let payments = localStorage.getItem("payments") ? JSON.parse(localStorage.getItem("payments")) : [];
    let messages = localStorage.getItem("messages") ? JSON.parse(localStorage.getItem("messages")) : [];

    let editFarmerIndex = null;
    let editMilkRecordIndex = null;

    // ----------------------
    // Utility Functions
    // ----------------------
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

    function clearError(inputElement) {
        const errorDivId = `${inputElement.id}-error`;
        const errorDiv = document.getElementById(errorDivId);
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    }

    function setupInlineFilters(tableElement, applyFilterFunction) {
        const headers = tableElement.querySelectorAll("thead th.filterable");
        headers.forEach(header => {
            header.addEventListener("click", () => {
                const dataType = header.getAttribute("data-type");
                const colIndex = Array.from(header.parentNode.children).indexOf(header);
                const column = header.getAttribute("data-column");

                // Toggle filter row visibility
                const filterRow = header.closest('thead').querySelector('.filter-row');
                if (filterRow) {
                    filterRow.classList.toggle('hidden');
                    const filterInput = filterRow.querySelectorAll('.filter-input');
                    filterInput.forEach(input => {
                        input.value = ''; // Clear previous filter values
                        input.dispatchEvent(new Event('input')); // Trigger filter
                    });
                }
            });
        });

        const filterInputs = tableElement.querySelectorAll('thead .filter-row .filter-input');
        filterInputs.forEach(input => {
            input.addEventListener('input', function() {
                const colIndex = Array.from(this.closest('tr').children).indexOf(this.closest('td'));
                applyFilterFunction(colIndex, this.value.trim().toLowerCase());
            });
        });
    }

   // ----------------------
    // Farmer Database Section Logic
    // ----------------------

    function renderFarmerTable() {
        if (!farmerTableBody) return;
        farmerTableBody.innerHTML = "";
        farmers.forEach((farmer, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${farmer.farmerId}</td>
                <td>${farmer.name}</td>
                <td>${farmer.contact}</td>
                <td>${farmer.location}</td>
                <td>${farmer.bankDetails.bankName}</td>
                <td>${farmer.bankDetails.ifsc}</td>
                <td>${farmer.bankDetails.accountNumber}</td>
                <td>${farmer.aadharNumber}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            farmerTableBody.appendChild(row);
        });
        const farmerTable = document.getElementById('farmer-table');
        if (farmerTable) {
            setupInlineFilters(farmerTable, applyFarmerFilter);
        }
    }

    function applyFarmerFilter(colIndex, filterValue) {
        const rows = farmerTableBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cellText = row.children[colIndex].textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        });
    }

    if (farmerTableBody) {
        farmerTableBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editFarmer(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteFarmer(index);
            }
        });
    }

    function openAddFarmerModal() {
        const modal = document.getElementById('add-farmer-modal');
        if (modal) {
            modal.style.display = "block";
        }
    }

    function closeAddFarmerModal() {
        const modal = document.getElementById('add-farmer-modal');
        const form = document.getElementById('add-farmer-form');
        if (modal && form) {
            modal.style.display = "none";
            form.reset();
            clearAllErrors(form); // Clear any previous error messages
            editFarmerIndex = null; // Reset edit index when closing
        }
    }

    function editFarmer(index) {
        const farmer = farmers[index];
        document.getElementById("farmer-name").value = farmer.name;
        document.getElementById("farmer-id").value = farmer.farmerId;
        document.getElementById("contact").value = farmer.contact;
        document.getElementById("location").value = farmer.location;
        document.getElementById("bank-name").value = farmer.bankDetails.bankName;
        document.getElementById("ifsc").value = farmer.bankDetails.ifsc;
        document.getElementById("account-number").value = farmer.bankDetails.accountNumber;
        document.getElementById("aadhar-number").value = farmer.aadharNumber;
        editFarmerIndex = index;
        openAddFarmerModal();
    }

    function deleteFarmer(index) {
        if (confirm("Are you sure you want to delete this farmer?")) {
            farmers.splice(index, 1);
            localStorage.setItem("farmers", JSON.stringify(farmers));
            renderFarmerTable();
        }
    }

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

    function clearError(inputElement) {
        const errorDivId = `${inputElement.id}-error`;
        const errorDiv = document.getElementById(errorDivId);
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }

    function clearAllErrors(formElement) {
        const errorMessages = formElement.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
    }

    if (addFarmerForm) {
        addFarmerForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.id === 'farmer-name') {
                if (!/^[A-Za-z\s\-']+$/.test(target.value) || target.value.length > 25) {
                    displayError(target, 'Invalid Farmer Name (max 25 characters, letters, spaces, hyphens, apostrophes only).');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'farmer-id') {
                if (!/^[A-Za-z0-9]{5}$/.test(target.value)) {
                    displayError(target, 'Farmer ID must be 5 alphanumeric characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'contact') {
                if (!/^[6-9]{1}[0-9]{9}$/.test(target.value)) {
                    displayError(target, 'Contact must be a 10-digit number starting with 6-9.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'bank-name') {
                if (target.value.length > 50) {
                    displayError(target, 'Bank Name should not exceed 50 characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'ifsc') {
                if (!/^[A-Z0-9]{11}$/.test(target.value)) {
                    displayError(target, 'IFSC must be 11 uppercase alphanumeric characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'account-number') {
                if (!/^[A-Za-z0-9]{5,20}$/.test(target.value)) {
                    displayError(target, 'Account Number must be 5-20 alphanumeric characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'aadhar-number') {
                if (!/^[0-9]{12}$/.test(target.value)) {
                    displayError(target, 'Aadhar Number must be a 12-digit number.');
                } else {
                    clearError(target);
                }
            } else if (target.type === 'date') {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Compare only the date part
                if (selectedDate > today) {
                    displayError(target, 'Future dates are not allowed.');
                } else {
                    clearError(target);
                }
            } else if (target.type === 'number') {
                if (isNaN(parseFloat(target.value)) || !isFinite(target.value)) {
                    displayError(target, 'Please enter a valid number.');
                } else {
                    clearError(target);
                }
            }
        });

        addFarmerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const nameInput = document.getElementById('farmer-name');
            const idInput = document.getElementById('farmer-id');
            const contactInput = document.getElementById('contact');
            const locationInput = document.getElementById('location');
            const bankNameInput = document.getElementById('bank-name');
            const ifscInput = document.getElementById('ifsc');
            const accountNumberInput = document.getElementById('account-number');
            const aadharNumberInput = document.getElementById('aadhar-number');
            const inputs = [nameInput, idInput, contactInput, locationInput, bankNameInput, ifscInput, accountNumberInput, aadharNumberInput];

            inputs.forEach(input => {
                // Trigger the input event listener to check for errors
                input.dispatchEvent(new Event('input'));
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const farmerData = {
                    farmerId: idInput.value.trim(),
                    name: nameInput.value.trim(),
                    contact: contactInput.value.trim(),
                    location: locationInput.value.trim(),
                    bankDetails: {
                        bankName: bankNameInput.value.trim(),
                        ifsc: ifscInput.value.trim(),
                        accountNumber: accountNumberInput.value.trim()
                    },
                    aadharNumber: aadharNumberInput.value.trim()
                };

                if (editFarmerIndex !== null) {
                    farmers[editFarmerIndex] = farmerData;
                    editFarmerIndex = null;
                } else {
                    farmers.push(farmerData);
                }
                localStorage.setItem('farmers', JSON.stringify(farmers));
                renderFarmerTable();
                addFarmerForm.reset();
                closeAddFarmerModal();
            } else {
                alert('Please correct the errors in the form.');
            }
        });
    }

    // Event listener for opening the Add Farmer modal
    const addFarmerButton = document.querySelector('.controls .inline-add-button');
    if (addFarmerButton) {
        addFarmerButton.addEventListener('click', openAddFarmerModal);
    }

    // Event listener for closing the Add Farmer modal by clicking the close button
    const closeFarmerModalButton = document.querySelector('#add-farmer-modal .close-button');
    if (closeFarmerModalButton) {
        closeFarmerModalButton.addEventListener('click', closeAddFarmerModal);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('add-farmer-modal');
        if (modal && event.target === modal) {
            closeAddFarmerModal();
        }
    });

    // ----------------------
    // Milk Supply Tracking Section Logic
    // ----------------------

    function renderMilkRecordsTable() {
        if (!milkRecordsTableBody) return;
        milkRecordsTableBody.innerHTML = "";
        milkSupplies.forEach((record, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${record.farmerId}</td>
                <td>${formatDate(record.supplyDate)}</td>
                <td>${record.milkQuantity}</td>
                <td>${record.fatContent}</td>
                <td>${record.snfValue}</td>
                <td>${record.pricePerLiter.toFixed(2)}</td>
                <td>${record.totalPrice ? record.totalPrice.toFixed(2) : (record.milkQuantity * record.pricePerLiter).toFixed(2)}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            milkRecordsTableBody.appendChild(row);
        });
        const milkRecordsTable = document.getElementById('milk-records-table');
        if (milkRecordsTable) {
            setupInlineFilters(milkRecordsTable, applyMilkRecordFilter);
        }
        renderMilkQuantityChart();
    }

    function applyMilkRecordFilter(colIndex, filterValue) {
        const rows = milkRecordsTableBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cellText = row.children[colIndex].textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        });
    }

    if (milkRecordsTableBody) {
        milkRecordsTableBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editMilkRecord(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteMilkRecord(index);
            }
        });
    }

    function openAddMilkRecordModal() {
        const modal = document.getElementById('add-milk-record-modal');
        const supplyDateInput = document.getElementById('milk-date');
        if (modal && supplyDateInput) {
            modal.style.display = "block";
            // Set the maximum date for the supply date input to today
            const today = new Date().toISOString().split('T')[0];
            supplyDateInput.setAttribute('max', today);
        }
    }

    function closeAddMilkRecordModal() {
        const modal = document.getElementById('add-milk-record-modal');
        const form = document.getElementById('add-milk-record-form');
        if (modal && form) {
            modal.style.display = "none";
            form.reset();
            clearAllErrors(form); // Clear any previous error messages
            editMilkRecordIndex = null; // Reset edit index when closing
        }
    }

    function editMilkRecord(index) {
        const record = milkSupplies[index];
        document.getElementById("milk-farmer").value = record.farmerId;
        document.getElementById("milk-date").value = record.supplyDate;
        document.getElementById("milk-quantity").value = record.milkQuantity;
        document.getElementById("fat-content").value = record.fatContent;
        document.getElementById("snf-value").value = record.snfValue;
        document.getElementById("price-per-liter").value = record.pricePerLiter;
        editMilkRecordIndex = index;
        openAddMilkRecordModal();
    }

    function deleteMilkRecord(index) {
        if (confirm("Are you sure you want to delete this milk record?")) {
            milkSupplies.splice(index, 1);
            localStorage.setItem("milkSupplies", JSON.stringify(milkSupplies));
            renderMilkRecordsTable();
        }
    }

    function openBulkMilkEntryModal() {
        // In a real application, this would display a modal for bulk entry.
        alert("Bulk Milk Entry Modal would be opened here (Implementation needed).");
        // Future implementation would involve:
        // 1. Displaying a modal with options to upload an Excel file.
        // 2. Handling the file upload and parsing (e.g., using a library like SheetJS).
        // 3. Validating the data from the Excel file.
        // 4. Adding the valid milk records to the `milkSupplies` array.
        // 5. Updating `localStorage` and re-rendering the table.
    }

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

    function clearError(inputElement) {
        const errorDivId = `${inputElement.id}-error`;
        const errorDiv = document.getElementById(errorDivId);
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }

    function clearAllErrors(formElement) {
        const errorMessages = formElement.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
    }

    if (addMilkRecordForm) {
        addMilkRecordForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.id === 'milk-farmer') {
                if (!/^[A-Za-z0-9]{5}$/.test(target.value)) {
                    displayError(target, 'Farmer ID must be 5 alphanumeric characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'milk-date') {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for accurate date comparison
                selectedDate.setHours(0, 0, 0, 0); // Do the same for the selected date
                if (selectedDate > today) {
                    displayError(target, 'Future dates are not allowed.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'milk-quantity') {
                const value = parseFloat(target.value);
                if (isNaN(value) || value <= 0) {
                    displayError(target, 'Quantity must be a positive number.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'fat-content') {
                const value = parseFloat(target.value);
                if (isNaN(value) || value < 0 || value > 100) {
                    displayError(target, 'Fat Content must be a number between 0 and 100.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'snf-value') {
                const value = parseFloat(target.value);
                if (isNaN(value) || value < 0 || value > 100) {
                    displayError(target, 'SNF Value must be a number between 0 and 100.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'price-per-liter') {
                const value = parseFloat(target.value);
                if (isNaN(value) || value <= 0) {
                    displayError(target, 'Price per Liter must be a positive number.');
                } else {
                    clearError(target);
                }
            }
        });

        addMilkRecordForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const farmerIdInput = document.getElementById('milk-farmer');
            const supplyDateInput = document.getElementById('milk-date');
            const quantityInput = document.getElementById('milk-quantity');
            const fatContentInput = document.getElementById('fat-content');
            const snfValueInput = document.getElementById('snf-value');
            const pricePerLiterInput = document.getElementById('price-per-liter');
            const inputs = [farmerIdInput, supplyDateInput, quantityInput, fatContentInput, snfValueInput, pricePerLiterInput];

            inputs.forEach(input => {
                input.dispatchEvent(new Event('input'));
                if (document.getElementById(`${input.id}-error`) && document.getElementById(`${input.id}-error`).textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const milkRecordData = {
                    farmerId: farmerIdInput.value.trim(),
                    supplyDate: supplyDateInput.value,
                    milkQuantity: parseFloat(quantityInput.value),
                    fatContent: parseFloat(fatContentInput.value),
                    snfValue: parseFloat(snfValueInput.value),
                    pricePerLiter: parseFloat(pricePerLiterInput.value),
                    totalPrice: parseFloat(quantityInput.value) * parseFloat(pricePerLiterInput.value)
                };

                if (editMilkRecordIndex !== null) {
                    milkSupplies[editMilkRecordIndex] = milkRecordData;
                    editMilkRecordIndex = null;
                } else {
                    milkSupplies.push(milkRecordData);
                }
                localStorage.setItem('milkSupplies', JSON.stringify(milkSupplies));
                renderMilkRecordsTable();
                addMilkRecordForm.reset();
                closeAddMilkRecordModal(); // Close the modal after successful submission
            } else {
                alert('Please correct the errors in the form.');
            }
        });
    }

    function renderMilkQuantityChart() {
        if (!milkQuantityChartCanvas) return;
        const farmerQuantities = {};
        milkSupplies.forEach(record => {
            farmerQuantities[record.farmerId] = (farmerQuantities[record.farmerId] || 0) + record.milkQuantity;
        });

        const labels = Object.keys(farmerQuantities);
        const data = Object.values(farmerQuantities);

        new Chart(milkQuantityChartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Milk Quantity (Liters) per Farmer',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true, // Ensure chart adapts to container size
                maintainAspectRatio: false, // Allow chart to take the defined height
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Quantity (Liters)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Farmer ID'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true, // Show the legend
                        position: 'bottom', // Position the legend at the bottom
                    },
                    title: {
                        display: true,
                        text: 'Total Milk Quantity per Farmer',
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    }
                }
            }
        });
    }

    // Event listeners
    const addMilkRecordButton = document.querySelector('#milk-tracking-section .controls .inline-add-button');
    if (addMilkRecordButton) {
        addMilkRecordButton.addEventListener('click', () => {
            openAddMilkRecordModal();
            editMilkRecordIndex = null; // Ensure we are in "add" mode when clicking "Add Record"
            if (addMilkRecordForm) {
                addMilkRecordForm.reset();
                clearAllErrors(addMilkRecordForm);
            }
        });
    }

    const closeMilkRecordModalButton = document.querySelector('#add-milk-record-modal .close-button');
    if (closeMilkRecordModalButton) {
        closeMilkRecordModalButton.addEventListener('click', closeAddMilkRecordModal);
    }

    window.addEventListener('click', function (event) {
        const modal = document.getElementById('add-milk-record-modal');
        if (modal && event.target === modal) {
            closeAddMilkRecordModal();
        }
    });

    const bulkEntryButton = document.querySelector('#milk-tracking-section .bulk-entry-container .bulk-entry-button');
    if (bulkEntryButton) {
        bulkEntryButton.addEventListener('click', openBulkMilkEntryModal);
    }
    // ----------------------
    // Payment Management Section Logic
    // ----------------------
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', function () {
            if (["cheque", "online", "card", "upi"].includes(this.value)) {
                receiptUploadContainer.style.display = 'block';
                receiptInput.setAttribute("required", "required");
            } else {
                receiptUploadContainer.style.display = 'none';
                receiptInput.removeAttribute("required");
                clearError(receiptInput);
            }
        });
    }

    function renderPaymentHistoryTable() {
        if (!paymentTableBody) return;
        paymentTableBody.innerHTML = "";
        payments.forEach(payment => {
            const row = document.createElement("tr");
            let receiptContent = 'N/A';
            if (payment.receiptData) {
                const link = document.createElement('a');
                link.href = payment.receiptData;
                link.target = '_blank';
                link.textContent = 'View Receipt';
                receiptContent = link.outerHTML;
            }
            row.innerHTML = `
                <td>${payment.farmerId}</td>
                <td>${formatDate(payment.date)}</td>
                <td>${payment.paymentMethod}</td>
                <td>${payment.transactionId || 'N/A'}</td>
                <td>${payment.amount.toFixed(2)}</td>
                <td>${payment.remarks || 'N/A'}</td>
                <td>${receiptContent}</td>
            `;
            paymentTableBody.appendChild(row);
        });
        const paymentHistoryTable = document.getElementById('payment-history-table');
        if (paymentHistoryTable) {
            setupInlineFilters(paymentHistoryTable, applyPaymentFilter);
        }
        renderPaymentModeChart();
    }

    function applyPaymentFilter(colIndex, filterValue) {
        const rows = paymentTableBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cellText = row.children[colIndex].textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        });
    }

    if (addPaymentForm) {
        addPaymentForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.id === 'payment-farmer') {
                if (!/^[A-Za-z0-9]{5}$/.test(target.value)) {
                    displayError(target, 'Farmer ID must be 5 alphanumeric characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'payment-date') {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate.getTime() !== today.getTime()) { // Corrected condition
                    displayError(target, 'Only today\'s date is allowed for payment.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'payment-amount') {
                if (isNaN(parseFloat(target.value)) || parseFloat(target.value) <= 0) {
                    displayError(target, 'Amount must be a positive number.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'payment-receipt') {
                if (["cheque", "online", "card", "upi"].includes(document.getElementById('payment-method').value) && target.files.length > 0) {
                    const file = target.files[0];
                    const maxSize = 2 * 1024 * 1024; // 2MB
                    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
                    if (!allowedTypes.includes(file.type)) {
                        displayError(target, "Please upload a valid image (JPG/PNG) or PDF file.");
                    } else if (file.size > maxSize) {
                        displayError(target, "Receipt file size must be less than 2MB.");
                    } else {
                        clearError(target);
                    }
                } else if (!["cheque", "online", "card", "upi"].includes(document.getElementById('payment-method').value)) {
                    clearError(target);
                }
            }
        });

        addPaymentForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const farmerIdInput = document.getElementById('payment-farmer');
            const paymentDateInput = document.getElementById('payment-date');
            const paymentMethodInput = document.getElementById('payment-method');
            const amountInput = document.getElementById('payment-amount');

            farmerIdInput.dispatchEvent(new Event('input'));
            paymentDateInput.dispatchEvent(new Event('input'));
            paymentMethodInput.dispatchEvent(new Event('input'));
            amountInput.dispatchEvent(new Event('input'));

            if (document.getElementById(`${farmerIdInput.id}-error`)?.textContent) hasErrors = true;
            if (document.getElementById(`${paymentDateInput.id}-error`)?.textContent) hasErrors = true;
            if (document.getElementById(`${paymentMethodInput.id}-error`)?.textContent) hasErrors = true;
            if (document.getElementById(`${amountInput.id}-error`)?.textContent) hasErrors = true;

            const farmerId = farmerIdInput.value.trim();
            const paymentDate = paymentDateInput.value;
            const paymentMethod = paymentMethodInput.value;
            const amount = parseFloat(amountInput.value);
            const remarks = document.getElementById('remarks').value.trim();
            let receiptData = null;

            if (["cheque", "online", "card", "upi"].includes(paymentMethod) && receiptInput.files.length === 0) {
                displayError(receiptInput, 'Receipt is required for this payment method.');
                hasErrors = true;
            } else if (receiptInput.files.length > 0) {
                const file = receiptInput.files[0];
                const reader = new FileReader();
                reader.onloadend = function () {
                    receiptData = reader.result;
                    if (!hasErrors) {
                        savePayment(farmerId, paymentDate, paymentMethod, amount, remarks, receiptData);
                    }
                }
                reader.onerror = function () {
                    alert("Error reading the receipt file.");
                }
                reader.readAsDataURL(file);
                return; // Prevent immediate form reset
            }

            if (!hasErrors) {
                savePayment(farmerId, paymentDate, paymentMethod, amount, remarks, null);
            }
        });

        // Set the min and max date for the payment date input to today
        const paymentDateInput = document.getElementById('payment-date');
        const today = new Date().toISOString().split('T')[0];
        paymentDateInput.setAttribute('min', today);
        paymentDateInput.setAttribute('max', today);
    }

    function savePayment(farmerId, paymentDate, paymentMethod, amount, remarks, receiptData) {
        const newPayment = {
            farmerId: farmerId,
            date: paymentDate,
            paymentMethod: paymentMethod,
            amount: amount,
            remarks: remarks,
            receiptData: receiptData,
            transactionId: `TXN-${Date.now()}` // Generate a simple transaction ID
        };
        payments.push(newPayment);
        localStorage.setItem('payments', JSON.stringify(payments));
        renderPaymentHistoryTable();
        addPaymentForm.reset();
        closeAddPaymentModal();
    }

    function renderPaymentModeChart() {
        if (!paymentModeChartCanvas) return;
        const paymentCounts = {};
        payments.forEach(payment => {
            paymentCounts[payment.paymentMethod] = (paymentCounts[payment.paymentMethod] || 0) + 1;
        });

        const labels = Object.keys(paymentCounts);
        const data = Object.values(paymentCounts);
        const backgroundColors = [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
        ];
        const borderColors = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ];

        new Chart(paymentModeChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Payments',
                    data: data,
                    borderColor: 'rgba(0, 0, 0, 1)', // Single color for the line
                    borderWidth: 2,
                    tension: 0.4, // Smoothness of the line
                    fill: false, // Don't fill area under the line
                    pointRadius: 5, // Size of the dots
                    pointBackgroundColor: backgroundColors.slice(0, labels.length), // Color of the dots
                    pointBorderColor: borderColors.slice(0, labels.length) // Border color of the dots
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
                            text: 'Number of Payments'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Payment Method'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        align: 'center', // Center the legend
                        labels: {
                            usePointStyle: true,
                            generateLabels: function(chart) {
                                const original = Chart.defaults.plugins.legend.labels.generateLabels.call(this, chart);

                                original.forEach(label => {
                                    label.pointStyle = 'circle';
                                });
                                return original;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Payment Mode Distribution'
                    }
                }
            }
        });
    }

    // ----------------------
    // Communication Section Logic
    // ----------------------

    //const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const directMessageButton = document.getElementById('direct-message-button');
    const groupBroadcastButton = document.getElementById('group-broadcast-button');
    const feedbackButton = document.getElementById('feedback-button');
    const resourceLibraryButton = document.getElementById('resource-library-button');
    const messageListElement = document.getElementById('message-list');

    directMessageButton.addEventListener('click', openDirectMessageModal);
    groupBroadcastButton.addEventListener('click', openGroupBroadcastModal);
    feedbackButton.addEventListener('click', openFeedbackForm);
    resourceLibraryButton.addEventListener('click', openResourceLibrary);


    function openDirectMessageModal() {
        const modal = document.getElementById('direct-message-modal');
        modal.style.display = 'block';

        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', closeDirectMessageModal);

        const form = modal.querySelector('#direct-message-form');
        form.addEventListener('submit', handleDirectMessageSubmit);

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeDirectMessageModal();
            }
        });

        // Input validation
        const farmerIdInput = document.getElementById('dm-farmer-id');
        const messageInput = document.getElementById('dm-message');
        const farmerIdError = document.getElementById('dm-farmer-id-error');
        const messageError = document.getElementById('dm-message-error');

        farmerIdInput.addEventListener('input', () => {
            if (!farmerIdInput.value.match(/^[A-Za-z0-9]{5}$/)) {
                farmerIdError.textContent = "Farmer ID must be 5 characters (alphanumeric).";
            } else {
                farmerIdError.textContent = "";
            }
        });

        messageInput.addEventListener('input', () => {
            if (messageInput.value.trim() === "") {
                messageError.textContent = "Message cannot be empty.";
            } else {
                messageError.textContent = "";
            }
        });
    }

    function closeDirectMessageModal() {
        const modal = document.getElementById('direct-message-modal');
        modal.style.display = 'none';
    }

    function handleDirectMessageSubmit(event) {
        event.preventDefault();

        let hasErrors = false;
        const farmerIdInput = document.getElementById('dm-farmer-id');
        const messageInput = document.getElementById('dm-message');
        const farmerIdError = document.getElementById('dm-farmer-id-error');
        const messageError = document.getElementById('dm-message-error');

        if (!farmerIdInput.value.match(/^[A-Za-z0-9]{5}$/)) {
            farmerIdError.textContent = "Farmer ID must be 5 characters (alphanumeric).";
            hasErrors = true;
        } else {
            farmerIdError.textContent = "";
        }

        if (messageInput.value.trim() === "") {
            messageError.textContent = "Message cannot be empty.";
            hasErrors = true;
        } else {
            messageError.textContent = "";
        }


        if (!hasErrors) {
            const farmerId = document.getElementById('dm-farmer-id').value;
            const messageText = document.getElementById('dm-message').value;
            const timestamp = new Date().toLocaleString();
            const message = { type: 'direct', to: farmerId, text: messageText, timestamp: timestamp };
            messages.push(message);
            localStorage.setItem('messages', JSON.stringify(messages));
            renderMessageLog();
            closeDirectMessageModal();
            alert(`Message sent to Farmer ID: ${farmerId}`);
        } else {
            alert('Please correct the errors in the form.');
        }
    }

    function openGroupBroadcastModal() {
        const modal = document.getElementById('group-broadcast-modal');
        modal.style.display = 'block';

        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', closeGroupBroadcastModal);

        const form = modal.querySelector('#group-broadcast-form');
        form.addEventListener('submit', handleGroupBroadcastSubmit);

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeGroupBroadcastModal();
            }
        });

        //input validation
        const broadcastMessageInput = document.getElementById('broadcast-message');
        const broadcastMessageError = document.getElementById('broadcast-message-error');

        broadcastMessageInput.addEventListener('input', () => {
            if (broadcastMessageInput.value.trim() === "") {
                broadcastMessageError.textContent = "Message cannot be empty.";
            } else {
                broadcastMessageError.textContent = "";
            }
        });
    }

    function closeGroupBroadcastModal() {
        const modal = document.getElementById('group-broadcast-modal');
        modal.style.display = 'none';
    }

    function handleGroupBroadcastSubmit(event) {
        event.preventDefault();
        let hasErrors = false;
        const broadcastMessageInput = document.getElementById('broadcast-message');
        const broadcastMessageError = document.getElementById('broadcast-message-error');

        if (broadcastMessageInput.value.trim() === "") {
            broadcastMessageError.textContent = "Message cannot be empty.";
            hasErrors = true;
        } else {
            broadcastMessageError.textContent = "";
        }

        if (!hasErrors) {
            const messageText = document.getElementById('broadcast-message').value;
            const timestamp = new Date().toLocaleString();
            const message = { type: 'broadcast', text: messageText, timestamp: timestamp };
            messages.push(message);
            localStorage.setItem('messages', JSON.stringify(messages));
            renderMessageLog();
            closeGroupBroadcastModal();
            alert('Broadcast message sent to all farmers.');
        }
        else {
            alert('Please correct the errors in the form.');
        }
    }

    function openFeedbackForm() {
        const modal = document.getElementById('feedback-modal');
        modal.style.display = 'block';

        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', closeFeedbackForm);

        const form = modal.querySelector('#feedback-form');
        form.addEventListener('submit', handleFeedbackSubmit);

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeFeedbackForm();
            }
        });

        //input validation
        const feedbackFarmerIdInput = document.getElementById('feedback-farmer-id');
        const feedbackMessageInput = document.getElementById('feedback-message');
        const feedbackFarmerIdError = document.getElementById('feedback-farmer-id-error');
        const feedbackMessageError = document.getElementById('feedback-message-error');

        feedbackFarmerIdInput.addEventListener('input', () => {
            if (feedbackFarmerIdInput.value && !feedbackFarmerIdInput.value.match(/^[A-Za-z0-9]{5}$/)) {
                feedbackFarmerIdError.textContent = "Farmer ID must be 5 characters (alphanumeric).";
            } else {
                feedbackFarmerIdError.textContent = "";
            }
        });

        feedbackMessageInput.addEventListener('input', () => {
            if (feedbackMessageInput.value.trim() === "") {
                feedbackMessageError.textContent = "Message cannot be empty.";
            } else {
                feedbackMessageError.textContent = "";
            }
        });
    }

    function closeFeedbackForm() {
        const modal = document.getElementById('feedback-modal');
        modal.style.display = 'none';
    }

    function handleFeedbackSubmit(event) {
        event.preventDefault();
        let hasErrors = false;
        const feedbackFarmerIdInput = document.getElementById('feedback-farmer-id');
        const feedbackMessageInput = document.getElementById('feedback-message');
        const feedbackFarmerIdError = document.getElementById('feedback-farmer-id-error');
        const feedbackMessageError = document.getElementById('feedback-message-error');

        if (feedbackFarmerIdInput.value && !feedbackFarmerIdInput.value.match(/^[A-Za-z0-9]{5}$/)) {
            feedbackFarmerIdError.textContent = "Farmer ID must be 5 characters (alphanumeric).";
            hasErrors = true;
        } else {
            feedbackFarmerIdError.textContent = "";
        }

        if (feedbackMessageInput.value.trim() === "") {
            feedbackMessageError.textContent = "Message cannot be empty.";
            hasErrors = true;
        } else {
            feedbackMessageError.textContent = "";
        }

        if (!hasErrors) {
            const farmerId = document.getElementById('feedback-farmer-id').value || 'Anonymous';
            const feedbackType = document.getElementById('feedback-type').value;
            const messageText = document.getElementById('feedback-message').value;
            const timestamp = new Date().toLocaleString();
            const feedback = { type: feedbackType, from: farmerId, text: messageText, timestamp: timestamp };
            messages.push(feedback);
            localStorage.setItem('messages', JSON.stringify(messages));
            closeFeedbackForm();
            alert('Feedback submitted. Thank you!');
        }
        else {
            alert('Please correct the errors in the form.');
        }
    }

    function openResourceLibrary() {
        const modal = document.getElementById('resource-library-modal');
        modal.style.display = 'block';

        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', closeResourceLibrary);

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeResourceLibrary();
            }
        });
    }

    function closeResourceLibrary() {
        const modal = document.getElementById('resource-library-modal');
        modal.style.display = 'none';
    }

    function renderMessageLog() {
        if (!messageListElement) return;
        messageListElement.innerHTML = '';
        messages.forEach(msg => {
            const listItem = document.createElement('li');
            let messageContent = '';
            if (msg.type === 'direct') {
                messageContent = `<span class="message-sender">To Farmer ${msg.to}:</span> ${msg.text} <span class="message-timestamp">(${msg.timestamp})</span>`;
            } else if (msg.type === 'broadcast') {
                messageContent = `<span class="message-sender">Broadcast:</span> ${msg.text} <span class="message-timestamp">(${msg.timestamp})</span>`;
            }        else if (msg.type === 'feedback') {
                messageContent = `<span class="message-sender">Feedback from ${msg.from}:</span> ${msg.text} <span class="message-timestamp">(${msg.timestamp})</span>`;
            }
            listItem.innerHTML = messageContent;
            messageListElement.appendChild(listItem);
        });
    }

    renderMessageLog();


    // ----------------------
    // Performance & Analytics Section Logic
    // ----------------------
    function renderLeaderboardTable() {
        if (!leaderboardTableBody) return;
        leaderboardTableBody.innerHTML = "";
        // Example: Sort farmers by some arbitrary score (you'll need real logic)
        const scoredFarmers = farmers.map(f => ({ ...f, score: Math.random() * 100 }));
        scoredFarmers.sort((a, b) => b.score - a.score);
        scoredFarmers.forEach((farmer, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${farmer.farmerId}</td>
                <td>${farmer.name}</td>
                <td>${farmer.score.toFixed(2)}</td>
            `;
            leaderboardTableBody.appendChild(row);
        });
        const leaderboardTable = document.getElementById('leaderboard-table');
        if (leaderboardTable) {
            setupInlineFilters(leaderboardTable, applyLeaderboardFilter);
        }
    }

    function applyLeaderboardFilter(colIndex, filterValue) {
        const rows = leaderboardTableBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cellText = row.children[colIndex].textContent.toLowerCase();
            row.style.display = cellText.includes(filterValue) ? "" : "none";
        });
    }

    function renderFarmerScorecardChart() {
        if (!farmerScorecardChartCanvas) return;
        // Example data - replace with actual performance metrics
        const data = {
            labels: ['Milk Quantity', 'Fat Content', 'Payment Compliance'],
            datasets: [{
                label: 'Farmer Performance',
                data: [Math.random() * 100, Math.random() * 10, Math.random() * 100],
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light fill for line charts
                borderColor: 'rgba(75, 192, 192, 1)',       // Line color
                borderWidth: 2,
                pointRadius: 5,             // Make points visible
                pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Point color
                pointBorderColor: '#fff',
                fill: false, //Do not fill the area under the line.
                tension: 0.4 //Add some curve to the line
            }]
        };

        new Chart(farmerScorecardChartCanvas, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Farmer Performance Scorecard',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Performance Score'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Performance Metrics'
                        }
                    }
                }
            }
        });
    }


    // ----------------------
    // Initial Rendering
    // ----------------------
    renderFarmerTable();
    renderMilkRecordsTable();
    renderPaymentHistoryTable();
    renderLeaderboardTable();
    renderFarmerScorecardChart();

    // Set the initial active section based on the first nav button
    if (navButtons.length > 0) {
        const initialSectionId = navButtons[0].getAttribute('data-section');
        hideAllSections();
        showSection(initialSectionId);
        navButtons[0].classList.add('active');
    }
});