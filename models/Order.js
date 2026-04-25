const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  customization: {
    material: String,
    fabric: String,
    color: String,
    colorName: String,
    size: String,
    variant: String,
    notes: String
  },
  image: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    address: {
      type: String,
      required: [true, 'Delivery address is required']
    }
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    default: 'paystack',
    enum: ['paystack', 'bank_transfer']
  },
  paymentStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'paid', 'failed', 'refunded']
  },
  paymentReference: {
    type: String,
    unique: true,
    sparse: true
  },
  orderStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled']
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  estimatedDelivery: Date
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Find the last order to generate sequential number
    const lastOrder = await this.constructor.findOne(
      { orderNumber: new RegExp(`CB${year}${month}`, 'i') },
      { orderNumber: 1 },
      { sort: { orderNumber: -1 } }
    );
    
    let sequence = '001';
    if (lastOrder && lastOrder.orderNumber) {
      const lastSeq = parseInt(lastOrder.orderNumber.slice(-3));
      sequence = (lastSeq + 1).toString().padStart(3, '0');
    }
    
    this.orderNumber = `CB${year}${month}${sequence}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;