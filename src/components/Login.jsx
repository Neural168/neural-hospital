import React, { useState } from 'react';
import './Login.css';

export default function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5002/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
      } else {
        setErrorMsg(data.error || 'Login failed');
      }
    } catch (err) {
      setErrorMsg('Cannot connect to server');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Admin Authentication</h2>
        <p className="subtitle">Secure Command Center</p>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Enter your username"
            required
          />

          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password"
            required
          />

          <button type="submit" className="login-btn">Secure Login</button>
        </form>

        {errorMsg && <div className="login-error">{errorMsg}</div>}
      </div>
    </div>
  );
}
