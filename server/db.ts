import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'bluewave.db');
export const db = new DatabaseSync(dbPath);

// Helper for hashing passwords securely
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combined: string): boolean {
  try {
    const [salt, storedHash] = combined.split(':');
    if (!salt || !storedHash) return false;
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

// Token generation and verification
const SESSIONS = new Map<string, { userId: string; email: string; role: 'admin' | 'customer'; expiresAt: number }>();

export function createSession(userId: string, email: string, role: 'admin' | 'customer'): string {
  const token = 'bw_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  SESSIONS.set(token, { userId, email, role, expiresAt });
  return token;
}

export function getSession(token: string) {
  if (!token) return null;
  const sess = SESSIONS.get(token);
  if (!sess) return null;
  if (Date.now() > sess.expiresAt) {
    SESSIONS.delete(token);
    return null;
  }
  return sess;
}

export function removeSession(token: string) {
  SESSIONS.delete(token);
}

// Initialize tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      full_name TEXT NOT NULL,
      phone TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customer_profiles (
      user_id TEXT PRIMARY KEY,
      delivery_address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      country TEXT DEFAULT 'United States',
      billing_info_json TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      horsepower INTEGER NOT NULL,
      year INTEGER NOT NULL,
      condition TEXT NOT NULL,
      engine_hours INTEGER DEFAULT 0,
      shaft_length TEXT NOT NULL,
      fuel_type TEXT,
      price REAL,
      is_call_for_price INTEGER DEFAULT 0,
      location TEXT NOT NULL,
      delivery_available INTEGER DEFAULT 1,
      availability TEXT NOT NULL DEFAULT 'Available',
      stock_count INTEGER DEFAULT 1,
      product_photos_json TEXT NOT NULL,
      description TEXT NOT NULL,
      specs_json TEXT,
      featured INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS carts (
      user_id TEXT PRIMARY KEY,
      items_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'United States',
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'AWAITING PAYMENT',
      order_status TEXT NOT NULL DEFAULT 'NEW',
      notes TEXT,
      rejection_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_receipts (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      amount REAL NOT NULL,
      receipt_image TEXT NOT NULL,
      customer_notes TEXT,
      status TEXT NOT NULL DEFAULT 'Awaiting Verification',
      admin_notes TEXT,
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      product_id TEXT,
      product_name TEXT,
      order_id TEXT,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'UNREAD',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS message_replies (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      ticket_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      category TEXT NOT NULL,
      order_id TEXT,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS support_replies (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS business_settings (
      id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_settings (
      id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL
    );
  `);

  // Seed default admin if not exists
  const existingAdmin = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!existingAdmin) {
    const adminId = 'bw_usr_admin_001';
    const passwordHash = hashPassword('bluewave2026');
    db.prepare(`
      INSERT INTO users (id, email, password_hash, role, full_name, phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      adminId,
      'admin@bluewaveoutboards.com',
      passwordHash,
      'admin',
      'BlueWave Administrator',
      '+1 (800) 555-9283',
      new Date().toISOString()
    );
  }

  // Seed business settings
  const existingBiz = db.prepare('SELECT id FROM business_settings WHERE id = ?').get('default');
  if (!existingBiz) {
    const defaultBiz = {
      businessName: 'BlueWave Outboard Motors',
      tagline: 'POWER • RELIABILITY • ON THE WATER',
      phone: '+1 (800) 555-WAVE (9283)',
      secondaryPhone: '+1 (305) 555-0199',
      whatsapp: '+1 (305) 555-0199',
      email: 'sales@bluewaveoutboards.com',
      address: '1480 Marina Boulevard, Suite 100',
      city: 'Miami',
      state: 'FL',
      zipCode: '33132',
      country: 'United States',
      businessHours: {
        weekdays: 'Monday – Friday: 8:00 AM – 5:00 PM EST',
        saturday: 'Saturday: 9:00 AM – 2:00 PM EST',
        sunday: 'Sunday: Closed for Boating',
      },
      currency: 'USD',
      facebookUrl: 'https://facebook.com/bluewaveoutboards',
      instagramUrl: 'https://instagram.com/bluewaveoutboards',
      websiteUrl: 'https://bluewaveoutboards.com',
    };
    db.prepare('INSERT INTO business_settings (id, data_json) VALUES (?, ?)').run('default', JSON.stringify(defaultBiz));
  }

  // Seed payment settings
  const existingPay = db.prepare('SELECT id FROM payment_settings WHERE id = ?').get('default');
  if (!existingPay) {
    const defaultPaymentConfig = {
      methods: [
        {
          id: 'paypal',
          name: 'PayPal',
          enabled: false,
          type: 'gateway',
          status: 'NOT CONNECTED',
          description: 'Secure credit card or PayPal account checkout via official PayPal Business API.',
          config: {
            clientId: '',
            clientSecret: '',
            mode: 'sandbox',
          },
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer (Wire / ACH)',
          enabled: true,
          type: 'manual',
          status: 'ACTIVE',
          description: 'Direct wire or ACH bank transfer. Payment instructions and verification reference will be provided.',
          config: {
            beneficiaryName: 'Choussy Christian Junior',
            accountNumber: '210051969790',
            bankName: 'Lead Bank',
            routingNumber: '101019644',
            address: '1801 Main St.',
            city: 'Kansas City',
            state: 'MO',
            country: 'US',
            postalCode: '64108',
            paymentInstructions: 'Please include your unique Order Reference (BW-XXXX) in the wire/ACH memo field. After initiating the transfer, upload a screenshot or PDF of the bank receipt for quick verification.',
          },
        },
        {
          id: 'bitcoin',
          name: 'Bitcoin (BTC)',
          enabled: true,
          type: 'manual',
          status: 'ACTIVE',
          description: 'Instant cryptocurrency settlement via on-chain Bitcoin transaction.',
          config: {
            walletAddress: 'bc1qf4rxtj2ez7wprkp2j6dx99cynxwytc447asn47',
            paymentInstructions: 'Send the exact USD equivalent amount in BTC to the BlueWave public wallet address below. Once sent, upload a screenshot or transaction hash link for verification.',
          },
        },
      ],
    };
    db.prepare('INSERT INTO payment_settings (id, data_json) VALUES (?, ?)').run('default', JSON.stringify(defaultPaymentConfig));
  }

  // Seed initial products if none exist
  const countStmt = db.prepare('SELECT COUNT(*) as cnt FROM products').get() as { cnt: number };
  if (countStmt.cnt === 0) {
    const seedMotors = [
      {
        id: 'bw-mot-001',
        brand: 'Yamaha',
        model: 'F250XSB Offshore 4.2L V6',
        horsepower: 250,
        year: 2024,
        condition: 'New',
        engine_hours: 0,
        shaft_length: '25" (Extra Long)',
        fuel_type: 'Gasoline 4-Stroke EFI',
        price: 24850.00,
        is_call_for_price: 0,
        location: 'Miami Dealership Yard',
        delivery_available: 1,
        availability: 'Available',
        stock_count: 2,
        product_photos: [
          '/src/assets/images/about_outboard_motor_1791036540139.jpg',
          '/src/assets/images/hero_outboard_boat_1791036528701.jpg',
        ],
        description: 'Brand new Yamaha 250 HP Offshore V6 with digital electric steering integration, high-output alternator, and factory 5-year marine warranty. Ideal for center consoles and bay boats.',
        specs: {
          'Displacement': '4.2L (254 ci)',
          'Starting': 'Electric Start w/ PTT',
          'Weight': '551 lbs (250 kg)',
          'Full Throttle RPM': '5,000 - 6,000 RPM',
          'Gear Ratio': '1.75:1',
        },
        featured: 1,
      },
      {
        id: 'bw-mot-002',
        brand: 'Suzuki',
        model: 'DF140BTX Dual Overhead Cam EFI',
        horsepower: 140,
        year: 2024,
        condition: 'New',
        engine_hours: 0,
        shaft_length: '25" (Extra Long)',
        fuel_type: 'Gasoline 4-Stroke DOHC',
        price: 13400.00,
        is_call_for_price: 0,
        location: 'Miami Dealership Yard',
        delivery_available: 1,
        availability: 'Available',
        stock_count: 3,
        product_photos: [
          '/src/assets/images/about_outboard_motor_1791036540139.jpg',
        ],
        description: 'Renowned for exceptional power-to-weight ratio, Suzuki lean burn control system, and offset driveshaft for superior balance. Perfect repower candidate for pontoons and flats skiffs.',
        specs: {
          'Displacement': '2,045 cc',
          'Starting': 'Electric Start',
          'Weight': '410 lbs',
          'Gear Ratio': '2.59:1',
        },
        featured: 1,
      },
      {
        id: 'bw-mot-003',
        brand: 'Mercury',
        model: '300 HP Verado V8 AMS Cold Fusion White',
        horsepower: 300,
        year: 2023,
        condition: 'Certified Pre-Owned',
        engine_hours: 128,
        shaft_length: '25" (Extra Long)',
        fuel_type: 'Gasoline 4.6L V8',
        price: 22900.00,
        is_call_for_price: 0,
        location: 'Miami Dealership Yard',
        delivery_available: 1,
        availability: 'Available',
        stock_count: 1,
        product_photos: [
          '/src/assets/images/mercury_offshore_motor_1791036614640.jpg',
        ],
        description: 'Flawless condition 4.6-liter naturally aspirated V8 Verado. Factory fresh compression test on all 8 cylinders, Advanced MidSection (AMS) vibration isolation, and SmartCraft digital gauge compatibility.',
        specs: {
          'Displacement': '4.6L V8',
          'Cylinder Compression': '180 PSI Across All 8',
          'Warranty': '1-Year Certified Dealer Protection',
          'Steering': 'Integrated Electro-Hydraulic',
        },
        featured: 1,
      },
      {
        id: 'bw-mot-004',
        brand: 'Tohatsu',
        model: 'MFS9.9E Electronic Fuel Injection',
        horsepower: 10,
        year: 2024,
        condition: 'New',
        engine_hours: 0,
        shaft_length: '15" (Short)',
        fuel_type: 'Gasoline 4-Stroke Battery-less EFI',
        price: 2850.00,
        is_call_for_price: 0,
        location: 'In Stock - Ready to Ship',
        delivery_available: 1,
        availability: 'Available',
        stock_count: 5,
        product_photos: [
          '/src/assets/images/portable_outboard_motor_1791036573522.jpg',
        ],
        description: 'Industry-first battery-less electronic fuel injection in a lightweight 9.9 HP chassis. Crisp throttle response, easy pull starting, built-in carry handle, and superior fuel economy for tenders.',
        specs: {
          'Weight': '95 lbs',
          'Fuel Tank': '3.1 Gal Separate Tank Included',
          'Starting': 'Manual Recoil / Primerless',
          'Trim': 'Manual 6-Position Tilt',
        },
        featured: 0,
      },
      {
        id: 'bw-mot-005',
        brand: 'Honda',
        model: 'BF250 iST VTEC 3.6L V6 Silver',
        horsepower: 250,
        year: 2022,
        condition: 'Used',
        engine_hours: 310,
        shaft_length: '30" (Ultra Long)',
        fuel_type: 'Gasoline 4-Stroke VTEC',
        price: 17500.00,
        is_call_for_price: 0,
        location: 'Warehouse Bay 3',
        delivery_available: 1,
        availability: 'Available',
        stock_count: 1,
        product_photos: [
          '/src/assets/images/used_outboard_inspection_1791036626286.jpg',
        ],
        description: 'Equipped with Honda Intelligent Shift and Throttle (iST) and variable valve timing. Fully dealer-serviced at 100hr and 300hr milestones with fresh impeller and lower unit gear oil.',
        specs: {
          'Displacement': '3,583 cc',
          'Alternator': '90 Amp High Output',
          'Shaft': '30" Ultra Long (Offshore Transom)',
        },
        featured: 0,
      },
      {
        id: 'bw-mot-006',
        brand: 'Yamaha',
        model: 'F70LA High Thrust In-Line 4',
        horsepower: 70,
        year: 2021,
        condition: 'Used',
        engine_hours: 185,
        shaft_length: '20" (Long)',
        fuel_type: 'Gasoline 4-Stroke',
        price: 7900.00,
        is_call_for_price: 0,
        location: 'Delivered to Customer',
        delivery_available: 1,
        availability: 'Sold',
        stock_count: 0,
        product_photos: [
          '/src/assets/images/service_outboard_engine_1791036551185.jpg',
        ],
        description: 'Recently sold unit. Compact 16-valve SOHC design. Outstanding shallow water performance with low engine hours and full diagnostic inspection printout.',
        specs: {
          'Hours': '185 Verified',
          'Status': 'Purchased & Delivered in Florida',
        },
        featured: 0,
      },
      {
        id: 'bw-mot-007',
        brand: 'Mercury',
        model: '150 HP FourStroke XL 3.0L',
        horsepower: 150,
        year: 2024,
        condition: 'New',
        engine_hours: 0,
        shaft_length: '25" (Extra Long)',
        fuel_type: 'Gasoline 4-Stroke 3.0L',
        price: 14200.00,
        is_call_for_price: 0,
        location: 'Miami Showroom Display',
        delivery_available: 1,
        availability: 'Available',
        stock_count: 2,
        product_photos: [
          '/src/assets/images/mercury_offshore_motor_1791036614640.jpg',
        ],
        description: 'Class-leading 3.0L displacement producing unmatched low-end torque for quick planing and exceptional durability. Maintenance-free valve train for life.',
        specs: {
          'Displacement': '3.0 L (183 cid)',
          'Alternator': '60 Amp / 756 Watt',
          'Weight': '455 lbs',
        },
        featured: 1,
      },
      {
        id: 'bw-mot-008',
        brand: 'Suzuki',
        model: 'DF250APX Precision Electronic Control',
        horsepower: 250,
        year: 2024,
        condition: 'New',
        engine_hours: 0,
        shaft_length: '25" (Extra Long)',
        fuel_type: 'Gasoline 4.0L V6 24-Valve',
        price: 21500.00,
        is_call_for_price: 0,
        location: 'Miami Showroom Display',
        delivery_available: 1,
        availability: 'Available',
        stock_count: 1,
        product_photos: [
          '/src/assets/images/about_outboard_motor_1791036540139.jpg',
        ],
        description: 'Suzuki drive-by-wire electronic throttle and shift controls with selectable counter-rotation capability for multi-engine center consoles.',
        specs: {
          'Displacement': '4,028 cc (245.6 ci)',
          'Steering': 'Drive-by-Wire Binnacle Ready',
          'Alternator': '54 Amp',
        },
        featured: 1,
      },
      {
        id: 'bw-mot-009',
        brand: 'Yamaha',
        model: 'F115XB In-Line 4 1.8L',
        horsepower: 115,
        year: 2024,
        condition: 'New',
        engine_hours: 0,
        shaft_length: '25" (Extra Long)',
        fuel_type: 'Gasoline 4-Stroke DOHC 16-Valve',
        price: 11950.00,
        is_call_for_price: 0,
        location: 'Miami Warehouse',
        delivery_available: 1,
        availability: 'Available',
        stock_count: 3,
        product_photos: [
          '/src/assets/images/about_outboard_motor_1791036540139.jpg',
        ],
        description: 'Versatile, lightweight power for bay boats, skiffs, runabouts, and inflatables. Excellent fuel economy with Yamaha Command Link digital gauge compatibility.',
        specs: {
          'Displacement': '1.8 Liter',
          'Weight': '377 lbs',
          'RPM Range': '5,300 - 6,300',
        },
        featured: 0,
      },
      {
        id: 'bw-mot-010',
        brand: 'Honda',
        model: 'BF150 iST VTEC 4-Cylinder',
        horsepower: 150,
        year: 2023,
        condition: 'Certified Pre-Owned',
        engine_hours: 84,
        shaft_length: '20" (Long)',
        fuel_type: 'Gasoline 2.4L DOHC VTEC',
        price: 13800.00,
        is_call_for_price: 0,
        location: 'Warehouse Bay 2',
        delivery_available: 1,
        availability: 'Available',
        stock_count: 1,
        product_photos: [
          '/src/assets/images/used_outboard_inspection_1791036626286.jpg',
        ],
        description: 'Automotive-derived 2.4L powerplant with variable valve timing and lift. Only 84 gentle freshwater hours with complete dealer logbook inspection.',
        specs: {
          'Displacement': '2,354 cc',
          'Hours': '84 Verified Freshwater',
          'Warranty': 'Remaining Factory Transferable',
        },
        featured: 0,
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO products (
        id, brand, model, horsepower, year, condition, engine_hours,
        shaft_length, fuel_type, price, is_call_for_price, location,
        delivery_available, availability, stock_count, product_photos_json,
        description, specs_json, featured, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const m of seedMotors) {
      insertStmt.run(
        m.id,
        m.brand,
        m.model,
        m.horsepower,
        m.year,
        m.condition,
        m.engine_hours,
        m.shaft_length,
        m.fuel_type,
        m.price,
        m.is_call_for_price,
        m.location,
        m.delivery_available,
        m.availability,
        m.stock_count,
        JSON.stringify(m.product_photos),
        m.description,
        JSON.stringify(m.specs),
        m.featured,
        new Date().toISOString()
      );
    }
  }
}
