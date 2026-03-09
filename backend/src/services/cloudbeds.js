import axios from 'axios';

// Cloudbeds PMS API Integration Service
// Mirrors the CloudbedsService from hotel-backend.jsx

class CloudbedsService {
  constructor() {
    this.baseUrl = process.env.CLOUDBEDS_BASE_URL || 'https://hotels.cloudbeds.com/api/v1.2';
    this.clientId = process.env.CLOUDBEDS_CLIENT_ID;
    this.clientSecret = process.env.CLOUDBEDS_CLIENT_SECRET;
    this.propertyId = process.env.CLOUDBEDS_PROPERTY_ID;
    this._token = null;
    this._tokenTs = 0;
  }

  // Get or refresh access token (expires in 3600s)
  async _getToken() {
    if (this._token && Date.now() - this._tokenTs < 3_500_000) {
      return this._token;
    }

    try {
      const response = await axios.post(
        'https://hotels.cloudbeds.com/api/v1.2/access_token',
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      this._token = response.data.access_token;
      this._tokenTs = Date.now();
      return this._token;
    } catch (error) {
      console.error('Cloudbeds auth failed:', error.message);
      throw new Error('Failed to authenticate with Cloudbeds');
    }
  }

  // Generic API request helper
  async _request(method, path, data = null, params = {}) {
    const token = await this._getToken();
    const url = `${this.baseUrl}${path}`;

    try {
      const response = await axios({
        method,
        url,
        data,
        params: { propertyID: this.propertyId, ...params },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Cloudbeds ${method} ${path} failed:`, error.response?.data || error.message);
      throw new Error(`Cloudbeds API error: ${error.response?.status || error.message}`);
    }
  }

  // ── Reservations ──
  async getReservations(params = {}) {
    return this._request('GET', '/getReservations', null, params);
  }

  async getReservation(reservationId) {
    return this._request('GET', '/getReservation', null, { reservationID: reservationId });
  }

  async createReservation(payload) {
    return this._request('POST', '/postReservation', { propertyID: this.propertyId, ...payload });
  }

  async updateReservation(reservationId, payload) {
    return this._request('PUT', '/putReservation', {
      propertyID: this.propertyId,
      reservationID: reservationId,
      ...payload
    });
  }

  async cancelReservation(reservationId, reason = '') {
    return this._request('DELETE', '/deleteReservation', {
      propertyID: this.propertyId,
      reservationID: reservationId,
      reason
    });
  }

  // ── Check-in / Check-out ──
  async checkIn(reservationId) {
    return this._request('POST', '/postCheckIn', {
      propertyID: this.propertyId,
      reservationID: reservationId
    });
  }

  async checkOut(reservationId) {
    return this._request('POST', '/postCheckOut', {
      propertyID: this.propertyId,
      reservationID: reservationId
    });
  }

  // ── Rooms ──
  async getRooms() {
    return this._request('GET', '/getRooms');
  }

  async getRoomAvailability(startDate, endDate) {
    return this._request('GET', '/getRoomAvailability', null, { startDate, endDate });
  }

  async updateRoomStatus(roomId, status) {
    return this._request('PUT', '/putRoomStatus', {
      propertyID: this.propertyId,
      roomID: roomId,
      status
    });
  }

  // ── Guests ──
  async getGuest(guestId) {
    return this._request('GET', '/getGuest', null, { guestID: guestId });
  }

  async createGuest(payload) {
    return this._request('POST', '/postGuest', { propertyID: this.propertyId, ...payload });
  }

  // ── Rates ──
  async getRates(startDate, endDate) {
    return this._request('GET', '/getRatePlans', null, { startDate, endDate });
  }

  async updateRate(rateId, amount, dates) {
    return this._request('PUT', '/putRoomRate', {
      propertyID: this.propertyId,
      rateID: rateId,
      amount,
      dates
    });
  }

  // ── Housekeeping ──
  async getHousekeeping() {
    return this._request('GET', '/getHousekeepingStatus');
  }

  async updateHousekeeping(roomId, status) {
    return this._request('PUT', '/putHousekeepingStatus', {
      propertyID: this.propertyId,
      roomID: roomId,
      status
    });
  }

  // ── Reports ──
  async getOccupancyReport(startDate, endDate) {
    return this._request('GET', '/getOccupancyReport', null, { startDate, endDate });
  }

  async getRevenueReport(startDate, endDate) {
    return this._request('GET', '/getRevenueReport', null, { startDate, endDate });
  }

  // ── Sync helpers ──
  // Sync reservations from Cloudbeds to local database
  async syncReservations(localDb) {
    try {
      const cbReservations = await this.getReservations();
      const results = { synced: 0, errors: 0 };

      for (const cbRes of cbReservations.data || []) {
        try {
          // Upsert reservation based on cloudbeds_reservation_id
          await localDb.bookings.upsertFromCloudbeds(cbRes);
          results.synced++;
        } catch (err) {
          console.error(`Failed to sync reservation ${cbRes.reservationID}:`, err.message);
          results.errors++;
        }
      }

      console.log(`Cloudbeds sync complete: ${results.synced} synced, ${results.errors} errors`);
      return results;
    } catch (error) {
      console.error('Cloudbeds sync failed:', error.message);
      throw error;
    }
  }

  // Sync rooms from Cloudbeds to local database
  async syncRooms(localDb) {
    try {
      const cbRooms = await this.getRooms();
      const results = { synced: 0, errors: 0 };

      for (const cbRoom of cbRooms.data || []) {
        try {
          await localDb.rooms.upsertFromCloudbeds(cbRoom);
          results.synced++;
        } catch (err) {
          console.error(`Failed to sync room ${cbRoom.roomID}:`, err.message);
          results.errors++;
        }
      }

      return results;
    } catch (error) {
      console.error('Cloudbeds room sync failed:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const cloudbeds = new CloudbedsService();
export default CloudbedsService;
