document.addEventListener('DOMContentLoaded', function() {

    // -------------------------------------------------------------------------
    // --- Navigation Functionality ---
    // -------------------------------------------------------------------------
    const navButtons = document.querySelectorAll('.nav-button');
    const moduleSections = document.querySelectorAll('.module-section');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            moduleSections.forEach(section => section.classList.remove('active'));
            this.classList.add('active');
            const targetSectionId = this.getAttribute('data-section') + '-section';
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // -------------------------------------------------------------------------
    // --- Utility Functions ---
    // -------------------------------------------------------------------------
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function reverseDate(formattedDate) {
        if (!formattedDate) return '';
        const parts = formattedDate.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return '';
    }

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    window.addEventListener('click', function(event) {
        const addPartnerModal = document.getElementById('add-partner-modal');
        const addVehicleModal = document.getElementById('add-vehicle-modal');
        const addOrderModal = document.getElementById('add-order-modal');
        if (event.target === addPartnerModal) {
            closeModal('add-partner-modal');
        }
        if (event.target === addVehicleModal) {
            closeModal('add-vehicle-modal');
        }
        if (event.target === addOrderModal) {
            closeModal('add-order-modal');
        }
    });
    // -------------------------------------------------------------------------
    // --- Local Storage Keys ---
    // -------------------------------------------------------------------------
    const ORDERS_KEY = 'ordersData';
    const PARTNERS_KEY = 'partnersData';
    const FLEET_KEY = 'fleetData';
    const LOGS_KEY = 'maintenanceLogsData';

    // -------------------------------------------------------------------------
    // --- Local Storage Functions ---
    // -------------------------------------------------------------------------
    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function loadData(key) {
        const storedData = localStorage.getItem(key);
        return storedData ? JSON.parse(storedData) : null;
    }

    // -------------------------------------------------------------------------
    // --- Order Management Section ---
    // -------------------------------------------------------------------------
    const addOrderButton = document.getElementById('add-order-button');
    const addOrderModal = document.getElementById('add-order-modal');
    const addOrderForm = document.getElementById('add-order-form');
    const closeOrderModalButton = addOrderModal?.querySelector('.close-button');
    let ordersData = loadData(ORDERS_KEY) || [];
    let editingOrderId = null; // To track which order is being edited
    const orderDateInput = document.getElementById('order-date');

    // Set the max attribute of the order date input to today's date
    const today = new Date().toISOString().split('T')[0];
    if (orderDateInput) {
        orderDateInput.setAttribute('max', today);
    }

    function populateOrderTable(data) {
        const tableBody = document.getElementById('order-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        data.forEach(order => {
            const row = tableBody.insertRow();
            row.dataset.orderId = order.orderId;
            row.insertCell().textContent = order.orderId;
            row.insertCell().textContent = order.source;
            row.insertCell().textContent = formatDate(order.orderDate);
            row.insertCell().textContent = order.customer;
            row.insertCell().textContent = formatDate(order.deliveryDate);
            row.insertCell().textContent = order.status;
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <div class="action-button-container">
                    <button class="action-button small edit-button" data-id="${order.orderId}">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="action-button small delete-button" data-id="${order.orderId}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;
        });
        addOrderTableEventListeners();
    }

    function addOrderTableEventListeners() {
        const editButtons = document.querySelectorAll('#order-table-body .edit-button');
        const deleteButtons = document.querySelectorAll('#order-table-body .delete-button');

        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderId = parseInt(this.dataset.id);
                editingOrderId = orderId;
                const orderToEdit = ordersData.find(order => order.orderId === orderId);
                if (orderToEdit) {
                    document.getElementById('order-source').value = orderToEdit.source;
                    document.getElementById('order-date').value = reverseDate(orderToEdit.orderDate);
                    document.getElementById('order-customer').value = orderToEdit.customer;
                    document.getElementById('delivery-date').value = reverseDate(orderToEdit.deliveryDate);
                    document.getElementById('order-status').value = orderToEdit.status;
                    openModal('add-order-modal');
                }
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderId = parseInt(this.dataset.id);
                if (confirm(`Are you sure you want to delete order ID ${orderId}?`)) {
                    ordersData = ordersData.filter(order => order.orderId !== orderId);
                    populateOrderTable(ordersData);
                    saveData(ORDERS_KEY, ordersData);
                    updateDashboardCounts();
                }
            });
        });
    }

    addOrderButton.addEventListener('click', () => {
        editingOrderId = null;
        addOrderForm.reset();
        openModal('add-order-modal');
        // Ensure the max date is set when the modal opens for adding
        if (orderDateInput) {
            orderDateInput.setAttribute('max', today);
        }
    });

    if (closeOrderModalButton) {
        closeOrderModalButton.addEventListener('click', () => closeModal('add-order-modal'));
    }

    addOrderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const source = document.getElementById('order-source').value;
        const orderDate = document.getElementById('order-date').value;
        const customer = document.getElementById('order-customer').value;
        const deliveryDate = document.getElementById('delivery-date').value;
        const status = document.getElementById('order-status').value;

        // Basic client-side validation for order date (should not be in the future)
        if (orderDate > today) {
            alert('Order date cannot be in the future.');
            return;
        }

        if (editingOrderId) {
            ordersData = ordersData.map(order =>
                order.orderId === editingOrderId ?
                { ...order, source, orderDate, customer, deliveryDate, status } :
                order
            );
            editingOrderId = null;
        } else {
            const newOrderId = ordersData.length > 0 ? Math.max(...ordersData.map(o => o.orderId)) + 1 : 1001;
            const newOrder = { orderId: newOrderId, source, orderDate, customer, deliveryDate, status };
            ordersData.push(newOrder);
        }

        populateOrderTable(ordersData);
        saveData(ORDERS_KEY, ordersData);
        closeModal('add-order-modal');
        this.reset();
        updateDashboardCounts();
    });

    // -------------------------------------------------------------------------
    // --- Table Filtering Functionality (Applied to all tables) ---
    // -------------------------------------------------------------------------
    const filterInputs = document.querySelectorAll('.filter-input');

    filterInputs.forEach(input => {
        input.addEventListener('keyup', function() {
            const column = this.getAttribute('data-column');
            const value = this.value.toLowerCase();
            const tableBodyId = this.closest('table').querySelector('tbody').id;
            const tableBody = document.getElementById(tableBodyId);
            const rows = tableBody.querySelectorAll('tr');

            rows.forEach(row => {
                const cell = row.querySelector(`td:nth-child(${Array.from(this.closest('thead').querySelectorAll('th')).findIndex(th => th.getAttribute('data-column') === column) + 1})`);
                if (cell) {
                    row.style.display = cell.textContent.toLowerCase().includes(value) ? '' : 'none';
                }
            });
        });
    });

    // -------------------------------------------------------------------------
    // --- Table Sorting Functionality (Applied to all tables) ---
    // -------------------------------------------------------------------------
    const filterableHeaders = document.querySelectorAll('.filterable');

