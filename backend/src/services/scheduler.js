import cron from 'node-cron';
import { config } from '../config/environment.js';

// Scheduled tasks for hotel operations

export const initScheduledTasks = () => {
  console.log('⏰ Initializing scheduled tasks...');

  // ── Daily: Send check-in reminders (runs at 10 AM) ──
  cron.schedule('0 10 * * *', async () => {
    console.log('[CRON] Sending check-in reminders...');
    try {
      const { sql } = await import('../database/connection.js');
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      // Get tomorrow's arrivals
      const arrivals = await sql`
        SELECT b.*, u.name as guest_name, u.email as guest_email, u.phone as guest_phone,
               h.name as hotel_name, r.name as room_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN hotels h ON b.hotel_id = h.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.check_in = ${tomorrow}
          AND b.status = 'confirmed'
      `;

      if (arrivals.length === 0) {
        console.log('[CRON] No arrivals tomorrow');
        return;
      }

      // Send reminders via email and SMS
      if (config.sendgrid.isConfigured) {
        const { sendgridService } = await import('../services/sendgrid.js');
        for (const booking of arrivals) {
          try {
            await sendgridService.sendCheckInReminder(
              { id: booking.user_id, name: booking.guest_name, email: booking.guest_email },
              booking
            );
          } catch (err) {
            console.error(`[CRON] Failed to send email reminder to ${booking.guest_email}:`, err.message);
          }
        }
      }

      if (config.twilio.isConfigured) {
        const { twilioService } = await import('../services/twilio.js');
        for (const booking of arrivals) {
          if (booking.guest_phone) {
            try {
              await twilioService.sendCheckInReminder(
                { id: booking.user_id, name: booking.guest_name, phone: booking.guest_phone },
                booking
              );
            } catch (err) {
              console.error(`[CRON] Failed to send SMS reminder to ${booking.guest_phone}:`, err.message);
            }
          }
        }
      }

      console.log(`[CRON] Sent ${arrivals.length} check-in reminders`);
    } catch (error) {
      console.error('[CRON] Check-in reminder task failed:', error.message);
    }
  });

  // ── Daily: Send check-out reminders (runs at 7 AM) ──
  cron.schedule('0 7 * * *', async () => {
    console.log('[CRON] Sending check-out reminders...');
    try {
      const { sql } = await import('../database/connection.js');
      const today = new Date().toISOString().split('T')[0];

      const departures = await sql`
        SELECT b.*, u.name as guest_name, u.email as guest_email, u.phone as guest_phone,
               h.name as hotel_name, r.name as room_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN hotels h ON b.hotel_id = h.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.check_out = ${today}
          AND b.status = 'checked_in'
      `;

      if (config.twilio.isConfigured && departures.length > 0) {
        const { twilioService } = await import('../services/twilio.js');
        for (const booking of departures) {
          if (booking.guest_phone) {
            try {
              await twilioService.sendCheckOutReminder(
                { id: booking.user_id, name: booking.guest_name, phone: booking.guest_phone },
                booking
              );
            } catch (err) {
              console.error(`[CRON] Failed to send checkout reminder:`, err.message);
            }
          }
        }
      }

      console.log(`[CRON] Sent ${departures.length} check-out reminders`);
    } catch (error) {
      console.error('[CRON] Check-out reminder task failed:', error.message);
    }
  });

  // ── Every 15 minutes: Sync with Cloudbeds ──
  if (config.cloudbeds.isConfigured) {
    cron.schedule('*/15 * * * *', async () => {
      console.log('[CRON] Syncing with Cloudbeds...');
      try {
        const { cloudbeds } = await import('../services/cloudbeds.js');
        const db = await import('../database/models.js');
        await cloudbeds.syncReservations(db);
        console.log('[CRON] Cloudbeds sync completed');
      } catch (error) {
        console.error('[CRON] Cloudbeds sync failed:', error.message);
      }
    });
  }

  // ── Hourly: Sync ARI to SiteMinder channels ──
  if (config.siteminder.isConfigured && config.cloudbeds.isConfigured) {
    cron.schedule('0 * * * *', async () => {
      console.log('[CRON] Syncing ARI to SiteMinder channels...');
      try {
        const { siteminder } = await import('../services/siteminder.js');
        const { cloudbeds } = await import('../services/cloudbeds.js');
        await siteminder.syncFromCloudbeds(config.cloudbeds.propertyId, cloudbeds);
        console.log('[CRON] SiteMinder ARI sync completed');
      } catch (error) {
        console.error('[CRON] SiteMinder sync failed:', error.message);
      }
    });
  }

  // ── Daily: Mark no-shows (runs at 11 PM) ──
  cron.schedule('0 23 * * *', async () => {
    console.log('[CRON] Marking no-shows...');
    try {
      const { sql } = await import('../database/connection.js');
      const today = new Date().toISOString().split('T')[0];

      const result = await sql`
        UPDATE bookings 
        SET status = 'no_show', updated_at = NOW()
        WHERE check_in = ${today}
          AND status = 'confirmed'
        RETURNING id
      `;

      // Free up rooms for no-shows
      for (const booking of result) {
        await sql`
          UPDATE rooms SET status = 'available', updated_at = NOW()
          WHERE id = (SELECT room_id FROM bookings WHERE id = ${booking.id})
        `;
      }

      console.log(`[CRON] Marked ${result.length} bookings as no-show`);
    } catch (error) {
      console.error('[CRON] No-show task failed:', error.message);
    }
  });

  // ── Daily: Send post-stay review requests (runs at 2 PM) ──
  cron.schedule('0 14 * * *', async () => {
    console.log('[CRON] Sending post-stay review requests...');
    try {
      const { sql } = await import('../database/connection.js');
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const recentCheckouts = await sql`
        SELECT b.*, u.name as guest_name, u.email as guest_email,
               h.name as hotel_name, r.name as room_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN hotels h ON b.hotel_id = h.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.check_out = ${yesterday}
          AND b.status = 'checked_out'
          AND NOT EXISTS (
            SELECT 1 FROM reviews WHERE booking_id = b.id
          )
      `;

      if (config.sendgrid.isConfigured && recentCheckouts.length > 0) {
        const { sendgridService } = await import('../services/sendgrid.js');
        for (const booking of recentCheckouts) {
          try {
            await sendgridService.sendPostStayReview(
              { id: booking.user_id, name: booking.guest_name, email: booking.guest_email },
              booking
            );
          } catch (err) {
            console.error(`[CRON] Failed to send review request:`, err.message);
          }
        }
      }

      console.log(`[CRON] Sent ${recentCheckouts.length} review requests`);
    } catch (error) {
      console.error('[CRON] Review request task failed:', error.message);
    }
  });

  // ── Weekly: Update loyalty stats (runs Sunday at 1 AM) ──
  cron.schedule('0 1 * * 0', async () => {
    console.log('[CRON] Updating loyalty stats...');
    try {
      const { sql } = await import('../database/connection.js');
      const activeUsers = await sql`
        SELECT id FROM users WHERE is_active = true AND role = 'guest'
      `;

      for (const user of activeUsers) {
        try {
          await sql`SELECT update_user_loyalty_stats(${user.id})`;
        } catch (err) {
          console.error(`[CRON] Failed to update loyalty for user ${user.id}:`, err.message);
        }
      }

      console.log(`[CRON] Updated loyalty stats for ${activeUsers.length} users`);
    } catch (error) {
      console.error('[CRON] Loyalty stats task failed:', error.message);
    }
  });

  // ── Hourly: Clean up expired audit logs (keep 90 days) ──
  cron.schedule('30 * * * *', async () => {
    try {
      const { sql } = await import('../database/connection.js');
      const cutoff = new Date(Date.now() - 90 * 86400000).toISOString();
      
      const result = await sql`
        DELETE FROM audit_log WHERE created_at < ${cutoff}
        RETURNING id
      `;

      if (result.length > 0) {
        console.log(`[CRON] Cleaned up ${result.length} old audit log entries`);
      }
    } catch (error) {
      console.error('[CRON] Audit log cleanup failed:', error.message);
    }
  });

  console.log('✅ Scheduled tasks initialized');
};

export default initScheduledTasks;
