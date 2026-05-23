// AI-based station recommendation engine
export interface StationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  total_slots: number;
  available_slots: number;
  charging_speed: string;
  current_load: number;
  price_per_unit: number;
  waiting_time: number;
}

export interface RecommendationResult {
  stationId: string;
  predictedWaitingTime: number;
  stationScore: number;
  distance: number;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function speedMultiplier(speed: string): number {
  switch (speed.toLowerCase()) {
    case 'fast': return 0.5;
    case 'superfast': return 0.3;
    case 'ultra': return 0.2;
    default: return 1.0; // standard
  }
}

export function predictWaitingTime(station: StationData, userLat: number, userLng: number): number {
  const occupancy = 1 - station.available_slots / Math.max(station.total_slots, 1);
  const loadFactor = station.current_load / 100;
  const speedFactor = speedMultiplier(station.charging_speed);
  const dist = haversineDistance(userLat, userLng, station.latitude, station.longitude);
  
  // ML-inspired formula: weighted combination of factors
  const baseWait = occupancy * 30 + loadFactor * 20 + speedFactor * 10;
  const travelTime = dist * 2; // ~2 min per km
  return Math.round(Math.max(0, baseWait + travelTime));
}

export function scoreStation(station: StationData, userLat: number, userLng: number): number {
  const dist = haversineDistance(userLat, userLng, station.latitude, station.longitude);
  const waitTime = predictWaitingTime(station, userLat, userLng);
  const availability = station.available_slots / Math.max(station.total_slots, 1);
  const speed = 1 - speedMultiplier(station.charging_speed);
  
  // Higher is better (0-100)
  const distScore = Math.max(0, 100 - dist * 5);
  const waitScore = Math.max(0, 100 - waitTime * 2);
  const availScore = availability * 100;
  const speedScore = speed * 100;
  const priceScore = Math.max(0, 100 - station.price_per_unit * 5);
  
  return Math.round(
    distScore * 0.25 + waitScore * 0.25 + availScore * 0.2 + speedScore * 0.15 + priceScore * 0.15
  );
}

export function getRecommendations(
  stations: StationData[],
  userLat: number,
  userLng: number
): RecommendationResult[] {
  return stations
    .map((s) => ({
      stationId: s.id,
      predictedWaitingTime: predictWaitingTime(s, userLat, userLng),
      stationScore: scoreStation(s, userLat, userLng),
      distance: Math.round(haversineDistance(userLat, userLng, s.latitude, s.longitude) * 10) / 10,
    }))
    .sort((a, b) => b.stationScore - a.stationScore);
}
