import { Router, Request, Response, NextFunction } from 'express';
import { db, hashPassword, verifyPassword, createSession, getSession, removeSession } from './db.ts';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const apiRouter = Router();

// Middleware: Authenticate Session Token
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'admin' | 'customer';
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.cookies?.bw_token || '');
  const session = getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.user = session;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.cookies?.bw_token || '');
  const session = getSession(token);
  if (!session || session.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  req.user = session;
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.cookies?.bw_token || '');
  const session = getSession(token);
  if (session) {
    req.user = session;
  }
  next();
}

// ----------------------------------------------------
// 1. AUTHENTICATION & CUSTOMER ACCOUNTS
// ----------------------------------------------------

apiRouter.post('/auth/register', (req, res) => {
  const { email, password, fullName, phone, address, city, state, zipCode } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists' });
  }

  const userId = 'bw_usr_' + crypto.randomBytes(12).toString('hex');
  const passwordHash = hashPassword(password);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, role, full_name, phone, created_at)
    VALUES (?, ?, ?, 'customer', ?, ?, ?)
  `).run(userId, email.toLowerCase().trim(), passwordHash, fullName.trim(), phone || '', now);

  db.prepare(`
    INSERT INTO customer_profiles (user_id, delivery_address, city, state, zip_code, country, billing_info_json, updated_at)
    VALUES (?, ?, ?, ?, ?, 'United States', ?, ?)
  `).run(userId, address || '', city || '', state || '', zipCode || '', JSON.stringify({}), now);

  const token = createSession(userId, email.toLowerCase().trim(), 'customer');

  res.json({
    token,
    user: {
      id: userId,
      email: email.toLowerCase().trim(),
      fullName: fullName.trim(),
      phone: phone || '',
      role: 'customer',
      profile: {
        deliveryAddress: address || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
        country: 'United States',
      },
    },
  });
});

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  // Support 'admin' as shortcut for admin login
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;
  if (!user && cleanEmail === 'admin') {
    user = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get() as any;
  }

  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email/username or password' });
  }

  const profile = db.prepare('SELECT * FROM customer_profiles WHERE user_id = ?').get(user.id) as any;

  const token = createSession(user.id, user.email, user.role);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone || '',
      role: user.role,
      profile: profile
        ? {
            deliveryAddress: profile.delivery_address || '',
            city: profile.city || '',
            state: profile.state || '',
            zipCode: profile.zip_code || '',
            country: profile.country || 'United States',
          }
        : null,
    },
  });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res) => {
  const user = db.prepare('SELECT id, email, role, full_name, phone, created_at FROM users WHERE id = ?').get(req.user!.userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });

  const profile = db.prepare('SELECT * FROM customer_profiles WHERE user_id = ?').get(user.id) as any;

  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone || '',
      role: user.role,
      profile: profile
        ? {
            deliveryAddress: profile.delivery_address || '',
            city: profile.city || '',
            state: profile.state || '',
            zipCode: profile.zip_code || '',
            country: profile.country || 'United States',
          }
        : null,
    },
  });
});

apiRouter.put('/auth/profile', requireAuth, (req: AuthRequest, res) => {
  const { fullName, phone, deliveryAddress, city, state, zipCode, country } = req.body;
  const now = new Date().toISOString();

  if (fullName) {
    db.prepare('UPDATE users SET full_name = ?, phone = ? WHERE id = ?').run(fullName.trim(), phone || '', req.user!.userId);
  }

  db.prepare(`
    INSERT INTO customer_profiles (user_id, delivery_address, city, state, zip_code, country, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      delivery_address = excluded.delivery_address,
      city = excluded.city,
      state = excluded.state,
      zip_code = excluded.zip_code,
      country = excluded.country,
      updated_at = excluded.updated_at
  `).run(req.user!.userId, deliveryAddress || '', city || '', state || '', zipCode || '', country || 'United States', now);

  res.json({ success: true, message: 'Profile updated successfully' });
});

apiRouter.post('/auth/change-password', requireAuth, (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.userId) as any;
  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const newHash = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user!.userId);
  res.json({ success: true, message: 'Password updated successfully' });
});

// ----------------------------------------------------
// 2. PRODUCTS & INVENTORY
// ----------------------------------------------------

apiRouter.get('/products', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY featured DESC, created_at DESC').all() as any[];
  const products = rows.map((p) => ({
    id: p.id,
    brand: p.brand,
    model: p.model,
    horsepower: p.horsepower,
    year: p.year,
    condition: p.condition,
    engineHours: p.engine_hours,
    shaftLength: p.shaft_length,
    fuelType: p.fuel_type,
    price: p.price,
    isCallForPrice: Boolean(p.is_call_for_price),
    location: p.location,
    deliveryAvailable: Boolean(p.delivery_available),
    availability: p.availability,
    stockCount: p.stock_count,
    productPhotos: JSON.parse(p.product_photos_json || '[]'),
    description: p.description,
    specs: JSON.parse(p.specs_json || '{}'),
    featured: Boolean(p.featured),
    createdAt: p.created_at,
  }));
  res.json(products);
});

apiRouter.get('/products/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
  if (!p) return res.status(404).json({ error: 'Product not found' });

  res.json({
    id: p.id,
    brand: p.brand,
    model: p.model,
    horsepower: p.horsepower,
    year: p.year,
    condition: p.condition,
    engineHours: p.engine_hours,
    shaftLength: p.shaft_length,
    fuelType: p.fuel_type,
    price: p.price,
    isCallForPrice: Boolean(p.is_call_for_price),
    location: p.location,
    deliveryAvailable: Boolean(p.delivery_available),
    availability: p.availability,
    stockCount: p.stock_count,
    productPhotos: JSON.parse(p.product_photos_json || '[]'),
    description: p.description,
    specs: JSON.parse(p.specs_json || '{}'),
    featured: Boolean(p.featured),
    createdAt: p.created_at,
  });
});

apiRouter.post('/products', requireAdmin, (req, res) => {
  const {
    brand, model, horsepower, year, condition, engineHours, shaftLength,
    fuelType, price, isCallForPrice, location, deliveryAvailable,
    availability, stockCount, productPhotos, description, specs, featured
  } = req.body;

  if (!brand || !model || !horsepower) {
    return res.status(400).json({ error: 'Brand, model, and horsepower are required' });
  }

  const id = 'bw-mot-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO products (
      id, brand, model, horsepower, year, condition, engine_hours,
      shaft_length, fuel_type, price, is_call_for_price, location,
      delivery_available, availability, stock_count, product_photos_json,
      description, specs_json, featured, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, brand, model, Number(horsepower), Number(year) || 2024, condition || 'New',
    Number(engineHours) || 0, shaftLength || '20" (Long)', fuelType || 'Gasoline 4-Stroke EFI',
    price ? Number(price) : null, isCallForPrice ? 1 : 0, location || 'Dealership Yard',
    deliveryAvailable ? 1 : 0, availability || 'Available', Number(stockCount) || 1,
    JSON.stringify(productPhotos || []), description || '', JSON.stringify(specs || {}),
    featured ? 1 : 0, now
  );

  res.status(201).json({ id, message: 'Product created successfully' });
});

apiRouter.put('/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const p = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!p) return res.status(404).json({ error: 'Product not found' });

  const {
    brand, model, horsepower, year, condition, engineHours, shaftLength,
    fuelType, price, isCallForPrice, location, deliveryAvailable,
    availability, stockCount, productPhotos, description, specs, featured
  } = req.body;

  db.prepare(`
    UPDATE products SET
      brand = ?, model = ?, horsepower = ?, year = ?, condition = ?,
      engine_hours = ?, shaft_length = ?, fuel_type = ?, price = ?,
      is_call_for_price = ?, location = ?, delivery_available = ?,
      availability = ?, stock_count = ?, product_photos_json = ?,
      description = ?, specs_json = ?, featured = ?
    WHERE id = ?
  `).run(
    brand, model, Number(horsepower), Number(year), condition,
    Number(engineHours), shaftLength, fuelType, price ? Number(price) : null,
    isCallForPrice ? 1 : 0, location, deliveryAvailable ? 1 : 0,
    availability, Number(stockCount), JSON.stringify(productPhotos || []),
    description, JSON.stringify(specs || {}), featured ? 1 : 0, id
  );

  res.json({ success: true, message: 'Product updated successfully' });
});

apiRouter.delete('/products/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Product deleted successfully' });
});

apiRouter.patch('/products/:id/availability', requireAdmin, (req, res) => {
  const { availability } = req.body;
  if (!['Available', 'Sold', 'Pending Sale'].includes(availability)) {
    return res.status(400).json({ error: 'Invalid availability status' });
  }
  db.prepare('UPDATE products SET availability = ? WHERE id = ?').run(availability, req.params.id);
  res.json({ success: true, message: `Product availability updated to ${availability}` });
});

// ----------------------------------------------------
// 3. CART SYSTEM
// ----------------------------------------------------

apiRouter.get('/cart', optionalAuth, (req: AuthRequest, res) => {
  const userId = String(req.user?.userId || req.headers['x-guest-session'] || 'guest');
  const cartRow = db.prepare('SELECT items_json FROM carts WHERE user_id = ?').get(userId) as any;
  const items = cartRow ? JSON.parse(cartRow.items_json) : [];
  res.json({ items });
});

apiRouter.post('/cart/sync', optionalAuth, (req: AuthRequest, res) => {
  const userId = String(req.user?.userId || req.headers['x-guest-session'] || 'guest');
  const { items } = req.body;
  const now = new Date().toISOString();

  // Validate items are available
  const validatedItems: any[] = [];
  if (Array.isArray(items)) {
    for (const item of items) {
      const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId) as any;
      if (prod && prod.availability === 'Available') {
        validatedItems.push({
          productId: prod.id,
          brand: prod.brand,
          model: prod.model,
          horsepower: prod.horsepower,
          price: prod.price,
          isCallForPrice: Boolean(prod.is_call_for_price),
          photo: JSON.parse(prod.product_photos_json || '[]')[0] || '',
          quantity: Math.max(1, Number(item.quantity) || 1),
          shaftLength: prod.shaft_length,
          condition: prod.condition,
        });
      }
    }
  }

  db.prepare(`
    INSERT INTO carts (user_id, items_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET items_json = excluded.items_json, updated_at = excluded.updated_at
  `).run(userId, JSON.stringify(validatedItems), now);

  res.json({ items: validatedItems });
});

// ----------------------------------------------------
// 4. CHECKOUT & ORDERS
// ----------------------------------------------------

apiRouter.post('/orders/checkout', optionalAuth, (req: AuthRequest, res) => {
  const {
    fullName, email, phone, deliveryAddress, city, state, zipCode, country,
    items, paymentMethod, notes
  } = req.body;

  if (!fullName || !email || !phone || !deliveryAddress || !city || !state || !zipCode) {
    return res.status(400).json({ error: 'Please provide full contact and delivery address details' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty' });
  }

  // Validate each product against live database to prevent purchasing SOLD/unavailable items
  let subtotal = 0;
  const verifiedOrderItems: any[] = [];

  for (const it of items) {
    const p = db.prepare('SELECT * FROM products WHERE id = ?').get(it.productId) as any;
    if (!p) {
      return res.status(400).json({ error: `Product "${it.model || 'Unknown'}" is no longer in catalog` });
    }
    if (p.availability === 'Sold' || p.stock_count <= 0) {
      return res.status(400).json({ error: `Unit "${p.brand} ${p.model}" is already SOLD and cannot be purchased.` });
    }

    const itemPrice = p.price || 0;
    const qty = Math.max(1, Number(it.quantity) || 1);
    subtotal += itemPrice * qty;

    verifiedOrderItems.push({
      productId: p.id,
      brand: p.brand,
      model: p.model,
      horsepower: p.horsepower,
      year: p.year,
      shaftLength: p.shaft_length,
      condition: p.condition,
      price: itemPrice,
      quantity: qty,
      photo: JSON.parse(p.product_photos_json || '[]')[0] || '',
    });
  }

  const shipping = 0; // Configured per dealership quote or free freight promotion
  const total = subtotal + shipping;

  const orderId = 'BW-' + Math.floor(100000 + Math.random() * 900000);
  const userId = req.user?.userId || 'guest_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO orders (
      id, user_id, customer_name, email, phone, delivery_address, city,
      state, zip_code, country, items_json, subtotal, shipping, total,
      payment_method, payment_status, order_status, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AWAITING PAYMENT', 'NEW', ?, ?, ?)
  `).run(
    orderId, userId, fullName.trim(), email.toLowerCase().trim(), phone.trim(),
    deliveryAddress.trim(), city.trim(), state.trim(), zipCode.trim(), country || 'United States',
    JSON.stringify(verifiedOrderItems), subtotal, shipping, total, paymentMethod || 'Bank Transfer',
    notes || '', now, now
  );

  // Clear customer cart
  const cartKey = String(req.user?.userId || req.headers['x-guest-session'] || 'guest');
  db.prepare('DELETE FROM carts WHERE user_id = ?').run(cartKey);

  res.status(201).json({
    orderId,
    total,
    subtotal,
    shipping,
    paymentMethod,
    paymentStatus: 'AWAITING PAYMENT',
    orderStatus: 'NEW',
    items: verifiedOrderItems,
  });
});

