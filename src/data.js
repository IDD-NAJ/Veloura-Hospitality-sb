// ⚠️ DEPRECATED: This file contains mock data for development/testing only.
// All production code should fetch data from the backend API.
// DO NOT import these exports in production code paths.

// Mock data kept for reference and testing purposes only
export const HOTELS_DEPRECATED = [
  {
    id: 1, name: "The Meridian Grand", city: "Paris", country: "France", stars: 5,
    rating: 4.9, reviews: 2847, priceFrom: 420, category: "Luxury",
    tags: ["Pool","Spa","Restaurant","Gym","City View"],
    lat: 48.8566, lng: 2.3522,
    desc: "Perched above the 8th arrondissement with uninterrupted views of the Eiffel Tower, The Meridian Grand is Paris's most coveted address. Blending Haussmann grandeur with contemporary luxury.",
    amenities: ["wifi","pool","spa","restaurant","gym","car","ac"],
    rooms: [
      { id:101, name:"Deluxe King", sqm:35, guests:2, beds:"King", price:420, view:"City", amenities:["AC","WiFi","Smart TV","Minibar","Rain Shower"] },
      { id:102, name:"Superior Suite", sqm:58, guests:2, beds:"King", price:680, view:"Eiffel Tower", amenities:["AC","WiFi","Smart TV","Minibar","Bathtub","Butler Service"] },
      { id:103, name:"Grand Penthouse", sqm:120, guests:4, beds:"2 King", price:1240, view:"Panoramic", amenities:["AC","WiFi","Smart TV","Full Kitchen","Private Pool","Butler Service"] },
    ],
    gradient: "linear-gradient(160deg,#1a3352 0%,#0f1923 100%)",
    accentColor: "#C9A84C",
  },
  {
    id: 2, name: "Azure Santorini", city: "Oia", country: "Greece", stars: 5,
    rating: 4.8, reviews: 1634, priceFrom: 380, category: "Resort",
    tags: ["Infinity Pool","Sea View","Spa","Private Terrace"],
    lat: 36.4618, lng: 25.3753,
    desc: "Carved into the volcanic caldera of Santorini's most breathtaking cliff. Azure redefines the Cycladic escape — cascading private plunge pools, cave suites, and sunsets that defy description.",
    amenities: ["wifi","pool","spa","restaurant","ac"],
    rooms: [
      { id:201, name:"Cave Suite", sqm:42, guests:2, beds:"King", price:380, view:"Caldera", amenities:["AC","WiFi","Smart TV","Plunge Pool","Breakfast"] },
      { id:202, name:"Infinity Villa", sqm:90, guests:2, beds:"King", price:760, view:"Caldera + Sea", amenities:["AC","WiFi","Smart TV","Private Pool","Private Chef","Breakfast"] },
    ],
    gradient: "linear-gradient(160deg,#1a4a6b 0%,#0d2a3a 100%)",
    accentColor: "#5BA0C8",
  },
  {
    id: 3, name: "Kyoto Ryokan Sublime", city: "Kyoto", country: "Japan", stars: 5,
    rating: 4.9, reviews: 987, priceFrom: 650, category: "Boutique",
    tags: ["Hot Spring","Tea Ceremony","Zen Garden","Kaiseki Dining"],
    lat: 35.0116, lng: 135.7681,
    desc: "A masterwork of Japanese minimalism in the ancient Higashiyama district. Fourteen private rooms, each with a garden view, onsen bath, and a dedicated attendant from arrival to departure.",
    amenities: ["wifi","spa","restaurant","pool"],
    rooms: [
      { id:301, name:"Garden Tatami", sqm:40, guests:2, beds:"Futon", price:650, view:"Zen Garden", amenities:["WiFi","Smart TV","Private Onsen","Yukata","Breakfast"] },
      { id:302, name:"Grand Suikinkutsu", sqm:80, guests:2, beds:"Futon + King", price:1100, view:"Private Garden", amenities:["WiFi","Smart TV","Private Onsen","Tea Ceremony","Full Board"] },
    ],
    gradient: "linear-gradient(160deg,#2d1a0e 0%,#1a0a08 100%)",
    accentColor: "#C07840",
  },
  {
    id: 4, name: "Coastal Dunes Lodge", city: "Cape Town", country: "South Africa", stars: 4,
    rating: 4.7, reviews: 2103, priceFrom: 210, category: "Lodge",
    tags: ["Ocean View","Pool","Wine Cellar","Safari Transfers"],
    lat: -33.9249, lng: 18.4241,
    desc: "Where the Atlantic crashes against Cape Point and Table Mountain glows at dusk. Coastal Dunes blends raw African landscape with understated luxury — local stone, reclaimed wood, and world-class wine.",
    amenities: ["wifi","pool","restaurant","car","gym"],
    rooms: [
      { id:401, name:"Mountain View Room", sqm:30, guests:2, beds:"Queen", price:210, view:"Table Mountain", amenities:["AC","WiFi","Smart TV","Minibar"] },
      { id:402, name:"Ocean Loft Suite", sqm:55, guests:2, beds:"King", price:340, view:"Atlantic Ocean", amenities:["AC","WiFi","Smart TV","Minibar","Private Deck","Bathtub"] },
    ],
    gradient: "linear-gradient(160deg,#1a3a2a 0%,#0a1a12 100%)",
    accentColor: "#7AB878",
  },
  {
    id: 5, name: "Manhattan Noir", city: "New York", country: "USA", stars: 5,
    rating: 4.8, reviews: 3214, priceFrom: 520, category: "Urban",
    tags: ["Rooftop Bar","Gym","Concierge","City Views"],
    lat: 40.7128, lng: -74.006,
    desc: "Art deco meets 21st-century precision in Midtown Manhattan. A skyscraper icon reborn — soaring ceilings, obsidian marble, and a rooftop bar that owns the New York skyline.",
    amenities: ["wifi","restaurant","gym","car","ac"],
    rooms: [
      { id:501, name:"City King", sqm:32, guests:2, beds:"King", price:520, view:"Central Park", amenities:["AC","WiFi","Smart TV","Nespresso","Work Desk"] },
      { id:502, name:"Skyline Suite", sqm:65, guests:2, beds:"King", price:890, view:"Manhattan Skyline", amenities:["AC","WiFi","Smart TV","Full Bar","Soaking Tub"] },
    ],
    gradient: "linear-gradient(160deg,#1a1a2e 0%,#0a0a1a 100%)",
    accentColor: "#C9A84C",
  },
  {
    id: 6, name: "Bali Hideaway Ubud", city: "Ubud", country: "Bali", stars: 4,
    rating: 4.6, reviews: 1876, priceFrom: 180, category: "Resort",
    tags: ["Rice Paddy View","Infinity Pool","Yoga","Spa"],
    lat: -8.5069, lng: 115.2625,
    desc: "Nestled among emerald rice terraces above the sacred Ayung River gorge. Twelve private villas, each with a plunge pool and butler, in Bali's most spiritual highland heartland.",
    amenities: ["wifi","pool","spa","restaurant","gym"],
    rooms: [
      { id:601, name:"Jungle Pool Villa", sqm:60, guests:2, beds:"King", price:180, view:"Rice Paddy", amenities:["AC","WiFi","Smart TV","Private Pool","Breakfast"] },
      { id:602, name:"River Valley Suite", sqm:85, guests:4, beds:"King + Twin", price:320, view:"River Gorge", amenities:["AC","WiFi","Smart TV","Private Pool","Breakfast","Butler"] },
    ],
    gradient: "linear-gradient(160deg,#1a3a1a 0%,#0a1a08 100%)",
    accentColor: "#78B878",
  },
];

export const DESTINATIONS_DEPRECATED = [
  { name: "Paris", country: "France", hotels: 284, img: "paris" },
  { name: "Santorini", country: "Greece", hotels: 97, img: "santorini" },
  { name: "Tokyo", country: "Japan", hotels: 412, img: "tokyo" },
  { name: "New York", country: "USA", hotels: 638, img: "newyork" },
  { name: "Bali", country: "Indonesia", hotels: 203, img: "bali" },
  { name: "Dubai", country: "UAE", hotels: 318, img: "dubai" },
];

export const DEMO_USER_DEPRECATED = { name: "Alexandra Chen", email: "alex@example.com", avatar: "AC" };

// ⚠️ WARNING: Do not use these exports in production code.
// All data should come from the backend API via src/api.js
