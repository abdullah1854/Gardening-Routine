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
        frequency: 15,
        offset: 0,
        type: "fertilizer",
        description: "Ferment 50g in 1L water for 48-72 hrs, then dilute 1:10 with water before use. Apply 100-200ml per plant on DRY soil (stop watering 1 day before). Water after application.",
        conflictsWith: [],
        conflictGaps: { "Neem Khali": 12, "Organic Iron Dust": 10, "Paecilomyces lilacinus": 8 },
        warning: "Keep 10-15 days gap from Neem Khali; never apply to wet soil or during cool, low-light periods"
    },
    {
        name: "Seaweed Extract",
        frequency: 17,
        offset: 7,
        type: "supplement",
        description: "Foliar spray (5-10ml/L) or root drench (50-100ml/10L). Apply early morning 6-8AM or late afternoon 4-5PM. Boosts stress tolerance & micronutrients.",
        conflictsWith: [],
        conflictGaps: { "Saaf Fungicide (Carbendazim + Mancozeb)": 5 },
        warning: "Keep 4-5 day gap from chemical fertilizers/pesticides for best absorption"
    },
    {
        name: "Compost / Vermicompost",
        frequency: 21,
        offset: 14,
        type: "soil",
        description: "Mix ¼-½ cup per plant into top soil. For beds, apply 0.5-1 inch layer and mix into top 6 inches. Water afterwards. Even 5% concentration significantly boosts growth.",
        conflictsWith: [],
        conflictGaps: {},
        warning: "For root vegetables, apply 120 days before harvest; for leafy vegetables, 90 days before harvest (food safety)"
    },
    {
        name: "PROM Granules",
        frequency: 52,
        offset: 21,
        type: "fertilizer",
        description: "Phosphate-rich organic manure. Mix 1-2 Tbsp into soil around root zone. Excellent for flowering/fruiting stages. Slow-release, lasts several weeks.",
        conflictsWith: [],
        conflictGaps: { "Organic Iron Dust": 10, "Bone Meal": 14 },
        warning: "Avoid combining with iron on same week - phosphorus can lock up iron"
    },
    {
        name: "Neem Khali",
        frequency: 30,
        offset: 30,
        type: "soil",
        description: "Nematode & fungus control. Mix 1-2 kg per sq.m into top 1-2 inches of soil. Nematocidal effect lasts ~30 days as it decomposes. Also adds nitrogen.",
        conflictsWith: [],
        conflictGaps: { "Mustard Cake Water": 12, "Paecilomyces lilacinus": 5 },
        warning: "Keep 10-15 days gap from Mustard Cake Water. Effect reduces after 15 days, fully gone by 30 days - time reapplication accordingly"
    },
    {
        name: "Bone Meal",
        frequency: 60,
        offset: 45,
        type: "supplement",
        description: "Slow-release phosphorus for root development. 1-2 Tbsp per plant or 5-10 lbs per 100 sq.ft. Best at planting time. Takes weeks to break down.",
        conflictsWith: [],
        conflictGaps: { "Organic Iron Dust": 10, "PROM Granules": 14 },
        warning: "High phosphorus can lock up iron - maintain 10-14 day gap from iron applications"
    },
    {
        name: "Neem Oil Spray",
        frequency: 10,
        offset: 2,
        type: "pest",
        description: "5ml/L water + 1 tsp liquid soap as emulsifier. Spray BOTH leaf surfaces in evening only. For active infestations, can spray every 7 days until controlled.",
        conflictsWith: ["Paecilomyces lilacinus", "Trichoderma", "Btk Bio Larvicide"],
        conflictGaps: { "Btk Bio Larvicide": 3, "Paecilomyces lilacinus": 3, "Trichoderma": 3 },
        warning: "Evening only to prevent leaf burn. Harmful to beneficial microbes on contact - space 3+ days from bio-agents"
    },
    {
        name: "Epsom Salt Spray",
        frequency: 21,
        offset: 10,
        type: "supplement",
        description: "Magnesium sulfate foliar spray. 1 Tbsp (15g) per liter of water. Apply early morning or late afternoon. For potted plants, reduce to monthly.",
        conflictsWith: ["Neem Oil Spray"],
        conflictGaps: { "Organic Iron Dust": 7 },
        warning: "Keep 7-day gap from Iron - magnesium and iron compete for uptake. Avoid hot midday sprays to prevent leaf burn"
    },
    {
        name: "Organic Iron Dust",
        frequency: 28,
        offset: 24,
        type: "supplement",
        description: "Treats chlorosis (yellow leaves, green veins). Foliar spray needs repeat every 2-4 weeks. Soil application can be done annually in early spring.",
        conflictsWith: [],
        conflictGaps: {
            "Epsom Salt Spray": 7,
            "Trichoderma": 7,
            "Paecilomyces lilacinus": 7,
            "Mustard Cake Water": 10,
            "PROM Granules": 10,
            "Bone Meal": 10
        },
        warning: "Iron conflicts with phosphorus (Bone Meal, PROM) and magnesium (Epsom Salt). High soil pH locks up iron - test soil if chronic chlorosis"
    },
    {
        name: "Paecilomyces lilacinus",
        frequency: 28,
        offset: 28,
        type: "soil",
        description: "Bio-nematicide fungus. Apply 200-400g/acre as soil drench to MOIST soil. Week 1: apply weekly for colonization. Month 2+: bi-weekly. After 12 months: monthly.",
        conflictsWith: ["Neem Oil Spray", "Trichoderma"],
        conflictGaps: { "Organic Iron Dust": 7, "Mustard Cake Water": 8, "Neem Khali": 5, "Trichoderma": 7, "Haldi Powder Spray": 5, "Saaf Fungicide (Carbendazim + Mancozeb)": 14 },
        warning: "Alternate with Trichoderma (don't apply same day). Carbendazim is HIGHLY toxic to bio-agents - keep 14+ day gap from chemical fungicides"
    },
    {
        name: "Trichoderma",
        frequency: 28,
        offset: 42,
        type: "soil",
        description: "Beneficial soil fungus. Apply to moist soil as drench. Improves disease resistance & nutrient uptake. Week 1-4: weekly. Month 2+: bi-weekly to monthly.",
        conflictsWith: ["Neem Oil Spray", "Paecilomyces lilacinus"],
        conflictGaps: { "Organic Iron Dust": 7, "Paecilomyces lilacinus": 7, "Haldi Powder Spray": 5, "Saaf Fungicide (Carbendazim + Mancozeb)": 14 },
        warning: "Carbendazim shows only 12% compatibility - HIGHLY TOXIC to Trichoderma. Mancozeb is safer. Keep 14+ day gap from chemical fungicides"
    },
    {
        name: "Btk Bio Larvicide",
        frequency: 10,
        offset: 5,
        type: "pest",
        description: "Bacillus thuringiensis for caterpillars. Apply when larvae are young (<5/8 inch). Spray evening, cover all foliage. For active infestation: every 5-7 days.",
        conflictsWith: ["Neem Oil Spray"],
        conflictGaps: { "Neem Oil Spray": 3 },
        warning: "Reapply after rain. Most effective on young larvae - apply when first noticed. Larvae must eat treated foliage to work"
    },
    {
        name: "Haldi Powder Spray",
        frequency: 21,
        offset: 12,
        type: "pest",
        description: "Mild natural antifungal. 1-3 tsp (5-15g) turmeric powder per liter + drop of soap. Test on small area first. Apply at dusk. For infections: every 7-10 days.",
        conflictsWith: [],
        conflictGaps: { "Trichoderma": 5, "Paecilomyces lilacinus": 5 },
        warning: "May disrupt soil microbiome if overused. Keep 5-day gap from Trichoderma/Paecilomyces. Avoid excessive application"
    },
    {
        name: "Saaf Fungicide (Carbendazim + Mancozeb)",
        frequency: 45,
        offset: 18,
        type: "pest",
        description: "CHEMICAL fungicide - use ONLY when disease is visible. Systemic+contact action. 1-1.5g/L water. Rotate with other modes to prevent resistance.",
        conflictsWith: [],
        conflictGaps: { "Trichoderma": 14, "Paecilomyces lilacinus": 14 },
        warning: "⚠️ Carbendazim KILLS beneficial microbes (only 12% compatible with Trichoderma). Wear PPE. Avoid bloom sprays. Mandatory 14+ day gap before/after bio-agents"
    }
];

