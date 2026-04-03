const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 5002;
const SECRET_KEY = 'YOUR_SUPER_SECRET_KEY'; // In production, move to Environment Variables

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

// --- Login Route ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ token, username: user.username });
  });
});

// Get all incidents (Protected for Dashboard use)
app.get('/api/incidents', authenticateToken, (req, res) => {
  db.all('SELECT * FROM incidents ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Map data to match frontend's expected properties
    const mappedIncidents = rows.map(r => ({
      id: r.id,
      title: r.title,
      desc: r.desc,
      severity: r.severity,
      reporterName: r.reporterName,
      reporterPhone: r.reporterPhone,
      loc: r.desc, // Using desc for loc string simplified
      time: r.time,
      pos: [r.lat, r.lng]
    }));
    
    res.json(mappedIncidents);
  });
});

// Get all staff (Protected)
app.get('/api/staff', authenticateToken, (req, res) => {
  db.all('SELECT * FROM staff ORDER BY role ASC, name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create a new staff member (Protected)
app.post('/api/staff', authenticateToken, (req, res) => {
  const { name, role, status, specialty, phone, photo } = req.body;
  if (!name || !role || !status) return res.status(400).json({ error: 'Missing required staff fields' });

  const stmt = db.prepare('INSERT INTO staff (name, role, status, specialty, phone, photo) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run([name, role, status, specialty, phone, photo], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, role, status, specialty, phone, photo });
  });
});

// Update a staff member (Protected)
app.put('/api/staff/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, role, status, specialty, phone, photo } = req.body;
  if (!name || !role || !status) return res.status(400).json({ error: 'Missing required staff fields' });

  const sql = `UPDATE staff SET name = ?, role = ?, status = ?, specialty = ?, phone = ?, photo = ? WHERE id = ?`;
  db.run(sql, [name, role, status, specialty, phone, photo, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Delete a staff member (Protected)
app.delete('/api/staff/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM staff WHERE id = ?', id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Create a new incident
app.post('/api/incidents', (req, res) => {
  const { title, desc, severity, reporterName, reporterPhone, lat, lng } = req.body;
  
  if (!title || !desc || !severity || !lat || !lng) {
    return res.status(400).json({ error: 'Missing required incident fields' });
  }

  const time = new Date().toISOString();
  
  const stmt = db.prepare('INSERT INTO incidents (title, desc, severity, reporterName, reporterPhone, lat, lng, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run([title, desc, severity, reporterName, reporterPhone, lat, lng, time], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ 
      id: this.lastID, title, desc, severity, reporterName, reporterPhone, lat, lng, time 
    });
  });
});

// Delete an incident (Protected)
app.delete('/api/incidents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM incidents WHERE id = ?', id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Update an incident (Protected)
app.put('/api/incidents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, desc, severity } = req.body;
  if (!title || !desc || !severity) return res.status(400).json({ error: 'Missing fields' });
  db.run(
    'UPDATE incidents SET title = ?, desc = ?, severity = ? WHERE id = ?',
    [title, desc, severity, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Admin Backend Server is running on http://localhost:${PORT}`);
});

// Keep event loop alive
setInterval(() => {}, 1000 * 60 * 60);
