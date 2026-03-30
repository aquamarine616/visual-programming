import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/api/cover', async (req, res) => {
  try {
    const { title, author } = req.query;

    if (!title) {
      return res.status(400).send('title is required');
    }

    const query = author
      ? `intitle:${title}+inauthor:${author}`
      : `intitle:${title}`;

    const googleRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
    );
    const googleData = await googleRes.json();

    const itemWithImage = googleData.items?.find(
      (item) => item.volumeInfo?.imageLinks?.thumbnail
    );

    const thumbnail = itemWithImage?.volumeInfo?.imageLinks?.thumbnail;

    if (!thumbnail) {
      return res.status(404).send('No image');
    }

    const imageRes = await fetch(thumbnail.replace('http://', 'https://'));
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