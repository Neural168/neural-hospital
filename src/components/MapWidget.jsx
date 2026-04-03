import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapWidget.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getAnimatedIcon = (color, isCritical = false) => {
  return L.divIcon({
    className: 'custom-dot-marker',
    html: `
      <div class="dot-container ${isCritical ? 'critical' : ''}" style="--dot-color: ${color}">
        <div class="dot-core"></div>
        <div class="dot-pulse"></div>
        <div class="dot-pulse-delayed"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const severityIcons = {
  critical: getAnimatedIcon('#ff3b3b', true),
  high: getAnimatedIcon('#ff9800'),
  medium: getAnimatedIcon('#ffeb3b'),
  low: getAnimatedIcon('#4caf50')
};

const defaultIcon = getAnimatedIcon('#00d4ff');

export default function MapWidget({ incidents = [] }) {
  const mapRef = useRef(null);

  // Auto center on new incidents if desired (Disabled to let users pan normally)
  
  return (
    <div className="map-widget glass-panel">
      <div className="widget-header">
        <h3>Live Incident Map</h3>
        <span className="live-badge"><span className="blink-dot teal"></span> Live API Sync</span>
      </div>
      <div className="map-container-wrapper">
        <MapContainer center={[16.4600, 102.8240]} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '12px' }} ref={mapRef}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <Polygon 
            positions={[
              [16.4850, 102.8100],
              [16.4850, 102.8380],
              [16.4350, 102.8380],
              [16.4350, 102.8100]
            ]} 
            pathOptions={{ color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' }}
          >
            <Popup className="custom-popup">บริเวณมหาวิทยาลัยขอนแก่น (KKU Boundary)</Popup>
          </Polygon>
          {incidents.map((inc, index) => {
            // Ensure coordinates are numbers to prevent string concatenation
            const lat = parseFloat(inc.pos?.[0]);
            const lng = parseFloat(inc.pos?.[1]);

            if (isNaN(lat) || isNaN(lng)) return null;

            // Add a tiny visual offset based on index so overlapping pins "stack" diagonally
            const visualPos = [
              lat + (index * 0.00012), 
              lng + (index * 0.00012)
            ];

            const sev = (inc.severity || 'medium').toLowerCase();
            const icon = severityIcons[sev] || defaultIcon;

            return (
            <Marker key={inc.id} position={visualPos} icon={icon}>
              <Popup className="custom-popup">
                <div style={{ minWidth: '150px' }}>
                  <strong style={{ color: 'var(--accent-teal)', textTransform: 'capitalize' }}>
                    {sev} - {inc.title}
                  </strong>
                  <p style={{ margin: '8px 0', fontSize: '13px', lineHeight: '1.4' }}>{inc.desc}</p>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0' }}/>
                  <div style={{ fontSize: '11px', color: '#8b9bb4', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>👤 ผู้แจ้ง: {inc.reporterName || 'ไม่ระบุ'}</span>
                    <span>📞 โทร: {inc.reporterPhone || 'ไม่ระบุ'}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )})}
        </MapContainer>
      </div>
    </div>
  );
}
