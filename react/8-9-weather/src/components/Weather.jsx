import { getIconUrl } from '../api.js';

function Weather({ location, weather }) {
  const info = weather.weather[0];

  return (
    <section className="card weather">
      <div>
        <h2>
          {location.name}, {location.country}
        </h2>

        <p className="temperature">{Math.round(weather.main.temp)}°C</p>

        <p className="description">{info.description}</p>

        <p>Ощущается как: {Math.round(weather.main.feels_like)}°C</p>
        <p>Влажность: {weather.main.humidity}%</p>
        <p>Ветер: {weather.wind.speed} м/с</p>
      </div>

      <img src={getIconUrl(info.icon)} alt={info.description} />
    </section>
  );
}

export default Weather;