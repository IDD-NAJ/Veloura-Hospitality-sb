# New Services Integration - Amadeus, Foursquare & Makecorps

## 🎉 Integration Complete

Three powerful new services have been integrated into the Veloura Hotel backend:

1. **Amadeus Travel API** - Flight search, hotel discovery, destination content
2. **Foursquare Places API** - Location data, recommendations, venue information
3. **Makecorps Service** - Business operations, analytics, workflow automation

---

## 📋 What's Been Added

### ✅ Service Modules Created
- `backend/src/services/amadeusService.js` - Amadeus API integration
- `backend/src/services/foursquareService.js` - Foursquare API integration
- `backend/src/services/makecorpsService.js` - Makecorps API integration

### ✅ API Routes Created
- `backend/src/routes/amadeus.js` - Amadeus endpoints
- `backend/src/routes/foursquare.js` - Foursquare endpoints
- `backend/src/routes/makecorps.js` - Makecorps endpoints

### ✅ Environment Configuration
- Updated `backend/.env` with new API credentials
- Updated `backend/.env.example` with configuration templates
- Server configuration updated to include new routes

---

## 🔧 Configuration Required

### 1. Amadeus Travel API

**Sign up:** https://developers.amadeus.com/register

**Get credentials:**
1. Create a new app in Amadeus Self-Service
2. Get your API Key and API Secret
3. Choose test or production environment

**Add to `.env`:**
```env
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
AMADEUS_BASE_URL=https://test.api.amadeus.com
AMADEUS_ENVIRONMENT=test
```

**Features:**
- Flight search and booking
- Hotel search by city
- Points of interest (attractions)
- Destination recommendations
- Airport and city information
- Travel safety data (COVID-19)
- Car rental search
- Flight price analysis

---

### 2. Foursquare Places API

**Sign up:** https://foursquare.com/developers/signup

**Get API key:**
1. Create a new project
2. Generate API key
3. Copy the key

**Add to `.env`:**
```env
FOURSQUARE_API_KEY=your_foursquare_api_key
FOURSQUARE_BASE_URL=https://api.foursquare.com/v3
```

**Features:**
- Place search and discovery
- Restaurant recommendations
- Attraction search
- Venue photos and reviews
- Autocomplete suggestions
- Trending places
- Geocoding and reverse geocoding
- Category browsing

---

### 3. Makecorps Service

**Contact:** Makecorps sales team for API access

**Add to `.env`:**
```env
MAKECORPS_API_KEY=your_makecorps_api_key
MAKECORPS_API_SECRET=your_makecorps_api_secret
MAKECORPS_BASE_URL=https://api.makecorps.com/v1
MAKECORPS_WEBHOOK_SECRET=your_makecorps_webhook_secret
```

**Features:**
- Business workflow automation
- Advanced analytics and reporting
- Revenue management
- Dynamic pricing recommendations
- Inventory synchronization
- Competitor analysis
- Guest sentiment analysis
- Automated notifications and alerts

---

## 📡 API Endpoints

### Amadeus Endpoints

#### Flight Search
```http
GET /api/amadeus/flights/search
Query Parameters:
  - origin: IATA airport code (e.g., "LAX")
  - destination: IATA airport code (e.g., "JFK")
  - departureDate: YYYY-MM-DD
  - returnDate: YYYY-MM-DD (optional)
  - adults: number (default: 1)
  - travelClass: ECONOMY|BUSINESS|FIRST
```

#### Hotel Search
```http
GET /api/amadeus/hotels/search
Query Parameters:
  - cityCode: IATA city code (e.g., "PAR")
  - checkInDate: YYYY-MM-DD
  - checkOutDate: YYYY-MM-DD
  - adults: number (default: 1)
  - radius: km (default: 5)
```

#### Attractions
```http
GET /api/amadeus/attractions
Query Parameters:
  - latitude: number
  - longitude: number
  - radius: km (default: 1)
  - categories: comma-separated
```

#### Destination Recommendations
```http
GET /api/amadeus/destinations/recommendations
Query Parameters:
  - origin: IATA airport code
```

#### City Information
```http
GET /api/amadeus/cities/:cityCode
```

#### Airport Information
```http
GET /api/amadeus/airports/:airportCode
```

#### Travel Safety
```http
GET /api/amadeus/safety/:countryCode
```

---

### Foursquare Endpoints

#### Place Search
```http
GET /api/foursquare/places/search
Query Parameters:
  - ll: "latitude,longitude" OR
  - near: "City, State"
  - query: search term (optional)
  - categories: category IDs (optional)
  - radius: meters (default: 1000)
  - limit: number (default: 50)
  - sort: RELEVANCE|DISTANCE|POPULARITY
```

