const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['chairs', 'tables', 'lamps', 'tvconsole'],
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  shortDesc: {
    type: String,
    required: [true, 'Short description is required']
  },
  mainImage: {
    type: String,
    required: [true, 'Main image is required']
  },
  gallery: [{
    type: String
  }],
  variantImages: {
    type: Map,
    of: String,
    default: {}
  },
  materials: [{
    type: String
  }],
  fabrics: [{
    type: String
  }],
  colors: {
    type: Map,
    of: [String],
    default: {}
  },
  sizes: [{
    type: String
  }],
  frameOptions: [{
    type: String
  }],
  details: {
    description: String,
    dimensions: String,
    weight: String,
    leadTime: String,
    care: String
  },
  priceModifiers: {
    materialModifiers: {
      type: Map,
      of: Number,
      default: {}
    },
    fabricModifiers: {
      type: Map,
      of: Number,
      default: {}
    },
    sizeModifiers: {
      type: Map,
      of: Number,
      default: {}
    },
    variantModifiers: {
      type: Map,
      of: Number,
      default: {}
    },
    frameModifiers: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better query performance
productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;