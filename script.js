const routineItems = [
    {
        name: "Mustard Cake Water",
        frequency: 20, // Range 15-20 days. Using 20 to allow gaps.
        offset: 0,
        type: "fertilizer",
        description: "Mix 1 part cake with 4-5 parts water, soak 24-48h. Dilute 1:3 before use. Use on wet soil."
    },
    {
        name: "Bone Meal",
        frequency: 45,
        offset: 0,
        type: "supplement",
        description: "Slow release. 1 tbsp per pot. Mix into soil. Good for flowering/fruiting plants."
    },
    {
        name: "Compost / Vermicompost",
        frequency: 20,
        offset: 5, // 5 days after Mustard (Day 0). Safe.
        type: "soil",
        description: "2-3 handfuls per pot. Mix into top 1-2 inches. Gentle and improves soil structure."
    },
    {
        name: "Neem Oil Spray",
        frequency: 7,
        offset: 2, // Shifted to Day 2 to avoid direct clash with Mustard (Day 0).
        type: "pest",
        description: "Preventive. 5ml oil + 2-3 drops soap + 1L water. Spray in evening."
    },
    {
        name: "Neem Khali",
        frequency: 40, // Range 30-45. Syncs with Mustard (20x2).
        offset: 10, // Day 10. 10 days after Mustard(0), 10 days before Mustard(20). Perfect.
        type: "soil",
        description: "Soil pest control. 1-2 tbsp per pot. Mix in top soil. Don't mix with Mustard Cake."
    },
    {
        name: "Epsom Salt Spray",
        frequency: 40, // Range 30-45.
        offset: 25, // Day 25. 5 days after Mustard(20). 2 days after Neem Oil(23). Safe.
        type: "supplement",
        description: "1 tbsp + 1L water. Spray on leaves in evening. Good for yellowing leaves."
    },
    {
        name: "Paecilomyces lilacinus",
        frequency: 40, // Range 30-45.
        offset: 30, // Day 30. 10 days after Mustard(20), 10 days before Mustard(40). 20 days after Neem Khali(10). Perfect.
        type: "soil",
        description: "Nematode control. 10-20g powder or 5-10ml liquid per pot. Apply to soil."
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('start-date');
    const durationSelect = document.getElementById('duration');
    const generateBtn = document.getElementById('generate-btn');
    const scheduleContainer = document.getElementById('schedule-container');

    // Set default date to today
    startDateInput.valueAsDate = new Date();

    generateBtn.addEventListener('click', () => {
        const startDate = new Date(startDateInput.value);
        const durationMonths = parseInt(durationSelect.value);
        generateSchedule(startDate, durationMonths);
    });

    // Generate initial schedule
    generateSchedule(new Date(), 6);
});

function generateSchedule(startDate, durationMonths) {
    const scheduleContainer = document.getElementById('schedule-container');
    scheduleContainer.innerHTML = '';

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const allEvents = [];

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

    // Sort events by date
    allEvents.sort((a, b) => a.date - b.date);

    // Group by Month
    const eventsByMonth = {};
    allEvents.forEach(event => {
        const monthKey = event.date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!eventsByMonth[monthKey]) {
            eventsByMonth[monthKey] = [];
        }
        eventsByMonth[monthKey].push(event);
    });

    // Render
    for (const [month, events] of Object.entries(eventsByMonth)) {
        const monthBlock = document.createElement('div');
        monthBlock.className = 'month-block';

        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = month;
        monthBlock.appendChild(monthHeader);

        const eventList = document.createElement('ul');
        eventList.className = 'event-list';

        events.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-item';

            const dateSpan = document.createElement('span');
            dateSpan.className = 'event-date';
            dateSpan.textContent = event.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'event-details';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'event-title';
            titleDiv.textContent = event.name;

            const tagSpan = document.createElement('span');
            tagSpan.className = `tag tag-${event.type}`;
            tagSpan.textContent = event.type.charAt(0).toUpperCase() + event.type.slice(1);
            titleDiv.appendChild(tagSpan);

            const descDiv = document.createElement('div');
            descDiv.className = 'event-desc';
            descDiv.textContent = event.description;

            detailsDiv.appendChild(titleDiv);
            detailsDiv.appendChild(descDiv);

            li.appendChild(dateSpan);
            li.appendChild(detailsDiv);
            eventList.appendChild(li);
        });

        monthBlock.appendChild(eventList);
        scheduleContainer.appendChild(monthBlock);
    }
}
