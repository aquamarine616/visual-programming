import { useState } from 'react';

function Search({ onSearch }) {
  const [value, setValue] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (value.trim() === '') {
      return;
    }

    onSearch(value.trim());
    setValue('');
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Введите город"
        value={value}
        onChange={event => setValue(event.target.value)}
      />

      <button type="submit">Найти</button>
    </form>
  );
}

export default Search;