// Garden Care Scheduler - Complete Data Model with Gap-Based Conflict Resolution
// Based on Kitchen Garden Fertilizer document

const routineItems = [
    {
        name: "Mustard Cake Water",
        frequency: 17,
        offset: 0,
        type: "fertilizer",
        description: "Soak 24-48 hrs, dilute 1:3. Use on wet soil only.",
        conflictsWith: [],
        conflictGaps: { "Neem Khali": 12, "Organic Iron Dust": 10, "Paecilomyces lilacinus": 8 },
        warning: "Keep 10-15 days gap from Neem Khali"
    },
    {
        name: "Bone Meal",
        frequency: 52,
        offset: 0,
        type: "supplement",
        description: "1-2 Tbsp mixed into soil holes. Slow-release phosphorus for flowering.",
        conflictsWith: [],
        conflictGaps: { "Organic Iron Dust": 10 }
    },
    {
        name: "Compost / Vermicompost",
        frequency: 22,
        offset: 14,
        type: "soil",
        description: "Mix 2-3 handfuls into top soil. Water afterwards.",
        conflictsWith: [],
        conflictGaps: {}
    },
    {
        name: "Neem Oil Spray",
        frequency: 8,
        offset: 2,
        type: "pest",
        description: "Spray in evening. 5ml/L + liquid soap. Covers both leaf sides.",
        conflictsWith: ["Paecilomyces lilacinus", "Trichoderma"],
        conflictGaps: {}
    },
    {
        name: "Neem Khali",
        frequency: 37,
        offset: 10,
        type: "soil",
        description: "Soil application for nematodes/fungus. Mix into top 1-2 inches.",
        conflictsWith: [],
        conflictGaps: { "Mustard Cake Water": 12, "Paecilomyces lilacinus": 5 },
        warning: "Keep 10-15 days gap from Mustard Cake Water"
    },
    {
        name: "Epsom Salt Spray",
        frequency: 37,
        offset: 25,
        type: "supplement",
        description: "Foliar spray (1 tbsp/L). Magnesium for lush green foliage.",
        conflictsWith: ["Neem Oil Spray"],
        conflictGaps: { "Organic Iron Dust": 7 },
        warning: "Keep 7-day gap from Iron application"
    },
    {
        name: "Paecilomyces lilacinus",
        frequency: 37,
        offset: 30,
        type: "soil",
        description: "Nematode bio-control. Apply to moist soil, not foliage.",
        conflictsWith: ["Neem Oil Spray"],
        conflictGaps: { "Organic Iron Dust": 7, "Mustard Cake Water": 8, "Neem Khali": 5 },
        warning: "Keep 5-7 days gap from Iron, 7-10 days from Mustard Cake"
    },
    {
        name: "Seaweed Extract",
        frequency: 17,
        offset: 7,
        type: "supplement",
        description: "Foliar spray or root drench (5-10ml/L). Growth hormones & micronutrients.",
        conflictsWith: [],
        conflictGaps: {}
    },
    {
        name: "PROM Granules",
        frequency: 52,
        offset: 21,
        type: "fertilizer",
        description: "Mix into soil. Phosphate-rich organic manure for flowering/fruiting.",
        conflictsWith: [],
        conflictGaps: { "Organic Iron Dust": 10 }
    },
    {
        name: "Organic Iron Dust",
        frequency: 37,
        offset: 18,
        type: "supplement",
        description: "Treats chlorosis (yellow leaves with green veins). Soil or foliar application.",
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
        name: "Trichoderma",
        frequency: 37,
        offset: 35,
        type: "soil",
        description: "Beneficial fungi for soil health. Improves disease resistance.",
        conflictsWith: ["Neem Oil Spray"],
        conflictGaps: { "Organic Iron Dust": 7 },
        warning: "Keep 5-7 days gap from Iron"
    }
];

// Global state
let allGeneratedEvents = [];
let conflictsResolved = 0;
const STORAGE_KEY = 'gardenSchedulerPrefs';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('start-date');
    const durationSelect = document.getElementById('duration');
    const generateBtn = document.getElementById('generate-btn');
    const printBtn = document.getElementById('print-btn');
    const todayBtn = document.getElementById('today-btn');
    const exportBtn = document.getElementById('export-btn');

    // Load saved preferences or use defaults
    loadPreferences();

    // Event listeners
    generateBtn.addEventListener('click', generateSchedule);
    printBtn.addEventListener('click', () => window.print());
    todayBtn.addEventListener('click', () => {
        startDateInput.valueAsDate = new Date();
        generateSchedule();
    });
    exportBtn.addEventListener('click', exportToICS);

    // Auto-regenerate on changes
    startDateInput.addEventListener('change', generateSchedule);
    durationSelect.addEventListener('change', generateSchedule);

    // Initialize filters
    initFilters();

    // Generate initial schedule
    generateSchedule();
});

