const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Product = require('./models/Product');
const Order = require('./models/Order');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');
const RequestModel = require('./models/Request');
const User = require('./models/User');

const DB_FILE = path.join(__dirname, 'data.json');

const INITIAL_PRODUCTS = [
  // 3D PRINTING VERTICAL
  {
    id: 'prod-3d-1',
    slug: 'ender-3-v3-se-3d-printer',
    name: 'Ender 3 V3 SE High-Speed 3D Printer',
    vertical: '3d-printing',
    category: 'Printers',
    brand: 'Creality',
    price: 219.00,
    originalPrice: 249.00,
    stock: 15,
    rating: 4.8,
    reviewCount: 34,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'High-speed auto-leveling FDM printer with dual Z-axis, CR Touch leveling, and Sprite direct extruder.',
    attributes: { speed: '250mm/s', buildVolume: '220x220x250mm', extruder: 'Sprite Direct Drive' },
    isFeatured: true
  },
  {
    id: 'prod-3d-2',
    slug: 'bambu-lab-p1s-combo-3d-printer',
    name: 'Bambu Lab P1S Combo with AMS 3D Printer',
    vertical: '3d-printing',
    category: 'Printers',
    brand: 'Bambu Lab',
    price: 949.00,
    originalPrice: 999.00,
    stock: 8,
    rating: 4.95,
    reviewCount: 52,
    image: 'https://images.unsplash.com/photo-1612815150330-80e90c888d22?auto=format&fit=crop&w=800&q=80',
    description: 'Enclosed multi-color 3D printer capable of 500mm/s acceleration with automatic filament switching system.',
    attributes: { speed: '500mm/s', buildVolume: '256x256x256mm', colors: 'Up to 16 Colors' },
    isFeatured: true
  },
  {
    id: 'prod-3d-3',
    slug: 'voron-2-4-r2-corexy-kit',
    name: 'Voron 2.4 R2 CoreXY DIY 3D Printer Kit',
    vertical: '3d-printing',
    category: 'Printers',
    brand: 'Voron',
    price: 899.00,
    originalPrice: 950.00,
    stock: 4,
    rating: 4.9,
    reviewCount: 18,
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
    description: 'Enclosed CoreXY high-performance printer with flying gantry design for ultimate speed and precision.',
    attributes: { speed: '350mm/s', buildVolume: '350x350x350mm', firmware: 'Klipper' },
    isFeatured: false
  },
  {
    id: 'prod-3d-4',
    slug: 'premium-pla-plus-filament-black-1kg',
    name: '3DOM Pro PLA+ Tough Filament 1.75mm (Jet Black 1kg)',
    vertical: '3d-printing',
    category: 'Filaments',
    brand: '3DOM Tech',
    price: 22.99,
    originalPrice: 27.99,
    stock: 45,
    rating: 4.85,
    reviewCount: 120,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-smooth, low-warp PLA+ engineered for high-speed printing with superior layer adhesion.',
    attributes: { material: 'PLA', diameter: '1.75mm', weight: '1kg', temp: '190-220°C' },
    isFeatured: true
  },
  {
    id: 'prod-3d-5',
    slug: 'petg-tough-filament-fire-red-1kg',
    name: '3DOM PETG High Impact Filament (Fire Red 1kg)',
    vertical: '3d-printing',
    category: 'Filaments',
    brand: '3DOM Tech',
    price: 24.50,
    originalPrice: 29.00,
    stock: 30,
    rating: 4.75,
    reviewCount: 64,
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    description: 'Durable, weather-resistant PETG filament combining the ease of PLA with the strength of ABS.',
    attributes: { material: 'PETG', diameter: '1.75mm', weight: '1kg', temp: '230-250°C' },
    isFeatured: false
  },
  {
    id: 'prod-3d-6',
    slug: 'high-speed-abs-plus-white-1kg',
    name: 'eSun ABS+ Low Warp Filament (Pure White 1kg)',
    vertical: '3d-printing',
    category: 'Filaments',
    brand: 'eSun',
    price: 26.00,
    originalPrice: 30.00,
    stock: 20,
    rating: 4.65,
    reviewCount: 41,
    image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
    description: 'Formulated ABS+ with minimal warping and chemical resistance for functional engineering prototypes.',
    attributes: { material: 'ABS', diameter: '1.75mm', weight: '1kg', temp: '240-260°C' },
    isFeatured: false
  },
  {
    id: 'prod-3d-7',
    slug: 'nylon-carbon-fiber-filament-1kg',
    name: 'Polymaker PolyMax Nylon Carbon Fiber (CF) Filament',
    vertical: '3d-printing',
    category: 'Filaments',
    brand: 'Polymaker',
    price: 59.99,
    originalPrice: 69.99,
    stock: 12,
    rating: 4.9,
    reviewCount: 29,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    description: 'Industrial grade carbon fiber reinforced nylon with high thermal tolerance and tensile strength.',
    attributes: { material: 'Nylon', diameter: '1.75mm', weight: '500g', temp: '280-300°C' },
    isFeatured: true
  },
  {
    id: 'prod-3d-8',
    slug: 'asa-uv-resistant-filament-1kg',
    name: '3DOM Outdoor ASA UV-Resistant Filament (Dark Gray)',
    vertical: '3d-printing',
    category: 'Filaments',
    brand: '3DOM Tech',
    price: 29.90,
    originalPrice: 34.00,
    stock: 18,
    rating: 4.8,
    reviewCount: 22,
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    description: 'Weatherproof & UV-stable ASA filament designed for outdoor automotive & structural components.',
    attributes: { material: 'ASA', diameter: '1.75mm', weight: '1kg', temp: '240-260°C' },
    isFeatured: false
  },

  // FASHION VERTICAL
  {
    id: 'prod-fashion-1',
    slug: 'oversized-korean-streetwear-hoodie',
    name: 'K-Street Oversized Heavyweight Boxy Hoodie (Charcoal)',
    vertical: 'fashion',
    category: 'Hoodies & Jackets',
    brand: 'AderStudio',
    price: 68.00,
    originalPrice: 85.00,
    stock: 25,
    rating: 4.9,
    reviewCount: 78,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    description: '450GSM French terry cotton hoodie featuring dropped shoulders and high-density minimal front puff print.',
    attributes: { fabric: '100% Cotton', weight: '450 GSM', fit: 'Oversized Boxy Fit' },
    isFeatured: true
  },
  {
    id: 'prod-fashion-2',
    slug: 'wide-leg-cargo-parachute-pants',
    name: 'Seoul Utility Parachute Cargo Pants (Sage Green)',
    vertical: 'fashion',
    category: 'Pants & Cargos',
    brand: 'MinimalistLab',
    price: 54.00,
    originalPrice: 65.00,
    stock: 19,
    rating: 4.8,
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    description: 'Adjustable drawstring cuffs with deep tactical pockets. Crafted from water-repellent lightweight nylon blend.',
    attributes: { fit: 'Relaxed Wide Leg', closure: 'Elastic Drawstring', waist: 'Mid-Rise' },
    isFeatured: true
  },
  {
    id: 'prod-fashion-3',
    slug: 'vintage-acid-wash-graphic-tee',
    name: 'Neo-Tokyo Cyberpunk Graphic Heavy Tee (Acid Black)',
    vertical: 'fashion',
    category: 'T-Shirts',
    brand: 'AderStudio',
    price: 34.50,
    originalPrice: 42.00,
    stock: 35,
    rating: 4.85,
    reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    description: 'Pre-shrunk 260GSM combed cotton shirt with hand-dyed vintage acid wash finish and screen printed graphics.',
    attributes: { fabric: '260 GSM Cotton', wash: 'Acid Wash', sleeve: 'Short Sleeve Drop' },
    isFeatured: false
  },

  // BEAUTY VERTICAL
  {
    id: 'prod-beauty-1',
    slug: 'luxurious-ambrette-rose-eau-de-parfum',
    name: 'Maison 3DOM Ambrette Rose Eau de Parfum (100ml)',
    vertical: 'beauty',
    category: 'Fragrances',
    brand: 'Maison 3DOM',
    price: 110.00,
    originalPrice: 135.00,
    stock: 15,
    rating: 4.95,
    reviewCount: 68,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    description: 'An alluring blend of Bulgarian rose, white ambrette seeds, velvety suede, and sparkling bergamot.',
    attributes: { notes: 'Rose, Ambrette, Suede, Bergamot', size: '100ml / 3.4 fl oz', concentration: 'Eau de Parfum' },
    isFeatured: true
  },
  {
    id: 'prod-beauty-2',
    slug: 'k-beauty-glass-skin-hyaluronic-serum',
    name: 'Snail Mucin & Hyaluronic Acid Glass Skin Serum (50ml)',
    vertical: 'beauty',
    category: 'Skincare',
    brand: 'SeoulGlow',
    price: 28.00,
    originalPrice: 34.00,
    stock: 40,
    rating: 4.88,
    reviewCount: 140,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    description: 'Intense hydrating serum formulation enriched with 96% snail secretion filtrate and quadruple HA complex.',
    attributes: { skinType: 'All Skin Types', volume: '50ml', benefit: 'Deep Hydration & Glass Glow' },
    isFeatured: true
  }
];

