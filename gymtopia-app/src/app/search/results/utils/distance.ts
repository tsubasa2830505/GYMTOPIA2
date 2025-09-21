// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Sort gyms based on selected criteria
export function sortGyms(gyms: any[], sortBy: string, userLocation: { lat: number; lng: number } | null) {
  const sorted = [...gyms]

  switch (sortBy) {
    case 'distance':
      // Sort by distance from user location (closest first)
      return sorted.sort((a, b) => {
        if (!userLocation) return 0
        const distA = a.distanceFromUser ?? Infinity
        const distB = b.distanceFromUser ?? Infinity
        return distA - distB
      })

    case 'rating':
      // Sort by rating (highest first)
      return sorted.sort((a, b) => {
        const ratingA = a.rating ?? 0
        const ratingB = b.rating ?? 0
        return ratingB - ratingA
      })

    case 'popularity':
      // Sort by users_count (most popular first)
      return sorted.sort((a, b) => {
        const countA = a.users_count ?? 0
        const countB = b.users_count ?? 0
        return countB - countA
      })

    default:
      return sorted
  }
}