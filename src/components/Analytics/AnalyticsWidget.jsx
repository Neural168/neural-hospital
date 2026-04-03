import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import './AnalyticsWidget.css';

export default function AnalyticsWidget({ incidents }) {
  // Aggregate data
  const severityData = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    incidents.forEach(i => {
      const sev = (i.severity || 'low').toLowerCase();
      if (counts[sev] !== undefined) counts[sev]++;
      else counts.low++;
    });
    return [
      { name: 'Critical', value: counts.critical, color: '#ff4d4f' },
      { name: 'High', value: counts.high, color: '#faad14' },
      { name: 'Medium', value: counts.medium, color: '#13c2c2' },
      { name: 'Low', value: counts.low, color: '#52c41a' },
    ].filter(d => d.value > 0);
  }, [incidents]);

  const typeData = useMemo(() => {
    const types = {};
    incidents.forEach(i => {
      const type = i.title || 'Other';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.keys(types).map(key => ({ name: key, count: types[key] }))
      .sort((a, b) => b.count - a.count);
  }, [incidents]);

  return (
    <div className="analytics-widget">
      <div className="analytics-header">
        <h2>KKU Incident Analytics</h2>
        <p>สถิติอุบัติเหตุและเหตุฉุกเฉิน มหาวิทยาลัยขอนแก่น</p>
      </div>

      <div className="analytics-summary-cards">
        <div className="a-card glass-panel">
          <Activity size={24} className="icon teal" />
          <div className="info">
            <span className="label">Total Incidents</span>
            <span className="value">{incidents.length}</span>
          </div>
        </div>
        <div className="a-card glass-panel">
          <AlertTriangle size={24} className="icon yellow" />
          <div className="info">
            <span className="label">High / Critical</span>
            <span className="value">{incidents.filter(i => (i.severity || '').toLowerCase() === 'critical' || (i.severity || '').toLowerCase() === 'high').length}</span>
          </div>
        </div>
        <div className="a-card glass-panel">
          <CheckCircle size={24} className="icon green" />
          <div className="info">
            <span className="label">Resolved</span>
            <span className="value">{incidents.filter(i => i.status === 'Resolved').length}</span>
          </div>
        </div>
        <div className="a-card glass-panel">
          <ShieldAlert size={24} className="icon red" />
          <div className="info">
            <span className="label">Active Cases</span>
            <span className="value">{incidents.filter(i => i.status !== 'Resolved').length}</span>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-box glass-panel">
          <h3>Severity Breakdown</h3>
          <div className="chart-container">
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(20, 20, 25, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">No data available</p>
            )}
          </div>
        </div>

        <div className="chart-box glass-panel">
            <h3>Incidents by Type</h3>
            <div className="chart-container">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#a0a0a0" tick={{ fill: '#a0a0a0', fontSize: 12 }} />
                    <YAxis stroke="#a0a0a0" tick={{ fill: '#a0a0a0', fontSize: 12 }} allowDecimals={false} />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      contentStyle={{ backgroundColor: 'rgba(20, 20, 25, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <Bar dataKey="count" fill="url(#colorCount)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="no-data">No data available</p>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
