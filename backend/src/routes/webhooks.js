import express from 'express';
import Stripe from 'stripe';
import { asyncHandler } from '../auth/middleware.js';
import { payments, bookings } from '../database/models.js';
import { sql } from '../database/connection.js';

const router = express.Router();

// Stripe webhook handler
router.post('/stripe',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const payment = await payments.findByStripeIntentId(paymentIntent.id);
        if (payment) {
          await payments.updateStatus(payment.id, 'succeeded', {
            card_brand: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.brand,
            card_last4: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4,
            method: 'card'
          });
          await bookings.update(payment.booking_id, { payment_status: 'paid' });
          console.log(`Payment ${paymentIntent.id} succeeded for booking ${payment.booking_id}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const payment = await payments.findByStripeIntentId(paymentIntent.id);
        if (payment) {
          await payments.updateStatus(payment.id, 'failed', {
            failure_reason: paymentIntent.last_payment_error?.message
          });
          await bookings.update(payment.booking_id, { payment_status: 'failed' });
          console.log(`Payment ${paymentIntent.id} failed: ${paymentIntent.last_payment_error?.message}`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;
        const payment = await payments.findByStripeIntentId(paymentIntentId);
        if (payment) {
          const refundedAmount = charge.amount_refunded / 100;
          await payments.processRefund(payment.id, refundedAmount, 'Stripe webhook refund');
          await bookings.update(payment.booking_id, { payment_status: 'refunded' });
          console.log(`Charge refunded: ${refundedAmount} for payment ${paymentIntentId}`);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object;
        const payment = await payments.findByStripeIntentId(paymentIntent.id);
        if (payment) {
          await payments.updateStatus(payment.id, 'canceled');
          console.log(`Payment ${paymentIntent.id} canceled`);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  })
);

// Cloudbeds webhook handler
router.post('/cloudbeds',
  asyncHandler(async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.CLOUDBEDS_WEBHOOK_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { event_type, data } = req.body;
    console.log(`Cloudbeds webhook received: ${event_type}`);

    try {
      switch (event_type) {
        case 'reservation.created': {
          // Import reservation from Cloudbeds
          await sql`
            INSERT INTO channel_sync_log (channel, event_type, external_id, direction, raw_payload, status)
            VALUES ('cloudbeds', ${event_type}, ${data.reservationID}, 'inbound', ${JSON.stringify(data)}, 'processing')
          `;
          console.log(`New Cloudbeds reservation: ${data.reservationID}`);
          break;
        }

        case 'reservation.modified': {
          await sql`
            INSERT INTO channel_sync_log (channel, event_type, external_id, direction, raw_payload, status)
            VALUES ('cloudbeds', ${event_type}, ${data.reservationID}, 'inbound', ${JSON.stringify(data)}, 'processing')
          `;
          console.log(`Cloudbeds reservation modified: ${data.reservationID}`);
          break;
        }

        case 'reservation.cancelled': {
          await sql`
            INSERT INTO channel_sync_log (channel, event_type, external_id, direction, raw_payload, status)
            VALUES ('cloudbeds', ${event_type}, ${data.reservationID}, 'inbound', ${JSON.stringify(data)}, 'processing')
          `;
          // Find and cancel local booking
          const localBookings = await sql`
            SELECT id FROM bookings WHERE cloudbeds_reservation_id = ${data.reservationID}
          `;
          if (localBookings[0]) {
            await bookings.cancel(localBookings[0].id, 'Cancelled via Cloudbeds', null);
          }
          break;
        }

        case 'room.status_changed': {
          const { rooms } = await import('../database/models.js');
          const localRooms = await sql`
            SELECT id FROM rooms WHERE cloudbeds_room_id = ${data.roomID}
          `;
          if (localRooms[0]) {
            await rooms.updateStatus(localRooms[0].id, data.status);
          }
          break;
        }

        default:
          console.log(`Unhandled Cloudbeds event: ${event_type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Cloudbeds webhook processing error:', error.message);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  })
);

// SiteMinder webhook handler (OTA reservation imports)
router.post('/siteminder',
  asyncHandler(async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.SITEMINDER_WEBHOOK_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { event_type, data } = req.body;
    console.log(`SiteMinder webhook received: ${event_type}`);

    try {
      switch (event_type) {
        case 'reservation.new': {
          await sql`
            INSERT INTO channel_sync_log (channel, event_type, external_id, direction, raw_payload, status)
            VALUES (${data.channel || 'ota'}, ${event_type}, ${data.external_id}, 'inbound', ${JSON.stringify(data)}, 'processing')
          `;

          // Create local booking from OTA reservation
          const booking = await bookings.create({
            hotel_id: data.hotel_id,
            room_id: data.room_id,
            check_in: data.check_in,
            check_out: data.check_out,
            guests: data.guests || 1,
            adults: data.adults || 1,
            total_amount: data.total_amount,
            source: data.channel || 'ota',
            channel: data.channel,
            notes: `Imported from ${data.channel} via SiteMinder`
          });

          console.log(`OTA reservation imported: ${booking.ref} from ${data.channel}`);
          break;
        }

        case 'reservation.modified': {
          await sql`
            INSERT INTO channel_sync_log (channel, event_type, external_id, direction, raw_payload, status)
            VALUES (${data.channel || 'ota'}, ${event_type}, ${data.external_id}, 'inbound', ${JSON.stringify(data)}, 'processing')
          `;
          break;
        }

        case 'reservation.cancelled': {
          await sql`
            INSERT INTO channel_sync_log (channel, event_type, external_id, direction, raw_payload, status)
            VALUES (${data.channel || 'ota'}, ${event_type}, ${data.external_id}, 'inbound', ${JSON.stringify(data)}, 'processing')
          `;
          break;
        }

        default:
          console.log(`Unhandled SiteMinder event: ${event_type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('SiteMinder webhook processing error:', error.message);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  })
);

// Twilio status callback webhook
router.post('/twilio/status',
  asyncHandler(async (req, res) => {
    const { MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage } = req.body;
    console.log(`Twilio status callback: ${MessageSid} → ${MessageStatus}`);

    try {
      // Update message log status
      await sql`
        UPDATE message_log 
        SET status = ${MessageStatus === 'delivered' ? 'delivered' : MessageStatus === 'failed' ? 'failed' : 'sent'},
            delivered_at = ${MessageStatus === 'delivered' ? new Date() : null},
            error_message = ${ErrorMessage || null}
        WHERE provider_id = ${MessageSid}
      `;
    } catch (error) {
      console.error('Twilio status callback error:', error.message);
    }

    res.status(200).send();
  })
);

// SendGrid event webhook
router.post('/sendgrid/events',
  asyncHandler(async (req, res) => {
    const events = req.body;

    for (const event of (Array.isArray(events) ? events : [events])) {
      try {
        const status = event.event === 'delivered' ? 'delivered'
          : event.event === 'bounce' ? 'bounced'
          : event.event === 'dropped' ? 'failed'
          : null;

        if (status && event.sg_message_id) {
          await sql`
            UPDATE message_log 
            SET status = ${status},
                delivered_at = ${status === 'delivered' ? new Date() : null},
                error_message = ${event.reason || null}
            WHERE provider_id LIKE ${event.sg_message_id.split('.')[0] + '%'}
          `;
        }
      } catch (error) {
        console.error('SendGrid event processing error:', error.message);
      }
    }

    res.status(200).send();
  })
);

export default router;
