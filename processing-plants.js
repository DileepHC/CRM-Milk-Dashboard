document.addEventListener("DOMContentLoaded", function () {
  /*********************************
    * Global Data & Local Storage   *
    *********************************/
  let defaultData = {
    plants: [
        { id: "P001", name: "Farm Alpha", location: "City 1", capacity: 100000 },
        { id: "P002", name: "Farm Beta", location: "Town 2", capacity: 150000 },
        { id: "P003", name: "Farm Gamma", location: "Village 3", capacity: 120000 },
    ],
    production: [
        { date: "2025-04-08", plant: "Farm Alpha", product: "Milk", volume: 80000 },
        { date: "2025-04-08", plant: "Farm Beta", product: "Cheese", volume: 15000 },
        { date: "2025-04-08", plant: "Farm Gamma", product: "Yogurt", volume: 25000 },
        { date: "2025-04-07", plant: "Farm Alpha", product: "Milk", volume: 75000 },
        { date: "2025-04-07", plant: "Farm Beta", product: "Cheese", volume: 12000 },
        { date: "2025-04-07", plant: "Farm Gamma", product: "Yogurt", volume: 22000 },
        { date: "2025-04-06", plant: "Farm Alpha", product: "Milk", volume: 82000 },
        { date: "2025-04-06", plant: "Farm Beta", product: "Cheese", volume: 16000 },
        { date: "2025-04-06", plant: "Farm Gamma", product: "Yogurt", volume: 28000 },
    ],
    quality: [
        { date: "2025-04-08", plant: "Farm Alpha", parameter: "Fat", value: 3.8, status: "Pass" },
        { date: "2025-04-08", plant: "Farm Beta", parameter: "Moisture", value: 55, status: "Pass" },
        { date: "2025-04-08", plant: "Farm Gamma", parameter: "Acidity", value: 0.15, status: "Pass" },
        { date: "2025-04-07", plant: "Farm Alpha", parameter: "Fat", value: 3.7, status: "Pass" },
        { date: "2025-04-07", plant: "Farm Beta", parameter: "Moisture", value: 56, status: "Fail" },
        { date: "2025-04-07", plant: "Farm Gamma", parameter: "Acidity", value: 0.14, status: "Pass" },
    ],
    inventory: [
        { type: "raw", item: "Raw Milk", quantity: 500000, unit: "Liters" },
        { type: "finished", item: "Milk (Packaged)", quantity: 100000, unit: "Packs" },
        { type: "finished", item: "Cheese (Blocks)", quantity: 5000, unit: "Blocks" },
        { type: "raw", item: "Culture", quantity: 100, unit: "Kg" },
    ],
    maintenance: [
        { task: "Inspect Boiler #1", plant: "Farm Alpha", due: "2025-04-15" },
        { task: "Lubricate Conveyor Belt", plant: "Farm Beta", due: "2025-04-10" },
        { task: "Check Cooling System", plant: "Farm Gamma", due: "2025-04-12" },
    ],
};

let currentData = localStorage.getItem("dashboardData")
    ? JSON.parse(localStorage.getItem("dashboardData"))
    : defaultData;

// Context and editing indexes
let currentPlant = null;
let editingPlantIndex = null;
let editingProductionIndex = null;
let editingQualityIndex = null;
let editingInventoryIndex = null;
let editingMaintenanceIndex = null;

// Chart instances (for Chart.js)
let productionByPlantChartInstance = null;
let productionByProductChartInstance = null;
let productionEfficiencyChartInstance = null;
let qualityPassFailChartInstance = null;
let qualityParameterDistributionChartInstance = null;
let plantQualityPerformanceChartInstance = null;
let inventoryLevelsChartInstance = null;
let stockTurnoverChartInstance = null;
let maintenanceFrequencyChartInstance = null;

/*********************************
 * Helper Functions               *
 *********************************/
function updateLocalStorage() {
    localStorage.setItem("dashboardData", JSON.stringify(currentData));
}
function updateActiveSection(sectionId) {
    localStorage.setItem("activeSection", sectionId);
}
// Toggle view: mode 'form' shows form; mode 'table' shows table view.
function toggleView(formElement, tableElement, mode) {
    if (mode === "form") {
        formElement.style.display = "block";
        tableElement.style.display = "none";
    } else if (mode === "table") {
        formElement.style.display = "none";
        tableElement.style.display = "block";
    }
}
// Reset a list of form inputs
function resetForm(inputs) {
    inputs.forEach((input) => (input.value = ""));
}
// Set active class on a given button in a button collection
function setActiveButton(buttonCollection, activeButton) {
    buttonCollection.forEach((btn) => btn.classList.remove("active"));
    activeButton.classList.add("active");
}
// Function to filter table rows based on input
function filterTable(tableBody, filters) {
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    rows.forEach((row) => {
        let match = true;
        filters.forEach((filter) => {
            const columnIndex = Array.from(row.cells)
                .map((cell) => cell.getAttribute("data-column"))
                .indexOf(filter.column);
            if (columnIndex !== -1) {
                const cellText = row.cells[columnIndex].textContent.toLowerCase();
                const filterText = filter.value.toLowerCase();
                if (!cellText.includes(filterText)) {
                    match = false;
                }
            }
        });
        row.style.display = match ? "" : "none";
    });
}
// Function to sort table rows
function sortTable(tableBody, columnIndex, type, isAscending) {
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    const sortedRows = rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent;
        const bValue = b.cells[columnIndex].textContent;
        let comparison = 0;
        if (type === "number") {
            comparison = parseFloat(aValue) - parseFloat(bValue);
        } else if (type === "date") {
            comparison = new Date(aValue) - new Date(bValue);
        } else {
            comparison = aValue.localeCompare(bValue);
        }
        return isAscending ? comparison : -comparison;
    });
    tableBody.innerHTML = "";
    sortedRows.forEach((row) => tableBody.appendChild(row));
}

/*********************************
 * DOM Element References         *
 *********************************/
const navButtons = document.querySelectorAll(".plant-navigation .nav-button");
const plantSections = document.querySelectorAll(".content-display .plant-section");
const plantCardsGrid = document.querySelector(".plant-cards-grid");
const totalProductionTodayElement = document.getElementById("total-production-today");
const averageUtilizationElement = document.getElementById("average-utilization");
const overallQualityScoreElement = document.getElementById("overall-quality-score");
const dailyProductionMiniChartCanvas = document.getElementById("daily-production-trend-mini-chart");
const utilizationComparisonMiniChartCanvas = document.getElementById("utilization-comparison-mini-chart");
const qualityScoreTrendMiniChartCanvas = document.getElementById("quality-score-trend-mini-chart");

