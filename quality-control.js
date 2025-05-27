// quality-control.js
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const qcSections = document.querySelectorAll('.qc-section');
    const recentTestsList = document.getElementById('recent-tests-list');
    const complianceProgressBars = document.querySelectorAll('.progress');
    const standardsList = document.getElementById('standards-list');
    const openIssuesList = document.getElementById('open-issues-list');
    const investigatingIssuesList = document.getElementById('investigating-issues-list');
    const resolvedIssuesList = document.getElementById('resolved-issues-list');
    const frequentIssuesHeatmap = document.getElementById('frequent-issues-heatmap');
    const capaWizardModal = document.getElementById('capa-wizard-modal');
    const capaWizardCloseButton = capaWizardModal ? capaWizardModal.querySelector('.close-button') : null;
    const timeFilter = document.getElementById('time-filter');
    const productFilter = document.getElementById('product-filter');
    const regionFilter = document.getElementById('region-filter');
    const avgQualityScore = document.getElementById('avg-quality-score');
    const testsThisWeek = document.getElementById('tests-this-week');
    const complianceRate = document.getElementById('compliance-rate');
    const totalIssues = document.getElementById('total-issues');
    const qualityScoreTrendChartCanvas = document.getElementById('quality-score-trend-chart');
    const complianceBreakdownChartCanvas = document.getElementById('compliance-breakdown-chart');
    const supplierFilter = document.getElementById('supplier-filter');
    const ratingFilter = document.getElementById('rating-filter');
    const supplierGrid = document.getElementById('supplier-grid');
    const fabButton = document.querySelector('.fab');
    const notificationContainer = document.getElementById('notification-container');
    const timelineCalendarDiv = document.getElementById('timeline-calendar');
    const supplierQualityMapDiv = document.getElementById('supplier-quality-map');
    const autoAuditButton = document.querySelector('.compliance-overview .action-button');
    const voiceInputButton = document.querySelector('.voice-input-button');
    const qrScanButton = document.querySelector('.qr-scan-button');
    const saveResultButton = document.querySelector('#test-management-section .input-tools .action-button');
    const severitySlider = document.getElementById('severity-slider');
    const aiCAPAButton = document.querySelector('#issue-management-section .issue-insights .action-button');
    const exportButton = document.querySelector('.export-button');
    const draggableTestsContainer = document.getElementById('draggable-tests');
    const testTypeFilter = document.getElementById('test-type-filter');
    const complianceRadarChartCanvas = document.getElementById('compliance-radar-chart');
    const qualityTimelineSlider = document.getElementById('quality-timeline-slider');
    const aiCAPARecommendations = document.querySelector('#issue-management-section .issue-insights');
    //Standars and Compliance
    const complianceCardsContainer = document.querySelector('.compliance-cards-container');
    const initiateComplianceCheckButton = document.getElementById('initiate-compliance-check-button');
    const uploadComplianceDocumentButton = document.getElementById('upload-compliance-document-button');
    const configureAutoAuditsButton = document.getElementById('configure-auto-audits-button');
    const complianceTrendLineChartCanvas = document.getElementById('compliance-trend-line-chart');
    const nonComplianceReasonsBarChartCanvas = document.getElementById('non-compliance-reasons-bar-chart');


    // --- Local Storage Keys ---
    const ACTIVE_SECTION_KEY = 'qc_active_section';
    const RECENT_TESTS_KEY = 'qc_recent_tests';
    const STANDARD_STATUS_KEY = 'qc_standard_status';
    const OPEN_ISSUES_KEY = 'qc_open_issues';
    const INVESTIGATING_ISSUES_KEY = 'qc_investigating_issues';
    const RESOLVED_ISSUES_KEY = 'qc_resolved_issues';
    const ANALYTICS_FILTERS_KEY = 'qc_analytics_filters';
    const SUPPLIER_FILTER_KEY = 'qc_supplier_filter';
    const RATING_FILTER_KEY = 'qc_rating_filter';
    const SCHEDULED_TESTS_KEY = 'qc_scheduled_tests';

    // --- Data (Replace with your actual data fetching or generation) ---
    let initialRecentTests = loadFromLocalStorage(RECENT_TESTS_KEY) || [
        { name: 'Raw Milk Batch 1', result: 'Pass', date: '2025-04-16', type: 'raw-milk', performance: [85, 88, 92] },
        { name: 'Processing Stage A', result: 'Pass', date: '2025-04-15', type: 'processing', performance: [90, 91, 89] },
        { name: 'Finished Product X', result: 'Fail', date: '2025-04-14', type: 'finished-product', performance: [70, 75, 68] },
        { name: 'Raw Milk Batch 2', result: 'Pass', date: '2025-04-13', type: 'raw-milk', performance: [88, 90, 93] },
        { name: 'Processing Stage B', result: 'Pass', date: '2025-04-12', type: 'processing', performance: [92, 93, 91] },
    ];

    let initialStandardStatus = loadFromLocalStorage(STANDARD_STATUS_KEY) || {
        'FSSAI Regulations': { compliant: true, details: ['Hygiene Standards', 'Labeling Requirements'], pending: ['Testing Protocols'] },
        'ISO 22000:2018': { compliant: ['Food Safety Management System'], nonCompliant: ['Hazard Analysis', 'Preventive Measures'] },
        'HACCP Guidelines': { pending: ['Conducting Hazard Analysis', 'Establishing CCPs'], compliant: ['Monitoring Procedures'] },
    };
    saveToLocalStorage(STANDARD_STATUS_KEY, initialStandardStatus); // Ensure initial data is saved

    let initialOpenIssues = loadFromLocalStorage(OPEN_ISSUES_KEY) || [
        { id: 1, title: 'High Bacteria Count in Batch Y', severity: 4, status: 'open', timestamp: new Date() },
    ];

    let initialInvestigatingIssues = loadFromLocalStorage(INVESTIGATING_ISSUES_KEY) || [
        { id: 2, title: 'Packaging Leakage Issue', severity: 3, status: 'investigating', timestamp: new Date(Date.now() - 86400000) },
    ];

    let initialResolvedIssues = loadFromLocalStorage(RESOLVED_ISSUES_KEY) || [
        { id: 3, title: 'Temperature Control Malfunction (Fixed)', severity: 5, status: 'resolved', timestamp: new Date(Date.now() - 2 * 86400000) },
    ];

    const initialAnalyticsFilters = loadFromLocalStorage(ANALYTICS_FILTERS_KEY) || {
        time: 'all',
        product: '',
        region: '',
    };

    const initialSuppliers = [
        { id: 101, name: 'Supplier Alpha', rating: 'excellent', lastBatches: ['B1', 'B3', 'B5', 'B7', 'B9'], qualityTrend: [90, 92, 95, 93, 96], location: { lat: 12.9716, lng: 77.5946 } },
        { id: 102, name: 'Supplier Beta', rating: 'moderate', lastBatches: ['C2', 'C5', 'C8', 'C11', 'C14'], qualityTrend: [85, 80, 82, 88, 83], location: { lat: 13.0827, lng: 80.2707 } },
        { id: 103, name: 'Supplier Gamma', rating: 'poor', lastBatches: ['D1', 'D3', 'D5', 'D7', 'D9'], qualityTrend: [70, 75, 68, 72, 78], location: { lat: 18.5204, lng: 73.8567 } },
        { id: 104, name: 'Supplier Delta', rating: 'excellent', lastBatches: ['E2', 'E4', 'E6', 'E8', 'E10'], qualityTrend: [94, 91, 97, 95, 98], location: { lat: 28.6139, lng: 77.2090 } },
    ];

    let scheduledTests = loadFromLocalStorage(SCHEDULED_TESTS_KEY) || [
        { id: 'test-1', title: 'Raw Milk Test', start: '2025-04-20', type: 'raw-milk' },
        { id: 'test-2', title: 'Processing Check', start: '2025-04-22', type: 'processing' },
        { id: 'test-3', title: 'Final Product QC', start: '2025-04-25', type: 'finished-product' },
    ];

    // --- Helper Functions ---
    function saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to local storage:', e);
        }
    }

    function loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading from local storage:', e);
            return null;
        }
    }

    function showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.classList.add('notification-toast', type);
        notification.textContent = message;
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }

    // --- Navigation ---
    function showSection(sectionId) {
        qcSections.forEach(section => section.classList.remove('active'));
        navButtons.forEach(button => button.classList.remove('active'));
        const targetSection = document.getElementById(`${sectionId}-section`);
        const targetButton = Array.from(navButtons).find(button => button.dataset.section === sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        if (targetButton) {
            targetButton.classList.add('active');
        }
        localStorage.setItem(ACTIVE_SECTION_KEY, sectionId);
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.dataset.section;
            showSection(sectionId);
        });
    });

    const activeSection = localStorage.getItem(ACTIVE_SECTION_KEY) || 'test-management';
    showSection(activeSection);

    // --- Test Management ---
    // Interactive Timeline Calendar
