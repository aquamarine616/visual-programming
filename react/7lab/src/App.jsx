import React, { useEffect, useState } from 'react';
import BookCard from './BookCard';

async function getCoverBytes(book) {
  try {
    const author = book.authors?.[0] || '';
    const response = await fetch(
      `http://localhost:3001/api/cover?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(author)}`
    );

    if (!response.ok) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    return null;
  }
}

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      try {
        const res = await fetch('https://fakeapi.extendsclass.com/books');
        const data = await res.json();

        const booksWithImages = await Promise.all(
          data.slice(0, 8).map(async (book) => ({
            ...book,
            imageBytes: await getCoverBytes(book),
          }))
        );

        setBooks(booksWithImages);
      } catch (error) {
        console.error('Ошибка загрузки книг:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  if (loading) {
    return <div style={styles.page}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.grid}>
        {books.map((book) => (
          <BookCard
            key={book.id}
            title={book.title}
            authors={book.authors}
            imageBytes={book.imageBytes}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '24px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#0b1020',
    minHeight: '100vh',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
};