const defaultLocation = 'Berlin';

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const cityElement = document.getElementById('city');
const dateElement = document.getElementById('date');
const temperatureElement = document.getElementById('temperature');
const weatherIconElement = document.getElementById('weather-icon');
const feelsLikeElement = document.getElementById('feels-like');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const precipitationElement = document.getElementById('precipitation');
const dailyRow = document.getElementById('daily-row');
const statusElement = document.getElementById('status-message');

function showStatus(message) {
  if (!statusElement) return;
  statusElement.textContent = message;
}

function getWeatherIcon(code) {
  const iconMap = {
    0: '☀️',
    1: '🌤️',
    2: '⛅',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌦️',
    55: '🌦️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    71: '🌨️',
    73: '🌨️',
    75: '🌨️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️'
  };

  return iconMap[code] || '🌤️';
}

function formatDayLabel(dateString, index) {
  if (index === 0) return 'Today';

  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short'
  });
}

function renderWeather(data, location) {
  const current = data.current;
  const daily = data.daily;

  cityElement.textContent = `${location.name}, ${location.country}`;
  dateElement.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  temperatureElement.textContent = `${Math.round(current.temperature_2m)}°`;
  weatherIconElement.textContent = getWeatherIcon(current.weather_code);
  feelsLikeElement.textContent = `${Math.round(current.apparent_temperature)}°`;
  humidityElement.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  windElement.textContent = `${Math.round(current.wind_speed_10m)} mph`;
  precipitationElement.textContent = `${Math.round(current.precipitation_probability)}%`;

  dailyRow.innerHTML = '';

  daily.time.slice(0, 5).forEach((day, index) => {
    const card = document.createElement('article');
    card.className = 'daily-card';

    card.innerHTML = `
      <p class="daily-day">${formatDayLabel(day, index)}</p>
      <div class="daily-icon">${getWeatherIcon(daily.weather_code[index])}</div>
      <p class="daily-temps">${Math.round(daily.temperature_2m_max[index])}° / ${Math.round(daily.temperature_2m_min[index])}°</p>
      <p class="daily-precip">Rain ${Math.round(daily.precipitation_probability_max[index])}%</p>
    `;

    dailyRow.appendChild(card);
  });

  showStatus('');
}

async function fetchWeather(location) {
  try {
    const geocodeResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    );
    const geocodeData = await geocodeResponse.json();

    if (!geocodeData.results?.length) {
      throw new Error('Location not found. Try another city.');
    }

    const { name, country, latitude, longitude } = geocodeData.results[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`
    );
    const weatherData = await weatherResponse.json();

    renderWeather(weatherData, { name, country });
  } catch (error) {
    showStatus(error.message || 'Unable to load weather right now.');
  }
}

searchButton.addEventListener('click', () => {
  const location = searchInput.value.trim();
  if (!location) {
    showStatus('Please enter a city name.');
    return;
  }

  fetchWeather(location);
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchButton.click();
  }
});

fetchWeather(defaultLocation);