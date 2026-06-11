import React from 'react';
import GoogleMapReact from 'google-map-react';

export default function HrCheckinManagementMap({
  center,
  zoom,
  onClick,
  apiKey,
  children,
}) {
  return (
    <GoogleMapReact
      bootstrapURLKeys={{ key: (apiKey || '').trim() }}
      center={center}
      zoom={zoom}
      onClick={onClick}
    >
      {children}
    </GoogleMapReact>
  );
}
