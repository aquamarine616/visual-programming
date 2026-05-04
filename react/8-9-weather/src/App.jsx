import { useEffect, useState } from 'react';
import {
  getAirPollution,
  getCityCoordinates,
  getWeatherForecast
} from './api.js';

import Search from './components/Search.jsx';
import Weather from './components/Weather.jsx';
import Forecast from './components/Forecast.jsx';
import Air from './components/Air.jsx';

function App() {
  const [city, setCity] = useState('Москва');
  const [location, setLocation] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [air, setAir] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadWeather(cityName) {
    try {
      setLoading(true);
      setError('');

      const coordinates = await getCityCoordinates(cityName);

      const weatherData = await getWeatherForecast(
        coordinates.lat,
        coordinates.lon
      );

      const airData = await getAirPollution(
        coordinates.lat,
        coordinates.lon
      );

      setLocation({
        name: coordinates.local_names?.ru || coordinates.name,
        country: coordinates.country
      });

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

    const intervalId = setInterval(() => {
      loadWeather(city);
    }, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
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