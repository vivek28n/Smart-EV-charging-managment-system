import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Station } from '@/hooks/useStations';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  stations: Station[];
  center?: [number, number];
  onStationClick?: (id: string) => void;
}

export default function StationMap({ stations, center = [28.6139, 77.2090], onStationClick }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border border-border h-[400px] relative">
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            eventHandlers={{
              click: () => onStationClick?.(station.id),
            }}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `<div style="
                background-color: ${station.available_slots > 0 ? 'hsl(152, 68%, 40%)' : 'hsl(0, 72%, 51%)'};
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                min-width: 24px;
              ">${station.available_slots}</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 30],
            })}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-base mb-1">{station.name}</h3>
                <p className="text-gray-600">{station.location}</p>
                <p>Available: {station.available_slots}/{station.total_slots}</p>
                <p>Speed: {station.charging_speed}</p>
                <p>Price: ₹{station.price_per_unit}/unit</p>
                <Link to={`/stations/${station.id}`} className="text-blue-600 hover:underline font-medium mt-1 inline-block">
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
