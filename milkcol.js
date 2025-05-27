document.addEventListener('DOMContentLoaded', () => {
    // --- Utility Functions ---
    function generateId(prefix = 'item') {
        return `${prefix}-${Math.random().toString(36).substring(2, 15)}`;
    }

    function saveToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function getFromLocalStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // --- Data Initialization ---
    const COLLECTION_CENTERS_KEY = 'collectionCenters';
    const ROUTES_KEY = 'routes';
    const MILK_COLLECTION_RECORDS_KEY = 'milkCollectionRecords';
    const VEHICLES_KEY = 'vehicles';
    const DRIVERS_KEY = 'drivers';
    const LOGISTICS_DATA_KEY = 'logisticsData';
    const QUALITY_CHECKS_KEY = 'qualityChecks';

    let collectionCenters = getFromLocalStorage(COLLECTION_CENTERS_KEY);
    let routes = getFromLocalStorage(ROUTES_KEY);
    let milkCollectionRecords = getFromLocalStorage(MILK_COLLECTION_RECORDS_KEY);
    let vehicles = getFromLocalStorage(VEHICLES_KEY);
    let drivers = getFromLocalStorage(DRIVERS_KEY);
    let logisticsData = getFromLocalStorage(LOGISTICS_DATA_KEY);
    let qualityChecks = getFromLocalStorage(QUALITY_CHECKS_KEY);

    // --- Navigation ---
    const navButtons = document.querySelectorAll('.qc-navigation .nav-button');
    const qcSections = document.querySelectorAll('.qc-section');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            qcSections.forEach(section => section.classList.remove('active'));
            this.classList.add('active');
            const targetSectionId = this.dataset.section + '-section';
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                // Render data based on the active section
                switch (this.dataset.section) {
                    case 'collection-centers':
                        renderCollectionCenters();
                        break;
                    case 'route-management':
                        renderRoutes();
                        populateRouteVehicleOptions();
                        populateRouteCenterOptions();
                        break;
                    case 'milk-tracking':
                        renderCollectionRecords();
                        populateRecordCenterOptions();
                        break;
                    case 'vehicle-management':
                        renderVehicles();
                        populateVehicleRouteOptions();
                        break;
                    case 'driver-management':
                        renderDrivers();
                        populateDriverVehicleOptions();
                        break;
                    case 'logistics-tracking':
                       // renderLogistics();
                       // populateLogisticsVehicleOptions();
                        break;
                    case 'quality-control':
                        renderQualityChecks();
                        populateQCCenterOptions();
                        break;
                }
            }
        });
    });

        // --- Collection Centers Section ---
const centersTableBody = document.getElementById('centers-table-body');
const addEditCenterModal = document.getElementById('add-edit-center-modal');
const addEditCenterForm = document.getElementById('add-edit-center-form');
const centerModalTitle = document.getElementById('center-modal-title');
const filterCentersInputs = document.querySelectorAll('#centers-table .filter-row input[type="text"], #centers-table .filter-row input[type="number"], #centers-table .filter-row select');
const centersTableHeader = document.querySelector('#centers-table thead tr');
const centersFilterRow = document.querySelector('#centers-table .filter-row');
const addCenterButton = document.querySelector('#collection-centers-section .controls .inline-add-button');
const closeCenterModalButton = document.querySelector('#add-edit-center-modal .close-button');

if (centersFilterRow) centersFilterRow.classList.add('hidden');
if (addEditCenterModal) addEditCenterModal.style.display = 'none';

function openAddCenterModal() {
    centerModalTitle.textContent = 'Add New Center';
    addEditCenterForm.reset();
    document.getElementById('center-id').value = '';
    clearErrorMessages();
    addEditCenterModal.style.display = 'block';
}

function closeAddCenterModal() {
    addEditCenterModal.style.display = 'none';
    clearErrorMessages();
}

function renderCollectionCenters(centersToRender = collectionCenters) {
    centersTableBody.innerHTML = '';
    if (centersToRender.length > 0) {
        centersToRender.forEach(center => {
            const row = centersTableBody.insertRow();
            row.insertCell().textContent = center.name;
            row.insertCell().textContent = center.location;
            row.insertCell().textContent = center.capacity;
            row.insertCell().textContent = center.status;
            const actionsCell = row.insertCell();
            actionsCell.innerHTML = `
                <button class="action-button edit-button small" onclick="editCenter('${center.id}')"><span class="material-symbols-outlined">edit</span></button>
                <button class="action-button delete-button small" onclick="deleteCenter('${center.id}')"><span class="material-symbols-outlined">delete</span></button>
            `;
        });
        renderCenterCollectionChart();
    } else {
        centersTableBody.innerHTML = '<tr><td colspan="5">No collection centers available.</td></tr>';
        const chartCanvas = document.getElementById('center-collection-chart');
        if (chartCanvas && Chart.getChart(chartCanvas)) {
            Chart.getChart(chartCanvas).destroy();
        }
    }
}

window.editCenter = (id) => {
    const center = collectionCenters.find(c => c.id === id);
    if (center) {
        centerModalTitle.textContent = 'Edit Center';
        document.getElementById('center-id').value = center.id;
        document.getElementById('center-name').value = center.name;
        document.getElementById('center-location').value = center.location;
        document.getElementById('center-capacity').value = center.capacity;
        document.getElementById('center-status').value = center.status;
        clearErrorMessages();
        addEditCenterModal.style.display = 'block';
    }
};

window.deleteCenter = (id) => {
    if (confirm('Are you sure you want to delete this collection center?')) {
        collectionCenters = collectionCenters.filter(c => c.id !== id);
        saveToLocalStorage(COLLECTION_CENTERS_KEY, collectionCenters);
        renderCollectionCenters();
        showNotification('Collection center deleted successfully.', 'success');
    }
};

if (addEditCenterForm) {
    addEditCenterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrorMessages();

        const id = document.getElementById('center-id').value || generateId('center');
        const nameInput = document.getElementById('center-name');
        const locationInput = document.getElementById('center-location');
        const capacityInput = document.getElementById('center-capacity');
        const statusInput = document.getElementById('center-status');

        const name = nameInput.value.trim();
        const location = locationInput.value.trim();
        const capacityValue = capacityInput.value.trim();
        const status = statusInput.value;
        let hasError = false;
        let capacity;

        // Validate Name
        if (!name) {
            displayErrorMessage(nameInput, 'Center Name is required.');
            hasError = true;
        } else if (name.length > 25) {
            displayErrorMessage(nameInput, 'Center Name should not exceed 25 characters.');
            hasError = true;
        } else if (!/^[A-Za-z\s\-']+$/.test(name)) {
            displayErrorMessage(nameInput, 'Center Name should only contain letters, spaces, hyphens, and apostrophes.');
            hasError = true;
        }

        // Validate Location
        if (!location) {
            displayErrorMessage(locationInput, 'Location is required.');
            hasError = true;
        } else if (location.length > 50) {
            displayErrorMessage(locationInput, 'Location should not exceed 50 characters.');
            hasError = true;
        }

        // Validate Capacity
        if (!capacityValue) {
            displayErrorMessage(capacityInput, 'Capacity is required.');
            hasError = true;
        } else {
            capacity = parseFloat(capacityValue);
            if (isNaN(capacity) || capacity <= 0) {
                displayErrorMessage(capacityInput, 'Capacity must be a number greater than 0.');
                hasError = true;
            }
        }

        if (hasError) {
            return; // Stop submission if there are errors
        }

        const centerIndex = collectionCenters.findIndex(c => c.id === id);
        const newCenter = { id, name, location, capacity, status };
        if (centerIndex > -1) {
            collectionCenters[centerIndex] = newCenter;
            showNotification('Collection center updated successfully.', 'success');
        } else {
            collectionCenters.push(newCenter);
            showNotification('Collection center added successfully.', 'success');
        }
        saveToLocalStorage(COLLECTION_CENTERS_KEY, collectionCenters);
        renderCollectionCenters();
        closeAddCenterModal();
    });
}

function displayErrorMessage(inputElement, message) {
    const errorSpan = document.createElement('span');
    errorSpan.classList.add('error-message');
    errorSpan.textContent = message;
    inputElement.parentNode.insertBefore(errorSpan, inputElement.nextSibling);
}

function clearErrorMessages() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

function filterCenters() {
    const filters = {};
    filterCentersInputs.forEach(input => {
        if (input.value) {
            filters[input.dataset.column] = input.value.toLowerCase();
        }
    });

    let filteredCenters = [...collectionCenters];
    for (const column in filters) {
        const filterValue = filters[column];
        filteredCenters = filteredCenters.filter(center => String(center[column]).toLowerCase().includes(filterValue));
    }
    renderCollectionCenters(filteredCenters);
}

filterCentersInputs.forEach(input => {
    input.addEventListener('input', filterCenters);
});

function sortCenters(column) {
    // Implement sorting logic here
}

if (centersTableHeader) {
    centersTableHeader.querySelectorAll('.filterable').forEach(th => {
        th.addEventListener('click', () => sortCenters(th.dataset.column));
    });
}

