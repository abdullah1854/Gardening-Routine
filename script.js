// Siwan Kitchen Garden - Smart Garden Care Scheduler
// Complete Data Model with Gap-Based Conflict Resolution

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered:', registration.scope);
            })
            .catch((error) => {
                console.log('SW registration failed:', error);
            });
    });
}

const routineItems = [
    {
        name: "Mustard Cake Water",
        frequency: 30,
        offset: 0,
        type: "fertilizer",
        description: "Soak 24-48 hrs, dilute 1:3. Use on wet soil only.",
        conflictsWith: [],
        conflictGaps: { "Neem Khali": 12, "Organic Iron Dust": 10, "Paecilomyces lilacinus": 8 },
        warning: "Keep 10-15 days gap from Neem Khali"
    },
    {
        name: "Seaweed Extract",
        frequency: 30,
        offset: 7,
        type: "supplement",
        description: "Foliar spray or root drench (5-10ml/L). Growth hormones & micronutrients.",
        conflictsWith: [],
        conflictGaps: {}
    },
    {
        name: "Compost / Vermicompost",
        frequency: 30,
        offset: 14,
        type: "soil",
        description: "Mix 2-3 handfuls into top soil. Water afterwards.",
        conflictsWith: [],
        conflictGaps: {}
    },
    {
        name: "PROM Granules",
        frequency: 60,
        offset: 21,
        type: "fertilizer",
        description: "Mix into soil. Phosphate-rich organic manure for flowering/fruiting.",
        conflictsWith: [],
        conflictGaps: { "Organic Iron Dust": 10 }
    },
    {
        name: "Neem Khali",
        frequency: 60,
        offset: 51,
        type: "soil",
        description: "Soil application for nematodes/fungus. Mix into top 1-2 inches.",
        conflictsWith: [],
        conflictGaps: { "Mustard Cake Water": 12, "Paecilomyces lilacinus": 5 },
        warning: "Keep 10-15 days gap from Mustard Cake Water"
    },
    {
        name: "Bone Meal",
        frequency: 90,
        offset: 81,
        type: "supplement",
        description: "1-2 Tbsp mixed into soil. Slow-release phosphorus. Use if required.",
        conflictsWith: [],
        conflictGaps: { "Organic Iron Dust": 10 }
    },
    {
        name: "Neem Oil Spray",
        frequency: 7,
        offset: 2,
        type: "pest",
        description: "Spray in evening. 5ml/L + liquid soap. Covers both leaf sides.",
        conflictsWith: ["Paecilomyces lilacinus", "Trichoderma"],
        conflictGaps: {}
    },
    {
        name: "Epsom Salt Spray",
        frequency: 30,
        offset: 10,
        type: "supplement",
        description: "Foliar spray (1 tbsp/L). Magnesium for lush green foliage.",
        conflictsWith: ["Neem Oil Spray"],
        conflictGaps: { "Organic Iron Dust": 7 },
        warning: "Keep 7-day gap from Iron application"
    },
    {
        name: "Organic Iron Dust",
        frequency: 45,
        offset: 25,
        type: "supplement",
        description: "Treats chlorosis. Soil or foliar application.",
        conflictsWith: [],
        conflictGaps: {
            "Epsom Salt Spray": 7,
            "Trichoderma": 7,
            "Paecilomyces lilacinus": 7,
            "Mustard Cake Water": 10,
            "PROM Granules": 10,
            "Bone Meal": 10
        },
        warning: "Requires gaps from many items - check schedule"
    },
    {
        name: "Paecilomyces lilacinus",
        frequency: 45,
        offset: 35,
        type: "soil",
        description: "Nematode bio-control. Apply to moist soil, not foliage.",
        conflictsWith: ["Neem Oil Spray"],
        conflictGaps: { "Organic Iron Dust": 7, "Mustard Cake Water": 8, "Neem Khali": 5 },
        warning: "Keep 5-7 days gap from Iron, 7-10 days from Mustard Cake"
    },
    {
        name: "Trichoderma",
        frequency: 45,
        offset: 40,
        type: "soil",
        description: "Beneficial fungi for soil health. Improves disease resistance.",
        conflictsWith: ["Neem Oil Spray"],
        conflictGaps: { "Organic Iron Dust": 7 },
        warning: "Keep 5-7 days gap from Iron"
    }
];

