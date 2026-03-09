import express from 'express';
import makecorpsService from '../services/makecorpsService.js';
import { authenticate, authorize } from '../auth/middleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOWS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/makecorps/workflows
 * @desc    Create a new workflow
 * @access  Admin
 */
router.post('/workflows', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const workflow = req.body;

    const result = await makecorpsService.createWorkflow(workflow);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create workflow',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/makecorps/workflows/:workflowId
 * @desc    Get workflow status
 * @access  Admin
 */
router.get('/workflows/:workflowId', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { workflowId } = req.params;

    const result = await makecorpsService.getWorkflowStatus(workflowId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workflow status',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/makecorps/workflows/:workflowId/execute
 * @desc    Execute a workflow
 * @access  Admin
 */
router.post('/workflows/:workflowId/execute', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { workflowId } = req.params;
    const input = req.body;

    const result = await makecorpsService.executeWorkflow(workflowId, input);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Execute workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute workflow',
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/makecorps/analytics
 * @desc    Get business analytics
 * @access  Admin
 */
router.get('/analytics', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { startDate, endDate, metrics, groupBy } = req.query;

    const result = await makecorpsService.getAnalytics({
      startDate,
      endDate,
      metrics: metrics ? metrics.split(',') : [],
      groupBy,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/makecorps/analytics/revenue
 * @desc    Get revenue insights
 * @access  Admin
 */
router.get('/analytics/revenue', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.query;

    const result = await makecorpsService.getRevenueInsights({
      propertyId,
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Revenue insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue insights',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/makecorps/analytics/forecast
 * @desc    Get occupancy forecast
 * @access  Admin
 */
router.get('/analytics/forecast', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { propertyId, days } = req.query;

    const result = await makecorpsService.getOccupancyForecast({
      propertyId,
      days: days ? parseInt(days) : 30,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get forecast',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/makecorps/reports/generate
 * @desc    Generate custom report
 * @access  Admin
 */
router.post('/reports/generate', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const reportConfig = req.body;

    const result = await makecorpsService.generateReport(reportConfig);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/makecorps/inventory/sync
 * @desc    Sync inventory across channels
 * @access  Admin
 */
router.post('/inventory/sync', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const inventory = req.body;

    const result = await makecorpsService.syncInventory(inventory);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Inventory sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync inventory',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/makecorps/inventory/availability
 * @desc    Update room availability
 * @access  Admin
 */
router.put('/inventory/availability', authenticate, authorize(['admin', 'manager', 'staff']), async (req, res) => {
  try {
    const availability = req.body;

    const result = await makecorpsService.updateAvailability(availability);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/makecorps/inventory/status
 * @desc    Get inventory status
 * @access  Admin
 */
router.get('/inventory/status', authenticate, authorize(['admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { propertyId } = req.query;

    const result = await makecorpsService.getInventoryStatus(propertyId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Inventory status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory status',
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/makecorps/pricing/dynamic
 * @desc    Get dynamic pricing recommendations
 * @access  Admin
 */
router.get('/pricing/dynamic', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { propertyId, roomTypeId, startDate, endDate } = req.query;

    const result = await makecorpsService.getDynamicPricing({
      propertyId,
      roomTypeId,
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Dynamic pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pricing recommendations',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/makecorps/pricing/competitor-analysis
 * @desc    Get competitor pricing analysis
 * @access  Admin
 */
router.get('/pricing/competitor-analysis', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { propertyId, competitors, startDate, endDate } = req.query;

    const result = await makecorpsService.getCompetitorAnalysis({
      propertyId,
      competitors: competitors ? competitors.split(',') : [],
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Competitor analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get competitor analysis',
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// AUTOMATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/makecorps/automation/rules
 * @desc    Create automation rule
 * @access  Admin
 */
router.post('/automation/rules', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const rule = req.body;

    const result = await makecorpsService.createAutomationRule(rule);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Create automation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create automation rule',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/makecorps/automation/rules/:ruleId/trigger
 * @desc    Trigger automation
 * @access  Admin
 */
router.post('/automation/rules/:ruleId/trigger', authenticate, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { ruleId } = req.params;
    const context = req.body;

    const result = await makecorpsService.triggerAutomation(ruleId, context);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Trigger automation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger automation',
      error: error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/makecorps/webhooks
 * @desc    Handle Makecorps webhooks
 * @access  Public (verified by signature)
 */
router.post('/webhooks', async (req, res) => {
  try {
    const signature = req.headers['x-makecorps-signature'];
    const payload = req.body;

    // Verify webhook signature
    const isValid = makecorpsService.verifyWebhookSignature(payload, signature);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    // Process webhook event
    console.log('Makecorps webhook received:', payload.event_type);

    // Handle different event types
    switch (payload.event_type) {
      case 'workflow.completed':
        // Handle workflow completion
        break;
      case 'alert.triggered':
        // Handle alert
        break;
      case 'inventory.updated':
        // Handle inventory update
        break;
      default:
        console.log('Unknown event type:', payload.event_type);
    }

    res.json({
      success: true,
      message: 'Webhook processed',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message,
    });
  }
});

export default router;
