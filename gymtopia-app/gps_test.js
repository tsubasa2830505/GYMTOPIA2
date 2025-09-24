const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // 地球の半径（メートル）
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};

const gymLat = parseFloat(process.argv[2]);
const gymLng = parseFloat(process.argv[3]);

// 50m離れた位置
const offset50m = 0.00045; // 約50m
const lat50m = gymLat + offset50m;
const lng50m = gymLng;

// 100m離れた位置
const offset100m = 0.0009; // 約100m
const lat100m = gymLat + offset100m;
const lng100m = gymLng;

console.log(JSON.stringify({
  exact: { lat: gymLat, lng: gymLng, distance: 0 },
  near50m: { lat: lat50m, lng: lng50m, distance: haversineDistance(gymLat, gymLng, lat50m, lng50m) },
  far100m: { lat: lat100m, lng: lng100m, distance: haversineDistance(gymLat, gymLng, lat100m, lng100m) }
}));
