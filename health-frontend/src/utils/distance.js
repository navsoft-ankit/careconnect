// Haversine straight-line distance + fare calculation for ambulance booking.
// Fare model: NonAC ₹25/km, AC ₹50/km, Big ₹150/km

export const AMBULANCE_RATES = {
  NonAC: { label: "Non-AC Ambulance", perKm: 25, icon: "🚐" },
  AC: { label: "AC Ambulance", perKm: 50, icon: "🚑" },
  Big: { label: "Big Ambulance", perKm: 150, icon: "🚒" },
};

export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateFare(type, distanceKm) {
  const rate = AMBULANCE_RATES[type];
  if (!rate) return 0;
  return Math.round(rate.perKm * distanceKm);
}