// Icon SVGs for each type - Illustrated garden style
const typeIcons = {
    fertilizer: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M6 9h12l-1 12H7L6 9z" fill="#e8d5a3" stroke="#c4913a" stroke-width="1.5"/>
        <path d="M8 7c0-2 1.5-3 4-3s4 1 4 3" stroke="#b8860b" stroke-width="1.5" fill="none"/>
        <path d="M12 11v5M10 13l2-2 2 2" stroke="#8b6914" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <circle cx="12" cy="9" r="2" fill="#d4a574" opacity="0.6"/>
    </svg>`,
    pest: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 7v6c0 5 8 8 8 8s8-3 8-8V7l-8-4z" fill="#c7dece" stroke="#4a7c54" stroke-width="1.5"/>
        <path d="M12 7v9M9 10l3 3 3-3" stroke="#3a6243" stroke-width="1" fill="none"/>
        <circle cx="12" cy="13" r="2" fill="#5c7a52"/>
        <path d="M10 11l4 4" stroke="#c75d38" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    soil: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="10" width="16" height="12" rx="2" fill="#8b7355"/>
        <rect x="4" y="13" width="16" height="9" rx="2" fill="#6b5338"/>
        <rect x="4" y="16" width="16" height="6" rx="2" fill="#4a3828"/>
        <path d="M8 14c1.5 0 1.5 1.5 3 1.5s1.5-1.5 3-1.5" stroke="#d4a574" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M12 6v4M10 8l2 2 2-2" stroke="#4a7c54" stroke-width="1.5" fill="none"/>
    </svg>`,
    supplement: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M6 10h8l1 9H5l1-9z" fill="#5a8fa8" stroke="#3a5d70" stroke-width="1.5"/>
        <path d="M14 10l4-4" stroke="#5a8fa8" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="18" cy="6" r="2.5" fill="#87CEEB"/>
        <path d="M9 21c0 1.2 1 2 2 2s2-.8 2-2-2-3-2-3-2 1.8-2 3z" fill="#87CEEB"/>
        <path d="M14 20c0 .8.6 1.2 1.2 1.2s1.2-.4 1.2-1.2-1.2-2-1.2-2-1.2 1.2-1.2 2z" fill="#87CEEB" opacity="0.7"/>
    </svg>`
};

// Global state
let allGeneratedEvents = [];
let conflictsResolved = 0;
let currentView = 'list';
const STORAGE_KEY = 'gardenSchedulerPrefs';
const WEATHER_COORDS = { lat: 26.22, lon: 84.36 }; // Siwan, Bihar
const WEATHER_ENDPOINT = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_COORDS.lat}&longitude=${WEATHER_COORDS.lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_gusts_10m,weather_code&timezone=auto`;
const WEATHER_TIMEZONE = 'Asia/Kolkata';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load preferences
    loadPreferences();

    // Initialize UI components
    initTheme();
    initAtmosphereToggle();
    initSettingsPanel();
    initFilters();
    initCollapsibles();
    initKeyboardShortcuts();
    initModals();
    initViewToggle();
    initWeatherWidget();

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

    // Expand/Collapse All button
    const expandAllBtn = document.getElementById('expand-all-btn');
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', toggleExpandAll);
    }
}

