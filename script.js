/* =========================================
   WHERE IS MY BUS?
   FRONTEND APPLICATION LOGIC
   Version 1.0 - Demo Simulation
========================================= */

// DEMONSTRATION DATA ONLY
// These are not verified real bus schedules or GPS locations.

const buses = [
    {
        id: 1,
        number: "KA34 F1234",
        name: "KSRTC Express",
        category: "Government",
        source: "Ballari Bus Stand",
        destination: "Hospet",
        eta: 25,
        scheduled: "10:30 AM",
        stops: ["Ballari", "Toranagallu", "Hospet"],
        position: 0,
        coordinates: [
            [15.1394, 76.9214],
            [15.1450, 76.9340],
            [15.1550, 76.9470],
            [15.1650, 76.9600]
        ]
    },
    {
        id: 2,
        number: "KA34 P5678",
        name: "Private Travels",
        category: "Private",
        source: "Ballari",
        destination: "Bengaluru",
        eta: 40,
        scheduled: "11:00 AM",
        stops: ["Ballari", "Chitradurga", "Tumakuru", "Bengaluru"],
        position: 0,
        coordinates: [
            [15.1394, 76.9214],
            [15.1500, 76.9300],
            [15.1600, 76.9400],
            [15.1700, 76.9500]
        ]
    },
    {
        id: 3,
        number: "CITY 101",
        name: "City Bus",
        category: "City",
        source: "Ballari Bus Stand",
        destination: "Cowl Bazaar",
        eta: 12,
        scheduled: "10:45 AM",
        stops: ["Bus Stand", "Main Market", "Cowl Bazaar"],
        position: 0,
        coordinates: [
            [15.1394, 76.9214],
            [15.1420, 76.9270],
            [15.1460, 76.9330],
            [15.1500, 76.9390]
        ]
    },
    {
        id: 4,
        number: "BITM 001",
        name: "College Bus",
        category: "College",
        source: "Ballari Bus Stand",
        destination: "BITM College",
        eta: 18,
        scheduled: "10:50 AM",
        stops: ["Bus Stand", "Allipur", "BITM"],
        position: 0,
        coordinates: [
            [15.1394, 76.9214],
            [15.1450, 76.9100],
            [15.1500, 76.9000],
            [15.1550, 76.8900]
        ]
    },
    {
        id: 5,
        number: "KA34 G9012",
        name: "Government Bus",
        category: "Government",
        source: "Ballari",
        destination: "Kudligi",
        eta: 35,
        scheduled: "11:15 AM",
        stops: ["Ballari", "Sandur", "Kudligi"],
        position: 0,
        coordinates: [
            [15.1394, 76.9214],
            [15.1450, 76.9300],
            [15.1550, 76.9400],
            [15.1650, 76.9500]
        ]
    },
    {
        id: 6,
        number: "CITY 202",
        name: "City Connector",
        category: "City",
        source: "Ballari",
        destination: "Allipur",
        eta: 8,
        scheduled: "11:20 AM",
        stops: ["Ballari", "Main Road", "Allipur"],
        position: 0,
        coordinates: [
            [15.1394, 76.9214],
            [15.1440, 76.9170],
            [15.1500, 76.9100],
            [15.1550, 76.9050]
        ]
    }
];

// APPLICATION STATE

let selectedCategory = "All";
let selectedBusId = null;
let map = null;
let userMarker = null;
let toastTimer = null;

const markers = {};
const polylines = {};

// DOM ELEMENTS

const busResults = document.getElementById("busResults");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");

const busSearch = document.getElementById("busSearch");
const sourceSearch = document.getElementById("sourceSearch");
const destinationSearch = document.getElementById("destinationSearch");


// TOAST MESSAGE

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}


// FAVOURITES

function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem("busFavorites") || "[]");
    } catch {
        return [];
    }
}

function saveFavorites(favorites) {
    localStorage.setItem("busFavorites", JSON.stringify(favorites));
}

function isFavorite(id) {
    return getFavorites().includes(id);
}

function toggleFavorite(id) {
    let favorites = getFavorites();

    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
        showToast("Removed from favourites");
    } else {
        favorites.push(id);
        showToast("Added to favourites ❤️");
    }

    saveFavorites(favorites);
    renderBuses();
}


// BUS SEARCH AND FILTER

