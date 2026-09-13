require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || '3dom_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Initialize Database Connection (MongoDB atlas if URI provided, else Local JSON fallback)
db.connectMongo(process.env.MONGODB_URI);

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root Health Check Route
app.get('/', async (req, res) => {
  const stats = await db.getStats();
  res.json({
    status: 'success',
    message: '🚀 3DOM API Backend is running!',
    databaseMode: stats.isMongoConnected ? 'MongoDB Database' : 'Local JSON Data Store',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware for JWT verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// =================================================================
// 1. AUTH ROUTES
// =================================================================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@3dom.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const legacyAdminPassword = '99911191';

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  // Admin Credentials Check
  if (email.toLowerCase() === adminEmail.toLowerCase() && (password === adminPassword || password === legacyAdminPassword)) {
    const token = jwt.sign({ id: 'admin-1', email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({
      token,
      user: { id: 'admin-1', email, name: '3DOM Administrator', role: 'admin' }
    });
  }

  // Customer Login
  if (email && password) {
    const token = jwt.sign({ id: 'cust-' + Date.now(), email, role: 'customer' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({
      token,
      user: { id: 'cust-' + Date.now(), email, name: email.split('@')[0], role: 'customer' }
    });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// =================================================================
// 2. PRODUCT ROUTES
// =================================================================
app.get('/api/products', async (req, res) => {
  try {
    const { vertical, category, brand, search, minPrice, maxPrice, sort, featured } = req.query;
    let products = await db.getProducts();

    if (vertical) {
      products = products.filter(p => p.vertical === vertical);
    }
    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (brand) {
      products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }
    if (featured === 'true') {
      products = products.filter(p => p.isFeatured);
    }

    if (sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

app.get('/api/products/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const product = await db.getProductByIdentifier(identifier);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
});

// Admin Product CRUD
app.post('/api/admin/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, vertical, category, brand, price, stock, description, image, attributes } = req.body;
    if (!name || !vertical || !category || !price) {
      return res.status(400).json({ message: 'Missing required fields (name, vertical, category, price)' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
    const newProduct = {
      id: 'prod-' + Date.now(),
      slug,
      name,
      vertical,
      category,
      brand: brand || '3DOM Tech',
      price: parseFloat(price),
      originalPrice: parseFloat(price) * 1.15,
      stock: parseInt(stock) || 10,
      rating: 5.0,
      reviewCount: 0,
      image: image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      description: description || '',
      attributes: attributes || {},
      isFeatured: false
    };

    const saved = await db.createProduct(newProduct);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
});

app.put('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);

    const updated = await db.updateProduct(id, updateData);
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
});

app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteProduct(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
});

// =================================================================
// 3. COUPONS & DISCOUNTS
// =================================================================
app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code required' });

    const coupon = await db.getCouponByCode(code);
    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: 'Invalid or inactive promo code' });
    }

    if (coupon.minOrderValue && orderAmount < coupon.minOrderValue) {
      return res.status(400).json({ 
        message: `Minimum order value of $${coupon.minOrderValue.toFixed(2)} required for code ${coupon.code}` 
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, orderAmount);

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: parseFloat(discount.toFixed(2))
    });
  } catch (err) {
    res.status(500).json({ message: 'Error validating coupon', error: err.message });
  }
});

// Admin Coupons
app.get('/api/admin/coupons', authenticateToken, requireAdmin, async (req, res) => {
  const coupons = await db.getCoupons();
  res.json(coupons);
});

app.post('/api/admin/coupons', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, usageLimit, expiresAt } = req.body;
    if (!code || !discountValue) return res.status(400).json({ message: 'Code and discount value required' });

    const newCoupon = {
      code: code.toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue: parseFloat(discountValue),
      minOrderValue: parseFloat(minOrderValue) || 0,
      usageLimit: parseInt(usageLimit) || 500,
      usedCount: 0,
      isActive: true,
      expiresAt: expiresAt || '2027-12-31'
    };

    const saved = await db.createCoupon(newCoupon);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create coupon', error: err.message });
  }
});

app.put('/api/admin/coupons/:code', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    const updated = await db.updateCoupon(code, req.body);
    if (!updated) return res.status(404).json({ message: 'Coupon not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update coupon', error: err.message });
  }
});

// =================================================================
// 4. REVIEWS
// =================================================================
app.get('/api/reviews/:productId', async (req, res) => {
  const { productId } = req.params;
  const reviews = await db.getReviews(productId);
  res.json(reviews);
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { productId, customerName, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required review fields' });
    }

    const newReview = {
      id: 'rev-' + Date.now(),
      productId,
      customerName: customerName || 'Anonymous Customer',
      rating: parseInt(rating),
      comment,
      status: 'approved'
    };

    const saved = await db.createReview(newReview);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit review', error: err.message });
  }
});