// Toggle expand/collapse all event cards
function toggleExpandAll() {
    const expandAllBtn = document.getElementById('expand-all-btn');
    const allCards = document.querySelectorAll('.event-card');
    const isExpanded = expandAllBtn.classList.contains('expanded');

    if (isExpanded) {
        // Collapse all
        allCards.forEach(card => card.classList.remove('expanded'));
        expandAllBtn.classList.remove('expanded');
        expandAllBtn.querySelector('span').textContent = 'Expand All';
    } else {
        // Expand all
        allCards.forEach(card => card.classList.add('expanded'));
        expandAllBtn.classList.add('expanded');
        expandAllBtn.querySelector('span').textContent = 'Collapse All';
    }
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

// Atmosphere Toggle (Floating Leaves/Fireflies)
function initAtmosphereToggle() {
    const atmosphereToggle = document.getElementById('atmosphere-toggle');
    const gardenAtmosphere = document.querySelector('.garden-atmosphere');

    if (!atmosphereToggle || !gardenAtmosphere) return;

    // Load saved preference (default to enabled)
    const savedAtmosphere = localStorage.getItem('gardenAtmosphere');
    const isEnabled = savedAtmosphere === null ? true : savedAtmosphere === 'true';

    if (!isEnabled) {
        gardenAtmosphere.classList.add('hidden');
        atmosphereToggle.classList.remove('active');
    } else {
        gardenAtmosphere.classList.remove('hidden');
        atmosphereToggle.classList.add('active');
    }

    atmosphereToggle.addEventListener('click', () => {
        const isCurrentlyEnabled = !gardenAtmosphere.classList.contains('hidden');

        if (isCurrentlyEnabled) {
            gardenAtmosphere.classList.add('hidden');
            atmosphereToggle.classList.remove('active');
            localStorage.setItem('gardenAtmosphere', 'false');
        } else {
            gardenAtmosphere.classList.remove('hidden');
            atmosphereToggle.classList.add('active');
            localStorage.setItem('gardenAtmosphere', 'true');
        }
    });

    // Keyboard shortcut: 'A' to toggle atmosphere
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Don't trigger if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            atmosphereToggle.click();
        }
    });
}

