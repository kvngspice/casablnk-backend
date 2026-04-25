const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

const products = [
  {
    name: "Athena Sofa Chair",
    category: "chairs",
    price: 536500,
    description: "The Athena is designed for modern living — a beautifully sculpted 3-seater sofa that effortlessly transforms into a queen-size bed. Perfect for compact spaces without compromising on style or comfort.",
    shortDesc: "A multifunctional 3 seater Sofa that transforms to a queen size bed",
    mainImage: "/products/athena2.png",
    gallery: ["/products/athena2.png", "/products/athena3.png", "/products/athena4.png"],
    variantImages: {
      "Blue": "/products/athena2.png",
      "Grey": "/products/athena3.png",
      "Mustard": "/products/athena4.png"
    },
    frameOptions: ["Matte black Metal", "Gloss Black Metal"],
    fabrics: ["Linen", "Velvet", "Leather", "Bouclé"],
    colors: {
      "Linen": ["#3186e2", "#434343", "#e2ad2f", "#8B8178"],
      "Velvet": ["#2C2C2C", "#3D3530", "#4A4540", "#1A1A2E"],
      "Leather": ["#2C2C2C", "#5C4033", "#8B7355", "#D4C5B2"]
    },
    details: {
      description: "The Athena is designed for modern living — a beautifully sculpted 3-seater sofa that effortlessly transforms into a queen-size bed. Perfect for compact spaces without compromising on style or comfort.",
      dimensions: "Sofa: 220cm × 90cm × 85cm · Bed: 220cm × 150cm × 45cm",
      weight: "68 kg",
      leadTime: "4–6 weeks",
      care: "Professional upholstery cleaning recommended. Spot clean with mild detergent. Avoid direct sunlight to preserve fabric colour."
    },
    priceModifiers: {
      fabricModifiers: {
        "Linen": 0,
        "Velvet": 25000,
        "Leather": 50000,
        "Bouclé": 15000
      }
    },
    featured: true
  },
  {
    name: "Water Spring",
    category: "tables",
    price: 210000,
    description: "Hewn from a single block of natural stone, the PLINTH is a dining table that commands presence. Each slab is unique — veining patterns will vary, making every piece one of a kind.",
    shortDesc: "This is Glass Center table inspired by the formation of a water podule with spring metal spring base.",
    mainImage: "/products/waterspring.png",
    gallery: ["/products/waterspring.png"],
    materials: ["Tempered Glass top"],
    details: {
      description: "Hewn from a single block of natural stone, the PLINTH is a dining table that commands presence. Each slab is unique — veining patterns will vary, making every piece one of a kind.",
      dimensions: "200cm × 100cm × 75cm",
      weight: "120 kg",
      leadTime: "6–8 weeks",
      care: "Seal annually with stone-specific sealant. Wipe spills immediately. Use coasters and trivets."
    },
    featured: true
  },
  {
    name: "Magna Work Table",
    category: "tables",
    price: 85900,
    description: "Three floating planes of solid hardwood, stacked with deliberate asymmetry. The STRATUM plays with perspective — it looks different from every angle.",
    shortDesc: "A multifunctional work table with in built socket and a cable management rack",
    mainImage: "/products/magnaworktable.png",
    gallery: ["/products/magnaworktable.png"],
    materials: ["Oak", "Walnut", "Ash"],
    details: {
      description: "Three floating planes of solid hardwood, stacked with deliberate asymmetry. The STRATUM plays with perspective — it looks different from every angle.",
      dimensions: "45cm × 45cm × 55cm",
      weight: "8.6 kg",
      leadTime: "3–4 weeks",
      care: "Dust regularly. Apply wood oil every 6 months. Avoid prolonged moisture exposure."
    },
    priceModifiers: {
      materialModifiers: {
        "Oak": 0,
        "Walnut": 15000,
        "Ash": 10000
      }
    }
  },
  {
    name: "Magna 2 toned center Table",
    category: "tables",
    price: 138900,
    description: "The Magna center table a a simple and functional center made of a metal frame and 2 toned wood. It a wooden top and 2 draws for storage underneath.",
    shortDesc: "Cantilevered desk in blackened steel & glass",
    mainImage: "/products/Magnacenter.png",
    gallery: ["/products/Magnacenter.png"],
    materials: ["Wood & metal"],
    details: {
      description: "The Magna center table a a simple and functional center made of a metal frame and 2 toned wood. It a wooden top and 2 draws for storage underneath.",
      dimensions: "width; 26inches × lenght; 43inches × height ; 18inches",
      weight: "42 kg",
      leadTime: "5-7 working days",
      care: "Steel: wipe with dry cloth. Avoid abrasive cleaners."
    }
  },
  {
    name: "ATLAS",
    category: "lamps",
    price: 57000,
    description: "A perfect circle of light. The HALO pendant casts a warm, even glow through its LED-integrated ring, creating atmosphere without visual clutter.",
    shortDesc: "Ring pendant light, brushed brass finish",
    mainImage: "/products/halo.jpg",
    gallery: ["/products/halo.jpg", "/products/halo2.jpg"],
    materials: ["Matte Black", "Gloss Black"],
    sizes: ["S · 20 inches"],
    details: {
      description: "A perfect circle of light. The HALO pendant casts a warm, even glow through its LED-integrated ring, creating atmosphere without visual clutter.",
      dimensions: "S: Ø30cm · M: Ø50cm · L: Ø80cm · Cable: 150cm adjustable",
      weight: "S: 1.8 kg · M: 3.2 kg · L: 5.4 kg",
      leadTime: "2–3 weeks",
      care: "Dust with a microfibre cloth. Do not use chemical cleaners on metal finish."
    },
    priceModifiers: {
      sizeModifiers: {
        "S · 30cm": 0,
        "M · 50cm": 15000,
        "L · 80cm": 30000
      }
    },
    featured: true
  },
  {
    name: "Magna 2 Tone TV Console",
    category: "tvconsole",
    price: 168900,
    description: "The magna 2 toned Tv console is a highly functional TV console with a built in socket and storage cabinet. The magna console was intentinally built to Beautify your Tv area and make it clutter free. It has a sturdy metal base",
    shortDesc: "Low platform bed, solid walnut frame",
    mainImage: "/products/magnaTV.png",
    gallery: ["/products/magnaTV.png", "/products/magnatv3.png", "/products/magnatv2.jpg"],
    materials: ["Wood & metal"],
    sizes: ["MAXI", "Mini"],
    details: {
      description: "The magna 2 toned Tv console is a highly functional TV console with a built in socket and storage cabinet.",
      dimensions: "MAXI : Length; 179cm depth; 42cm height; 55cm · Mini: Length; 122cm depth; 42cm height; 55cm",
      weight: "Maxi: 55 kg · Mini: 40 kg",
      leadTime: "5-7 working days",
      care: "Wood: dust and oil seasonally. Upholstery: professional cleaning recommended annually."
    },
    priceModifiers: {
      sizeModifiers: {
        "MAXI": 0,
        "Mini": -20000
      }
    }
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const createdProducts = await Product.insertMany(products);
    console.log(`Seeded ${createdProducts.length} products`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();