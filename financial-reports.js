document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Element References ---
    const navButtons = document.querySelectorAll('.qc-navigation .nav-button');
    const sections = document.querySelectorAll('.content > section');

    // Modals
    const addSalesRecordModal = document.getElementById('add-sales-record-modal');
    const addTransactionModal = document.getElementById('add-transaction-modal'); // Assuming a single modal for revenue/expense
    const addFarmerPaymentModal = document.getElementById('add-farmer-payment-modal');
    const addReceivableModal = document.getElementById('add-receivable-modal');
    const customReportBuilderModal = document.getElementById('custom-report-builder-modal');
    const scheduledReportsModal = document.getElementById('scheduled-reports-modal');
    const accessControlModal = document.getElementById('access-control-modal');
    const currencySettingsModal = document.getElementById('currency-settings-modal');
    const exportLogsModal = document.getElementById('export-logs-modal');
    const emailIntegrationModal = document.getElementById('email-integration-modal');
    const integrationModal = document.getElementById('integration-modal'); // Generic integration modal

    // Table Bodies
    const salesTableBody = document.getElementById("sales-table-body");
    const transactionsTableBody = document.getElementById("transactions-table-body");
    const farmerPaymentsTableBody = document.getElementById("farmer-payments-table-body");
    const receivablesTableBody = document.getElementById("receivables-table-body");
    const auditTrailTableBody = document.getElementById("audit-trail-table-body");
    const reportTemplatesTableBody = document.getElementById("report-templates-table-body");

    // Forms
    const addSalesRecordForm = document.getElementById("add-sales-record-form");
    const addTransactionForm = document.getElementById("add-transaction-form");
    const addFarmerPaymentForm = document.getElementById("add-farmer-payment-form");
    const addReceivableForm = document.getElementById("add-receivable-form");
    const scheduledReportsForm = document.getElementById("scheduled-reports-form"); // Added for scheduled reports form

    // Chart Canvases
    const salesTrendChartCanvas = document.getElementById('sales-trend-chart');
    const salesChannelChartCanvas = document.getElementById('sales-channel-chart');
    const cashFlowChartCanvas = document.getElementById('cash-flow-chart');
    const profitabilityChartCanvas = document.getElementById('profitability-chart');
    const farmerPaymentModeChartCanvas = document.getElementById('farmer-payment-mode-chart');
    const forecastingChartCanvas = document.getElementById('forecasting-chart');

    // --- Data Storage Variables (Initialize from localStorage if available) ---
    let salesRecords = JSON.parse(localStorage.getItem("salesRecords")) || [];
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let farmerPayments = JSON.parse(localStorage.getItem("farmerPayments")) || [];
    let receivables = JSON.parse(localStorage.getItem("receivables")) || [];
    let auditTrail = JSON.parse(localStorage.getItem("auditTrail")) || [];
    let reportTemplates = JSON.parse(localStorage.getItem("reportTemplates")) || [];
    let scheduledReports = JSON.parse(localStorage.getItem("scheduledReports")) || []; // Added for scheduled reports

    // Edit/Add State Variables
    let editSalesRecordIndex = null;
    let editTransactionIndex = null;
    let editFarmerPaymentIndex = null;
    let editReceivableIndex = null;
    let editReportTemplateIndex = null;

    // Chart Instances to prevent re-creation
    let salesTrendChartInstance = null;
    let salesChannelChartInstance = null;
    let cashFlowChartInstance = null;
    let profitabilityChartInstance = null;
    let farmerPaymentModeChartInstance = null;
    let forecastingChartInstance = null;

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
     * Formats a date string from YYYY-MM-DD to DD-MM-YYYY.
     * @param {string} dateString - The date string in YYYY-MM-DD format.
     * @returns {string} The formatted date string.
     */
    function formatDate(dateString) {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
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
            header.addEventListener("click", () => {
                // Toggle filter row visibility
                const filterRow = header.closest('thead').querySelector('.filter-row');
                if (filterRow) {
                    filterRow.classList.toggle('hidden');
                    // Clear all filter values when showing/hiding the filter row
                    const filterInputs = filterRow.querySelectorAll('.filter-input');
                    filterInputs.forEach(input => {
                        input.value = '';
                        input.dispatchEvent(new Event('input')); // Trigger filter reset
                    });
                }
            });
        });

        const filterInputs = tableElement.querySelectorAll('thead .filter-row .filter-input');
        filterInputs.forEach(input => {
            input.addEventListener('input', function() {
                applyFilterFunction(); // Call the filter function to re-evaluate all rows
            });
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
            // Re-render charts when their section becomes active
            if (id === 'sales-reporting-section') {
                renderSalesTrendChart();
                renderSalesChannelChart();
            } else if (id === 'revenue-expense-section') {
                renderCashFlowChart();
                renderProfitabilityChart();
            } else if (id === 'payment-reports-section') {
                renderFarmerPaymentModeChart();
            } else if (id === 'custom-smart-reporting-section') {
                renderForecastingChart();
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

    // --- Sales Reporting & Trend Analysis Section Logic ---

    /**
     * Renders the sales table with data from salesRecords array.
     */
    function renderSalesTable() {
        if (!salesTableBody) return;
        salesTableBody.innerHTML = "";
        salesRecords.forEach((record, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${formatDate(record.saleDate)}</td>
                <td>${record.productId}</td>
                <td>${record.productName}</td>
                <td>${record.region}</td>
                <td>${record.channel}</td>
                <td>${record.quantitySold}</td>
                <td>${record.revenue.toFixed(2)}</td>
                <td>${record.customerType || 'N/A'}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            salesTableBody.appendChild(row);
        });
        const salesTable = document.getElementById('sales-table');
        if (salesTable) {
            setupInlineFilters(salesTable, applySalesFilter);
        }
        renderSalesTrendChart();
        renderSalesChannelChart();
    }

    /**
     * Applies filter to the sales table.
     * Filters rows based on all active filter inputs (AND logic).
     */
    function applySalesFilter() {
        const rows = salesTableBody.querySelectorAll("tr");
        const filterInputs = document.getElementById('sales-table').querySelectorAll('thead .filter-row .filter-input');

        rows.forEach(row => {
            let matchesAllFilters = true;
            filterInputs.forEach(input => {
                const colIndex = Array.from(input.closest('tr').children).indexOf(input.closest('td'));
                const cellText = row.children[colIndex].textContent.toLowerCase();
                const filterValue = input.value.trim().toLowerCase();

                if (filterValue && !cellText.includes(filterValue)) {
                    matchesAllFilters = false;
                }
            });
            row.style.display = matchesAllFilters ? "" : "none";
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
     * Opens the Add Sales Record modal.
     */
    window.openAddSalesRecordModal = function () {
        editSalesRecordIndex = null; // Ensure we are in "add" mode
        openModal(addSalesRecordModal, addSalesRecordForm, () => {
            // Set max date for sales date to today
            const salesDateInput = document.getElementById('sales-date');
            if (salesDateInput) {
                salesDateInput.setAttribute('max', new Date().toISOString().split('T')[0]);
            }
        });
    };

    /**
     * Closes the Add Sales Record modal.
     */
    window.closeAddSalesRecordModal = function () {
        closeModal(addSalesRecordModal);
        addSalesRecordForm.reset();
        clearAllErrors(addSalesRecordForm);
        editSalesRecordIndex = null;
    };

    /**
     * Populates the Add Sales Record modal with data for editing.
     * @param {number} index - The index of the sales record to edit.
     */
    function editSalesRecord(index) {
        const record = salesRecords[index];
        document.getElementById("sales-date").value = record.saleDate;
        document.getElementById("sales-product-id").value = record.productId;
        document.getElementById("sales-product-name").value = record.productName;
        document.getElementById("sales-region").value = record.region;
        document.getElementById("sales-channel").value = record.channel;
        document.getElementById("sales-quantity").value = record.quantitySold;
        document.getElementById("sales-revenue").value = record.revenue;
        document.getElementById("sales-customer-type").value = record.customerType;
        editSalesRecordIndex = index;
        openAddSalesRecordModal();
    }

    /**
     * Deletes a sales record.
     * @param {number} index - The index of the sales record to delete.
     */
    function deleteSalesRecord(index) {
        // Use a custom modal for confirmation instead of alert()
        showConfirmationModal("Are you sure you want to delete this sales record?", () => {
            const deletedRecord = salesRecords[index];
            salesRecords.splice(index, 1);
            localStorage.setItem("salesRecords", JSON.stringify(salesRecords));
            renderSalesTable();
            addAuditLog('Delete', `Sales Record deleted: Product ID - ${deletedRecord?.productId || 'N/A'}`);
        });
    }

    // Sales Record Form Validation and Submission
    if (addSalesRecordForm) {
        addSalesRecordForm.addEventListener('input', function (e) {
            const target = e.target;
            // Basic validation based on HTML pattern/min/max
            if (target.validity.patternMismatch) {
                displayError(target, target.title || 'Invalid input format.');
            } else if (target.validity.rangeOverflow || target.validity.rangeUnderflow) {
                displayError(target, `Value must be between ${target.min || '0'} and ${target.max || 'max'}.`);
            } else if (target.validity.valueMissing) {
                displayError(target, 'This field is required.');
            } else if (target.id === 'sales-date') {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    displayError(target, 'Future dates are not allowed.');
                } else {
                    clearError(target);
                }
            } else {
                clearError(target);
            }
        });

        addSalesRecordForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const inputs = addSalesRecordForm.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.dispatchEvent(new Event('input')); // Trigger validation
                if (document.getElementById(`${input.id}-error`)?.textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const newSalesRecord = {
                    saleDate: document.getElementById("sales-date").value,
                    productId: document.getElementById("sales-product-id").value.trim(),
                    productName: document.getElementById("sales-product-name").value.trim(),
                    region: document.getElementById("sales-region").value.trim(),
                    channel: document.getElementById("sales-channel").value,
                    quantitySold: parseInt(document.getElementById("sales-quantity").value),
                    revenue: parseFloat(document.getElementById("sales-revenue").value),
                    customerType: document.getElementById("sales-customer-type").value.trim()
                };

                if (editSalesRecordIndex !== null) {
                    salesRecords[editSalesRecordIndex] = newSalesRecord;
                    addAuditLog('Update', `Sales Record updated: Product ID - ${newSalesRecord.productId}`);
                } else {
                    salesRecords.push(newSalesRecord);
                    addAuditLog('Add', `New Sales Record added: Product ID - ${newSalesRecord.productId}`);
                }
                localStorage.setItem('salesRecords', JSON.stringify(salesRecords));
                renderSalesTable();
                closeAddSalesRecordModal();
            } else {
                showMessageModal('Please correct the errors in the form.', 'Error');
            }
        });
    }

    /**
     * Renders the Sales Trend Chart (Line Chart).
     */
    function renderSalesTrendChart() {
        if (!salesTrendChartCanvas) return;

        if (salesTrendChartInstance) {
            salesTrendChartInstance.destroy();
        }

        const salesByDate = {};
        salesRecords.forEach(record => {
            if (!salesByDate[record.saleDate]) {
                salesByDate[record.saleDate] = 0;
            }
            salesByDate[record.saleDate] += record.revenue;
        });

        const sortedDates = Object.keys(salesByDate).sort();
        const revenues = sortedDates.map(date => salesByDate[date]);

        salesTrendChartInstance = new Chart(salesTrendChartCanvas, {
            type: 'line',
            data: {
                labels: sortedDates.map(formatDate),
                datasets: [{
                    label: 'Total Revenue (₹)',
                    data: revenues,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Sales Revenue Trend Over Time'
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue (₹)'
                        }
                    }
                }
            }
        });
    }

    /**
     * Renders the Sales Breakdown by Channel Chart (Pie Chart).
     */
    function renderSalesChannelChart() {
        if (!salesChannelChartCanvas) return;

        if (salesChannelChartInstance) {
            salesChannelChartInstance.destroy();
        }

        const salesByChannel = {};
        salesRecords.forEach(record => {
            if (!salesByChannel[record.channel]) {
                salesByChannel[record.channel] = 0;
            }
            salesByChannel[record.channel] += record.revenue;
        });

        const labels = Object.keys(salesByChannel);
        const data = Object.values(salesByChannel);
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

        salesChannelChartInstance = new Chart(salesChannelChartCanvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue by Channel',
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: borderColors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Revenue Distribution by Sales Channel'
                    },
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    // --- Revenue & Expense Tracking Section Logic ---

    /**
     * Renders the transactions table.
     */
    function renderTransactionsTable() {
        if (!transactionsTableBody) return;
        transactionsTableBody.innerHTML = "";
        transactions.forEach((transaction, index) => {
            const row = document.createElement("tr");
            let proofsContent = 'N/A';
            if (transaction.proofs && transaction.proofs.length > 0) {
                // Assuming proofs are stored as Data URLs or accessible URLs
                proofsContent = transaction.proofs.map((proof, i) =>
                    `<a href="${proof}" target="_blank">Proof ${i + 1}</a>`
                ).join(', ');
            }
            row.innerHTML = `
                <td>${formatDate(transaction.transactionDate)}</td>
                <td>${transaction.type}</td>
                <td>${transaction.category}</td>
                <td>${transaction.description}</td>
                <td>${transaction.amount.toFixed(2)}</td>
                <td>${proofsContent}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            transactionsTableBody.appendChild(row);
        });
        const transactionsTable = document.getElementById('transactions-table');
        if (transactionsTable) {
            setupInlineFilters(transactionsTable, applyTransactionFilter);
        }
        renderCashFlowChart();
        renderProfitabilityChart();
    }

    /**
     * Applies filter to the transactions table.
     * Filters rows based on all active filter inputs (AND logic).
     */
    function applyTransactionFilter() {
        const rows = transactionsTableBody.querySelectorAll("tr");
        const filterInputs = document.getElementById('transactions-table').querySelectorAll('thead .filter-row .filter-input');

        rows.forEach(row => {
            let matchesAllFilters = true;
            filterInputs.forEach(input => {
                const colIndex = Array.from(input.closest('tr').children).indexOf(input.closest('td'));
                const cellText = row.children[colIndex].textContent.toLowerCase();
                const filterValue = input.value.trim().toLowerCase();

                if (filterValue && !cellText.includes(filterValue)) {
                    matchesAllFilters = false;
                }
            });
            row.style.display = matchesAllFilters ? "" : "none";
        });
    }

    // Event listener for transactions table actions (edit/delete)
    if (transactionsTableBody) {
        transactionsTableBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editTransaction(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteTransaction(index);
            }
        });
    }

    /**
     * Opens the Add Transaction modal (for Revenue or Expense).
     * @param {string} type - 'revenue' or 'expense'.
     */
    window.openAddTransactionModal = function (type) {
        editTransactionIndex = null; // Ensure we are in "add" mode
        openModal(addTransactionModal, addTransactionForm, () => {
            const transactionTypeHiddenInput = document.getElementById('transaction-type-hidden');
            const transactionModalTitle = document.getElementById('transaction-modal-title');
            if (transactionTypeHiddenInput) {
                transactionTypeHiddenInput.value = type;
                transactionModalTitle.textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)} Transaction`;
            }
            // Set max date for transaction date to today
            const transactionDateInput = document.getElementById('transaction-date');
            if (transactionDateInput) {
                transactionDateInput.setAttribute('max', new Date().toISOString().split('T')[0]);
            }
        });
    };

    /**
     * Closes the Add Transaction modal.
     */
    window.closeAddTransactionModal = function () {
        closeModal(addTransactionModal);
        addTransactionForm.reset();
        clearAllErrors(addTransactionForm);
        editTransactionIndex = null;
    };

    /**
     * Populates the Add Transaction modal with data for editing.
     * @param {number} index - The index of the transaction to edit.
     */
    function editTransaction(index) {
        const transaction = transactions[index];
        document.getElementById("transaction-date").value = transaction.transactionDate;
        document.getElementById("transaction-category").value = transaction.category;
        document.getElementById("transaction-description").value = transaction.description;
        document.getElementById("transaction-amount").value = transaction.amount;
        // Handle proofs - for editing, we might just show existing proofs or allow new uploads
        // For simplicity, we won't pre-fill file inputs. User can re-upload if needed.
        const transactionTypeHiddenInput = document.getElementById('transaction-type-hidden');
        const transactionModalTitle = document.getElementById('transaction-modal-title');
        if (transactionTypeHiddenInput) {
            transactionTypeHiddenInput.value = transaction.type;
            transactionModalTitle.textContent = `Edit ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`;
        }
        editTransactionIndex = index;
        openAddTransactionModal(transaction.type); // Pass type to set modal title correctly
    }

    /**
     * Deletes a transaction.
     * @param {number} index - The index of the transaction to delete.
     */
    function deleteTransaction(index) {
        showConfirmationModal("Are you sure you want to delete this transaction?", () => {
            const deletedTransaction = transactions[index];
            transactions.splice(index, 1);
            localStorage.setItem("transactions", JSON.stringify(transactions));
            renderTransactionsTable();
            addAuditLog('Delete', `Transaction deleted: ${deletedTransaction.type} - ${deletedTransaction.description}`);
        });
    }

    // Transaction Form Validation and Submission
    if (addTransactionForm) {
        addTransactionForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.validity.valueMissing) {
                displayError(target, 'This field is required.');
            } else if (target.id === 'transaction-date') {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    displayError(target, 'Future dates are not allowed.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'transaction-amount') {
                const value = parseFloat(target.value);
                if (isNaN(value) || value <= 0) {
                    displayError(target, 'Amount must be a positive number.');
                } else {
                    clearError(target);
                }
            } else {
                clearError(target);
            }
        });

        addTransactionForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const inputs = addTransactionForm.querySelectorAll('input:not([type="file"]), textarea'); // Exclude file input for initial validation check
            inputs.forEach(input => {
                input.dispatchEvent(new Event('input'));
                if (document.getElementById(`${input.id}-error`)?.textContent) {
                    hasErrors = true;
                }
            });

            const proofsInput = document.getElementById('transaction-proofs');
            const files = proofsInput.files;
            const proofDataUrls = [];

            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    const maxSize = 5 * 1024 * 1024; // 5MB limit per file
                    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

                    if (!allowedTypes.includes(file.type)) {
                        displayError(proofsInput, `File '${file.name}' is not a valid image (JPG/PNG) or PDF.`);
                        hasErrors = true;
                    } else if (file.size > maxSize) {
                        displayError(proofsInput, `File '${file.name}' size exceeds 5MB limit.`);
                        hasErrors = true;
                    }
                });
            }

            if (hasErrors) {
                showMessageModal('Please correct the errors in the form.', 'Error');
                return;
            }

            // If no errors, process files and then save transaction
            if (files.length > 0) {
                let filesProcessed = 0;
                Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onloadend = function () {
                        proofDataUrls.push(reader.result);
                        filesProcessed++;
                        if (filesProcessed === files.length) {
                            saveTransaction(proofDataUrls);
                        }
                    };
                    reader.onerror = function () {
                        showMessageModal(`Error reading file: ${file.name}`, 'Error');
                        hasErrors = true; // Set error to prevent saving if file reading fails
                    };
                    reader.readAsDataURL(file);
                });
            } else {
                saveTransaction([]); // Save without proofs
            }
        });
    }

    /**
     * Saves a transaction (revenue or expense).
     * @param {Array<string>} proofDataUrls - Array of base64 encoded proof files.
     */
    function saveTransaction(proofDataUrls) {
        const newTransaction = {
            transactionDate: document.getElementById("transaction-date").value,
            type: document.getElementById("transaction-type-hidden").value, // Use hidden input for type
            category: document.getElementById("transaction-category").value.trim(),
            description: document.getElementById("transaction-description").value.trim(),
            amount: parseFloat(document.getElementById("transaction-amount").value),
            proofs: proofDataUrls
        };

        if (editTransactionIndex !== null) {
            transactions[editTransactionIndex] = newTransaction;
            addAuditLog('Update', `Transaction updated: ${newTransaction.type} - ${newTransaction.description}`);
        } else {
            transactions.push(newTransaction);
            addAuditLog('Add', `New Transaction added: ${newTransaction.type} - ${newTransaction.description}`);
        }
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderTransactionsTable();
        closeAddTransactionModal();
    }

    /**
     * Renders the Cash Flow Chart (Bar Chart).
     */
    function renderCashFlowChart() {
        if (!cashFlowChartCanvas) return;

        if (cashFlowChartInstance) {
            cashFlowChartInstance.destroy();
        }

        const monthlyData = {}; // { 'YYYY-MM': { revenue: 0, expense: 0 } }
        transactions.forEach(t => {
            const monthYear = t.transactionDate.substring(0, 7); // YYYY-MM
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = { revenue: 0, expense: 0 };
            }
            if (t.type === 'revenue') {
                monthlyData[monthYear].revenue += t.amount;
            } else if (t.type === 'expense') {
                monthlyData[monthYear].expense += t.amount;
            }
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const revenues = sortedMonths.map(month => monthlyData[month].revenue);
        const expenses = sortedMonths.map(month => monthlyData[month].expense);
        const netFlow = sortedMonths.map(month => monthlyData[month].revenue - monthlyData[month].expense);

        cashFlowChartInstance = new Chart(cashFlowChartCanvas, {
            type: 'bar',
            data: {
                labels: sortedMonths,
                datasets: [
                    {
                        label: 'Total Revenue (₹)',
                        data: revenues,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Total Expense (₹)',
                        data: expenses,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Net Cash Flow (₹)',
                        data: netFlow,
                        type: 'line', // Overlay as a line
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Cash Flow (Revenue vs. Expense)'
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)'
                        }
                    }
                }
            }
        });
    }

    /**
     * Renders the Profitability by Category Chart (Doughnut Chart).
     */
    function renderProfitabilityChart() {
        if (!profitabilityChartCanvas) return;

        if (profitabilityChartInstance) {
            profitabilityChartInstance.destroy();
        }

        const categoryProfit = {}; // { 'Category': net_amount }
        transactions.forEach(t => {
            if (!categoryProfit[t.category]) {
                categoryProfit[t.category] = 0;
            }
            if (t.type === 'revenue') {
                categoryProfit[t.category] += t.amount;
            } else if (t.type === 'expense') {
                categoryProfit[t.category] -= t.amount;
            }
        });

        const labels = Object.keys(categoryProfit);
        const data = Object.values(categoryProfit);

        // Assign colors based on positive/negative profit
        const backgroundColors = data.map(val => val >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)');
        const borderColors = data.map(val => val >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)');


        profitabilityChartInstance = new Chart(profitabilityChartCanvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Net Profit/Loss (₹)',
                    data: data.map(Math.abs), // Display absolute values for doughnut chart
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Profitability by Category'
                    },
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                return `${label}: ₹${value.toFixed(2)} (${value >= 0 ? 'Profit' : 'Loss'})`;
                            }
                        }
                    }
                }
            }
        });
    }

    // --- Payment Reports Section Logic ---

    /**
     * Renders the farmer payments table.
     */
    function renderFarmerPaymentsTable() {
        if (!farmerPaymentsTableBody) return;
        farmerPaymentsTableBody.innerHTML = "";
        farmerPayments.forEach((payment, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${payment.farmerId}</td>
                <td>${formatDate(payment.paymentDate)}</td>
                <td>${payment.amountPaid.toFixed(2)}</td>
                <td>${payment.pendingAmount.toFixed(2)}</td>
                <td>${payment.paymentMode}</td>
                <td>${payment.bonusesDeductions || 'N/A'}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            farmerPaymentsTableBody.appendChild(row);
        });
        const farmerPaymentsTable = document.getElementById('farmer-payments-table');
        if (farmerPaymentsTable) {
            setupInlineFilters(farmerPaymentsTable, applyFarmerPaymentFilter);
        }
        renderFarmerPaymentModeChart();
    }

    /**
     * Applies filter to the farmer payments table.
     * Filters rows based on all active filter inputs (AND logic).
     */
    function applyFarmerPaymentFilter() {
        const rows = farmerPaymentsTableBody.querySelectorAll("tr");
        const filterInputs = document.getElementById('farmer-payments-table').querySelectorAll('thead .filter-row .filter-input');

        rows.forEach(row => {
            let matchesAllFilters = true;
            filterInputs.forEach(input => {
                const colIndex = Array.from(input.closest('tr').children).indexOf(input.closest('td'));
                const cellText = row.children[colIndex].textContent.toLowerCase();
                const filterValue = input.value.trim().toLowerCase();

                if (filterValue && !cellText.includes(filterValue)) {
                    matchesAllFilters = false;
                }
            });
            row.style.display = matchesAllFilters ? "" : "none";
        });
    }

    // Event listener for farmer payments table actions (edit/delete)
    if (farmerPaymentsTableBody) {
        farmerPaymentsTableBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editFarmerPayment(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteFarmerPayment(index);
            }
        });
    }

    /**
     * Opens the Add Farmer Payment modal.
     */
    window.openAddFarmerPaymentModal = function () {
        editFarmerPaymentIndex = null; // Ensure we are in "add" mode
        openModal(addFarmerPaymentModal, addFarmerPaymentForm, () => {
            // Set max date for payment date to today
            const paymentDateInput = document.getElementById('farmer-payment-date');
            if (paymentDateInput) {
                paymentDateInput.setAttribute('max', new Date().toISOString().split('T')[0]);
            }
        });
    };

    /**
     * Closes the Add Farmer Payment modal.
     */
    window.closeAddFarmerPaymentModal = function () {
        closeModal(addFarmerPaymentModal);
        addFarmerPaymentForm.reset();
        clearAllErrors(addFarmerPaymentForm);
        editFarmerPaymentIndex = null;
    };

    /**
     * Populates the Add Farmer Payment modal with data for editing.
     * @param {number} index - The index of the farmer payment to edit.
     */
    function editFarmerPayment(index) {
        const payment = farmerPayments[index];
        document.getElementById("farmer-payment-id").value = payment.farmerId;
        document.getElementById("farmer-payment-date").value = payment.paymentDate;
        document.getElementById("farmer-payment-amount-paid").value = payment.amountPaid;
        document.getElementById("farmer-payment-pending-amount").value = payment.pendingAmount;
        document.getElementById("farmer-payment-mode").value = payment.paymentMode;
        document.getElementById("farmer-payment-bonuses-deductions").value = payment.bonusesDeductions;
        editFarmerPaymentIndex = index;
        openAddFarmerPaymentModal();
    }

    /**
     * Deletes a farmer payment record.
     * @param {number} index - The index of the farmer payment to delete.
     */
    function deleteFarmerPayment(index) {
        showConfirmationModal("Are you sure you want to delete this farmer payment record?", () => {
            const deletedPayment = farmerPayments[index];
            farmerPayments.splice(index, 1);
            localStorage.setItem("farmerPayments", JSON.stringify(farmerPayments));
            renderFarmerPaymentsTable();
            addAuditLog('Delete', `Farmer Payment deleted: Farmer ID - ${deletedPayment?.farmerId || 'N/A'}, Amount - ${deletedPayment?.amountPaid || 'N/A'}`);
        });
    }

    // Farmer Payment Form Validation and Submission
    if (addFarmerPaymentForm) {
        addFarmerPaymentForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.validity.valueMissing) {
                displayError(target, 'This field is required.');
            } else if (target.id === 'farmer-payment-id') {
                if (!/^[A-Za-z0-9]{5}$/.test(target.value)) {
                    displayError(target, 'Farmer ID must be 5 alphanumeric characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'farmer-payment-date') {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    displayError(target, 'Future dates are not allowed.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'farmer-payment-amount-paid' || target.id === 'farmer-payment-pending-amount') {
                const value = parseFloat(target.value);
                if (isNaN(value) || value < 0) {
                    displayError(target, 'Amount must be a non-negative number.');
                } else {
                    clearError(target);
                }
            } else {
                clearError(target);
            }
        });

        addFarmerPaymentForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const inputs = addFarmerPaymentForm.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.dispatchEvent(new Event('input'));
                if (document.getElementById(`${input.id}-error`)?.textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const newFarmerPayment = {
                    farmerId: document.getElementById("farmer-payment-id").value.trim(),
                    paymentDate: document.getElementById("farmer-payment-date").value,
                    amountPaid: parseFloat(document.getElementById("farmer-payment-amount-paid").value),
                    pendingAmount: parseFloat(document.getElementById("farmer-payment-pending-amount").value || 0),
                    paymentMode: document.getElementById("farmer-payment-mode").value,
                    bonusesDeductions: document.getElementById("farmer-payment-bonuses-deductions").value.trim()
                };

                if (editFarmerPaymentIndex !== null) {
                    farmerPayments[editFarmerPaymentIndex] = newFarmerPayment;
                    addAuditLog('Update', `Farmer Payment updated: Farmer ID - ${newFarmerPayment.farmerId}, Amount - ${newFarmerPayment.amountPaid}`);
                } else {
                    farmerPayments.push(newFarmerPayment);
                    addAuditLog('Add', `New Farmer Payment added: Farmer ID - ${newFarmerPayment.farmerId}, Amount - ${newFarmerPayment.amountPaid}`);
                }
                localStorage.setItem('farmerPayments', JSON.stringify(farmerPayments));
                renderFarmerPaymentsTable();
                closeAddFarmerPaymentModal();
            } else {
                showMessageModal('Please correct the errors in the form.', 'Error');
            }
        });
    }

    /**
     * Renders the receivables table.
     */
    function renderReceivablesTable() {
        if (!receivablesTableBody) return;
        receivablesTableBody.innerHTML = "";
        receivables.forEach((receivable, index) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDate = new Date(receivable.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const daysOverdue = dueDate < today ? Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)) : 0;
            const status = receivable.amountReceived >= receivable.totalAmount ? 'Paid' : (daysOverdue > 0 ? 'Overdue' : 'Pending');

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${receivable.invoiceId}</td>
                <td>${receivable.partyName}</td>
                <td>${formatDate(receivable.invoiceDate)}</td>
                <td>${formatDate(receivable.dueDate)}</td>
                <td>${receivable.totalAmount.toFixed(2)}</td>
                <td>${receivable.amountReceived.toFixed(2)}</td>
                <td>${status}</td>
                <td>${daysOverdue > 0 ? daysOverdue : 'N/A'}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            receivablesTableBody.appendChild(row);
        });
        const receivablesTable = document.getElementById('receivables-table');
        if (receivablesTable) {
            setupInlineFilters(receivablesTable, applyReceivableFilter);
        }
    }

    /**
     * Applies filter to the receivables table.
     * Filters rows based on all active filter inputs (AND logic).
     */
    function applyReceivableFilter() {
        const rows = receivablesTableBody.querySelectorAll("tr");
        const filterInputs = document.getElementById('receivables-table').querySelectorAll('thead .filter-row .filter-input');

        rows.forEach(row => {
            let matchesAllFilters = true;
            filterInputs.forEach(input => {
                const colIndex = Array.from(input.closest('tr').children).indexOf(input.closest('td'));
                const cellText = row.children[colIndex].textContent.toLowerCase();
                const filterValue = input.value.trim().toLowerCase();

                if (filterValue && !cellText.includes(filterValue)) {
                    matchesAllFilters = false;
                }
            });
            row.style.display = matchesAllFilters ? "" : "none";
        });
    }

    // Event listener for receivables table actions (edit/delete)
    if (receivablesTableBody) {
        receivablesTableBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editReceivable(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteReceivable(index);
            }
        });
    }

    /**
     * Opens the Add Receivable modal.
     */
    window.openAddReceivableModal = function () {
        editReceivableIndex = null; // Ensure we are in "add" mode
        openModal(addReceivableModal, addReceivableForm, () => {
            // Set min/max dates for invoice and due date
            const invoiceDateInput = document.getElementById('receivable-invoice-date');
            const dueDateInput = document.getElementById('receivable-due-date');
            const today = new Date().toISOString().split('T')[0];
            if (invoiceDateInput) {
                invoiceDateInput.setAttribute('max', today);
            }
            if (dueDateInput) {
                dueDateInput.setAttribute('min', today); // Due date should be today or in future
            }
        });
    };

    /**
     * Closes the Add Receivable modal.
     */
    window.closeAddReceivableModal = function () {
        closeModal(addReceivableModal);
        addReceivableForm.reset();
        clearAllErrors(addReceivableForm);
        editReceivableIndex = null;
    };

    /**
     * Populates the Add Receivable modal with data for editing.
     * @param {number} index - The index of the receivable to edit.
     */
    function editReceivable(index) {
        const receivable = receivables[index];
        document.getElementById("receivable-invoice-id").value = receivable.invoiceId;
        document.getElementById("receivable-party-name").value = receivable.partyName;
        document.getElementById("receivable-invoice-date").value = receivable.invoiceDate;
        document.getElementById("receivable-due-date").value = receivable.dueDate;
        document.getElementById("receivable-total-amount").value = receivable.totalAmount;
        document.getElementById("receivable-amount-received").value = receivable.amountReceived;
        editReceivableIndex = index;
        openAddReceivableModal();
    }

    /**
     * Deletes a receivable record.
     * @param {number} index - The index of the receivable to delete.
     */
    function deleteReceivable(index) {
        showConfirmationModal("Are you sure you want to delete this receivable record?", () => {
            const deletedReceivable = receivables[index];
            receivables.splice(index, 1);
            localStorage.setItem("receivables", JSON.stringify(receivables));
            renderReceivablesTable();
            addAuditLog('Delete', `Receivable deleted: Invoice ID - ${deletedReceivable?.invoiceId || 'N/A'}, Party - ${deletedReceivable?.partyName || 'N/A'}`);
        });
    }

    // Receivable Form Validation and Submission
    if (addReceivableForm) {
        addReceivableForm.addEventListener('input', function (e) {
            const target = e.target;
            if (target.validity.valueMissing) {
                displayError(target, 'This field is required.');
            } else if (target.id === 'receivable-invoice-id') {
                if (!/^[A-Za-z0-9]{8,15}$/.test(target.value)) {
                    displayError(target, 'Invoice ID must be 8-15 alphanumeric characters.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'receivable-invoice-date') {
                const selectedDate = new Date(target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    displayError(target, 'Invoice date cannot be in the future.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'receivable-due-date') {
                const invoiceDate = new Date(document.getElementById('receivable-invoice-date').value);
                const dueDate = new Date(target.value);
                invoiceDate.setHours(0, 0, 0, 0);
                dueDate.setHours(0, 0, 0, 0);

                if (dueDate < invoiceDate) {
                    displayError(target, 'Due date cannot be before invoice date.');
                } else {
                    clearError(target);
                }
            } else if (target.id === 'receivable-total-amount' || target.id === 'receivable-amount-received') {
                const value = parseFloat(target.value);
                if (isNaN(value) || value < 0) {
                    displayError(target, 'Amount must be a non-negative number.');
                } else {
                    clearError(target);
                }
            } else {
                clearError(target);
            }
        });

        addReceivableForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const inputs = addReceivableForm.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.dispatchEvent(new Event('input'));
                if (document.getElementById(`${input.id}-error`)?.textContent) {
                    hasErrors = true;
                }
            });

            if (!hasErrors) {
                const newReceivable = {
                    invoiceId: document.getElementById("receivable-invoice-id").value.trim(),
                    partyName: document.getElementById("receivable-party-name").value.trim(),
                    invoiceDate: document.getElementById("receivable-invoice-date").value,
                    dueDate: document.getElementById("receivable-due-date").value,
                    totalAmount: parseFloat(document.getElementById("receivable-total-amount").value),
                    amountReceived: parseFloat(document.getElementById("receivable-amount-received").value || 0)
                };

                if (editReceivableIndex !== null) {
                    receivables[editReceivableIndex] = newReceivable;
                    addAuditLog('Update', `Receivable updated: Invoice ID - ${newReceivable.invoiceId}`);
                } else {
                    receivables.push(newReceivable);
                    addAuditLog('Add', `New Receivable added: Invoice ID - ${newReceivable.invoiceId}`);
                }
                localStorage.setItem('receivables', JSON.stringify(receivables));
                renderReceivablesTable();
                closeAddReceivableModal();
            } else {
                showMessageModal('Please correct the errors in the form.', 'Error');
            }
        });
    }

    /**
     * Renders the Farmer Payment Mode Chart (Pie Chart).
     */
    function renderFarmerPaymentModeChart() {
        if (!farmerPaymentModeChartCanvas) return;

        if (farmerPaymentModeChartInstance) {
            farmerPaymentModeChartInstance.destroy();
        }

        const paymentModeCounts = {};
        farmerPayments.forEach(payment => {
            paymentModeCounts[payment.paymentMode] = (paymentModeCounts[payment.paymentMode] || 0) + 1;
        });

        const labels = Object.keys(paymentModeCounts);
        const data = Object.values(paymentModeCounts);
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

        farmerPaymentModeChartInstance = new Chart(farmerPaymentModeChartCanvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Farmer Payments by Mode',
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: borderColors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Farmer Payment Mode Distribution'
                    },
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    // --- Financial Statements & Integrations Section Logic ---

    /**
     * Generates a financial statement (placeholder).
     * @param {string} type - The type of statement to generate.
     */
    window.generateStatement = function (type) {
        showMessageModal(`Generating ${type.replace('-', ' ').toUpperCase()} statement... (Feature to be implemented)`, 'Statement Generation');
        addAuditLog('Generate Statement', `Requested ${type} statement generation`);
    };

    /**
     * Opens the integration modal (placeholder).
     * @param {string} integrationType - The type of integration.
     */
    window.openIntegrationModal = function (integrationType) {
        const titleMap = {
            'tally': 'Tally Integration',
            'zoho': 'Zoho Books Integration',
            'quickbooks': 'QuickBooks Integration'
        };
        const contentMap = {
            'tally': 'Details and settings for syncing with Tally ERP. This would involve API keys and configuration.',
            'zoho': 'Details and settings for syncing with Zoho Books. This would involve OAuth setup and data mapping.',
            'quickbooks': 'Details and settings for syncing with QuickBooks. This would involve API authentication and data synchronization options.'
        };

        const modalTitle = document.getElementById('integration-modal-title');
        const modalContent = document.getElementById('integration-modal-content');

        if (modalTitle && modalContent) {
            modalTitle.textContent = titleMap[integrationType] || 'Integration Details';
            modalContent.textContent = contentMap[integrationType] || 'No specific details available for this integration.';
        }
        openModal(integrationModal);
        addAuditLog('Open Integration', `Opened integration details for: ${integrationType}`);
    };

    window.closeIntegrationModal = function () {
        closeModal(integrationModal);
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
                const colIndex = Array.from(input.closest('tr').children).indexOf(input.closest('td'));
                const cellText = row.children[colIndex].textContent.toLowerCase();
                const filterValue = input.value.trim().toLowerCase();

                if (filterValue && !cellText.includes(filterValue)) {
                    matchesAllFilters = false;
                }
            });
            row.style.display = matchesAllFilters ? "" : "none";
        });
    }

    // --- Custom & Smart Reporting Section Logic ---

    /**
     * Opens the Custom Report Builder modal.
     */
    window.openCustomReportBuilder = function () {
        editReportTemplateIndex = null; // Ensure add mode
        openModal(customReportBuilderModal, customReportBuilderModal.querySelector('form'), () => {
            // Any specific setup for the report builder form
        });
        addAuditLog('Open Report Builder', 'Opened custom report builder');
    };

    /**
     * Closes the Custom Report Builder modal.
     */
    window.closeCustomReportBuilder = function () {
        closeModal(customReportBuilderModal);
        customReportBuilderModal.querySelector('form').reset();
        clearAllErrors(customReportBuilderModal.querySelector('form'));
        editReportTemplateIndex = null;
    };

    /**
     * Renders the report templates table.
     */
    function renderReportTemplatesTable() {
        if (!reportTemplatesTableBody) return;
        reportTemplatesTableBody.innerHTML = "";
        reportTemplates.forEach((template, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${template.templateName}</td>
                <td>${template.createdBy}</td>
                <td>${formatDate(template.lastModified.split('T')[0])} ${new Date(template.lastModified).toLocaleTimeString()}</td>
                <td>${template.visualizationType}</td>
                <td class="action-button-container">
                    <button class="action-button edit-button" data-index="${index}"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button" data-index="${index}"><span class="material-symbols-outlined">delete</span></button>
                </td>
            `;
            reportTemplatesTableBody.appendChild(row);
        });
        const reportTemplatesTable = document.getElementById('report-templates-table');
        if (reportTemplatesTable) {
            setupInlineFilters(reportTemplatesTable, applyReportTemplateFilter);
        }
    }

    /**
     * Applies filter to the report templates table.
     * Filters rows based on all active filter inputs (AND logic).
     */
    function applyReportTemplateFilter() {
        const rows = reportTemplatesTableBody.querySelectorAll("tr");
        const filterInputs = document.getElementById('report-templates-table').querySelectorAll('thead .filter-row .filter-input');

        rows.forEach(row => {
            let matchesAllFilters = true;
            filterInputs.forEach(input => {
                const colIndex = Array.from(input.closest('tr').children).indexOf(input.closest('td'));
                const cellText = row.children[colIndex].textContent.toLowerCase();
                const filterValue = input.value.trim().toLowerCase();

                if (filterValue && !cellText.includes(filterValue)) {
                    matchesAllFilters = false;
                }
            });
            row.style.display = matchesAllFilters ? "" : "none";
        });
    }

    // Event listener for report templates table actions (edit/delete)
    if (reportTemplatesTableBody) {
        reportTemplatesTableBody.addEventListener('click', function (e) {
            if (e.target.closest('.edit-button')) {
                const index = parseInt(e.target.closest('.edit-button').getAttribute('data-index'));
                editReportTemplate(index);
            } else if (e.target.closest('.delete-button')) {
                const index = parseInt(e.target.closest('.delete-button').getAttribute('data-index'));
                deleteReportTemplate(index);
            }
        });
    }

    /**
     * Populates the Custom Report Builder modal for editing.
     * @param {number} index - The index of the report template to edit.
     */
    function editReportTemplate(index) {
        const template = reportTemplates[index];
        document.getElementById("report-name").value = template.templateName;
        // Select multiple options for report-fields
        const reportFieldsSelect = document.getElementById("report-fields");
        Array.from(reportFieldsSelect.options).forEach(option => {
            option.selected = template.fields.includes(option.value);
        });
        document.getElementById("report-visualization").value = template.visualizationType;
        document.getElementById("report-filters").value = template.filters;
        editReportTemplateIndex = index;
        openCustomReportBuilder();
    }

    /**
     * Deletes a report template.
     * @param {number} index - The index of the report template to delete.
     */
    function deleteReportTemplate(index) {
        showConfirmationModal("Are you sure you want to delete this report template?", () => {
            const deletedTemplate = reportTemplates[index];
            reportTemplates.splice(index, 1);
            localStorage.setItem("reportTemplates", JSON.stringify(reportTemplates));
            renderReportTemplatesTable();
            addAuditLog('Delete', `Report Template deleted: ${deletedTemplate?.templateName || 'N/A'}`);
        });
    }

    // Custom Report Builder Form Submission
    const customReportForm = document.querySelector('#custom-report-builder-modal form');
    if (customReportForm) {
        customReportForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const reportNameInput = document.getElementById('report-name');
            const reportFieldsSelect = document.getElementById('report-fields');

            if (reportNameInput.value.trim() === "") {
                displayError(reportNameInput, 'Report Name is required.');
                hasErrors = true;
            } else {
                clearError(reportNameInput);
            }

            if (reportFieldsSelect.selectedOptions.length === 0) {
                displayError(reportFieldsSelect, 'At least one field must be selected.');
                hasErrors = true;
            } else {
                clearError(reportFieldsSelect);
            }

            if (!hasErrors) {
                const selectedFields = Array.from(reportFieldsSelect.selectedOptions).map(option => option.value);
                const newReportTemplate = {
                    templateName: reportNameInput.value.trim(),
                    createdBy: 'Admin', // Placeholder
                    lastModified: new Date().toISOString(),
                    fields: selectedFields,
                    visualizationType: document.getElementById('report-visualization').value,
                    filters: document.getElementById('report-filters').value.trim()
                };

                if (editReportTemplateIndex !== null) {
                    reportTemplates[editReportTemplateIndex] = newReportTemplate;
                    addAuditLog('Update', `Report Template updated: ${newReportTemplate.templateName}`);
                } else {
                    reportTemplates.push(newReportTemplate);
                    addAuditLog('Add', `New Report Template added: ${newReportTemplate.templateName}`);
                }
                localStorage.setItem('reportTemplates', JSON.stringify(reportTemplates));
                renderReportTemplatesTable();
                closeCustomReportBuilder();
                showMessageModal('Report template saved successfully!', 'Success');
            } else {
                showMessageModal('Please correct the errors in the form.', 'Error');
            }
        });
    }

    /**
     * Opens the Scheduled Reports modal.
     */
    window.openScheduledReportsModal = function () {
        openModal(scheduledReportsModal, scheduledReportsForm, () => {
            const templateSelect = document.getElementById('scheduled-report-template');
            templateSelect.innerHTML = '<option value="" disabled selected hidden>Select Template</option>';
            reportTemplates.forEach(template => {
                const option = document.createElement('option');
                option.value = template.templateName;
                option.textContent = template.templateName;
                templateSelect.appendChild(option);
            });
        });
        addAuditLog('Open Scheduled Reports', 'Opened scheduled reports configuration');
    };

    /**
     * Closes the Scheduled Reports modal.
     */
    window.closeScheduledReportsModal = function () {
        closeModal(scheduledReportsModal);
        scheduledReportsForm.reset();
        clearAllErrors(scheduledReportsForm);
    };

    // Scheduled Reports Form Submission
    if (scheduledReportsForm) {
        scheduledReportsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let hasErrors = false;
            const templateInput = document.getElementById('scheduled-report-template');
            const recipientsInput = document.getElementById('scheduled-recipients');

            if (templateInput.value === "") {
                displayError(templateInput, 'Report Template is required.');
                hasErrors = true;
            } else {
                clearError(templateInput);
            }

            const emails = recipientsInput.value.split(',').map(email => email.trim()).filter(email => email !== '');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const invalidEmails = emails.filter(email => !emailRegex.test(email));

            if (emails.length === 0) {
                displayError(recipientsInput, 'At least one recipient email is required.');
                hasErrors = true;
            } else if (invalidEmails.length > 0) {
                displayError(recipientsInput, `Invalid email(s): ${invalidEmails.join(', ')}`);
                hasErrors = true;
            } else {
                clearError(recipientsInput);
            }

            if (!hasErrors) {
                const newScheduledReport = {
                    templateName: templateInput.value,
                    frequency: document.getElementById('scheduled-frequency').value,
                    recipients: emails,
                    scheduledAt: new Date().toISOString() // When it was scheduled
                };
                scheduledReports.push(newScheduledReport);
                localStorage.setItem('scheduledReports', JSON.stringify(scheduledReports));
                closeScheduledReportsModal();
                showMessageModal('Report scheduled successfully!', 'Success');
                addAuditLog('Schedule Report', `Report '${newScheduledReport.templateName}' scheduled for ${newScheduledReport.frequency}`);
            } else {
                showMessageModal('Please correct the errors in the form.', 'Error');
            }
        });
    }

    /**
     * Renders the Forecasting Chart (Line Chart with hypothetical forecast).
     */
    function renderForecastingChart() {
        if (!forecastingChartCanvas) return;

        if (forecastingChartInstance) {
            forecastingChartInstance.destroy();
        }

        // Example: Simple linear forecast based on past sales
        const salesByMonth = {};
        salesRecords.forEach(record => {
            const month = record.saleDate.substring(0, 7); // YYYY-MM
            salesByMonth[month] = (salesByMonth[month] || 0) + record.revenue;
        });

        const sortedMonths = Object.keys(salesByMonth).sort();
        const historicalData = sortedMonths.map(month => salesByMonth[month]);

        // Generate a simple forecast (e.g., average of last 3 months)
        const forecastMonths = [];
        const forecastData = [];
        if (historicalData.length >= 3) {
            const lastThreeAvg = (historicalData[historicalData.length - 1] + historicalData[historicalData.length - 2] + historicalData[historicalData.length - 3]) / 3;
            for (let i = 1; i <= 3; i++) { // Forecast next 3 months
                const lastMonth = sortedMonths[sortedMonths.length - 1];
                const nextDate = new Date(lastMonth + '-01');
                nextDate.setMonth(nextDate.getMonth() + i);
                forecastMonths.push(nextDate.toISOString().substring(0, 7));
                forecastData.push(lastThreeAvg * (1 + (Math.random() - 0.5) * 0.1)); // Add some variation
            }
        } else {
            // If not enough historical data, just show existing
            forecastMonths.push(...sortedMonths);
            forecastData.push(...historicalData);
        }


        forecastingChartInstance = new Chart(forecastingChartCanvas, {
            type: 'line',
            data: {
                labels: [...sortedMonths, ...forecastMonths],
                datasets: [
                    {
                        label: 'Historical Revenue (₹)',
                        data: historicalData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgba(75, 192, 192, 1)'
                    },
                    {
                        label: 'Forecasted Revenue (₹)',
                        data: Array(historicalData.length).fill(NaN).concat(forecastData), // Start forecast after historical data
                        borderColor: 'rgba(255, 159, 64, 1)',
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        borderDash: [5, 5], // Dashed line for forecast
                        tension: 0.4,
                        fill: false,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgba(255, 159, 64, 1)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Revenue Forecasting'
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue (₹)'
                        }
                    }
                }
            }
        });
    }

    // --- Module-Wide Features Section Logic ---

    /**
     * Opens the Role-Based Permissions modal (placeholder).
     */
    window.openAccessControlModal = function () {
        openModal(accessControlModal);
        showMessageModal('Role-Based Permissions management would be configured here.', 'Access Control');
        addAuditLog('Open Settings', 'Opened Role-Based Permissions settings');
    };

    window.closeAccessControlModal = function () {
        closeModal(accessControlModal);
    };

    /**
     * Opens the Multi-Currency Support modal (placeholder).
     */
    window.openCurrencySettingsModal = function () {
        openModal(currencySettingsModal);
        showMessageModal('Multi-Currency settings and exchange rates would be managed here.', 'Currency Settings');
        addAuditLog('Open Settings', 'Opened Multi-Currency settings');
    };

    window.closeCurrencySettingsModal = function () {
        closeModal(currencySettingsModal);
    };

    /**
     * Opens the Export Logs modal (placeholder).
     */
    window.openExportLogsModal = function () {
        openModal(exportLogsModal);
        showMessageModal('A detailed log of all data export activities would be displayed here.', 'Export Logs');
        addAuditLog('Open Logs', 'Opened Export Logs');
    };

    window.closeExportLogsModal = function () {
        closeModal(exportLogsModal);
    };

    /**
     * Opens the Smart Email Integration modal (placeholder).
     */
    window.openEmailIntegrationModal = function () {
        openModal(emailIntegrationModal);
        showMessageModal('Configure email templates and triggers for automated report and alert delivery.', 'Email Integration');
        addAuditLog('Open Settings', 'Opened Smart Email Integration settings');
    };

    window.closeEmailIntegrationModal = function () {
        closeModal(emailIntegrationModal);
    };


    // --- Initial Rendering ---
    renderSalesTable();
    renderTransactionsTable();
    renderFarmerPaymentsTable();
    renderReceivablesTable();
    renderAuditTrailTable();
    renderReportTemplatesTable();
    // Charts are rendered by their respective table rendering functions or when their section is activated

    // Set the initial active section based on the first nav button
    if (navButtons.length > 0) {
        const initialSectionId = navButtons[0].getAttribute('data-section');
        hideAllSections();
        showSection(initialSectionId);
        navButtons[0].classList.add('active');
    }
});