// Icon SVGs for each type
const typeIcons = {
    fertilizer: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    pest: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    soil: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    supplement: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>'
};

// Global state
let allGeneratedEvents = [];
let conflictsResolved = 0;
let currentView = 'list';
const STORAGE_KEY = 'gardenSchedulerPrefs';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load preferences
    loadPreferences();

    // Initialize UI components
    initTheme();
    initSettingsPanel();
    initFilters();
    initCollapsibles();
    initKeyboardShortcuts();
    initModals();
    initViewToggle();

    // Bind event listeners
    bindEventListeners();

    // Generate initial schedule
    generateSchedule();
}

function bindEventListeners() {
    const startDateInput = document.getElementById('start-date');
    const durationSelect = document.getElementById('duration');
    const generateBtn = document.getElementById('generate-btn');
    const printBtn = document.getElementById('print-btn');
    const todayBtn = document.getElementById('today-btn');
    const exportBtn = document.getElementById('export-btn');

    generateBtn.addEventListener('click', () => {
        generateSchedule();
        showToast('Schedule generated successfully!', 'success');
    });

    printBtn.addEventListener('click', () => window.print());

    todayBtn.addEventListener('click', () => {
        startDateInput.valueAsDate = new Date();
        generateSchedule();
        showToast('Start date set to today', 'info');
    });

    exportBtn.addEventListener('click', exportToICS);

    startDateInput.addEventListener('change', generateSchedule);
    durationSelect.addEventListener('change', generateSchedule);
}

// Theme Management
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`, 'info');
    });
}

// Settings Panel
function initSettingsPanel() {
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsPanel = document.getElementById('settings-panel');

    settingsToggle.addEventListener('click', () => {
        settingsToggle.classList.toggle('active');
        settingsPanel.classList.toggle('open');
    });
}

// Filters
function initFilters() {
    const filterCheckboxes = document.querySelectorAll('[data-filter]');

    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            applyFilters();
            savePreferences();
        });
    });
}

function applyFilters() {
    const filters = {};
    document.querySelectorAll('[data-filter]').forEach(cb => {
        filters[cb.dataset.filter] = cb.checked;
    });

    let visibleCount = 0;
    document.querySelectorAll('.event-card').forEach(card => {
        const type = card.dataset.type;
        const isVisible = filters[type];
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });

    // Hide empty months
    document.querySelectorAll('.month-block').forEach(block => {
        const visibleEvents = block.querySelectorAll('.event-card:not([style*="display: none"])').length;
        block.style.display = visibleEvents === 0 ? 'none' : '';
    });

    // Show/hide empty state
    const emptyState = document.getElementById('empty-state');
    const listView = document.getElementById('list-view');

    if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
        listView.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listView.classList.remove('hidden');
    }
}

// Collapsible Sections
function initCollapsibles() {
    const collapsibleHeaders = document.querySelectorAll('.card-header.clickable');

    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', !isExpanded);

            const content = header.nextElementSibling;
            if (content) {
                content.classList.toggle('collapsed');
            }
        });
    });
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = e.key.toLowerCase();

        switch (key) {
            case 't':
                document.getElementById('today-btn').click();
                break;
            case 'g':
                document.getElementById('generate-btn').click();
                break;
            case 's':
                document.getElementById('settings-toggle').click();
                break;
            case 'd':
                document.getElementById('theme-toggle').click();
                break;
            case 'e':
                document.getElementById('export-btn').click();
                break;
            case 'p':
                window.print();
                break;
            case '?':
                toggleModal('shortcuts-modal');
                break;
            case 'escape':
                closeAllModals();
                closeSettingsPanel();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                toggleFilter(parseInt(key) - 1);
                break;
        }
    });
}

function toggleFilter(index) {
    const filters = document.querySelectorAll('[data-filter]');
    if (filters[index]) {
        filters[index].checked = !filters[index].checked;
        applyFilters();
        savePreferences();
    }
}

// Modals
function initModals() {
    const keyboardHint = document.getElementById('keyboard-hint');
    const shortcutsModal = document.getElementById('shortcuts-modal');

    keyboardHint.addEventListener('click', () => {
        toggleModal('shortcuts-modal');
    });

    // Close modal on overlay click
    shortcutsModal.addEventListener('click', (e) => {
        if (e.target === shortcutsModal) {
            closeModal('shortcuts-modal');
        }
    });

    // Close button
    const closeBtn = shortcutsModal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        closeModal('shortcuts-modal');
    });
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.toggle('hidden');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.add('hidden');
    });
}

function closeSettingsPanel() {
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsPanel = document.getElementById('settings-panel');
    settingsToggle.classList.remove('active');
    settingsPanel.classList.remove('open');
}

// View Toggle
function initViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            setView(view);
        });
    });
}

function setView(view) {
    currentView = view;

    // Update buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update views
    const listView = document.getElementById('list-view');
    const calendarView = document.getElementById('calendar-view');

    if (view === 'list') {
        listView.classList.remove('hidden');
        calendarView.classList.add('hidden');
    } else {
        listView.classList.add('hidden');
        calendarView.classList.remove('hidden');
        renderCalendarView();
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconSvg = type === 'success'
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
        : type === 'error'
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

    toast.innerHTML = `
        <span class="toast-icon">${iconSvg}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });

    // Auto remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Preferences
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function loadPreferences() {
    const startDateInput = document.getElementById('start-date');
    const durationSelect = document.getElementById('duration');
    const todayStr = getTodayDateString();

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const prefs = JSON.parse(saved);
            if (prefs.startDate) {
                startDateInput.value = prefs.startDate;
            } else {
                startDateInput.value = todayStr;
            }
            if (prefs.duration) {
                durationSelect.value = prefs.duration;
            }
            if (prefs.filters) {
                Object.entries(prefs.filters).forEach(([type, checked]) => {
                    const cb = document.querySelector(`[data-filter="${type}"]`);
                    if (cb) cb.checked = checked;
                });
            }
        } catch (e) {
            startDateInput.value = todayStr;
        }
    } else {
        startDateInput.value = todayStr;
    }
}