// Production Section Elements
const addProductionRecordButton = document.getElementById("add-production-record-button");
const addProductionForm = document.getElementById("add-production-form");
const viewProductionRecordsTable = document.getElementById("view-production-records-table");
const productionListTableBody = document.getElementById("production-list-table-body");
const productionDateAddInput = document.getElementById("production-date-add");
const productionPlantAddSelect = document.getElementById("production-plant-add");
const productionProductAddInput = document.getElementById("production-product-add");
const productionVolumeAddInput = document.getElementById("production-volume-add");
const saveProductionButton = document.getElementById("save-production-button");
const productionFilterInputs = document.querySelectorAll("#view-production-records-table .filter-input");
const productionTableHeader = document.querySelector("#view-production-records-table thead tr");
const downloadProductionExcel = document.getElementById("download-production-excel");
const downloadProductionPdf = document.getElementById("download-production-pdf");
const productionByPlantChartCanvas = document.getElementById("production-by-plant-chart");
const productionByProductChartCanvas = document.getElementById("production-by-product-chart");
const productionEfficiencyChartCanvas = document.getElementById("production-efficiency-chart");

// Quality Section Elements
const addQualityCheckButton = document.getElementById("add-quality-check-button");
const addQualityForm = document.getElementById("add-quality-form");
const viewQualityChecksTable = document.getElementById("view-quality-checks-table");
const qualityListTableBody = document.getElementById("quality-list-table-body");
const qualityDateAddInput = document.getElementById("quality-date-add");
const qualityPlantAddSelect = document.getElementById("quality-plant-add");
const qualityParameterAddInput = document.getElementById("quality-parameter-add");
const qualityValueAddInput = document.getElementById("quality-value-add");
const qualityStatusAddSelect = document.getElementById("quality-status-add");
const saveQualityButton = document.getElementById("save-quality-button");
const qualityFilterInputs = document.querySelectorAll("#view-quality-checks-table .filter-input");
const qualityTableHeader = document.querySelector("#view-quality-checks-table thead tr");
const downloadQualityExcel = document.getElementById("download-quality-excel");
const downloadQualityPdf = document.getElementById("download-quality-pdf");
const qualityPassFailChartCanvas = document.getElementById("quality-pass-fail-chart");
const qualityParameterDistributionChartCanvas = document.getElementById("quality-parameter-distribution-chart");
const plantQualityPerformanceChartCanvas = document.getElementById("plant-quality-performance-chart");

// Inventory Section Elements
const addInventoryItemButton = document.getElementById("add-inventory-item-button");
const addInventoryForm = document.getElementById("add-inventory-form");
const viewInventoryItemsTable = document.getElementById("view-inventory-items-table");
const inventoryListTableBody = document.getElementById("inventory-list-table-body");
const inventoryTypeAddSelect = document.getElementById("inventory-type-add");
const inventoryItemAddInput = document.getElementById("inventory-item-add");
const inventoryQuantityAddInput = document.getElementById("inventory-quantity-add");
const inventoryUnitAddInput = document.getElementById("inventory-unit-add");
const saveInventoryButton = document.getElementById("save-inventory-button");
const inventoryFilterInputs = document.querySelectorAll("#view-inventory-items-table .filter-input");
const inventoryTableHeader = document.querySelector("#view-inventory-items-table thead tr");
const downloadInventoryExcel = document.getElementById("download-inventory-excel");
const downloadInventoryPdf = document.getElementById("download-inventory-pdf");
const inventoryLevelsChartCanvas = document.getElementById("inventory-levels-chart");
const stockTurnoverChartCanvas = document.getElementById("stock-turnover-chart");

// Maintenance Section Elements
const addMaintenanceTaskButton = document.getElementById("add-maintenance-task-button");
const addMaintenanceForm = document.getElementById("add-maintenance-form");
const viewMaintenanceTasksTable = document.getElementById("view-maintenance-tasks-table");
const maintenanceListTableBody = document.getElementById("maintenance-list-table-body");
const maintenanceTaskAddInput = document.getElementById("maintenance-task-add");
const maintenancePlantAddSelect = document.getElementById("maintenance-plant-add");
const maintenanceDueAddInput = document.getElementById("maintenance-due-add");
const saveMaintenanceButton = document.getElementById("save-maintenance-button");
const upcomingMaintenanceList = document.getElementById("upcoming-maintenance-list");
//const viewMaintenanceDetailsButton = document.getElementById("view-maintenance-details");
const maintenanceFilterInputs = document.querySelectorAll("#view-maintenance-tasks-table .filter-input");
const maintenanceTableHeader = document.querySelector("#view-maintenance-tasks-table thead tr");
const downloadMaintenanceExcel = document.getElementById("download-maintenance-excel");
const downloadMaintenancePdf = document.getElementById("download-maintenance-pdf");
const maintenanceFrequencyChartCanvas = document.getElementById("maintenance-frequency-chart");

/*********************************
 * Navigation                      *
 *********************************/
navButtons.forEach((button) => {
    button.addEventListener("click", function () {
        const sectionId = this.getAttribute("data-section") + "-section";
        plantSections.forEach((section) => section.classList.remove("active"));
        document.getElementById(sectionId).classList.add("active");
        navButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
        updateActiveSection(sectionId);
    });
});