filterableHeaders.forEach(header => {
    // Add an arrow element to each header
    const arrow = document.createElement('span');
    arrow.classList.add('arrow');
    arrow.style.marginLeft = '5px'; // Add some spacing
    header.appendChild(arrow);

    header.addEventListener('click', function() {
        const column = this.getAttribute('data-column');
        const type = this.getAttribute('data-type');
        const tableBodyId = this.closest('table').querySelector('tbody').id;
        const tableBody = document.getElementById(tableBodyId);
        const rows = Array.from(tableBody.querySelectorAll('tr'));
        const arrow = this.querySelector('.arrow');
        const isAscending = arrow.classList.contains('asc');

        // Reset all arrows in the current table
        this.closest('thead').querySelectorAll('.filterable').forEach(h => {
            const otherArrow = h.querySelector('.arrow');
            if (h !== this && otherArrow) {
                otherArrow.classList.remove('asc', 'desc');
                otherArrow.textContent = ''; // Clear other arrows
            }
        });

        // Sort the rows
        rows.sort((a, b) => {
            const aValue = a.querySelector(`td:nth-child(${Array.from(this.closest('thead').querySelectorAll('th')).findIndex(th => th.getAttribute('data-column') === column) + 1})`).textContent.toLowerCase();
            const bValue = b.querySelector(`td:nth-child(${Array.from(this.closest('thead').querySelectorAll('th')).findIndex(th => th.getAttribute('data-column') === column) + 1})`).textContent.toLowerCase();

            if (type === 'number') {
                return isAscending ? parseFloat(aValue) - parseFloat(bValue) : parseFloat(bValue) - parseFloat(aValue);
            } else if (column.includes('Date')) {
                const dateA = new Date(reverseDate(aValue));
                const dateB = new Date(reverseDate(bValue));
                return isAscending ? dateA - dateB : dateB - dateA;
            } else {
                return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
        });

        // Remove existing rows and append sorted rows
        tableBody.innerHTML = '';
        rows.forEach(row => tableBody.appendChild(row));

        // Update arrow direction and text
        arrow.classList.toggle('asc', !isAscending);
        arrow.classList.toggle('desc', isAscending && !arrow.classList.contains('asc'));
        arrow.textContent = isAscending ? '▲' : '▼';
    });
});


    // -------------------------------------------------------------------------
    // --- Distributor Management Section ---
    // -------------------------------------------------------------------------
    const addPartnerButton = document.querySelector('#distributor-management-section .inline-add-button');
    const addPartnerModal = document.getElementById('add-partner-modal');
    const addPartnerForm = document.getElementById('add-partner-form');
    const closePartnerModalButton = addPartnerModal?.querySelector('.close-button');
    let partnersData = loadData(PARTNERS_KEY) || [];
    let editingPartnerIndex = null;

    function populatePartnerTable(data) {
        const tableBody = document.getElementById('partner-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        data.forEach((partner, index) => {
            const row = tableBody.insertRow();
            row.dataset.partnerIndex = index;
            row.insertCell().textContent = partner.name;
            row.insertCell().textContent = partner.type;
            row.insertCell().textContent = partner.territory;
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <div class="action-button-container">
                    <button class="action-button small edit-button" data-index="${index}">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="action-button small delete-button" data-index="${index}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;
        });
        addPartnerTableEventListeners();
    }

    function addPartnerTableEventListeners() {
        const editButtons = document.querySelectorAll('#partner-table-body .edit-button');
        const deleteButtons = document.querySelectorAll('#partner-table-body .delete-button');

        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const partnerToEdit = partnersData[index];
                if (partnerToEdit) {
                    editingPartnerIndex = index;
                    document.getElementById('partner-name').value = partnerToEdit.name;
                    document.getElementById('partner-type').value = partnerToEdit.type;
                    document.getElementById('partner-territory').value = partnerToEdit.territory;
                    openModal('add-partner-modal');
                }
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (confirm(`Are you sure you want to delete ${partnersData[index].name}?`)) {
                    partnersData.splice(index, 1);
                    populatePartnerTable(partnersData);
                    saveData(PARTNERS_KEY, partnersData);
                }
            });
        });
    }

    addPartnerButton.addEventListener('click', () => {
        editingPartnerIndex = null;
        addPartnerForm.reset();
        openModal('add-partner-modal');
    });

    if (closePartnerModalButton) {
        closePartnerModalButton.addEventListener('click', () => closeModal('add-partner-modal'));
    }

    addPartnerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('partner-name').value;
        const type = document.getElementById('partner-type').value;
        const territory = document.getElementById('partner-territory').value;

        if (editingPartnerIndex !== null) {
            partnersData[editingPartnerIndex] = { name, type, territory };
            editingPartnerIndex = null;
        } else {
            const newPartner = { name, type, territory };
            partnersData.push(newPartner);
        }

        populatePartnerTable(partnersData);
        saveData(PARTNERS_KEY, partnersData);
        closeModal('add-partner-modal');
        this.reset();
    });

    // Initialize partner table
    populatePartnerTable(partnersData);

    // -------------------------------------------------------------------------
    // --- Fleet Management Section ---
    // -------------------------------------------------------------------------
    const addVehicleButton = document.querySelector('#fleet-management-section .inline-add-button');
    const addVehicleModal = document.getElementById('add-vehicle-modal');
    const addVehicleForm = document.getElementById('add-vehicle-form');
    const closeVehicleModalButton = addVehicleModal?.querySelector('.close-button');
    const vehicleStatusSelect = document.getElementById('vehicle-status');
    const maintenanceDetailsDiv = document.getElementById('maintenance-details');
    const serviceDateInput = document.getElementById('service-date');
    const maintenanceDescriptionTextarea = document.getElementById('maintenance-description');
    let fleetData = loadData(FLEET_KEY) || [];
    let editingVehicleIndex = null;

    function populateFleetTable(data) {
        const tableBody = document.getElementById('fleet-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        data.forEach((vehicle, index) => {
            const row = tableBody.insertRow();
            row.dataset.vehicleIndex = index;
            row.insertCell().textContent = vehicle.vehicleId;
            row.insertCell().textContent = vehicle.model;
            row.insertCell().textContent = vehicle.capacity;
            row.insertCell().textContent = vehicle.status;
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <div class="action-button-container">
                    <button class="action-button small edit-button" data-index="${index}">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                   <button class="action-button small delete-button" data-index="${index}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;
        });
        addFleetTableEventListeners();
    }

    function addFleetTableEventListeners() {
        const editButtons = document.querySelectorAll('#fleet-table-body .edit-button');
        const deleteButtons = document.querySelectorAll('#fleet-table-body .delete-button');

        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const vehicleToEdit = fleetData[index];
                if (vehicleToEdit) {
                    editingVehicleIndex = index;
                    document.getElementById('vehicle-id').value = vehicleToEdit.vehicleId;
                    document.getElementById('vehicle-model').value = vehicleToEdit.model;
                    document.getElementById('vehicle-capacity').value = vehicleToEdit.capacity;
                    document.getElementById('vehicle-status').value = vehicleToEdit.status;
                    toggleMaintenanceDetails(vehicleToEdit.status);
                    openModal('add-vehicle-modal');
                }
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (confirm(`Are you sure you want to delete vehicle ID ${fleetData[index].vehicleId}?`)) {
                    fleetData.splice(index, 1);
                    populateFleetTable(fleetData);
                    saveData(FLEET_KEY, fleetData);
                }
            });
        });
    }

    function toggleMaintenanceDetails(status) {
        if (status === 'Maintenance') {
            maintenanceDetailsDiv.style.display = 'block';
            serviceDateInput.required = true;
            maintenanceDescriptionTextarea.required = true;
        } else {
            maintenanceDetailsDiv.style.display = 'none';
            serviceDateInput.required = false;
            maintenanceDescriptionTextarea.required = false;
            serviceDateInput.value = '';
            maintenanceDescriptionTextarea.value = '';
        }
    }

    vehicleStatusSelect.addEventListener('change', () => toggleMaintenanceDetails(vehicleStatusSelect.value));

    addVehicleButton.addEventListener('click', () => {
        editingVehicleIndex = null;
        addVehicleForm.reset();
        toggleMaintenanceDetails('Operational'); // Default to operational on add
        openModal('add-vehicle-modal');
    });

    if (closeVehicleModalButton) {
        closeVehicleModalButton.addEventListener('click', () => closeModal('add-vehicle-modal'));
    }

    addVehicleForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const vehicleId = document.getElementById('vehicle-id').value;
        const model = document.getElementById('vehicle-model').value;
        const capacity = document.getElementById('vehicle-capacity').value;
        const status = document.getElementById('vehicle-status').value;

        const updatedVehicle = { vehicleId, model, capacity, status };

        if (editingVehicleIndex !== null) {
            fleetData[editingVehicleIndex] = updatedVehicle;
            editingVehicleIndex = null;
        } else {
            fleetData.push(updatedVehicle);
        }

        populateFleetTable(fleetData);
        saveData(FLEET_KEY, fleetData);

        if (status === 'Maintenance') {
            const serviceDateValue = document.getElementById('service-date').value;
            const description = document.getElementById('maintenance-description').value;
            const selectedDate = new Date(serviceDateValue);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate > today) {
                alert('Service Date cannot be in the future.');
                return;
            }
            maintenanceLogsData.push({
                vehicleId: vehicleId,
                serviceDate: formatDate(serviceDateValue),
                description: description
            });
            populateMaintenanceLogTable(maintenanceLogsData);
            saveData(LOGS_KEY, maintenanceLogsData);
        }

        closeModal('add-vehicle-modal');
        this.reset();
        toggleMaintenanceDetails('Operational');
    });

    // -------------------------------------------------------------------------
    // --- Maintenance Logs Section ---
    // -------------------------------------------------------------------------
    let maintenanceLogsData = loadData(LOGS_KEY) || [];

    function populateMaintenanceLogTable(data) {
        const tableBody = document.getElementById('maintenance-log-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        data.forEach(log => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = log.vehicleId;
            row.insertCell().textContent = formatDate(log.serviceDate);
            row.insertCell().textContent = log.description;
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <div class="action-button-container">
                    <button class="action-button small delete-button" data-vehicle-id="${log.vehicleId}" data-service-date="${log.serviceDate}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;
        });
        addMaintenanceLogTableEventListeners();
    }

    function addMaintenanceLogTableEventListeners() {
        const deleteButtons = document.querySelectorAll('#maintenance-log-body .delete-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const vehicleId = this.dataset.vehicleId;
                const serviceDate = this.dataset.serviceDate;
                if (confirm(`Are you sure you want to delete the maintenance log for Vehicle ID ${vehicleId} on ${formatDate(serviceDate)}?`)) {
                    maintenanceLogsData = maintenanceLogsData.filter(log => !(log.vehicleId === vehicleId && log.serviceDate === serviceDate));
                    populateMaintenanceLogTable(maintenanceLogsData);
                    saveData(LOGS_KEY, maintenanceLogsData);
                }
            });
        });
    }

    // -------------------------------------------------------------------------
    // --- Data Initialization ---
    // -------------------------------------------------------------------------
    async function initializeData() {
        ordersData = loadData(ORDERS_KEY) || [
            { orderId: 1001, source: 'Retail Store 1', orderDate: '2025-05-01', customer: 'Alpha Corp', deliveryDate: '2025-05-10', status: 'Processing' },
            { orderId: 1002, source: 'Franchise A', orderDate: '2025-05-02', customer: 'Beta Inc', deliveryDate: '2025-05-11', status: 'In-Transit' },
            { orderId: 1003, source: 'Direct Order', orderDate: '2025-05-03', customer: 'Gamma Ltd', deliveryDate: '2025-05-12', status: 'Delivered' },
        ];
        populateOrderTable(ordersData);

        partnersData = loadData(PARTNERS_KEY) || [
            { name: 'City Distributor', type: 'Distributor', territory: 'Urban' },
            { name: 'Local Retailer', type: 'Retailer', territory: 'Local' },
        ];
        populatePartnerTable(partnersData);

        fleetData = loadData(FLEET_KEY) || [
            { vehicleId: 'V001', model: 'Truck Model X', capacity: '1000 L', status: 'Operational' },
            { vehicleId: 'V002', model: 'Van Model Y', capacity: '500 Units', status: 'Maintenance' },
        ];
        populateFleetTable(fleetData);

        maintenanceLogsData = loadData(LOGS_KEY) || [
            { vehicleId: 'V002', serviceDate: '2025-05-05', description: 'Routine maintenance' },
            { vehicleId: 'V001', serviceDate: '2025-04-28', description: 'Tyre replacement' },
        ];
        populateMaintenanceLogTable(maintenanceLogsData);

        updateDashboardCounts();
    }

    initializeData();

    // -------------------------------------------------------------------------
    // --- Dashboard Counts Update ---
    // -------------------------------------------------------------------------
    function updateDashboardCounts() {
        document.querySelector('.new-orders .order-count').textContent = ordersData.filter(order => order.status === 'Processing').length;
        document.querySelector('.processing-orders .order-count').textContent = ordersData.filter(order => order.status === 'Processing').length;
        document.querySelector('.allocated-orders .order-count').textContent = ordersData.filter(order => order.status === 'Allocated').length;
        document.querySelector('.in-transit-orders .order-count').textContent = ordersData.filter(order => order.status === 'In-Transit').length;
        document.querySelector('.delivered-orders .order-count').textContent = ordersData.filter(order => order.status === 'Delivered').length;
    }

    // -------------------------------------------------------------------------
    // --- Route Optimization Section ---
    // -------------------------------------------------------------------------
    const routeOptimizationSection = document.getElementById('route-optimization-section');
    let routeMap;
    let destinationPoints = [];
    const optimizeRouteFormModal = document.getElementById('optimize-route-form-modal');
    const openOptimizeFormButton = document.getElementById('open-optimize-form-button');
    const optimizeRouteForm = document.getElementById('optimize-route-form');
    const addDestinationButton = document.getElementById('add-destination-button');
    const destinationInputsContainer = document.getElementById('destination-inputs-container');

    if (routeOptimizationSection) {
        routeMap = L.map('route-map').setView([12.9716, 77.5946], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        }).addTo(routeMap);

        // Open Optimize Route Form Modal
        if (openOptimizeFormButton) {
            openOptimizeFormButton.addEventListener('click', () => openModal('optimize-route-form-modal'));
        }

        // Close Optimize Route Form Modal
        const closeOptimizeModalButton = optimizeRouteFormModal?.querySelector('.close-button');
        if (closeOptimizeModalButton) {
            closeOptimizeModalButton.addEventListener('click', () => closeModal('optimize-route-form-modal'));
        }

        // Function to add a new destination input group
        function addNewDestinationInput() {
            const index = destinationInputsContainer.children.length;
            const newDestinationDiv = document.createElement('div');
            newDestinationDiv.innerHTML = `
                <div class="form-group">
                    <label for="latitude-${index}">Latitude ${index + 1}</label>
                    <input type="number" id="latitude-${index}" name="latitude[]" placeholder="Latitude" required>
                </div>
                <div class="form-group">
                    <label for="longitude-${index}">Longitude ${index + 1}</label>
                    <input type="number" id="longitude-${index}" name="longitude[]" placeholder="Longitude" required>
                </div>
                <div class="form-group">
                    <label for="destination-address-${index}">Address ${index + 1} (Optional)</label>
                    <input type="text" id="destination-address-${index}" name="address[]" placeholder="Address">
                </div>
            `;
            destinationInputsContainer.appendChild(newDestinationDiv);
        }

        // Event listener to add new destination inputs
        if (addDestinationButton) {
            addDestinationButton.addEventListener('click', addNewDestinationInput);
        }

        // Handle Optimize Route Form Submission
        if (optimizeRouteForm) {
            optimizeRouteForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const latitudeInputs = document.querySelectorAll('input[name="latitude[]"]');
                const longitudeInputs = document.querySelectorAll('input[name="longitude[]"]');
                const addressInputs = document.querySelectorAll('input[name="address[]"]');
                destinationPoints = [];

                for (let i = 0; i < latitudeInputs.length; i++) {
                    const lat = parseFloat(latitudeInputs[i].value);
                    const lng = parseFloat(longitudeInputs[i].value);
                    const address = addressInputs[i].value.trim();

                    if (isNaN(lat) || isNaN(lng)) {
                        alert('Please enter valid latitude and longitude for all destinations.');
                        return;
                    }
                    destinationPoints.push({ lat: lat, lng: lng, address: address });
                    L.marker([lat, lng]).addTo(routeMap).bindPopup(address || `Lat: ${lat}, Lng: ${lng}`);
                }

                optimizeRoute();
                closeModal('optimize-route-form-modal');
            });
        }

        async function optimizeRoute() {
            if (destinationPoints.length < 2) {
                alert('Please add at least two destination points to optimize the route.');
                return;
            }

            const waypoints = destinationPoints.map(point => [point.lng, point.lat]);
            console.log('Optimizing route with waypoints:', waypoints);

            // Placeholder for routing service integration
            const optimizedRouteCoordinates = [
                [77.5946, 12.9716],
                waypoints[0],
                waypoints.length > 1 ? waypoints[1] : null,
                [77.5946, 12.9716]
            ].filter(Boolean);

            routeMap.eachLayer(layer => {
                if (layer instanceof L.Polyline) {
                    routeMap.removeLayer(layer);
                }
            });

            if (optimizedRouteCoordinates.length > 1) {
                L.polyline(optimizedRouteCoordinates, { color: 'blue' }).addTo(routeMap).bindPopup('Optimized Route');
                const bounds = new L.LatLngBounds(optimizedRouteCoordinates);
                routeMap.fitBounds(bounds);
            } else {
                alert('Could not generate a route with the given points.');
            }
        }
    }

    // -------------------------------------------------------------------------
    // --- Driver Management Section ---
    // -------------------------------------------------------------------------
    const addDriverButton = document.getElementById('add-driver-button');
    const addDriverModal = document.getElementById('add-driver-modal');
    const addDriverForm = document.getElementById('add-driver-form');
    const closeDriverModalButton = addDriverModal?.querySelector('.close-button');
    const driverTableBody = document.getElementById('driver-table-body');
    let driversData = []; // In a real app, load this from localStorage or an API
    let editingDriverIndex = null;

    // Function to populate the driver table
    function populateDriverTable(data) {
        if (!driverTableBody) return;
        driverTableBody.innerHTML = '';
        data.forEach((driver, index) => {
            const row = driverTableBody.insertRow();
            row.dataset.driverIndex = index;
            row.insertCell().textContent = driver.name;
            row.insertCell().textContent = driver.schedule;
            row.insertCell().textContent = driver.vehicle;
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <div class="action-button-container">
                    <button class="action-button small edit-button" data-index="${index}">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="action-button small delete-button" data-index="${index}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;
        });
        addDriverTableEventListeners();
    }

    // Function to add event listeners to driver table actions
    function addDriverTableEventListeners() {
        const editButtons = driverTableBody.querySelectorAll('.edit-button');
        const deleteButtons = driverTableBody.querySelectorAll('.delete-button');

        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const driverToEdit = driversData[index];
                if (driverToEdit) {
                    editingDriverIndex = index;
                    document.getElementById('driver-name').value = driverToEdit.name;
                    document.getElementById('driver-schedule').value = driverToEdit.schedule;
                    document.getElementById('driver-vehicle').value = driverToEdit.vehicle;
                    openModal('add-driver-modal');
                }
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (confirm(`Are you sure you want to delete ${driversData[index].name}?`)) {
                    driversData.splice(index, 1);
                    populateDriverTable(driversData);
                    // In a real app, also update localStorage or the backend
                }
            });
        });
    }

    // Open Add Driver Modal
    if (addDriverButton) {
        addDriverButton.addEventListener('click', () => {
            editingDriverIndex = null;
            addDriverForm.reset();
            openModal('add-driver-modal');
            populateVehicleOptions(); // Populate the vehicle dropdown
        });
    }

    // Close Add Driver Modal
    if (closeDriverModalButton) {
        closeDriverModalButton.addEventListener('click', () => closeModal('add-driver-modal'));
    }

    // Handle Add/Edit Driver Form Submission
    if (addDriverForm) {
        addDriverForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('driver-name').value;
            const schedule = document.getElementById('driver-schedule').value;
            const vehicle = document.getElementById('driver-vehicle').value;

            const newDriver = { name, schedule, vehicle };

            if (editingDriverIndex !== null) {
                driversData[editingDriverIndex] = newDriver;
                editingDriverIndex = null;
            } else {
                driversData.push(newDriver);
            }

            populateDriverTable(driversData);
            closeModal('add-driver-modal');
            this.reset();
            // In a real app, also save to localStorage or the backend
        });
    }

    // Function to populate the vehicle options in the add/edit driver modal
    function populateVehicleOptions() {
        const vehicleSelect = document.getElementById('driver-vehicle');
        if (vehicleSelect && fleetData) {
            vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
            fleetData.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.vehicleId;
                option.textContent = `${vehicle.model} (${vehicle.vehicleId})`;
                vehicleSelect.appendChild(option);
            });
        }
    }

    // Initialize driver data (replace with your actual data loading)
    driversData = [
        { name: 'John Doe', schedule: 'Mon-Fri, 9-5', vehicle: 'V001' },
        { name: 'Jane Smith', schedule: 'Tue-Sat, 10-6', vehicle: 'V003' },
    ];
    populateDriverTable(driversData);

    // -------------------------------------------------------------------------
