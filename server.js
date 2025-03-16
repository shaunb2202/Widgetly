const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname));

const db = new sqlite3.Database('feedback.db', (err) => {
  if (err) console.error('Database error:', err);
  console.log('Connected to SQLite database');
});

db.run(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rating INTEGER,
    widget_type TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.post('/feedback', (req, res) => {
  const { rating, widget_type } = req.body;
  db.run('INSERT INTO feedback (rating, widget_type) VALUES (?, ?)', [rating, widget_type], (err) => {
    if (err) {
      console.error('Error saving feedback:', err);
      res.status(500).send('Error saving feedback');
    } else {
      console.log(`Feedback saved: Rating ${rating} from ${widget_type}`);
      if (widget_type === 'email') {
        res.redirect('/thank-you.html');
      } else {
        res.send('Feedback received');
      }
    }
  });
});

app.get('/feedback-data', (req, res) => {
  db.all('SELECT * FROM feedback', [], (err, rows) => {
    if (err) {
      console.error('Error fetching feedback:', err);
      res.status(500).send('Error fetching feedback');
    } else {
      res.json(rows);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});