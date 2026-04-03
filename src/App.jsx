import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import StatCard from './components/StatCard';
import MapWidget from './components/MapWidget';
import AlertFeed from './components/AlertFeed';
import ChartsWidget from './components/ChartsWidget';
import StaffWidget from './components/StaffWidget';
import AnalyticsWidget from './components/Analytics/AnalyticsWidget';
import Login from './components/Login';
import { Activity, AlertTriangle, Ambulance } from 'lucide-react';
import './App.css';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
    } else {
      localStorage.removeItem('adminToken');
    }
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    try {
      // Fetch Incidents
      const incResponse = await fetch('http://localhost:5002/api/incidents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (incResponse.ok) {
        const data = await incResponse.json();
        setIncidents(data);
      } else if (incResponse.status === 401 || incResponse.status === 403) {
        setToken(null);
      }

      // Fetch Staff
      const staffResponse = await fetch('http://localhost:5002/api/staff', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (staffResponse.ok) {
        const data = await staffResponse.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('API connection failed', error);
    }
  };

  useEffect(() => {
    fetchData(); // initial load
    const interval = setInterval(fetchData, 4000); // 4 sec polling
    return () => clearInterval(interval);
  }, [token]);

  const criticalCount = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;
  const availableStaff = staff.filter(s => s.status === 'Available').length;
  
  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <Topbar incidents={incidents} />
      
      <main className="main-content">
        {activeTab === 'dashboard' ? (
          <>
            <section className="stats-row animate-entrance">
              <StatCard 
                title="Today's Incidents" 
                value={incidents.length} 
                icon={Activity} 
                trend={12} 
                colorType="teal" 
              />
              <StatCard 
                title="Critical Cases" 
                value={criticalCount} 
                icon={AlertTriangle} 
                trend={5} 
                colorType="red" 
                isAlert={criticalCount > 0} 
              />
              <StatCard 
                title="Available Staff" 
                value={availableStaff} 
                icon={Ambulance} 
                trend={0} 
                colorType="yellow" 
              />
            </section>

            <section className="content-grid">
              <div className="map-area animate-entrance" style={{ animationDelay: '0.2s' }}>
                <MapWidget incidents={incidents} />
              </div>
              <div className="feed-area animate-entrance" style={{ animationDelay: '0.4s' }}>
                <AlertFeed alerts={incidents} token={token} />
              </div>
              <div className="charts-area animate-entrance" style={{ animationDelay: '0.6s' }}>
                <ChartsWidget incidents={incidents} />
              </div>
            </section>
          </>
        ) : activeTab === 'staff' ? (
          <section className="full-widget-area animate-entrance">
            <StaffWidget token={token} staffData={staff} refreshData={fetchData} />
          </section>
        ) : activeTab === 'analytics' ? (
          <section className="full-widget-area animate-entrance">
            <AnalyticsWidget incidents={incidents} />
          </section>
        ) : (
          <div className="placeholder-view glass-panel animate-entrance">
            <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View</h3>
            <p>This module is coming soon in the next update.</p>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