function savePreferences() {
    const prefs = {
        startDate: document.getElementById('start-date').value,
        duration: document.getElementById('duration').value,
        filters: {}
    };

    document.querySelectorAll('[data-filter]').forEach(cb => {
        prefs.filters[cb.dataset.filter] = cb.checked;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

// Schedule Generation
function getConstraintScore(item) {
    const gapCount = Object.keys(item.conflictGaps || {}).length;
    const conflictCount = (item.conflictsWith || []).length;
    return gapCount * 2 + conflictCount;
}

function hasGapConflict(event, dateMap, proposedDate) {
    const eventGaps = event.conflictGaps || {};

    for (const [conflictName, gapDays] of Object.entries(eventGaps)) {
        for (let dayOffset = -gapDays; dayOffset <= gapDays; dayOffset++) {
            const checkDate = new Date(proposedDate);
            checkDate.setDate(checkDate.getDate() + dayOffset);
            const dateStr = checkDate.toDateString();

            const existingEvents = dateMap.get(dateStr) || [];
            for (const existing of existingEvents) {
                if (existing.name === conflictName) {
                    return {
                        hasConflict: true,
                        conflictWith: conflictName,
                        gap: gapDays,
                        actualGap: Math.abs(dayOffset)
                    };
                }
            }
        }
    }

    for (const [dateStr, events] of dateMap.entries()) {
        for (const existing of events) {
            const existingGaps = existing.conflictGaps || {};
            if (existingGaps[event.name]) {
                const requiredGap = existingGaps[event.name];
                const existingDate = new Date(dateStr);
                const daysDiff = Math.abs(
                    Math.floor((proposedDate - existingDate) / (1000 * 60 * 60 * 24))
                );
                if (daysDiff < requiredGap) {
                    return {
                        hasConflict: true,
                        conflictWith: existing.name,
                        gap: requiredGap,
                        actualGap: daysDiff
                    };
                }
            }
        }
    }

    const sameDayEvents = dateMap.get(proposedDate.toDateString()) || [];
    for (const existing of sameDayEvents) {
        if ((event.conflictsWith || []).includes(existing.name) ||
            (existing.conflictsWith || []).includes(event.name)) {
            return { hasConflict: true, conflictWith: existing.name, gap: 0 };
        }
    }

    return { hasConflict: false };
}

function generateSchedule() {
    const startDate = new Date(document.getElementById('start-date').value);
    const duration = parseInt(document.getElementById('duration').value);

    const scheduleContainer = document.getElementById('schedule-container');
    scheduleContainer.innerHTML = '';

    conflictsResolved = 0;

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);

    const sortedItems = [...routineItems].sort(
        (a, b) => getConstraintScore(b) - getConstraintScore(a)
    );

    let allEvents = [];

    sortedItems.forEach(item => {
        let currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + item.offset);

        while (currentDate < endDate) {
            allEvents.push({
                date: new Date(currentDate),
                ...item
            });
            currentDate.setDate(currentDate.getDate() + item.frequency);
        }
    });

    allEvents.sort((a, b) => a.date - b.date);

    const resolvedEvents = [];
    const dateMap = new Map();

    allEvents.forEach(event => {
        let eventDate = new Date(event.date);
        let attempts = 0;
        let placed = false;

        while (!placed && attempts < 20) {
            const conflictResult = hasGapConflict(event, dateMap, eventDate);

            if (!conflictResult.hasConflict) {
                const dateStr = eventDate.toDateString();
                if (!dateMap.has(dateStr)) {
                    dateMap.set(dateStr, []);
                }
                dateMap.get(dateStr).push(event);
                event.date = new Date(eventDate);
                event.wasRescheduled = attempts > 0;
                resolvedEvents.push(event);
                placed = true;

                if (attempts > 0) {
                    conflictsResolved++;
                }
            } else {
                eventDate.setDate(eventDate.getDate() + 1);
                attempts++;
            }
        }

        if (!placed) {
            const dateStr = eventDate.toDateString();
            if (!dateMap.has(dateStr)) {
                dateMap.set(dateStr, []);
            }
            dateMap.get(dateStr).push(event);
            event.date = new Date(eventDate);
            event.wasRescheduled = true;
            event.forceScheduled = true;
            resolvedEvents.push(event);
        }
    });

    allGeneratedEvents = resolvedEvents;

    renderSchedule(resolvedEvents);
    updateStats(resolvedEvents);
    updateFilterCounts(resolvedEvents);
    applyFilters();
    markTodayEvents();
    updateNextTask(resolvedEvents);
    renderHeatmap(resolvedEvents, startDate, duration);
    renderInsights(resolvedEvents);
    savePreferences();
}

function renderSchedule(resolvedEvents) {
    const scheduleContainer = document.getElementById('schedule-container');

    const eventsByMonth = {};
    resolvedEvents.sort((a, b) => a.date - b.date);

    resolvedEvents.forEach(event => {
        const monthKey = event.date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!eventsByMonth[monthKey]) {
            eventsByMonth[monthKey] = [];
        }
        eventsByMonth[monthKey].push(event);
    });

    let monthIndex = 0;
    for (const [month, events] of Object.entries(eventsByMonth)) {
        const monthBlock = document.createElement('div');
        monthBlock.className = 'month-block';
        monthBlock.style.animationDelay = `${monthIndex * 50}ms`;

        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';

        const monthTitle = document.createElement('h2');
        monthTitle.textContent = month;

        const eventCount = document.createElement('span');
        eventCount.className = 'event-count';
        eventCount.textContent = `${events.length} tasks`;

        monthHeader.appendChild(monthTitle);
        monthHeader.appendChild(eventCount);
        monthBlock.appendChild(monthHeader);

        const eventList = document.createElement('div');
        eventList.className = 'event-list';

        events.forEach((event, eventIndex) => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.dataset.type = event.type;
            eventCard.dataset.date = event.date.toISOString();
            eventCard.style.animationDelay = `${eventIndex * 30}ms`;

            // Date column
            const dateCol = document.createElement('div');
            dateCol.className = 'event-date-col';

            const dayNum = document.createElement('span');
            dayNum.className = 'day-num';
            dayNum.textContent = event.date.getDate();

            const monthShort = document.createElement('span');
            monthShort.className = 'month-short';
            monthShort.textContent = event.date.toLocaleString('default', { month: 'short' });

            const weekday = document.createElement('span');
            weekday.className = 'weekday';
            weekday.textContent = event.date.toLocaleString('default', { weekday: 'short' });

            dateCol.appendChild(dayNum);
            dateCol.appendChild(monthShort);
            dateCol.appendChild(weekday);

            // Content column
            const contentBox = document.createElement('div');
            contentBox.className = `event-content type-${event.type}`;

            // Meta row
            const metaRow = document.createElement('div');
            metaRow.className = 'event-meta';

            const typeBadge = document.createElement('span');
            typeBadge.className = `type-badge badge-${event.type}`;
            typeBadge.innerHTML = `${typeIcons[event.type]} ${getTypeLabel(event.type)}`;

            const freqLabel = document.createElement('span');
            freqLabel.className = 'freq-label';
            freqLabel.textContent = `Every ${event.frequency} days`;

            metaRow.appendChild(typeBadge);
            metaRow.appendChild(freqLabel);

            const title = document.createElement('h3');
            title.textContent = event.name;

            const desc = document.createElement('p');
            desc.textContent = event.description;

            contentBox.appendChild(metaRow);
            contentBox.appendChild(title);
            contentBox.appendChild(desc);

            if (event.warning) {
                const warning = document.createElement('div');
                warning.className = 'warning-box';
                warning.innerHTML = `<span class="warning-icon">!</span> ${event.warning}`;
                contentBox.appendChild(warning);
            }

            if (event.wasRescheduled) {
                const rescheduled = document.createElement('div');
                rescheduled.className = 'rescheduled-badge';
                rescheduled.textContent = event.forceScheduled ? 'Forced' : 'Rescheduled';
                contentBox.appendChild(rescheduled);
            }

            eventCard.appendChild(dateCol);
            eventCard.appendChild(contentBox);
            eventList.appendChild(eventCard);
        });

        monthBlock.appendChild(eventList);
        scheduleContainer.appendChild(monthBlock);
        monthIndex++;
    }
}

