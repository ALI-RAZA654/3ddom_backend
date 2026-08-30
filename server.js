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

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🚀 3DOM API Backend is running!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware for JWT verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
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
  const adminPassword = process.env.ADMIN_PASSWORD || '99911191';
  
  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign({ id: 'admin-1', email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({
      token,
      user: { id: 'admin-1', email, name: 'Admin User', role: 'admin' }
    });
  }

  // Customer demo login
  if (email && password) {
    const token = jwt.sign({ id: 'cust-' + Date.now(), email, role: 'customer' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({
      token,
      user: { id: 'cust-1', email, name: email.split('@')[0], role: 'customer' }
    });
  }

  res.status(400).json({ message: 'Email and password required' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// =================================================================
// 2. PRODUCT ROUTES
// =================================================================
app.get('/api/products', (req, res) => {
  const { vertical, category, brand, search, minPrice, maxPrice, sort, featured } = req.query;
  let products = [...db.data.products];

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
      p.description.toLowerCase().includes(q)
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
});

app.get('/api/products/:identifier', (req, res) => {
  const { identifier } = req.params;
  const product = db.data.products.find(p => p.id === identifier || p.slug === identifier);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Admin Product CRUD
app.post('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, vertical, category, brand, price, stock, description, image, attributes } = req.body;
  if (!name || !vertical || !category || !price) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newProduct = {
    id: 'prod-' + Date.now(),
    slug,
    name,
    vertical,
    category,
    brand: brand || '3DOM',
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

  db.data.products.unshift(newProduct);
  db.save();
  res.status(201).json(newProduct);
});

app.put('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const index = db.data.products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  const updated = { ...db.data.products[index], ...req.body };
  if (req.body.price) updated.price = parseFloat(req.body.price);
  if (req.body.stock !== undefined) updated.stock = parseInt(req.body.stock);
  
  db.data.products[index] = updated;
  db.save();
  res.json(updated);
});

app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  db.data.products = db.data.products.filter(p => p.id !== id);
  db.save();
  res.json({ message: 'Product deleted successfully' });
});

// =================================================================
// 3. COUPONS & DISCOUNTS
// =================================================================
app.post('/api/coupons/validate', (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) return res.status(400).json({ message: 'Coupon code required' });

  const coupon = db.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
  if (!coupon) {
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
});

// Admin Coupons
app.get('/api/admin/coupons', authenticateToken, requireAdmin, (req, res) => {
  res.json(db.data.coupons);
});

app.post('/api/admin/coupons', authenticateToken, requireAdmin, (req, res) => {
  const { code, discountType, discountValue, minOrderValue, usageLimit, expiresAt } = req.body;
  if (!code || !discountValue) return res.status(400).json({ message: 'Code and value required' });

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

  db.data.coupons.unshift(newCoupon);
  db.save();
  res.status(201).json(newCoupon);
});

app.put('/api/admin/coupons/:code', authenticateToken, requireAdmin, (req, res) => {
  const { code } = req.params;
  const index = db.data.coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
  if (index === -1) return res.status(404).json({ message: 'Coupon not found' });

  db.data.coupons[index] = { ...db.data.coupons[index], ...req.body };
  db.save();
  res.json(db.data.coupons[index]);
});

// =================================================================
// 4. REVIEWS
// =================================================================
app.get('/api/reviews/:productId', (req, res) => {
  const { productId } = req.params;
  const reviews = db.data.reviews.filter(r => r.productId === productId && r.status === 'approved');
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
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
    status: 'approved', // Moderated automatically for immediate demo feedback
    createdAt: new Date().toISOString()
  };

  db.data.reviews.unshift(newReview);

  // Recalculate product rating
  const prod = db.data.products.find(p => p.id === productId);
  if (prod) {
    const prodReviews = db.data.reviews.filter(r => r.productId === productId && r.status === 'approved');
    const totalRating = prodReviews.reduce((sum, r) => sum + r.rating, 0);
    prod.reviewCount = prodReviews.length;
    prod.rating = parseFloat((totalRating / prodReviews.length).toFixed(2));
  }

  db.save();
  res.status(201).json(newReview);
});

// Admin Review Moderation
app.get('/api/admin/reviews', authenticateToken, requireAdmin, (req, res) => {
  res.json(db.data.reviews);
});

app.put('/api/admin/reviews/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved', 'rejected'
  const review = db.data.reviews.find(r => r.id === id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  review.status = status;
  db.save();
  res.json(review);
});

app.delete('/api/admin/reviews/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  db.data.reviews = db.data.reviews.filter(r => r.id !== id);
  db.save();
  res.json({ message: 'Review deleted' });
});

// =================================================================
// 5. CUSTOM SOURCING REQUEST QUEUE
// =================================================================
app.post('/api/requests', (req, res) => {
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
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.data.requests.unshift(newRequest);
  db.save();
  res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
});

app.get('/api/admin/requests', authenticateToken, requireAdmin, (req, res) => {
  res.json(db.data.requests);
});

app.put('/api/admin/requests/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const reqItem = db.data.requests.find(r => r.id === id);
  if (!reqItem) return res.status(404).json({ message: 'Request not found' });

  reqItem.status = status;
  db.save();
  res.json(reqItem);
});

// =================================================================
// 6. ORDERS & REAL-TIME INVENTORY CHECKOUT
// =================================================================
app.post('/api/orders', (req, res) => {
  const { customer, items, couponCode, paymentMethod } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ message: 'Cart items required' });
  }

  // Stock verification & inventory deduction
  for (const item of items) {
    const prod = db.data.products.find(p => p.id === item.id);
    if (!prod) {
      return res.status(400).json({ message: `Product ${item.name} no longer available.` });
    }
    if (prod.stock < item.quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock for ${prod.name}. Only ${prod.stock} left in stock!` 
      });
    }
  }

  // Calculate totals
  let totalAmount = 0;
  for (const item of items) {
    const prod = db.data.products.find(p => p.id === item.id);
    totalAmount += prod.price * item.quantity;
  }

  let discountAmount = 0;
  if (couponCode) {
    const coupon = db.data.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
    if (coupon) {
      if (coupon.discountType === 'percentage') {
        discountAmount = (totalAmount * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }
      discountAmount = Math.min(discountAmount, totalAmount);
      coupon.usedCount += 1;
    }
  }

  const finalAmount = Math.max(0, totalAmount - discountAmount);

  // Deduct real-time stock
  for (const item of items) {
    const prod = db.data.products.find(p => p.id === item.id);
    prod.stock -= item.quantity;
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
    trackingNumber: trackingNumber,
    createdAt: new Date().toISOString()
  };

  db.data.orders.unshift(newOrder);
  db.save();

  res.status(201).json(newOrder);
});

app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = db.data.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Generate carrier tracking URL
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

// Admin Orders Management
app.get('/api/admin/orders', authenticateToken, requireAdmin, (req, res) => {
  res.json(db.data.orders);
});

app.put('/api/admin/orders/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { orderStatus, carrier, trackingNumber } = req.body;
  const order = db.data.orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (orderStatus) order.orderStatus = orderStatus;
  if (carrier) order.carrier = carrier;
  if (trackingNumber) order.trackingNumber = trackingNumber;

  db.save();
  res.json(order);
});

// =================================================================
// 7. ADMIN STATS & ANALYTICS
// =================================================================
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const totalOrders = db.data.orders.length;
  const totalRevenue = db.data.orders.reduce((sum, o) => sum + o.finalAmount, 0);
  const totalProducts = db.data.products.length;
  const pendingRequests = db.data.requests.filter(r => r.status === 'pending').length;

  const salesByVertical = {
    '3d-printing': 0,
    'fashion': 0,
    'beauty': 0
  };

  db.data.orders.forEach(order => {
    order.items.forEach(item => {
      if (item.vertical && salesByVertical[item.vertical] !== undefined) {
        salesByVertical[item.vertical] += (item.price * item.quantity);
      }
    });
  });

  res.json({
    totalOrders,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalProducts,
    pendingRequests,
    salesByVertical
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 3DOM Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