apiRouter.get('/orders/my-orders', requireAuth, (req: AuthRequest, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.userId) as any[];
  const orders = rows.map((o) => ({
    id: o.id,
    customerName: o.customer_name,
    email: o.email,
    phone: o.phone,
    deliveryAddress: `${o.delivery_address}, ${o.city}, ${o.state} ${o.zip_code}`,
    items: JSON.parse(o.items_json || '[]'),
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    orderStatus: o.order_status,
    notes: o.notes,
    rejectionReason: o.rejection_reason,
    createdAt: o.created_at,
  }));
  res.json(orders);
});

apiRouter.get('/orders/:id', optionalAuth, (req: AuthRequest, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
  if (!o) return res.status(404).json({ error: 'Order not found' });

  // Security check: non-admins can only see their own orders or guest matching email
  if (req.user?.role !== 'admin' && req.user?.userId !== o.user_id) {
    const clientEmail = (req.query.email as string) || '';
    if (clientEmail.toLowerCase() !== o.email.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized order access' });
    }
  }

  const receipts = db.prepare('SELECT * FROM payment_receipts WHERE order_id = ? ORDER BY created_at DESC').all(o.id) as any[];

  res.json({
    id: o.id,
    customerName: o.customer_name,
    email: o.email,
    phone: o.phone,
    deliveryAddress: o.delivery_address,
    city: o.city,
    state: o.state,
    zipCode: o.zip_code,
    country: o.country,
    items: JSON.parse(o.items_json || '[]'),
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    orderStatus: o.order_status,
    notes: o.notes,
    rejectionReason: o.rejection_reason,
    receipts: receipts.map((r) => ({
      id: r.id,
      paymentMethod: r.payment_method,
      amount: r.amount,
      receiptImage: r.receipt_image,
      customerNotes: r.customer_notes,
      status: r.status,
      adminNotes: r.admin_notes,
      createdAt: r.created_at,
    })),
    createdAt: o.created_at,
  });
});

