/* Update Center Card Labels and Fixed Capacity Value */
// This snippet remains unchanged (as per your instruction)
document.querySelectorAll(".center-card .center-details").forEach((detailContainer) => {
  const items = detailContainer.querySelectorAll(".detail-item");
  if (items.length >= 2) {
    // First detail item: set label to "Container Limit:" and force value to "8000L"
    items[0].querySelector("strong").textContent = "Container Limit:";
    items[0].querySelector("span").textContent = "8000L";
    // Second detail item: set label to "Current Load:" (leave its value intact)
    items[1].querySelector("strong").textContent = "Current Load:";
  }
});

/* Calculate and Update Load Percentage */
// This function calculates the percentage of load based on the fixed container limit (8000L)
// and the current load value (removing the "L" unit), then updates the progress bar and percentage text.
function updateLoadPercentages() {
  document.querySelectorAll(".center-card").forEach((card) => {
    const containerLimitElem = card.querySelector(".center-details .detail-item:first-child span");
    const currentLoadElem = card.querySelector(".center-details .detail-item:nth-child(2) span");
    if (containerLimitElem && currentLoadElem) {
      const containerLimit = parseFloat(containerLimitElem.textContent.replace("L", ""));
      const currentLoad = parseFloat(currentLoadElem.textContent.replace("L", ""));
      if (!isNaN(containerLimit) && !isNaN(currentLoad) && containerLimit > 0) {
        const percentage = Math.round((currentLoad / containerLimit) * 100);
        const storageFill = card.querySelector(".storage-fill");
        const storagePercentElem = card.querySelector(".storage-percent");
        if (storageFill && storagePercentElem) {
          storageFill.style.width = percentage + "%";
          storagePercentElem.textContent = percentage + "%";
        }
      }
    }
  });
}
// Run this calculation once on page load.
updateLoadPercentages();

/* Chart Handling and Center Cards */

// Global object to store Chart.js instances by canvas id
const chartInstances = {};

// Keep track of the currently active center card so we don't reload charts unnecessarily.
let activeCard = null;

// Get all center cards and the container for centers.
const centerCards = document.querySelectorAll(".center-card");
const centersContent = document.getElementById("chilling-centers-content");

// Add click event listeners to each center card.
centerCards.forEach((card) => {
  card.addEventListener("click", (e) => {
    // If charts are already loaded for this card, do nothing.
    if (card.dataset.chartsLoaded === "true") return;

    // Mark the card as clicked so the overlay (if any) is not shown again.
    card.classList.add("clicked");

    // If another card is active, hide its chart container and reset its charts.
    if (activeCard && activeCard !== card) {
      const prevChartContainer = activeCard.querySelector(".chart-container");
      prevChartContainer.style.display = "none";
      const prevSafeName = activeCard.getAttribute("data-center-name").split(" ").join("");
      resetCharts(prevSafeName, prevChartContainer);
      delete activeCard.dataset.chartsLoaded;
    }

    activeCard = card;
    const centerName = card.getAttribute("data-center-name");
    const safeCenterName = centerName.split(" ").join("");
    const chartContainer = card.querySelector(".chart-container");

    // Hide all other center cards and display only the current one.
    Array.from(centersContent.children).forEach((child) => {
      child.style.display = "none";
    });
    card.style.display = "";

    // If charts are not loaded yet for this center, then load them after a short delay.
    if (!card.dataset.chartsLoaded) {
      chartContainer.style.display = "grid";
      setTimeout(() => {
        loadChartData(centerName);
        chartContainer.dataset.loaded = "true";
        card.dataset.chartsLoaded = "true";
      }, 150); // Delay to allow layout change to finish.
    }
  });
});