const activeSection = localStorage.getItem("activeSection") || "overview-section";
document.getElementById(activeSection).classList.add("active");
navButtons.forEach((button) => {
    if (button.getAttribute("data-section") + "-section" === activeSection) {
        button.classList.add("active");
    }
});

  /*********************************
   * Plant Cards in Overview       *
   *********************************/
  function renderPlantCards() {
    if (!plantCardsGrid) return;
    plantCardsGrid.innerHTML = "";
    currentData.plants.forEach((plant) => {
     const card = document.createElement("div");
     card.classList.add("plant-card");
     card.innerHTML = `
             <h4>${plant.name}</h4>
             <p>Location: ${plant.location}</p>
             <p>Capacity: ${plant.capacity} Liters/day</p>
             <button class="view-details-button" data-plant-id="${plant.id}">View Details</button>
         `;
     plantCardsGrid.appendChild(card);
    });
 
    const viewDetailsButtons = document.querySelectorAll(".view-details-button");
    viewDetailsButtons.forEach((button) => {
     button.addEventListener("click", function () {
      const plantId = this.getAttribute("data-plant-id");
      currentPlant = currentData.plants.find((p) => p.id === plantId);
      if (currentPlant) {
       // Update active navigation to Production
       navButtons.forEach((btn) => btn.classList.remove("active"));
       const productionNavButton = Array.from(navButtons).find(
        (btn) => btn.getAttribute("data-section") === "production"
       );
       if (productionNavButton) {
        productionNavButton.classList.add("active");
       }
       plantSections.forEach((section) => section.classList.remove("active"));
       document.getElementById("production-section").classList.add("active");
       updateActiveSection("production-section");
       loadAndRenderProductionData(currentPlant.name);
       loadAndRenderQualityData(currentPlant.name);
      }
     });
    });
   }
 
   /*********************************
    * Populate Dropdowns            *
    *********************************/
   function populatePlantDropdowns() {
    const plantSelects = document.querySelectorAll('select[id$="-plant-add"]');
    plantSelects.forEach((select) => {
     const currentValue = select.value;
     select.innerHTML = '<option value="">Select Farm</option>';
     currentData.plants.forEach((plant) => {
      const option = document.createElement("option");
      option.value = plant.name;
      option.textContent = plant.name;
      option.selected = plant.name === currentValue;
      select.appendChild(option);
     });
    });
   }
 
   /*********************************
    * Update Overview Metrics       *
    *********************************/
   function updateOverviewMetrics() {
    if (totalProductionTodayElement) {
     const today = new Date().toISOString().split("T")[0];
     const todayProduction = currentData.production.filter((record) => record.date === today);
     const totalVolume = todayProduction.reduce((sum, record) => sum + record.volume, 0);
     totalProductionTodayElement.textContent = `${totalVolume.toLocaleString()} Liters`;
    }
 
    if (averageUtilizationElement) {
     const totalCapacity = currentData.plants.reduce((sum, plant) => sum + plant.capacity, 0);
     const averageCurrentProduction = currentData.production.reduce((sum, record) => sum + record.volume, 0) / currentData.production.length || 0;
     const utilizationRate = totalCapacity > 0 ? (averageCurrentProduction / totalCapacity) * 100 : 0;
     averageUtilizationElement.textContent = `${utilizationRate.toFixed(2)}%`;
    }
 
    if (overallQualityScoreElement) {
     const passingQualityChecks = currentData.quality.filter((record) => record.status === "Pass").length;
     const totalQualityChecks = currentData.quality.length;
     const qualityScore = totalQualityChecks > 0 ? (passingQualityChecks / totalQualityChecks) * 100 : 0;
     overallQualityScoreElement.textContent = `${qualityScore.toFixed(2)}%`;
    }
 
    // Mini Charts (using dummy data for now)
    if (dailyProductionMiniChartCanvas) {
     new Chart(dailyProductionMiniChartCanvas, {
      type: "line",
      data: {
       labels: ["Day -2", "Day -1", "Today"],
       datasets: [
        {
         label: "Production (Liters)",
         data: [78000, 85000, 82000],
         borderColor: "#3498db",
         fill: false,
         tension: 0.4,
        },
       ],
      },
      options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
        y: { beginAtZero: true, display: false },
        x: { display: false },
       },
       plugins: { legend: { display: false } },
      },
     });
    }
 
    if (utilizationComparisonMiniChartCanvas) {
     new Chart(utilizationComparisonMiniChartCanvas, {
      type: "bar",
      data: {
       labels: ["Current", "Average"],
       datasets: [
        {
         label: "Utilization (%)",
         data: [75, 70],
         backgroundColor: ["#2ecc71", "#f39c12"],
        },
       ],
      },
      options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
        y: { beginAtZero: true, max: 100, display: false },
        x: { display: false },
       },
       plugins: { legend: { display: false } },
      },
     });
    }
 
    if (qualityScoreTrendMiniChartCanvas) {
     new Chart(qualityScoreTrendMiniChartCanvas, {
      type: "line",
      data: {
       labels: ["Week -1", "Current Week"],
       datasets: [
        {
         label: "Quality Score (%)",
         data: [92, 95],
         borderColor: "#27ae60",
         fill: false,
         tension: 0.4,
        },
       ],
      },
      options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
        y: { beginAtZero: true, max: 100, display: false },
        x: { display: false },
       },
       plugins: { legend: { display: false } },
      },
     });
    }
   }
 
   /*********************************
    * Production Section            *
    *********************************/

   if (addProductionRecordButton) {
    addProductionRecordButton.addEventListener("click", () => {
        currentPlant ? populateProductionForm(currentPlant) : populateProductionForm();
        toggleView(addProductionForm, viewProductionRecordsTable, "form");
        addCancelIcon(addProductionForm, () => {
            toggleView(addProductionForm, viewProductionRecordsTable, "table");
            editingProductionIndex = null;
        });
    });
}

function populateProductionForm(plant = null, record = null) {
    resetForm([productionDateAddInput, productionProductAddInput, productionVolumeAddInput]);
    populatePlantDropdowns();
    removeErrorMessage(productionDateAddInput);

    if (plant) {
        productionPlantAddSelect.value = plant.name;
    }

    if (record) {
        const [year, month, day] = record.date.split('-');
        productionDateAddInput.value = `${year}-${month}-${day}`;
        productionPlantAddSelect.value = record.plant;
        productionProductAddInput.value = record.product;
        productionVolumeAddInput.value = record.volume;
    } else {
        const today = new Date().toISOString().split('T')[0];
        productionDateAddInput.value = today;
    }
}

function renderProductionList(data) {
    if (!productionListTableBody) return;
    productionListTableBody.innerHTML = "";
    data.forEach((record, index) => {
        const [year, month, day] = record.date.split('-');
        const formattedDate = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
        const row = productionListTableBody.insertRow();
        row.innerHTML = `
            <td data-column="date">${formattedDate}</td>
            <td data-column="farm">${record.plant}</td>
            <td data-column="product">${record.product}</td>
            <td data-column="volume">${record.volume}</td>
            <td class="action-button-container">
                <button class="action-button edit-button small" data-index="${index}">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="action-button delete-button small" data-index="${index}">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </td>
        `;
    });

    productionListTableBody.querySelectorAll(".edit-button").forEach((button) => {
        button.addEventListener("click", function () {
            const index = parseInt(this.getAttribute("data-index"));
            const record = currentData.production[index];
            editingProductionIndex = index;
            populateProductionForm(null, record);
            toggleView(addProductionForm, viewProductionRecordsTable, "form");
            addCancelIcon(addProductionForm, () => {
                toggleView(addProductionForm, viewProductionRecordsTable, "table");
                editingProductionIndex = null;
            });
        });
    });

    productionListTableBody.querySelectorAll(".delete-button").forEach((button) => {
        button.addEventListener("click", function () {
            const index = parseInt(this.getAttribute("data-index"));
            if (confirm("Are you sure you want to delete this record?")) {
                currentData.production.splice(index, 1);
                updateLocalStorage();
                loadAndRenderProductionData(currentPlant ? currentPlant.name : null);
                renderProductionCharts(currentData.production);
            }
        });
    });
}