// ----------------------------------------------------
// 5. PAYMENT RECEIPTS & VERIFICATION
// ----------------------------------------------------

apiRouter.post('/payments/submit-receipt', optionalAuth, (req: AuthRequest, res) => {
  const { orderId, paymentMethod, amount, receiptImage, customerNotes } = req.body;
  if (!orderId || !receiptImage) {
    return res.status(400).json({ error: 'Order reference and receipt screenshot are required' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
  if (!order) return res.status(404).json({ error: 'Order reference not found' });

  const receiptId = 'bw_rcpt_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();
  const userId = req.user?.userId || order.user_id;

  db.prepare(`
    INSERT INTO payment_receipts (
      id, order_id, user_id, payment_method, amount, receipt_image, customer_notes, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Awaiting Verification', ?)
  `).run(receiptId, orderId, userId, paymentMethod || order.payment_method, Number(amount) || order.total, receiptImage, customerNotes || '', now);

  // Update order status: DO NOT mark paid! Mark 'AWAITING VERIFICATION'
  db.prepare(`
    UPDATE orders SET payment_status = 'AWAITING VERIFICATION', updated_at = ? WHERE id = ?
  `).run(now, orderId);

  res.status(201).json({
    success: true,
    message: 'Payment receipt submitted successfully and queued for dealership verification',
    receiptId,
    status: 'AWAITING VERIFICATION',
  });
});

apiRouter.get('/admin/payments/receipts', requireAdmin, (_req, res) => {
  const rows = db.prepare(`
    SELECT r.*, o.customer_name, o.email, o.phone, o.total as order_total, o.items_json
    FROM payment_receipts r
    JOIN orders o ON r.order_id = o.id
    ORDER BY r.created_at DESC
  `).all() as any[];

  res.json(rows.map((r) => ({
    id: r.id,
    orderId: r.order_id,
    customerName: r.customer_name,
    email: r.email,
    phone: r.phone,
    paymentMethod: r.payment_method,
    amount: r.amount,
    orderTotal: r.order_total,
    receiptImage: r.receipt_image,
    customerNotes: r.customer_notes,
    status: r.status,
    adminNotes: r.admin_notes,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
    createdAt: r.created_at,
    items: JSON.parse(r.items_json || '[]'),
  })));
});

apiRouter.post('/admin/payments/receipts/:id/review', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { decision, adminNotes } = req.body; // 'approve' | 'reject'
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'Decision must be approve or reject' });
  }

  const receipt = db.prepare('SELECT * FROM payment_receipts WHERE id = ?').get(id) as any;
  if (!receipt) return res.status(404).json({ error: 'Payment receipt record not found' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(receipt.order_id) as any;
  if (!order) return res.status(404).json({ error: 'Associated order not found' });

  const now = new Date().toISOString();
  const reviewer = req.user?.email || 'admin';

  if (decision === 'approve') {
    // 1. Mark receipt as Approved
    db.prepare(`
      UPDATE payment_receipts SET
        status = 'Approved', admin_notes = ?, reviewed_by = ?, reviewed_at = ?
      WHERE id = ?
    `).run(adminNotes || 'Payment verified by administrator', reviewer, now, id);

    // 2. Mark order as PAID and PROCESSING
    db.prepare(`
      UPDATE orders SET
        payment_status = 'PAID', order_status = 'PROCESSING', updated_at = ?
      WHERE id = ?
    `).run(now, order.id);

    // 3. Mark the purchased outboard motors as SOLD or decrement inventory!
    const orderItems = JSON.parse(order.items_json || '[]');
    for (const item of orderItems) {
      if (item.productId) {
        db.prepare(`
          UPDATE products SET
            availability = 'Sold',
            stock_count = MAX(0, stock_count - 1)
          WHERE id = ?
        `).run(item.productId);
      }
    }

    res.json({
      success: true,
      message: `Payment for Order #${order.id} approved! Order marked PAID and motor inventory updated to SOLD.`,
    });
  } else {
    // Reject
    db.prepare(`
      UPDATE payment_receipts SET
        status = 'Rejected', admin_notes = ?, reviewed_by = ?, reviewed_at = ?
      WHERE id = ?
    `).run(adminNotes || 'Payment receipt could not be verified', reviewer, now, id);

    db.prepare(`
      UPDATE orders SET
        payment_status = 'PAYMENT REJECTED', rejection_reason = ?, updated_at = ?
      WHERE id = ?
    `).run(adminNotes || 'Receipt rejected by dealership auditor', now, order.id);

    // Create a message notification for customer
    const msgId = 'bw_msg_' + crypto.randomBytes(8).toString('hex');
    db.prepare(`
      INSERT INTO messages (id, user_id, customer_name, customer_email, customer_phone, order_id, subject, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Payment Verification Notice: Order #' || ?, 'REPLIED', ?, ?)
    `).run(msgId, order.user_id, order.customer_name, order.email, order.phone, order.id, order.id, now, now);

    db.prepare(`
      INSERT INTO message_replies (id, message_id, sender_role, sender_name, content, created_at)
      VALUES (?, ?, 'admin', 'BlueWave Accounts Department', ?, ?)
    `).run('bw_rpl_' + crypto.randomBytes(6).toString('hex'), msgId, `Your payment receipt for Order #${order.id} could not be verified. Reason: ${adminNotes || 'Please check transfer reference and submit an updated receipt.'}`, now);

    res.json({
      success: true,
      message: `Payment receipt rejected. Order #${order.id} status updated to PAYMENT REJECTED.`,
    });
  }
});

// ----------------------------------------------------
// 6. ADMIN ORDERS MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/admin/orders', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
  res.json(rows.map((o) => ({
    id: o.id,
    userId: o.user_id,
    customerName: o.customer_name,
    email: o.email,
    phone: o.phone,
    deliveryAddress: `${o.delivery_address}, ${o.city}, ${o.state} ${o.zip_code}`,
    items: JSON.parse(o.items_json || '[]'),
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    orderStatus: o.order_status,
    notes: o.notes,
    rejectionReason: o.rejection_reason,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  })));
});