// --- Delivery Tracking Section ---
// -------------------------------------------------------------------------
const deliveryTrackingSection = document.getElementById('delivery-tracking-section');
let deliveryMap;
const trackAllDeliveriesButton = document.getElementById('track-all-deliveries-button');
const addDeliveryLogButton = document.getElementById('add-delivery-log-button');
const addDeliveryLogModal = document.getElementById('add-delivery-log-modal');
const addDeliveryLogForm = document.getElementById('add-delivery-log-form');
const deliveryLogBody = document.getElementById('delivery-log-body');
let deliveryLogsData = []; // In a real app, load this from localStorage or an API

// Dummy vehicle locations (replace with real-time data fetching)
const vehicleLocations = {
    'V001': { lat: 17.3850, lng: 78.4867 }, // Hyderabad
    'V002': { lat: 17.6868, lng: 83.2185 }, // Visakhapatnam
};

// Dummy delivery addresses (replace with actual order delivery addresses)
const deliveryAddresses = {
    'ORDER001': { address: 'Hyderabad' },
    'ORDER002': { address: 'Visakhapatnam' },
    'ORDER003': { address: 'Bengaluru' }, // Example undelivered
};

if (deliveryTrackingSection) {
    deliveryMap = L.map('delivery-map').setView([15, 80], 6); // Adjusted initial view
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(deliveryMap);

    // Function to fetch coordinates from address using a geocoding service
    async function getCoordinates(address) {
        try {
            // Replace with a real geocoding API (e.g., Nominatim, Google Geocoding API)
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}, India&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            } else {
                console.warn(`Could not find coordinates for address: ${address}`);
                return null;
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    }

    // Function to update delivery markers on the map
    async function updateDeliveryMarkers() {
        deliveryMap.eachLayer(layer => {
            if (layer instanceof L.Marker && layer.options.isDeliveryMarker) {
                deliveryMap.removeLayer(layer);
            }
        });

        for (const orderId in deliveryAddresses) {
            const deliveryPointData = deliveryAddresses[orderId];
            const coordinates = await getCoordinates(deliveryPointData.address);

            if (coordinates) {
                const marker = L.marker([coordinates.lat, coordinates.lng], { isDeliveryMarker: true })
                    .addTo(deliveryMap)
                    .bindPopup(`Delivery for Order ID: ${orderId}<br>Location: ${deliveryPointData.address}`);

                let isDelivered = false;
                // Check for delivery status based on dummy vehicle locations
                for (const vehicleId in vehicleLocations) {
                    const vehicleLocation = vehicleLocations[vehicleId];
                    if (Math.abs(vehicleLocation.lat - coordinates.lat) < 0.01 && Math.abs(vehicleLocation.lng - coordinates.lng) < 0.01) {
                        marker.setIcon(L.icon({
                            iconUrl: 'images/delivered_marker.png',
                            iconSize: [32, 32],
                            iconAnchor: [16, 32],
                            popupAnchor: [0, -32]
                        }));
                        isDelivered = true;
                        break; // Assuming one vehicle delivers to one location closely
                    }
                }
                if (!isDelivered) {
                    // Set a default marker if not considered delivered by the dummy logic
                    marker.setIcon(L.icon({
                        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    }));
                }
            }
        }
    }

    // Initial update of delivery markers
    updateDeliveryMarkers();

    // Event listener for "Track All Deliveries" button (you'll need to implement real-time tracking logic here)
    if (trackAllDeliveriesButton) {
        trackAllDeliveriesButton.addEventListener('click', () => {
            alert('Track All Deliveries functionality will be implemented here (fetching real-time vehicle locations).');
            // In a real application, this would fetch vehicle locations and update markers
        });
    }

    // Open Add Delivery Log Modal
    if (addDeliveryLogButton) {
        addDeliveryLogButton.addEventListener('click', () => {
            openModal('add-delivery-log-modal');
            populateDriverOptionsDelivery();
            populateVehicleOptionsDelivery();
        });
    }

    // Close Add Delivery Log Modal
    const closeDeliveryLogModalButton = addDeliveryLogModal?.querySelector('.close-button');
    if (closeDeliveryLogModalButton) {
        closeDeliveryLogModalButton.addEventListener('click', () => closeModal('add-delivery-log-modal'));
    }

    // Handle Add Delivery Log Form Submission
    if (addDeliveryLogForm) {
        addDeliveryLogForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const orderId = document.getElementById('delivery-order-id').value;
            const driver = document.getElementById('delivery-driver').value;
            const vehicle = document.getElementById('delivery-vehicle').value;
            const deliveryTime = document.getElementById('delivery-time').value;
            const deliveryLocation = document.getElementById('delivery-location').value;
            const status = document.getElementById('delivery-status').value;
            const confirmation = document.getElementById('delivery-confirmation').value;

            const newLog = { orderId, driver, vehicle, deliveryTime, deliveryLocation, status, confirmation };
            deliveryLogsData.push(newLog);
            deliveryAddresses[orderId] = { address: deliveryLocation }; // Update delivery addresses
            await updateDeliveryMarkers(); // Update map markers after adding a new log
            populateDeliveryLogTable(deliveryLogsData);
            closeModal('add-delivery-log-modal');
            this.reset();
            // In a real app, save to localStorage or backend
        });
    }

    // Function to populate the delivery log table
    function populateDeliveryLogTable(data) {
        if (!deliveryLogBody) return;
        deliveryLogBody.innerHTML = '';
        data.forEach(log => {
            const row = deliveryLogBody.insertRow();
            row.insertCell().textContent = log.orderId;
            row.insertCell().textContent = log.driver;
            row.insertCell().textContent = log.vehicle;
            row.insertCell().textContent = log.deliveryTime;
            row.insertCell().textContent = log.deliveryLocation;
            row.insertCell().textContent = log.status;
            row.insertCell().textContent = log.confirmation;
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <div class="action-button-container">
                    <button class="action-button small edit-button" data-order-id="${log.orderId}">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="action-button small delete-button" data-order-id="${log.orderId}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;
        });
        addDeliveryLogTableEventListeners();
    }

    function addDeliveryLogTableEventListeners() {
        const editButtons = deliveryLogBody.querySelectorAll('.edit-button');
        const deleteButtons = deliveryLogBody.querySelectorAll('.delete-button');

        editButtons.forEach(button => {
            button.addEventListener('click', async function() {
                const orderId = this.dataset.orderId;
                const logToEdit = deliveryLogsData.find(log => log.orderId === orderId);
                if (logToEdit) {
                    // Populate the modal form for editing
                    document.getElementById('delivery-order-id').value = logToEdit.orderId;
                    document.getElementById('delivery-driver').value = logToEdit.driver;
                    document.getElementById('delivery-vehicle').value = logToEdit.vehicle;
                    document.getElementById('delivery-time').value = logToEdit.deliveryTime;
                    document.getElementById('delivery-location').value = logToEdit.deliveryLocation;
                    document.getElementById('delivery-status').value = logToEdit.status;
                    document.getElementById('delivery-confirmation').value = logToEdit.confirmation;
                    openModal('add-delivery-log-modal');
                    // You'll need to handle the edit submission logic in the form submit event
                }
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', async function() {
                const orderIdToDelete = this.dataset.orderId;
                if (confirm(`Are you sure you want to delete log for Order ID ${orderIdToDelete}?`)) {
                    deliveryLogsData = deliveryLogsData.filter(log => log.orderId !== orderIdToDelete);
                    delete deliveryAddresses[orderIdToDelete]; // Remove delivery address
                    await updateDeliveryMarkers(); // Update map markers after deletion
                    populateDeliveryLogTable(deliveryLogsData);
                    // In a real app, update localStorage or backend
                }
            });
        });
    }

    // Function to populate driver options in delivery log modal
    function populateDriverOptionsDelivery() {
        const driverSelect = document.getElementById('delivery-driver');
        if (driverSelect && driversData) {
            driverSelect.innerHTML = '<option value="">Select Driver</option>';
            driversData.forEach(driver => {
                const option = document.createElement('option');
                option.value = driver.name;
                option.textContent = driver.name;
                driverSelect.appendChild(option);
            });
        }
    }

    // Function to populate vehicle options in delivery log modal
    function populateVehicleOptionsDelivery() {
        const vehicleSelect = document.getElementById('delivery-vehicle');
        if (vehicleSelect && fleetData) {
            vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
            fleetData.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.vehicleId;
                option.textContent = `${vehicle.model} (${vehicle.vehicleId})`;
                vehicleSelect.appendChild(option);
            });
        }
    }

    // Initialize delivery logs data (replace with your actual data loading)
    deliveryLogsData = [
        { orderId: 'ORDER001', driver: 'John Doe', vehicle: 'V001', deliveryTime: '2025-05-09T14:00', deliveryLocation: 'Hyderabad', status: 'Delivered', confirmation: 'Signed by recipient' },
        { orderId: 'ORDER002', driver: 'Jane Smith', vehicle: 'V002', deliveryTime: '2025-05-09T15:30', deliveryLocation: 'Visakhapatnam', status: 'Delivered', confirmation: 'Left at doorstep' },
        { orderId: 'ORDER003', driver: 'John Doe', vehicle: 'V003', deliveryTime: '2025-05-09T16:00', deliveryLocation: 'Bengaluru', status: 'In Transit', confirmation: '' },
    ];
    populateDeliveryLogTable(deliveryLogsData);
    updateDeliveryMarkers(); // Initial map update

    // Ensure the delivery tracking map is in a block state
    if (deliveryTrackingSection) {
        const mapContainer = document.getElementById('delivery-map');
        if (mapContainer) {
            mapContainer.style.display = 'block';
        }
    }
}
});