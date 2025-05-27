// ===========================
// Sidebar / Header Interactivity
// ===========================

// --- Menu Toggle ---
const menuIcon = document.querySelector(".menu-icon");
const sidebar = document.querySelector(".sidebar");
const content = document.querySelector(".content");

menuIcon.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  content.classList.toggle("collapsed");
});

// --- Language Dropdown Toggle ---
const languageDropdown = document.querySelector(".language-dropdown");
const dropdownMenu = document.querySelector(".dropdown-menu");

languageDropdown.addEventListener("click", (e) => {
  e.stopPropagation();
  // Toggle display or use class toggle (here we use display for simplicity)
  dropdownMenu.style.display =
    dropdownMenu.style.display === "none" || dropdownMenu.style.display === ""
      ? "block"
      : "none";
});

document.addEventListener("click", (event) => {
  if (
    !languageDropdown.contains(event.target) &&
    !dropdownMenu.contains(event.target)
  ) {
    dropdownMenu.style.display = "none";
  }
});

// --- Date Options & Flatpickr Integration ---
const dateOptions = document.querySelectorAll(".date-options button");
const customDateRangeInput = document.getElementById("date-range");
const customDateRangeElement = document.querySelector(".custom-date-range");

let flatpickrInstance;
dateOptions.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove "active" class from all options and apply to clicked button.
    dateOptions.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    if (button.dataset.range === "custom") {
      customDateRangeElement.style.display = "flex";
      if (!flatpickrInstance) {
        flatpickrInstance = flatpickr(customDateRangeInput, {
          mode: "range",
          dateFormat: "Y-m-d",
          onClose: function (selectedDates) {
            if (selectedDates.length === 2) {
              console.log("Date range selected:", selectedDates);
              // Additional processing can be added here.
            }
          },
        });
      }
    } else {
      customDateRangeElement.style.display = "none";
      if (flatpickrInstance) {
        flatpickrInstance.destroy();
        flatpickrInstance = null;
      }
    }
  });
});

// --- Sidebar Navigation with Iframe Loading ---
const sidebarItems = document.querySelectorAll(".sidebar li");
const dashboardContent = document.getElementById("dashboard-content");

// Iframe container elements (make sure these exist in your HTML)
const iframeWrapper = document.getElementById("iframe-wrapper");
const iframeContainer = document.getElementById("iframe-container");

// Function to map sidebar menu text to external HTML document URLs
function getIframeUrl(menuName) {
  switch (menuName) {
    case "Farmer Management":
      return "farmer.html";
    case "Milk Collection":
      return "milkcol.html";
    case "Milk Storage Unit":   //Before chilling centers
      return "center.html";
    case "Processing Plants":
      return "processing-plants.html";
    case "Quality Control":
      return "quality-control.html";
    case "Product Inventory":
      return "product-inventory.html";
    case "Distribution Hub":
      return "distribution-logistics.html";
    case "Retail & Franchise":
      return "retail-franchise.html";
    case "Customer Relations":
      return "customer-relations.html";
    case "Financial Reports":
      return "financial-reports.html";
    case "Employee Management":
      return "employee-management.html";
 //   case "Fleet Management": // It covered in distribution hub
 //     return "fleet-management.html";
    case "Settings":
      return "settings.html";
    case "Log Out":
      // For Log Out, you might handle this action differently,
      // e.g., redirect to a login page or call a logout API.
      return "login.html";
    default:
      return "";
  }
}

// Update sidebar item clicking behavior
sidebarItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Remove "active" class from all sidebar items.
    sidebarItems.forEach((i) => i.classList.remove("active"));
    // Add active class to the clicked sidebar item.
    item.classList.add("active");

    const itemText = item.querySelector(".menu-text").innerText.trim();
    if (itemText === "Dashboard") {
      // If Dashboard is clicked, show the default dashboard content and hide the iframe
      dashboardContent.style.display = "block";
      iframeWrapper.style.display = "none";
    } else {
      // For other menu items: hide dashboard content, show iframe and load the external document.
      dashboardContent.style.display = "none";
      iframeWrapper.style.display = "block";

      const url = getIframeUrl(itemText);
      iframeContainer.src = url;
    }
  });
});

// On window load, ensure the dashboard content is displayed by default.
window.addEventListener("load", () => {
  dashboardContent.style.display = "block";
  iframeWrapper.style.display = "none";
});

// ===========================
// Chart.js Configurations
// ===========================

// Get canvas contexts for the eight KPI cards
const milkProcurementPieCtx = document
  .getElementById("milkProcurementPie")
  .getContext("2d");
const salesRevenuePieCtx = document
  .getElementById("salesRevenuePie")
  .getContext("2d");
const activeFarmersPieCtx = document
  .getElementById("activeFarmersPie")
  .getContext("2d");
const distributorsPieCtx = document
  .getElementById("distributorsPie")
  .getContext("2d");
const customerGrowthPieCtx = document
  .getElementById("customerGrowthPie")
  .getContext("2d");
const qualityMetricsPieCtx = document
  .getElementById("qualityMetricsPie")
  .getContext("2d");
const environmentalMetricsPieCtx = document
  .getElementById("environmentMetricsPie")
  .getContext("2d");