#### Place Details
```http
GET /api/foursquare/places/:fsqId
```

#### Place Photos
```http
GET /api/foursquare/places/:fsqId/photos
Query Parameters:
  - limit: number (default: 10)
  - classifications: outdoor,food,indoor
```

#### Place Tips/Reviews
```http
GET /api/foursquare/places/:fsqId/tips
Query Parameters:
  - limit: number (default: 10)
  - sort: POPULAR|RECENT
```

#### Restaurant Search
```http
GET /api/foursquare/restaurants
Query Parameters:
  - ll: "latitude,longitude" OR near: "location"
  - query: search term
  - radius: meters
  - limit: number
  - price: 1,2,3,4
  - openNow: true|false
```

#### Attraction Search
```http
GET /api/foursquare/attractions
Query Parameters:
  - ll: "latitude,longitude" OR near: "location"
  - query: search term
  - radius: meters (default: 5000)
  - limit: number
```

#### Autocomplete
```http
GET /api/foursquare/autocomplete
Query Parameters:
  - query: search term (required)
  - ll: "latitude,longitude" (optional)
  - limit: number (default: 10)
```

#### Trending Places
```http
GET /api/foursquare/trending
Query Parameters:
  - ll: "latitude,longitude" OR near: "location"
  - radius: meters
  - limit: number
```

#### Categories
```http
GET /api/foursquare/categories
```

#### Geocoding
```http
GET /api/foursquare/geocode
Query Parameters:
  - address: full address
```

#### Reverse Geocoding
```http
GET /api/foursquare/reverse-geocode
Query Parameters:
  - ll: "latitude,longitude"
```

---

### Makecorps Endpoints

**Note:** Most Makecorps endpoints require authentication and admin/manager role.

#### Workflows
```http
POST /api/makecorps/workflows
Auth: Required (Admin/Manager)
Body: Workflow configuration

GET /api/makecorps/workflows/:workflowId
Auth: Required (Admin/Manager)

POST /api/makecorps/workflows/:workflowId/execute
Auth: Required (Admin/Manager)
Body: Workflow input data
```

#### Analytics
```http
GET /api/makecorps/analytics
Auth: Required (Admin/Manager)
Query Parameters:
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
  - metrics: comma-separated
  - groupBy: day|week|month

GET /api/makecorps/analytics/revenue
Auth: Required (Admin/Manager)
Query Parameters:
  - propertyId: string
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD

GET /api/makecorps/analytics/forecast
Auth: Required (Admin/Manager)
Query Parameters:
  - propertyId: string
  - days: number (default: 30)

POST /api/makecorps/reports/generate
Auth: Required (Admin/Manager)
Body: Report configuration
```

#### Inventory Management
```http
POST /api/makecorps/inventory/sync
Auth: Required (Admin/Manager)
Body: Inventory data

PUT /api/makecorps/inventory/availability
Auth: Required (Admin/Manager/Staff)
Body: Availability data

GET /api/makecorps/inventory/status
Auth: Required (Admin/Manager/Staff)
Query Parameters:
  - propertyId: string
```

#### Dynamic Pricing
```http
GET /api/makecorps/pricing/dynamic
Auth: Required (Admin/Manager)
Query Parameters:
  - propertyId: string
  - roomTypeId: string
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD

GET /api/makecorps/pricing/competitor-analysis
Auth: Required (Admin/Manager)
Query Parameters:
  - propertyId: string
  - competitors: comma-separated IDs
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
```

#### Automation
```http
POST /api/makecorps/automation/rules
Auth: Required (Admin)
Body: Automation rule configuration

POST /api/makecorps/automation/rules/:ruleId/trigger
Auth: Required (Admin/Manager)
Body: Execution context
```

#### Webhooks
```http
POST /api/makecorps/webhooks
Auth: Signature verification
Body: Webhook payload
```

---

## 🧪 Testing the Integrations

### Test Amadeus Flight Search
```bash
curl "http://localhost:3000/api/amadeus/flights/search?origin=LAX&destination=JFK&departureDate=2026-06-01&adults=2"
```

### Test Foursquare Place Search
```bash
curl "http://localhost:3000/api/foursquare/places/search?near=Paris,France&query=restaurant&limit=10"
```

### Test Foursquare Restaurants
```bash
curl "http://localhost:3000/api/foursquare/restaurants?ll=48.8566,2.3522&radius=2000&limit=20"
```