const INITIAL_COUPONS = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 0,
    usageLimit: 1000,
    usedCount: 42,
    isActive: true,
    expiresAt: '2027-12-31'
  },
  {
    code: '3DOM20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 50,
    usageLimit: 500,
    usedCount: 18,
    isActive: true,
    expiresAt: '2027-12-31'
  },
  {
    code: 'FLAT15',
    discountType: 'flat',
    discountValue: 15,
    minOrderValue: 60,
    usageLimit: 200,
    usedCount: 9,
    isActive: true,
    expiresAt: '2027-12-31'
  }
];

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    productId: 'prod-3d-1',
    customerName: 'Alex Mercer',
    rating: 5,
    comment: 'The Ender 3 V3 SE printed right out of the box with flawless auto-bed leveling!',
    status: 'approved',
    createdAt: '2026-08-20T10:30:00.000Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-3d-4',
    customerName: 'Sarah K.',
    rating: 5,
    comment: 'Best PLA filament I have used. Zero stringing at 220°C on my Bambu P1S.',
    status: 'approved',
    createdAt: '2026-08-22T14:15:00.000Z'
  }
];

const INITIAL_REQUESTS = [
  {
    id: 'req-101',
    customerEmail: 'david.b@example.com',
    whatsappNumber: '+1 555 019 2831',
    requestedItem: 'Voron Stealthburner Toolhead Kit with Canbus Board',
    requiredDate: '2026-09-10',
    deliveryAddress: '742 Evergreen Terrace, Springfield',
    status: 'pending',
    createdAt: '2026-08-27T11:20:00.000Z'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-98421',
    customer: {
      name: 'Michael Scott',
      email: 'm.scott@example.com',
      phone: '+1 555 382 9102',
      address: '1725 Slough Avenue, Scranton, PA'
    },
    items: [
      {
        id: 'prod-3d-4',
        name: '3DOM Pro PLA+ Tough Filament 1.75mm (Jet Black 1kg)',
        price: 22.99,
        quantity: 2,
        vertical: '3d-printing'
      }
    ],
    totalAmount: 45.98,
    discountAmount: 0,
    finalAmount: 45.98,
    paymentMethod: 'Stripe Test Card',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    carrier: 'Bluedart',
    trackingNumber: 'BD749201938IN',
    createdAt: '2026-08-26T16:00:00.000Z'
  }
];