apiRouter.patch('/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;
  const now = new Date().toISOString();

  if (orderStatus) {
    db.prepare('UPDATE orders SET order_status = ?, updated_at = ? WHERE id = ?').run(orderStatus, now, id);
  }
  if (paymentStatus) {
    db.prepare('UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?').run(paymentStatus, now, id);
    if (paymentStatus === 'PAID') {
      const order = db.prepare('SELECT items_json FROM orders WHERE id = ?').get(id) as any;
      if (order) {
        const items = JSON.parse(order.items_json || '[]');
        for (const it of items) {
          if (it.productId) {
            db.prepare("UPDATE products SET availability = 'Sold', stock_count = MAX(0, stock_count - 1) WHERE id = ?").run(it.productId);
          }
        }
      }
    }
  }

  res.json({ success: true, message: 'Order status updated' });
});

// ----------------------------------------------------
// 7. CUSTOMER MESSAGING & INQUIRIES
// ----------------------------------------------------

apiRouter.get('/messages/my-messages', requireAuth, (req: AuthRequest, res) => {
  const rows = db.prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY updated_at DESC').all(req.user!.userId) as any[];
  const messages = rows.map((m) => {
    const replies = db.prepare('SELECT * FROM message_replies WHERE message_id = ? ORDER BY created_at ASC').all(m.id) as any[];
    return {
      id: m.id,
      subject: m.subject,
      productName: m.product_name,
      orderId: m.order_id,
      status: m.status,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      replies: replies.map((r) => ({
        id: r.id,
        senderRole: r.sender_role,
        senderName: r.sender_name,
        content: r.content,
        createdAt: r.created_at,
      })),
    };
  });
  res.json(messages);
});

