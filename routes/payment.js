const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');

// @desc    Initialize Paystack payment
// @route   POST /api/payment/initialize
// @access  Public
router.post('/initialize', async (req, res, next) => {
  try {
    const { orderId, email, amount, callback_url } = req.body;

    if (!orderId || !email || !amount) {
      const error = new Error('Missing required payment parameters');
      error.statusCode = 400;
      throw error;
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify amount matches order total
    if (Math.abs(order.total - amount) > 0.01) {
      const error = new Error('Payment amount does not match order total');
      error.statusCode = 400;
      throw error;
    }

    const paystackData = {
      email,
      amount: Math.round(amount * 100), // Convert to kobo
      currency: 'NGN',
      reference: `CB-${order.orderNumber}-${Date.now()}`,
      callback_url: callback_url || `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        custom_fields: [
          {
            display_name: "Order Number",
            variable_name: "order_number",
            value: order.orderNumber
          }
        ]
      }
    };

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      // Update order with payment reference
      order.paymentReference = response.data.data.reference;
      await order.save();

      res.json({
        success: true,
        data: {
          authorization_url: response.data.data.authorization_url,
          reference: response.data.data.reference,
          access_code: response.data.data.access_code
        }
      });
    } else {
      throw new Error('Failed to initialize payment');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Verify Paystack payment
// @route   GET /api/payment/verify/:reference
// @access  Public
router.get('/verify/:reference', async (req, res, next) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data.status && response.data.data.status === 'success') {
      // Find and update order
      const order = await Order.findOne({ paymentReference: reference });
      
      if (order) {
        order.paymentStatus = 'paid';
        if (order.orderStatus === 'pending') {
          order.orderStatus = 'confirmed';
        }
        await order.save();
      }

      res.json({
        success: true,
        data: {
          status: 'success',
          order: order ? {
            orderNumber: order.orderNumber,
            total: order.total,
            status: order.orderStatus
          } : null,
          transaction: response.data.data
        }
      });
    } else {
      res.json({
        success: false,
        data: {
          status: response.data.data.status,
          message: response.data.data.gateway_response
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Paystack webhook
// @route   POST /api/payment/webhook
// @access  Public
router.post('/webhook', async (req, res, next) => {
  try {
    // Verify webhook signature (in production)
    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      
      // Find and update order
      const order = await Order.findOne({ paymentReference: reference });
      
      if (order) {
        order.paymentStatus = 'paid';
        if (order.orderStatus === 'pending') {
          order.orderStatus = 'confirmed';
        }
        await order.save();

        // Here you could trigger email notifications, etc.
        console.log(`Order ${order.orderNumber} payment confirmed via webhook`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// @desc    Get Paystack public key
// @route   GET /api/payment/config
// @access  Public
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      currency: 'NGN'
    }
  });
});

module.exports = router;