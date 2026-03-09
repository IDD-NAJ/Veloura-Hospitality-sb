import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Makecorps Service Integration
 * Provides business operations, analytics, and workflow automation
 * Custom enterprise service for hotel operations management
 */

class MakecorpsService {
  constructor() {
    this.apiKey = process.env.MAKECORPS_API_KEY;
    this.apiSecret = process.env.MAKECORPS_API_SECRET;
    this.baseUrl = process.env.MAKECORPS_BASE_URL || 'https://api.makecorps.com/v1';
    this.webhookSecret = process.env.MAKECORPS_WEBHOOK_SECRET;

    if (!this.apiKey || !this.apiSecret) {
      console.warn('⚠️  Makecorps API credentials not configured');
    }
  }

  /**
   * Generate HMAC signature for request authentication
   */
  generateSignature(timestamp, method, path, body = '') {
    const message = `${timestamp}${method}${path}${body}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const { method = 'GET', data = null, params = {} } = options;
    const timestamp = Date.now().toString();
    const path = endpoint;
    const body = data ? JSON.stringify(data) : '';
    const signature = this.generateSignature(timestamp, method, path, body);

    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'X-API-Key': this.apiKey,
          'X-Timestamp': timestamp,
          'X-Signature': signature,
          'Content-Type': 'application/json',
        },
      };

      if (method === 'GET' && Object.keys(params).length > 0) {
        config.params = params;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Makecorps API error (${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a new business workflow
   * @param {Object} workflow - Workflow configuration
   * @returns {Promise<Object>} Created workflow
   */
  async createWorkflow(workflow) {
    return await this.request('/workflows', {
      method: 'POST',
      data: workflow,
    });
  }

  /**
   * Get workflow status
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Workflow status
   */
  async getWorkflowStatus(workflowId) {
    return await this.request(`/workflows/${workflowId}`);
  }

  /**
   * Execute a workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} input - Workflow input data
   * @returns {Promise<Object>} Execution result
   */
  async executeWorkflow(workflowId, input) {
    return await this.request(`/workflows/${workflowId}/execute`, {
      method: 'POST',
      data: input,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYTICS & REPORTING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get business analytics
   * @param {Object} params - Analytics parameters
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics({ startDate, endDate, metrics, groupBy }) {
    return await this.request('/analytics', {
      params: {
        start_date: startDate,
        end_date: endDate,
        metrics: metrics.join(','),
        group_by: groupBy,
      },
    });
  }

  /**
   * Generate custom report
   * @param {Object} reportConfig - Report configuration
   * @returns {Promise<Object>} Report data
   */
  async generateReport(reportConfig) {
    return await this.request('/reports/generate', {
      method: 'POST',
      data: reportConfig,
    });
  }

  /**
   * Get revenue insights
   * @param {Object} params - Revenue parameters
   * @returns {Promise<Object>} Revenue insights
   */
  async getRevenueInsights({ propertyId, startDate, endDate }) {
    return await this.request('/analytics/revenue', {
      params: {
        property_id: propertyId,
        start_date: startDate,
        end_date: endDate,
      },
    });
  }

  /**
   * Get occupancy forecast
   * @param {Object} params - Forecast parameters
   * @returns {Promise<Object>} Occupancy forecast
   */
  async getOccupancyForecast({ propertyId, days = 30 }) {
    return await this.request('/analytics/forecast/occupancy', {
      params: {
        property_id: propertyId,
        days,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INVENTORY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Sync inventory across channels
   * @param {Object} inventory - Inventory data
   * @returns {Promise<Object>} Sync result
   */
  async syncInventory(inventory) {
    return await this.request('/inventory/sync', {
      method: 'POST',
      data: inventory,
    });
  }

  /**
   * Update room availability
   * @param {Object} availability - Availability data
   * @returns {Promise<Object>} Update result
   */
  async updateAvailability(availability) {
    return await this.request('/inventory/availability', {
      method: 'PUT',
      data: availability,
    });
  }

  /**
   * Get inventory status
   * @param {string} propertyId - Property ID
   * @returns {Promise<Object>} Inventory status
   */
  async getInventoryStatus(propertyId) {
    return await this.request('/inventory/status', {
      params: { property_id: propertyId },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRICING & REVENUE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get dynamic pricing recommendations
   * @param {Object} params - Pricing parameters
   * @returns {Promise<Object>} Pricing recommendations
   */
  async getDynamicPricing({ propertyId, roomTypeId, startDate, endDate }) {
    return await this.request('/pricing/dynamic', {
      params: {
        property_id: propertyId,
        room_type_id: roomTypeId,
        start_date: startDate,
        end_date: endDate,
      },
    });
  }

  /**
   * Update pricing strategy
   * @param {Object} strategy - Pricing strategy
   * @returns {Promise<Object>} Update result
   */
  async updatePricingStrategy(strategy) {
    return await this.request('/pricing/strategy', {
      method: 'PUT',
      data: strategy,
    });
  }

  /**
   * Get competitor pricing analysis
   * @param {Object} params - Analysis parameters
   * @returns {Promise<Object>} Competitor analysis
   */
  async getCompetitorAnalysis({ propertyId, competitors, startDate, endDate }) {
    return await this.request('/pricing/competitor-analysis', {
      params: {
        property_id: propertyId,
        competitors: competitors.join(','),
        start_date: startDate,
        end_date: endDate,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GUEST MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get guest profile
   * @param {string} guestId - Guest ID
   * @returns {Promise<Object>} Guest profile
   */
  async getGuestProfile(guestId) {
    return await this.request(`/guests/${guestId}`);
  }

  /**
   * Update guest preferences
   * @param {string} guestId - Guest ID
   * @param {Object} preferences - Guest preferences
   * @returns {Promise<Object>} Update result
   */
  async updateGuestPreferences(guestId, preferences) {
    return await this.request(`/guests/${guestId}/preferences`, {
      method: 'PUT',
      data: preferences,
    });
  }

  /**
   * Get guest sentiment analysis
   * @param {string} guestId - Guest ID
   * @returns {Promise<Object>} Sentiment analysis
   */
  async getGuestSentiment(guestId) {
    return await this.request(`/guests/${guestId}/sentiment`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTOMATION & INTEGRATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create automation rule
   * @param {Object} rule - Automation rule
   * @returns {Promise<Object>} Created rule
   */
  async createAutomationRule(rule) {
    return await this.request('/automation/rules', {
      method: 'POST',
      data: rule,
    });
  }

  /**
   * Trigger automation
   * @param {string} ruleId - Rule ID
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   */
  async triggerAutomation(ruleId, context) {
    return await this.request(`/automation/rules/${ruleId}/trigger`, {
      method: 'POST',
      data: context,
    });
  }

  /**
   * Get integration status
   * @param {string} integrationId - Integration ID
   * @returns {Promise<Object>} Integration status
   */
  async getIntegrationStatus(integrationId) {
    return await this.request(`/integrations/${integrationId}/status`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS & ALERTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Send notification
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} Send result
   */
  async sendNotification(notification) {
    return await this.request('/notifications/send', {
      method: 'POST',
      data: notification,
    });
  }

  /**
   * Create alert rule
   * @param {Object} alert - Alert configuration
   * @returns {Promise<Object>} Created alert
   */
  async createAlert(alert) {
    return await this.request('/alerts', {
      method: 'POST',
      data: alert,
    });
  }

  /**
   * Get active alerts
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>} Active alerts
   */
  async getActiveAlerts(params = {}) {
    return await this.request('/alerts/active', { params });
  }
}

// Export singleton instance
export default new MakecorpsService();
