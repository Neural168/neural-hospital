import React, { useEffect, useState } from 'react';
import { User, Phone, Shield, ShieldAlert, CheckCircle, Clock, Navigation, Moon, AlertOctagon, Edit3, Camera } from 'lucide-react';
import './StaffWidget.css';

export default function StaffWidget({ token }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Doctor',
    status: 'Available',
    specialty: '',
    phone: '',
    photo: ''
  });

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/staff', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (err) {
      console.error('Failed to fetch staff', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing && formData.id 
        ? `http://localhost:5002/api/staff/${formData.id}`
        : `http://localhost:5002/api/staff`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert(isEditing ? '✅ Update Member Success!' : '✅ Register Member Success!');
        setIsAdding(false);
        setIsEditing(false);
        setFormData({ name: '', role: 'Doctor', status: 'Available', specialty: '', phone: '', photo: '' });
        refreshData();
      } else {
        const errData = await response.json();
        alert('❌ Error: ' + (errData.error || 'Failed to save'));
      }
    } catch (err) {
      console.error('Failed to save staff', err);
      alert('❌ Connection failed! Check if backend server is running.');
    }
  };

  const handleEditClick = (member) => {
    setFormData(member);
    setIsEditing(true);
    setIsAdding(true);
    setSelectedMember(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Resize to max 400px while maintaining aspect ratio
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 400;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress quality to 0.7
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setFormData({ ...formData, photo: compressedBase64 });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      const response = await fetch(`http://localhost:5002/api/staff/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSelectedMember(null);
        refreshData();
      }
    } catch (err) {
      console.error('Failed to delete staff', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return <CheckCircle size={14} color="#4caf50" />;
      case 'busy': return <Clock size={14} color="#ffeb3b" />;
      case 'in emergency': return <AlertOctagon size={14} color="#ff3b3b" />;
      case 'en route': return <Navigation size={14} color="#00d4ff" />;
      case 'on-call': return <Shield size={14} color="#a855f7" />;
      case 'off-duty': return <Moon size={14} color="#8b9bb4" />;
      default: return <Shield size={14} color="#8b9bb4" />;
    }
  };

  if (loading) return <div className="loading-container">Loading Staff Directory...</div>;

  return (
    <div className="staff-widget glass-panel animate-entrance">
      <div className="widget-header">
        <div className="header-with-icon">
          <User className="header-icon" />
          <h3>Staff & Resource Directory</h3>
        </div>
        <button className="add-staff-btn" onClick={() => setIsAdding(true)}>+ Add Member</button>
      </div>

      {isAdding && (
        <div className="form-overlay active">
          <form className="add-staff-form glass-panel" onSubmit={handleSubmit}>
            <h3>{isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
            
            <div className="photo-upload-section">
              <div className="photo-preview-large">
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" />
                ) : (
                  <Camera size={32} color="var(--text-muted)" />
                )}
              </div>
              <label className="upload-label">
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{display: 'none'}} />
                {formData.photo ? 'Change Photo' : 'Upload Profile Photo'}
              </label>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  required
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Dr. Somsak P."
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option>Doctor</option>
                  <option>Nurse</option>
                  <option>EMT</option>
                  <option>Security</option>
                </select>
              </div>
              <div className="form-group">
                <label>Specialty / Note</label>
                <input 
                  type="text" 
                  value={formData.specialty} 
                  onChange={e => setFormData({...formData, specialty: e.target.value})}
                  placeholder="ER Specialist"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="08X-XXX-XXXX"
                />
              </div>
              <div className="form-group">
                <label>Initial Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option>Available</option>
                  <option>Busy</option>
                  <option>In Emergency</option>
                  <option>En Route</option>
                  <option>On-Call</option>
                  <option>Off-Duty</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => { setIsAdding(false); setIsEditing(false); }}>Cancel</button>
              <button type="submit" className="submit-btn highlight">{isEditing ? 'Update Profile' : 'Register Member'}</button>
            </div>
          </form>
        </div>
      )}

      {selectedMember && (
        <div className="form-overlay active" onClick={() => setSelectedMember(null)}>
          <div className="profile-modal glass-panel" onClick={e => e.stopPropagation()}>
            <button className="edit-profile-btn-floating" onClick={() => handleEditClick(selectedMember)}>
              <Edit3 size={18} />
            </button>
            <div className="profile-header">
              <div className="profile-avatar large">
                {selectedMember.photo ? (
                  <img src={selectedMember.photo} alt={selectedMember.name} className="profile-img-fill" />
                ) : (
                  selectedMember.name.charAt(0)
                )}
              </div>
              <div className="profile-titles">
                <h2>{selectedMember.name}</h2>
                <span className="profile-role-tag">{selectedMember.role}</span>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="detail-item">
                <label>Specialty</label>
                <div className="detail-value">{selectedMember.specialty || 'General'}</div>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <div className={`detail-value status-color ${selectedMember.status.toLowerCase().replaceAll(' ', '-')}`}>
                  {selectedMember.status}
                </div>
              </div>
              <div className="detail-item">
                <label>Contact Number</label>
                <div className="detail-value">{selectedMember.phone || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <label>Staff ID</label>
                <div className="detail-value">#STF-{selectedMember.id.toString().padStart(4, '0')}</div>
              </div>
            </div>

            <div className="profile-actions">
              <button 
                className="delete-member-btn" 
                onClick={() => handleDelete(selectedMember.id)}
              >
                Remove from Database
              </button>
              <button className="close-profile-btn" onClick={() => setSelectedMember(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="staff-grid">
        {staff.map((member, index) => (
          <div key={member.id} 
               className={`staff-card ${member.status.toLowerCase().replaceAll(' ', '-')}`} 
               style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="staff-avatar">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="staff-img-fill" />
              ) : (
                member.name.charAt(0)
              )}
            </div>
            <div className="staff-info">
              <h4>{member.name}</h4>
              <span className="staff-role">{member.role} • {member.specialty}</span>
              <div className="staff-meta">
                <span className={`status-badge ${member.status.toLowerCase()}`}>
                  {getStatusIcon(member.status)}
                  {member.status}
                </span>
                <span className="staff-phone">
                  <Phone size={12} />
                  {member.phone}
                </span>
              </div>
            </div>
            <button className="view-details-btn" onClick={() => setSelectedMember(member)}>View Full Profile</button>
          </div>
        ))}
      </div>
    </div>
  );
}
