import { useEffect, useState } from 'react';
import {
  getAirPollution,
  getCoords,
  getForecast,
  getPlaceByCoords
} from './api.js';

import Search from './components/Search.jsx';
import Weather from './components/Weather.jsx';
import Forecast from './components/Forecast.jsx';
import Air from './components/Air.jsx';

function App() {
  const [city, setCity] = useState('Новосибирск');
  const [location, setLocation] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [air, setAir] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function parseCoordinates(value) {
    const parts = value.split(',').map(part => part.trim());

    if (parts.length !== 2) {
      return null;
    }

    const lat = Number(parts[0]);
    const lon = Number(parts[1]);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return null;
    }

    return { lat, lon };
  }

  async function loadWeather(value) {
    try {
      setLoading(true);
      setError('');

      let coordinates;
      let locationInfo;

      const coordsFromInput = parseCoordinates(value);

      if (coordsFromInput) {
        coordinates = coordsFromInput;

        const places = await getPlaceByCoords(coordinates.lat, coordinates.lon);
        const place = places[0];

        if (place) {
          locationInfo = {
            name: place.local_names?.ru || place.name,
            country: place.country
          };
        } else {
          locationInfo = {
            name: `Координаты: ${coordinates.lat}, ${coordinates.lon}`,
            country: ''
          };
        }
      } else {
        const coords = await getCoords(value);

        coordinates = {
          lat: coords.lat,
          lon: coords.lon
        };

        locationInfo = {
          name: coords.local_names?.ru || coords.name,
          country: coords.country
        };
      }

      const weatherData = await getForecast(coordinates.lat, coordinates.lon);
      const airData = await getAirPollution(coordinates.lat, coordinates.lon);

      setLocation(locationInfo);
      setForecast(weatherData.list);
      setAir(airData.list[0]);
    } catch (err) {
      setError(err.message);
      setLocation(null);
      setForecast([]);
      setAir(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather(city);

    const timer = setInterval(() => {
      loadWeather(city);
    }, 60 * 60 * 1000);

    return () => clearInterval(timer);
  }, [city]);

  const currentWeather = forecast[0];

  const weatherClass = currentWeather
    ? currentWeather.weather[0].main.toLowerCase()
    : 'default';

  return (
    <main className={`app ${weatherClass}`}>
      <div className="container">
        <h1>Прогноз погоды</h1>

        <Search onSearch={setCity} />

        {loading && <p className="message">Загрузка...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && currentWeather && location && (
          <>
            <Weather location={location} weather={currentWeather} />
            <Air air={air} />
            <Forecast forecast={forecast} />
          </>
        )}
      </div>
    </main>
  );
}

export default App;