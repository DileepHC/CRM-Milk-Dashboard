/* product-inventory.js */
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const sections = document.querySelectorAll('section');
    const filterRows = document.querySelectorAll('.filter-row');
    const filterInputs = document.querySelectorAll('.filter-input');
    const filterableHeaders = document.querySelectorAll('.filterable');
    const inventoryTableBody = document.getElementById('inventory-table-body');
    const valuationTableBody = document.getElementById('valuation-table-body');
    const transferModal = document.getElementById('transfer-modal');
    const adjustStockModal = document.getElementById('adjust-stock-modal');
    const addInventoryModal = document.getElementById('add-inventory-modal');
    const closeTransferModalButton = transferModal.querySelector('.close-button');
    const closeAdjustStockModalButton = adjustStockModal.querySelector('.close-button');
    const closeAddInventoryModalButton = addInventoryModal.querySelector('.close-button');
    const adjustStockButton = document.querySelector('#stock-management-section .inline-add-button');
    const transferForm = document.getElementById('transfer-form');
    const adjustStockForm = document.getElementById('adjust-stock-form');
    const addInventoryForm = document.getElementById('add-inventory-form');
    const transferProductSelect = document.getElementById('transfer-product');
    const transferFromSelect = document.getElementById('transfer-from');
    const transferToSelect = document.getElementById('transfer-to');
    const adjustProductSelect = document.getElementById('adjust-product');
    const adjustLocationSelect = document.getElementById('adjust-location');
    const adjustQuantityInput = document.getElementById('adjust-quantity');
    const adjustReasonTextarea = document.getElementById('adjust-reason');
    const addInventoryProductInput = document.getElementById('inventory-product-name');
    const addInventoryLocationInput = document.getElementById('inventory-location');
    const addInventoryStockInput = document.getElementById('inventory-stock');
    const addInventoryStatusSelect = document.getElementById('inventory-status');
    const inventoryIdInput = document.getElementById('inventory-id');
    const stockBalanceChartCanvas = document.getElementById('stock-balance-chart');
    const inventoryAgeingChartCanvas = document.getElementById('inventory-ageing-chart');
    const transferButton = document.getElementById('transfer-button');
    const reorderButton = document.getElementById('reorder-button');
    const syncProductionButton = document.getElementById('sync-production-button');
    const syncSalesButton = document.getElementById('sync-sales-button');
    const generateReportButton = document.querySelector('#reporting-valuation-section .inline-add-button');
    const productionLinkButton = document.getElementById('production-link');
    const salesLinkButton = document.getElementById('sales-link');
    const erpLinkButton = document.getElementById('erp-link');
    const addInventoryButton = document.querySelector('#inventory-tracking-section .inline-add-button');

    // --- Local Storage Keys ---
    const INVENTORY_DATA_KEY = 'dairyInventoryData';
    const VALUATION_DATA_KEY = 'dairyValuationData';
    const STOCK_BALANCE_DATA_KEY = 'dairyStockBalanceData';
    const INVENTORY_AGEING_DATA_KEY = 'dairyInventoryAgeingData';
    const ACTIVE_SECTION_KEY = 'dairyActiveSection';

    // --- Data Variables ---
    let inventoryData = loadData(INVENTORY_DATA_KEY, [
        { id: 1, product: 'Milk 1L', location: 'Fridge A', stock: 50, status: 'sufficient' },
        { id: 2, product: 'Cheese Block 500g', location: 'Fridge B', stock: 25, status: 'sufficient' },
        { id: 3, product: 'Butter 250g', location: 'Fridge A', stock: 15, status: 'low' },
        { id: 4, product: 'Yogurt 1kg', location: 'Fridge C', stock: 10, status: 'critical' },
        { id: 5, product: 'Cream 500ml', location: 'Fridge B', stock: 30, status: 'sufficient' },
        { id: 6, product: 'Ice Cream 1L', location: 'Freezer A', stock: 20, status: 'sufficient' },
        { id: 7, product: 'Paneer 200g', location: 'Fridge C', stock: 5, status: 'critical' },
        { id: 8, product: 'Ghee 500ml', location: 'Storage A', stock: 40, status: 'sufficient' },
        { id: 9, product: 'Lassi 200ml', location: 'Fridge A', stock: 12, status: 'low' },
    ]);

    let valuationData = loadData(VALUATION_DATA_KEY, [
        { product: 'Milk 1L', quantity: 50, unitValue: 60, totalValue: 3000 },
        { product: 'Cheese Block 500g', quantity: 25, unitValue: 250, totalValue: 6250 },
        { product: 'Butter 250g', quantity: 15, unitValue: 120, totalValue: 1800 },
        { product: 'Yogurt 1kg', quantity: 10, unitValue: 80, totalValue: 800 },
        { product: 'Cream 500ml', quantity: 30, unitValue: 100, totalValue: 3000 },
        { product: 'Ice Cream 1L', quantity: 20, unitValue: 150, totalValue: 3000 },
        { product: 'Paneer 200g', quantity: 5, unitValue: 90, totalValue: 450 },
        { product: 'Ghee 500ml', quantity: 40, unitValue: 300, totalValue: 12000 },
        { product: 'Lassi 200ml', quantity: 12, unitValue: 30, totalValue: 360 },
    ]);

    let stockBalanceData = loadData(STOCK_BALANCE_DATA_KEY, {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
            label: 'Total Dairy Stock',
            data: [500, 480, 520, 550],
            borderColor: '#2980b9',
            fill: false
        }]
    });

    let inventoryAgeingData = loadData(INVENTORY_AGEING_DATA_KEY, {
        labels: ['Fresh (0-3 Days)', 'Near Expiry (4-7 Days)', 'Expired (>7 Days)'],
        datasets: [{
            label: 'Number of Items',
            data: [350, 120, 30],
            backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c']
        }]
    });

    let stockBalanceChart;
    let inventoryAgeingChart;

    // --- Helper Functions for Local Storage ---
    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function loadData(key, defaultValue) {
        const storedData = localStorage.getItem(key);
        return storedData ? JSON.parse(storedData) : defaultValue;
    }

    function populateProductOptions() {
        const products = [...new Set(inventoryData.map(item => item.product))];
        transferProductSelect.innerHTML = '<option value="">-- Select Product --</option>';
        adjustProductSelect.innerHTML = '<option value="">-- Select Product --</option>';
        products.forEach(product => {
            const option1 = document.createElement('option');
            option1.value = product;
            option1.textContent = product;
            transferProductSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = product;
            option2.textContent = product;
            adjustProductSelect.appendChild(option2);
        });
    }

    function populateLocationOptions() {
        const locations = [...new Set(inventoryData.map(item => item.location))];
        transferFromSelect.innerHTML = '<option value="">-- Select Location --</option>';
        transferToSelect.innerHTML = '<option value="">-- Select Location --</option>';
        adjustLocationSelect.innerHTML = '<option value="">-- Select Location --</option>';
        locations.forEach(location => {
            const option1 = document.createElement('option');
            option1.value = location;
            option1.textContent = location;
            transferFromSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = location;
            option2.textContent = location;
            transferToSelect.appendChild(option2);

            const option3 = document.createElement('option');
            option3.value = location;
            option3.textContent = location;
            adjustLocationSelect.appendChild(option3);
        });
    }

    function updateInventoryTable(data) {
        inventoryTableBody.innerHTML = '';
        data.forEach(item => {
            const row = inventoryTableBody.insertRow();
            row.insertCell().textContent = item.product;
            row.insertCell().textContent = item.location;
            row.insertCell().textContent = item.stock;
            row.insertCell().textContent = item.status;
            const chartCell = row.insertCell();
            chartCell.innerHTML = '<span class="material-symbols-outlined">bar_chart</span>';
            const actionsCell = row.insertCell();
            actionsCell.classList.add('action-button-container');
            actionsCell.innerHTML = `
                <button class="action-button small edit-button" onclick="editInventory(${item.id})"><span class="material-symbols-outlined">edit</span></button>
                <button class="action-button small delete-button" onclick="deleteInventory(${item.id})"><span class="material-symbols-outlined">delete</span></button>
            `;
        });
        saveData(INVENTORY_DATA_KEY, data);
    }

    function updateValuationTable(data) {
        valuationTableBody.innerHTML = '';
        data.forEach(item => {
            const row = valuationTableBody.insertRow();
            row.insertCell().textContent = item.product;
            row.insertCell().textContent = item.quantity;
            row.insertCell().textContent = item.unitValue;
            row.insertCell().textContent = item.totalValue;
        });
        saveData(VALUATION_DATA_KEY, data);
    }

    function renderStockBalanceChart() {
        const ctx = stockBalanceChartCanvas.getContext('2d');
        if (stockBalanceChart) {
            stockBalanceChart.destroy();
        }
    
        stockBalanceChart = new Chart(ctx, {
            type: 'line',
            data: stockBalanceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Dairy Stock'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Week'
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0.3, // Smoother line (adjust as needed)
                        borderWidth: 3,
                        borderColor: '#2980b9',
                        fill: false
                    },
                    point: {
                        radius: 5,
                        backgroundColor: '#fff',
                        borderColor: '#2980b9',
                        borderWidth: 2,
                        hoverRadius: 7,
                        hoverBackgroundColor: '#2980b9',
                        hoverBorderColor: '#fff'
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 12
                            },
                            boxWidth: 20,
                            padding: 10
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#2980b9',
                        borderWidth: 1,
                        cornerRadius: 4,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
        saveData(STOCK_BALANCE_DATA_KEY, stockBalanceData);
    }

    function renderInventoryAgeingChart() {
        const ctx = inventoryAgeingChartCanvas.getContext('2d');
        if (inventoryAgeingChart) {
            inventoryAgeingChart.destroy();
        }
    
        const labels = inventoryAgeingData.labels;
        const data = inventoryAgeingData.datasets[0].data;
        const borderColor = inventoryAgeingData.datasets[0].backgroundColor; // Using background color as border color
    
        inventoryAgeingChart = new Chart(ctx, {
            type: 'line', // Changed to 'line' chart
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Items',
                    data: data,
                    borderColor: borderColor[0], // Using the first color for the line
                    fill: false,
                    tension: 0.4, // Smooth the line
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
                            text: 'Number of Items'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Ageing Category'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false, // Hide the legend as labels are on the X-axis
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.formattedValue} items`;
                            }
                        }
                    }
                }
            }
        });
        saveData(INVENTORY_AGEING_DATA_KEY, inventoryAgeingData);
    }

    function showSection(sectionId) {
        sections.forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'block';
        saveData(ACTIVE_SECTION_KEY, sectionId);
    }

    // --- Navigation ---
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            showSection(this.dataset.section);
        });
    });

    // --- Table Filtering (AND Logic) ---
    filterInputs.forEach(input => {
        input.addEventListener('input', function() {
            const filters = {};
            filterInputs.forEach(filterInput => {
                const column = filterInput.dataset.column;
                const value = filterInput.value.toLowerCase();
                if (value) {
                    filters[column] = value;
                }
            });

            const filteredData = inventoryData.filter(item => {
                for (const column in filters) {
                    const filterValue = filters[column];
                    const itemValue = String(item[column]).toLowerCase();
                    if (!itemValue.includes(filterValue)) {
                        return false;
                    }
                }
                return true;
            });
            updateInventoryTable(filteredData);
        });
    });

    filterableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const column = this.dataset.column;
            const type = this.dataset.type;
            const arrow = this.querySelector('.arrow');
            const isAscending = arrow.textContent === '▼';

            inventoryData.sort((a, b) => {
                let valueA = a[column];
                let valueB = b[column];

                if (type === 'number') {
                    valueA = parseInt(valueA);
                    valueB = parseInt(valueB);
                }

                if (valueA < valueB) {
                    return isAscending ? -1 : 1;
                }
                if (valueA > valueB) {
                    return isAscending ? 1 : -1;
                }
                return 0;
            });

            updateInventoryTable(inventoryData);
            arrow.textContent = isAscending ? '▲' : '▼';
        });
    });

    // --- Modal Handling ---
    function openTransferModal() {
        transferModal.style.display = 'block';
    }

    function closeTransferModal() {
        transferModal.style.display = 'none';
        transferForm.reset();
    }

    function openAdjustStockModal() {
        adjustStockModal.style.display = 'block';
        adjustStockForm.reset(); // Reset form when opening
        const productId = adjustProductSelect.value;
        const locationId = adjustLocationSelect.value;
        const itemToAdjust = inventoryData.find(item => item.product === productId && item.location === locationId);
        if (itemToAdjust) {
            adjustQuantityInput.value = itemToAdjust.stock;
        } else {
            adjustQuantityInput.value = '';
        }
    }

    function closeAdjustStockModal() {
        adjustStockModal.style.display = 'none';
    }

    function openAddInventoryModal() {
        addInventoryModal.style.display = 'block';
        addInventoryForm.reset();
        inventoryIdInput.value = '';
    }

    function closeAddInventoryModal() {
        addInventoryModal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target === transferModal) {
            closeTransferModal();
        }
        if (event.target === adjustStockModal) {
            closeAdjustStockModal();
        }
        if (event.target === addInventoryModal) {
            closeAddInventoryModal();
        }
    }

    closeTransferModalButton.addEventListener('click', closeTransferModal);
    closeAdjustStockModalButton.addEventListener('click', closeAdjustStockModal);
    closeAddInventoryModalButton.addEventListener('click', closeAddInventoryModal);

    // --- Form Submissions ---
    transferForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const product = transferProductSelect.value;
        const fromLocation = transferFromSelect.value;
        const toLocation = transferToSelect.value;
        const quantity = parseInt(document.getElementById('transfer-quantity').value);

        const itemFromIndex = inventoryData.findIndex(item => item.product === product && item.location === fromLocation);
        const itemToIndex = inventoryData.findIndex(item => item.product === product && item.location === toLocation);

        if (itemFromIndex !== -1 && inventoryData[itemFromIndex].stock >= quantity && quantity > 0) {
            inventoryData[itemFromIndex].stock -= quantity;
            if (itemToIndex !== -1) {
                inventoryData[itemToIndex].stock += quantity;
            } else {
                inventoryData.push({
                    id: Date.now(),
                    product: product,
                    location: toLocation,
                    stock: quantity,
                    status: 'sufficient'
                });
            }
            updateInventoryTable(inventoryData.slice());
            closeTransferModal();
        } else {
            alert('Insufficient stock or invalid transfer quantity/location.');
        }
    });

    adjustStockForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const product = adjustProductSelect.value;
        const location = adjustLocationSelect.value;
        const quantity = parseInt(adjustQuantityInput.value);
        const reason = adjustReasonTextarea.value;

        const itemIndex = inventoryData.findIndex(item => item.product === product && item.location === location);
        if (itemIndex !== -1) {
            inventoryData[itemIndex].stock = quantity;
            // In a real scenario, you might want to log the reason for adjustment
            updateInventoryTable(inventoryData.slice());
            closeAdjustStockModal();
        } else {
            alert('Inventory item not found at this product and location.');
        }
    });

    addInventoryForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const productName = addInventoryProductInput.value;
        const location = addInventoryLocationInput.value;
        const stock = parseInt(addInventoryStockInput.value);
        const status = addInventoryStatusSelect.value;
        const id = inventoryIdInput.value ? parseInt(inventoryIdInput.value) : Date.now();

        if (productName && location && !isNaN(stock)) {
            if (inventoryIdInput.value) {
                // Editing existing inventory
                const index = inventoryData.findIndex(item => item.id === id);
                if (index !== -1) {
                    inventoryData[index] = { id, product: productName, location: location, stock: stock, status: status };
                }
            } else {
                // Adding new inventory
                inventoryData.push({ id, product: productName, location: location, stock: stock, status: status });
            }
            updateInventoryTable(inventoryData.slice());
            closeAddInventoryModal();
            populateProductOptions();
            populateLocationOptions();
        } else {
            alert('Please fill in all inventory details.');
        }
    });

    // --- Edit and Delete Inventory ---
    window.editInventory = function(id) {
        const itemToEdit = inventoryData.find(item => item.id === id);
        if (itemToEdit) {
            inventoryIdInput.value = itemToEdit.id;
            addInventoryProductInput.value = itemToEdit.product;
            addInventoryLocationInput.value = itemToEdit.location;
            addInventoryStockInput.value = itemToEdit.stock;
            addInventoryStatusSelect.value = itemToEdit.status;
            openAddInventoryModal();
        }
    };

    window.deleteInventory = function(id) {
        if (confirm('Are you sure you want to delete this inventory item?')) {
            inventoryData = inventoryData.filter(item => item.id !== id);
            updateInventoryTable(inventoryData.slice());
            populateProductOptions();
            populateLocationOptions();
        }
    };

    // --- Stock Management Buttons ---
    transferButton.addEventListener('click', openTransferModal);
    adjustStockButton.addEventListener('click', openAdjustStockModal); // ADD THIS LINE
      // --- Stock Management Buttons ---
    reorderButton.addEventListener('click', () => {
        // --- Functionality for Reordering Stock ---
        console.log('Reorder button clicked');
        // 1. Identify low-stock items.
        const itemsToReorder = inventoryData.filter(item => item.status === 'low' || item.status === 'critical');
        if (itemsToReorder.length > 0) {
        // 2. Display a list of items to reorder.
        const reorderList = itemsToReorder.map(item => `${item.product} (Current Stock: ${item.stock})`).join('\n');
        // 3. Allow the user to specify quantities (Improved with prompt).
        let reorderQuantities = prompt(
            `The following items are low or critical:\n${reorderList}\n\nPlease enter quantities to reorder, separated by commas (e.g., 10,5,0 for Milk, Cheese, Butter):\n(Leave blank to cancel)`
        );

        if (reorderQuantities && reorderQuantities.trim() !== "") {
            reorderQuantities = reorderQuantities.split(',').map(q => parseInt(q.trim(), 10));

            if (reorderQuantities.length !== itemsToReorder.length) {
            alert('Incorrect number of quantities. Reorder process cancelled.');
            return;
            }

            const orders = itemsToReorder.map((item, index) => ({
            product: item.product,
            quantity: reorderQuantities[index] || 0, // Ensure we have a number, default to 0
            })).filter(order => order.quantity > 0); // Remove orders with 0 quantity

            if (orders.length === 0) {
            alert('No items to reorder.');
            return;
            }
            // 4. Send a request to your backend to create purchase orders.
            fetch('/api/purchase-orders', {  // Replace '/api/purchase-orders' with your actual API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orders),
            })
            .then(response => {
                if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Reorder response:', data);
                alert('Reorder process initiated successfully.  Order details:' + JSON.stringify(data)); //Show the response data
                //  Ideally, handle the response (e.g., show order numbers, update UI).
            })
            .catch(error => {
                console.error('Error during reorder:', error);
                alert('Failed to initiate reorder process.  Error: ' + error.message);
            });
        } else {
            alert('Reorder process cancelled.');
        }
        } else {
        alert('No items currently need reordering.');
        }
    });

    syncProductionButton.addEventListener('click', () => {
        // --- Functionality for Syncing with Production ---
        console.log('Sync with Production button clicked');
        // 1. Fetch data from your production system.
        fetch('/api/production-status') // Replace '/api/production-status' with your actual API endpoint
        .then(response => {
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(productionData => {
            console.log('Production data:', productionData);
            // 2. Update the inventory data based on the fetched information.
            //    This is a simplified example.  You'll need to adapt it
            //    to match the structure of your production data.
            productionData.forEach(item => {
            const inventoryItemIndex = inventoryData.findIndex(invItem => invItem.product === item.product);
            if (inventoryItemIndex !== -1) {
                inventoryData[inventoryItemIndex].stock += item.producedQuantity; //  adjust the property names
            } else {
                //  Add new item if it doesn't exist.  Make sure to have all the required properties.
                inventoryData.push({
                id: Date.now(),
                product: item.product,
                location: 'Storage A',  //  set the location
                stock: item.producedQuantity,
                status: 'sufficient' //  set the status
                });
            }
            });
            updateInventoryTable(inventoryData.slice()); // Update the table
            alert('Inventory updated with production data.');
        })
        .catch(error => {
            console.error('Error syncing with production:', error);
            alert('Failed to sync with production data. Error: ' + error.message);
        });
    });

    syncSalesButton.addEventListener('click', () => {
        // --- Functionality for Syncing with Sales ---
        console.log('Sync with Sales button clicked');
        // 1. Fetch data from your sales system.
        fetch('/api/sales-orders')  // Replace '/api/sales-orders' with your actual API endpoint
        .then(response => {
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(salesData => {
            console.log('Sales data:', salesData);
            // 2. Update the inventory data based on the fetched information.
            //    This is a simplified example. Adapt to your sales data structure.
            salesData.forEach(sale => {
            const inventoryItemIndex = inventoryData.findIndex(invItem => invItem.product === sale.product);
            if (inventoryItemIndex !== -1) {
                inventoryData[inventoryItemIndex].stock -= sale.quantity; //  adjust the property names
                if (inventoryData[inventoryItemIndex].stock < 0)
                {
                    inventoryData[inventoryItemIndex].stock = 0;
                }
            }
            //  else:  Do not add.
            });
            updateInventoryTable(inventoryData.slice()); // Update the table
            alert('Inventory updated with sales data.');
        })
        .catch(error => {
            console.error('Error syncing with sales:', error);
            alert('Failed to sync with sales data. Error: ' + error.message);
        });
    });


    // --- Reporting Button ---
    generateReportButton.addEventListener('click', () => {
        // Ask the user for the desired report format
        const format = prompt('Generate report as (.xls or .pdf)?').toLowerCase();
    
        if (format === '.xls') {
            generateInventoryReport('xls');
        } else if (format === '.pdf') {
            generateInventoryReport('pdf');
        } else if (format) {
            alert('Invalid format. Please enter ".xls" or ".pdf".');
        }
        // If the user cancels or enters nothing, no report is generated
    });
    
    function generateInventoryReport(format) {
        let reportData = '';
        const headers = ['Product', 'Location', 'Stock', 'Status'];
    
        if (format === 'xls') {
            reportData += headers.join('\t') + '\n';
            inventoryData.forEach(item => {
                reportData += `${item.product}\t${item.location}\t${item.stock}\t${item.status}\n`;
            });
            downloadFile(reportData, 'inventory_report.xls', 'application/vnd.ms-excel');
        } else if (format === 'pdf') {
            // Explicitly check for jsPDF when this function is called
            if (typeof jsPDF !== 'undefined') {
                console.log('jsPDF is available.'); // Add this line for debugging
                const pdf = new jsPDF();
                const colWidths = [60, 50, 30, 40];
                const rowHeight = 10;
                let y = 20;
                const x = 10;
    
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Inventory Report', x, y);
                y += 10;
    
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
    
                // Add headers
                let currentX = x;
                headers.forEach((header, index) => {
                    pdf.text(header, currentX, y);
                    currentX += colWidths[index];
                });
                y += rowHeight;
                pdf.line(x, y - 2, x + colWidths.reduce((a, b) => a + b, 0), y - 2); // Separator line
    
                // Add data rows
                inventoryData.forEach(item => {
                    let currentX = x;
                    pdf.text(item.product, currentX, y);
                    currentX += colWidths[0];
                    pdf.text(item.location, currentX, y);
                    currentX += colWidths[1];
                    pdf.text(String(item.stock), currentX, y);
                    currentX += colWidths[2];
                    pdf.text(item.status, currentX, y);
                    y += rowHeight;
    
                    // Check if a new page is needed
                    if (y > pdf.internal.pageSize.getHeight() - 20) {
                        pdf.addPage();
                        y = 20;
                        // Add headers to the new page
                        let currentXNewPage = x;
                        pdf.setFont('helvetica', 'bold');
                        headers.forEach((header, index) => {
                            pdf.text(header, currentXNewPage, y);
                            currentXNewPage += colWidths[index];
                        });
                        y += rowHeight;
                        pdf.line(x, y - 2, x + colWidths.reduce((a, b) => a + b, 0), y - 2);
                        pdf.setFont('helvetica', 'normal');
                    }
                });
    
                pdf.save('inventory_report.pdf');
            } else {
                alert('jsPDF library is not included. Please add it to your HTML to generate PDF reports.');
                console.error('jsPDF library not found.');
            }
        }
    }
    
    function downloadFile(data, filename, mimeType) {
        const blob = new Blob([data], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // --- Integration Links ---
    productionLinkButton.addEventListener('click', () => {
        // Dummy implementation for Production Module navigation
        window.location.href = 'processing-plants.html#inventory-section'; // Replace with your actual URL
    });
    
    salesLinkButton.addEventListener('click', () => {
        // Dummy implementation for Sales Module navigation
        window.location.href = 'sales_module.html'; // Replace with your actual URL
    });
    
    erpLinkButton.addEventListener('click', () => {
        // Dummy implementation for connecting to External ERP
        window.open('https://your-erp-system.com', '_blank'); // Replace with your actual ERP URL
        alert('Attempting to connect to the External ERP system in a new tab.');
    });

    // --- "Add Inventory" Button ---
    addInventoryButton.addEventListener('click', openAddInventoryModal);

    // --- Chart Rendering ---
    renderStockBalanceChart();
    renderInventoryAgeingChart();

    // --- Initial Setup ---
    populateProductOptions();
    populateLocationOptions();
    updateInventoryTable(inventoryData);
    updateValuationTable(valuationData);

    // Load and show the last active section
    const activeSection = loadData(ACTIVE_SECTION_KEY, 'inventory-tracking-section');
    const activeButton = document.querySelector(`.nav-button[data-section="${activeSection}"]`);
    if (activeButton) {
        navButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }
    showSection(activeSection);
});