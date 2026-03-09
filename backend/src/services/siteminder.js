import axios from 'axios';

// SiteMinder Channel Manager API Integration Service
// Mirrors the SiteMinderService from hotel-backend.jsx

class SiteMinderService {
  constructor() {
    this.baseUrl = process.env.SITEMINDER_BASE_URL || 'https://connect.siteminder.com/v1';
    this.apiKey = process.env.SITEMINDER_API_KEY;
    this.headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
  }

  // Generic API request helper
  async _request(method, path, data = null) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${path}`,
        data,
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error(`SiteMinder ${method} ${path} failed:`, error.response?.data || error.message);
      throw new Error(`SiteMinder API error: ${error.response?.status || error.message}`);
    }
  }

  // ── Inventory ──
  async getInventory(propertyId, startDate, endDate) {
    return this._request('GET', `/properties/${propertyId}/inventory?from=${startDate}&to=${endDate}`);
  }

  async updateInventory(propertyId, roomTypeId, dates, availability) {
    return this._request('PUT', `/properties/${propertyId}/inventory`, {
      room_type_id: roomTypeId,
      dates,
      availability
    });
  }

  // ── Rates ──
  async getRates(propertyId, ratePlanId, startDate, endDate) {
    return this._request('GET', `/properties/${propertyId}/rates/${ratePlanId}?from=${startDate}&to=${endDate}`);
  }

  async updateRates(propertyId, ratePlanId, rates) {
    return this._request('PUT', `/properties/${propertyId}/rates/${ratePlanId}`, { rates });
  }

  // ── Restrictions ──
  async updateRestrictions(propertyId, roomTypeId, restrictions) {
    return this._request('PUT', `/properties/${propertyId}/restrictions`, {
      room_type_id: roomTypeId,
      ...restrictions
    });
  }

  // ── Reservations from OTAs ──
  async getReservations(propertyId, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this._request('GET', `/properties/${propertyId}/reservations?${qs}`);
  }

  // ── Channels ──
  async getChannels(propertyId) {
    return this._request('GET', `/properties/${propertyId}/channels`);
  }

  async toggleChannel(propertyId, channelId, enabled) {
    return this._request('PATCH', `/properties/${propertyId}/channels/${channelId}`, { enabled });
  }

  // ── Bulk sync (push ARI to all channels) ──
  async pushARI(propertyId, payload) {
    return this._request('POST', `/properties/${propertyId}/ari`, payload);
  }

  // ── Sync helper: pull Cloudbeds data and push to all OTA channels ──
  async syncFromCloudbeds(propertyId, cloudbedsService) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const in90days = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

      const [cbRooms, cbRates] = await Promise.all([
        cloudbedsService.getRoomAvailability(today, in90days),
        cloudbedsService.getRates(today, in90days)
      ]);

      await this.pushARI(propertyId, { rooms: cbRooms, rates: cbRates });

      console.log('SiteMinder ARI sync completed successfully');
      return { success: true, message: 'ARI synced to all channels' };
    } catch (error) {
      console.error('SiteMinder sync failed:', error.message);
      throw error;
    }
  }

  // ── Import OTA reservations into local database ──
  async importReservations(propertyId, localDb, channelSyncLog) {
    try {
      const otaReservations = await this.getReservations(propertyId, {
        status: 'new',
        from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      });

      const results = { imported: 0, errors: 0 };

      for (const otaRes of otaReservations.reservations || []) {
        try {
          // Create booking in local DB
          const booking = await localDb.bookings.create({
            check_in: otaRes.check_in,
            check_out: otaRes.check_out,
            guests: otaRes.guests,
            total_amount: otaRes.total_amount,
            source: otaRes.channel,
            channel: otaRes.channel,
            notes: `Imported from ${otaRes.channel}`
          });

          // Log the sync
          await channelSyncLog.create({
            channel: otaRes.channel,
            event_type: 'reservation_created',
            reservation_id: booking.id,
            external_id: otaRes.external_id,
            direction: 'inbound',
            raw_payload: otaRes,
            status: 'success'
          });

          results.imported++;
        } catch (err) {
          console.error(`Failed to import OTA reservation:`, err.message);
          results.errors++;
        }
      }

      return results;
    } catch (error) {
      console.error('OTA reservation import failed:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const siteminder = new SiteMinderService();
export default SiteMinderService;