const toggleCentersFilterButton = document.querySelector('#collection-centers-section .controls h4');
if (toggleCentersFilterButton && centersFilterRow) {
    toggleCentersFilterButton.addEventListener('click', () => {
        centersFilterRow.classList.toggle('hidden');
    });
}

if (addCenterButton) {
    addCenterButton.addEventListener('click', openAddCenterModal);
}

if (closeCenterModalButton) {
    closeCenterModalButton.addEventListener('click', closeAddCenterModal);
}

if (addEditCenterModal) {
    addEditCenterModal.addEventListener('click', (event) => {
        if (event.target === addEditCenterModal) {
            closeAddCenterModal();
        }
    });
}

function renderCenterCollectionChart() {
    const chartCanvas = document.getElementById('center-collection-chart');
    if (!chartCanvas) return;

    const weeklyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: collectionCenters.map(center => ({
            label: center.name,
            data: [
                Math.floor(Math.random() * center.capacity * 0.8),
                Math.floor(Math.random() * center.capacity * 0.7),
                Math.floor(Math.random() * center.capacity * 0.9),
                Math.floor(Math.random() * center.capacity * 0.6),
                Math.floor(Math.random() * center.capacity * 0.85),
                Math.floor(Math.random() * center.capacity * 0.95),
                Math.floor(Math.random() * center.capacity * 0.75)
            ],
            backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
            borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
            borderWidth: 1
        }))
    };

    const existingChart = Chart.getChart(chartCanvas);
    if (existingChart) {
        existingChart.destroy();
    }
    new Chart(chartCanvas, {
        type: 'line',
        data: weeklyData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Liters Collected'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day of the Week'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Weekly Collection Trend by Center'
                }
            }
        }
    });
}