function getTypeLabel(type) {
    const labels = {
        fertilizer: 'Fertilizer',
        pest: 'Pest Control',
        soil: 'Soil Health',
        supplement: 'Supplement'
    };
    return labels[type] || type;
}

function updateStats(events) {
    document.getElementById('total-events').textContent = events.length;
    document.getElementById('conflicts-resolved').textContent = conflictsResolved;
}

function updateFilterCounts(events) {
    const counts = { fertilizer: 0, pest: 0, soil: 0, supplement: 0 };

    events.forEach(event => {
        counts[event.type]++;
    });

    Object.entries(counts).forEach(([type, count]) => {
        const countEl = document.getElementById(`count-${type}`);
        if (countEl) {
            countEl.textContent = count;
        }
    });
}

function markTodayEvents() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    document.querySelectorAll('.event-card').forEach(card => {
        const eventDate = new Date(card.dataset.date);
        const eventStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;

        if (eventStr === todayStr) {
            card.classList.add('is-today');
        }
    });
}

function updateNextTask(events) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const today = new Date(todayStr + 'T00:00:00');

    const futureEvents = events
        .filter(e => {
            const eventDate = new Date(e.date);
            const eventStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
            return eventStr >= todayStr;
        })
        .sort((a, b) => a.date - b.date);

    const nextTask = futureEvents[0];
    const nameEl = document.getElementById('next-task-name');
    const dateEl = document.getElementById('next-task-date');

    if (nextTask) {
        nameEl.textContent = nextTask.name;

        const eventDate = new Date(nextTask.date);
        const eventStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;

        if (eventStr === todayStr) {
            dateEl.textContent = 'Today';
        } else {
            const eventDay = new Date(eventStr + 'T00:00:00');
            const diffDays = Math.round((eventDay - today) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                dateEl.textContent = 'Tomorrow';
            } else {
                dateEl.textContent = `In ${diffDays} days`;
            }
        }
    } else {
        nameEl.textContent = 'No upcoming tasks';
        dateEl.textContent = '';
    }
}

