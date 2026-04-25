const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @desc    Get all products with filtering
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      featured, 
      search,
      sort = '-createdAt',
      limit = 50,
      page = 1
    } = req.query;

    const query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter featured products
    if (featured === 'true') {
      query.featured = true;
    }

    // Search by text
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const { sort = '-createdAt', limit = 50 } = req.query;

    const products = await Product.find({ category })
      .sort(sort)
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get product categories with counts
// @route   GET /api/products/categories/list
// @access  Public
router.get('/categories/list', async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          minPrice: 1,
          maxPrice: 1,
          _id: 0
        }
      }
    ]);

    // Category labels
    const categoryLabels = {
      chairs: { label: 'Chairs', tagline: 'Sculpted for stillness' },
      tables: { label: 'Tables', tagline: 'Grounded forms' },
      lamps: { label: 'Lamps', tagline: 'Light, refined' },
      tvconsole: { label: 'TV Console', tagline: 'Entertainment, elevated' }
    };

    const enrichedCategories = categories.map(cat => ({
      ...cat,
      ...categoryLabels[cat.category]
    }));

    res.json({
      success: true,
      data: enrichedCategories
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Calculate price with customizations
// @route   POST /api/products/:id/calculate-price
// @access  Public
router.post('/:id/calculate-price', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const { material, fabric, size, variant, frame } = req.body;
    
    let basePrice = product.price;
    let modifiers = 0;
    const breakdown = [];

    // Calculate material modifier
    if (material && product.priceModifiers.materialModifiers) {
      const materialModifier = product.priceModifiers.materialModifiers.get(material) || 0;
      modifiers += materialModifier;
      if (materialModifier !== 0) {
        breakdown.push({ type: 'material', value: material, amount: materialModifier });
      }
    }

    // Calculate fabric modifier
    if (fabric && product.priceModifiers.fabricModifiers) {
      const fabricModifier = product.priceModifiers.fabricModifiers.get(fabric) || 0;
      modifiers += fabricModifier;
      if (fabricModifier !== 0) {
        breakdown.push({ type: 'fabric', value: fabric, amount: fabricModifier });
      }
    }

    // Calculate size modifier
    if (size && product.priceModifiers.sizeModifiers) {
      const sizeModifier = product.priceModifiers.sizeModifiers.get(size) || 0;
      modifiers += sizeModifier;
      if (sizeModifier !== 0) {
        breakdown.push({ type: 'size', value: size, amount: sizeModifier });
      }
    }

    // Calculate variant modifier
    if (variant && product.priceModifiers.variantModifiers) {
      const variantModifier = product.priceModifiers.variantModifiers.get(variant) || 0;
      modifiers += variantModifier;
      if (variantModifier !== 0) {
        breakdown.push({ type: 'variant', value: variant, amount: variantModifier });
      }
    }

    // Calculate frame modifier
    if (frame && product.priceModifiers.frameModifiers) {
      const frameModifier = product.priceModifiers.frameModifiers.get(frame) || 0;
      modifiers += frameModifier;
      if (frameModifier !== 0) {
        breakdown.push({ type: 'frame', value: frame, amount: frameModifier });
      }
    }

    const finalPrice = basePrice + modifiers;

    res.json({
      success: true,
      data: {
        basePrice,
        modifiers,
        finalPrice,
        breakdown,
        currency: 'NGN'
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;