if (saveProductionButton) {
    saveProductionButton.addEventListener("click", () => {
        const dateInput = productionDateAddInput.value;
        const plant = productionPlantAddSelect.value;
        const product = productionProductAddInput.value;
        const volume = parseInt(productionVolumeAddInput.value);

        const selectedDate = new Date(dateInput);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate > today) {
            displayErrorMessage(productionDateAddInput, "Future dates are not allowed.");
            return;
        } else {
            removeErrorMessage(productionDateAddInput);
        }

        if (dateInput && plant && product && !isNaN(volume)) {
            const [year, month, day] = dateInput.split('-');
            const formattedDate = `${year}-${month}-${day}`;
            const newRecord = { date: formattedDate, plant, product, volume };
            if (editingProductionIndex !== null) {
                currentData.production[editingProductionIndex] = newRecord;
                editingProductionIndex = null;
            } else {
                currentData.production.push(newRecord);
            }
            updateLocalStorage();
            toggleView(addProductionForm, viewProductionRecordsTable, "table");
            loadAndRenderProductionData(currentPlant ? currentPlant.name : null);
            renderProductionCharts(currentData.production);
        } else {
            alert("Please fill in all production details.");
        }
    });
}

function loadAndRenderProductionData(plantName = null) {
    const filteredData = plantName
        ? currentData.production.filter((record) => record.plant === plantName)
        : currentData.production;
    renderProductionList(filteredData);
    setupProductionTableFiltering(); // Use specific function for production filtering
    setupTableSorting(productionTableHeader, productionListTableBody);
}

function setupProductionTableFiltering() {
    if (!productionFilterInputs || !productionListTableBody) return;

    productionFilterInputs.forEach(input => {
        input.addEventListener('input', function() {
            const filters = Array.from(productionFilterInputs)
                .map(input => ({ column: input.getAttribute('data-column'), value: input.value }));
            filterProductionTable(productionListTableBody, filters);
        });
    });
}

function filterProductionTable(tableBody, filters) {
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    rows.forEach((row) => {
        let match = true;
        filters.forEach((filter) => {
            const column = filter.column === 'farm' ? 'plant' : filter.column; // Map 'farm' to 'plant' in data
            const columnIndex = Array.from(row.cells)
                .map((cell) => cell.getAttribute("data-column"))
                .indexOf(column);
            if (columnIndex !== -1) {
                const cellText = row.cells[columnIndex].textContent.toLowerCase();
                const filterText = filter.value.toLowerCase();
                if (!cellText.includes(filterText)) {
                    match = false;
                }
            }
        });
        row.style.display = match ? "" : "none";
    });
}

