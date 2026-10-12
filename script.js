const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temp');
const windEl = document.getElementById('wind');
const conditionEl = document.getElementById('condition');
const forecastTbody = document.getElementById('forecast-tbody');
const loadingEl = document.getElementById('loading');

// Weather code meaning mapper based on lab sheet reference
function getWeatherMeaning(code) {
    if (code === 0) return "Clear sky";
    if (code >= 1 && code <= 3) return "Mainly clear / partly cloudy";
    if (code === 45 || code === 48) return "Fog";
    if (code >= 51 && code <= 57) return "Drizzle";
    if (code >= 61 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Rain showers";
    if (code >= 95 && code <= 99) return "Thunderstorm";
    return "Unknown";
}

searchBtn.addEventListener('click', async () => {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        alert('Please enter a city name!');
        return;
    }

    try {
        loadingEl.style.display = 'block';
        forecastTbody.innerHTML = '';

        // Task 2: Geocoding API to get latitude and longitude
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert('City not found!');
            loadingEl.style.display = 'none';
            return;
        }

        const { name, latitude, longitude, country } = geoData.results[0];
        console.log(`Coordinates for ${name}: Lat ${latitude}, Lon ${longitude}`);

        // Task 3 & 4: Fetch Forecast and Current Weather data
        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
        
        const weatherResponse = await fetch(forecastUrl);
        const weatherData = await weatherResponse.json();

        // Update Current Weather Card
        cityNameEl.textContent = `${name}${country ? ', ' + country : ''}`;
        tempEl.textContent = weatherData.current_weather.temperature;
        windEl.textContent = weatherData.current_weather.windspeed;
        conditionEl.textContent = getWeatherMeaning(weatherData.current_weather.weathercode);

        // Populate 5-Day Forecast Table (limited strictly to 5 days)
        const daily = weatherData.daily;
        const limit = Math.min(5, daily.time.length);
        
        for (let i = 0; i < limit; i++) {
            const row = document.createElement('tr');
            
            const isRainy = daily.precipitation_sum[i] > 0;
            if (isRainy) {
                row.classList.add('rainy-day');
            }

            row.innerHTML = `
                <td>${daily.time[i]}</td>
                <td>${getWeatherMeaning(daily.weathercode[i])}</td>
                <td>${daily.temperature_2m_max[i]}</td>
                <td>${daily.temperature_2m_min[i]}</td>
                <td>${daily.precipitation_sum[i]}</td>
            `;
            forecastTbody.appendChild(row);
        }

    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('An error occurred while fetching data. Please check your internet connection.');
    } finally {
        loadingEl.style.display = 'none';
    }
});