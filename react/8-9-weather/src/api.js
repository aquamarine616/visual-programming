const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

function checkApiKey() {
  if (!API_KEY) {
    throw new Error('Добавьте API-ключ в файл .env');
  }
}

async function fetchData(url, errorMessage) {
  checkApiKey();

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getCityCoordinates(city) {
  const url = `${GEO_URL}?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;

  const data = await fetchData(url, 'Не удалось найти город');

  if (data.length === 0) {
    throw new Error('Город не найден');
  }

  return data[0];
}

export async function getWeatherForecast(lat, lon) {
  const url = `${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`;

  return fetchData(url, 'Не удалось получить прогноз погоды');
}

export async function getAirPollution(lat, lon) {
  const url = `${AIR_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  return fetchData(url, 'Не удалось получить данные о качестве воздуха');
}

export function getIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}