/* Chart Data Loading */
// This function loads chart data for a given center and initializes the charts.
function loadChartData(centerName) {
  const safeCenterName = centerName.split(" ").join("");

  const volumeData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [4000, 4500, 5200, 6000, 5500, 7000, 6800, 7200, 7100, 7300, 7500, 7600],
    backgroundColor: "#4CAF50",
    label: "Volume (Liters)"
  };

  const durationData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [120, 130, 110, 140, 125, 150, 160, 155, 145, 150, 165, 170],
    backgroundColor: "#2196F3",
    label: "Duration (Hours)"
  };

  const temperatureData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [4, 6, 5, 7, 6, 8, 9, 8, 7, 6, 5, 4],
    backgroundColor: "#FFC107",
    label: "Temperature (°C)"
  };

  const testResultsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Acidity",
        data: [0.15, 0.16, 0.14, 0.15, 0.17, 0.16, 0.15, 0.14, 0.16, 0.15, 0.17, 0.16],
        backgroundColor: "#FF5252",
        borderColor: "#FF5252",
        borderWidth: 1,
        fill: false,
        tension: 0.4,
        pointRadius: 3
      },
      {
        label: "Fat",
        data: [3.8, 3.7, 3.9, 3.8, 3.8, 3.7, 3.9, 3.8, 3.7, 3.9, 3.8, 3.8],
        backgroundColor: "#FF8A65",
        borderColor: "#FF8A65",
        borderWidth: 1,
        fill: false,
        tension: 0.4,
        pointRadius: 3
      },
      {
        label: "SNF",
        data: [8.5, 8.6, 8.4, 8.5, 8.5, 8.6, 8.4, 8.5, 8.5, 8.6, 8.4, 8.5],
        backgroundColor: "#FFD54F",
        borderColor: "#FFD54F",
        borderWidth: 1,
        fill: false,
        tension: 0.4,
        pointRadius: 3
      },
      {
        label: "Protein",
        data: [3.2, 3.3, 3.1, 3.2, 3.2, 3.3, 3.1, 3.2, 3.2, 3.3, 3.1, 3.2],
        backgroundColor: "#A5D6A7",
        borderColor: "#A5D6A7",
        borderWidth: 1,
        fill: false,
        tension: 0.4,
        pointRadius: 3
      }
    ]
  };

  const hygieneData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [95, 92, 94, 96, 93, 97, 94, 92, 95, 94, 93, 92],
    backgroundColor: "#8BC34A",
    label: "Hygiene Score"
  };

  const energyData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [2200, 2100, 2300, 2400, 2250, 2500, 2450, 2600, 2550, 2650, 2700, 2750],
    backgroundColor: "#3F51B5",
    label: "Energy Consumption (kWh)"
  };

  // Render all charts using the unique canvas IDs that combine the chart type with safeCenterName.
  renderChart("volumeChart_" + safeCenterName, volumeData, "bar");
  renderChart("durationChart_" + safeCenterName, durationData, "line");
  renderChart("temperatureChart_" + safeCenterName, temperatureData, "line");
  renderChart("testResultsChart_" + safeCenterName, testResultsData, "bar");
  renderChart("hygieneChart_" + safeCenterName, hygieneData, "line");
  renderChart("energyChart_" + safeCenterName, energyData, "bar");
}

/* Chart Rendering and Resetting Functions */
// Initializes (or updates) a Chart.js chart instance on the given canvas.
function renderChart(canvasId, chartData, type = "bar") {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas with id ${canvasId} not found`);
    return;
  }
  const ctx = canvas.getContext("2d");

  // Destroy any existing chart instance on this canvas.
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  let datasets = [];
  if (chartData.datasets) {
    datasets = chartData.datasets;
  } else {
    datasets = [{
      label: chartData.label,
      data: chartData.values,
      backgroundColor: chartData.backgroundColor,
      borderColor: type === "line" ? chartData.backgroundColor : "transparent",
      borderWidth: type === "line" ? 2 : 0,
      fill: type === "line" ? false : true,
      pointRadius: type === "line" ? 3 : 0,
      tension: 0.4,
    }];
  }

  chartInstances[canvasId] = new Chart(ctx, {
    type: type,
    data: {
      labels: chartData.labels,
      datasets: datasets,
    },
    options: {
      animation: false, // Disable animations for improved performance on updates
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        title: {
          display: false,
          text: chartData.label,
          font: { size: 12 },
        },
        legend: { position: "bottom" },
      },
    },
  });
}

// Resets charts by destroying any existing instances associated with a center
// and then resetting the chart container's inner HTML to prepare for a fresh chart load.
function resetCharts(centerId, chartContainer) {
  Object.keys(chartInstances).forEach((key) => {
    if (key.includes(centerId)) {
      chartInstances[key].destroy();
      delete chartInstances[key];
    }
  });
  chartContainer.innerHTML = `
    <div class="chart-card small-chart">
      <h3>Volume</h3>
      <canvas id="volumeChart_${centerId}" class="chart-canvas"></canvas>
    </div>
    <div class="chart-card small-chart">
      <h3>Duration</h3>
      <canvas id="durationChart_${centerId}" class="chart-canvas"></canvas>
    </div>
    <div class="chart-card small-chart">
      <h3>Temperature</h3>
      <canvas id="temperatureChart_${centerId}" class="chart-canvas"></canvas>
    </div>
    <div class="chart-card small-chart">
      <h3>Test Results</h3>
      <canvas id="testResultsChart_${centerId}" class="chart-canvas"></canvas>
    </div>
    <div class="chart-card small-chart">
      <h3>Hygiene</h3>
      <canvas id="hygieneChart_${centerId}" class="chart-canvas"></canvas>
    </div>
    <div class="chart-card small-chart">
      <h3>Energy</h3>
      <canvas id="energyChart_${centerId}" class="chart-canvas"></canvas>
    </div>
  `;
}