function getFilteredBuses() {
    const busTerm = busSearch.value.trim().toLowerCase();
    const sourceTerm = sourceSearch.value.trim().toLowerCase();
    const destinationTerm = destinationSearch.value.trim().toLowerCase();

    return buses.filter(bus => {
        const matchesBus =
            bus.number.toLowerCase().includes(busTerm) ||
            bus.name.toLowerCase().includes(busTerm) ||
            bus.source.toLowerCase().includes(busTerm) ||
            bus.destination.toLowerCase().includes(busTerm);

        const matchesSource =
            bus.source.toLowerCase().includes(sourceTerm) ||
            bus.stops.some(stop => stop.toLowerCase().includes(sourceTerm));

        const matchesDestination =
            bus.destination.toLowerCase().includes(destinationTerm) ||
            bus.stops.some(stop => stop.toLowerCase().includes(destinationTerm));

        const matchesCategory =
            selectedCategory === "All" ||
            bus.category === selectedCategory;

        return matchesBus &&
               matchesSource &&
               matchesDestination &&
               matchesCategory;
    });
}


// DISPLAY BUS CARDS

function renderBuses() {
    const filtered = getFilteredBuses();

    busResults.innerHTML = "";

    resultCount.textContent =
        `${filtered.length} buses found (demo data)`;

    emptyState.hidden = filtered.length !== 0;

    filtered.forEach(bus => {
        const favorite = isFavorite(bus.id);

        const card = document.createElement("article");
        card.className = "bus-card";

        card.innerHTML = `
            <div class="bus-card-top">
                <span class="bus-type">${bus.category}</span>

                <button class="favorite-btn ${favorite ? "saved" : ""}"
                    data-favorite="${bus.id}"
                    aria-label="Toggle favourite"
                    title="Add to favourites">
                    ${favorite ? "♥" : "♡"}
                </button>
            </div>

            <h3>${bus.name}</h3>

            <p class="bus-number">${bus.number}</p>

            <div class="bus-route">
                <span>FROM</span>
                <strong>${bus.source}</strong>
                <span>↓ TO</span>
                <strong>${bus.destination}</strong>
            </div>

            <div class="bus-meta">
                <span>⏱ ${bus.eta} min ETA*</span>
                <span>🕒 ${bus.scheduled}*</span>
            </div>

            <div class="card-actions">
                <button data-track="${bus.id}">Track Bus</button>
                <button data-details="${bus.id}">Details</button>
            </div>
        `;

        busResults.appendChild(card);
    });
}


// CATEGORY FILTER BUTTONS

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        renderBuses();
    });
});


// SEARCH BUTTON

document.getElementById("searchButton").addEventListener("click", () => {
    renderBuses();

    document.getElementById("routes").scrollIntoView({
        behavior: "smooth"
    });
});


// ENTER KEY SEARCH

[busSearch, sourceSearch, destinationSearch].forEach(input => {
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            renderBuses();
        }
    });
});


// BUS CARD ACTIONS

busResults.addEventListener("click", event => {

    const favoriteButton = event.target.closest("[data-favorite]");
    const trackButton = event.target.closest("[data-track]");
    const detailsButton = event.target.closest("[data-details]");

    if (favoriteButton) {
        toggleFavorite(Number(favoriteButton.dataset.favorite));
    }

    if (trackButton) {
        selectBus(Number(trackButton.dataset.track));
    }

    if (detailsButton) {
        showBusDetails(Number(detailsButton.dataset.details));
    }
});


// BUS DETAILS

function showBusDetails(id) {
    const bus = buses.find(item => item.id === id);

    if (!bus) return;

    const details = document.getElementById("selectedDetails");

    details.innerHTML = `
        <strong>${bus.name}</strong><br><br>
        Bus number: ${bus.number}<br>
        Category: ${bus.category}<br>
        From: ${bus.source}<br>
        To: ${bus.destination}<br>
        Stops: ${bus.stops.join(" → ")}<br>
        Scheduled time*: ${bus.scheduled}<br>
        Estimated arrival*: ${bus.eta} minutes<br><br>
        <small>*Illustrative demo information.</small>
    `;

    selectBus(id, false);
}


// MAP INITIALIZATION

