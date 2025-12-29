// Helper to wait for the Google Maps script to finish loading from index.html
const waitForGoogle = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.google && window.google.maps) {
      resolve();
    } else {
      // Poll every 100ms until available
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    }
  });
};

export const getAutocompleteService = async () => {
  await waitForGoogle();
  return new google.maps.places.AutocompleteService();
};

export const getGeocoder = async () => {
  await waitForGoogle();
  return new google.maps.Geocoder();
};

// Singleton to avoid creating multiple dummy divs
let placesServiceInstance: any = null;

export const getPlacesService = async () => {
  await waitForGoogle();
  
  if (!placesServiceInstance) {
    // PlacesService requires a container, even if we don't render it.
    // We create a hidden in-memory div for it.
    const ghostDiv = document.createElement('div');
    placesServiceInstance = new google.maps.places.PlacesService(ghostDiv);
  }
  
  return placesServiceInstance;
};
