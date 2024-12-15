// app.js
const API_KEY = '1810d5f4b037b1f6ea4692c6b589d8ba';
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const weeklyForecastDiv = document.getElementById('weekly-forecast');
const favoritesList = document.getElementById('favorites-list');
const hourlyForecast = document.getElementById('hourly-forecast');
const themeToggleButton = document.getElementById('toggle-theme');

// State
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Event Listeners
document.getElementById('search-btn').addEventListener('click', searchWeather);
document.getElementById('add-favorite').addEventListener('click', addToFavorites);
themeToggleButton.addEventListener('click', toggleTheme);
window.onload = loadFavorites;

// Search weather by city
function searchWeather() {
    const city = document.getElementById('city-input').value;
    if (city) {
        fetchWeather(city);
    } else {
        alert('Please enter a city name.');
    }
}

// Fetch weather by city
function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            fetchForecast(data.coord.lat, data.coord.lon);
        })
        .catch(() => alert('City not found!'));
}

// Fetch 5-day hourly forecast
function fetchForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list);
            displayWeeklyForecast(data.list);
        })
        .catch(() => alert('Unable to fetch forecast.'));
}

// Display current weather
function displayCurrentWeather(data) {
    currentWeatherDiv.style.display = 'block';
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('temperature').textContent = `Temperature: ${data.main.temp}°C`;
    document.getElementById('description').textContent = `Condition: ${data.weather[0].description}`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
}

// Display hourly forecast
function displayHourlyForecast(data) {
    forecastDiv.style.display = 'block';
    hourlyForecast.innerHTML = '';
    const hourlyData = data.slice(0, 8); // Next 8 intervals (3-hour gap)
    hourlyData.forEach(hour => {
        const item = document.createElement('div');
        item.className = 'hourly-item';
        item.innerHTML = `
            <p>${new Date(hour.dt_txt).toLocaleTimeString()}</p>
            <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="Weather Icon">
            <p>${hour.main.temp}°C</p>
        `;
        hourlyForecast.appendChild(item);
    });
}

// Display weekly forecast
function displayWeeklyForecast(data) {
    weeklyForecastDiv.style.display = 'block';
    const dailyData = data.filter(item => item.dt_txt.includes('12:00:00'));
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';
    dailyData.forEach(day => {
        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather Icon">
            <p>${day.main.temp}°C</p>
        `;
        forecastContainer.appendChild(item);
    });
}

// Add city to favorites
function addToFavorites() {
    const cityName = document.getElementById('city-name').textContent;
    if (cityName && !favorites.includes(cityName)) {
        favorites.push(cityName);
        saveFavorites();
        loadFavorites();
    }
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Load favorites
function loadFavorites() {
    favoritesList.innerHTML = '';
    favorites.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => fetchWeather(city));
        favoritesList.appendChild(li);
    });
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark');
    themeToggleButton.textContent = 
        document.body.classList.contains('dark') ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}
