# Veloura Hotel API - Quick Reference Guide

## 🚀 Base URL
```
http://localhost:3000/api
```

---

## 🔑 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📡 New Service Endpoints

### 🛫 Amadeus Travel API

#### Flight Search
```bash
GET /api/amadeus/flights/search
  ?origin=LAX
  &destination=JFK
  &departureDate=2026-06-01
  &returnDate=2026-06-08
  &adults=2
  &travelClass=ECONOMY
```

#### Hotel Search by City
```bash
GET /api/amadeus/hotels/search
  ?cityCode=PAR
  &checkInDate=2026-06-01
  &checkOutDate=2026-06-03
  &adults=2
  &radius=5
```

#### Get Attractions
```bash
GET /api/amadeus/attractions
  ?latitude=48.8566
  &longitude=2.3522
  &radius=1
```

#### Destination Recommendations
```bash
GET /api/amadeus/destinations/recommendations
  ?origin=LAX
```

---

### 📍 Foursquare Places API

#### Search Places
```bash
GET /api/foursquare/places/search
  ?near=Paris,France
  &query=restaurant
  &limit=20
  &sort=RELEVANCE
```

#### Get Place Details
```bash
GET /api/foursquare/places/:fsqId
```

#### Search Restaurants
```bash
GET /api/foursquare/restaurants
  ?ll=48.8566,2.3522
  &radius=1000
  &limit=20
  &openNow=true
```

#### Search Attractions
```bash
GET /api/foursquare/attractions
  ?near=New York, NY
  &radius=5000
  &limit=30
```

#### Autocomplete
```bash
GET /api/foursquare/autocomplete
  ?query=eiffel
  &ll=48.8566,2.3522
  &limit=10
```

#### Trending Places
```bash
GET /api/foursquare/trending
  ?near=Tokyo, Japan
  &radius=2000
  &limit=50
```

---

### 🏢 Makecorps Business Operations

**Note:** Requires authentication and admin/manager role

#### Get Analytics
```bash
GET /api/makecorps/analytics
  ?startDate=2026-01-01
  &endDate=2026-03-31
  &metrics=revenue,occupancy,bookings
  &groupBy=month
  
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Revenue Insights
```bash
GET /api/makecorps/analytics/revenue
  ?propertyId=hotel-123
  &startDate=2026-01-01
  &endDate=2026-03-31
  
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Occupancy Forecast
```bash
GET /api/makecorps/analytics/forecast
  ?propertyId=hotel-123
  &days=30
  
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Dynamic Pricing
```bash
GET /api/makecorps/pricing/dynamic
  ?propertyId=hotel-123
  &roomTypeId=deluxe-king
  &startDate=2026-06-01
  &endDate=2026-06-30
  
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

#### Sync Inventory
```bash
POST /api/makecorps/inventory/sync

Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "propertyId": "hotel-123",
  "rooms": [
    {
      "roomTypeId": "deluxe-king",
      "available": 10,
      "date": "2026-06-01"
    }
  ]
}
```

---

## 🧪 Testing Examples

### Test Amadeus (No Auth Required)
```bash
curl "http://localhost:3000/api/amadeus/flights/search?origin=LAX&destination=JFK&departureDate=2026-06-01&adults=2"
```

### Test Foursquare (No Auth Required)
```bash
curl "http://localhost:3000/api/foursquare/restaurants?near=Paris,France&limit=10"
```

### Test Makecorps (Auth Required)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/makecorps/analytics/revenue?propertyId=hotel-123&startDate=2026-01-01&endDate=2026-03-31"
```

---

## 📊 Response Format

All endpoints return JSON in this format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🔧 Configuration Status

Check which services are configured:
```bash
GET /api/health
```

Response includes:
```json
{
  "success": true,
  "integrations": {
    "stripe": true,
    "sendgrid": true,
    "twilio": true,
    "cloudbeds": true,
    "siteminder": true,
    "googleMaps": true,
    "amadeus": false,  // Configure in .env
    "foursquare": false,  // Configure in .env
    "makecorps": false  // Configure in .env
  }
}
```

---

## 🎯 Common Use Cases

### 1. Complete Travel Package
```javascript
// Search flights
const flights = await fetch('/api/amadeus/flights/search?...');

// Search hotels in destination
const hotels = await fetch('/api/amadeus/hotels/search?...');

// Get nearby attractions
const attractions = await fetch('/api/foursquare/attractions?...');
```

### 2. Hotel Surroundings
```javascript
// Get hotel coordinates
const hotel = await fetch('/api/hotels/123');

// Find nearby restaurants
const restaurants = await fetch(
  `/api/foursquare/restaurants?ll=${hotel.lat},${hotel.lng}&radius=1000`
);

// Find attractions
const attractions = await fetch(
  `/api/foursquare/attractions?ll=${hotel.lat},${hotel.lng}&radius=5000`
);
```

### 3. Revenue Management
```javascript
// Get current analytics
const analytics = await fetch('/api/makecorps/analytics/revenue?...');

// Get pricing recommendations
const pricing = await fetch('/api/makecorps/pricing/dynamic?...');

// Update prices based on recommendations
await fetch('/api/rooms/123/rates', {
  method: 'PUT',
  body: JSON.stringify({ rates: pricing.recommendations })
});
```

---

## 📚 Full Documentation

- **Complete Integration Guide**: `NEW_SERVICES_INTEGRATION.md`
- **Backend README**: `backend/README.md`
- **Main README**: `README.md`

---

**Last Updated:** 2026-03-09  
**Version:** 1.0.0
