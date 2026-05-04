import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is working');
});

async function findCoverUrl(title, author) {
  const queries = [
    author ? `${title} ${author}` : title,
    title,
  ];

  for (const q of queries) {
    const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}${
      author ? `&author=${encodeURIComponent(author)}` : ''
    }`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const doc = searchData.docs?.find(
      (item) => item.cover_i || (item.isbn && item.isbn.length > 0)
    );

    if (!doc) continue;

    if (doc.isbn && doc.isbn.length > 0) {
      return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
    }

    if (doc.cover_i) {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
    }
  }

  return null;
}

app.get('/api/cover', async (req, res) => {
  try {
    const { title, author } = req.query;

    if (!title) {
      return res.status(400).send('title is required');
    }

    const coverUrl = await findCoverUrl(title, author);

    if (!coverUrl) {
      return res.status(404).send('No image');
    }

    const imageRes = await fetch(coverUrl);

    if (!imageRes.ok) {
      return res.status(404).send('Image not found');
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set('Content-Type', contentType);
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.listen(3001, () => {
  console.log('Server started on http://localhost:3001');
});