// Settings Panel
function initSettingsPanel() {
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsPanel = document.getElementById('settings-panel');

    // Settings panel was removed in UI redesign - skip if not present
    if (!settingsToggle || !settingsPanel) return;

    settingsToggle.addEventListener('click', () => {
        settingsToggle.classList.toggle('active');
        settingsPanel.classList.toggle('open');
    });
}

// Filters - Updated for filter pills
function initFilters() {
    // Handle both old checkboxes (if any) and new filter pills
    const filterPills = document.querySelectorAll('.filter-pill[data-filter]');

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            pill.classList.toggle('active');
            applyFilters();
            savePreferences();
            updateThisWeekList();
        });
    });

    // Fallback for old checkbox system
    const filterCheckboxes = document.querySelectorAll('input[data-filter]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            applyFilters();
            savePreferences();
        });
    });
}

function applyFilters() {
    const filters = {};

    // Check for filter pills first (new system)
    const filterPills = document.querySelectorAll('.filter-pill[data-filter]');
    if (filterPills.length > 0) {
        filterPills.forEach(pill => {
            filters[pill.dataset.filter] = pill.classList.contains('active');
        });
    } else {
        // Fallback to checkboxes (old system)
        document.querySelectorAll('input[data-filter]').forEach(cb => {
            filters[cb.dataset.filter] = cb.checked;
        });
    }

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

// This Week List - shows next 7 days of tasks
function updateThisWeekList() {
    const container = document.getElementById('this-week-list');
    if (!container) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    // Get active filters
    const activeFilters = {};
    document.querySelectorAll('.filter-pill[data-filter]').forEach(pill => {
        activeFilters[pill.dataset.filter] = pill.classList.contains('active');
    });

    // Filter events for next 7 days
    const weekEvents = allGeneratedEvents.filter(event => {
        const eventDate = new Date(event.date);
        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        return eventDay >= today && eventDay < weekFromNow && activeFilters[event.type];
    }).sort((a, b) => a.date - b.date);

    if (weekEvents.length === 0) {
        container.innerHTML = '<div class="week-empty">No tasks this week</div>';
        return;
    }

    // Group by day
    const dayGroups = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    weekEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const dateKey = eventDate.toDateString();
        if (!dayGroups[dateKey]) {
            dayGroups[dateKey] = {
                date: eventDate,
                events: []
            };
        }
        dayGroups[dateKey].events.push(event);
    });

    let html = '';
    Object.values(dayGroups).forEach(group => {
        const isToday = group.date.toDateString() === today.toDateString();
        const dayLabel = isToday ? 'Today' : `${dayNames[group.date.getDay()]} ${group.date.getDate()}`;

        html += `<div class="week-day-group">`;
        html += `<div class="week-day-header${isToday ? ' today' : ''}">${dayLabel} (${group.events.length})</div>`;

        group.events.forEach(event => {
            html += `
                <div class="week-task-item" data-type="${event.type}">
                    <span class="task-dot"></span>
                    <span class="task-name">${event.name}</span>
                </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}

// Collapsible Sections
function initCollapsibles() {
    // Initialize collapsible sections from the HTML onclick handlers
    // The toggleSection function handles the actual toggling
}

// Global toggle function for collapsible sections (called from HTML onclick)
function toggleSection(header) {
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    header.setAttribute('aria-expanded', !isExpanded);

    const section = header.closest('.sidebar-section');
    if (section) {
        section.classList.toggle('expanded', !isExpanded);
    }
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
            case 'h':
                const helpModal = document.getElementById('help-modal');
                if (helpModal) helpModal.classList.toggle('hidden');
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

    if (keyboardHint && shortcutsModal) {
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
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal('shortcuts-modal');
            });
        }
    }

    // Initialize Help modal
    initHelpModal();
}

// Help Modal functionality
function initHelpModal() {
    const helpToggle = document.getElementById('help-toggle');
    const helpModal = document.getElementById('help-modal');

    if (!helpToggle || !helpModal) return;

    // Open help modal
    helpToggle.addEventListener('click', () => {
        helpModal.classList.remove('hidden');
    });

    // Close on overlay click
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.classList.add('hidden');
        }
    });

    // Close button
    const closeBtn = helpModal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            helpModal.classList.add('hidden');
        });
    }

    // Tab switching
    const tabs = helpModal.querySelectorAll('.help-tab');
    const tabContents = helpModal.querySelectorAll('.help-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update visible content
            tabContents.forEach(content => {
                content.classList.toggle('active', content.dataset.tab === targetTab);
            });
        });
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
    // Also close help modal
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.classList.add('hidden');
}

function closeSettingsPanel() {
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsToggle) settingsToggle.classList.remove('active');
    if (settingsPanel) settingsPanel.classList.remove('open');
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

// Weather (Siwan, Bihar) - Open-Meteo free API
const weatherCodeLabels = {
    0: 'Clear sky',
    1: 'Mostly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Icy fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    56: 'Light freezing drizzle',
    57: 'Freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light showers',
    81: 'Showers',
    82: 'Heavy showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Storm with small hail',
    99: 'Storm with heavy hail'
};

function initWeatherWidget() {
    const weatherCard = document.getElementById('weather-card');
    if (!weatherCard) return;

    updateWeatherClock();
    fetchAndRenderWeather();

    // Refresh clock every minute so it stays current without hammering the API
    setInterval(updateWeatherClock, 60000);

    const refreshBtn = document.getElementById('weather-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => fetchAndRenderWeather(true));
    }
}

function updateWeatherClock() {
    const timeEl = document.getElementById('weather-time');
    if (!timeEl) return;
    timeEl.textContent = `Local time • ${formatLocalTime(new Date(), WEATHER_TIMEZONE)}`;
}

async function fetchAndRenderWeather(isManual = false) {
    const tempEl = document.getElementById('weather-temp');
    const conditionEl = document.getElementById('weather-condition');
    const feelsEl = document.getElementById('weather-feels');
    const windEl = document.getElementById('weather-wind');
    const updatedEl = document.getElementById('weather-updated');
    const weatherCard = document.getElementById('weather-card');

    if (!tempEl || !conditionEl) return;

    weatherCard?.classList.remove('error');
    conditionEl.textContent = 'Fetching weather...';
    updatedEl.textContent = 'Updating...';

    try {
        const response = await fetch(WEATHER_ENDPOINT);
        if (!response.ok) {
            throw new Error(`Weather API returned ${response.status}`);
        }

        const data = await response.json();
        const current = data.current || {};
        const condition = getWeatherCondition(current.weather_code);
        const temp = typeof current.temperature_2m === 'number' ? Math.round(current.temperature_2m) : '--';
        const feelsLike = typeof current.apparent_temperature === 'number' ? Math.round(current.apparent_temperature) : '--';
        const wind = typeof current.wind_speed_10m === 'number' ? Math.round(current.wind_speed_10m) : '--';
        const updatedTime = formatLocalTime(current.time || Date.now(), data.timezone || WEATHER_TIMEZONE);

        tempEl.textContent = `${temp}°C`;
        conditionEl.textContent = condition;
        feelsEl.textContent = `Feels like ${feelsLike}°C`;
        windEl.textContent = `Wind ${wind} km/h`;
        updatedEl.textContent = `Updated ${updatedTime}`;

        if (isManual) {
            showToast('Weather updated for Siwan', 'success');
        }
    } catch (error) {
        console.error('Weather fetch failed', error);
        conditionEl.textContent = 'Weather unavailable';
        feelsEl.textContent = 'Feels like --°C';
        windEl.textContent = 'Wind -- km/h';
        updatedEl.textContent = 'Check connection';
        weatherCard?.classList.add('error');
        if (isManual) {
            showToast('Weather lookup failed. Please try again.', 'error');
        }
    }
}

function formatLocalTime(dateLike, timezone = WEATHER_TIMEZONE) {
    const formatter = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone
    });
    return formatter.format(new Date(dateLike));
}

function getWeatherCondition(code) {
    const label = weatherCodeLabels[code];
    return label || 'Outdoor conditions unavailable';
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
                Object.entries(prefs.filters).forEach(([type, isActive]) => {
                    const el = document.querySelector(`[data-filter="${type}"]`);
                    if (el) {
                        // Handle both filter pills (buttons) and checkboxes
                        if (el.classList.contains('filter-pill')) {
                            el.classList.toggle('active', isActive);
                        } else {
                            el.checked = isActive;
                        }
                    }
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

    document.querySelectorAll('[data-filter]').forEach(el => {
        // Handle both filter pills (buttons) and checkboxes
        if (el.classList.contains('filter-pill')) {
            prefs.filters[el.dataset.filter] = el.classList.contains('active');
        } else {
            prefs.filters[el.dataset.filter] = el.checked;
        }
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
    updateThisWeekList();
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
            desc.className = 'event-description';
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

            // Expand/collapse toggle chevron
            const expandToggle = document.createElement('div');
            expandToggle.className = 'event-expand-toggle';
            expandToggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';

            eventCard.appendChild(dateCol);
            eventCard.appendChild(contentBox);
            eventCard.appendChild(expandToggle);

            // Click to expand/collapse
            eventCard.addEventListener('click', () => {
                eventCard.classList.toggle('expanded');
            });

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
    // Stats elements were removed in UI redesign - skip if not present
    const totalEl = document.getElementById('total-events');
    const conflictsEl = document.getElementById('conflicts-resolved');

    if (totalEl) totalEl.textContent = events.length;
    if (conflictsEl) conflictsEl.textContent = conflictsResolved;

    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar && events.length > 0) {
        const successRate = ((events.length - conflictsResolved) / events.length) * 100;
        progressBar.style.width = `${Math.min(100, successRate + (conflictsResolved > 0 ? 10 : 0))}%`;
    }
}

function updateFilterCounts(events) {
    const counts = { fertilizer: 0, pest: 0, soil: 0, supplement: 0 };

    events.forEach(event => {
        counts[event.type]++;
    });

    Object.entries(counts).forEach(([type, count]) => {
        // Update filter checkbox counts
        const countEl = document.getElementById(`count-${type}`);
        if (countEl) {
            countEl.textContent = count;
        }

        // Update KPI cards
        const kpiEl = document.getElementById(`kpi-${type}`);
        if (kpiEl) {
            kpiEl.textContent = count;
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
    const iconEl = document.getElementById('next-task-icon');
    const typeEl = document.getElementById('next-task-type');
    const freqEl = document.getElementById('next-task-freq');
    const cardEl = document.getElementById('next-task-indicator');

    if (nextTask) {
        nameEl.textContent = nextTask.name;

        // Update icon based on type (for old layout)
        if (iconEl) {
            iconEl.innerHTML = getTaskTypeIcon(nextTask.type);
        }

        // Update card data-type for styling
        if (cardEl) {
            cardEl.setAttribute('data-type', nextTask.type);
        }

        // Update type label (new banner)
        if (typeEl) {
            const typeLabels = {
                fertilizer: 'Fertilizer',
                pest: 'Pest Control',
                soil: 'Soil Health',
                supplement: 'Supplement'
            };
            typeEl.textContent = typeLabels[nextTask.type] || nextTask.type;
        }

        // Update frequency (new banner)
        if (freqEl) {
            const item = routineItems.find(r => r.name === nextTask.name);
            if (item) {
                freqEl.textContent = `Every ${item.frequency} days`;
            } else {
                freqEl.textContent = '';
            }
        }

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
        if (iconEl) {
            iconEl.innerHTML = getTaskTypeIcon('default');
        }
        if (typeEl) typeEl.textContent = '';
        if (freqEl) freqEl.textContent = '';
    }
}

// Get SVG icon for task type (larger version for next task card)
function getTaskTypeIcon(type) {
    const icons = {
        fertilizer: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
        pest: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        soil: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
        supplement: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
        default: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    };
    return icons[type] || icons.default;
}

// Heatmap
function renderHeatmap(events, startDate, durationMonths) {
    const heatmapContainer = document.getElementById('calendar-heatmap');
    // Heatmap was removed in UI redesign - skip if not present
    if (!heatmapContainer) return;
    heatmapContainer.innerHTML = '';

    // Map of date string -> count
    const eventCounts = {};
    events.forEach(event => {
        const dateStr = event.date.toDateString();
        eventCounts[dateStr] = (eventCounts[dateStr] || 0) + 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cover the full selected duration, rounded to full weeks (start Monday, end Sunday)
    const renderStart = new Date(startDate);
    renderStart.setHours(0, 0, 0, 0);
    const startDay = renderStart.getDay(); // 0 = Sunday
    const daysToMonday = startDay === 0 ? 6 : startDay - 1;
    renderStart.setDate(renderStart.getDate() - daysToMonday);

    const renderEnd = new Date(startDate);
    renderEnd.setMonth(renderEnd.getMonth() + durationMonths);
    renderEnd.setHours(0, 0, 0, 0);
    const endDay = renderEnd.getDay();
    const daysToSunday = endDay === 0 ? 0 : 7 - endDay;
    renderEnd.setDate(renderEnd.getDate() + daysToSunday);

    const totalDays = Math.round((renderEnd - renderStart) / (1000 * 60 * 60 * 24)) + 1;
    const maxCount = Math.max(0, ...Object.values(eventCounts));

    const currentDate = new Date(renderStart);
    for (let i = 0; i < totalDays; i++) {
        const day = document.createElement('div');
        day.className = 'heatmap-day';

        const dateStr = currentDate.toDateString();
        const count = eventCounts[dateStr] || 0;

        // Intensity scaling
        if (count > 0) {
            if (maxCount <= 1 || count === 1) {
                day.classList.add('level-1');
            } else if (count >= maxCount * 0.66) {
                day.classList.add('level-3');
            } else {
                day.classList.add('level-2');
            }
        }

        if (currentDate.toDateString() === today.toDateString()) {
            day.classList.add('today');
        }

        if (currentDate.getDate() === 1) {
            const monthLabel = document.createElement('span');
            monthLabel.className = 'heatmap-month-label';
            monthLabel.textContent = currentDate.toLocaleDateString('default', { month: 'short' });
            day.appendChild(monthLabel);
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
    // Insights section was removed in UI redesign - skip if not present
    if (!insightsList) return;
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
