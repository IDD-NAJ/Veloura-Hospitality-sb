import twilio from 'twilio';
import { sql } from '../database/connection.js';

// Twilio SMS/WhatsApp Service
// Mirrors the TwilioService from hotel-backend.jsx

class TwilioService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    this.client = null;
  }

  // Lazy-init Twilio client
  _getClient() {
    if (!this.client) {
      if (!this.accountSid || !this.authToken) {
        throw new Error('Twilio credentials not configured');
      }
      this.client = twilio(this.accountSid, this.authToken);
    }
    return this.client;
  }

  // Send SMS or WhatsApp message
  async send({ to, body, channel = 'sms', guestId, bookingId }) {
    const client = this._getClient();

    const from = channel === 'whatsapp'
      ? this.whatsappNumber
      : this.phoneNumber;

    const toNumber = channel === 'whatsapp'
      ? `whatsapp:${to}`
      : to;

    try {
      const message = await client.messages.create({
        from,
        to: toNumber,
        body
      });

      // Log message to database
      await this._logMessage({
        guest_id: guestId,
        booking_id: bookingId,
        channel,
        direction: 'outbound',
        body,
        status: 'sent',
        provider_id: message.sid
      });

      return {
        success: true,
        sid: message.sid,
        status: message.status
      };
    } catch (error) {
      console.error('Twilio send failed:', error.message);

      // Log failure
      await this._logMessage({
        guest_id: guestId,
        booking_id: bookingId,
        channel,
        direction: 'outbound',
        body,
        status: 'failed',
        error_message: error.message
      });

      throw new Error(`Message send failed: ${error.message}`);
    }
  }

  // Log message to database
  async _logMessage(data) {
    try {
      await sql`
        INSERT INTO message_log (
          guest_id, booking_id, channel, direction, body, 
          status, provider_id, error_message, sent_at
        ) VALUES (
          ${data.guest_id}, ${data.booking_id}, ${data.channel}, ${data.direction},
          ${data.body}, ${data.status}, ${data.provider_id},
          ${data.error_message}, ${data.status === 'sent' ? new Date() : null}
        )
      `;
    } catch (err) {
      console.error('Failed to log message:', err.message);
    }
  }

  // ── Pre-built message templates ──
  templates = {
    bookingConfirmation: (guest, reservation) =>
      `Hi ${guest.name.split(' ')[0]}, your booking at Veloura is confirmed! ` +
      `Check-in: ${reservation.check_in} | Room: ${reservation.room_name || 'TBD'}. ` +
      `Confirmation #: ${reservation.ref || reservation.id.slice(0, 8).toUpperCase()}. ` +
      `We look forward to welcoming you.`,

    checkInReminder: (guest, reservation) =>
      `Reminder: Your Veloura check-in is tomorrow, ${reservation.check_in}. ` +
      `Check-in from 3:00 PM. Reply HELP for assistance.`,

    checkOutReminder: (guest) =>
      `Good morning ${guest.name.split(' ')[0]}! Check-out today is by 12:00 PM. ` +
      `Need a late check-out? Reply LATE and we'll do our best to accommodate.`,

    cancellationConfirmed: (guest, reservation) =>
      `Your Veloura reservation (${reservation.ref || reservation.id.slice(0, 8).toUpperCase()}) has been cancelled. ` +
      `Any refund will appear in 5–7 business days. Contact us if you need assistance.`,

    paymentReceived: (guest, amount, currency) =>
      `Hi ${guest.name.split(' ')[0]}, we've received your payment of ${currency} ${amount}. ` +
      `Thank you! Your booking is confirmed.`,

    welcome: (guest) =>
      `Welcome to Veloura, ${guest.name.split(' ')[0]}! ` +
      `We're delighted to have you. If you need anything during your stay, just reply to this message.`
  };

  // ── Convenience methods ──

  async sendBookingConfirmation(guest, reservation) {
    return this.send({
      to: guest.phone,
      body: this.templates.bookingConfirmation(guest, reservation),
      channel: 'sms',
      guestId: guest.id,
      bookingId: reservation.id
    });
  }

  async sendCheckInReminder(guest, reservation, channel = 'sms') {
    return this.send({
      to: guest.phone,
      body: this.templates.checkInReminder(guest, reservation),
      channel,
      guestId: guest.id,
      bookingId: reservation.id
    });
  }

  async sendCheckOutReminder(guest, reservation, channel = 'sms') {
    return this.send({
      to: guest.phone,
      body: this.templates.checkOutReminder(guest),
      channel,
      guestId: guest.id,
      bookingId: reservation.id
    });
  }

  async sendCancellationConfirmation(guest, reservation) {
    return this.send({
      to: guest.phone,
      body: this.templates.cancellationConfirmed(guest, reservation),
      channel: 'sms',
      guestId: guest.id,
      bookingId: reservation.id
    });
  }

  async sendWhatsAppBookingConfirmation(guest, reservation) {
    return this.send({
      to: guest.phone,
      body: this.templates.bookingConfirmation(guest, reservation),
      channel: 'whatsapp',
      guestId: guest.id,
      bookingId: reservation.id
    });
  }
}

export const twilioService = new TwilioService();
export default TwilioService;
