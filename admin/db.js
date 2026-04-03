const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'incidents.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Users Table and Seed Admin
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`, (err) => {
      if (err) console.error('Error creating users table', err.message);
      else {
        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
          if (!err && row.count === 0) {
            console.log('Seeding initial admin user...');
            const bcrypt = require('bcryptjs');
            const hash = bcrypt.hashSync('password123', 8);
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hash]);
          }
        });
      }
    });

    // Create Staff Table
    db.run(`CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      specialty TEXT,
      phone TEXT,
      photo TEXT
    )`, (err) => {
      if (err) console.error('Error creating staff table', err.message);
      else {
        db.get('SELECT COUNT(*) as count FROM staff', (err, row) => {
          if (!err && row.count === 0) {
            console.log('Seeding initial staff data...');
            const stmt = db.prepare('INSERT INTO staff (name, role, status, specialty, phone, photo) VALUES (?, ?, ?, ?, ?, ?)');
            stmt.run('Dr. Arisara K.', 'Doctor', 'Available', 'ER Specialist', '081-234-5678', null);
            stmt.run('Nurse Somsak P.', 'Nurse', 'In Emergency', 'Trauma Care', '082-345-6789', null);
            stmt.run('EMT Wichai T.', 'EMT', 'En Route', 'Ambulance Unit A', '083-456-7890', null);
            stmt.run('Dr. Somchai M.', 'Doctor', 'Off-Duty', 'Surgeon', '084-567-8901', null);
            stmt.run('Security Han L.', 'Security', 'On-Call', 'Night Shift', '085-678-9012', null);
            stmt.finalize();
          }
        });
      }
    });

    // Create Incidents Table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      desc TEXT NOT NULL,
      severity TEXT NOT NULL,
      reporterName TEXT,
      reporterPhone TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      time TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      } else {
        // Check if DB is empty, then seed
        db.get('SELECT COUNT(*) as count FROM incidents', (err, row) => {
          if (!err && row.count === 0) {
            console.log('Seeding initial mock data...');
            const stmt = db.prepare('INSERT INTO incidents (title, desc, severity, reporterName, reporterPhone, lat, lng, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            
            stmt.run('Multi-vehicle collision', 'Car crash on Mittraphap Rd', 'critical', 'N/A', 'N/A', 16.4422, 102.8236, new Date(Date.now() - 2 * 60000).toISOString());
            stmt.run('Motorcycle crash', 'Motorcycle collision near KKU', 'high', 'N/A', 'N/A', 16.4312, 102.8336, new Date(Date.now() - 15 * 60000).toISOString());
            stmt.run('Pedestrian struck', 'Pedestrian accident at Gate 2', 'medium', 'N/A', 'N/A', 16.4250, 102.8100, new Date(Date.now() - 45 * 60000).toISOString());
            
            stmt.finalize();
          }
        });
      }
    });
  }
});

module.exports = db;