// --- Test Management ---
// Interactive Timeline Calendar
let calendar;

function saveScheduledTests() {
    saveToLocalStorage(SCHEDULED_TESTS_KEY, scheduledTests);
}

function handleScheduleCompletion(event) {
    const completedEvent = event.detail;
    if (completedEvent?.id && completedEvent.result) {
        const scheduledTest = scheduledTests.find(test => test.id === completedEvent.id);
        if (scheduledTest) {
            const newRecentTest = {
                name: scheduledTest.title,
                result: completedEvent.result,
                date: new Date().toISOString().split('T')[0],
                type: scheduledTest.type,
                performance: completedEvent.performance || [],
            };
            initialRecentTests.unshift(newRecentTest);
            saveToLocalStorage(RECENT_TESTS_KEY, initialRecentTests);
            renderRecentTests();
            scheduledTests = scheduledTests.filter(test => test.id !== completedEvent.id);
            saveScheduledTests();
            calendar.getEventById(completedEvent.id)?.remove();
            showNotification(`Test "${newRecentTest.name}" completed with result: ${newRecentTest.result}`, 'success');
            renderTimelineCalendar();
        }
    }
}
document.addEventListener('testScheduledCompleted', handleScheduleCompletion);

function renderTimelineCalendar(filterType = 'all') {
    if (!timelineCalendarDiv) return;
    timelineCalendarDiv.innerHTML = '';

    if (typeof FullCalendar !== 'undefined') {
        calendar = new FullCalendar.Calendar(timelineCalendarDiv, {
            initialView: 'dayGridMonth',
            height: 500,
            events: scheduledTests.filter(test => filterType === 'all' || test.type === filterType).map(test => {
                const recentTest = initialRecentTests.find(rt => rt.name === test.title && new Date(rt.date).toISOString().split('T')[0] === test.start);
                let backgroundColor = '';
                let statusClass = '';
                let trend = '';

                if (recentTest) {
                    backgroundColor = recentTest.result === 'Pass' ? 'green' : recentTest.result === 'Fail' ? 'red' : 'yellow';
                    statusClass = recentTest.result === 'Pass' ? 'pass' : recentTest.result === 'Fail' ? 'fail' : 'pending';
                    // Trend logic can be added here
                } else {
                    statusClass = 'pending';
                }

                return {
                    id: test.id,
                    title: `${test.title} ${trend}`,
                    start: test.start,
                    backgroundColor: backgroundColor,
                    borderColor: backgroundColor,
                    className: `test-type-${test.type?.replace(' ', '-') || 'general'}`,
                    eventContent: (arg) => ({ html: `<div class="event-content"><span class="status-indicator ${statusClass}"></span>${arg.event.title}</div>` }),
                };
            }),
            editable: true,
            droppable: true,
            eventDrop: (info) => {
                const movedEvent = scheduledTests.find(test => test.id === info.event.id);
                if (movedEvent) {
                    movedEvent.start = info.event.startStr;
                    saveScheduledTests();
                    showNotification(`Test "${info.event.title}" rescheduled to ${info.event.startStr}`, 'info');
                }
            },
            // eventResize: (info) => { /* Implement resizing logic if needed */ },
            drop: (info) => {
                const testName = prompt('Enter test name:');
                const testType = info.draggedEl.dataset.type || 'general';
                if (testName) {
                    const newTest = {
                        id: 'test-' + Date.now(),
                        title: testName,
                        start: info.dateStr,
                        type: testType,
                    };
                    scheduledTests.push(newTest);
                    calendar.addEvent(newTest);
                    saveScheduledTests();
                    showNotification(`"${testName}" (${testType}) scheduled for ${info.dateStr}`, 'success');
                }
                info.draggedEl.remove();
            },
            selectable: true,
            select: (info) => {
                const testName = prompt('Enter test name:');
                const testTypeOptions = ['raw-milk', 'processing', 'finished-product'];
                const testType = prompt(`Enter test type:\n${testTypeOptions.join('\n')}`) || 'general';
                if (testName) {
                    const newTest = {
                        id: 'test-' + Date.now(),
                        title: testName,
                        start: info.startStr,
                        type: testType.toLowerCase().replace(' ', '-'),
                    };
                    scheduledTests.push(newTest);
                    calendar.addEvent(newTest);
                    saveScheduledTests();
                    showNotification(`"${testName}" (${testType}) scheduled for ${info.startStr}`, 'success');
                }
                calendar.unselect();
            },
            eventClick: (info) => {
                const scheduledTest = scheduledTests.find(test => test.id === info.event.id);
                if (scheduledTest) {
                    const eventDate = new Date(info.event.startStr);
                    const currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0);

                    if (eventDate > currentDate) {
                        showNotification('Cannot provide results for future tests.', 'warning');
                    } else {
                        const result = prompt(`Enter result for "${scheduledTest.title}" (Pass/Fail):`);
                        if (result) {
                            const performanceData = prompt('Enter performance data (comma-separated numbers, optional):')?.split(',').map(Number).filter(Number);
                            const completionDetails = {
                                id: scheduledTest.id,
                                result: result.toLowerCase() === 'pass' ? 'Pass' : 'Fail',
                                performance: performanceData,
                            };
                            document.dispatchEvent(new CustomEvent('testScheduledCompleted', { detail: completionDetails }));
                        }
                    }
                }
            },
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            }
        });
        calendar.render();
    } else {
        console.error('FullCalendar library not loaded.');
        timelineCalendarDiv.innerHTML = '<p class="error">FullCalendar library not loaded. Please ensure it is included in your HTML.</p>';
    }
}