apiRouter.post('/messages', optionalAuth, (req: AuthRequest, res) => {
  const { fullName, email, phone, subject, content, productId, productName, orderId } = req.body;
  if (!subject || !content) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const userId = req.user?.userId || 'guest_' + crypto.randomBytes(6).toString('hex');
  const msgId = 'bw_msg_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO messages (id, user_id, customer_name, customer_email, customer_phone, product_id, product_name, order_id, subject, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNREAD', ?, ?)
  `).run(
    msgId, userId, fullName || req.user?.email || 'Customer', email || req.user?.email || '',
    phone || '', productId || null, productName || null, orderId || null, subject, now, now
  );

  db.prepare(`
    INSERT INTO message_replies (id, message_id, sender_role, sender_name, content, created_at)
    VALUES (?, ?, 'customer', ?, ?, ?)
  `).run('bw_rpl_' + crypto.randomBytes(6).toString('hex'), msgId, fullName || 'Customer', content, now);

  res.status(201).json({ id: msgId, message: 'Message sent to BlueWave support' });
});

apiRouter.post('/messages/:id/reply', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as any;
  if (!msg) return res.status(404).json({ error: 'Conversation not found' });

  const isAdm = req.user!.role === 'admin';
  if (!isAdm && req.user!.userId !== msg.user_id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const now = new Date().toISOString();
  const replyId = 'bw_rpl_' + crypto.randomBytes(6).toString('hex');

  db.prepare(`
    INSERT INTO message_replies (id, message_id, sender_role, sender_name, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(replyId, id, isAdm ? 'admin' : 'customer', isAdm ? 'BlueWave Staff' : msg.customer_name, content, now);

  db.prepare('UPDATE messages SET status = ?, updated_at = ? WHERE id = ?').run(isAdm ? 'REPLIED' : 'UNREAD', now, id);

  res.status(201).json({ success: true, message: 'Reply posted' });
});

