const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

function checkApiKey() {
  if (!API_KEY) {
    throw new Error('API-ключ не найден. Проверь файл .env');
  }
}

async function checkResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Неверный или ещё не активированный API-ключ OpenWeather');
    }

    if (response.status === 429) {
      throw new Error('Превышен лимит запросов OpenWeather');
    }

    throw new Error(data.message || 'Ошибка при запросе к OpenWeather');
  }

  return data;
}

export async function getCoords(city) {
  checkApiKey();

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    city
  )}&limit=1&appid=${API_KEY}`;

  const response = await fetch(url);
  const data = await checkResponse(response);

  if (!data.length) {
    throw new Error('Город не найден');
  }

  return data[0];
}

export async function searchCities(query) {
  checkApiKey();

  if (query.trim().length < 2) {
    return [];
  }

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=5&appid=${API_KEY}`;

  const response = await fetch(url);
  return checkResponse(response);
}

export async function getPlaceByCoords(lat, lon) {
  checkApiKey();

  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;

  const response = await fetch(url);
  return checkResponse(response);
}

export async function getForecast(lat, lon) {
  checkApiKey();

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`;

  const response = await fetch(url);
  return checkResponse(response);
}

export async function getAirPollution(lat, lon) {
  checkApiKey();

  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  const response = await fetch(url);
  return checkResponse(response);
}

export function getIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function getCityTitle(city) {
  const name = city.local_names?.ru || city.name;

  if (city.state) {
    return `${name}, ${city.state}, ${city.country}`;
  }

  return `${name}, ${city.country}`;
}