import express from 'express';
import Stripe from 'stripe';
import { authenticate, authorize, hotelStaffOrAdmin, asyncHandler } from '../auth/middleware.js';
import { validate } from '../auth/middleware.js';
import { paymentSchemas } from '../validation/schemas.js';
import { payments, bookings } from '../database/models.js';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-intent',
  authenticate,
  validate(paymentSchemas.createIntent),
  asyncHandler(async (req, res) => {
    const { booking_id, amount, currency = 'usd', metadata = {} } = req.body;

    // Verify booking exists
    const booking = await bookings.findById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        booking_id,
        booking_ref: booking.ref,
        guest_name: booking.guest_name,
        hotel_name: booking.hotel_name,
        ...metadata
      },
      automatic_payment_methods: { enabled: true }
    });

    // Record payment in database
    await payments.create({
      booking_id,
      stripe_payment_intent_id: paymentIntent.id,
      amount,
      currency,
      status: paymentIntent.status,
      metadata
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  })
);

// Get payment status
router.get('/status/:paymentIntentId',
  authenticate,
  asyncHandler(async (req, res) => {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.paymentIntentId);

    res.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata
      }
    });
  })
);

// Confirm payment (update local DB after Stripe confirms)
router.post('/confirm',
  authenticate,
  validate(paymentSchemas.confirm),
  asyncHandler(async (req, res) => {
    const { payment_intent_id } = req.body;

    // Get Stripe payment status
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    // Update local payment record
    const payment = await payments.findByStripeIntentId(payment_intent_id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    await payments.updateStatus(payment.id, paymentIntent.status, {
      card_brand: paymentIntent.payment_method_types?.[0],
      card_last4: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4
    });

    // Update booking payment status if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      const booking = await bookings.findById(payment.booking_id);
      if (booking) {
        const totalPaid = paymentIntent.amount / 100;
        const paymentStatus = totalPaid >= booking.total_amount ? 'paid' : 'partial';
        await bookings.update(payment.booking_id, {
          payment_status: paymentStatus,
          stripe_payment_intent_id: payment_intent_id
        });
      }
    }

    res.json({
      success: true,
      message: 'Payment confirmed',
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100
      }
    });
  })
);

// Process refund
router.post('/refund',
  authenticate,
  authorize(['admin', 'manager']),
  validate(paymentSchemas.refund),
  asyncHandler(async (req, res) => {
    const { payment_intent_id, amount, reason } = req.body;

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: payment_intent_id,
      amount: Math.round(amount * 100),
      reason: 'requested_by_customer'
    });

    // Update local payment record
    const payment = await payments.findByStripeIntentId(payment_intent_id);
    if (payment) {
      await payments.processRefund(payment.id, amount, reason);

      // Update booking payment status
      await bookings.update(payment.booking_id, {
        payment_status: 'refunded'
      });
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refund_id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });
  })
);

// List payments (admin/manager)
router.get('/',
  authenticate,
  hotelStaffOrAdmin,
  asyncHandler(async (req, res) => {
    const { booking_id } = req.query;

    let paymentList;
    if (booking_id) {
      paymentList = await payments.listByBooking(booking_id);
    } else {
      // For now, get payments for recent bookings
      const recentBookings = await bookings.list({ limit: 100 });
      paymentList = [];
      for (const booking of recentBookings) {
        const bPayments = await payments.listByBooking(booking.id);
        paymentList.push(...bPayments);
      }
    }

    res.json({
      success: true,
      data: paymentList
    });
  })
);

// Get payment by ID
router.get('/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const payment = await payments.findByStripeIntentId(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  })
);

export default router;
