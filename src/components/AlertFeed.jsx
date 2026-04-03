import React, { useState } from 'react';
import { AlertCircle, Clock, MapPin, Edit2, Trash2, Check, X } from 'lucide-react';
import './AlertFeed.css';

export default function AlertFeed({ alerts = [], token }) {
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', desc: '', severity: '' });

  const timeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    const mins = Math.floor((new Date() - new Date(isoString)) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} mins ago`;
    return `${Math.floor(mins / 60)} hrs ago`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this incident?")) return;
    try {
      await fetch(`https://neural-hospital.onrender.com/api/incidents/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const handleEditClick = (alert) => {
    setEditingId(alert.id);
    setEditFormData({ title: alert.title, desc: alert.desc, severity: alert.severity });
  };

  const handleSave = async (id) => {
    try {
      await fetch(`https://neural-hospital.onrender.com/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      setEditingId(null);
    } catch (e) {
      console.error("Edit error:", e);
    }
  };

  return (
    <div className="alert-feed glass-panel">
      <div className="widget-header">
        <h3>Recent Incidents</h3>
      </div>
      
      <div className="alert-list">
        {alerts.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>No active incidents</div>
        ) : alerts.map(alert => (
          <div key={alert.id} className="alert-item group">
            <div className={`severity-indicator ${alert.severity}`}></div>
            
            {editingId === alert.id ? (
              <div className="edit-mode">
                <input 
                  autoFocus
                  className="edit-input title-input" 
                  value={editFormData.title} 
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                />
                <input 
                  className="edit-input" 
                  value={editFormData.desc} 
                  onChange={(e) => setEditFormData({...editFormData, desc: e.target.value})}
                />
                <div className="edit-row">
                  <select 
                    className="edit-select"
                    value={editFormData.severity} 
                    onChange={(e) => setEditFormData({...editFormData, severity: e.target.value})}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <div className="edit-actions">
                    <button title="Save" onClick={() => handleSave(alert.id)} className="save-btn"><Check size={14} /></button>
                    <button title="Cancel" onClick={() => setEditingId(null)} className="cancel-btn"><X size={14} /></button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert-content">
                <div className="alert-title-row">
                  <h4>{alert.title}</h4>
                  <div className="time">
                    <Clock size={12} /> {timeAgo(alert.time)}
                  </div>
                </div>
                <div className="alert-location">
                  <MapPin size={12} /> {alert.loc}
                </div>
                <div className="alert-location" style={{ marginTop: '2px', opacity: 0.8 }}>
                  👤 ผู้แจ้ง: {alert.reporterName || 'ไม่ระบุ'} | 📞 โทร: {alert.reporterPhone || 'ไม่ระบุ'}
                </div>
              </div>
            )}
            
            {/* Overlay Edit & Delete Buttons on non-edit mode */}
            {!editingId && (
              <div className="action-buttons">
                <button title="Edit" onClick={() => handleEditClick(alert)} className="action-icon edit"><Edit2 size={14}/></button>
                <button title="Delete" onClick={() => handleDelete(alert.id)} className="action-icon delete"><Trash2 size={14}/></button>
              </div>
            )}
            
            {/* Priority Indicator */}
            {!editingId && alert.severity === 'critical' && <AlertCircle size={18} className="critical-icon" color="var(--accent-red)" />}
          </div>
        ))}
      </div>
    </div>
  );
}
