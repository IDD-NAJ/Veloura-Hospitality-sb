import axios from 'axios';
import { sql } from '../database/connection.js';

// SendGrid Email Service
// Mirrors the SendGridService from hotel-backend.jsx

class SendGridService {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@Veloura.com';
    this.fromName = process.env.FROM_NAME || 'Veloura Hotels';
    this.baseUrl = 'https://api.sendgrid.com/v3';
  }

  // Send email via SendGrid API
  async send({ to, subject, html, text, templateId, dynamicData, guestId, bookingId }) {
    let payload;

    if (templateId) {
      // Dynamic template email
      payload = {
        personalizations: [{
          to: [{ email: to }],
          dynamic_template_data: dynamicData || {}
        }],
        from: { email: this.fromEmail, name: this.fromName },
        template_id: templateId
      };
    } else {
      // Custom content email
      payload = {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: this.fromEmail, name: this.fromName },
        subject,
        content: [
          ...(html ? [{ type: 'text/html', value: html }] : []),
          ...(text ? [{ type: 'text/plain', value: text }] : [])
        ]
      };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/mail/send`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const messageId = response.headers['x-message-id'] || null;

      // Log message to database
      await this._logMessage({
        guest_id: guestId,
        booking_id: bookingId,
        channel: 'email',
        direction: 'outbound',
        subject: subject || templateId,
        body: text || html || '',
        status: 'sent',
        provider_id: messageId,
        template_id: templateId,
        template_data: dynamicData
      });

      return { success: true, messageId };
    } catch (error) {
      console.error('SendGrid send failed:', error.response?.data || error.message);

      // Log failure
      await this._logMessage({
        guest_id: guestId,
        booking_id: bookingId,
        channel: 'email',
        direction: 'outbound',
        subject: subject || templateId,
        body: text || html || '',
        status: 'failed',
        error_message: error.response?.data?.errors?.[0]?.message || error.message,
        template_id: templateId,
        template_data: dynamicData
      });

      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  // Log message to database
  async _logMessage(data) {
    try {
      await sql`
        INSERT INTO message_log (
          guest_id, booking_id, channel, direction, subject, body, 
          status, provider_id, template_id, template_data, error_message, sent_at
        ) VALUES (
          ${data.guest_id}, ${data.booking_id}, ${data.channel}, ${data.direction},
          ${data.subject}, ${data.body}, ${data.status}, ${data.provider_id},
          ${data.template_id}, ${JSON.stringify(data.template_data || {})},
          ${data.error_message}, ${data.status === 'sent' ? new Date() : null}
        )
      `;
    } catch (err) {
      console.error('Failed to log message:', err.message);
    }
  }

  // SendGrid Dynamic Template IDs
  TEMPLATES = {
    BOOKING_CONFIRMATION: 'd-YOUR_SG_TEMPLATE_BOOKING_CONF',
    CHECK_IN_REMINDER: 'd-YOUR_SG_TEMPLATE_CHECKIN_REM',
    CHECK_OUT_REMINDER: 'd-YOUR_SG_TEMPLATE_CHECKOUT_REM',
    CANCELLATION: 'd-YOUR_SG_TEMPLATE_CANCEL',
    INVOICE: 'd-YOUR_SG_TEMPLATE_INVOICE',
    WELCOME: 'd-YOUR_SG_TEMPLATE_WELCOME',
    POST_STAY_REVIEW: 'd-YOUR_SG_TEMPLATE_REVIEW',
    PASSWORD_RESET: 'd-YOUR_SG_TEMPLATE_PW_RESET'
  };

  // ── Pre-built email methods ──

  async sendBookingConfirmation(guest, reservation) {
    return this.send({
      to: guest.email,
      subject: `Booking Confirmed — ${reservation.room_name || 'Your Room'} | Veloura`,
      guestId: guest.id,
      bookingId: reservation.id,
      templateId: this.TEMPLATES.BOOKING_CONFIRMATION,
      dynamicData: {
        guest_name: guest.name,
        room_name: reservation.room_name,
        check_in: reservation.check_in,
        check_out: reservation.check_out,
        total_amount: reservation.total_amount,
        confirmation_id: reservation.ref || reservation.id.slice(0, 8).toUpperCase(),
        hotel_name: reservation.hotel_name,
        nights: reservation.nights
      }
    });
  }

  async sendCheckInReminder(guest, reservation) {
    return this.send({
      to: guest.email,
      subject: `Check-in Reminder — ${reservation.check_in} | Veloura`,
      guestId: guest.id,
      bookingId: reservation.id,
      templateId: this.TEMPLATES.CHECK_IN_REMINDER,
      dynamicData: {
        guest_name: guest.name,
        check_in: reservation.check_in,
        room_name: reservation.room_name,
        hotel_name: reservation.hotel_name,
        confirmation_id: reservation.ref
      }
    });
  }

  async sendCheckOutReminder(guest, reservation) {
    return this.send({
      to: guest.email,
      subject: `Check-out Reminder | Veloura`,
      guestId: guest.id,
      bookingId: reservation.id,
      templateId: this.TEMPLATES.CHECK_OUT_REMINDER,
      dynamicData: {
        guest_name: guest.name,
        check_out: reservation.check_out,
        room_name: reservation.room_name,
        hotel_name: reservation.hotel_name
      }
    });
  }

  async sendCancellationConfirmation(guest, reservation) {
    return this.send({
      to: guest.email,
      subject: `Booking Cancelled — ${reservation.ref} | Veloura`,
      guestId: guest.id,
      bookingId: reservation.id,
      templateId: this.TEMPLATES.CANCELLATION,
      dynamicData: {
        guest_name: guest.name,
        confirmation_id: reservation.ref,
        check_in: reservation.check_in,
        check_out: reservation.check_out,
        hotel_name: reservation.hotel_name
      }
    });
  }

  async sendInvoice(guest, reservation, payment) {
    return this.send({
      to: guest.email,
      subject: `Your Invoice — Veloura`,
      guestId: guest.id,
      bookingId: reservation.id,
      templateId: this.TEMPLATES.INVOICE,
      dynamicData: {
        guest_name: guest.name,
        amount: payment.amount,
        currency: payment.currency,
        payment_date: new Date(payment.created_at).toLocaleDateString(),
        invoice_id: payment.id.slice(0, 8).toUpperCase(),
        room_name: reservation.room_name,
        check_in: reservation.check_in,
        check_out: reservation.check_out
      }
    });
  }

  async sendWelcomeEmail(guest) {
    return this.send({
      to: guest.email,
      subject: `Welcome to Veloura`,
      guestId: guest.id,
      templateId: this.TEMPLATES.WELCOME,
      dynamicData: {
        guest_name: guest.name
      }
    });
  }

  async sendPostStayReview(guest, reservation) {
    return this.send({
      to: guest.email,
      subject: `How was your stay? | Veloura`,
      guestId: guest.id,
      bookingId: reservation.id,
      templateId: this.TEMPLATES.POST_STAY_REVIEW,
      dynamicData: {
        guest_name: guest.name,
        hotel_name: reservation.hotel_name,
        check_out: reservation.check_out,
        review_link: `${process.env.CORS_ORIGIN}/review/${reservation.id}`
      }
    });
  }

  async sendPasswordReset(email, resetToken) {
    return this.send({
      to: email,
      subject: `Password Reset — Veloura`,
      templateId: this.TEMPLATES.PASSWORD_RESET,
      dynamicData: {
        reset_link: `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`
      }
    });
  }
}

export const sendgridService = new SendGridService();
export default SendGridService;
