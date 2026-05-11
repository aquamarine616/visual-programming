import { useEffect, useState } from 'react';
import { getCityTitle, searchCities } from '../api.js';

function Search({ onSearch }) {
  const [value, setValue] = useState('');
  const [cities, setCities] = useState([]);
  const [showList, setShowList] = useState(false);

  function looksLikeCoordinates(text) {
    return text.includes(',');
  }

  useEffect(() => {
    if (value.trim().length < 2 || looksLikeCoordinates(value)) {
      setCities([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const result = await searchCities(value);
        setCities(result);
        setShowList(true);
      } catch {
        setCities([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  function handleSubmit(event) {
    event.preventDefault();

    if (value.trim() === '') {
      return;
    }

    onSearch(value.trim());
    setShowList(false);
  }

  function chooseCity(city) {
    const cityName = city.local_names?.ru || city.name;

    setValue(getCityTitle(city));
    setShowList(false);
    onSearch(cityName);
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <div className="search-wrapper">
        <input
          value={value}
          placeholder="Введите город или координаты: 55.0084, 82.9357"
          onChange={event => {
            setValue(event.target.value);
            setShowList(true);
          }}
        />

        {showList && cities.length > 0 && (
          <ul className="cities-list">
            {cities.map(city => (
              <li
                key={`${city.name}-${city.lat}-${city.lon}`}
                onClick={() => chooseCity(city)}
              >
                {getCityTitle(city)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="submit">Найти</button>
    </form>
  );
}

export default Search;