function renderCalendarSuggestions() {
    const suggestionsContainer = document.getElementById('calendar-suggestions');
    if (!suggestionsContainer) return;
    suggestionsContainer.innerHTML = '';

    const createSuggestionCard = (title, icon, items) => {
        if (items.length > 0) {
            const card = document.createElement('div');
            card.classList.add('suggestion-card');
            card.innerHTML = `<h4><span class="material-symbols-outlined">${icon}</span> ${title}</h4><ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
            suggestionsContainer.appendChild(card);
        }
    };

    // Upcoming Tests
    const upcomingTests = scheduledTests.filter(test => new Date(test.start) > new Date()).slice(0, 3).map(test => `${test.title} (${test.start})`);
    createSuggestionCard('Upcoming Tests', 'schedule', upcomingTests);

    // Overdue Schedules
    const overdueTests = scheduledTests.filter(test => new Date(test.start) < new Date() && !initialRecentTests.some(rt => rt.name === test.title && new Date(rt.start).toDateString() === new Date(rt.date).toDateString())).slice(0, 3).map(test => `${test.title} (${test.start})`);
    createSuggestionCard('Overdue Schedules', 'event_busy', overdueTests);

    // Retesting Recommendations
    const failedRecentTests = initialRecentTests.filter(test => test.result === 'Fail');
    if (failedRecentTests.length > 0) {
        const retestCard = document.createElement('div');
        retestCard.classList.add('suggestion-card');
        retestCard.innerHTML = `
            <h4><span class="material-symbols-outlined">refresh</span> Retesting Needed</h4>
            <ul id="retesting-list">
                ${failedRecentTests.map(test => `<li data-test-name="${test.name}">${test.name}</li>`).join('')}
            </ul>
            <div class="action-buttons">
                <button class="retest-button" id="schedule-retest-btn">Schedule Retest</button>
                <button class="compliance-log-button" id="view-log-btn">View Log</button>
            </div>
        `;
        suggestionsContainer.appendChild(retestCard);

        const scheduleRetestBtn = document.getElementById('schedule-retest-btn');
        const viewLogBtn = document.getElementById('view-log-btn');

        scheduleRetestBtn?.addEventListener('click', () => {
            const selectedTestName = prompt('Enter the name of the test you want to reschedule:');
            if (selectedTestName) {
                // Implement your logic to find the test and reschedule it
                showNotification(`Reschedule initiated for "${selectedTestName}"`, 'info');
            }
        });

        viewLogBtn?.addEventListener('click', () => {
            const selectedTestName = prompt('Enter the name of the test log you want to view:');
            if (selectedTestName) {
                // Implement your logic to find and display the log
                showNotification(`View log requested for "${selectedTestName}"`, 'info');
            }
        });
    }
}

// Call this function after rendering the calendar and initial data
renderTimelineCalendar();
renderCalendarSuggestions();

const suggestionsContainer = document.getElementById('calendar-suggestions');
if (suggestionsContainer) {
    suggestionsContainer.style.overflowY = '';
    suggestionsContainer.style.maxHeight = '';
    suggestionsContainer.style.scrollbarWidth = '';
    suggestionsContainer.style['-ms-overflow-style'] = '';
}

const styleToRemove = document.querySelector('style[textContent*="#calendar-suggestions::-webkit-scrollbar"]');
styleToRemove?.parentNode?.removeChild(styleToRemove);

    // Draggable Test Types
    if (draggableTestsContainer) {
        const testTypes = ['Raw Milk', 'Processing', 'Finished Product'];
        testTypes.forEach(type => {
            const dragItem = document.createElement('div');
            dragItem.classList.add('draggable-test');
            dragItem.textContent = `Schedule ${type} Test`;
            dragItem.dataset.type = type.toLowerCase().replace(' ', '-');
            dragItem.draggable = true;
            dragItem.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('text/plain', event.target.textContent);
                event.dataTransfer.setData('application/type', event.target.dataset.type);
            });
            draggableTestsContainer.appendChild(dragItem);
        });
    }

    // Filter by Test Type
    if (testTypeFilter) {
        // Add "All" option to the top of the filter dropdown if it doesn't exist
                if (!testTypeFilter.querySelector('option[value="all"]')) {
                        const allOption = document.createElement('option');
                        allOption.value = 'all';
                        allOption.textContent = 'All';
                        testTypeFilter.insertBefore(allOption, testTypeFilter.firstChild); // Insert at the beginning
                        testTypeFilter.value = 'all'; // Set default to All
                    }
            
                    testTypeFilter.addEventListener('change', () => {
                        renderRecentTests(testTypeFilter.value);
                        renderTimelineCalendar(testTypeFilter.value); // Re-render calendar with filter
                    });
                }

function renderRecentTests(filterType = '') {
        if (!recentTestsList) return;
        recentTestsList.innerHTML = '';
        const filteredTests = filterType
            ? initialRecentTests.filter(test => test.type === filterType)
            : initialRecentTests;
        const visibleTests = filteredTests.slice(0, 10); // Show only the first 10
        visibleTests.forEach(test => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
            <div class="test-info">
                <strong>${test.name}</strong>
                <span>Result: ${test.result}</span>
                <span>Date: ${test.date}</span>
                <span>Type: ${test.type}</span>
            </div>
            <div class="micro-chart" data-performance="${test.performance ? test.performance.join(',') : ''}"></div>
        `;
                    recentTestsList.appendChild(listItem);
        });

        // Apply styling for an invisible scrolling container
        recentTestsList.style.maxHeight = '300px'; /* Adjust as needed to fit 5 items */
        recentTestsList.style.overflowY = 'auto';
        recentTestsList.style.scrollbarWidth = 'none'; /* Firefox */
        recentTestsList.style['-ms-overflow-style'] = 'none'; /* IE and Edge */

        // Webkit (Chrome, Safari) - Target the scrollbar track and thumb to make them invisible
        const style = document.createElement('style');
        style.textContent = `
            #recent-tests-list::-webkit-scrollbar {
                width: 0px;
                background: transparent; /* Optional: make track transparent too */
            }
            #recent-tests-list::-webkit-scrollbar-thumb {
                background: transparent;
            }
        `;
        document.head.appendChild(style);

        saveToLocalStorage(RECENT_TESTS_KEY, initialRecentTests);
        renderMicroCharts();
    }

    function renderMicroCharts() {
    const microCharts = document.querySelectorAll('.micro-chart');
    console.log('Number of .micro-chart elements found:', microCharts.length); // Check if any elements are selected
    microCharts.forEach(chartDiv => {
        const performanceData = chartDiv.dataset.performance ? chartDiv.dataset.performance.split(',').map(Number) : [];
        console.log('performanceData for chartDiv:', performanceData); // Check the data for each chart
        chartDiv.innerHTML = ''; // Clear any existing content
        if (performanceData.length > 0) {
            const maxVal = Math.max(...performanceData);
            const minVal = Math.min(...performanceData);
            console.log('maxVal:', maxVal, 'minVal:', minVal); // Check max and min
            const widthFactor = 20; // Adjust for width
            performanceData.forEach((val, index) => {
                // Handle the case where maxVal === minVal
                const normalizedHeight = maxVal === minVal ? 5 : ((val - minVal) / (maxVal - minVal)) * 15 + 5; // Normalize to 5-20px, default to 5 if max=min
                console.log('val:', val, 'normalizedHeight:', normalizedHeight); // Check calculated height
                const bar = document.createElement('div');
                bar.style.width = `${widthFactor}px`;
                bar.style.height = `${normalizedHeight}px`;
                bar.style.backgroundColor = '#3498db';
                bar.style.display = 'inline-block';
                bar.style.marginRight = '2px';
                chartDiv.appendChild(bar);
            });
        } else {
            console.log('performanceData is empty for this chartDiv'); // Log when no data
        }
    });
}

    renderRecentTests();

    // Voice to Text (Placeholder)
    if (voiceInputButton) {
        voiceInputButton.addEventListener('click', () => {
            alert('Voice inputfunctionality (not yet implemented)');
        });
    }
    // QR Code Scan (Placeholder)
    if (qrScanButton) {
        qrScanButton.addEventListener('click', () => {
            alert('QR code scan functionality (not yet implemented)');
        });
    }

    // Quick Log Result
    if (saveResultButton) {
        saveResultButton.addEventListener('click', () => {
            const quickResultLog = document.getElementById('quick-result-log');
            if (quickResultLog) {
                const log = quickResultLog.value;
                if (log) {
                    const newTest = {
                        name: 'Quick Logged Result',
                        result: log.includes('Pass') ? 'Pass' : 'Fail',
                        date: new Date().toISOString().split('T')[0],
                        type: 'quick-log',
                        performance: log.includes('Pass') ? [90] : [60], // Example performance
                    };
                    initialRecentTests.unshift(newTest); // Add to the beginning
                    saveToLocalStorage(RECENT_TESTS_KEY, initialRecentTests);
                    renderRecentTests();
                    showNotification(`Result logged: ${log}`, 'success');
                    quickResultLog.value = '';
                    // In a real app, you'd process and store this result more formally
                } else {
                    showNotification('Please enter a result to log.', 'warning');
                }
            } else {
                console.error('Element with ID "quick-result-log" not found.');
            }
        });
    }

    // --- Standards & Compliance ---
    function renderComplianceCards() {
        if (!complianceCardsContainer) return;
        complianceCardsContainer.innerHTML = ''; // Clear existing cards

        Object.keys(initialStandardStatus).forEach(standardName => {
            const status = initialStandardStatus[standardName];
            const card = document.createElement('div');
            card.classList.add('compliance-card');

            const isCompliant = status.compliant && status.compliant.length > 0 && (!status.nonCompliant || status.nonCompliant.length === 0) && (!status.pending || status.pending.length === 0);
            const isNonCompliant = status.nonCompliant && status.nonCompliant.length > 0;
            const isPending = status.pending && status.pending.length > 0 && !isCompliant;

            let statusClass = isCompliant ? 'compliant' : isNonCompliant ? 'non-compliant' : isPending ? 'pending' : '';
            let overallCompliancePercent = calculateOverallCompliance(status);

            card.innerHTML = `
                <div class="card-header">
                    <span class="card-title">${standardName}</span>
                    <span class="status-indicator ${statusClass}"></span>
                </div>
                <div class="card-body">
                    <div class="compliance-metric">
                        <span class="metric-label">Overall Compliance:</span>
                        <span class="metric-value">${overallCompliancePercent}%</span>
                    </div>
                    <div class="compliance-details">
                        ${status.compliant ? status.compliant.map(detail => `<div class="detail-item compliant">${detail} <span class="material-symbols-outlined">check_circle</span></div>`).join('') : ''}
                        ${status.nonCompliant ? status.nonCompliant.map(detail => `<div class="detail-item non-compliant">${detail} <span class="material-symbols-outlined">error</span></div>`).join('') : ''}
                        ${status.pending ? status.pending.map(detail => `<div class="detail-item pending">${detail} <span class="material-symbols-outlined">warning</span></div>`).join('') : ''}
                    </div>
                    <button class="view-details-button" data-standard="${standardName}">View Details</button>
                </div>
            `;
            complianceCardsContainer.appendChild(card);
        });

        // Re-attach event listeners to the newly rendered buttons
        const newViewDetailsButtons = document.querySelectorAll('.compliance-card .view-details-button');
        newViewDetailsButtons.forEach(button => {
            button.addEventListener('click', handleViewDetails);
        });
    }

    function calculateOverallCompliance(status) {
        let total = 0;
        let compliantCount = 0;
        if (status.compliant) {
            compliantCount += status.compliant.length;
            total += status.compliant.length;
        }
        if (status.nonCompliant) {
            total += status.nonCompliant.length;
        }
        if (status.pending) {
            total += status.pending.length;
        }
        return total > 0 ? Math.round((compliantCount / total) * 100) : 0;
    }

    function handleViewDetails(event) {
        const standardName = event.target.dataset.standard;
        const details = initialStandardStatus[standardName];
        if (details) {
            let message = `Details for ${standardName}:\n`;
            if (details.compliant) message += `Compliant: ${details.compliant.join(', ')}\n`;
            if (details.nonCompliant) message += `Non-Compliant: ${details.nonCompliant.join(', ')}\n`;
            if (details.pending) message += `Pending: ${details.pending.join(', ')}\n`;
            alert(message); // Replace with a more user-friendly display (e.g., a modal)
        } else {
            alert(`No details found for ${standardName}`);
        }
    }

    function handleInitiateComplianceCheck() {
        // Logic to initiate a compliance check
        // This might involve:
        // 1. Displaying a modal or form to start a new check.
        // 2. Making an API call to trigger a backend process.
        // 3. Updating the UI to reflect the ongoing check.
        alert('Initiating compliance check process...');
        // Example: Display a simple prompt for now
        const checkName = prompt('Enter a name for this compliance check:');
        if (checkName) {
            showNotification(`Compliance check "${checkName}" initiated.`, 'info');
            // In a real application, you would likely send this data to a server
            console.log('Compliance check initiated:', checkName);
            // You might also want to update some state or UI here
        } else {
            showNotification('Compliance check initiation cancelled.', 'warning');
        }
    }

    function handleUploadComplianceDocument() {
        // Logic for handling file uploads
        // This typically involves:
        // 1. Creating an <input type="file"> element programmatically.
        // 2. Attaching an event listener to handle file selection.
        // 3. Potentially using the FileReader API to read the file content or FormData to send it to a server.
        alert('Opening file upload dialog...');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                showNotification(`Selected file: ${file.name}`, 'success');
                console.log('Selected file:', file);
                // Here you would implement the actual file upload logic,
                // possibly using FormData to send the file to a server.
                // Example using FormData (requires backend endpoint):
                /*
                const formData = new FormData();
                formData.append('complianceDocument', file);
                fetch('/api/upload-compliance', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    showNotification('File uploaded successfully!', 'success');
                    console.log('Upload response:', data);
                    // Update UI as needed
                })
                .catch(error => {
                    showNotification('Error uploading file.', 'error');
                    console.error('Upload error:', error);
                });
                */
            } else {
                showNotification('No file selected.', 'warning');
            }
        });
        fileInput.click(); // Programmatically trigger the file selection dialog
    }

    function handleConfigureAutoAudits() {
        // Logic to navigate to auto-audit settings
        // This could involve:
        // 1. Redirecting the user to a specific URL or section of the application.
        // 2. Displaying a modal with configuration options.
        alert('Navigating to auto-audit settings...');
        // Example: If you have a dedicated section for auto-audits, you might change the displayed section:
        // showSection('auto-audit-settings');

        // For now, let's just display a notification:
        showNotification('Navigating to auto-audit settings page (not fully implemented).', 'info');

        // In a real application, you might have a specific UI element or route for this:
        // window.location.href = '/settings/auto-audits';
        // Or, if it's within the same page:
        // const autoAuditSection = document.getElementById('auto-audit-settings-section');
        // if (autoAuditSection) {
        //     qcSections.forEach(section => section.classList.remove('active'));
        //     autoAuditSection.classList.add('active');
        //     navButtons.forEach(button => button.classList.remove('active'));
        //     const settingsButton = Array.from(navButtons).find(button => button.dataset.section === 'settings'); // Assuming you have a settings button
        //     if (settingsButton) settingsButton.classList.add('active');
        //     localStorage.setItem(ACTIVE_SECTION_KEY, 'settings');
        // }
    }

    function updateComplianceTrendsChart() {
        if (complianceTrendLineChartCanvas) {
            const ctx = complianceTrendLineChartCanvas.getContext('2d');
            const now = new Date();
            const labels = [];
            const complianceRates = {}; // Store compliance rate per standard
    
            Object.keys(initialStandardStatus).forEach(standard => {
                complianceRates[standard] = [];
            });
    
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7)); // Weekly data
                labels.push(date.toLocaleDateString().substring(0, 7)); // Shorter date format
                Object.keys(initialStandardStatus).forEach(standard => {
                    // Simulate very small compliance rates for visibility
                    const baseCompliance = Math.random() * 2;
                    complianceRates[standard].push(baseCompliance);
                });
            }
    
            const datasets = Object.keys(initialStandardStatus).map((standard, index) => ({
                label: standard.substring(0, 10), // Shorter legend names
                data: complianceRates[standard],
                backgroundColor: getColorByIndex(index), // Use consistent colors, bar chart
                borderColor: getColorByIndex(index),
                borderWidth: 1,
            }));
    
            new Chart(ctx, {
                type: 'bar', // Change to bar chart
                data: {
                    labels: labels,
                    datasets: datasets,
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 2, // Small range for visibility
                            title: {
                                display: true,
                                text: 'Compliance (%)'
                            },
                            ticks: {
                                stepSize: 0.5,
                            },
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Week'
                            },
                            ticks: {
                                autoSkip: false,
                                maxRotation: 0, // Horizontal labels
                                minRotation: 0,
                                align: 'center',
                            },
                        },
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Compliance Trends Over Time',
                            font: {
                                size: 14, // Adjust font size for card
                            },
                            padding: {
                                bottom: 10,
                            },
                        },
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12, // Adjust legend box size for card
                                fontSize: 10, // Adjust legend font size for card
                            },
                        },
                    },
                },
            });
        }
    }
    
    function updateNonComplianceReasonsChart() {
        if (nonComplianceReasonsBarChartCanvas) {
            const ctx = nonComplianceReasonsBarChartCanvas.getContext('2d');
    
            // Dummy data for non-compliance reasons with small values
            const nonComplianceReasons = {
                'Lack Train': 1.5,
                'Equip Malf': 0.8,
                'Proc Devi': 1.2,
                'Docu Err': 0.5,
                'Raw Mat Iss': 1.8,
            };
    
            const labels = Object.keys(nonComplianceReasons);
            const data = Object.values(nonComplianceReasons);
            const backgroundColors = labels.map((_, index) => getColorByIndex(index)); // Use consistent colors
    
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Occurrences', // Shorter label
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: backgroundColors,
                        borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 2, // Small range for visibility
                            title: {
                                display: true,
                                text: 'Occurrences'
                            },
                            ticks: {
                                stepSize: 0.5, // Small steps
                            },
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Reason' // Shorter title
                            },
                            ticks: {
                                autoSkip: false, // Prevent overlapping
                                maxRotation: 0, // Horizontal labels
                                minRotation: 0,
                                align: 'center',
                            },
                        },
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Reasons for Non-Compliance',
                            font: {
                                size: 14, // Adjust font size for card
                            },
                            padding: {
                                bottom: 10,
                            },
                        },
                        legend: {
                            display: false,
                        },
                    },
                },
            });
        }
    }
    
    // Helper function to get a consistent color based on index
    const COLORS = [
        '#4ac9c6', '#1976d2', '#00bcd4', '#4caf50', '#ff9800',
        '#f44336', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
        '#03a9f4', '#009688', '#8bc34a', '#cddc39', '#ffeb3b',
        '#ffc107', '#ff5722', '#795548', '#9e9e9e', '#607d8b'
    ];
    
    function getColorByIndex(index) {
        return COLORS[index % COLORS.length];
    }

    // Initial rendering and attaching listeners
    renderComplianceCards();
    if (initiateComplianceCheckButton) {
        initiateComplianceCheckButton.addEventListener('click', handleInitiateComplianceCheck);
    }
    if (uploadComplianceDocumentButton) {
        uploadComplianceDocumentButton.addEventListener('click', handleUploadComplianceDocument);
    }
    if (configureAutoAuditsButton) {
        configureAutoAuditsButton.addEventListener('click', handleConfigureAutoAudits);
    }
    updateComplianceTrendsChart();
    updateNonComplianceReasonsChart();
    
    // --- Issue Management ---
    function initializeIssueManagement() {
        const severitySlider = document.getElementById('severity-slider');
        const reportNewIssueButton = document.querySelector('#issue-management-section .issue-controls .action-button');
        const openIssuesList = document.getElementById('open-issues-list');
        const investigatingIssuesList = document.getElementById('investigating-issues-list');
        const resolvedIssuesList = document.getElementById('resolved-issues-list');
        const frequentIssuesHeatmap = document.getElementById('frequent-issues-heatmap');
        const capaWizardModal = document.getElementById('capa-wizard-modal');
        const aiCAPAButton = document.querySelector('#issue-management-section .issue-insights .action-button');
    
        if (severitySlider) {
            severitySlider.addEventListener('change', handleSeverityChange);
        }
    
        // Add "All" option to the severity slider
        if (severitySlider) {
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = 'All';
            severitySlider.insertBefore(allOption, severitySlider.firstChild);
            severitySlider.value = 'all'; // Set default to All
        }
    
        if (reportNewIssueButton) {
            reportNewIssueButton.addEventListener('click', reportNewIssue);
        }
    
        renderInitialIssues();
    
        if (openIssuesList) {
            openIssuesList.addEventListener('dragover', allowDrop);
            openIssuesList.addEventListener('drop', handleDrop);
        }
        if (investigatingIssuesList) {
            investigatingIssuesList.addEventListener('dragover', allowDrop);
            investigatingIssuesList.addEventListener('drop', handleDrop);
        }
        if (resolvedIssuesList) {
            resolvedIssuesList.addEventListener('dragover', allowDrop);
            resolvedIssuesList.addEventListener('drop', handleDrop);
        }
    
        initializeCAPAWizardModal();
        renderFrequentIssuesHeatmap();
        renderAICAPARecommendation();
    
        let draggedIssueId = null;
    
        function handleSeverityChange() {
            console.log('Issue Severity Filter:', severitySlider.value);
            renderInitialIssues();
        }
    
        function reportNewIssue() {
            const issueTitle = prompt('Enter the title of the new issue:');
            if (issueTitle) {
                const issueSeverityText = prompt(`Select issue severity:\nLow\nMinor\nMedium\nHigh\nCritical`);
                let severityValue;
                let severityDisplay;
    
                switch (issueSeverityText ? issueSeverityText.toLowerCase() : '') {
                    case 'low':
                        severityValue = 1;
                        severityDisplay = 'Low';
                        break;
                    case 'minor':
                        severityValue = 2;
                        severityDisplay = 'Minor';
                        break;
                    case 'medium':
                        severityValue = 3;
                        severityDisplay = 'Medium';
                        break;
                    case 'high':
                        severityValue = 4;
                        severityDisplay = 'High';
                        break;
                    case 'critical':
                        severityValue = 5;
                        severityDisplay = 'Critical';
                        break;
                    default:
                        severityValue = NaN;
                        severityDisplay = issueSeverityText;
                        break;
                }
    
                if (!isNaN(severityValue) && severityValue >= 1 && severityValue <= 5) {
                    const newIssue = {
                        id: Date.now(),
                        title: issueTitle,
                        severity: severityValue,
                        status: 'open',
                        timestamp: new Date(),
                    };
                    initialOpenIssues.unshift(newIssue);
                    saveToLocalStorage(OPEN_ISSUES_KEY, initialOpenIssues.filter(i => i.status === 'open'));
                    renderIssues(initialOpenIssues, openIssuesList, 'open');
                    showNotification(`Issue "${issueTitle}" reported with severity ${severityDisplay}`, 'success');
                } else {
                    showNotification(`Invalid severity level: "${severityDisplay}". Please enter Low, Minor, Medium, High, or Critical.`, 'warning');
                }
            }
        }
    
        function renderInitialIssues() {
            const severityFilter = severitySlider.value;
            renderIssues(initialOpenIssues, openIssuesList, 'open', severityFilter);
            renderIssues(initialInvestigatingIssues, investigatingIssuesList, 'investigating', severityFilter);
            renderIssues(initialResolvedIssues, resolvedIssuesList, 'resolved', severityFilter);
        }
    
        function renderIssues(issues, listElement, status, severityFilter = 'all') {
            if (!listElement) return;
            listElement.innerHTML = '';
            issues
                .filter(issue => issue.status === status)
                .filter(issue => severityFilter === 'all' || issue.severity.toString() === severityFilter)
                .forEach(issue => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${issue.title} (Severity: ${getSeverityText(issue.severity)})`;
                    listItem.draggable = true;
                    listItem.dataset.issueId = issue.id;
                    listItem.dataset.issueStatus = issue.status;
                    listItem.addEventListener('dragstart', dragStart);
                    updateIssueItemStyle(listItem, issue.status);
                    listElement.appendChild(listItem);
                });
        }
    
        function getSeverityText(severity) {
            switch (severity) {
                case 1: return 'Low';
                case 2: return 'Minor';
                case 3: return 'Medium';
                case 4: return 'High';
                case 5: return 'Critical';
                default: return '';
            }
        }
    
        function updateIssueItemStyle(item, status) {
            item.classList.remove('status-open', 'status-investigating', 'status-resolved');
            item.classList.add(`status-${status}`);
        }
    
        function dragStart(event) {
            draggedIssueId = event.target.dataset.issueId;
        }
    
        function allowDrop(event) {
            event.preventDefault();
        }
    
        function handleDrop(event) {
            event.preventDefault();
            const targetList = event.target.closest('.issue-list');
    
            if (draggedIssueId && targetList) {
                const newStatus = targetList.id.replace('-issues-list', '');
                let draggedItem;
    
                // Find the dragged item in the DOM
                [openIssuesList, investigatingIssuesList, resolvedIssuesList].forEach(list => {
                    const item = list.querySelector(`[data-issue-id="${draggedIssueId}"]`);
                    if (item) {
                        draggedItem = item;
                    }
                });
    
                if (draggedItem) {
                    const originalStatus = draggedItem.dataset.issueStatus;
    
                    if (originalStatus !== newStatus) {
                        targetList.appendChild(draggedItem);
                        draggedItem.dataset.issueStatus = newStatus;
                        updateIssueStatusInData(draggedIssueId, newStatus);
                        saveIssueDataToLocalStorage();
                        updateIssueItemStyle(draggedItem, newStatus); // Update color immediately
                    }
                }
                draggedIssueId = null;
            }
        }
    
        function updateIssueStatusInData(issueId, newStatus) {
            [initialOpenIssues, initialInvestigatingIssues, initialResolvedIssues].forEach(issueArray => {
                issueArray.forEach(issue => {
                    if (issue.id && issue.id.toString() === issueId) {
                        issue.status = newStatus;
                        issue.timestamp = new Date();
                    }
                });
            });
        }
    
        function saveIssueDataToLocalStorage() {
            saveToLocalStorage(OPEN_ISSUES_KEY, initialOpenIssues.filter(i => i.status === 'open'));
            saveToLocalStorage(INVESTIGATING_ISSUES_KEY, initialInvestigatingIssues.filter(i => i.status === 'investigating'));
            saveToLocalStorage(RESOLVED_ISSUES_KEY, initialResolvedIssues.filter(i => i.status === 'resolved'));
        }
    
        function initializeCAPAWizardModal() {
            const capaWizardCloseButton = capaWizardModal ? capaWizardModal.querySelector('.close-button') : null;
            if (capaWizardCloseButton) {
                capaWizardCloseButton.addEventListener('click', () => {
                    if (capaWizardModal) {
                        capaWizardModal.style.display = 'none';
                    }
                });
            }
    
            if (aiCAPAButton && capaWizardModal) {
                aiCAPAButton.addEventListener('click', () => {
                    capaWizardModal.style.display = 'block';
                    capaWizardModal.querySelector('.modal-content').innerHTML = `
                        <h3>CAPA Wizard</h3>
                        <p>Step 1: Identify Root Cause (Placeholder)</p>
                        <p>Step 2: Define Corrective Action (Placeholder)</p>
                        <p>Step 3: Define Preventive Action (Placeholder)</p>
                        <p>Step 4: Implementation & Verification (Placeholder)</p>
                        <button class="close-button"><span class="material-symbols-outlined">close</span></button>
                    `;
                    const wizardCloseButton = capaWizardModal.querySelector('.close-button');
                    if (wizardCloseButton) {
                        wizardCloseButton.addEventListener('click', () => {
                            capaWizardModal.style.display = 'none';
                        });
                    }
                });
            }
    
            window.addEventListener('click', (event) => {
                if (capaWizardModal && event.target === capaWizardModal) {
                    capaWizardModal.style.display = 'none';
                }
            });
        }
    
        function renderFrequentIssuesHeatmap() {
            if (frequentIssuesHeatmap) {
                frequentIssuesHeatmap.innerHTML = 'Frequent Issues Heatmap (AI-based analysis - not yet implemented)';
            }
        }
    
        function renderAICAPARecommendation() {
            if (aiCAPARecommendations) {
                const recommendationDiv = document.createElement('div');
                recommendationDiv.innerHTML = '<p><strong>AI CAPA Recommendation:</strong> Based on similar past issues, consider checking [specific component] and [specific process]. (Simulated)</p>';
                aiCAPARecommendations.appendChild(recommendationDiv);
            }
        }
    }
    
    // Call this function to initialize the issue management functionality
    initializeIssueManagement();
    // --- Reporting & Analytics ---
    let currentAnalyticsFilters = initialAnalyticsFilters;

    function applyAnalyticsFilters() {
        if (!timeFilter || !productFilter || !regionFilter) return;
        currentAnalyticsFilters = {
            time: timeFilter.value,
            product: productFilter.value,
            region: regionFilter.value,
        };
        saveToLocalStorage(ANALYTICS_FILTERS_KEY, currentAnalyticsFilters);
        // In a real application, you would fetch and re-render data based on these filters
        console.log('Applied Filters:', currentAnalyticsFilters);
        updateAnalyticsData();
    }

    if (timeFilter) timeFilter.value = currentAnalyticsFilters.time;
    if (productFilter) productFilter.value = currentAnalyticsFilters.product;
    if (regionFilter) regionFilter.value = currentAnalyticsFilters.region;

    if (timeFilter) timeFilter.addEventListener('change', applyAnalyticsFilters);
    if (productFilter) productFilter.addEventListener('change', applyAnalyticsFilters);
    if (regionFilter) regionFilter.addEventListener('change', applyAnalyticsFilters);

    function updateAnalyticsData() {
        if (!avgQualityScore || !testsThisWeek || !complianceRate || !totalIssues) return;
        avgQualityScore.textContent = '88%';
        testsThisWeek.textContent = '35';
        complianceRate.textContent = '91%';
        totalIssues.textContent = initialOpenIssues.length + initialInvestigatingIssues.length + initialResolvedIssues.length;
        renderQualityScoreTrendChart();
        renderComplianceBreakdownChart();
        // AI Trend Detector (Simulated)
        const trendMessage = Math.random() < 0.3 ? 'AI Alert: Potential dip in Raw Milk quality detected based on recent trends. Investigate suppliers in [Region].' : '';
        if (trendMessage) {
            showNotification(trendMessage, 'warning', 5000);
        }
    }
    updateAnalyticsData();

    function renderQualityScoreTrendChart() {
        if (qualityScoreTrendChartCanvas) {
            const ctx = qualityScoreTrendChartCanvas.getContext('2d');
            const now = new Date();
            const labels = [];
            const data = [];
            for (let i = 11; i >= 0; i--) {
                const month = new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleString('default', { month: 'short' });
                labels.push(month);
                // Replace with your actual monthly quality score data
                data.push(Math.floor(Math.random() * (95 - 80 + 1)) + 80);
            }

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Average Quality Score',
                        data: data,
                        borderColor: '#3498db',
                        fill: false,
                        tension: 0.1,
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Score (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Month'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }
    }

    function renderComplianceBreakdownChart() {
        if (complianceBreakdownChartCanvas) {
            const ctx = complianceBreakdownChartCanvas.getContext('2d');
            const compliantCount = Object.values(initialStandardStatus).filter(v => v).length;
            const nonCompliantCount = Object.keys(initialStandardStatus).length - compliantCount;
            const data = {
                labels: ['Compliant Standards', 'Non-Compliant Standards'],
                datasets: [{
                    data: [compliantCount, nonCompliantCount],
                    backgroundColor: ['#2ecc71', '#e74c3c'],
                }]
            };
            new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    elements: {
                        arc: {
                            cutoutPercentage: 70 // Adjust this value (0-100)
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }
    }

    // Export Functionality (Placeholder)
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            alert('Exporting data (PDF/Excel/Email - not yet implemented)');
        });
    }

    // --- Supplier Quality Monitoring ---
    let currentSupplierFilter = loadFromLocalStorage(SUPPLIER_FILTER_KEY) || '';
    let currentRatingFilter = loadFromLocalStorage(RATING_FILTER_KEY) || '';

    function renderSuppliers() {
        if (!supplierGrid) return;
        supplierGrid.innerHTML = '';
        const filteredSuppliers = initialSuppliers.filter(supplier => {
            const supplierMatch = !currentSupplierFilter || supplier.name.toLowerCase().includes(currentSupplierFilter.toLowerCase());
            const ratingMatch = !currentRatingFilter || supplier.rating === currentRatingFilter;
            return supplierMatch && ratingMatch;
        });

        filteredSuppliers.forEach(supplier => {
            const card = document.createElement('div');
            card.classList.add('supplier-card');
            card.innerHTML = `
            <h4>${supplier.name}</h4>
            <div class="supplier-ratings">
                <span class="${supplier.rating}">${supplier.rating ? supplier.rating.toUpperCase() : ''}</span>
            </div>
            <p>Last Batches: ${supplier.lastBatches ? supplier.lastBatches.join(', ') : ''}</p>
            <div class="quality-trend-graph" data-trend="${supplier.qualityTrend ? supplier.qualityTrend.join(',') : ''}"></div>
        `;
            supplierGrid.appendChild(card);
            const trendGraph = card.querySelector('.quality-trend-graph');
            if (trendGraph && supplier.qualityTrend) {
                renderSupplierTrendGraph(trendGraph, supplier.qualityTrend);
            }
        });
    }

    function renderSupplierTrendGraph(container, data) {
        if (!container) return;
        const maxVal = Math.max(...data);
        const minVal = Math.min(...data);
        let sparklineHTML = '';
        const widthFactor = 15;
        const heightFactor = 1;
        data.forEach((val, index) => {
            const normalizedHeight = ((val - minVal) / (maxVal - minVal)) * 30 + 5;
            sparklineHTML += `<div style="width:${widthFactor}px; height:${normalizedHeight}px; background-color:#27ae60; display:inline-block; margin-right:2px;"></div>`;
        });
        container.innerHTML = sparklineHTML;
    }

    function populateSupplierFilter() {
        if (!supplierFilter) return;
        const uniqueSuppliers = [...new Set(initialSuppliers.map(s => s.name))];
        uniqueSuppliers.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            supplierFilter.appendChild(option);
        });
        supplierFilter.value = currentSupplierFilter;
    }
    populateSupplierFilter();

    if (supplierFilter) {
        supplierFilter.addEventListener('change', () => {
            currentSupplierFilter = supplierFilter.value;
            saveToLocalStorage(SUPPLIER_FILTER_KEY, currentSupplierFilter);
            renderSuppliers();
        });
    }

    if (ratingFilter) {
        ratingFilter.value = currentRatingFilter;
        ratingFilter.addEventListener('change', () => {
            currentRatingFilter = ratingFilter.value;
            saveToLocalStorage(RATING_FILTER_KEY, currentRatingFilter);
            renderSuppliers();
        });
    }

    renderSuppliers();

    // Map View (Leaflet Implementation Placeholder)
    if (supplierQualityMapDiv) {
        supplierQualityMapDiv.innerHTML = '<div id="map" style="height: 300px;"></div>';
        if (typeof L !== 'undefined') {
            const map = L.map('map').setView([20.5937, 78.9629], 4); // Center of India, zoom level 4
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            initialSuppliers.forEach(supplier => {
                if (supplier.location && supplier.location.lat && supplier.location.lng) {
                    let color = 'green';
                    if (supplier.rating === 'moderate') color = 'yellow';
                    if (supplier.rating === 'poor') color = 'red';
                    const marker = L.marker([supplier.location.lat, supplier.location.lng]).addTo(map);
                    marker.bindPopup(`<b>${supplier.name}</b><br>Rating: ${supplier.rating ? supplier.rating.toUpperCase() : ''}<br>Last Batches: ${supplier.lastBatches ? supplier.lastBatches.join(', ') : ''}`);
                }
            });
        } else {
            supplierQualityMapDiv.innerHTML = 'Map library (Leaflet) not loaded.';
        }
    }

    // Quality Timeline Slider (Placeholder)
    if (qualityTimelineSlider) {
        qualityTimelineSlider.innerHTML = 'Quality Timeline Slider (Visual batch performance - not yet implemented)';
    }

    // --- Floating Action Button (FAB) ---
    if (fabButton) {
        fabButton.addEventListener('click', () => {
            // Example actions - you can expand this with a menu or modal
            alert('Quick Actions: (Not fully implemented) Add Test | Report Issue');
        });
    }

    // --- Notification System ---
    function showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.classList.add('notification-toast', type);
        notification.textContent = message;
        if (notificationContainer) {
            notificationContainer.appendChild(notification);
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }
    }

    // Example notification
    // setTimeout(() => showNotification('Dashboard loaded!', 'success'), 1500);

    // --- Local Storage Helper Functions ---
    function saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to local storage:', error);
            showNotification('Error saving data locally.', 'error');
        }
    }

    function loadFromLocalStorage(key) {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : null;
        } catch (error) {
            console.error('Error loading from local storage:', error);
            showNotification('Error loading data locally.', 'error');
            return null;
        }
    }
});