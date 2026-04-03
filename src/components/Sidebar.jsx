import React from 'react';
import { LayoutDashboard, Map, Activity, Bell, Settings, LogOut, BarChart3, Users } from 'lucide-react';
import './Sidebar.css'; 

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'staff', label: 'Staff & Assets', icon: Users },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar glass-panel animate-entrance">
      <div className="sidebar-header shimmer-effect">
        <div className="hospital-logo">
          <Activity size={28} color="var(--accent-teal)" />
          <h2>Neural Hospital</h2>
          <span className="subtitle">Khon Kaen Branch</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <button 
            key={item.id} 
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon size={20} className="nav-icon" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item">
          <Settings size={20} className="nav-icon" />
          <span>Settings</span>
        </button>
        <button className="nav-item logout">
          <LogOut size={20} className="nav-icon" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