function loadPreferences() {
    const startDateInput = document.getElementById('start-date');
    const durationSelect = document.getElementById('duration');

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const prefs = JSON.parse(saved);
            if (prefs.startDate) {
                startDateInput.value = prefs.startDate;
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
            // Use defaults if parsing fails
            startDateInput.value = '2025-12-01';
        }
    } else {
        // Default: December 1st, 2025
        startDateInput.value = '2025-12-01';
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

    document.querySelectorAll('.event-card').forEach(card => {
        const type = card.dataset.type;
        card.style.display = filters[type] ? '' : 'none';
    });

    // Hide empty months
    document.querySelectorAll('.month-block').forEach(block => {
        const visibleEvents = block.querySelectorAll('.event-card:not([style*="display: none"])').length;
        block.style.display = visibleEvents === 0 ? 'none' : '';
    });
}

// Priority scoring for scheduling - items with more constraints scheduled first
function getConstraintScore(item) {
    const gapCount = Object.keys(item.conflictGaps || {}).length;
    const conflictCount = (item.conflictsWith || []).length;
    return gapCount * 2 + conflictCount;
}

// Check for gap-based conflicts
function hasGapConflict(event, dateMap, proposedDate) {
    const eventGaps = event.conflictGaps || {};

    // Check this event's gap requirements against existing events
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

    // Check reverse - other items that have gap requirements for this event
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

    // Check same-day conflicts (original logic)
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

    // Sort items by constraint score (most constrained first)
    const sortedItems = [...routineItems].sort(
        (a, b) => getConstraintScore(b) - getConstraintScore(a)
    );

    let allEvents = [];

    // 1. Generate base events
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

    // 2. Sort by date first to process in order
    allEvents.sort((a, b) => a.date - b.date);

    // 3. Resolve Conflicts with gap-based detection
    const resolvedEvents = [];
    const dateMap = new Map();

    allEvents.forEach(event => {
        let eventDate = new Date(event.date);
        let attempts = 0;
        let placed = false;

        while (!placed && attempts < 20) {
            const conflictResult = hasGapConflict(event, dateMap, eventDate);

            if (!conflictResult.hasConflict) {
                // Place it here
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
                // Move to next day
                eventDate.setDate(eventDate.getDate() + 1);
                attempts++;
            }
        }

        // If still not placed after 20 attempts, place anyway with warning
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

    // Store for export
    allGeneratedEvents = resolvedEvents;

    // 4. Render
    renderSchedule(resolvedEvents);
    updateStats(resolvedEvents);
    applyFilters();
    markTodayEvents();
    savePreferences();
}

function renderSchedule(resolvedEvents) {
    const scheduleContainer = document.getElementById('schedule-container');

    // Group by Month
    const eventsByMonth = {};
    resolvedEvents.sort((a, b) => a.date - b.date);

    resolvedEvents.forEach(event => {
        const monthKey = event.date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!eventsByMonth[monthKey]) {
            eventsByMonth[monthKey] = [];
        }
        eventsByMonth[monthKey].push(event);
    });

    for (const [month, events] of Object.entries(eventsByMonth)) {
        const monthBlock = document.createElement('div');
        monthBlock.className = 'month-block';

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

        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.dataset.type = event.type;
            eventCard.dataset.date = event.date.toISOString();

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

            // Meta row (type badge + frequency)
            const metaRow = document.createElement('div');
            metaRow.className = 'event-meta';

            const typeBadge = document.createElement('span');
            typeBadge.className = `type-badge badge-${event.type}`;
            typeBadge.textContent = getTypeLabel(event.type);

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

            // Warning box
            if (event.warning) {
                const warning = document.createElement('div');
                warning.className = 'warning-box';
                warning.innerHTML = `<span class="warning-icon">!</span> ${event.warning}`;
                contentBox.appendChild(warning);
            }

            // Rescheduled indicator
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
    document.getElementById('items-tracked').textContent = routineItems.length;
    document.getElementById('conflicts-resolved').textContent = conflictsResolved;
}

function markTodayEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    document.querySelectorAll('.event-card').forEach(card => {
        const eventDate = new Date(card.dataset.date);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate.getTime() === today.getTime()) {
            card.classList.add('is-today');
        }
    });
}

// ICS Calendar Export
function exportToICS() {
    if (allGeneratedEvents.length === 0) {
        alert('No events to export. Please generate a schedule first.');
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
