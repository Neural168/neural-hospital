import React from 'react';
import { Bell, Download } from 'lucide-react';
import './Topbar.css';

export default function Topbar({ incidents = [] }) {
  const activeIncidents = incidents.filter(i => i.status !== 'Resolved').length;

  return (
    <header className="topbar animate-entrance">
      <div className="topbar-actions">
        <button className="action-btn glass-panel">
          <Download size={18} />
          <span>Export Data</span>
        </button>

        <div className="status-indicator glass-panel">
          <span className="blink-dot teal"></span>
          <span>System Online</span>
        </div>

        <button className="icon-btn glass-panel notification-btn">
          <Bell size={20} />
          {activeIncidents > 0 && <span className="badge">{activeIncidents}</span>}
        </button>

        <div className="profile glass-panel">
          <img src="https://ui-avatars.com/api/?name=Neural168&background=00d4ff&color=fff" alt="Profile" className="avatar" />
          <div className="profile-info">
            <span className="name">Neural168</span>
            <span className="role">ER Director</span>
          </div>
        </div>
      </div>
    </header>
  );
}
