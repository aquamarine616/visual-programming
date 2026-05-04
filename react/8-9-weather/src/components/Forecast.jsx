import { getIconUrl } from '../api.js';

function Forecast({ forecast }) {
  return (
    <section>
      <h2>Прогноз на несколько дней</h2>

      <div className="forecast">
        {forecast.map(item => {
          const info = item.weather[0];

          return (
            <article className="card forecast-card" key={item.dt}>
              <p>{formatDate(item.dt_txt)}</p>

              <img src={getIconUrl(info.icon)} alt={info.description} />

              <h3>{Math.round(item.main.temp)}°C</h3>

              <p>{info.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
}

export default Forecast;