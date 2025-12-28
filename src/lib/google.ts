import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

const GOOGLE_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_KEY ||
  "AIzaSyBEdeomKGAnMsWLUXdveneaM3xJpuJqLXs";

// Force immediate configuration
setOptions({
  apiKey: GOOGLE_KEY,
  version: "weekly",
  libraries: ["places"],
});

export const getAutocompleteService = async () => {
  try {
    await importLibrary("places");
    return new google.maps.places.AutocompleteService();
  } catch (e) {
    console.error("Global Google Load Fail", e);
    return null;
  }
};