// Heatmap
function renderHeatmap(events, startDate, durationMonths) {
    const heatmapContainer = document.getElementById('calendar-heatmap');
    heatmapContainer.innerHTML = '';

    const eventCounts = {};
    events.forEach(event => {
        const dateStr = event.date.toDateString();
        eventCounts[dateStr] = (eventCounts[dateStr] || 0) + 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Show 8 weeks of heatmap
    const weeksToShow = 8;
    const daysToShow = weeksToShow * 7;

    const currentDate = new Date(startDate);

    for (let i = 0; i < daysToShow; i++) {
        const day = document.createElement('div');
        day.className = 'heatmap-day';

        const dateStr = currentDate.toDateString();
        const count = eventCounts[dateStr] || 0;

        if (count === 1) day.classList.add('level-1');
        else if (count === 2) day.classList.add('level-2');
        else if (count >= 3) day.classList.add('level-3');

        if (currentDate.toDateString() === today.toDateString()) {
            day.classList.add('today');
        }

        // Tooltip
        const tooltip = document.createElement('span');
        tooltip.className = 'heatmap-day-label';
        tooltip.textContent = `${currentDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}: ${count} task${count !== 1 ? 's' : ''}`;
        day.appendChild(tooltip);

        heatmapContainer.appendChild(day);
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

// Insights
function renderInsights(events) {
    const insightsList = document.getElementById('insights-list');
    insightsList.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find busiest month
    const monthCounts = {};
    events.forEach(event => {
        const monthKey = event.date.toLocaleString('default', { month: 'long' });
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    const busiestMonth = Object.entries(monthCounts)
        .sort((a, b) => b[1] - a[1])[0];

    // Find next 7 days tasks
    const next7Days = events.filter(e => {
        const diff = (e.date - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff < 7;
    }).length;

    // Average tasks per week
    const weeks = Math.ceil(events.length / (events.length > 0 ?
        Math.ceil((events[events.length - 1].date - events[0].date) / (1000 * 60 * 60 * 24 * 7)) : 1));
    const avgPerWeek = (events.length / Math.max(weeks, 1)).toFixed(1);

    const insights = [
        {
            icon: 'primary',
            emoji: '📊',
            title: `${next7Days} tasks this week`,
            desc: 'Upcoming in the next 7 days'
        },
        {
            icon: 'warning',
            emoji: '🔥',
            title: `${busiestMonth ? busiestMonth[0] : 'N/A'} is busiest`,
            desc: busiestMonth ? `${busiestMonth[1]} tasks scheduled` : 'No data'
        },
        {
            icon: 'info',
            emoji: '📈',
            title: `~${avgPerWeek} tasks/week`,
            desc: 'Average weekly workload'
        }
    ];

    insights.forEach(insight => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        item.innerHTML = `
            <div class="insight-icon ${insight.icon}">${insight.emoji}</div>
            <div class="insight-content">
                <p class="insight-title">${insight.title}</p>
                <p class="insight-desc">${insight.desc}</p>
            </div>
        `;
        insightsList.appendChild(item);
    });
}

// Calendar View
function renderCalendarView() {
    const calendarView = document.getElementById('calendar-view');
    calendarView.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-secondary);">Calendar view coming soon!</p>';
}

// ICS Export
function exportToICS() {
    if (allGeneratedEvents.length === 0) {
        showToast('No events to export. Please generate a schedule first.', 'error');
        return;
    }

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Garden Care Scheduler//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Garden Care Schedule'
    ].join('\r\n') + '\r\n';

    allGeneratedEvents.forEach(event => {
        const dateStr = formatICSDate(event.date);
        const uid = `${dateStr}-${event.name.replace(/[^a-zA-Z0-9]/g, '-')}@garden-scheduler`;

        icsContent += [
            'BEGIN:VEVENT',
            `DTSTART;VALUE=DATE:${dateStr}`,
            `SUMMARY:${escapeICS(event.name)}`,
            `DESCRIPTION:${escapeICS(event.description)}${event.warning ? '\\n\\nNote: ' + escapeICS(event.warning) : ''}`,
            `CATEGORIES:${event.type.toUpperCase()}`,
            `UID:${uid}`,
            'END:VEVENT'
        ].join('\r\n') + '\r\n';
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'garden-schedule.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Calendar exported successfully!', 'success');
}

function formatICSDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function escapeICS(text) {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(style);