apiRouter.get('/admin/inbox', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM messages ORDER BY updated_at DESC').all() as any[];
  res.json(rows.map((m) => {
    const replies = db.prepare('SELECT * FROM message_replies WHERE message_id = ? ORDER BY created_at ASC').all(m.id) as any[];
    return {
      id: m.id,
      userId: m.user_id,
      customerName: m.customer_name,
      customerEmail: m.customer_email,
      customerPhone: m.customer_phone,
      productId: m.product_id,
      productName: m.product_name,
      orderId: m.order_id,
      subject: m.subject,
      status: m.status,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      replies: replies.map((r) => ({
        id: r.id,
        senderRole: r.sender_role,
        senderName: r.sender_name,
        content: r.content,
        createdAt: r.created_at,
      })),
    };
  }));
});

// ----------------------------------------------------
// 8. SUPPORT TICKETS & COMPLAINTS
// ----------------------------------------------------

apiRouter.get('/support/my-tickets', requireAuth, (req: AuthRequest, res) => {
  const rows = db.prepare('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC').all(req.user!.userId) as any[];
  res.json(rows.map((t) => {
    const replies = db.prepare('SELECT * FROM support_replies WHERE ticket_id = ? ORDER BY created_at ASC').all(t.id) as any[];
    return {
      id: t.id,
      ticketNumber: t.ticket_number,
      category: t.category,
      orderId: t.order_id,
      subject: t.subject,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      replies: replies.map((r) => ({
        id: r.id,
        senderRole: r.sender_role,
        senderName: r.sender_name,
        content: r.content,
        createdAt: r.created_at,
      })),
    };
  }));
});