function renderProductionCharts(productionData) {
    // Production by Plant (Horizontal Bar Chart)
    const productionByPlantData = {};
    productionData.forEach((record) => {
        productionByPlantData[record.plant] = (productionByPlantData[record.plant] || 0) + record.volume;
    });
    const plantLabels = Object.keys(productionByPlantData);
    const plantVolumes = Object.values(productionByPlantData);
    if (productionByPlantChartCanvas) {
        if (productionByPlantChartInstance) {
            productionByPlantChartInstance.destroy();
        }
        productionByPlantChartInstance = new Chart(productionByPlantChartCanvas, {
            type: "bar",
            data: {
                labels: plantLabels,
                datasets: [{
                    label: "Production Volume (Liters)",
                    data: plantVolumes,
                    backgroundColor: ["#3498db", "#2ecc71", "#f39c12"],
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Make it a horizontal bar chart
                scales: {
                    x: { beginAtZero: true },
                },
                plugins: {
                    legend: { position: 'bottom' }
                }
            },
        });
    }

    // Production Breakdown by Product (Polar Area Chart)
    const productionByProductData = {};
    productionData.forEach((record) => {
        productionByProductData[record.product] = (productionByProductData[record.product] || 0) + record.volume;
    });
    const productLabels = Object.keys(productionByProductData);
    const productVolumes = Object.values(productionByProductData);
    if (productionByProductChartCanvas) {
        if (productionByProductChartInstance) {
            productionByProductChartInstance.destroy();
        }
        productionByProductChartInstance = new Chart(productionByProductChartCanvas, {
            type: "polarArea",
            data: {
                labels: productLabels,
                datasets: [{
                    data: productVolumes,
                    backgroundColor: ["#e74c3c", "#9b59b6", "#1abc9c"],
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            },
        });
    }

    // Production Efficiency Over Time (Line Chart with Multiple Lines - Example with dummy time data)
    if (productionEfficiencyChartCanvas && currentData.plants.length > 0) {
        // Group production by date and calculate total production for each day
        const dailyProduction = productionData.reduce((acc, record) => {
            acc[record.date] = (acc[record.date] || 0) + record.volume;
            return acc;
        }, {});

        const sortedDates = Object.keys(dailyProduction).sort();
        const productionValues = sortedDates.map(date => dailyProduction[date]);

        if (productionEfficiencyChartInstance) {
            productionEfficiencyChartInstance.destroy();
        }
        productionEfficiencyChartInstance = new Chart(productionEfficiencyChartCanvas, {
            type: "line",
            data: {
                labels: sortedDates.map(date => new Date(date).toLocaleDateString()),
                datasets: [{
                    label: "Total Production (Liters)",
                    data: productionValues,
                    borderColor: "#27ae60",
                    fill: false,
                    tension: 0.4,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Total Production (Liters)' } },
                    x: { title: { display: true, text: 'Date' } },
                },
                plugins: {
                    legend: { position: 'bottom' }
                }
            },
        });
    }
}

if (downloadProductionExcel) {
    downloadProductionExcel.addEventListener("click", () => {
        exportTableToExcel("production-list-table", "ProductionData.xlsx");
    });
}

if (downloadProductionPdf) {
    downloadProductionPdf.addEventListener("click", () => {
        exportTableToPdf("Production Records", "production-list-table");
    });
}

// Helper function to add a cancel icon to a form
function addCancelIcon(formElement, onCancel) {
    const cancelButton = document.createElement("span");
    cancelButton.classList.add("material-symbols-outlined", "cancel-icon");
    cancelButton.textContent = "cancel";
    cancelButton.addEventListener("click", onCancel);
    cancelButton.style.position = "absolute";
    cancelButton.style.top = "10px";
    cancelButton.style.right = "10px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.fontSize = "1.5em";
    cancelButton.style.color = "#777";
    formElement.style.position = "relative";
    formElement.appendChild(cancelButton);
}

// Helper function to display an error message
function displayErrorMessage(inputElement, message) {
    let errorDiv = inputElement.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('error-message')) {
        errorDiv = document.createElement('div');
        errorDiv.classList.add('error-message');
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }
    errorDiv.textContent = message;
}

// Helper function to remove an error message
function removeErrorMessage(inputElement) {
    const errorDiv = inputElement.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.textContent = '';
    }
}
 
   /*********************************
   * Quality Section               *
   *********************************/
  if (addQualityCheckButton) {
    addQualityCheckButton.addEventListener("click", () => {
     currentPlant ? populateQualityForm(currentPlant) : populateQualityForm();
     toggleView(addQualityForm, viewQualityChecksTable, "form");
     // Add cancel icon when form is shown
     addCancelIcon(addQualityForm, () => {
      toggleView(addQualityForm, viewQualityChecksTable, "table");
      editingQualityIndex = null; // Reset editing index
     });
    });
   }
 
   function populateQualityForm(plant = null, record = null) {
    resetForm([qualityDateAddInput, qualityParameterAddInput, qualityValueAddInput]);
    populatePlantDropdowns();
    removeErrorMessage(qualityDateAddInput); // Clear any previous error
    if (plant) {
     qualityPlantAddSelect.value = plant.name;
    }
    if (record) {
     const [year, month, day] = record.date.split('-');
     qualityDateAddInput.value = `${year}-${month}-${day}`;
     qualityPlantAddSelect.value = record.plant;
     qualityParameterAddInput.value = record.parameter;
     qualityValueAddInput.value = record.value;
     qualityStatusAddSelect.value = record.status;
    } else {
     qualityStatusAddSelect.value = "Pass"; // Default status
     const today = new Date().toISOString().split('T')[0];
     qualityDateAddInput.value = today;
    }
   }
 
   function renderQualityList(data) {
    if (!qualityListTableBody) return;
    qualityListTableBody.innerHTML = "";
    data.forEach((record, index) => {
     const [year, month, day] = record.date.split('-');
     const formattedDate = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
     const row = qualityListTableBody.insertRow();
     row.innerHTML = `
             <td data-column="date">${formattedDate}</td>
             <td data-column="plant">${record.plant}</td>
             <td data-column="parameter">${record.parameter}</td>
             <td data-column="value">${record.value}</td>
             <td data-column="status" class="${record.status.toLowerCase()}">${record.status}</td>
             <td class="action-button-container">
                 <button class="action-button edit-button small" data-index="${index}">
                     <span class="material-symbols-outlined">edit</span>
                 </button>
                 <button class="action-button delete-button small" data-index="${index}">
                     <span class="material-symbols-outlined">delete</span>
                 </button>
             </td>
         `;
    });
 
    // Edit and Delete functionality for Quality
    qualityListTableBody.querySelectorAll(".edit-button").forEach((button) => {
     button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      const record = currentData.quality[index];
      editingQualityIndex = index;
      populateQualityForm(null, record);
      toggleView(addQualityForm, viewQualityChecksTable, "form");
      addCancelIcon(addQualityForm, () => {
       toggleView(addQualityForm, viewQualityChecksTable, "table");
       editingQualityIndex = null;
      });
     });
    });
 
    qualityListTableBody.querySelectorAll(".delete-button").forEach((button) => {
     button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      if (confirm("Are you sure you want to delete this quality check?")) {
       currentData.quality.splice(index, 1);
       updateLocalStorage();
       loadAndRenderQualityData(currentPlant ? currentPlant.name : null);
       renderQualityCharts(currentData.quality);
      }
     });
    });
   }
 
   if (saveQualityButton) {
    saveQualityButton.addEventListener("click", () => {
     const dateInput = qualityDateAddInput.value;
     const plant = qualityPlantAddSelect.value;
     const parameter = qualityParameterAddInput.value;
     const value = parseFloat(qualityValueAddInput.value);
     const status = qualityStatusAddSelect.value;
 
     const selectedDate = new Date(dateInput);
     const today = new Date();
     today.setHours(0, 0, 0, 0);
 
     if (selectedDate > today) {
      displayErrorMessage(qualityDateAddInput, "Future dates are not allowed.");
      return;
     } else {
      removeErrorMessage(qualityDateAddInput);
     }
 
     if (dateInput && plant && parameter && !isNaN(value) && status) {
      const [year, month, day] = dateInput.split('-');
      const formattedDate = `${year}-${month}-${day}`;
      const newRecord = { date: formattedDate, plant, parameter, value, status };
      if (editingQualityIndex !== null) {
       currentData.quality[editingQualityIndex] = newRecord;
       editingQualityIndex = null;
      } else {
       currentData.quality.push(newRecord);
      }
      updateLocalStorage();
      toggleView(addQualityForm, viewQualityChecksTable, "table");
      loadAndRenderQualityData(currentPlant ? currentPlant.name : null);
      renderQualityCharts(currentData.quality);
     } else {
      alert("Please fill in all quality check details.");
     }
    });
   }
 
   function loadAndRenderQualityData(plantName = null) {
    const filteredData = plantName
     ? currentData.quality.filter((record) => record.plant === plantName)
     : currentData.quality;
    renderQualityList(filteredData);
    setupTableFiltering(qualityFilterInputs, qualityListTableBody);
    setupTableSorting(qualityTableHeader, qualityListTableBody);
   }
 
   function renderQualityCharts(qualityData) {
    // Quality Pass/Fail
    const passCount = qualityData.filter((q) => q.status === "Pass").length;
    const failCount = qualityData.filter((q) => q.status === "Fail").length;
    if (qualityPassFailChartCanvas) {
     if (qualityPassFailChartInstance) {
      qualityPassFailChartInstance.destroy();
     }
     qualityPassFailChartInstance = new Chart(qualityPassFailChartCanvas, {
      type: "pie",
      data: {
       labels: ["Pass", "Fail"],
       datasets: [
        {
         data: [passCount, failCount],
         backgroundColor: ["#2ecc71", "#e74c3c"],
        },
       ],
      },
      options: {
       responsive: true,
       maintainAspectRatio: false,
      },
     });
    }
 
    // Quality Parameter Distribution
    const parameterCounts = {};
    qualityData.forEach((q) => {
     parameterCounts[q.parameter] = (parameterCounts[q.parameter] || 0) + 1;
    });
    const parameterLabels = Object.keys(parameterCounts);
    const parameterValues = Object.values(parameterCounts);
    if (qualityParameterDistributionChartCanvas) {
     if (qualityParameterDistributionChartInstance) {
      qualityParameterDistributionChartInstance.destroy();
     }
     qualityParameterDistributionChartInstance = new Chart(qualityParameterDistributionChartCanvas, {
      type: "bar",
      data: {
       labels: parameterLabels,
       datasets: [
        {
         label: "Number of Checks",
         data: parameterValues,
         backgroundColor: "#9b59b6",
        },
       ],
      },
      options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
        y: { beginAtZero: true },
       },
      },
     });
    }
 
    // Plant Quality Performance (Pass Rate per Plant)
    const plantQuality = {};
    currentData.plants.forEach((plant) => {
     const plantChecks = qualityData.filter((q) => q.plant === plant.name);
     const passChecks = plantChecks.filter((q) => q.status === "Pass").length;
     const totalChecks = plantChecks.length;
     plantQuality[plant.name] = totalChecks > 0 ? (passChecks / totalChecks) * 100 : 0;
    });
    const plantNames = Object.keys(plantQuality);
    const passRates = Object.values(plantQuality);
    if (plantQualityPerformanceChartCanvas) {
     if (plantQualityPerformanceChartInstance) {
      plantQualityPerformanceChartInstance.destroy();
     }
     plantQualityPerformanceChartInstance = new Chart(plantQualityPerformanceChartCanvas, {
      type: "bar",
      data: {
       labels: plantNames,
       datasets: [
        {
         label: "Pass Rate (%)",
         data: passRates,
         backgroundColor: ["#2ecc71", "#3498db", "#f39c12"],
        },
       ],
      },
      options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
        y: { beginAtZero: true, max: 100 },
       },
      },
     });
    }
   }
 
   if (downloadQualityExcel) {
    downloadQualityExcel.addEventListener("click", () => {
     exportTableToExcel("quality-list-table", "QualityData.xlsx");
    });
   }
 
   if (downloadQualityPdf) {
    downloadQualityPdf.addEventListener("click", () => {
     exportTableToPdf("Quality Checks", "quality-list-table");
    });
   }
 
   // Helper function to add a cancel icon to a form
   function addCancelIcon(formElement, onCancel) {
    const cancelButton = document.createElement("span");
    cancelButton.classList.add("material-symbols-outlined", "cancel-icon");
    cancelButton.textContent = "cancel";
    cancelButton.addEventListener("click", onCancel);
 
    // Style the cancel icon
    cancelButton.style.position = "absolute";
    cancelButton.style.top = "10px";
    cancelButton.style.right = "10px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.fontSize = "1.5em";
    cancelButton.style.color = "#777";
 
    formElement.style.position = "relative"; // Ensure form is positioned
    formElement.appendChild(cancelButton);
   }
 
   // Helper function to display an error message
   function displayErrorMessage(inputElement, message) {
    let errorDiv = inputElement.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('error-message')) {
     errorDiv = document.createElement('div');
     errorDiv.classList.add('error-message');
     inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }
    errorDiv.textContent = message;
   }
 
   // Helper function to remove an error message
   function removeErrorMessage(inputElement) {
    const errorDiv = inputElement.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
     errorDiv.textContent = '';
    }
   }
 
   /*********************************
   * Inventory Section             *
   *********************************/
  if (addInventoryItemButton) {
    addInventoryItemButton.addEventListener("click", () => {
     populateInventoryForm();
     toggleView(addInventoryForm, viewInventoryItemsTable, "form");
     // Add cancel icon when form is shown
     addCancelIcon(addInventoryForm, () => {
      toggleView(addInventoryForm, viewInventoryItemsTable, "table");
      editingInventoryIndex = null; // Reset editing index
     });
    });
   }
 
   function populateInventoryForm(record = null) {
    resetForm([inventoryItemAddInput, inventoryQuantityAddInput, inventoryUnitAddInput]);
    inventoryTypeAddSelect.value = ""; // Reset select
    if (record) {
     inventoryTypeAddSelect.value = record.type;
     inventoryItemAddInput.value = record.item;
     inventoryQuantityAddInput.value = record.quantity;
     inventoryUnitAddInput.value = record.unit;
    }
   }
 
   function renderInventoryList(data) {
    if (!inventoryListTableBody) return;
    inventoryListTableBody.innerHTML = "";
    data.forEach((record, index) => {
     const row = inventoryListTableBody.insertRow();
     row.innerHTML = `
             <td data-column="type">${record.type}</td>
             <td data-column="item">${record.item}</td>
             <td data-column="quantity">${record.quantity}</td>
             <td data-column="unit">${record.unit}</td>
             <td class="action-button-container">
                 <button class="action-button edit-button small" data-index="${index}">
                     <span class="material-symbols-outlined">edit</span>
                 </button>
                 <button class="action-button delete-button small" data-index="${index}">
                     <span class="material-symbols-outlined">delete</span>
                 </button>
             </td>
         `;
    });
 
    // Edit and Delete functionality for Inventory
    inventoryListTableBody.querySelectorAll(".edit-button").forEach((button) => {
     button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      const record = currentData.inventory[index];
      editingInventoryIndex = index;
      populateInventoryForm(record);
      toggleView(addInventoryForm, viewInventoryItemsTable, "form");
      addCancelIcon(addInventoryForm, () => {
       toggleView(addInventoryForm, viewInventoryItemsTable, "table");
       editingInventoryIndex = null;
      });
     });
    });
 
    inventoryListTableBody.querySelectorAll(".delete-button").forEach((button) => {
     button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      if (confirm("Are you sure you want to delete this inventory item?")) {
       currentData.inventory.splice(index, 1);
       updateLocalStorage();
       loadAndRenderInventoryData();
       renderInventoryCharts(currentData.inventory);
      }
     });
    });
   }
 
   if (saveInventoryButton) {
    saveInventoryButton.addEventListener("click", () => {
     const type = inventoryTypeAddSelect.value;
     const item = inventoryItemAddInput.value;
     const quantity = parseInt(inventoryQuantityAddInput.value);
     const unit = inventoryUnitAddInput.value;
 
     if (type && item && !isNaN(quantity) && unit) {
      const newRecord = { type, item, quantity, unit };
      if (editingInventoryIndex !== null) {
       currentData.inventory[editingInventoryIndex] = newRecord;
       editingInventoryIndex = null;
      } else {
       currentData.inventory.push(newRecord);
      }
      updateLocalStorage();
      toggleView(addInventoryForm, viewInventoryItemsTable, "table");
      loadAndRenderInventoryData();
      renderInventoryCharts(currentData.inventory);
     } else {
      alert("Please fill in all inventory details.");
     }
    });
   }
 
   function loadAndRenderInventoryData() {
    renderInventoryList(currentData.inventory);
    setupTableFiltering(inventoryFilterInputs, inventoryListTableBody);
    setupTableSorting(inventoryTableHeader, inventoryListTableBody);
   }
 
   function renderInventoryCharts(inventoryData) {
    // Inventory Levels by Item
    const inventoryLevels = {};
    inventoryData.forEach((item) => {
     inventoryLevels[item.item] = item.quantity;
    });
    const itemLabels = Object.keys(inventoryLevels);
    const itemQuantities = Object.values(inventoryLevels);
    if (inventoryLevelsChartCanvas) {
     if (inventoryLevelsChartInstance) {
      inventoryLevelsChartInstance.destroy();
     }
     inventoryLevelsChartInstance = new Chart(inventoryLevelsChartCanvas, {
      type: "bar",
      data: {
       labels: itemLabels,
       datasets: [
        {
         label: "Quantity",
         data: itemQuantities,
         backgroundColor: "#f39c12",
        },
       ],
      },
      options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
        y: { beginAtZero: true },
       },
      },
     });
    }
 
    // Stock Turnover (example: using only finished goods for simplicity)
    const finishedGoods = inventoryData.filter((item) => item.type === "finished");
    if (stockTurnoverChartCanvas && finishedGoods.length > 0) {
     const items = finishedGoods.map((item) => item.item);
     const quantities = finishedGoods.map((item) => item.quantity);
     // Dummy sales data - replace with actual sales data if available
     const salesData = items.map(() => Math.floor(Math.random() * 5000));
     const turnoverRates = quantities.map((quantity, index) => (salesData[index] / quantity).toFixed(2) || 0);
 
     if (stockTurnoverChartInstance) {
      stockTurnoverChartInstance.destroy();
     }
     stockTurnoverChartInstance = new Chart(stockTurnoverChartCanvas, {
      type: "line",
      data: {
       labels: items,
       datasets: [
        {
         label: "Turnover Rate (Sales/Quantity)",
         data: turnoverRates,
         borderColor: "#e74c3c",
         fill: false,
         tension: 0.4,
        },
       ],
      },
      options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
        y: { beginAtZero: true },
       },
      },
     });
    }
   }
 
   if (downloadInventoryExcel) {
    downloadInventoryExcel.addEventListener("click", () => {
     exportTableToExcel("inventory-list-table", "InventoryData.xlsx");
    });
   }
 
   if (downloadInventoryPdf) {
    downloadInventoryPdf.addEventListener("click", () => {
     exportTableToPdf("Inventory Items", "inventory-list-table");
    });
   }
 
   // Helper function to add a cancel icon to a form
   function addCancelIcon(formElement, onCancel) {
    const cancelButton = document.createElement("span");
    cancelButton.classList.add("material-symbols-outlined", "cancel-icon");
    cancelButton.textContent = "cancel";
    cancelButton.addEventListener("click", onCancel);
 
    // Style the cancel icon
    cancelButton.style.position = "absolute";
    cancelButton.style.top = "10px";
    cancelButton.style.right = "10px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.fontSize = "1.5em";
    cancelButton.style.color = "#777";
 
    formElement.style.position = "relative"; // Ensure form is positioned
    formElement.appendChild(cancelButton);
   }
 
   /*********************************
   * Maintenance Section             *
   *********************************/
  if (addMaintenanceTaskButton) {
    addMaintenanceTaskButton.addEventListener("click", () => {
     populateMaintenanceForm();
     toggleView(addMaintenanceForm, viewMaintenanceTasksTable, "form");
     // Add cancel icon when form is shown
     addCancelIcon(addMaintenanceForm, () => {
      toggleView(addMaintenanceForm, viewMaintenanceTasksTable, "table");
      editingMaintenanceIndex = null; // Reset editing index
     });
    });
   }
 
   function populateMaintenanceForm(record = null) {
    resetForm([maintenanceTaskAddInput, maintenanceDueAddInput]);
    populatePlantDropdowns();
    removeErrorMessage(maintenanceDueAddInput); // Clear any previous error
    if (record) {
     maintenanceTaskAddInput.value = record.task;
     maintenancePlantAddSelect.value = record.plant;
     const [year, month, day] = record.due.split('-');
     maintenanceDueAddInput.value = `${year}-${month}-${day}`;
    } else {
     const today = new Date().toISOString().split('T')[0];
     maintenanceDueAddInput.value = today;
    }
   }
 
   function renderMaintenanceList(data) {
    if (!maintenanceListTableBody) return;
    maintenanceListTableBody.innerHTML = "";
    data.forEach((record, index) => {
     const [year, month, day] = record.due.split('-');
     const formattedDate = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
     const row = maintenanceListTableBody.insertRow();
     row.innerHTML = `
             <td data-column="task">${record.task}</td>
             <td data-column="plant">${record.plant}</td>
             <td data-column="due">${formattedDate}</td>
             <td class="action-button-container">
                 <button class="action-button edit-button small" data-index="${index}">
                     <span class="material-symbols-outlined">edit</span>
                 </button>
                 <button class="action-button delete-button small" data-index="${index}">
                     <span class="material-symbols-outlined">delete</span>
                 </button>
             </td>
         `;
    });
 
    // Edit and Delete functionality for Maintenance
    maintenanceListTableBody.querySelectorAll(".edit-button").forEach((button) => {
     button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      const record = currentData.maintenance[index];
      editingMaintenanceIndex = index;
      populateMaintenanceForm(record);
      toggleView(addMaintenanceForm, viewMaintenanceTasksTable, "form");
      addCancelIcon(addMaintenanceForm, () => {
       toggleView(addMaintenanceForm, viewMaintenanceTasksTable, "table");
       editingMaintenanceIndex = null;
      });
     });
    });
 
    maintenanceListTableBody.querySelectorAll(".delete-button").forEach((button) => {
     button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      if (confirm("Are you sure you want to delete this maintenance task?")) {
       currentData.maintenance.splice(index, 1);
       updateLocalStorage();
       loadAndRenderMaintenanceData();
       renderMaintenanceCharts(currentData.maintenance);
       renderUpcomingMaintenance();
      }
     });
    });
   }
 
   if (saveMaintenanceButton) {
    saveMaintenanceButton.addEventListener("click", () => {
     const task = maintenanceTaskAddInput.value;
     const plant = maintenancePlantAddSelect.value;
     const dueInput = maintenanceDueAddInput.value;
 
     const selectedDate = new Date(dueInput);
     const today = new Date();
     today.setHours(0, 0, 0, 0);
 
     if (selectedDate > today) {
      displayErrorMessage(maintenanceDueAddInput, "Future dates are not allowed.");
      return;
     } else {
      removeErrorMessage(maintenanceDueAddInput);
     }
 
     if (task && plant && dueInput) {
      const [year, month, day] = dueInput.split('-');
      const due = `${year}-${month}-${day}`;
      const newRecord = { task, plant, due };
      if (editingMaintenanceIndex !== null) {
       currentData.maintenance[editingMaintenanceIndex] = newRecord;
       editingMaintenanceIndex = null;
      } else {
       currentData.maintenance.push(newRecord);
      }
      updateLocalStorage();
      toggleView(addMaintenanceForm, viewMaintenanceTasksTable, "table");
      loadAndRenderMaintenanceData();
      renderMaintenanceCharts(currentData.maintenance);
      renderUpcomingMaintenance();
     } else {
      alert("Please fill in all maintenance details.");
     }
    });
   }
 
   function loadAndRenderMaintenanceData() {
    renderMaintenanceList(currentData.maintenance);
    setupTableFiltering(maintenanceFilterInputs, maintenanceListTableBody);
    setupTableSorting(maintenanceTableHeader, maintenanceListTableBody);
   }
 
   function renderUpcomingMaintenance() {
    if (!upcomingMaintenanceList) return;
    upcomingMaintenanceList.innerHTML = "";
    const today = new Date().toISOString().split("T")[0];
    const upcomingTasks = currentData.maintenance
     .filter((task) => task.due >= today)
     .sort((a, b) => new Date(a.due) - new Date(b.due));
 
    upcomingTasks.forEach((task) => {
     const [year, month, day] = task.due.split('-');
     const formattedDate = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
     const listItem = document.createElement("li");
     listItem.textContent = `${task.task} at ${task.plant} (Due: ${formattedDate})`;
     upcomingMaintenanceList.appendChild(listItem);
    });
 
    if (upcomingTasks.length === 0) {
     const listItem = document.createElement("li");
     listItem.textContent = "No upcoming maintenance tasks.";
     upcomingMaintenanceList.appendChild(listItem);
    }
   }
 
   function renderMaintenanceCharts(maintenanceData) {
    // Maintenance Frequency by Plant
    const maintenanceFrequency = {};
    maintenanceData.forEach((task) => {
     maintenanceFrequency[task.plant] = (maintenanceFrequency[task.plant] || 0) + 1;
    });
    const plantLabels = Object.keys(maintenanceFrequency);
    const taskCounts = Object.values(maintenanceFrequency);
 
    if (maintenanceFrequencyChartCanvas) {
     if (maintenanceFrequencyChartInstance) {
      maintenanceFrequencyChartInstance.destroy();
     }
     maintenanceFrequencyChartInstance = new Chart(maintenanceFrequencyChartCanvas, {
      type: "bar",
      data: {
       labels: plantLabels,
       datasets: [
        {
         label: "Number of Tasks",
         data: taskCounts,
         backgroundColor: ["#3498db", "#2ecc71", "#f39c12"],
        },
       ],
      },
      options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
        y: { beginAtZero: true, stepSize: 1 },
       },
      },
     });
    }
   }
 
   if (downloadMaintenanceExcel) {
    downloadMaintenanceExcel.addEventListener("click", () => {
     exportTableToExcel("maintenance-list-table", "MaintenanceData.xlsx");
    });
   }
 
   if (downloadMaintenancePdf) {
    downloadMaintenancePdf.addEventListener("click", () => {
     exportTableToPdf("Maintenance Tasks", "maintenance-list-table");
    });
   }
 
   // Helper function to add a cancel icon to a form
   function addCancelIcon(formElement, onCancel) {
    const cancelButton = document.createElement("span");
    cancelButton.classList.add("material-symbols-outlined", "cancel-icon");
    cancelButton.textContent = "cancel";
    cancelButton.addEventListener("click", onCancel);
 
    // Style the cancel icon
    cancelButton.style.position = "absolute";
    cancelButton.style.top = "10px";
    cancelButton.style.right = "10px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.fontSize = "1.5em";
    cancelButton.style.color = "#777";
 
    formElement.style.position = "relative"; // Ensure form is positioned
    formElement.appendChild(cancelButton);
   }
 
   // Helper function to display an error message
   function displayErrorMessage(inputElement, message) {
    let errorDiv = inputElement.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('error-message')) {
     errorDiv = document.createElement('div');
     errorDiv.classList.add('error-message');
     inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }
    errorDiv.textContent = message;
   }
 
   // Helper function to remove an error message
   function removeErrorMessage(inputElement) {
    const errorDiv = inputElement.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
     errorDiv.textContent = '';
    }
   }
 
   /*********************************
    * Table Filtering               *
    *********************************/
   function setupTableFiltering(filterInputs, tableBody) {
    filterInputs.forEach((input) => {
     input.addEventListener("input", function () {
      const filters = Array.from(filterInputs).map((filterInput) => ({
       column: filterInput.getAttribute("data-column"),
       value: filterInput.value,
      }));
      filterTable(tableBody, filters);
     });
    });
   }
 
   /*********************************
    * Table Sorting                 *
    *********************************/
   function setupTableSorting(tableHeader, tableBody) {
    tableHeader.querySelectorAll("th[data-sortable]").forEach((header) => {
     let isAscending = false;
     header.addEventListener("click", function () {
      const columnIndex = this.cellIndex;
      const sortType = this.getAttribute("data-type") || "text";
      isAscending = !isAscending;
      sortTable(tableBody, columnIndex, sortType, isAscending);
 
      // Reset arrows on other headers
      tableHeader.querySelectorAll("th[data-sortable]").forEach((th) => {
       if (th !== this) {
        th.classList.remove("ascending", "descending");
        const arrowSpan = th.querySelector(".arrow");
        if (arrowSpan) arrowSpan.textContent = "▲▼";
       }
      });
 
      // Update arrow on the clicked header
      this.classList.toggle("ascending", isAscending);
      this.classList.toggle("descending", !isAscending);
      let arrowSpan = this.querySelector(".arrow");
      if (!arrowspan) {
        arrowSpan = document.createElement("span");
        arrowSpan.classList.add("arrow");
        this.appendChild(arrowSpan);
       }
       arrowSpan.textContent = isAscending ? "▲" : "▼";
      });
     });
    }
  
    /*********************************
     * Export Functions              *
     *********************************/
    function exportTableToExcel(tableId, filename = "") {
     const table = document.getElementById(tableId);
     if (!table) return;
     const wb = XLSX.utils.book_new();
     const ws = XLSX.utils.table_to_sheet(table);
     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
     XLSX.writeFile(wb, filename);
    }
  
    function exportTableToPdf(title, tableId) {
     const table = document.getElementById(tableId);
     if (!table) return;
     const doc = new jsPDF("p", "pt", "a4");
     const options = {
      margin: [20, 20, 20, 20],
      filename: title + ".pdf",
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
     };
     autoTable(doc, { html: "#" + tableId, startY: 40 });
     doc.setFontSize(18);
     doc.text(title, options.margin[0], 35);
     doc.save(options.filename);
    }
  
    /*********************************
     * Initialization                *
     *********************************/
    renderPlantCards();
    populatePlantDropdowns();
    updateOverviewMetrics();
    loadAndRenderProductionData();
    renderProductionCharts(currentData.production);
    loadAndRenderQualityData();
    renderQualityCharts(currentData.quality);
    loadAndRenderInventoryData();
    renderInventoryCharts(currentData.inventory);
    loadAndRenderMaintenanceData();
    renderMaintenanceCharts(currentData.maintenance);
    renderUpcomingMaintenance();
   });