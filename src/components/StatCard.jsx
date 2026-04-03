import React, { useState, useEffect } from 'react';
import './StatCard.css';

export default function StatCard({ title, value, icon: Icon, trend, colorType = 'default', isAlert = false }) {
  // Simulate slight live variation in numbers just for UX
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    // only if the value prop updates, sync it
    setCurrentValue(value);
  }, [value]);

  return (
    <div className={`stat-card glass-panel type-${colorType} animate-entrance`}>
      <div className="stat-header">
        <span className="title">{title}</span>
        <div className={`icon-container bg-${colorType}`}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className="stat-content">
        <div className={`value-row ${isAlert ? 'shimmer-effect' : ''}`}>
          <h2 className="value">{currentValue}</h2>
          {isAlert && <span className="blink-dot"></span>}
        </div>
        <div className={`trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
        </div>
      </div>
    </div>
  );
}
