import { DatabaseGym } from '@/types/database';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

/**
 * Enrich gym data with information from Google Places API
 */
export async function enrichGymDataWithPlaces(
  gym: DatabaseGym,
  placesService: google.maps.places.PlacesService
): Promise<Partial<DatabaseGym>> {
  return new Promise((resolve, reject) => {
    // Search for nearby gyms matching this one
    const request: google.maps.places.NearbySearchRequest = {
      location: new google.maps.LatLng(gym.latitude!, gym.longitude!),
      radius: 50, // 50m radius
      type: 'gym',
      keyword: gym.name
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
        const place = results[0];

        // Get detailed information
        const detailRequest: google.maps.places.PlaceDetailsRequest = {
          placeId: place.place_id!,
          fields: [
            'formatted_phone_number',
            'international_phone_number',
            'website',
            'opening_hours',
            'photos',
            'reviews',
            'rating',
            'user_ratings_total',
            'business_status',
            'price_level'
          ]
        };

        placesService.getDetails(detailRequest, (placeDetails, detailStatus) => {
          if (detailStatus === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
            const enrichedData: Partial<DatabaseGym> = {
              phone: placeDetails.formatted_phone_number || undefined,
              website: placeDetails.website || undefined,
              rating: placeDetails.rating || undefined,
              review_count: placeDetails.user_ratings_total || undefined
            };

            // Process opening hours
            if (placeDetails.opening_hours?.weekday_text) {
              enrichedData.opening_hours = {
                weekday_text: placeDetails.opening_hours.weekday_text,
                periods: placeDetails.opening_hours.periods
              };
            }

            // Process photos (max 5) -> prefer images, keep image_urls for compat
            if (placeDetails.photos && placeDetails.photos.length > 0) {
              const urls = placeDetails.photos
                .slice(0, 5)
                .map(photo => photo.getUrl({ maxWidth: 800, maxHeight: 600 }));
              (enrichedData as any).images = urls;
              (enrichedData as any).image_urls = urls; // compat during transition
            }

            // Add price info if available
            if (placeDetails.price_level !== undefined) {
              enrichedData.price_info = {
                level: placeDetails.price_level,
                description: getPriceDescription(placeDetails.price_level)
              };
            }

            resolve(enrichedData);
          } else {
            resolve({});
          }
        });
      } else {
        resolve({});
      }
    });
  });
}

/**
 * Update gym data in Supabase with enriched Places data
 */
export async function updateGymWithPlacesData(
  gymId: string,
  enrichedData: Partial<DatabaseGym>
) {
  // Import getSupabaseClient dynamically to avoid SSR issues
  const { getSupabaseClient } = await import('@/lib/supabase/client');
  const supabase = getSupabaseClient();

  try {
    const { error } = await supabase
      .from('gyms')
      .update({
        ...enrichedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', gymId);

    if (error) {
      console.error('Failed to update gym:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating gym:', error);
    return { success: false, error };
  }
}

/**
 * Batch enrich multiple gyms with Places data
 */
export async function batchEnrichGyms(
  gyms: DatabaseGym[],
  placesService: google.maps.places.PlacesService,
  onProgress?: (current: number, total: number) => void
) {
  const results = [];

  for (let i = 0; i < gyms.length; i++) {
    const gym = gyms[i];

    // Skip if already has phone and website
    if (gym.phone && gym.website) {
      results.push({ gymId: gym.id, skipped: true });
      continue;
    }

    try {
      const enrichedData = await enrichGymDataWithPlaces(gym, placesService);

      if (Object.keys(enrichedData).length > 0) {
        const updateResult = await updateGymWithPlacesData(gym.id, enrichedData);
        results.push({ gymId: gym.id, ...updateResult, enrichedFields: Object.keys(enrichedData) });
      } else {
        results.push({ gymId: gym.id, noDataFound: true });
      }
    } catch (error) {
      results.push({ gymId: gym.id, error });
    }

    if (onProgress) {
      onProgress(i + 1, gyms.length);
    }

    // Rate limiting - wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Get price level description
 */
function getPriceDescription(priceLevel: number): string {
  const descriptions = [
    '無料',
    'リーズナブル',
    '標準的',
    '高め',
    '非常に高い'
  ];
  return descriptions[priceLevel] || '不明';
}

/**
 * Filter gyms by distance from a location
 */
export function filterGymsByDistance(
  gyms: DatabaseGym[],
  centerLat: number,
  centerLng: number,
  maxDistanceKm: number
): DatabaseGym[] {
  return gyms.filter(gym => {
    if (!gym.latitude || !gym.longitude) return false;

    const distance = calculateDistance(
      centerLat,
      centerLng,
      gym.latitude,
      gym.longitude
    );

    return distance <= maxDistanceKm;
  });
}

/**
 * Sort gyms by distance from a location
 */
export function sortGymsByDistance(
  gyms: DatabaseGym[],
  centerLat: number,
  centerLng: number
): (DatabaseGym & { distance: number })[] {
  return gyms
    .map(gym => {
      if (!gym.latitude || !gym.longitude) {
        return { ...gym, distance: Infinity };
      }

      const distance = calculateDistance(
        centerLat,
        centerLng,
        gym.latitude,
        gym.longitude
      );

      return { ...gym, distance };
    })
    .sort((a, b) => a.distance - b.distance);
}
