import { useState } from 'react';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

export function useGooglePlaces() {
  const [loading, setLoading] = useState(false);

  // 1. Reverse Geocode (Lat/Lng -> Address)
  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`
      );
      const data = await res.json();
      return data.results?.[0]?.formatted_address || null;
    } catch (e) {
      console.error("Reverse Geo Failed", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 2. Search Place (Text -> Viewport/Bounds)
  const searchPlace = async (query: string) => {
    setLoading(true);
    try {
      // Prioritize Ghana (components=country:GH)
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&components=country:GH&key=${GOOGLE_KEY}`
      );
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          name: result.formatted_address, // e.g. "Prampram, Ghana"
          location: result.geometry.location, // { lat, lng }
          viewport: result.geometry.viewport, // { northeast, southwest } - The Geo Fence!
          place_id: result.place_id
        };
      }
      return null;
    } catch (e) {
      console.error("Place Search Failed", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { reverseGeocode, searchPlace, loading };
}
