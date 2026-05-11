function Air({ air }) {
  if (!air) {
    return null;
  }

  const quality = {
    1: 'Отличное',
    2: 'Хорошее',
    3: 'Среднее',
    4: 'Плохое',
    5: 'Очень плохое'
  };

  return (
    <section className="card">
      <h2>Качество воздуха</h2>

      <p>Оценка: {quality[air.main.aqi]}</p>
      <p>PM2.5: {air.components.pm2_5}</p>
      <p>PM10: {air.components.pm10}</p>
      <p>CO: {air.components.co}</p>
    </section>
  );
}

export default Air;