apiRouter.post('/support', optionalAuth, (req: AuthRequest, res) => {
  const { fullName, email, phone, category, orderId, subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const userId = req.user?.userId || 'guest_' + crypto.randomBytes(6).toString('hex');
  const ticketId = 'bw_tkt_' + crypto.randomBytes(8).toString('hex');
  const ticketNumber = 'BW-SUPPORT-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO support_tickets (id, ticket_number, user_id, customer_name, customer_email, customer_phone, category, order_id, subject, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)
  `).run(
    ticketId, ticketNumber, userId, fullName || req.user?.email || 'Customer',
    email || req.user?.email || '', phone || '', category || 'Question',
    orderId || null, subject, now, now
  );

  db.prepare(`
    INSERT INTO support_replies (id, ticket_id, sender_role, sender_name, content, created_at)
    VALUES (?, ?, 'customer', ?, ?, ?)
  `).run('bw_srpl_' + crypto.randomBytes(6).toString('hex'), ticketId, fullName || 'Customer', message, now);

  res.status(201).json({ id: ticketId, ticketNumber, message: 'Support ticket submitted' });
});

apiRouter.post('/support/:id/reply', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { content, newStatus } = req.body;
  if (!content) return res.status(400).json({ error: 'Message content is required' });

  const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id) as any;
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const isAdm = req.user!.role === 'admin';
  if (!isAdm && req.user!.userId !== ticket.user_id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO support_replies (id, ticket_id, sender_role, sender_name, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'bw_srpl_' + crypto.randomBytes(6).toString('hex'),
    id,
    isAdm ? 'admin' : 'customer',
    isAdm ? 'BlueWave Customer Care' : ticket.customer_name,
    content,
    now
  );

  const updatedStatus = newStatus || (isAdm ? 'WAITING FOR CUSTOMER' : 'IN PROGRESS');
  db.prepare('UPDATE support_tickets SET status = ?, updated_at = ? WHERE id = ?').run(updatedStatus, now, id);

  res.json({ success: true, message: 'Response added' });
});

apiRouter.get('/admin/support', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM support_tickets ORDER BY updated_at DESC').all() as any[];
  res.json(rows.map((t) => {
    const replies = db.prepare('SELECT * FROM support_replies WHERE ticket_id = ? ORDER BY created_at ASC').all(t.id) as any[];
    return {
      id: t.id,
      ticketNumber: t.ticket_number,
      userId: t.user_id,
      customerName: t.customer_name,
      customerEmail: t.customer_email,
      customerPhone: t.customer_phone,
      category: t.category,
      orderId: t.order_id,
      subject: t.subject,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      replies: replies.map((r) => ({
        id: r.id,
        senderRole: r.sender_role,
        senderName: r.sender_name,
        content: r.content,
        createdAt: r.created_at,
      })),
    };
  }));
});

apiRouter.patch('/admin/support/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const now = new Date().toISOString();
  db.prepare('UPDATE support_tickets SET status = ?, updated_at = ? WHERE id = ?').run(status, now, req.params.id);
  res.json({ success: true, message: 'Ticket status updated' });
});

// ----------------------------------------------------
// 9. BUSINESS & PAYMENT SETTINGS
// ----------------------------------------------------

apiRouter.get('/settings/business', (_req, res) => {
  const row = db.prepare('SELECT data_json FROM business_settings WHERE id = ?').get('default') as any;
  res.json(row ? JSON.parse(row.data_json) : {});
});

apiRouter.put('/admin/settings/business', requireAdmin, (req, res) => {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO business_settings (id, data_json)
    VALUES ('default', ?)
    ON CONFLICT(id) DO UPDATE SET data_json = excluded.data_json
  `).run(JSON.stringify(req.body));
  res.json({ success: true, message: 'Business settings updated' });
});

apiRouter.get('/payments/methods', (_req, res) => {
  const row = db.prepare('SELECT data_json FROM payment_settings WHERE id = ?').get('default') as any;
  const config = row ? JSON.parse(row.data_json) : { methods: [] };
  // Only expose enabled methods to public customers, hiding any secret fields
  const customerMethods = (config.methods || [])
    .filter((m: any) => m.enabled)
    .map((m: any) => ({
      id: m.id,
      name: m.name,
      type: m.type,
      status: m.status,
      description: m.description,
      config: {
        beneficiaryName: m.config?.beneficiaryName,
        accountNumber: m.config?.accountNumber,
        bankName: m.config?.bankName,
        routingNumber: m.config?.routingNumber,
        address: m.config?.address,
        city: m.config?.city,
        state: m.config?.state,
        country: m.config?.country,
        postalCode: m.config?.postalCode,
        paymentInstructions: m.config?.paymentInstructions,
        walletAddress: m.config?.walletAddress,
      },
    }));
  res.json({ methods: customerMethods });
});

apiRouter.get('/admin/payments/settings', requireAdmin, (_req, res) => {
  const row = db.prepare('SELECT data_json FROM payment_settings WHERE id = ?').get('default') as any;
  res.json(row ? JSON.parse(row.data_json) : { methods: [] });
});

apiRouter.put('/admin/payments/settings', requireAdmin, (req, res) => {
  db.prepare(`
    INSERT INTO payment_settings (id, data_json)
    VALUES ('default', ?)
    ON CONFLICT(id) DO UPDATE SET data_json = excluded.data_json
  `).run(JSON.stringify(req.body));
  res.json({ success: true, message: 'Payment settings updated' });
});

// ----------------------------------------------------
// 10. ADMIN DASHBOARD STATS & RECENT ACTIVITY
// ----------------------------------------------------

