import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://tjwwymongjrdsgoxfbtn.supabase.co'; 
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqd3d5bW9uZ2pyZHNnb3hmYnRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTE5Mjg4OSwiZXhwIjoyMDY2NzY4ODg5fQ.UjTtbZj3wUJ10gdttQUhd6UGMxOtQ_oKo2g9drU3ngI';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SECTORS = [
  { name: 'East Legon', lat: 5.636, lng: -0.166, range: 0.02, city: 'Accra' },
  { name: 'Cantonments', lat: 5.583, lng: -0.166, range: 0.01, city: 'Accra' },
  { name: 'Airport Residential', lat: 5.605, lng: -0.173, range: 0.01, city: 'Accra' },
  { name: 'Labone', lat: 5.568, lng: -0.178, range: 0.008, city: 'Accra' },
  { name: 'Ahodwo', lat: 6.667, lng: -1.616, range: 0.015, city: 'Kumasi' },
  { name: 'Airport Ridge', lat: 4.908, lng: -1.776, range: 0.015, city: 'Takoradi' },
  { name: 'Aburi Heights', lat: 5.845, lng: -0.176, range: 0.015, city: 'Aburi' },
  { name: 'Tamale Airport Area', lat: 9.511, lng: -0.858, range: 0.04, city: 'Tamale' },
  { name: 'Ho Central', lat: 6.611, lng: 0.471, range: 0.03, city: 'Ho' },
  { name: 'Tema Comm 25', lat: 5.688, lng: -0.011, range: 0.02, city: 'Tema' }
];

const VIBES = ['Pool', 'Tactical Security', 'Borehole', 'Solar', 'Gated', 'Gym', 'Staff Quarters'];
const IMAGES = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09'
];

async function seedIntelligence() {
  console.log("🛰️ INITIALIZING HIGH-LEVEL SEED PROTOCOL...");
  
  const listings = [];

  for (let i = 0; i < 50; i++) {
    const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    const type = Math.random() > 0.4 ? 'sale' : 'rent';
    const lat = sector.lat + (Math.random() - 0.5) * sector.range;
    const lng = sector.lng + (Math.random() - 0.5) * sector.range;
    const price = type === 'sale' ? Math.floor(Math.random() * 5000000) + 400000 : Math.floor(Math.random() * 30000) + 3000;
    const vibes = VIBES.sort(() => 0.5 - Math.random()).slice(0, 3).join(', ');

    listings.push({
      owner_id: 'a6c318f7-e5fb-4b7a-90a1-5b1d9afc577a',
      title: `${sector.name} Tactical Asset ${i + 1}`,
      description: `Premium intelligence asset in ${sector.city}. Modern infrastructure and high-yield potential.`,
      price: price,
      currency: 'GHS',
      status: 'active',
      type: type,
      location_name: sector.name,
      location_address: `${sector.name}, ${sector.city}, Ghana`,
      lat: lat,
      long: lng,
      location_accuracy: 'high',
      vibe_features: vibes,
      cover_image_url: `${IMAGES[Math.floor(Math.random() * IMAGES.length)]}?auto=format&fit=crop&w=800&q=80`,
      source: 'seed_script'
    });
  }

  console.log("📦 BROADCASTING TO tjwwymongjrdsgoxfbtn.supabase.co...");
  const { data, error } = await supabase.from('properties').insert(listings).select();

  if (error) {
    console.error("❌ DEPLOYMENT FAILURE:", error.message);
  } else {
    console.log(`✅ SUCCESS: ${data.length} ASSETS LIVE ACROSS GHANA.`);
    
    // Optional: Add secondary images to property_images table for extra realism
    const secondaryImages = data.map(p => ({
      property_id: p.id,
      url: p.cover_image_url,
      is_hero: true
    }));
    await supabase.from('property_images').insert(secondaryImages);
    console.log("📸 HERO IMAGES LINKED TO SUBSIDIARY SCHEMA.");
  }
}

seedIntelligence();