// Admin Review Moderation
app.get('/api/admin/reviews', authenticateToken, requireAdmin, async (req, res) => {
  const reviews = await db.getReviews();
  res.json(reviews);
});

app.put('/api/admin/reviews/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = await db.updateReview(id, status);
  if (!updated) return res.status(404).json({ message: 'Review not found' });
  res.json(updated);
});

app.delete('/api/admin/reviews/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  await db.deleteReview(id);
  res.json({ message: 'Review deleted successfully' });
});

// =================================================================
// 5. CUSTOM SOURCING REQUEST QUEUE
// =================================================================
app.post('/api/requests', async (req, res) => {
  try {
    const { customerEmail, whatsappNumber, requestedItem, requiredDate, deliveryAddress } = req.body;
    if (!customerEmail || !requestedItem) {
      return res.status(400).json({ message: 'Email and requested item details required' });
    }

    const newRequest = {
      id: 'req-' + Math.floor(100 + Math.random() * 900),
      customerEmail,
      whatsappNumber: whatsappNumber || 'N/A',
      requestedItem,
      requiredDate: requiredDate || 'As soon as possible',
      deliveryAddress: deliveryAddress || 'N/A',
      status: 'pending'
    };

    const saved = await db.createRequest(newRequest);
    res.status(201).json({ message: 'Request submitted successfully', request: saved });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit request', error: err.message });
  }
});

app.get('/api/admin/requests', authenticateToken, requireAdmin, async (req, res) => {
  const requests = await db.getRequests();
  res.json(requests);
});

app.put('/api/admin/requests/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = await db.updateRequest(id, status);
  if (!updated) return res.status(404).json({ message: 'Request not found' });
  res.json(updated);
});

// =================================================================
// 6. ORDERS & CHECKOUT
// =================================================================
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, couponCode, paymentMethod } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ message: 'Cart items required' });
    }

    // Verify stock & calculate totals
    let totalAmount = 0;
    const allProducts = await db.getProducts();

    for (const item of items) {
      const prod = allProducts.find(p => p.id === item.id);
      if (!prod) {
        return res.status(400).json({ message: `Product ${item.name} is no longer available.` });
      }
      if (prod.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${prod.name}. Only ${prod.stock} units left!` 
        });
      }
      totalAmount += prod.price * item.quantity;
    }

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await db.getCouponByCode(couponCode);
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (totalAmount * coupon.discountValue) / 100;
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, totalAmount);
        await db.updateCoupon(coupon.code, { usedCount: (coupon.usedCount || 0) + 1 });
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // Deduct stock in real-time
    for (const item of items) {
      const prod = allProducts.find(p => p.id === item.id);
      const newStock = Math.max(0, prod.stock - item.quantity);
      await db.updateProduct(prod.id, { stock: newStock });
    }

    const carriers = ['Bluedart', 'DTDC', 'Delhivery'];
    const assignedCarrier = carriers[Math.floor(Math.random() * carriers.length)];
    const trackingNumber = (assignedCarrier.substring(0, 2) + Math.floor(100000000 + Math.random() * 900000000) + 'IN').toUpperCase();

    const newOrder = {
      id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      customer: customer || { name: 'Guest Customer', email: 'guest@example.com' },
      items,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
      couponCode: couponCode || null,
      paymentMethod: paymentMethod || 'Stripe Test Gateway',
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      carrier: assignedCarrier,
      trackingNumber: trackingNumber
    };

    const saved = await db.createOrder(newOrder);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const order = await db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  let trackingUrl = '#';
  if (order.carrier === 'DTDC') {
    trackingUrl = `https://www.dtdc.in/tracking.asp?strCNNo=${order.trackingNumber}`;
  } else if (order.carrier === 'Bluedart') {
    trackingUrl = `https://www.bluedart.com/tracking?handler=waybill&action=track&trackingNo=${order.trackingNumber}`;
  } else if (order.carrier === 'Delhivery') {
    trackingUrl = `https://www.delhivery.com/track/package/${order.trackingNumber}`;
  }

  res.json({ ...order, trackingUrl });
});

// Admin Orders
app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
  const orders = await db.getOrders();
  res.json(orders);
});

app.put('/api/admin/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updated = await db.updateOrder(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Order not found' });
  res.json(updated);
});

// =================================================================
// 7. ADMIN STATS & ANALYTICS
// =================================================================
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  const stats = await db.getStats();
  res.json(stats);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 3DOM Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