renderCollectionCenters();
// --- End Collection Centers Section ---

        
    // --- Route Management Section ---
    const routesTableBody = document.getElementById('routes-table-body');
    const addEditRouteModal = document.getElementById('add-edit-route-modal');
    const addEditRouteForm = document.getElementById('add-edit-route-form');
    const routeModalTitle = document.getElementById('route-modal-title');
    const routeCentersSelect = document.getElementById('route-centers');
    const routeAssignedVehicleSelect = document.getElementById('route-assigned-vehicle');
    const filterRoutesInputs = document.querySelectorAll('#routes-table .filter-row input[type="text"], #routes-table .filter-row input[type="number"], #routes-table .filter-row select');
    const routesTableHeader = document.querySelector('#routes-table thead tr');
    const routesFilterRow = document.querySelector('#routes-table .filter-row');
    const addRouteButton = document.querySelector('#route-management-section .controls .inline-add-button');
    const closeRouteModalButton = document.querySelector('#add-edit-route-modal .close-button');
    const optimizeRoutesButton = document.querySelector('#route-management-section .route-insights .action-button');

    if (routesFilterRow) routesFilterRow.classList.add('hidden');
    if (addEditRouteModal) addEditRouteModal.style.display = 'none';

    function openAddRouteModal() {
        routeModalTitle.textContent = 'Add New Route';
        addEditRouteForm.reset();
        document.getElementById('route-id').value = '';
        populateRouteCenterOptions();
        populateRouteVehicleOptions();
        addEditRouteModal.style.display = 'block';
    }

    function closeAddRouteModal() {
        addEditRouteModal.style.display = 'none';
    }

    function populateRouteCenterOptions(selectedCenters = []) {
        routeCentersSelect.innerHTML = '';
        collectionCenters.forEach(center => {
            const option = document.createElement('option');
            option.value = center.id;
            option.textContent = center.name;
            option.selected = selectedCenters.includes(center.id);
            routeCentersSelect.appendChild(option);
        });
    }

    function populateRouteVehicleOptions(selectedVehicle = '') {
        routeAssignedVehicleSelect.innerHTML = '<option value="">-- Select Vehicle --</option>';
        vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.type} (${vehicle.licensePlate})`;
            option.selected = vehicle.id === selectedVehicle;
            routeAssignedVehicleSelect.appendChild(option);
        });
        // Update filter select
        const filterSelect = document.querySelector('#routes-table .filter-row select[data-column="assignedVehicle"]');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All</option>';
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.type} (${vehicle.licensePlate})`;
                filterSelect.appendChild(option);
            });
        }
    }

    function renderRoutes(routesToRender = routes) {
        routesTableBody.innerHTML = '';
        if (routesToRender.length > 0) {
            routesToRender.forEach(route => {
                const row = routesTableBody.insertRow();
                row.insertCell().textContent = route.name;
                row.insertCell().textContent = route.centers ? route.centers.length : 0;
                const vehicle = vehicles.find(v => v.id === route.assignedVehicle);
                row.insertCell().textContent = vehicle ? `${vehicle.type} (${vehicle.licensePlate})` : '-';
                const actionsCell = row.insertCell();
                actionsCell.innerHTML = `
                    <button class="action-button edit-button small" onclick="editRoute('${route.id}')"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button small" onclick="deleteRoute('${route.id}')"><span class="material-symbols-outlined">delete</span></button>
                `;
            });
        } else {
            routesTableBody.innerHTML = '<tr><td colspan="4">No routes available.</td></tr>';
        }
    }

    window.editRoute = (id) => {
        const route = routes.find(r => r.id === id);
        if (route) {
            routeModalTitle.textContent = 'Edit Route';
            document.getElementById('route-id').value = route.id;
            document.getElementById('route-name').value = route.name;
            populateRouteCenterOptions(route.centers);
            populateRouteVehicleOptions(route.assignedVehicle);
            addEditRouteModal.style.display = 'block';
        }
    };

    window.deleteRoute = (id) => {
        if (confirm('Are you sure you want to delete this route?')) {
            routes = routes.filter(r => r.id !== id);
            saveToLocalStorage(ROUTES_KEY, routes);
            renderRoutes();
            showNotification('Route deleted successfully.', 'success');
        }
    };

    if (addEditRouteForm) {
        addEditRouteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('route-id').value || generateId('route');
            const name = document.getElementById('route-name').value;
            const centers = Array.from(routeCentersSelect.selectedOptions).map(option => option.value);
            const assignedVehicle = document.getElementById('route-assigned-vehicle').value;

            if (name && centers.length > 0) {
                const routeIndex = routes.findIndex(r => r.id === id);
                const newRoute = { id, name, centers, assignedVehicle };
                if (routeIndex > -1) {
                    routes[routeIndex] = newRoute;
                    showNotification('Route updated successfully.', 'success');
                } else {
                    routes.push(newRoute);
                    showNotification('Route added successfully.', 'success');
                }
                saveToLocalStorage(ROUTES_KEY, routes);
                renderRoutes();
                closeAddRouteModal();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    }

    function filterRoutes() {
        const filters = {};
        filterRoutesInputs.forEach(input => {
            if (input.value) {
                filters[input.dataset.column] = input.value.toLowerCase();
            }
        });

        let filteredRoutes = [...routes];
        for (const column in filters) {
            const filterValue = filters[column];
            filteredRoutes = filteredRoutes.filter(route => {
                if (column === 'assignedVehicle') {
                    const vehicle = vehicles.find(v => v.id === route.assignedVehicle);
                    const vehicleInfo = vehicle ? `${vehicle.type} (${vehicle.licensePlate})`.toLowerCase() : '';
                    return vehicleInfo.includes(filterValue);
                } else {
                    return String(route[column]).toLowerCase().includes(filterValue);
                }
            });
        }
        renderRoutes(filteredRoutes);
    }

    filterRoutesInputs.forEach(input => {
        input.addEventListener('input', filterRoutes);
    });

    function sortRoutes(column) {
        // Implement sorting logic here
    }

    if (routesTableHeader) {
        routesTableHeader.querySelectorAll('.filterable').forEach(th => {
            th.addEventListener('click', () => sortRoutes(th.dataset.column));
        });
    }

    const toggleRoutesFilterButton = document.querySelector('#route-management-section .controls h4');
    if (toggleRoutesFilterButton && routesFilterRow) {
        toggleRoutesFilterButton.addEventListener('click', () => {
            routesFilterRow.classList.toggle('hidden');
        });
    }

    // Event listeners for opening and closing the Add/Edit modal
    if (addRouteButton) {
        addRouteButton.addEventListener('click', openAddRouteModal);
    }
    if (closeRouteModalButton) {
        closeRouteModalButton.addEventListener('click', closeAddRouteModal);
    }
    if (addEditRouteModal) {
        addEditRouteModal.addEventListener('click', (event) => {
            if (event.target === addEditRouteModal) {
                closeAddRouteModal();
            }
        });
    }

    // Optimize Routes Button Functionality
    if (optimizeRoutesButton) {
        optimizeRoutesButton.addEventListener('click', () => {
            // 1. Gather data (in a real application, you'd fetch this dynamically)
            const centersForOptimization = collectionCenters.map(center => ({
                id: center.id,
                name: center.name,
                location: center.location // Assuming 'location' might have address info
                // In a real scenario, you'd ideally have lat/lng
            }));
            const availableVehicles = vehicles.map(vehicle => ({
                id: vehicle.id,
                capacity: vehicle.capacity // Assuming vehicles have a capacity
            }));
            const currentRoutes = [...routes]; // Get the current routes

            showNotification('Requesting optimized route suggestions...', 'info');

            // 2. Send data to backend for optimization (replace with your actual API endpoint)
            fetch('/api/optimize-routes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ centers: centersForOptimization, vehicles: availableVehicles, currentRoutes: currentRoutes }),
            })
            .then(response => response.json())
            .then(optimizedRoutes => {
                console.log('Optimized Routes:', optimizedRoutes);
                showNotification('Optimized route suggestions received.', 'success');
                // 3. Update the UI to display the optimized routes
                // This might involve clearing the current routes and rendering the new ones
                routes = optimizedRoutes; // Assuming the backend returns the new route structure
                saveToLocalStorage(ROUTES_KEY, routes);
                renderRoutes(); // Re-render the route table
                // Optionally, display the routes visually on a map
            })
            .catch(error => {
                console.error('Error fetching optimized routes:', error);
                showNotification('Error getting optimized route suggestions.', 'error');
            });
        });
    }

    // Initial rendering
    renderRoutes();

    // Helper functions to populate dropdowns (ensure data is available)
    function populateRouteVehicleOptionsInitial() {
        const selectElement = document.getElementById('route-assigned-vehicle');
        if (selectElement) {
            selectElement.innerHTML = '<option value="">-- Select Vehicle --</option>';
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.type} (${vehicle.licensePlate})`;
                selectElement.appendChild(option);
            });
        }
        const filterSelect = document.querySelector('#routes-table .filter-row select[data-column="assignedVehicle"]');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All</option>';
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.type} (${vehicle.licensePlate})`;
                filterSelect.appendChild(option);
            });
        }
    }

    function populateRouteCenterOptionsInitial() {
        const selectElement = document.getElementById('route-centers');
        if (selectElement) {
            selectElement.innerHTML = '';
            collectionCenters.forEach(center => {
                const option = document.createElement('option');
                option.value = center.id;
                option.textContent = center.name;
                selectElement.appendChild(option);
            });
        }
    }

    // Call these to populate dropdowns on initial load if data is already available
    populateRouteVehicleOptionsInitial();
    populateRouteCenterOptionsInitial();

    // --- End Route Management Section ---

    // --- Milk Collection Tracking Section ---
    const collectionRecordsTableBody = document.getElementById('collection-records-table-body');
    const addCollectionRecordModal = document.getElementById('add-collection-record-modal');
    const addCollectionRecordForm = document.getElementById('add-collection-record-form');
    const recordCenterSelect = document.getElementById('record-center');
    const recordDateInput = document.getElementById('record-date');
    const filterCollectionRecordsInputs = document.querySelectorAll('#collection-records-table .filter-row input[type="text"], #collection-records-table .filter-row input[type="number"], #collection-records-table .filter-row input[type="date"], #collection-records-table .filter-row select');
    const collectionRecordsTableHeader = document.querySelector('#collection-records-table thead tr');
    const collectionRecordsFilterRow = document.querySelector('#collection-records-table .filter-row');
    const addCollectionRecordButton = document.querySelector('#milk-tracking-section .controls .inline-add-button');
    const closeCollectionRecordModalButton = document.querySelector('#add-collection-record-modal .close-button');

    if (collectionRecordsFilterRow) collectionRecordsFilterRow.classList.add('hidden');
    if (addCollectionRecordModal) addCollectionRecordModal.style.display = 'none';

    function openAddCollectionRecordModal() {
        addCollectionRecordForm.reset();
        document.getElementById('record-id').value = '';
        populateRecordCenterOptions();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        recordDateInput.value = today;
        recordDateInput.max = today; // Prevent future dates
        addCollectionRecordModal.style.display = 'block';
    }

    function closeAddCollectionRecordModal() {
        addCollectionRecordModal.style.display = 'none';
    }

    function populateRecordCenterOptions(selectedCenter = '') {
        recordCenterSelect.innerHTML = '<option value="">-- Select Center --</option>';
        collectionCenters.forEach(center => {
            const option = document.createElement('option');
            option.value = center.id;
            option.textContent = center.name;
            option.selected = center.id === selectedCenter;
            recordCenterSelect.appendChild(option);
        });
        // Update filter select
        const filterSelect = document.querySelector('#collection-records-table .filter-row select[data-column="centerId"]');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All</option>';
            collectionCenters.forEach(center => {
                const option = document.createElement('option');
                option.value = center.id;
                option.textContent = center.name;
                filterSelect.appendChild(option);
            });
        }
    }

    function determineQuality(fat, snf) {
        if (fat >= 4.5 && snf >= 8.5) return 'Excellent';
        if (fat >= 3.5 && snf >= 8.0) return 'Good';
        if (fat >= 3.0 && snf >= 7.5) return 'Average';
        return 'Poor';
    }

    function renderCollectionRecords(recordsToRender = milkCollectionRecords) {
        collectionRecordsTableBody.innerHTML = '';
        if (recordsToRender.length > 0) {
            recordsToRender.forEach(record => {
                const row = collectionRecordsTableBody.insertRow();
                const center = collectionCenters.find(c => c.id === record.centerId);
                row.insertCell().textContent = center ? center.name : record.centerId;
                row.insertCell().textContent = formatDate(record.collectionDate);
                row.insertCell().textContent = record.volume;
                row.insertCell().textContent = record.fatContent !== null ? record.fatContent : '-';
                row.insertCell().textContent = record.snfValue !== null ? record.snfValue : '-';
                row.insertCell().textContent = record.temperature !== null ? record.temperature : '-';
                const quality = determineQuality(record.fatContent, record.snfValue);
                row.insertCell().textContent = quality;
                const actionsCell = row.insertCell();
                actionsCell.innerHTML = `
                    <button class="action-button edit-button small" onclick="editCollectionRecord('${record.id}')"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button small" onclick="deleteCollectionRecord('${record.id}')"><span class="material-symbols-outlined">delete</span></button>
                `;
            });
        } else {
            collectionRecordsTableBody.innerHTML = '<tr><td colspan="8">No collection records available.</td></tr>';
        }
        renderVolumeTrendChart(recordsToRender);
        renderQualityFatSnfChart(recordsToRender);
    }

    window.editCollectionRecord = (id) => {
        const record = milkCollectionRecords.find(r => r.id === id);
        if (record) {
            document.getElementById('record-id').value = record.id;
            populateRecordCenterOptions(record.centerId);
            document.getElementById('record-date').value = record.collectionDate;
            document.getElementById('record-date').max = new Date().toISOString().split('T')[0]; // Prevent future dates on edit
            document.getElementById('record-volume').value = record.volume;
            document.getElementById('record-fat').value = record.fatContent !== null ? record.fatContent : '';
            document.getElementById('record-snf').value = record.snfValue !== null ? record.snfValue : '';
            document.getElementById('record-temperature').value = record.temperature !== null ? record.temperature : '';
            addCollectionRecordModal.style.display = 'block';
        }
    };

    window.deleteCollectionRecord = (id) => {
        if (confirm('Are you sure you want to delete this collection record?')) {
            milkCollectionRecords = milkCollectionRecords.filter(r => r.id !== id);
            saveToLocalStorage(MILK_COLLECTION_RECORDS_KEY, milkCollectionRecords);
            renderCollectionRecords();
            showNotification('Collection record deleted successfully.', 'success');
        }
    };

    const addCollectionRecordFormSubmitHandler = (e) => {
        e.preventDefault();
        const id = document.getElementById('record-id').value || generateId('record');
        const centerId = document.getElementById('record-center').value;
        const collectionDate = document.getElementById('record-date').value;
        const volume = parseFloat(document.getElementById('record-volume').value);
        const fatContent = parseFloat(document.getElementById('record-fat').value) || null;
        const snfValue = parseFloat(document.getElementById('record-snf').value) || null;
        const temperature = parseFloat(document.getElementById('record-temperature').value) || null;

        if (centerId && collectionDate && !isNaN(volume)) {
            const today = new Date().toISOString().split('T')[0];
            if (collectionDate > today) {
                showNotification('Collection date cannot be in the future.', 'error');
                return;
            }

            const recordIndex = milkCollectionRecords.findIndex(r => r.id === id);
            const newRecord = { id, centerId, collectionDate, volume, fatContent, snfValue, temperature };
            if (recordIndex > -1) {
                milkCollectionRecords[recordIndex] = newRecord;
                showNotification('Collection record updated successfully.', 'success');
            } else {
                milkCollectionRecords.push(newRecord);
                showNotification('Collection record added successfully.', 'success');
            }
            saveToLocalStorage(MILK_COLLECTION_RECORDS_KEY, milkCollectionRecords);
            renderCollectionRecords();
            closeAddCollectionRecordModal();
        } else {
            showNotification('Please fill in all required fields.', 'error');
        }
    };

    if (addCollectionRecordForm) {
        addCollectionRecordForm.addEventListener('submit', addCollectionRecordFormSubmitHandler);
    }

    function filterCollectionRecords() {
        const filters = {};
        filterCollectionRecordsInputs.forEach(input => {
            if (input.value) {
                filters[input.dataset.column] = input.value.toLowerCase();
            }
        });

        let filteredRecords = [...milkCollectionRecords];
        for (const column in filters) {
            const filterValue = filters[column];
            filteredRecords = filteredRecords.filter(record => {
                if (column === 'centerId') {
                    const center = collectionCenters.find(c => c.id === record.centerId);
                    return center ? center.name.toLowerCase().includes(filterValue) : record.centerId.toLowerCase().includes(filterValue);
                } else if (column === 'collectionDate') {
                    return record.collectionDate.includes(filterValue);
                } else if (column === 'volume' || column === 'fatContent' || column === 'snfValue' || column === 'temperature') {
                    const numValue = parseFloat(record[column]);
                    const filterNum = parseFloat(filterValue);
                    return isNaN(filterNum) || (!isNaN(numValue) && String(numValue).includes(filterValue));
                } else if (column === 'qualityFlags') {
                    return determineQuality(record.fatContent, record.snfValue).toLowerCase().includes(filterValue);
                } else {
                    return String(record[column]).toLowerCase().includes(filterValue);
                }
            });
        }
        renderCollectionRecords(filteredRecords);
    }

    filterCollectionRecordsInputs.forEach(input => {
        input.addEventListener('input', filterCollectionRecords);
    });

    function sortCollectionRecords(column) {
        // Implement sorting logic here
    }

    if (collectionRecordsTableHeader) {
        collectionRecordsTableHeader.querySelectorAll('.filterable').forEach(th => {
            th.addEventListener('click', () => sortCollectionRecords(th.dataset.column));
        });
    }

    const toggleCollectionRecordsFilterButton = document.querySelector('#milk-tracking-section .controls h4');
    if (toggleCollectionRecordsFilterButton && collectionRecordsFilterRow) {
        toggleCollectionRecordsFilterButton.addEventListener('click', () => {
            collectionRecordsFilterRow.classList.toggle('hidden');
        });
    }

    // --- Chart Rendering ---
    const volumeTrendChartCanvas = document.getElementById('volume-trend-chart');
    let volumeTrendChart;

    function renderVolumeTrendChart(data) {
        const dailyVolumes = {};
        data.forEach(record => {
            dailyVolumes[record.collectionDate] = (dailyVolumes[record.collectionDate] || 0) + record.volume;
        });

        const sortedDates = Object.keys(dailyVolumes).sort((a, b) => new Date(a) - new Date(b));
        const labels = sortedDates.map(formatDate); // Format dates for display
        const chartData = sortedDates.map(date => dailyVolumes[date]);

        if (volumeTrendChart) {
            volumeTrendChart.destroy();
        }

        if (volumeTrendChartCanvas) {
            volumeTrendChart = new Chart(volumeTrendChartCanvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Total Volume Collected (Liters)',
                        data: chartData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Volume (Liters)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date (DD-MM-YYYY)'
                            }
                        }
                    }
                }
            });
        }
    }

    const qualityChartCanvas = document.getElementById('quality-chart');
    let qualityChart;

    function renderQualityFatSnfChart(data) {
        const dates = [...new Set(data.map(item => item.collectionDate))].sort((a, b) => new Date(a) - new Date(b));
        const labels = dates.map(formatDate); // Format dates for display

        const fatData = dates.map(date => {
            const recordsOnDate = data.filter(item => item.collectionDate === date && item.fatContent !== null);
            if (recordsOnDate.length > 0) {
                const sum = recordsOnDate.reduce((acc, curr) => acc + curr.fatContent, 0);
                return sum / recordsOnDate.length;
            }
            return null;
        });

        const snfData = dates.map(date => {
            const recordsOnDate = data.filter(item => item.collectionDate === date && item.snfValue !== null);
            if (recordsOnDate.length > 0) {
                const sum = recordsOnDate.reduce((acc, curr) => acc + curr.snfValue, 0);
                return sum / recordsOnDate.length;
            }
            return null;
        });

        if (qualityChart) {
            qualityChart.destroy();
        }

        if (qualityChartCanvas) {
            qualityChart = new Chart(qualityChartCanvas, {
                type: 'line', // Using line chart to show trend
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Average Fat Content (%)',
                            data: fatData,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            fill: false,
                            tension: 0.1
                        },
                        {
                            label: 'Average SNF Value (%)',
                            data: snfData,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            fill: false,
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Percentage (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date (DD-MM-YYYY)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom', // Legend below the chart
                        },
                        title: {
                            display: true,
                            text: 'Average Fat and SNF Values Over Time'
                        }
                    }
                }
            });
        }
    }

    // Event listeners for opening and closing the Add Collection Record modal
    if (addCollectionRecordButton) {
        addCollectionRecordButton.addEventListener('click', openAddCollectionRecordModal);
    }
    if (closeCollectionRecordModalButton) {
        closeCollectionRecordModalButton.addEventListener('click', closeAddCollectionRecordModal);
    }
    if (addCollectionRecordModal) {
        addCollectionRecordModal.addEventListener('click', (event) => {
            if (event.target === addCollectionRecordModal) {
                closeAddCollectionRecordModal();
            }
        });
    }

    // Initial rendering
    renderCollectionRecords();

    // Helper function to populate the center dropdown on initial load
    function populateRecordCenterOptionsInitial() {
        const selectElement = document.getElementById('record-center');
        if (selectElement) {
            selectElement.innerHTML = '<option value="">-- Select Center --</option>';
            collectionCenters.forEach(center => {
                const option = document.createElement('option');
                option.value = center.id;
                option.textContent = center.name;
                selectElement.appendChild(option);
            });
        }
        const filterSelect = document.querySelector('#collection-records-table .filter-row select[data-column="centerId"]');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All</option>';
            collectionCenters.forEach(center => {
                const option = document.createElement('option');
                option.value = center.id;
                option.textContent = center.name;
                filterSelect.appendChild(option);
            });
        }
    }

    populateRecordCenterOptionsInitial();

    // --- End Milk Collection Tracking Section ---

 // --- Vehicle Management Section ---
 const vehiclesTableBody = document.getElementById('vehicles-table-body');
 const addEditVehicleModal = document.getElementById('add-edit-vehicle-modal');
 const addEditVehicleForm = document.getElementById('add-edit-vehicle-form');
 const vehicleModalTitle = document.getElementById('vehicle-modal-title');
 const vehicleAssignedRouteSelect = document.getElementById('vehicle-assigned-route');
 const filterVehiclesInputs = document.querySelectorAll('#vehicles-table .filter-row input[type="text"], #vehicles-table .filter-row input[type="number"], #vehicles-table .filter-row select');
 const vehiclesTableHeader = document.querySelector('#vehicles-table thead tr');
 const vehiclesFilterRow = document.querySelector('#vehicles-table .filter-row');
 const totalVehiclesSpan = document.getElementById('total-vehicles');
 const assignedVehiclesSpan = document.getElementById('assigned-vehicles');
 const unassignedVehiclesSpan = document.getElementById('unassigned-vehicles');
 const viewIdleTimeButton = document.querySelector('#vehicle-management-section .utilization-stats .action-button');

 if (vehiclesFilterRow) vehiclesFilterRow.classList.add('hidden');
 if (addEditVehicleModal) addEditVehicleModal.style.display = 'none';

 function openAddVehicleModal() {
     vehicleModalTitle.textContent = 'Add New Vehicle';
     addEditVehicleForm.reset();
     document.getElementById('vehicle-id').value = '';
     populateVehicleRouteOptions();
     addEditVehicleModal.style.display = 'block';
 }

 function closeAddVehicleModal() {
     addEditVehicleModal.style.display = 'none';
 }

 function populateVehicleRouteOptions(selectedRoute = '') {
     vehicleAssignedRouteSelect.innerHTML = '<option value="">-- Select Route--</option>';
     routes.forEach(route => {
         const option = document.createElement('option');
         option.value = route.id;
         option.textContent = route.name;
         option.selected = route.id === selectedRoute;
         vehicleAssignedRouteSelect.appendChild(option);
     });
     // Update filter select
     const filterSelect = document.querySelector('#vehicles-table .filter-row select[data-column="assignedRoute"]');
     if (filterSelect) {
         filterSelect.innerHTML = '<option value="">All</option>';
         routes.forEach(route => {
             const option = document.createElement('option');
             option.value = route.id;
             option.textContent = route.name;
             filterSelect.appendChild(option);
         });
     }
 }

 function renderVehicles(vehiclesToRender = vehicles) {
     vehiclesTableBody.innerHTML = '';
     if (vehiclesToRender.length > 0) {
         vehiclesToRender.forEach(vehicle => {
             const row = vehiclesTableBody.insertRow();
             row.insertCell().textContent = vehicle.type;
             row.insertCell().textContent = vehicle.capacity;
             row.insertCell().textContent = vehicle.licensePlate;
             const route = routes.find(r => r.id === vehicle.assignedRoute);
             row.insertCell().textContent = route ? route.name : '-';
             const actionsCell = row.insertCell();
             actionsCell.innerHTML = `
                 <button class="action-button edit-button small" onclick="editVehicle('${vehicle.id}')"><span class="material-symbols-outlined">edit</span></button>
                 <button class="action-button delete-button small" onclick="deleteVehicle('${vehicle.id}')"><span class="material-symbols-outlined">delete</span></button>
             `;
         });
     } else {
         vehiclesTableBody.innerHTML = '<tr><td colspan="5">No vehicles available.</td></tr>';
     }
     updateVehicleStats();
 }

 function updateVehicleStats() {
     totalVehiclesSpan.textContent = vehicles.length;
     const assigned = vehicles.filter(v => v.assignedRoute).length;
     assignedVehiclesSpan.textContent = assigned;
     unassignedVehiclesSpan.textContent = vehicles.length - assigned;
 }

 window.editVehicle = (id) => {
     const vehicle = vehicles.find(v => v.id === id);
     if (vehicle) {
         vehicleModalTitle.textContent = 'Edit Vehicle';
         document.getElementById('vehicle-id').value = vehicle.id;
         document.getElementById('vehicle-type').value = vehicle.type;
         document.getElementById('vehicle-capacity').value = vehicle.capacity;
         document.getElementById('vehicle-license-plate').value = vehicle.licensePlate;
         document.getElementById('vehicle-assigned-route').value = vehicle.assignedRoute || '';
         populateVehicleRouteOptions(vehicle.assignedRoute);
         addEditVehicleModal.style.display = 'block';
     }
 };

 window.deleteVehicle = (id) => {
     if (confirm('Are you sure you want to delete this vehicle?')) {
         vehicles = vehicles.filter(v => v.id !== id);
         saveToLocalStorage(VEHICLES_KEY, vehicles);
         renderVehicles();
         showNotification('Vehicle deleted successfully.', 'success');
     }
 };

 if (addEditVehicleForm) {
     addEditVehicleForm.addEventListener('submit', (e) => {
         e.preventDefault();
         const id = document.getElementById('vehicle-id').value || generateId('vehicle');
         const type = document.getElementById('vehicle-type').value;
         const capacity = parseFloat(document.getElementById('vehicle-capacity').value);
         const licensePlate = document.getElementById('vehicle-license-plate').value;
         const assignedRoute = document.getElementById('vehicle-assigned-route').value || null;

         if (type && !isNaN(capacity) && licensePlate) {
             const vehicleIndex = vehicles.findIndex(v => v.id === id);
             const newVehicle = { id, type, capacity, licensePlate, assignedRoute };
             if (vehicleIndex > -1) {
                 vehicles[vehicleIndex] = newVehicle;
                 showNotification('Vehicle updated successfully.', 'success');
             } else {
                 vehicles.push(newVehicle);
                 showNotification('Vehicle added successfully.', 'success');
             }
             saveToLocalStorage(VEHICLES_KEY, vehicles);
             renderVehicles();
             closeAddVehicleModal();
         } else {
             showNotification('Please fill in all required fields.', 'error');
         }
     });
 }

 function filterVehicles() {
     const filters = {};
     filterVehiclesInputs.forEach(input => {
         if (input.value) {
             filters[input.dataset.column] = input.value.toLowerCase();
         }
     });

     let filteredVehicles = [...vehicles];
     for (const column in filters) {
         const filterValue = filters[column];
         filteredVehicles = filteredVehicles.filter(vehicle => {
             if (column === 'assignedRoute') {
                 const route = routes.find(r => r.id === vehicle.assignedRoute);
                 return route ? route.name.toLowerCase().includes(filterValue) : ''.includes(filterValue);
             } else {
                 return String(vehicle[column]).toLowerCase().includes(filterValue);
             }
         });
     }
     renderVehicles(filteredVehicles);
 }

 filterVehiclesInputs.forEach(input => {
     input.addEventListener('input', filterVehicles);
 });

 function sortVehicles(column) {
     // Implement sorting logic here
 }

 if (vehiclesTableHeader) {
     vehiclesTableHeader.querySelectorAll('.filterable').forEach(th => {
         th.addEventListener('click', () => sortVehicles(th.dataset.column));
     });
 }

 const toggleVehiclesFilterButton = document.querySelector('#vehicle-management-section .controls h4');
 if (toggleVehiclesFilterButton && vehiclesFilterRow) {
     toggleVehiclesFilterButton.addEventListener('click', () => {
         vehiclesFilterRow.classList.toggle('hidden');
     });
 }

 // --- Idle Time Report Functionality ---
 if (viewIdleTimeButton) {
     viewIdleTimeButton.addEventListener('click', () => {
         const idleTimeReports = calculateIdleTimeReports();
         displayIdleTimeReports(idleTimeReports);
     });
 }

 function calculateIdleTimeReports() {
     const reports = [];
     vehicles.forEach(vehicle => {
         const lastCollection = milkCollectionRecords
             .filter(record => {
                 const route = routes.find(r => r.id === record.routeId); // Assuming records have routeId
                 return route && route.assignedVehicle === vehicle.id;
             })
             .sort((a, b) => new Date(b.collectionDate) - new Date(a.collectionDate))[0];

         let idleDays = 'N/A';
         if (lastCollection) {
             const lastCollectionDate = new Date(lastCollection.collectionDate);
             const today = new Date();
             const timeDifference = today.getTime() - lastCollectionDate.getTime();
             idleDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
         } else if (!vehicle.assignedRoute) {
             idleDays = 'Unassigned';
         } else {
             idleDays = 'No Collections Yet';
         }

         reports.push({
             vehicle: `${vehicle.type} (${vehicle.licensePlate})`,
             idleDays: idleDays
         });
     });
     return reports;
 }

 function displayIdleTimeReports(reports) {
     const reportContainer = document.createElement('div');
     reportContainer.className = 'modal content-display';
     reportContainer.id = 'idle-time-report-modal';
     reportContainer.innerHTML = `
         <div class="modal-content">
             <span class="close-button" onclick="closeIdleTimeReportModal()">&times;</span>
             <h4>Vehicle Idle Time Report</h4>
             ${reports.length > 0 ? `
                 <table>
                     <thead>
                         <tr>
                             <th>Vehicle</th>
                             <th>Idle Time</th>
                         </tr>
                     </thead>
                     <tbody>
                         ${reports.map(report => `
                             <tr>
                                 <td>${report.vehicle}</td>
                                 <td>${report.idleDays}</td>
                             </tr>
                         `).join('')}
                     </tbody>
                 </table>
             ` : '<p>No vehicle data available.</p>'}
         </div>
     `;
     document.body.appendChild(reportContainer);
     document.getElementById('idle-time-report-modal').style.display = 'block';
 }

 window.closeIdleTimeReportModal = () => {
     const modal = document.getElementById('idle-time-report-modal');
     if (modal) {
         modal.remove();
     }
 };

 renderVehicles();

 function populateVehicleRouteOptionsInitial() {
     const selectElement = document.getElementById('vehicle-assigned-route');
     if (selectElement) {
         selectElement.innerHTML = '<option value="">-- Select Route--</option>';
         routes.forEach(route => {
             const option = document.createElement('option');
             option.value = route.id;
             option.textContent = route.name;
             selectElement.appendChild(option);
         });
     }
     const filterSelect = document.querySelector('#vehicles-table .filter-row select[data-column="assignedRoute"]');
     if (filterSelect) {
         filterSelect.innerHTML = '<option value="">All</option>';
         routes.forEach(route => {
             const option = document.createElement('option');
             option.value = route.id;
             option.textContent = route.name;
             filterSelect.appendChild(option);
         });
     }
 }

 // Event listeners for opening and closing the Add/Edit Vehicle modal
 const addVehicleButton = document.querySelector('#vehicle-management-section .controls .inline-add-button');
 const closeVehicleModalButton = document.querySelector('#add-edit-vehicle-modal .close-button');

 if (addVehicleButton) {
     addVehicleButton.addEventListener('click', openAddVehicleModal);
 }
 if (closeVehicleModalButton) {
     closeVehicleModalButton.addEventListener('click', closeAddVehicleModal);
 }
 if (addEditVehicleModal) {
     addEditVehicleModal.addEventListener('click', (event) => {
         if (event.target === addEditVehicleModal) {
             closeAddVehicleModal();
         }
     });
 }

 populateVehicleRouteOptionsInitial();

 // --- End Vehicle Management Section ---

    // --- Driver Management Section ---
    const driversTableBody = document.getElementById('drivers-table-body');
    const addEditDriverModal = document.getElementById('add-edit-driver-modal');
    const addEditDriverForm = document.getElementById('add-edit-driver-form');
    const driverModalTitle = document.getElementById('driver-modal-title');
    const driverAssignedVehicleSelect = document.getElementById('driver-assigned-vehicle');
    const filterDriversInputs = document.querySelectorAll('#drivers-table .filter-row input[type="text"], #drivers-table .filter-row select');
    const driversTableHeader = document.querySelector('#drivers-table thead tr');
    const driversFilterRow = document.querySelector('#drivers-table .filter-row');

    if (driversFilterRow) driversFilterRow.classList.add('hidden');
    if (addEditDriverModal) addEditDriverModal.style.display = 'none';

    function openAddDriverModal() {
        driverModalTitle.textContent = 'Add New Driver';
        addEditDriverForm.reset();
        document.getElementById('driver-id').value = '';
        populateDriverVehicleOptions();
        addEditDriverModal.style.display = 'block';
    }

    function closeAddDriverModal() {
        addEditDriverModal.style.display = 'none';
    }

    function populateDriverVehicleOptions(selectedVehicle = '') {
        driverAssignedVehicleSelect.innerHTML = '<option value="">-- Select Vehicle --</option>';
        vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.type} (${vehicle.licensePlate})`;
            option.selected = vehicle.id === selectedVehicle;
            driverAssignedVehicleSelect.appendChild(option);
        });
        // Update filter select
        const filterSelect = document.querySelector('#drivers-table .filter-row select[data-column="assignedVehicle"]');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All</option>';
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.type} (${vehicle.licensePlate})`;
                filterSelect.appendChild(option);
            });
        }
    }

    function renderDrivers(driversToRender = drivers) {
        driversTableBody.innerHTML = '';
        if (driversToRender.length > 0) {
            driversToRender.forEach(driver => {
                const row = driversTableBody.insertRow();
                row.insertCell().textContent = driver.name;
                row.insertCell().textContent = driver.licenseId;
                row.insertCell().textContent = driver.contactNumber;
                const vehicle = vehicles.find(v => v.id === driver.assignedVehicle);
                row.insertCell().textContent = vehicle ? `${vehicle.type} (${vehicle.licensePlate})` : '-';
                const actionsCell = row.insertCell();
                actionsCell.innerHTML = `
                    <button class="action-button edit-button small" onclick="editDriver('${driver.id}')"><span class="material-symbols-outlined">edit</span></button>
                    <button class="action-button delete-button small" onclick="deleteDriver('${driver.id}')"><span class="material-symbols-outlined">delete</span></button>
                `;
            });
        } else {
            driversTableBody.innerHTML = '<tr><td colspan="5">No drivers available.</td></tr>';
        }
    }

    window.editDriver = (id) => {
        const driver = drivers.find(d => d.id === id);
        if (driver) {
            driverModalTitle.textContent = 'Edit Driver';
            document.getElementById('driver-id').value = driver.id;
            document.getElementById('driver-name').value = driver.name;
            document.getElementById('driver-license-id').value = driver.licenseId;
            document.getElementById('driver-contact-number').value = driver.contactNumber;
            document.getElementById('driver-assigned-vehicle').value = driver.assignedVehicle || '';
            populateDriverVehicleOptions(driver.assignedVehicle);
            addEditDriverModal.style.display = 'block';
        }
    };

    window.deleteDriver = (id) => {
        if (confirm('Are you sure you want to delete this driver?')) {
            drivers = drivers.filter(d => d.id !== id);
            saveToLocalStorage(DRIVERS_KEY, drivers);
            renderDrivers();
            showNotification('Driver deleted successfully.', 'success');
        }
    };

    if (addEditDriverForm) {
        addEditDriverForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('driver-id').value || generateId('driver');
            const name = document.getElementById('driver-name').value;
            const licenseId = document.getElementById('driver-license-id').value;
            const contactNumber = document.getElementById('driver-contact-number').value;
            const assignedVehicle = document.getElementById('driver-assigned-vehicle').value || null;

            if (name && licenseId && contactNumber) {
                const driverIndex = drivers.findIndex(d => d.id === id);
                const newDriver = { id, name, licenseId, contactNumber, assignedVehicle };
                if (driverIndex > -1) {
                    drivers[driverIndex] = newDriver;
                    showNotification('Driver updated successfully.', 'success');
                } else {
                    drivers.push(newDriver);
                    showNotification('Driver added successfully.', 'success');
                }
                saveToLocalStorage(DRIVERS_KEY, drivers);
                renderDrivers();
                closeAddDriverModal();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    }

    function filterDrivers() {
        const filters = {};
        filterDriversInputs.forEach(input => {
            if (input.value) {
                filters[input.dataset.column] = input.value.toLowerCase();
            }
        });

        let filteredDrivers = [...drivers];
        for (const column in filters) {
            const filterValue = filters[column];
            filteredDrivers = filteredDrivers.filter(driver => {
                if (column === 'assignedVehicle') {
                    const vehicle = vehicles.find(v => v.id === driver.assignedVehicle);
                    return vehicle ? `${vehicle.type} (${vehicle.licensePlate})`.toLowerCase().includes(filterValue) : ''.includes(filterValue);
                } else {
                    return String(driver[column]).toLowerCase().includes(filterValue);
                }
            });
        }
        renderDrivers(filteredDrivers);
    }

    filterDriversInputs.forEach(input => {
        input.addEventListener('input', filterDrivers);
    });

    function sortDrivers(column) {
        // Implement sorting logic here
    }

    if (driversTableHeader) {
        driversTableHeader.querySelectorAll('.filterable').forEach(th => {
            th.addEventListener('click', () => sortDrivers(th.dataset.column));
        });
    }

    const toggleDriversFilterButton = document.querySelector('#driver-management-section .controls h4');
    if (toggleDriversFilterButton && driversFilterRow) {
        toggleDriversFilterButton.addEventListener('click', () => {
            driversFilterRow.classList.toggle('hidden');
        });
    }

    function populateDriverVehicleOptionsInitial() {
        const selectElement = document.getElementById('driver-assigned-vehicle');
        if (selectElement) {
            selectElement.innerHTML = '<option value="">-- Select Vehicle --</option>';
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.type} (${vehicle.licensePlate})`;
                selectElement.appendChild(option);
            });
        }
        const filterSelect = document.querySelector('#drivers-table .filter-row select[data-column="assignedVehicle"]');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All</option>';
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.type} (${vehicle.licensePlate})`;
                filterSelect.appendChild(option);
            });
        }
    }

    // Event listeners for opening and closing the Add/Edit Driver modal
    const addDriverButton = document.querySelector('#driver-management-section .controls .inline-add-button');
    const closeDriverModalButton = document.querySelector('#add-edit-driver-modal .close-button');

    if (addDriverButton) {
        addDriverButton.addEventListener('click', openAddDriverModal);
    }
    if (closeDriverModalButton) {
        closeDriverModalButton.addEventListener('click', closeAddDriverModal);
    }
    if (addEditDriverModal) {
        addEditDriverModal.addEventListener('click', (event) => {
            if (event.target === addEditDriverModal) {
                closeAddDriverModal();
            }
        });
    }

    renderDrivers();
    populateDriverVehicleOptionsInitial();

    // --- End Driver Management Section ---

   // --- Logistics & Tracking Section ---
   const tripsTableBody = document.getElementById('trips-table-body');
   const mapContainer = document.getElementById('map-container');

   // Placeholder for map instance (if using a library like Leaflet or Google Maps)
   let map;
   let vehicleMarkers = {}; // To store markers for each vehicle

   function initializeMap() {
       // This is a placeholder for map initialization.
       // You would replace this with your actual map library setup.
       if (mapContainer) {
           mapContainer.innerHTML = '<p>Map integration will be here.</p>';
           // Example using Leaflet (you'd need to include the Leaflet CSS and JS in your HTML)
           
           map = L.map('map-container').setView([12.9716, 77.5946], 10); // Bengaluru coordinates, zoom level 10
           L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
               attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
           }).addTo(map);
       }
   }

   function updateVehicleLocations() {
       // This is a placeholder for fetching and updating vehicle locations.
       // In a real application, you would have an API endpoint that provides
       // the real-time locations of your vehicles.

       // For now, let's simulate some vehicle locations based on assigned routes
       vehicles.forEach(vehicle => {
           if (vehicle.assignedRoute) {
               const route = routes.find(r => r.id === vehicle.assignedRoute);
               if (route && route.path && route.path.length > 0) {
                   // Simulate movement along the route path
                   const randomIndex = Math.floor(Math.random() * route.path.length);
                   const location = route.path[randomIndex]; // Assuming path is an array of [latitude, longitude]

                   if (map && location) {
                       if (vehicleMarkers[vehicle.id]) {
                           // Update existing marker
                           vehicleMarkers[vehicle.id].setLatLng(location);
                           console.log(`Updating location for ${vehicle.type} (${vehicle.licensePlate}) to ${location}`);
                       } else {
                           // Create a new marker
                           vehicleMarkers[vehicle.id] = L.marker(location).addTo(map).bindPopup(`${vehicle.type} (${vehicle.licensePlate})`);
                           console.log(`Creating marker for ${vehicle.type} (${vehicle.licensePlate}) at ${location}`);
                       }
                   }
               } else if (map && vehicleMarkers[vehicle.id]) {
                   // If no route or path, remove marker
                   map.removeLayer(vehicleMarkers[vehicle.id]);
                   delete vehicleMarkers[vehicle.id];
                   console.log(`Removing marker for ${vehicle.type} (${vehicle.licensePlate}) - No route/path`);
               }
           } else if (map && vehicleMarkers[vehicle.id]) {
               // Remove marker for unassigned vehicles
               map.removeLayer(vehicleMarkers[vehicle.id]);
               delete vehicleMarkers[vehicle.id];
               console.log(`Removing marker for ${vehicle.type} (${vehicle.licensePlate}) - Unassigned`);
           }
       });
   }

   function renderTrips() {
       tripsTableBody.innerHTML = '';
       logisticsData.forEach(log => {
           const row = tripsTableBody.insertRow();
           row.insertCell().textContent = log.id || '-';
           const vehicle = vehicles.find(v => v.id === log.vehicleId);
           row.insertCell().textContent = vehicle ? `${vehicle.type} (${vehicle.licensePlate})` : log.vehicleId || '-';
           const driver = drivers.find(d => d.id === log.driverId);
           row.insertCell().textContent = driver ? driver.name : log.driverId || '-';
           row.insertCell().textContent = log.startTime || '-';
           row.insertCell().textContent = log.endTime || '-';
           row.insertCell().textContent = log.status || '-';

           // Link trip details to map (example: clicking row highlights vehicle)
           row.addEventListener('click', () => {
               if (log.vehicleId && vehicleMarkers[log.vehicleId] && map) {
                   // map.setView(vehicleMarkers[log.vehicleId].getLatLng(), 15); // Center map on vehicle
                   // vehicleMarkers[log.vehicleId].openPopup(); // Open the vehicle's popup
                   console.log(`Clicked on trip ${log.id} for vehicle ${log.vehicleId}`);
               }
           });
       });
   }

   // Simulate fetching logistics data (replace with your actual data source)
   function fetchLogisticsData() {
       // For now, let's create some dummy logistics data
       logisticsData = [
           { id: 'TRIP001', vehicleId: vehicles[0]?.id, driverId: drivers[0]?.id, startTime: '08:00', endTime: '12:00', status: 'Completed' },
           { id: 'TRIP002', vehicleId: vehicles[1]?.id, driverId: drivers[1]?.id, startTime: '09:30', endTime: null, status: 'In Transit' },
           { id: 'TRIP003', vehicleId: vehicles[0]?.id, driverId: drivers[1]?.id, startTime: '14:00', endTime: null, status: 'Scheduled' },
       ];
       saveToLocalStorage(LOGISTICS_DATA_KEY, logisticsData);
       renderTrips();
       updateVehicleLocations(); // Initial update
   }

   // Simulate fetching route data with paths (replace with your actual data)
   function fetchRouteData() {
       routes = [
           { id: 'ROUTE001', name: 'City Route A', assignedVehicle: vehicles[0]?.id, path: [[12.95, 77.60], [12.96, 77.61], [12.97, 77.62]] },
           { id: 'ROUTE002', name: 'Suburb Route B', assignedVehicle: vehicles[1]?.id, path: [[13.00, 77.55], [13.01, 77.56]] },
       ];
       saveToLocalStorage(ROUTES_KEY, routes);
       populateVehicleRouteOptionsInitial(); // Update vehicle assignment options if routes change
       populateDriverVehicleOptionsInitial(); // Update driver assignment options if vehicles change
       updateVehicleLocations(); // Update locations based on new route data
   }

   // Initial calls
   initializeMap();
   fetchRouteData(); // Load route data (including paths for simulation)
   fetchLogisticsData(); // Load initial logistics/trip data

   // Simulate real-time updates (replace with WebSocket or API polling)
   setInterval(updateVehicleLocations, 5000); // Update vehicle locations every 5 seconds

   // --- Re-initialize dropdowns based on current data ---
   function populateVehicleRouteOptionsInitial() {
       const selects = document.querySelectorAll('#add-edit-vehicle-modal #vehicle-assigned-route, #vehicles-table .filter-row select[data-column="assignedRoute"]');
       selects.forEach(selectElement => {
           const selectedValue = selectElement.value;
           selectElement.innerHTML = '<option value="">-- Select Route--</option><option value="">All</option>';
           routes.forEach(route => {
               const option = document.createElement('option');
               option.value = route.id;
               option.textContent = route.name;
               option.selected = route.id === selectedValue;
               selectElement.appendChild(option);
           });
       });
   }

   function populateDriverVehicleOptionsInitial() {
       const selectElement = document.getElementById('driver-assigned-vehicle');
       if (selectElement) {
           const selectedValue = selectElement.value;
           selectElement.innerHTML = '<option value="">-- Select Vehicle --</option><option value="">All</option>';
           vehicles.forEach(vehicle => {
               const option = document.createElement('option');
               option.value = vehicle.id;
               option.textContent = `${vehicle.type} (${vehicle.licensePlate})`;
               option.selected = vehicle.id === selectedValue;
               selectElement.appendChild(option);
           });
       }
       const filterSelect = document.querySelector('#drivers-table .filter-row select[data-column="assignedVehicle"]');
       if (filterSelect) {
           const selectedFilterValue = filterSelect.value;
           filterSelect.innerHTML = '<option value="">All</option>';
           vehicles.forEach(vehicle => {
               const option = document.createElement('option');
               option.value = vehicle.id;
               option.textContent = `${vehicle.type} (${vehicle.licensePlate})`;
               option.selected = vehicle.id === selectedFilterValue;
               filterSelect.appendChild(option);
           });
       }
   }

   // Call these to ensure dropdowns are up-to-date on load if data exists
   populateVehicleRouteOptionsInitial();
   populateDriverVehicleOptionsInitial();

   // --- End Logistics & Tracking Section ---

   // --- Quality Control Section ---
   const qualityChecksTableBody = document.getElementById('quality-checks-table-body');
   const addQualityCheckModal = document.getElementById('add-quality-check-modal');
   const addQualityCheckForm = document.getElementById('add-quality-check-form');
   const qcCenterSelect = document.getElementById('qc-center');
   const qcCollectionDateInput = document.getElementById('qc-collection-date');
   const filterQualityChecksInputs = document.querySelectorAll('#quality-checks-table .filter-row input[type="text"], #quality-checks-table .filter-row input[type="number"], #quality-checks-table .filter-row input[type="date"], #quality-checks-table .filter-row select');
   const qualityChecksTableHeader = document.querySelector('#quality-checks-table thead tr');
   const qualityChecksFilterRow = document.querySelector('#quality-checks-table .filter-row');

   if (qualityChecksFilterRow) qualityChecksFilterRow.classList.add('hidden');
   if (addQualityCheckModal) addQualityCheckModal.style.display = 'none';

   function openAddQualityCheckModal() {
       addQualityCheckForm.reset();
       document.getElementById('quality-check-id').value = '';
       populateQCCenterOptions();
       qcCollectionDateInput.max = new Date().toISOString().split('T')[0];
       addQualityCheckModal.style.display = 'block';
   }

   function closeAddQualityCheckModal() {
       addQualityCheckModal.style.display = 'none';
   }

   function populateQCCenterOptions(selectedCenter = '') {
       qcCenterSelect.innerHTML = '<option value="">-- Select Center --</option>';
       collectionCenters.forEach(center => {
           const option = document.createElement('option');
           option.value = center.id;
           option.textContent = center.name;
           option.selected = center.id === selectedCenter;
           qcCenterSelect.appendChild(option);
       });
       const filterSelect = document.querySelector('#quality-checks-table .filter-row select[data-column="centerId"]');
       if (filterSelect) {
           filterSelect.innerHTML = '<option value="">All</option>';
           collectionCenters.forEach(center => {
               const option = document.createElement('option');
               option.value = center.id;
               option.textContent = center.name;
               filterSelect.appendChild(option);
           });
       }
   }

   function renderQualityChecks(checksToRender = qualityChecks) {
       qualityChecksTableBody.innerHTML = '';
       if (checksToRender.length > 0) {
           checksToRender.forEach(check => {
               const row = qualityChecksTableBody.insertRow();
               const center = collectionCenters.find(c => c.id === check.centerId);
               row.insertCell().textContent = center ? center.name : check.centerId;
               row.insertCell().textContent = check.sampleId;
               row.insertCell().textContent = formatDate(check.collectionDate); // Use formatDate here
               row.insertCell().textContent = check.fatContent !== null ? check.fatContent : '-';
               row.insertCell().textContent = check.snfValue !== null ? check.snfValue : '-';
               row.insertCell().textContent = check.testStatus;
               row.insertCell().textContent = check.labReportId || '-';
               const actionsCell = row.insertCell();
               actionsCell.innerHTML = `
                   <button class="action-button edit-button small" onclick="editQualityCheck('${check.id}')"><span class="material-symbols-outlined">edit</span></button>
                   <button class="action-button delete-button small" onclick="deleteQualityCheck('${check.id}')"><span class="material-symbols-outlined">delete</span></button>
               `;
           });
       } else {
           qualityChecksTableBody.innerHTML = '<tr><td colspan="8">No quality checks available.</td></tr>';
       }
   }

   window.editQualityCheck = (id) => {
       const check = qualityChecks.find(qc => qc.id === id);
       if (check) {
           document.getElementById('quality-check-id').value = check.id;
           populateQCCenterOptions(check.centerId);
           document.getElementById('qc-sample-id').value = check.sampleId;
           document.getElementById('qc-collection-date').value = check.collectionDate;
           document.getElementById('qc-collection-date').max = new Date().toISOString().split('T')[0];
           document.getElementById('qc-fat').value = check.fatContent !== null ? check.fatContent : '';
           document.getElementById('qc-snf').value = check.snfValue !== null ? check.snfValue : '';
           document.getElementById('qc-test-status').value = check.testStatus;
           document.getElementById('qc-lab-report-id').value = check.labReportId || '';
           addQualityCheckModal.style.display = 'block';
       }
   };

   window.deleteQualityCheck = (id) => {
       if (confirm('Are you sure you want to delete this quality check?')) {
           qualityChecks = qualityChecks.filter(qc => qc.id !== id);
           saveToLocalStorage(QUALITY_CHECKS_KEY, qualityChecks);
           renderQualityChecks();
           showNotification('Quality check deleted successfully.', 'success');
       }
   };

   if (addQualityCheckForm) {
       addQualityCheckForm.addEventListener('submit', (e) => {
           e.preventDefault();
           const id = document.getElementById('quality-check-id').value || generateId('qc');
           const centerId = document.getElementById('qc-center').value;
           const sampleId = document.getElementById('qc-sample-id').value;
           const collectionDate = document.getElementById('qc-collection-date').value;
           const fatContent = parseFloat(document.getElementById('qc-fat').value) || null;
           const snfValue = parseFloat(document.getElementById('qc-snf').value) || null;
           const testStatus = document.getElementById('qc-test-status').value;
           const labReportId = document.getElementById('qc-lab-report-id').value || null;

           const today = new Date().toISOString().split('T')[0];
           if (new Date(collectionDate) > new Date(today)) {
               showNotification('Collection date cannot be in the future.', 'error');
               return;
           }

           if (centerId && sampleId && collectionDate && testStatus) {
               const checkIndex = qualityChecks.findIndex(qc => qc.id === id);
               const newCheck = { id, centerId, sampleId, collectionDate, fatContent, snfValue, testStatus, labReportId };
               if (checkIndex > -1) {
                   qualityChecks[checkIndex] = newCheck;
                   showNotification('Quality check updated successfully.', 'success');
               } else {
                   qualityChecks.push(newCheck);
                   showNotification('Quality check added successfully.', 'success');
               }
               saveToLocalStorage(QUALITY_CHECKS_KEY, qualityChecks);
               renderQualityChecks();
               closeAddQualityCheckModal();
           } else {
               showNotification('Please fill in all required fields.', 'error');
           }
       });
   }

   function filterQualityChecks() {
       const filters = {};
       filterQualityChecksInputs.forEach(input => {
           if (input.value) {
               filters[input.dataset.column] = input.value.toLowerCase();
           }
       });

       let filteredChecks = [...qualityChecks];
       for (const column in filters) {
           const filterValue = filters[column];
           filteredChecks = filteredChecks.filter(check => {
               if (column === 'centerId') {
                   const center = collectionCenters.find(c => c.id === check.centerId);
                   return center ? center.name.toLowerCase().includes(filterValue) : check.centerId.toLowerCase().includes(filterValue);
               } else if (column === 'collectionDate') {
                   return formatDate(check.collectionDate).includes(filterValue); // Format date for filtering
               } else if (column === 'fatContent' || column === 'snfValue') {
                   const numValue = check[column];
                   const filterNum = parseFloat(filterValue);
                   return isNaN(filterNum) || (numValue !== null && String(numValue).includes(filterValue));
               } else {
                   return String(check[column]).toLowerCase().includes(filterValue);
               }
           });
       }
       renderQualityChecks(filteredChecks);
   }

   filterQualityChecksInputs.forEach(input => {
       input.addEventListener('input', filterQualityChecks);
   });

   function sortQualityChecks(column) {
       // Implement sorting logic here
   }

   if (qualityChecksTableHeader) {
       qualityChecksTableHeader.querySelectorAll('.filterable').forEach(th => {
           th.addEventListener('click', () => sortQualityChecks(th.dataset.column));
       });
   }

   const toggleQualityChecksFilterButton = document.querySelector('#quality-control-section .controls h4');
   if (toggleQualityChecksFilterButton && qualityChecksFilterRow) {
       toggleQualityChecksFilterButton.addEventListener('click', () => {
           qualityChecksFilterRow.classList.toggle('hidden');
       });
   }

   function populateInitialData() {
       if (!getFromLocalStorage(COLLECTION_CENTERS_KEY).length) {
           const initialCenters = [
               { id: generateId('center'), name: 'Center A' },
               { id: generateId('center'), name: 'Center B' },
               { id: generateId('center'), name: 'Center C' }
           ];
           saveToLocalStorage(COLLECTION_CENTERS_KEY, initialCenters);
           collectionCenters = initialCenters;
       } else {
           collectionCenters = getFromLocalStorage(COLLECTION_CENTERS_KEY);
       }

       if (!getFromLocalStorage(QUALITY_CHECKS_KEY).length) {
           const initialChecks = [
               { id: generateId('qc'), centerId: collectionCenters[0]?.id, sampleId: 'S001', collectionDate: '2025-04-25', fatContent: 3.8, snfValue: 8.2, testStatus: 'passed', labReportId: 'LR001' },
               { id: generateId('qc'), centerId: collectionCenters[1]?.id, sampleId: 'S002', collectionDate: '2025-04-26', fatContent: 4.1, snfValue: 8.5, testStatus: 'passed', labReportId: 'LR002' },
               { id: generateId('qc'), centerId: collectionCenters[0]?.id, sampleId: 'S003', collectionDate: '2025-04-27', fatContent: 3.5, snfValue: 7.9, testStatus: 'failed', labReportId: 'LR003' }
           ];
           saveToLocalStorage(QUALITY_CHECKS_KEY, initialChecks);
           qualityChecks = initialChecks;
       } else {
           qualityChecks = getFromLocalStorage(QUALITY_CHECKS_KEY);
       }
       populateQCCenterOptions();
       renderQualityChecks();
   }

   // Event listeners for opening and closing the Add Quality Check modal
   const addQCButton = document.querySelector('#quality-control-section .controls .inline-add-button');
   const closeQCModalButton = document.querySelector('#add-quality-check-modal .close-button');

   if (addQCButton) {
       addQCButton.addEventListener('click', openAddQualityCheckModal);
   }
   if (closeQCModalButton) {
       closeQCModalButton.addEventListener('click', closeAddQualityCheckModal);
   }
   if (addQualityCheckModal) {
       addQualityCheckModal.addEventListener('click', (event) => {
           if (event.target === addQualityCheckModal) {
               closeAddQualityCheckModal();
           }
       });
   }

   populateInitialData();
   // --- End Quality Control Section ---

    // --- Initial Data Rendering ---
    renderCollectionCenters();
    renderRoutes();
    renderCollectionRecords();
    renderVehicles();
    renderDrivers();
    //renderLogistics();
    renderQualityChecks();

    // --- Initial Population of Select Options ---
    populateRouteVehicleOptions();
    populateRouteCenterOptions();
    populateRecordCenterOptions();
    populateVehicleRouteOptions();
    populateDriverVehicleOptions();
    populateQCCenterOptions();

    // Set the 'Collection Centers' tab as active by default
    const defaultActiveButton = document.querySelector('.qc-navigation .nav-button[data-section="collection-centers"]');
    if (defaultActiveButton) {
        defaultActiveButton.click();
    }
});

