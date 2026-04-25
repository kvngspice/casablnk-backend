const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
// Near the top of server.js, update CORS:
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3003',
    'https://casablnk.com',
    'https://www.casablnk.com',
    'https://casablnk.vercel.app',
    'https://casablnk-frontend.vercel.app',
    'https://casablnk-admin.vercel.app', 
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// JSON file paths
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper functions for file operations
const readJSON = (filePath, defaultValue = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
};

const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Generate unique ID
const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Initialize with default products if file doesn't exist
const initializeProducts = () => {
  const defaultProducts = [
    {
      _id: "ch1",
      name: "Athena Sofa Chair",
      category: "chairs",
      price: 536500,
      shortDesc: "A multifunctional 3 seater Sofa that transforms to a queen size bed",
      description: "The Athena is designed for modern living — a beautifully sculpted 3-seater sofa that effortlessly transforms into a queen-size bed.",
      mainImage: "/products/athena2.png",
      gallery: ["/products/athena2.png", "/products/athena3.png", "/products/athena4.png"],
      variantImages: { "Blue": "/products/athena2.png", "Grey": "/products/athena3.png", "Mustard": "/products/athena4.png" },
      frameOptions: ["Matte black Metal", "Gloss Black Metal"],
      fabrics: ["Linen", "Velvet", "Leather", "Bouclé"],
      colors: { 
        "Linen": ["#3186e2","#434343","#e2ad2f","#8B8178"], 
        "Velvet": ["#2C2C2C","#3D3530","#4A4540","#1A1A2E"], 
        "Leather": ["#2C2C2C","#5C4033","#8B7355","#D4C5B2"] 
      },
      details: {
        description: "The Athena is designed for modern living.",
        dimensions: "Sofa: 220cm × 90cm × 85cm",
        weight: "68 kg",
        leadTime: "4–6 weeks",
        care: "Professional upholstery cleaning recommended."
      },
      priceModifiers: {
        fabricModifiers: { "Linen": 0, "Velvet": 25000, "Leather": 50000 }
      },
      inStock: true,
      featured: true
    },
    {
      _id: "tb1",
      name: "Water Spring",
      category: "tables",
      price: 210000,
      shortDesc: "Glass Center table inspired by water formation",
      description: "This is Glass Center table inspired by the formation of a water podule.",
      mainImage: "/products/waterspring.png",
      gallery: ["/products/waterspring.png"],
      materials: ["Tempered Glass top"],
      details: {
        description: "Hewn from a single block of natural stone.",
        dimensions: "200cm × 100cm × 75cm",
        weight: "120 kg",
        leadTime: "6–8 weeks",
        care: "Seal annually with stone-specific sealant."
      },
      priceModifiers: {},
      inStock: true,
      featured: true
    },
    {
      _id: "tb2",
      name: "Magna Work Table",
      category: "tables",
      price: 85900,
      shortDesc: "A multifunctional work table",
      description: "A multifunctional work table with built in socket and cable management.",
      mainImage: "/products/magnaworktable.png",
      gallery: ["/products/magnaworktable.png"],
      materials: ["Oak", "Walnut", "Ash"],
      details: {
        description: "Three floating planes of solid hardwood.",
        dimensions: "45cm × 45cm × 55cm",
        weight: "8.6 kg",
        leadTime: "3–4 weeks",
        care: "Dust regularly. Apply wood oil every 6 months."
      },
      priceModifiers: {
        materialModifiers: { "Oak": 0, "Walnut": 15000, "Ash": 10000 }
      },
      inStock: true
    },
    {
      _id: "tb3",
      name: "Magna 2 toned center Table",
      category: "tables",
      price: 138900,
      shortDesc: "Cantilevered desk in blackened steel & glass",
      description: "Simple and functional center table made of metal frame and 2 toned wood.",
      mainImage: "/products/Magnacenter.png",
      gallery: ["/products/Magnacenter.png"],
      materials: ["Wood & metal"],
      details: {
        description: "Simple and functional center table with 2 drawers.",
        dimensions: "width: 26inches × length: 43inches × height: 18inches",
        weight: "42 kg",
        leadTime: "5-7 working days",
        care: "Steel: wipe with dry cloth. Avoid abrasive cleaners."
      },
      priceModifiers: {},
      inStock: true
    },
    {
      _id: "lm1",
      name: "ATLAS",
      category: "lamps",
      price: 57000,
      shortDesc: "Ring pendant light, brushed brass finish",
      description: "A perfect circle of light. The HALO pendant casts a warm, even glow.",
      mainImage: "/products/halo.jpg",
      gallery: ["/products/halo.jpg", "/products/halo2.jpg"],
      materials: ["Matte Black", "Gloss Black"],
      sizes: ["S · 30cm", "M · 50cm", "L · 80cm"],
      details: {
        description: "A perfect circle of light.",
        dimensions: "S: Ø30cm · M: Ø50cm · L: Ø80cm",
        weight: "S: 1.8 kg · M: 3.2 kg · L: 5.4 kg",
        leadTime: "2–3 weeks",
        care: "Dust with a microfibre cloth."
      },
      priceModifiers: {
        sizeModifiers: { "S · 30cm": 0, "M · 50cm": 15000, "L · 80cm": 30000 }
      },
      inStock: true,
      featured: true
    },
    {
      _id: "tv1",
      name: "Magna 2 Tone TV Console",
      category: "tvconsole",
      price: 168900,
      shortDesc: "Low platform TV console, solid walnut frame",
      description: "Highly functional TV console with built in socket and storage cabinet.",
      mainImage: "/products/magnaTV.png",
      gallery: ["/products/magnaTV.png", "/products/magnatv3.png", "/products/magnatv2.jpg"],
      materials: ["Wood & metal"],
      sizes: ["MAXI", "Mini"],
      details: {
        description: "Highly functional TV console with built in socket.",
        dimensions: "MAXI: Length 179cm depth 42cm height 55cm · Mini: Length 122cm",
        weight: "Maxi: 55 kg · Mini: 40 kg",
        leadTime: "5-7 working days",
        care: "Wood: dust and oil seasonally."
      },
      priceModifiers: {
        sizeModifiers: { "MAXI": 0, "Mini": -20000 }
      },
      inStock: true
    }
  ];

  if (!fs.existsSync(PRODUCTS_FILE)) {
    writeJSON(PRODUCTS_FILE, defaultProducts);
    console.log('✅ Initialized products data');
  }
};