const employeeEngagementPieCtx = document
  .getElementById("employeeEngagementPie")
  .getContext("2d");

// Get canvas contexts for additional visualizations
const salesTrendChartCtx = document
  .getElementById("salesTrendChart")
  .getContext("2d");
const salesPerformanceChartCtx = document
  .getElementById("salesPerformanceChart")
  .getContext("2d");
const profitBreakdownChartCtx = document
  .getElementById("profitBreakdownChart")
  .getContext("2d");

// Common options for all KPI mini donut charts
const commonKPIOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "80%",
  rotation: -90,
  circumference: 180,
  plugins: { legend: { display: false } },
};

// --- KPI Donut Charts ---
// Milk Procurement Chart
const milkProcurementChart = new Chart(milkProcurementPieCtx, {
  type: "doughnut",
  data: {
    labels: ["Procured", "Remaining"],
    datasets: [
      {
        label: "Milk",
        data: [250000, 750000],
        backgroundColor: ["#4CAF50", "#f1f5f9"],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  },
  options: commonKPIOptions,
});

// Sales Revenue Chart
const salesRevenueChart = new Chart(salesRevenuePieCtx, {
  type: "doughnut",
  data: {
    labels: ["Revenue", "Potential"],
    datasets: [
      {
        label: "Sales",
        data: [1500000, 500000],
        backgroundColor: ["#FFC107", "#f1f5f9"],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  },
  options: commonKPIOptions,
});

// Active Farmers Chart
const activeFarmersChart = new Chart(activeFarmersPieCtx, {
  type: "doughnut",
  data: {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        label: "Farmers",
        data: [5000, 1000],
        backgroundColor: ["#3B82F6", "#f1f5f9"],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  },
  options: commonKPIOptions,
});

// Distributors Chart
const distributorsChart = new Chart(distributorsPieCtx, {
  type: "doughnut",
  data: {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        label: "Distributors",
        data: [1200, 300],
        backgroundColor: ["#8B5CF6", "#f1f5f9"],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  },
  options: commonKPIOptions,
});

// Customer Growth Chart
const customerGrowthChart = new Chart(customerGrowthPieCtx, {
  type: "doughnut",
  data: {
    labels: ["Growth", "Stable"],
    datasets: [
      {
        label: "Customer Growth",
        data: [120, 50],
        backgroundColor: ["#F59E0B", "#f1f5f9"],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  },
  options: commonKPIOptions,
});

// Quality Metrics Chart
const qualityMetricsChart = new Chart(qualityMetricsPieCtx, {
  type: "doughnut",
  data: {
    labels: ["Meets Standards", "Issues"],
    datasets: [
      {
        label: "Quality",
        data: [95, 5],
        backgroundColor: ["#10B981", "#f1f5f9"],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  },
  options: commonKPIOptions,
});

// Environmental Metrics Chart
const environmentalMetricsChart = new Chart(environmentalMetricsPieCtx, {
  type: "doughnut",
  data: {
    labels: ["Recycled", "Wasted"],
    datasets: [
      {
        label: "Environment",
        data: [78, 22],
        backgroundColor: ["#34D399", "#f1f5f9"],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  },
  options: commonKPIOptions,
});

// Employee Engagement Chart
const employeeEngagementChart = new Chart(employeeEngagementPieCtx, {
  type: "doughnut",
  data: {
    labels: ["Engaged", "Not Engaged"],
    datasets: [
      {
        label: "Employee Engagement",
        data: [89, 11],
        backgroundColor: ["#1D4ED8", "#f1f5f9"],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  },
  options: commonKPIOptions,
});

// --- Additional Visualizations ---

// Sales Trend Chart (Line Chart)
const salesTrendChart = new Chart(salesTrendChartCtx, {
  type: "line",
  data: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    datasets: [
      {
        label: "Sales",
        data: [65, 59, 80, 81, 56, 55, 40, 68, 72, 60, 82, 90],
        fill: false,
        borderColor: "#3B82F6",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#fff",
        pointHoverRadius: 8,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: "#4B5563" } },
      y: { grid: { color: "#E5E7EB" }, ticks: { color: "#4B5563" } },
    },
    plugins: { legend: { display: false } },
  },
});

// Sales Performance Chart (Bar Chart)
const salesPerformanceChart = new Chart(salesPerformanceChartCtx, {
  type: "bar",
  data: {
    labels: ["Product A", "Product B", "Product C", "Product D"],
    datasets: [
      {
        label: "Sales Performance",
        data: [85, 55, 70, 95],
        backgroundColor: "#4AC948",
        borderRadius: 5,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#4B5563", font: { size: 14 } },
      },
      y: { grid: { color: "#E5E7EB" }, ticks: { color: "#4B5563", font: { size: 14 } } },
    },
    plugins: { legend: { display: false } },
  },
});

// Profit Breakdown Chart (Donut Chart)
const profitBreakdownChart = new Chart(profitBreakdownChartCtx, {
  type: "doughnut",
  data: {
    labels: ["Dairy Products", "Other Products", "Operational Costs"],
    datasets: [
      {
        label: "Profit",
        data: [40, 30, 30],
        backgroundColor: ["#FF6B6B", "#4AC948", "#19A7CE"],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: { legend: { display: false } },
  },
});