apiRouter.get('/admin/stats', requireAdmin, (_req, res) => {
  const totalProducts = (db.prepare('SELECT COUNT(*) as cnt FROM products').get() as any).cnt;
  const availableProducts = (db.prepare("SELECT COUNT(*) as cnt FROM products WHERE availability = 'Available'").get() as any).cnt;
  const soldProducts = (db.prepare("SELECT COUNT(*) as cnt FROM products WHERE availability = 'Sold'").get() as any).cnt;
  const totalOrders = (db.prepare('SELECT COUNT(*) as cnt FROM orders').get() as any).cnt;
  const pendingOrders = (db.prepare("SELECT COUNT(*) as cnt FROM orders WHERE payment_status != 'PAID'").get() as any).cnt;
  const paidOrders = (db.prepare("SELECT COUNT(*) as cnt FROM orders WHERE payment_status = 'PAID'").get() as any).cnt;
  const unreadMessages = (db.prepare("SELECT COUNT(*) as cnt FROM messages WHERE status = 'UNREAD'").get() as any).cnt;
  const openSupportTickets = (db.prepare("SELECT COUNT(*) as cnt FROM support_tickets WHERE status = 'OPEN'").get() as any).cnt;
  const pendingReceipts = (db.prepare("SELECT COUNT(*) as cnt FROM payment_receipts WHERE status = 'Awaiting Verification'").get() as any).cnt;

  const recentOrders = db.prepare('SELECT id, customer_name, total, payment_method, payment_status, order_status, created_at FROM orders ORDER BY created_at DESC LIMIT 5').all();
  const recentReceipts = db.prepare('SELECT id, order_id, payment_method, amount, status, created_at FROM payment_receipts ORDER BY created_at DESC LIMIT 5').all();
  const recentMessages = db.prepare('SELECT id, customer_name, subject, status, created_at FROM messages ORDER BY created_at DESC LIMIT 5').all();
  const recentTickets = db.prepare('SELECT id, ticket_number, customer_name, subject, status, created_at FROM support_tickets ORDER BY created_at DESC LIMIT 5').all();

  res.json({
    cards: {
      totalProducts,
      availableProducts,
      soldProducts,
      totalOrders,
      pendingOrders,
      paidOrders,
      unreadMessages,
      openSupportTickets,
      pendingReceipts,
    },
    recent: {
      orders: recentOrders,
      receipts: recentReceipts,
      messages: recentMessages,
      tickets: recentTickets,
    },
  });
});

apiRouter.get('/admin/customers', requireAdmin, (_req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.email, u.full_name, u.phone, u.created_at,
           p.delivery_address, p.city, p.state, p.zip_code, p.country,
           (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count,
           (SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = u.id AND payment_status = 'PAID') as total_spend
    FROM users u
    LEFT JOIN customer_profiles p ON u.id = p.user_id
    WHERE u.role = 'customer'
    ORDER BY u.created_at DESC
  `).all() as any[];

  res.json(rows);
});

// ----------------------------------------------------
// 9. PAGE CONTENT & IMAGE UPLOAD MANAGEMENT (EDIT PAGES)
// ----------------------------------------------------

apiRouter.get('/pages', (_req, res) => {
  const rows = db.prepare('SELECT page_id, data_json FROM page_content').all() as any[];
  const result: Record<string, any> = {};
  for (const r of rows) {
    try {
      result[r.page_id] = JSON.parse(r.data_json);
    } catch {
      result[r.page_id] = {};
    }
  }
  res.json(result);
});

apiRouter.get('/pages/:pageId', (req, res) => {
  const row = db.prepare('SELECT data_json FROM page_content WHERE page_id = ?').get(req.params.pageId) as any;
  if (!row) {
    return res.status(404).json({ error: 'Page content not found' });
  }
  try {
    res.json(JSON.parse(row.data_json));
  } catch (e) {
    res.status(500).json({ error: 'Failed to parse page content' });
  }
});

apiRouter.put('/pages/:pageId', requireAdmin, (req, res) => {
  const { pageId } = req.params;
  const content = req.body;
  if (!content || typeof content !== 'object') {
    return res.status(400).json({ error: 'Invalid page content object' });
  }
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO page_content (page_id, data_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(page_id) DO UPDATE SET
      data_json = excluded.data_json,
      updated_at = excluded.updated_at
  `).run(pageId, JSON.stringify(content), now);

  res.json({ success: true, message: `Page '${pageId}' updated and published successfully` });
});

apiRouter.post('/upload', (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  if (typeof image === 'string' && image.startsWith('data:image/')) {
    const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 image data' });
    }
    const rawExt = matches[1].toLowerCase();
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt === 'svg+xml' ? 'svg' : rawExt;
    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, buffer);
    return res.json({ url: `/uploads/${safeName}`, success: true });
  }

  if (typeof image === 'string' && (image.startsWith('http') || image.startsWith('/'))) {
    return res.json({ url: image, success: true });
  }

  return res.status(400).json({ error: 'Unsupported image format' });
});

