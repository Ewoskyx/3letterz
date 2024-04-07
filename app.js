document.addEventListener("DOMContentLoaded", () => {
    const display = document.getElementById("display");
    const inputCode = document.getElementById("inputCode");
    const inputCity = document.getElementById("inputCity");
    const inputAirport = document.getElementById("inputAirport");
    const inputCountry = document.getElementById("inputCountry");
    const mapModal = document.getElementById("map-modal");
    const closeBtn = document.getElementById("close-btn");

    let data;
    let map;
    let marker = null;
    let tooltip = null;

    const loadData = async () => {
        try {
            const response = await fetch("filtered_data.json");
            if (!response.ok) {
                throw new Error("Dosya yüklenemedi");
            }
            data = await response.json();
        } catch (error) {
            console.error(error);
        }
    };

    loadData();

    const filterData = (query, field) => {
        if (!query) return [];
        return data.filter(item => item[field].toLowerCase().includes(query.toLowerCase()));
    };

    const displayResults = () => {
        const queryCode = inputCode.value;
        const queryCity = inputCity.value;
        const queryAirport = inputAirport.value;
        const queryCountry = inputCountry.value;

        const filteredData = filterData(queryCode, 'iata_code')
            .concat(filterData(queryCity, 'city'))
            .concat(filterData(queryAirport, 'name'))
            .concat(filterData(queryCountry, 'country'));

        display.innerHTML = filteredData.map(item => {
            return `
                <div class="container" data-lat="${item.latitude}" data-lng="${item.longitude}" data-icao="${item.iata_code}" data-name="${item.name}">
                    <p class="iata">IATA Code: <b>${item.iata_code}</b></p>
                    <p class="city">City: <b>${item.city}</b></p>
                    <p class="airport">Airport: <b>${item.name}</b></p>
                    <p class="country">Country: <b>${item.country}</b></p>
                </div>
            `;
        }).join("");

        addMapClickListener();
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            displayResults();
        }
    };

    inputCode.addEventListener("keydown", handleKeyPress);
    inputCity.addEventListener("keydown", handleKeyPress);
    inputAirport.addEventListener("keydown", handleKeyPress);
    inputCountry.addEventListener("keydown", handleKeyPress);

    const addMapClickListener = () => {
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
            container.addEventListener('click', () => {
                const lat = parseFloat(container.getAttribute('data-lat'));
                const lng = parseFloat(container.getAttribute('data-lng'));
                const icao = container.getAttribute('data-icao');
                const airport = container.getAttribute('data-name');
                if (!isNaN(lat) && !isNaN(lng)) {
                    showMap(lat, lng, icao, airport);
                }
            });
        });
    };


const showMap = (latitude, longitude, icao, airport) => {
    if (!map) {
        map = L.map('map').setView([latitude, longitude], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    } else {
        map.setView([latitude, longitude], 10);
    }

    if (marker) {
        map.removeLayer(marker);
    }

    const airplaneIcon = L.icon({
        iconUrl: './airplane.png',
        iconSize: [32, 32], 
        iconAnchor: [16, 16], 
        popupAnchor: [0, -16] 
    });
    
    marker = L.marker([latitude, longitude], { icon: airplaneIcon }).addTo(map);

    marker.on('mouseover', function (e) {
        if (!tooltip) {
            tooltip = L.tooltip({
                direction: 'top',
                permanent: true,
                className: 'marker-tooltip',
                offset: [50, -40],
            }).setContent(`${icao} <hr> ${airport}`);

            marker.bindTooltip(tooltip).openTooltip();
        }
    });

    marker.on('mouseout', function (e) {
        if (tooltip) {
            map.closeTooltip(tooltip);
            tooltip = null;
        }
    });

    mapModal.style.display = "block";
    map.invalidateSize();
};

    window.addEventListener('click', (event) => {
        if (event.target === mapModal) {
            mapModal.style.display = 'none';
        }
    });

    closeBtn.addEventListener("click", () => {
        mapModal.style.display = "none";
    });
});
