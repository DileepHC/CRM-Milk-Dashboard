document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Element References ---
    const sidebar = document.getElementById('main-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle'); // Menu icon to toggle sidebar
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item'); // All sidebar navigation items
    const dashboardMainContent = document.getElementById('dashboard-main-content'); // The main dashboard KPI/chart area
    const iframeWrapper = document.getElementById('iframe-wrapper'); // Container for loading external modules
    // Corrected: The HTML uses 'iframe-container' for the iframe element
    const iframeContainer = document.getElementById('iframe-container'); // The iframe itself

    const notificationsToggle = document.getElementById('notifications-toggle'); // Bell icon for notifications
    const notificationDropdown = document.getElementById('notification-dropdown'); // Notifications dropdown content
    const languageToggle = document.getElementById('language-toggle'); // Language icon
    const languageMenu = document.getElementById('language-menu'); // Language dropdown content
    const themeToggle = document.getElementById('theme-toggle'); // Theme toggle icon
    const aiAssistantToggle = document.getElementById('ai-assistant-toggle'); // AI Assistant icon
    const aiAssistantModal = document.getElementById('ai-assistant-modal'); // AI Assistant modal
    const aiAssistantCloseButton = document.getElementById('ai-assistant-close'); // Close button for AI modal
    const aiChatMessages = document.getElementById('ai-chat-messages'); // Chat message display area
    const aiChatInput = document.getElementById('ai-chat-input'); // AI chat input field
    const aiChatSendButton = document.getElementById('ai-chat-send-button'); // AI chat send button

    const dateRangeButtons = document.querySelectorAll('.date-options button'); // Daily, Weekly, Monthly, Custom buttons
    const customDateRangeDiv = document.querySelector('.custom-date-range'); // Div containing custom date input
    const dateRangeInput = document.getElementById('date-range'); // Input for Flatpickr custom date range

    // Chart instances (to prevent re-initialization issues and allow updates)
    let milkProcurementPieChart = null;
    let salesRevenuePieChart = null;
    let activeFarmersPieChart = null;
    let distributorsPieChart = null;
    let customerGrowthPieChart = null;
    let qualityMetricsPieChart = null;
    let environmentMetricsPieChart = null;
    let employeeEngagementPieChart = null;
    let salesTrendChart = null;
    let salesPerformanceChart = null;
    let profitBreakdownChart = null;

    // Flatpickr instance for custom date range
    let flatpickrInstance;

    // --- Custom Message and Confirmation Modals (for better UX than alert/confirm) ---
    const messageBoxModal = document.getElementById('message-box-modal');
    const messageBoxCloseButton = document.getElementById('message-box-close');
    const messageBoxOkButton = document.getElementById('message-box-ok');
    const confirmBoxModal = document.getElementById('confirm-box-modal');
    const confirmBoxCloseButton = document.getElementById('confirm-box-close');
    const confirmBoxOkButton = document.getElementById('confirm-box-ok');
    const confirmBoxCancelButton = document.getElementById('confirm-box-cancel');

    /**
     * Displays a custom message box.
     * @param {string} title - The title of the message box.
     * @param {string} message - The message content.
     */
    function messageBox(title, message) {
        document.getElementById('message-box-title').textContent = title;
        document.getElementById('message-box-body').textContent = message;
        messageBoxModal.style.display = 'flex'; // Use flex to center the modal
    }

    /**
     * Displays a custom confirmation box.
     * @param {string} title - The title of the confirmation box.
     * @param {string} message - The confirmation message content.
     * @param {function(boolean): void} callback - Callback function (true if confirmed, false if cancelled).
     */
    function confirmBox(title, message, callback) {
        document.getElementById('confirm-box-title').textContent = title;
        document.getElementById('confirm-box-body').textContent = message;
        confirmBoxModal.style.display = 'flex'; // Use flex to center the modal

        // Ensure listeners are clean to prevent multiple triggers
        confirmBoxOkButton.onclick = null;
        confirmBoxCancelButton.onclick = null;
        confirmBoxCloseButton.onclick = null;

        const handleConfirm = () => {
            callback(true);
            confirmBoxModal.style.display = 'none';
        };

        const handleCancel = () => {
            callback(false);
            confirmBoxModal.style.display = 'none';
        };

        confirmBoxOkButton.onclick = handleConfirm;
        confirmBoxCancelButton.onclick = handleCancel;
        confirmBoxCloseButton.onclick = handleCancel;
    }

    // Event listeners for closing custom modals
    if (messageBoxCloseButton) messageBoxCloseButton.addEventListener('click', () => messageBoxModal.style.display = 'none');
    if (messageBoxOkButton) messageBoxOkButton.addEventListener('click', () => messageBoxModal.style.display = 'none');
    // Close modals if clicking outside the content
    window.addEventListener('click', function (event) {
        if (event.target === messageBoxModal) {
            messageBoxModal.style.display = 'none';
        }
        if (event.target === confirmBoxModal) {
            confirmBoxModal.style.display = 'none';
        }
    });

    // --- Sidebar Navigation Logic ---

    /**
     * Sets the active class on the clicked sidebar menu item.
     * @param {HTMLElement} selectedItem - The clicked list item element.
     */
    function setActiveMenuItem(selectedItem) {
        menuItems.forEach(item => item.classList.remove('active'));
        selectedItem.classList.add('active');
    }

    /**
     * Maps a sidebar menu text to its corresponding HTML module file.
     * @param {string} moduleName - The data-module attribute value (e.g., 'dashboard', 'farmer-management').
     * @returns {string} The URL of the HTML file for the module, or an empty string if it's the dashboard or logout.
     */
    function getModuleUrl(moduleName) {
        switch (moduleName) {
            case "dashboard":
                return ""; // No URL needed, as dashboard content is static HTML
            case "farmer-management":
                return "farmer.html";
            case "milk-collection":
                return "milkcol.html";
            case "factory": // Matches data-module="factory"
                return "processing-plants.html";
            case "quality-control":
                return "quality-control.html";
            case "product-inventory":
                return "product-inventory.html";
            case "distribution-logistics":
                return "distribution-logistics.html";
            case "retail-franchise":
                return "retail-franchise.html";
            case "customer-relations":
                return "customer-relations.html";
            case "financial-reports":
                return "financial-reports.html";
            case "employee-hub": // Matches data-module="employee-hub"
                return "employee-management.html";
            case "settings":
                return "settings.html";
           case "logout": // Matches data-module="logout"
                confirmBox('Confirm Logout', 'Are you sure you want to log out?', (response) => {
                    if (response) {
                        // Redirect to signin.html if confirmed
                        window.location.href = 'signin.html';
                        // The dashboard.html will automatically be "hidden" as the browser navigates to signin.html
                    } else {
                        // Keep current active state if logout is cancelled
                        const currentActive = document.querySelector('.sidebar-menu .menu-item.active');
                        if (currentActive) {
                            setActiveMenuItem(currentActive); // Re-activate the previously active item
                        } else {
                            // If no item was active (e.g., first load), default to dashboard
                            const dashboardItem = document.querySelector('.sidebar-menu .menu-item[data-module="dashboard"]');
                            if (dashboardItem) setActiveMenuItem(dashboardItem);
                        }
                    }
                });
                return ''; // No URL to load for logout, handled by confirmBox
            default:
                console.warn(`No URL defined for module: ${moduleName}`);
                return "";
        }
    }

    /**
     * Shows the content for the selected module, either the main dashboard or an external HTML via iframe.
     * @param {string} moduleName - The data-module attribute value (e.g., 'dashboard', 'farmer-management').
     */
    function showModuleContent(moduleName) {
        // Hide all module content areas first
        dashboardMainContent.classList.remove('active');
        iframeWrapper.classList.remove('active');
        iframeWrapper.style.display = 'none'; // Explicitly hide iframe wrapper

        if (moduleName === 'dashboard') {
            // If Dashboard is clicked, show the default dashboard content
            dashboardMainContent.classList.add('active');
            // Re-render dashboard charts when returning to dashboard to ensure data is fresh
            renderAllDashboardCharts();
        } else {
            // For other menu items: hide dashboard content, show iframe and load the external document.
            dashboardMainContent.classList.remove('active'); // Ensure dashboard is hidden
            
            const url = getModuleUrl(moduleName);
            if (url) {
                iframeWrapper.style.display = 'block'; // Make iframe wrapper visible
                iframeWrapper.classList.add('active'); // Add active class for CSS transitions
                iframeWrapper.classList.add('loading'); // Show spinner (if CSS for .loading exists)
                iframeContainer.src = url; // Set the iframe source
            } else {
                // If getModuleUrl returned empty string (e.g., for 'logout' or unknown module)
                iframeWrapper.classList.remove('loading'); // Hide spinner if it was shown
                // Do not show error message if it was a handled case like 'logout'
                if (moduleName !== 'logout') {
                    messageBox('Module Not Found', `The module for "${moduleName}" could not be loaded.`);
                }
            }
        }
    }

    // Add click listeners to all sidebar menu items
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const moduleName = this.getAttribute('data-module');
            if (moduleName === 'logout') {
                // Special handling for Log Out, which uses a confirmBox and doesn't load an iframe
                getModuleUrl(moduleName); // This will trigger the confirmBox
            } else {
                setActiveMenuItem(this); // Set active class on clicked item
                showModuleContent(moduleName); // Load content for the selected module
            }
        });
    });

    // Hide spinner when iframe content loads successfully
    if (iframeContainer) {
        iframeContainer.addEventListener('load', () => {
            iframeWrapper.classList.remove('loading');
            // Additional logic for cross-origin communication or iframe content manipulation can go here
        });

        // Handle iframe load errors
        iframeContainer.addEventListener('error', () => {
            iframeWrapper.classList.remove('loading');
            messageBox('Error', 'Could not load module content. Please check the module file path or content.');
        });
    }

    // --- Header Interactivity ---

    // Sidebar Toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Notifications Dropdown Toggle
    notificationsToggle.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from closing immediately
        notificationDropdown.classList.toggle('active');
        languageMenu.classList.remove('active'); // Close other dropdowns
    });

    // Language Dropdown Toggle
    languageToggle.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from closing immediately
        languageMenu.classList.toggle('active');
        notificationDropdown.classList.remove('active'); // Close other dropdowns
    });

    // Close dropdowns when clicking anywhere outside them
    document.addEventListener('click', (event) => {
        if (notificationDropdown && !notificationsToggle.contains(event.target) && !notificationDropdown.contains(event.target)) {
            notificationDropdown.classList.remove('active');
        }
        if (languageMenu && !languageToggle.contains(event.target) && !languageMenu.contains(event.target)) {
            languageMenu.classList.remove('active');
        }
    });

    // Theme Toggle (Dark/Light Mode)
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        // Save theme preference to localStorage for persistence
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
        // Re-render charts to update colors as they dynamically pick from CSS variables
        renderAllDashboardCharts();
    });

    // Apply saved theme on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // AI Assistant Modal Toggle (Initially hidden in CSS, shown on click)
    aiAssistantToggle.addEventListener('click', () => {
        aiAssistantModal.style.display = 'flex'; // Use flex to center the modal
        adjustChatWindowHeight(); // Adjust height when modal opens
    });

    aiAssistantCloseButton.addEventListener('click', () => {
        aiAssistantModal.style.display = 'none';
    });

    // Close AI modal if clicking outside its content
    window.addEventListener('click', (event) => {
        if (event.target === aiAssistantModal) {
            aiAssistantModal.style.display = 'none';
        }
    });

    // AI Assistant Chat Logic (Basic interaction with Gemini API)
    aiChatSendButton.addEventListener('click', sendAIChatMessage);
    aiChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendAIChatMessage();
        }
    });

    /**
     * Sends a user message to the AI assistant and displays the response.
     */
    async function sendAIChatMessage() {
        const userMessageText = aiChatInput.value.trim();
        if (userMessageText === '') return; // Don't send empty messages

        // Add user message to chat window
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user-message';
        userMessageDiv.textContent = userMessageText;
        aiChatMessages.appendChild(userMessageDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight; // Scroll to bottom

        aiChatInput.value = ''; // Clear input field

        // Simulate AI typing/thinking
        const aiTypingDiv = document.createElement('div');
        aiTypingDiv.className = 'message ai-message';
        aiTypingDiv.textContent = 'AI is thinking...';
        aiChatMessages.appendChild(aiTypingDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        // Prepare prompt for Gemini API
        const prompt = `User query: "${userMessageText}". Provide a concise, helpful response for a Dairy CRM dashboard AI assistant. You can answer questions about dairy farming, milk quality, business metrics, or general information. Keep it under 100 words.`;

        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        // IMPORTANT: In a production environment, NEVER expose your API key directly in client-side code.
        // Use a backend proxy to make API calls securely.
        const apiKey = ""; // Leave as empty string; Canvas runtime will inject the API key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();

            // Remove typing indicator if it's still there
            if (aiTypingDiv.parentNode === aiChatMessages) {
                aiChatMessages.removeChild(aiTypingDiv);
            }

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const aiResponseText = result.candidates[0].content.parts[0].text;
                const aiMessageDiv = document.createElement('div');
                aiMessageDiv.className = 'message ai-message';
                aiMessageDiv.textContent = aiResponseText;
                aiChatMessages.appendChild(aiMessageDiv);
            } else {
                // Fallback for unexpected response structure
                const aiMessageDiv = document.createElement('div');
                aiMessageDiv.className = 'message ai-message';
                aiMessageDiv.textContent = 'Sorry, I could not generate a response at this time due to an unexpected format.';
                aiChatMessages.appendChild(aiMessageDiv);
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            // Remove typing indicator on error
            if (aiTypingDiv.parentNode === aiChatMessages) {
                aiChatMessages.removeChild(aiTypingDiv);
            }
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.className = 'message ai-message error-message'; // Add error class for styling
            errorMessageDiv.textContent = `Error: ${error.message}. Please check your network or try again later.`;
            aiChatMessages.appendChild(errorMessageDiv);
        } finally {
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight; // Always scroll to bottom after response
        }
    }


    // --- Date Range Options Logic ---
    dateRangeButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove "active" class from all date range buttons and apply to the clicked one
            dateRangeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const selectedRange = this.getAttribute('data-range');
            if (selectedRange === 'custom') {
                customDateRangeDiv.style.display = 'flex'; // Show custom date input
                if (!flatpickrInstance) {
                    // Initialize Flatpickr only once
                    flatpickrInstance = flatpickr(dateRangeInput, {
                        mode: "range", // Allow selecting a date range
                        dateFormat: "Y-m-d", // Date format (e.g., 2024-01-31)
                        maxDate: "today", // Prevent selecting future dates
                        onChange: function(selectedDates, dateStr, instance) {
                            if (selectedDates.length === 2) {
                                console.log("Custom date range selected:", dateStr);
                                // In a real application, you would fetch and update data
                                // for KPIs and charts based on this selected date range.
                                renderAllDashboardCharts(); // Re-render charts with (new) data
                            }
                        }
                    });
                    // Open Flatpickr calendar automatically when custom is selected
                    flatpickrInstance.open();
                }
            } else {
                customDateRangeDiv.style.display = 'none'; // Hide custom date input
                if (flatpickrInstance) {
                    flatpickrInstance.destroy(); // Destroy Flatpickr instance if not needed
                    flatpickrInstance = null;
                }
                console.log("Selected predefined date range:", selectedRange);
                // In a real application, you would fetch and update data
                // for KPIs and charts based on this selected range (e.g., 'daily', 'weekly').
                renderAllDashboardCharts(); // Re-render charts with (new) data
            }
        });
    });

    // --- Chart.js Initialization and Rendering Functions ---

    /**
     * Destroys an existing Chart.js instance to prevent memory leaks and re-initialization errors.
     * @param {Chart} chartInstance - The Chart.js instance to destroy.
     * @returns {null} Always returns null after destroying the chart.
     */
    function destroyChart(chartInstance) {
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null; // Important to set to null
        }
        return chartInstance;
    }

    /**
     * Renders a mini doughnut chart for KPI cards.
     * @param {string} canvasId - The ID of the canvas element.
     * @param {number} value - The primary value (e.g., percentage).
     * @param {string} color - The color for the primary value.
     * @param {string} label - The label for the primary value.
     * @returns {Chart} The new Chart.js instance.
     */
    function renderMiniPieChart(canvasId, value, color, label) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.warn(`Canvas element with ID '${canvasId}' not found.`);
            return null;
        }

        // Destroy any existing chart on this canvas before creating a new one
        let chartInstance = Chart.getChart(canvasId);
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Get computed style for the 'remaining' color for the pie chart
        const chartBgLight = getComputedStyle(document.body).getPropertyValue('--background-color').trim(); // Using background-color for a light fill

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [label, 'Remaining'],
                datasets: [{
                    data: [value, 100 - value], // Assumes value is a percentage or score out of 100
                    backgroundColor: [color, chartBgLight], // Active color and light grey for remaining
                    borderColor: [color, chartBgLight],
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%', // Makes it a ring chart
                rotation: -90, // Start from top
                circumference: 180, // Half circle for KPI look
                plugins: {
                    legend: {
                        display: false // No legend needed for mini pies
                    },
                    tooltip: {
                        enabled: false // Disable tooltips for mini pies for cleaner look
                    }
                },
                elements: {
                    arc: {
                        hoverOffset: 0 // No hover effect
                    }
                }
            }
        });
    }

    /**
     * Fetches dummy data for charts. In a real app, this would be an API call.
     * @returns {object} Dummy data object.
     */
    function getDashboardData() {
        // In a real application, you'd fetch data based on the selected date range.
        // For now, it's static dummy data.
        const currentActiveDateRangeButton = document.querySelector('.date-options button.active');
        const selectedRange = currentActiveDateRangeButton ? currentActiveDateRangeButton.getAttribute('data-range') : 'daily'; // Default to daily

        console.log(`Fetching data for range: ${selectedRange}`);
        if (selectedRange === 'custom' && flatpickrInstance && flatpickrInstance.selectedDates.length === 2) {
            console.log("Custom range:", flatpickrInstance.selectedDates[0].toISOString().split('T')[0], "to", flatpickrInstance.selectedDates[1].toISOString().split('T')[0]);
            // Logic to fetch data for custom range would go here
        }

        return {
            milkProcurement: 75, // percentage of target
            salesRevenue: 85, // percentage of target
            activeFarmers: 90, // percentage of total registered
            distributors: 70, // percentage of target
            customerGrowth: 60, // percentage growth
            qualityMetrics: 95, // percentage passing quality checks
            environmentMetrics: 78, // percentage compliance/achievement
            employeeEngagement: 89, // percentage engagement score
            salesTrend: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                data: [65, 59, 80, 81, 56, 55, 40, 68, 72, 60, 82, 90] // Dummy sales data
            },
            salesPerformance: {
                labels: ['Product A', 'Product B', 'Product C', 'Product D'],
                data: [85, 55, 70, 95] // Dummy sales performance data
            },
            profitBreakdown: {
                dairy: 40,
                other: 30,
                costs: 30
            }
        };
    }

    /**
     * Renders all dashboard charts (KPIs, Sales Trend, Sales Performance, Profit Breakdown).
     * This function should be called whenever data needs to be refreshed or charts need to be redrawn.
     */
    function renderAllDashboardCharts() {
        const dummyData = getDashboardData(); // Get data based on current selections

        // Get computed style properties for dynamic chart colors
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
        const lightTextColor = getComputedStyle(document.body).getPropertyValue('--light-text-color').trim();
        const borderColor = getComputedStyle(document.body).getPropertyValue('--border-color').trim();
        const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color').trim();
        const accentColor = getComputedStyle(document.body).getPropertyValue('--accent-color').trim();
        const dangerColor = getComputedStyle(document.body).getPropertyValue('--danger-color').trim();
        const infoColor = getComputedStyle(document.body).getPropertyValue('--primary-color').trim(); // Use primary for info
        const warningColor = getComputedStyle(document.body).getPropertyValue('--warning-color').trim();
        // Using card background for point border color, assuming it's suitable (e.g., white in light, dark in dark)
        const cardBackground = getComputedStyle(document.body).getPropertyValue('--card-background').trim();

        // --- Render Mini KPI Charts ---
        milkProcurementPieChart = destroyChart(milkProcurementPieChart);
        milkProcurementPieChart = renderMiniPieChart('milkProcurementPie', dummyData.milkProcurement, '#4CAF50', 'Procured');

        salesRevenuePieChart = destroyChart(salesRevenuePieChart);
        salesRevenuePieChart = renderMiniPieChart('salesRevenuePie', dummyData.salesRevenue, '#FFC107', 'Revenue');

        activeFarmersPieChart = destroyChart(activeFarmersPieChart);
        activeFarmersPieChart = renderMiniPieChart('activeFarmersPie', dummyData.activeFarmers, '#3B82F6', 'Active');

        distributorsPieChart = destroyChart(distributorsPieChart);
        distributorsPieChart = renderMiniPieChart('distributorsPie', dummyData.distributors, '#8B5CF6', 'Active');

        customerGrowthPieChart = destroyChart(customerGrowthPieChart);
        customerGrowthPieChart = renderMiniPieChart('customerGrowthPie', dummyData.customerGrowth, '#F59E0B', 'Growth');

        qualityMetricsPieChart = destroyChart(qualityMetricsPieChart);
        qualityMetricsPieChart = renderMiniPieChart('qualityMetricsPie', dummyData.qualityMetrics, '#10B981', 'Quality');

        environmentMetricsPieChart = destroyChart(environmentMetricsPieChart);
        environmentMetricsPieChart = renderMiniPieChart('environmentMetricsPie', dummyData.environmentMetrics, '#34D399', 'Compliance');

        employeeEngagementPieChart = destroyChart(employeeEngagementPieChart);
        employeeEngagementPieChart = renderMiniPieChart('employeeEngagementPie', dummyData.employeeEngagement, '#1D4ED8', 'Engaged');


        // --- Render Sales Trend Chart (Line Chart) ---
        const salesTrendChartCtx = document.getElementById('salesTrendChart');
        if (salesTrendChartCtx) {
            salesTrendChart = destroyChart(salesTrendChart);
            salesTrendChart = new Chart(salesTrendChartCtx, {
                type: 'line',
                data: {
                    labels: dummyData.salesTrend.labels,
                    datasets: [{
                        label: 'Sales Revenue (₹)',
                        data: dummyData.salesTrend.data,
                        borderColor: primaryColor, // Consistent primary blue
                        backgroundColor: `rgba(${parseInt(primaryColor.slice(1,3), 16)}, ${parseInt(primaryColor.slice(3,5), 16)}, ${parseInt(primaryColor.slice(5,7), 16)}, 0.2)`, // Lighter fill for line chart area
                        fill: true,
                        tension: 0.4, // Smooth curves
                        pointRadius: 5,
                        pointBackgroundColor: primaryColor,
                        pointBorderColor: cardBackground, // Uses card background for border (adapts to theme)
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: primaryColor,
                        pointHoverBorderColor: cardBackground,
                        pointHitRadius: 10,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true, // Display legend for this chart
                            position: 'top',
                            labels: {
                                color: textColor // Legend text color
                            }
                        },
                        title: {
                            display: false,
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false }, // No vertical grid lines
                            ticks: { color: lightTextColor }, // X-axis label color
                            title: {
                                display: true,
                                text: 'Month',
                                color: lightTextColor // Title color
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: borderColor }, // Light horizontal grid lines
                            ticks: { color: lightTextColor }, // Y-axis label color
                            title: {
                                display: true,
                                text: 'Revenue (₹)',
                                color: lightTextColor // Title color
                            }
                        }
                    }
                }
            });
        }

        // --- Render Sales Performance Chart (Bar Chart) ---
        const salesPerformanceChartCtx = document.getElementById('salesPerformanceChart');
        if (salesPerformanceChartCtx) {
            salesPerformanceChart = destroyChart(salesPerformanceChart);
            salesPerformanceChart = new Chart(salesPerformanceChartCtx, {
                type: 'bar',
                data: {
                    labels: dummyData.salesPerformance.labels,
                    datasets: [{
                        label: 'Sales by Product', // Updated label
                        data: dummyData.salesPerformance.data,
                        backgroundColor: accentColor, // Consistent accent color
                        borderRadius: 5, // Rounded bars
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false, // No legend for this bar chart
                        },
                        title: {
                            display: false,
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: lightTextColor, font: { size: 14 } },
                            title: {
                                display: true,
                                text: 'Product Category',
                                color: lightTextColor
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: borderColor },
                            ticks: { color: lightTextColor, font: { size: 14 } },
                            title: {
                                display: true,
                                text: 'Performance Score',
                                color: lightTextColor
                            }
                        }
                    }
                }
            });
        }

        // --- Render Profit Breakdown Chart (Doughnut Chart) ---
        const profitBreakdownChartCtx = document.getElementById('profitBreakdownChart');
        if (profitBreakdownChartCtx) {
            profitBreakdownChart = destroyChart(profitBreakdownChart);
            profitBreakdownChart = new Chart(profitBreakdownChartCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Dairy Products', 'Other Products', 'Operational Costs'],
                    datasets: [{
                        label: 'Profit Share',
                        data: [dummyData.profitBreakdown.dairy, dummyData.profitBreakdown.other, dummyData.profitBreakdown.costs],
                        backgroundColor: [
                            dangerColor, // Reddish for Dairy Products
                            accentColor, // Greenish for Other Products
                            primaryColor  // Bluish for Operational Costs - using primary for consistency
                        ],
                        borderWidth: 0,
                        hoverOffset: 10 // Slight expansion on hover
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%', // Inner hole size
                    plugins: {
                        legend: {
                            display: false // Custom legend is provided in HTML
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += context.parsed + '%'; // Show percentage in tooltip
                                    }
                                    return label;
                                }
                            }
                        },
                        title: {
                            display: false,
                        }
                    }
                }
            });
        }
    }

    // Adjust chat window height dynamically (called when modal opens or window resizes)
    function adjustChatWindowHeight() {
        if (aiAssistantModal.style.display === 'flex') {
            const modalHeader = aiAssistantModal.querySelector('.modal-title');
            const chatInputArea = aiAssistantModal.querySelector('.chat-input-area');
            if (modalHeader && chatInputArea) {
                const modalHeight = aiAssistantModal.clientHeight; // Use clientHeight for visible height
                const headerHeight = modalHeader.offsetHeight;
                const inputAreaHeight = chatInputArea.offsetHeight;
                const paddingAndMargin = 80; // Estimate for modal padding and message gaps

                aiChatMessages.style.maxHeight = `${modalHeight - headerHeight - inputAreaHeight - paddingAndMargin}px`;
                aiChatMessages.scrollTop = aiChatMessages.scrollHeight; // Scroll to bottom
            }
        }
    }
    // Add resize listener for chat height adjustment
    window.addEventListener('resize', adjustChatWindowHeight);


    // --- Initializations on Load ---

    // Set the default active sidebar menu item to "Dashboard"
    const defaultActiveMenuItem = document.querySelector('.sidebar-menu .menu-item[data-module="dashboard"]');
    if (defaultActiveMenuItem) {
        setActiveMenuItem(defaultActiveMenuItem);
    }

    // Set 'Daily' as the initial active date range button
    const initialDailyButton = document.querySelector('.date-options button[data-range="daily"]');
    if (initialDailyButton) {
        initialDailyButton.classList.add('active');
    }

    // Initial render of all dashboard charts and set dashboard content as active
    // This needs to be called after other initial setups, like setting default active menu item.
    showModuleContent('dashboard');

    // Ensure AI assistant modal is initially hidden (controlled by CSS default `display: none;`)
    // The JavaScript only changes it to 'flex' on button click.
    if (aiAssistantModal) {
        aiAssistantModal.style.display = 'none';
    }
});
