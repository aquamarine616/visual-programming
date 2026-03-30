import React, { useEffect, useMemo } from 'react';

export default function BookCard({ title, authors, imageBytes }) {
  const imageUrl = useMemo(() => {
    if (!imageBytes || imageBytes.length === 0) {
      return '';
    }

    const blob = new Blob([imageBytes], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }, [imageBytes]);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div style={styles.card}>
      {imageUrl ? (
        <img src={imageUrl} alt={title} style={styles.image} />
      ) : (
        <div style={{ ...styles.image, ...styles.placeholder }}>No image</div>
      )}

      <div style={styles.title}>{title}</div>
      <div style={styles.authors}>{authors.join(', ')}</div>
    </div>
  );
}

const styles = {
  card: {
    width: '180px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  image: {
    width: '100%',
    height: '260px',
    objectFit: 'cover',
    backgroundColor: '#e5e5e5',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '14px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    lineHeight: '1.2',
    color: '#c7d2fe',
  },
  authors: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
  },
};