function initializeMap() {

    if (typeof L === "undefined") {
        showToast("Map library could not load. Check your internet connection.");
        return;
    }

    // Approximate Ballari demonstration map centre.

    map = L.map("map").setView([15.1394, 76.9214], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    buses.forEach(bus => {

        const firstPosition = bus.coordinates[0];

        const icon = L.divIcon({
            className: "",
            html: `
                <div style="
                    width:35px;
                    height:35px;
                    background:${getBusColor(bus.category)};
                    border:3px solid white;
                    border-radius:50%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:17px;
                    box-shadow:0 3px 10px #263756;
                ">🚌</div>
            `,
            iconSize: [35, 35],
            iconAnchor: [17, 17]
        });

        const marker = L.marker(firstPosition, {
            icon: icon
        }).addTo(map);

        marker.bindPopup(`
            <strong>${bus.name}</strong><br>
            ${bus.number}<br>
            ${bus.source} → ${bus.destination}<br>
            <small>SIMULATED LOCATION</small>
        `);

        marker.on("click", () => {
            selectBus(bus.id, false);
        });

        markers[bus.id] = marker;

        polylines[bus.id] = L.polyline(bus.coordinates, {
            color: getBusColor(bus.category),
            weight: 3,
            opacity: 0.65,
            dashArray: "7, 7"
        }).addTo(map);
    });

    document.getElementById("activeBusCount").textContent = buses.length;

    setTimeout(() => {
        map.invalidateSize();
    }, 300);
}


// BUS CATEGORY COLOURS

function getBusColor(category) {

    const colors = {
        Government: "#263756",
        Private: "#AF8F9D",
        City: "#6B6785",
        College: "#A1AAC4"
    };

    return colors[category] || "#E2CCCA";
}


// SELECT BUS

function selectBus(id, shouldScroll = true) {

    const bus = buses.find(item => item.id === id);

    if (!bus || !map) return;

    selectedBusId = id;

    document.getElementById("selectedBusName").textContent = bus.number;

    document.getElementById("selectedETA").textContent =
        `${bus.eta} minutes*`;

    document.getElementById("selectedDetails").innerHTML = `
        <strong>${bus.name}</strong><br><br>
        ${bus.source} → ${bus.destination}<br>
        Category: ${bus.category}<br>
        Stops: ${bus.stops.join(" → ")}<br>
        <small>SIMULATED GPS POSITION</small>
    `;

    map.setView(markers[id].getLatLng(), 15, {
        animate: true
    });

    markers[id].openPopup();

    if (shouldScroll) {
        document.getElementById("tracking").scrollIntoView({
            behavior: "smooth"
        });
    }
}


// SIMULATED BUS MOVEMENT

function updateBusLocations() {

    if (!map) return;

    buses.forEach(bus => {

        const route = bus.coordinates;

        // Move along the sample route.
        bus.position = (bus.position + 0.08) % (route.length - 1);

        const index = Math.floor(bus.position);
        const fraction = bus.position - index;

        const start = route[index];
        const end = route[index + 1];

        const latitude =
            start[0] + (end[0] - start[0]) * fraction;

        const longitude =
            start[1] + (end[1] - start[1]) * fraction;

        markers[bus.id].setLatLng([latitude, longitude]);
    });
}


// ROUTE BUTTONS

document.querySelectorAll("[data-route]").forEach(button => {

    button.addEventListener("click", () => {

        const routeType = button.dataset.route;

        const routeMap = {
            city: {
                source: "Ballari",
                destination: "Cowl Bazaar",
                category: "City"
            },

            intercity: {
                source: "Ballari",
                destination: "Hospet",
                category: "All"
            },

            college: {
                source: "Ballari",
                destination: "BITM",
                category: "College"
            }
        };

        const route = routeMap[routeType];

        busSearch.value = "";
        sourceSearch.value = route.source;
        destinationSearch.value = route.destination;

        selectedCategory = route.category;

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.toggle(
                "active",
                btn.dataset.category === route.category
            );
        });

        renderBuses();

        document.getElementById("routes").scrollIntoView({
            behavior: "smooth"
        });
    });
});


// CURRENT LOCATION DETECTION

function detectUserLocation() {

    if (!navigator.geolocation) {
        showToast("Location detection is not supported by your browser.");
        return;
    }

    showToast("Requesting your location permission...");

    navigator.geolocation.getCurrentPosition(

        position => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            if (!map) return;

            if (userMarker) {
                map.removeLayer(userMarker);
            }

            userMarker = L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup("Your current location")
                .openPopup();

            map.setView([latitude, longitude], 15);

            showToast("Your current location has been detected!");

        },

        error => {

            const messages = {
                1: "Location permission was denied.",
                2: "Your location is currently unavailable.",
                3: "Location request timed out."
            };

            showToast(
                messages[error.code] || "Unable to detect your location."
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

document.getElementById("locationButton")
    .addEventListener("click", detectUserLocation);


// MOBILE NAVIGATION

document.getElementById("menuToggle")
    .addEventListener("click", () => {

        document.getElementById("navLinks")
            .classList.toggle("show");
    });

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {
        document.getElementById("navLinks")
            .classList.remove("show");
    });
});


// APPLICATION STARTUP

function startApplication() {

    renderBuses();

    initializeMap();

    // Simulation updates every 5 seconds.
    // This is NOT real GPS tracking.

    setInterval(updateBusLocations, 5000);

    console.log("Where Is My Bus? application started.");
    console.log("DEMO MODE: All bus GPS positions are simulated.");
}

document.addEventListener("DOMContentLoaded", startApplication);