// function renderLogistics() {
//     // Placeholder for map integration and real-time tracking
//     const mapContainer = document.getElementById('map-container');
//     if (mapContainer) {
//         mapContainer.innerHTML = '<p>Map integration will be here.</p>';
//         // In a real application, you would integrate a map library here
//     }

//     // Placeholder for rendering trip details
//     const tripsTableBody = document.getElementById('trips-table-body');
//     if (tripsTableBody) {
//         tripsTableBody.innerHTML = '';
//         const sampleTrips = getFromLocalStorage('logisticsData') || [
//             { id: 'TRP001', vehicleId: vehicles[0]?.id || 'V001', driverId: drivers[0]?.id || 'D001', startTime: '08:00', endTime: '12:00', status: 'Completed' },
//             { id: 'TRP002', vehicleId: vehicles[1]?.id || 'V002', driverId: drivers[1]?.id || 'D002', startTime: '09:00', endTime: '13:00', status: 'In Transit' },
//         ];
//         sampleTrips.forEach(trip => {
//             const row = tripsTableBody.insertRow();
//             row.insertCell().textContent = trip.id;
//             const vehicle = vehicles.find(v => v.id === trip.vehicleId);
//             row.insertCell().textContent = vehicle ? `${vehicle.type} (${vehicle.licensePlate})` : trip.vehicleId;
//             row.insertCell().textContent = trip.driverId;
//             row.insertCell().textContent = trip.startTime;
//             row.insertCell().textContent = trip.endTime;
//             row.insertCell().textContent = trip.status;
//         });
//     }
// }

function populateLogisticsVehicleOptions() {
    // If needed, populate vehicle options for logistics filtering or actions
}