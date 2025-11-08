import React from 'react';

const LoadingOverlay = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ fontSize: 24, fontWeight: 'bold' }}>Loading...</div>
  </div>
);

export default LoadingOverlay;