// Initialize data
initializeProducts();

// ============= ROUTES =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CASABLNK API is running' });
});

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const { category, featured, limit = 50 } = req.query;
    let products = readJSON(PRODUCTS_FILE, []);
    
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    
    if (featured === 'true') {
      products = products.filter(p => p.featured === true);
    }
    
    products = products.slice(0, Number(limit));
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const products = readJSON(PRODUCTS_FILE, []);
    const product = products.find(p => p._id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get products by category
app.get('/api/products/category/:category', (req, res) => {
  try {
    const products = readJSON(PRODUCTS_FILE, []);
    const categoryProducts = products.filter(p => p.category === req.params.category);
    
    res.json({
      success: true,
      count: categoryProducts.length,
      data: categoryProducts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ============= ADMIN PRODUCT MANAGEMENT ROUTES =============

// Create new product
app.post('/api/admin/products', (req, res) => {
  try {
    const products = readJSON(PRODUCTS_FILE, []);
    
    const newProduct = {
      _id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    writeJSON(PRODUCTS_FILE, products);
    
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product
app.put('/api/admin/products/:id', (req, res) => {
  try {
    const products = readJSON(PRODUCTS_FILE, []);
    const index = products.findIndex(p => p._id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    products[index] = {
      ...products[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    writeJSON(PRODUCTS_FILE, products);
    
    res.json({ success: true, data: products[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product
app.delete('/api/admin/products/:id', (req, res) => {
  try {
    const products = readJSON(PRODUCTS_FILE, []);
    const filtered = products.filter(p => p._id !== req.params.id);
    
    if (filtered.length === products.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    writeJSON(PRODUCTS_FILE, filtered);
    
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get categories list
app.get('/api/products/categories/list', (req, res) => {
  try {
    const products = readJSON(PRODUCTS_FILE, []);
    const categories = {};
    
    products.forEach(p => {
      if (!categories[p.category]) {
        categories[p.category] = { count: 0, minPrice: Infinity, maxPrice: -Infinity };
      }
      categories[p.category].count++;
      categories[p.category].minPrice = Math.min(categories[p.category].minPrice, p.price);
      categories[p.category].maxPrice = Math.max(categories[p.category].maxPrice, p.price);
    });
    
    const categoryLabels = {
      chairs: { label: 'Chairs', tagline: 'Sculpted for stillness' },
      tables: { label: 'Tables', tagline: 'Grounded forms' },
      lamps: { label: 'Lamps', tagline: 'Light, refined' },
      tvconsole: { label: 'TV Console', tagline: 'Entertainment, elevated' }
    };
    
    const result = Object.entries(categories).map(([category, data]) => ({
      category,
      ...categoryLabels[category],
      count: data.count,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice
    }));
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Calculate price with customizations
app.post('/api/products/:id/calculate-price', (req, res) => {
  try {
    const products = readJSON(PRODUCTS_FILE, []);
    const product = products.find(p => p._id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const { material, fabric, size, variant } = req.body;
    let basePrice = product.price;
    let modifiers = 0;
    const priceModifiers = product.priceModifiers || {};
    
    if (material && priceModifiers.materialModifiers) {
      modifiers += priceModifiers.materialModifiers[material] || 0;
    }
    if (fabric && priceModifiers.fabricModifiers) {
      modifiers += priceModifiers.fabricModifiers[fabric] || 0;
    }
    if (size && priceModifiers.sizeModifiers) {
      modifiers += priceModifiers.sizeModifiers[size] || 0;
    }
    if (variant && priceModifiers.variantModifiers) {
      modifiers += priceModifiers.variantModifiers[variant] || 0;
    }
    
    res.json({
      success: true,
      data: {
        basePrice,
        modifiers,
        finalPrice: basePrice + modifiers,
        currency: 'NGN'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create order
app.post('/api/orders', (req, res) => {
  try {
    const { customer, items, notes } = req.body;
    
    if (!customer || !customer.name || !customer.email || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const orders = readJSON(ORDERS_FILE, []);
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const date = new Date();
    const orderNumber = `CB${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${(orders.length + 1).toString().padStart(3, '0')}`;
    
    const order = {
      _id: generateId(),
      orderNumber,
      customer,
      items,
      subtotal,
      deliveryFee: 0,
      total: subtotal,
      notes,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      estimatedDelivery: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    orders.push(order);
    writeJSON(ORDERS_FILE, orders);
    
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Get all orders
app.get('/api/orders', (req, res) => {
  try {
    const orders = readJSON(ORDERS_FILE, []);
    res.json({ 
      success: true, 
      count: orders.length,
      data: orders 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get order by ID or order number
app.get('/api/orders/:identifier', (req, res) => {
  // ... existing code ...
});

// Get order by ID or order number
app.get('/api/orders/:identifier', (req, res) => {
  try {
    const orders = readJSON(ORDERS_FILE, []);
    const order = orders.find(o => 
      o._id === req.params.identifier || o.orderNumber === req.params.identifier
    );
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Get payment config
app.get('/api/payment/config', (req, res) => {
  res.json({
    success: true,
    data: {
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_demo',
      currency: 'NGN'
    }
  });
});

// Initialize payment
app.post('/api/payment/initialize', async (req, res) => {
  try {
    const { orderId, email, amount, callback_url } = req.body;
    
    const reference = `CB-${Date.now()}`;
    
    res.json({
      success: true,
      data: {
        authorization_url: callback_url || 'http://localhost:3000/payment/callback',
        reference,
        access_code: 'demo_access'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify payment
app.get('/api/payment/verify/:reference', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'success',
      message: 'Payment verified'
    }
  });
});
// Upload product image
app.post('/api/admin/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/products/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload multiple images for gallery
app.post('/api/admin/upload-multiple', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    
    const urls = req.files.map(file => `/uploads/products/${file.filename}`);
    
    res.json({
      success: true,
      data: urls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start server
// Start server with port fallback
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`📁 Data stored in: ${DATA_DIR}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

const PORT = process.env.PORT || 5000;
startServer(PORT);