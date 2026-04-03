import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './ChartsWidget.css';

const SEVERITY_COLORS = {
  critical: '#ff3b3b',
  high: '#ff8c00',
  medium: '#ffeb3b',
  low: '#00d4ff'
};

export default function ChartsWidget({ incidents = [] }) {
  // 1. Severity Distribution (Pie Chart)
  const getSeverityData = () => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    incidents.forEach(inc => {
      const sev = inc.severity?.toLowerCase();
      if (counts[sev] !== undefined) counts[sev]++;
    });

    return Object.keys(counts).map(key => ({
      name: key.toUpperCase(),
      value: counts[key],
      color: SEVERITY_COLORS[key]
    })).filter(item => item.value > 0);
  };

  // 2. Today's Hourly Peak Times (Area Chart)
  const getHourlyData = () => {
    const result = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Fill 24 hours
    for (let h = 0; h < 24; h++) {
      const hourStr = String(h).padStart(2, '0');
      const hourIncidents = incidents.filter(inc => {
        // Simple string check for today's date and the hour
        return inc.time?.includes(todayStr) && inc.time?.includes(`T${hourStr}:`);
      });

      result.push({
        time: `${hourStr}:00`,
        count: hourIncidents.length
      });
    }
    return result;
  };

  const severityData = getSeverityData();
  const hourlyData = getHourlyData();

  return (
    <div className="charts-widget glass-panel animate-entrance">
      <div className="charts-grid">
        {/* Severity Distribution */}
        <div className="chart-item">
          <div className="widget-header">
            <h3>Incident Severity Distribution</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'rgba(18, 25, 41, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Peak Times */}
        <div className="chart-item">
          <div className="widget-header">
            <h3>Today's Hourly Peak Times</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#8b9bb4" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b9bb4" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(18, 25, 41, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