class DatabaseManager {
  constructor() {
    this.isMongoConnected = false;
    this.localData = {
      products: [...INITIAL_PRODUCTS],
      coupons: [...INITIAL_COUPONS],
      reviews: [...INITIAL_REVIEWS],
      requests: [...INITIAL_REQUESTS],
      orders: [...INITIAL_ORDERS]
    };
    this.loadLocal();
  }

  loadLocal() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.localData = JSON.parse(fileContent);
      } else {
        this.saveLocal();
      }
    } catch (e) {
      console.error('Error reading local data.json, using defaults', e.message);
    }
  }

  saveLocal() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.localData, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving local data.json', e.message);
    }
  }

  async connectMongo(uri) {
    if (!uri || uri.includes('your_mongodb_connection_string') || uri.includes('<username>')) {
      console.log('ℹ️  No valid MONGODB_URI provided in backend/.env. Using local JSON store.');
      return false;
    }
    if (uri.includes('<') || uri.includes('>')) {
      console.warn('⚠️ Warning: MONGODB_URI in backend/.env contains "<" or ">" brackets! Please remove "<" and ">" around your password.');
    }
    try {
      try {
        const dns = require('dns');
        dns.setServers(['8.8.8.8', '8.8.4.4']);
      } catch (dnsErr) {}
      await mongoose.connect(uri);
      this.isMongoConnected = true;
      console.log('✅ Connected to MongoDB Atlas/Database successfully!');
      await this.seedMongoIfEmpty();
      return true;
    } catch (err) {
      console.error('⚠️ MongoDB connection failed. Falling back to local JSON store:', err.message);
      this.isMongoConnected = false;
      return false;
    }
  }

  async seedMongoIfEmpty() {
    try {
      const prodCount = await Product.countDocuments();
      if (prodCount === 0) {
        console.log('🌱 Seeding MongoDB with initial products...');
        await Product.insertMany(INITIAL_PRODUCTS);
      } else {
        // Automatically sync and update image fixes for products in MongoDB
        for (const item of INITIAL_PRODUCTS) {
          await Product.updateOne({ id: item.id }, { $set: { image: item.image } });
        }
      }
      // Also update local JSON store product images
      for (const item of INITIAL_PRODUCTS) {
        const p = (this.localData.products || []).find((x) => x.id === item.id);
        if (p) p.image = item.image;
      }
      this.saveLocal();

      const couponCount = await Coupon.countDocuments();
      if (couponCount === 0) {
        console.log('🌱 Seeding MongoDB with initial coupons...');
        await Coupon.insertMany(INITIAL_COUPONS);
      }
      const revCount = await Review.countDocuments();
      if (revCount === 0) {
        await Review.insertMany(INITIAL_REVIEWS);
      }
      const reqCount = await RequestModel.countDocuments();
      if (reqCount === 0) {
        await RequestModel.insertMany(INITIAL_REQUESTS);
      }
      const orderCount = await Order.countDocuments();
      if (orderCount === 0) {
        await Order.insertMany(INITIAL_ORDERS);
      }
    } catch (err) {
      console.error('Error during MongoDB seeding:', err.message);
    }
  }

  // --- PRODUCTS ---
  async getProducts() {
    if (this.isMongoConnected) {
      const prods = await Product.find().lean();
      return prods;
    }
    return this.localData.products;
  }

  async getProductByIdentifier(identifier) {
    if (this.isMongoConnected) {
      return await Product.findOne({ $or: [{ id: identifier }, { slug: identifier }] }).lean();
    }
    return this.localData.products.find(p => p.id === identifier || p.slug === identifier);
  }

  async createProduct(productData) {
    if (this.isMongoConnected) {
      const newProd = new Product(productData);
      await newProd.save();
      return newProd.toObject();
    }
    this.localData.products.unshift(productData);
    this.saveLocal();
    return productData;
  }

  async updateProduct(id, updateData) {
    if (this.isMongoConnected) {
      return await Product.findOneAndUpdate({ id }, { $set: updateData }, { new: true }).lean();
    }
    const index = this.localData.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.localData.products[index] = { ...this.localData.products[index], ...updateData };
    this.saveLocal();
    return this.localData.products[index];
  }

  async deleteProduct(id) {
    if (this.isMongoConnected) {
      await Product.deleteOne({ id });
      return true;
    }
    this.localData.products = this.localData.products.filter(p => p.id !== id);
    this.saveLocal();
    return true;
  }

  // --- COUPONS ---
  async getCoupons() {
    if (this.isMongoConnected) {
      return await Coupon.find().lean();
    }
    return this.localData.coupons;
  }

  async getCouponByCode(code) {
    if (this.isMongoConnected) {
      return await Coupon.findOne({ code: code.toUpperCase() }).lean();
    }
    return this.localData.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  }

  async createCoupon(couponData) {
    if (this.isMongoConnected) {
      const c = new Coupon(couponData);
      await c.save();
      return c.toObject();
    }
    this.localData.coupons.unshift(couponData);
    this.saveLocal();
    return couponData;
  }

  async updateCoupon(code, updateData) {
    if (this.isMongoConnected) {
      return await Coupon.findOneAndUpdate({ code: code.toUpperCase() }, { $set: updateData }, { new: true }).lean();
    }
    const index = this.localData.coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    if (index === -1) return null;
    this.localData.coupons[index] = { ...this.localData.coupons[index], ...updateData };
    this.saveLocal();
    return this.localData.coupons[index];
  }

  // --- REVIEWS ---
  async getReviews(productId) {
    if (this.isMongoConnected) {
      const query = productId ? { productId, status: 'approved' } : {};
      return await Review.find(query).sort({ createdAt: -1 }).lean();
    }
    if (productId) {
      return this.localData.reviews.filter(r => r.productId === productId && r.status === 'approved');
    }
    return this.localData.reviews;
  }

  async createReview(reviewData) {
    if (this.isMongoConnected) {
      const r = new Review(reviewData);
      await r.save();
      return r.toObject();
    }
    this.localData.reviews.unshift(reviewData);
    this.saveLocal();
    return reviewData;
  }

  async updateReview(id, status) {
    if (this.isMongoConnected) {
      return await Review.findOneAndUpdate({ id }, { $set: { status } }, { new: true }).lean();
    }
    const review = this.localData.reviews.find(r => r.id === id);
    if (!review) return null;
    review.status = status;
    this.saveLocal();
    return review;
  }

  async deleteReview(id) {
    if (this.isMongoConnected) {
      await Review.deleteOne({ id });
      return true;
    }
    this.localData.reviews = this.localData.reviews.filter(r => r.id !== id);
    this.saveLocal();
    return true;
  }

  // --- SOURCING REQUESTS ---
  async getRequests() {
    if (this.isMongoConnected) {
      return await RequestModel.find().sort({ createdAt: -1 }).lean();
    }
    return this.localData.requests;
  }

  async createRequest(reqData) {
    if (this.isMongoConnected) {
      const req = new RequestModel(reqData);
      await req.save();
      return req.toObject();
    }
    this.localData.requests.unshift(reqData);
    this.saveLocal();
    return reqData;
  }

  async updateRequest(id, status) {
    if (this.isMongoConnected) {
      return await RequestModel.findOneAndUpdate({ id }, { $set: { status } }, { new: true }).lean();
    }
    const reqItem = this.localData.requests.find(r => r.id === id);
    if (!reqItem) return null;
    reqItem.status = status;
    this.saveLocal();
    return reqItem;
  }

  // --- ORDERS ---
  async getOrders() {
    if (this.isMongoConnected) {
      return await Order.find().sort({ createdAt: -1 }).lean();
    }
    return this.localData.orders;
  }

  async getOrderById(id) {
    if (this.isMongoConnected) {
      return await Order.findOne({ id }).lean();
    }
    return this.localData.orders.find(o => o.id === id);
  }

  async createOrder(orderData) {
    if (this.isMongoConnected) {
      const o = new Order(orderData);
      await o.save();
      return o.toObject();
    }
    this.localData.orders.unshift(orderData);
    this.saveLocal();
    return orderData;
  }

  async updateOrder(id, updateData) {
    if (this.isMongoConnected) {
      return await Order.findOneAndUpdate({ id }, { $set: updateData }, { new: true }).lean();
    }
    const order = this.localData.orders.find(o => o.id === id);
    if (!order) return null;
    Object.assign(order, updateData);
    this.saveLocal();
    return order;
  }

  // --- STATS ANALYTICS ---
  async getStats() {
    const orders = await this.getOrders();
    const products = await this.getProducts();
    const requests = await this.getRequests();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
    const totalProducts = products.length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;

    const salesByVertical = {
      '3d-printing': 0,
      'fashion': 0,
      'beauty': 0
    };

    orders.forEach(order => {
      (order.items || []).forEach(item => {
        if (item.vertical && salesByVertical[item.vertical] !== undefined) {
          salesByVertical[item.vertical] += (item.price * item.quantity);
        }
      });
    });

    return {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalProducts,
      pendingRequests,
      salesByVertical,
      isMongoConnected: this.isMongoConnected
    };
  }
}

const dbManager = new DatabaseManager();
module.exports = dbManager;
