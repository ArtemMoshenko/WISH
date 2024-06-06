var map = L.map('map').setView([55.7558, 37.6173], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker([55.7558, 37.6173]).addTo(map)
    .bindPopup('Kremlin')
    .openPopup();

L.marker([55.8319, 37.6360]).addTo(map)
    .bindPopup('VDNKh metro station')
    .openPopup();