### Test Makecorps Analytics (requires auth token)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/makecorps/analytics/revenue?propertyId=hotel-123&startDate=2026-01-01&endDate=2026-03-31"
```

---

## 💡 Use Cases

### Amadeus Integration
1. **Flight + Hotel Packages**: Search flights and hotels together for complete travel packages
2. **Destination Discovery**: Show recommended destinations based on user's origin
3. **Attraction Recommendations**: Display nearby attractions for each hotel
4. **Travel Safety**: Show COVID-19 and safety information for destinations
5. **Airport Transfers**: Integrate car rental options for hotel guests

### Foursquare Integration
1. **Hotel Surroundings**: Show restaurants, cafes, and attractions near hotels
2. **Local Recommendations**: Provide personalized recommendations based on guest preferences
3. **Dining Options**: Display nearby restaurants with photos, reviews, and ratings
4. **Nightlife Guide**: Show bars, clubs, and entertainment venues
5. **Place Discovery**: Help guests discover trending and popular places
6. **Geocoding**: Convert hotel addresses to coordinates and vice versa

### Makecorps Integration
1. **Revenue Optimization**: Get dynamic pricing recommendations based on demand
2. **Occupancy Forecasting**: Predict future occupancy rates
3. **Competitor Analysis**: Monitor competitor pricing and adjust accordingly
4. **Workflow Automation**: Automate check-in, check-out, and housekeeping workflows
5. **Business Intelligence**: Generate custom reports and analytics
6. **Inventory Sync**: Keep room availability synchronized across all channels
7. **Guest Insights**: Analyze guest sentiment and preferences
8. **Alert Management**: Set up automated alerts for important events

---

## 🔗 Frontend Integration Examples

### Search Flights for Hotel Guests
```javascript
import { amadeusAPI } from './api.js';

// Search flights to hotel destination
const searchFlights = async (hotelCity, departureDate) => {
  const response = await fetch(
    `/api/amadeus/flights/search?origin=LAX&destination=${hotelCity}&departureDate=${departureDate}`
  );
  const data = await response.json();
  return data.data;
};
```

### Show Nearby Restaurants
```javascript
import { foursquareAPI } from './api.js';

// Get restaurants near hotel
const getNearbyRestaurants = async (latitude, longitude) => {
  const response = await fetch(
    `/api/foursquare/restaurants?ll=${latitude},${longitude}&radius=1000&limit=20`
  );
  const data = await response.json();
  return data.data.results;
};
```

### Get Dynamic Pricing
```javascript
import { makecorpsAPI } from './api.js';

// Get pricing recommendations
const getDynamicPricing = async (propertyId, roomTypeId, dates) => {
  const response = await fetch(
    `/api/makecorps/pricing/dynamic?propertyId=${propertyId}&roomTypeId=${roomTypeId}&startDate=${dates.start}&endDate=${dates.end}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  return data.data;
};
```

---

## 📊 Service Comparison

| Feature | Amadeus | Foursquare | Makecorps |
|---------|---------|------------|-----------|
| **Primary Use** | Travel & flights | Places & locations | Business operations |
| **Authentication** | OAuth2 | API Key | HMAC signature |
| **Rate Limits** | Varies by plan | 950/day (free) | Custom |
| **Pricing** | Free tier available | Free tier available | Enterprise |
| **Best For** | Flight search, hotels | Local recommendations | Analytics, automation |

---

## 🚀 Next Steps

1. **Get API Credentials**
   - Sign up for Amadeus developer account
   - Sign up for Foursquare developer account
   - Contact Makecorps for enterprise access

2. **Update Environment Variables**
   - Add all API keys to `backend/.env`
   - Restart backend server

3. **Test Endpoints**
   - Use the curl commands above to test each service
   - Verify responses are correct

4. **Frontend Integration**
   - Create API wrapper functions in `src/api.js`
   - Add UI components to display data
   - Implement search and discovery features

5. **Production Deployment**
   - Switch to production API endpoints
   - Update rate limits and quotas
   - Set up monitoring and error tracking

---

## 📚 Documentation Links

- **Amadeus API Docs**: https://developers.amadeus.com/self-service
- **Foursquare API Docs**: https://developer.foursquare.com/docs
- **Makecorps Docs**: Contact your account manager

---

## ⚠️ Important Notes

1. **API Limits**: Free tiers have rate limits. Monitor usage and upgrade as needed.
2. **Error Handling**: All services have proper error handling implemented.
3. **Caching**: Consider implementing Redis caching for frequently accessed data.
4. **Security**: Makecorps uses HMAC signature verification for webhooks.
5. **Testing**: Use test/sandbox environments before production deployment.

---

**Last Updated:** 2026-03-09  
**Status:** ✅ READY FOR CONFIGURATION  
**Next Action:** Add API credentials to `.env` and test endpoints
