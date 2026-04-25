const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public
router.post('/', async (req, res, next) => {
  try {
    const { customer, items, deliveryFee = 0, notes } = req.body;

    // Validate required fields
    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      const error = new Error('Customer information is incomplete');
      error.statusCode = 400;
      throw error;
    }

    if (!items || items.length === 0) {
      const error = new Error('Order must contain at least one item');
      error.statusCode = 400;
      throw error;
    }

    // Verify products and calculate totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        const error = new Error(`Product with ID ${item.productId} not found`);
        error.statusCode = 404;
        throw error;
      }

      const itemPrice = item.price || product.price;
      subtotal += itemPrice * (item.quantity || 1);

      validatedItems.push({
        productId: product._id,
        name: item.name || product.name,
        price: itemPrice,
        originalPrice: product.price,
        quantity: item.quantity || 1,
        customization: item.customization || {},
        image: item.image || product.mainImage
      });
    }

    const total = subtotal + (deliveryFee || 0);

    // Create order
    const order = await Order.create({
      customer,
      items: validatedItems,
      subtotal,
      deliveryFee: deliveryFee || 0,
      total,
      notes,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      estimatedDelivery: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 3 weeks lead time
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get order by ID or order number
// @route   GET /api/orders/:identifier
// @access  Public
router.get('/:identifier', async (req, res, next) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is ObjectId or order number
    const query = identifier.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: identifier }
      : { orderNumber: identifier };

    const order = await Order.findOne(query).populate('items.productId', 'name price mainImage');

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment
// @access  Public
router.put('/:id/payment', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentReference } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    order.paymentStatus = paymentStatus || order.paymentStatus;
    if (paymentReference) {
      order.paymentReference = paymentReference;
    }

    // Update order status when payment is confirmed
    if (paymentStatus === 'paid' && order.orderStatus === 'pending') {
      order.orderStatus = 'confirmed';
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get orders by email
// @route   GET /api/orders/customer/:email
// @access  Public
router.get('/customer/:email', async (req, res, next) => {
  try {
    const { email } = req.params;

    const orders = await Order.find({ 'customer.email': email.toLowerCase() })
      .sort('-createdAt')
      .select('orderNumber total orderStatus paymentStatus createdAt estimatedDelivery');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;