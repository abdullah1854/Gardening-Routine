const routineItems = [
    {
        name: "Mustard Cake Water",
        frequency: 20,
        offset: 0,
        type: "fertilizer",
        description: "Soak 24-48 hrs, dilute 1:3. Use on wet soil.",
        conflictsWith: ["Neem Khali", "Paecilomyces lilacinus"],
        warning: "Avoid mixing with Neem Khali"
    },
    {
        name: "Bone Meal",
        frequency: 45,
        offset: 0,
        type: "supplement",
        description: "1-2 Tbsp mixed into soil holes. Slow release.",
        conflictsWith: []
    },
    {
        name: "Compost / Vermicompost",
        frequency: 20,
        offset: 5,
        type: "soil",
        description: "Mix 2-3 handfuls into top soil. Water afterwards.",
        conflictsWith: []
    },
    {
        name: "Neem Oil Spray",
        frequency: 7,
        offset: 2,
        type: "pest",
        description: "Spray in evening. 5ml/L + soap.",
        conflictsWith: ["Paecilomyces lilacinus", "Epsom Salt Spray"]
    },
    {
        name: "Neem Khali",
        frequency: 40,
        offset: 10,
        type: "soil",
        description: "Soil application for nematodes/fungus.",
        conflictsWith: ["Mustard Cake Water"],
        warning: "Avoid mixing with Mustard Cake Water"
    },
    {
        name: "Epsom Salt Spray",
        frequency: 40,
        offset: 25,
        type: "supplement",
        description: "Foliar spray (1 tbsp/L). Do not mix with Neem.",
        conflictsWith: ["Neem Oil Spray"],
        warning: "Do not mix with Neem Oil"
    },
    {
        name: "Paecilomyces lilacinus",
        frequency: 40,
        offset: 30,
        type: "soil",
        description: "Nematode control. Apply to soil.",
        conflictsWith: ["Neem Oil Spray", "Mustard Cake Water"],
        warning: "Avoid mixing with Neem Oil or Mustard Cake"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('start-date');
    // const durationSelect = document.getElementById('duration'); // Removed as per new UI design implicitly showing 6 months or more
    const generateBtn = document.getElementById('generate-btn');
    const printBtn = document.getElementById('print-btn');

    // Set default date to today
    startDateInput.valueAsDate = new Date();

    generateBtn.addEventListener('click', () => {
        const startDate = new Date(startDateInput.value);
        generateSchedule(startDate, 6); // Default to 6 months
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Generate initial schedule
    generateSchedule(new Date(), 6);
});

function generateSchedule(startDate, durationMonths) {
    const scheduleContainer = document.getElementById('schedule-container');
    scheduleContainer.innerHTML = '';

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    let allEvents = [];
    const dateOccupancy = {}; // Map date string to array of event names

    // 1. Generate base events
    routineItems.forEach(item => {
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

    // 2. Resolve Conflicts
    // Sort by date first to process in order
    allEvents.sort((a, b) => a.date - b.date);

    const resolvedEvents = [];
    const dateMap = new Map(); // Keep track of what's on each date

    allEvents.forEach(event => {
        let eventDate = new Date(event.date);
        let attempts = 0;
        let placed = false;

        while (!placed && attempts < 10) {
            const dateStr = eventDate.toDateString();
            const existingEvents = dateMap.get(dateStr) || [];

            let hasConflict = false;
            for (const existing of existingEvents) {
                if (event.conflictsWith.includes(existing.name) || existing.conflictsWith.includes(event.name)) {
                    hasConflict = true;
                    break;
                }
            }

            if (!hasConflict) {
                // Place it here
                if (!dateMap.has(dateStr)) {
                    dateMap.set(dateStr, []);
                }
                dateMap.get(dateStr).push(event);
                event.date = new Date(eventDate); // Update the event date
                resolvedEvents.push(event);
                placed = true;
            } else {
                // Move to next day
                eventDate.setDate(eventDate.getDate() + 1);
                attempts++;
            }
        }
    });

    // 3. Render
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

        // const monthTag = document.createElement('span');
        // monthTag.className = 'month-tag';
        // monthTag.textContent = 'Month ' + (Object.keys(eventsByMonth).indexOf(month) + 1);

        monthHeader.appendChild(monthTitle);
        // monthHeader.appendChild(monthTag);
        monthBlock.appendChild(monthHeader);

        const eventList = document.createElement('div');
        eventList.className = 'event-list';

        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';

            const dateRow = document.createElement('div');
            dateRow.className = 'event-date-row';

            const dayNum = document.createElement('span');
            dayNum.className = 'day-num';
            dayNum.textContent = event.date.getDate();

            const monthShort = document.createElement('span');
            monthShort.className = 'month-short';
            monthShort.textContent = event.date.toLocaleString('default', { month: 'short' });

            const weekday = document.createElement('span');
            weekday.className = 'weekday';
            weekday.textContent = event.date.toLocaleString('default', { weekday: 'long' });

            const leftDate = document.createElement('div');
            leftDate.appendChild(dayNum);
            leftDate.appendChild(monthShort);

            dateRow.appendChild(leftDate);
            dateRow.appendChild(weekday);

            const contentBox = document.createElement('div');
            contentBox.className = `event-content type-${event.type}`;

            const title = document.createElement('h3');
            title.textContent = event.name;

            const desc = document.createElement('p');
            desc.textContent = event.description;

            contentBox.appendChild(title);
            contentBox.appendChild(desc);

            if (event.warning) {
                const warning = document.createElement('div');
                warning.className = 'warning-box';
                warning.innerHTML = `⚠️ ${event.warning}`;
                contentBox.appendChild(warning);
            }

            eventCard.appendChild(dateRow);
            eventCard.appendChild(contentBox);
            eventList.appendChild(eventCard);
        });

        monthBlock.appendChild(eventList);
        scheduleContainer.appendChild(monthBlock);
    }
}
