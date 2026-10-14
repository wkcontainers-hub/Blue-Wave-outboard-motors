/**
 * Cloudflare Pages Function: /api/* Catch-All
 * Provides native serverless Edge API execution on Cloudflare Pages (bluewaveoutboards.com)
 * without requiring external hosting providers (Render, Railway, etc.).
 */

interface Env {
  DB?: any;
  BLUEWAVE_KV?: any;
}

// In-Memory store for Cloudflare Edge runtime session
let memoryStore: {
  products: any[];
  paymentSettings: any[];
  businessSettings: any;
  pages: Record<string, any>;
  orders: any[];
  paymentReceipts: any[];
  messages: any[];
  supportTickets: any[];
} | null = null;

function initCloudflareStore() {
  if (memoryStore) return memoryStore;

  memoryStore = {
    products: [
      {
        id: 'bw-mot-001',
        brand: 'Yamaha',
        model: 'F250XSB Offshore 4.2L V6',
        horsepower: 250,
        year: 2024,
        condition: 'New',
        engineHours: 0,
        shaftLength: '25" (Extra Long)',
        fuelType: 'Gasoline 4-Stroke EFI',
        price: 24850,
        isCallForPrice: false,
        location: 'Miami Dealership Yard',
        deliveryAvailable: true,
        availability: 'Available',
        stockCount: 2,
        productPhotos: [
          '/images/yamaha_v6_offshore_1791559510414.jpg'
        ],
        description: 'Brand new Yamaha 250 HP Offshore V6 with digital electric steering integration, high-output alternator, and factory 5-year marine warranty. Ideal for center consoles and bay boats.',
        specs: {
          'Displacement': '4.2L (254 ci)',
          'Starting': 'Electric Start w/ PTT',
          'Weight': '551 lbs (250 kg)',
          'Full Throttle RPM': '5,000 - 6,000 RPM',
          'Gear Ratio': '1.75:1'
        },
        featured: true,
        createdAt: '2026-10-14T11:24:08.338Z'
      },
      {
        id: 'bw-mot-002',
        brand: 'Suzuki',
        model: 'DF140BTX Dual Overhead Cam EFI',
        horsepower: 140,
        year: 2024,
        condition: 'New',
        engineHours: 0,
        shaftLength: '25" (Extra Long)',
        fuelType: 'Gasoline 4-Stroke DOHC',
        price: 13400,
        isCallForPrice: false,
        location: 'Miami Dealership Yard',
        deliveryAvailable: true,
        availability: 'Available',
        stockCount: 3,
        productPhotos: [
          '/images/suzuki_df140_motor_1791559527791.jpg'
        ],
        description: 'Renowned for exceptional power-to-weight ratio, Suzuki lean burn control system, and offset driveshaft for superior balance. Perfect repower candidate for pontoons and flats skiffs.',
        specs: {
          'Displacement': '2,045 cc',
          'Starting': 'Electric Start',
          'Weight': '410 lbs',
          'Gear Ratio': '2.59:1'
        },
        featured: true,
        createdAt: '2026-10-14T11:24:08.338Z'
      },
      {
        id: 'bw-mot-003',
        brand: 'Mercury',
        model: '300 HP Verado V8 AMS Cold Fusion White',
        horsepower: 300,
        year: 2023,
        condition: 'Certified Pre-Owned',
        engineHours: 128,
        shaftLength: '25" (Extra Long)',
        fuelType: 'Gasoline 4.6L V8',
        price: 22900,
        isCallForPrice: false,
        location: 'Miami Dealership Yard',
        deliveryAvailable: true,
        availability: 'Available',
        stockCount: 1,
        productPhotos: [
          '/images/mercury_offshore_motor_1791036614640.jpg'
        ],
        description: 'Flawless condition 4.6-liter naturally aspirated V8 Verado. Factory fresh compression test on all 8 cylinders, Advanced MidSection (AMS) vibration isolation, and SmartCraft digital gauge compatibility.',
        specs: {
          'Displacement': '4.6L V8',
          'Cylinder Compression': '180 PSI Across All 8',
          'Warranty': '1-Year Certified Dealer Protection',
          'Steering': 'Integrated Electro-Hydraulic'
        },
        featured: true,
        createdAt: '2026-10-14T11:24:08.338Z'
      },
      {
        id: 'bw-mot-004',
        brand: 'Tohatsu',
        model: 'MFS9.9E Electronic Fuel Injection',
        horsepower: 10,
        year: 2024,
        condition: 'New',
        engineHours: 0,
        shaftLength: '15" (Short)',
        fuelType: 'Gasoline 4-Stroke Battery-less EFI',
        price: 2850,
        isCallForPrice: false,
        location: 'In Stock - Ready to Ship',
        deliveryAvailable: true,
        availability: 'Available',
        stockCount: 5,
        productPhotos: [
          '/images/portable_outboard_motor_1791036573522.jpg'
        ],
        description: 'Industry-first battery-less electronic fuel injection in a lightweight 9.9 HP chassis. Crisp throttle response, easy pull starting, built-in carry handle, and superior fuel economy for tenders.',
        specs: {
          'Weight': '95 lbs',
          'Fuel Tank': '3.1 Gal Separate Tank Included',
          'Starting': 'Manual Recoil / Primerless',
          'Trim': 'Manual 6-Position Tilt'
        },
        featured: false,
        createdAt: '2026-10-14T11:24:08.339Z'
      },
      {
        id: 'bw-mot-005',
        brand: 'Honda',
        model: 'BF250 iST VTEC 3.6L V6 Silver',
        horsepower: 250,
        year: 2022,
        condition: 'Used',
        engineHours: 310,
        shaftLength: '30" (Ultra Long)',
        fuelType: 'Gasoline 4-Stroke VTEC',
        price: 17500,
        isCallForPrice: false,
        location: 'Warehouse Bay 3',
        deliveryAvailable: true,
        availability: 'Available',
        stockCount: 1,
        productPhotos: [
          '/images/honda_bf250_motor_1791559549672.jpg'
        ],
        description: 'Equipped with Honda Intelligent Shift and Throttle (iST) and variable valve timing. Fully dealer-serviced at 100hr and 300hr milestones with fresh impeller and lower unit gear oil.',
        specs: {
          'Displacement': '3,583 cc',
          'Alternator': '90 Amp High Output',
          'Shaft': '30" Ultra Long (Offshore Transom)'
        },
        featured: false,
        createdAt: '2026-10-14T11:24:08.339Z'
      },
      {
        id: 'bw-mot-006',
        brand: 'Yamaha',
        model: 'F70LA High Thrust In-Line 4',
        horsepower: 70,
        year: 2021,
        condition: 'Used',
        engineHours: 185,
        shaftLength: '20" (Long)',
        fuelType: 'Gasoline 4-Stroke',
        price: 7900,
        isCallForPrice: false,
        location: 'Delivered to Customer',
        deliveryAvailable: true,
        availability: 'Sold',
        stockCount: 0,
        productPhotos: [
          '/images/service_outboard_engine_1791036551185.jpg'
        ],
        description: 'Recently sold unit. Compact 16-valve SOHC design. Outstanding shallow water performance with low engine hours and full diagnostic inspection printout.',
        specs: {
          'Hours': '185 Verified',
          'Status': 'Purchased & Delivered in Florida'
        },
        featured: false,
        createdAt: '2026-10-14T11:24:08.339Z'
      },
      {
        id: 'bw-mot-007',
        brand: 'Mercury',
        model: '150 HP FourStroke XL 3.0L',
        horsepower: 150,
        year: 2024,
        condition: 'New',
        engineHours: 0,
        shaftLength: '25" (Extra Long)',
        fuelType: 'Gasoline 4-Stroke 3.0L',
        price: 14200,
        isCallForPrice: false,
        location: 'Miami Showroom Display',
        deliveryAvailable: true,
        availability: 'Available',
        stockCount: 2,
        productPhotos: [
          '/images/mercury_150_fourstroke_1791559568340.jpg'
        ],
        description: 'Class-leading 3.0L displacement producing unmatched low-end torque for quick planing and exceptional durability. Maintenance-free valve train for life.',
        specs: {
          'Displacement': '3.0 L (183 cid)',
          'Alternator': '60 Amp / 756 Watt',
          'Weight': '455 lbs'
        },
        featured: true,
        createdAt: '2026-10-14T11:24:08.339Z'
      },
      {
        id: 'bw-mot-008',
        brand: 'Suzuki',
        model: 'DF250APX Precision Electronic Control',
        horsepower: 250,
        year: 2024,
        condition: 'New',
        engineHours: 0,
        shaftLength: '25" (Extra Long)',
        fuelType: 'Gasoline 4.0L V6 24-Valve',
        price: 21500,
        isCallForPrice: false,
        location: 'Miami Showroom Display',
        deliveryAvailable: true,
        availability: 'Available',
        stockCount: 1,
        productPhotos: [
          '/images/suzuki_df140_motor_1791559527791.jpg'
        ],
        description: 'Suzuki drive-by-wire electronic throttle and shift controls with selectable counter-rotation capability for multi-engine center consoles.',
        specs: {
          'Displacement': '4,028 cc (245.6 ci)',
          'Steering': 'Drive-by-Wire Binnacle Ready',
          'Alternator': '54 Amp'
        },
        featured: true,
        createdAt: '2026-10-14T11:24:08.339Z'
      },
      {
        id: 'bw-mot-009',
        brand: 'Yamaha',
        model: 'F115XB In-Line 4 1.8L',
        horsepower: 115,
        year: 2024,
        condition: 'New',
        engineHours: 0,
        shaftLength: '25" (Extra Long)',
        fuelType: 'Gasoline 4-Stroke DOHC 16-Valve',
        price: 11950,
        isCallForPrice: false,
        location: 'Miami Warehouse',
        deliveryAvailable: true,
        availability: 'Available',
        stockCount: 3,
        productPhotos: [
          '/images/yamaha_v6_offshore_1791559510414.jpg'
        ],
        description: 'Versatile, lightweight power for bay boats, skiffs, runabouts, and inflatables. Excellent fuel economy with Yamaha Command Link digital gauge compatibility.',
        specs: {
          'Displacement': '1.8 Liter',
          'Weight': '377 lbs',
          'RPM Range': '5,300 - 6,300'
        },
        featured: false,
        createdAt: '2026-10-14T11:24:08.340Z'
      },
      {
        id: 'bw-mot-010',
        brand: 'Honda',
        model: 'BF150 iST VTEC 4-Cylinder',
        horsepower: 150,
        year: 2023,
        condition: 'Certified Pre-Owned',
        engineHours: 84,
        shaftLength: '20" (Long)',
        fuelType: 'Gasoline 2.4L DOHC VTEC',
        price: 13800,
        isCallForPrice: false,
        location: 'Warehouse Bay 2',
        deliveryAvailable: true,
        availability: 'Available',
        stockCount: 1,
        productPhotos: [
          '/images/honda_bf250_motor_1791559549672.jpg',
          '/images/used_outboard_inspection_1791036626286.jpg'
        ],
        description: 'Automotive-derived 2.4L powerplant with variable valve timing and lift. Only 84 gentle freshwater hours with complete dealer logbook inspection.',
        specs: {
          'Displacement': '2,354 cc',
          'Hours': '84 Verified Freshwater',
          'Warranty': 'Remaining Factory Transferable'
        },
        featured: false,
        createdAt: '2026-10-14T11:24:08.340Z'
      }
    ],
    paymentSettings: [
      {
        id: 'bank_transfer',
        name: 'Bank Transfer (Lead Bank Wire / ACH)',
        enabled: true,
        type: 'bank_transfer',
        instructions: 'Send domestic wire or ACH transfer to our Lead Bank business operating account. Verification typically completes within 1 to 2 business hours.',
        config: {
          beneficiaryName: 'Choussy Christian Junior',
          accountNumber: '210051969790',
          bankName: 'Lead Bank',
          routingNumber: '101019644',
          bankAddress: '1801 Main St., Kansas City, MO 64108',
          accountType: 'Business Checking'
        }
      },
      {
        id: 'bitcoin',
        name: 'Bitcoin (BTC)',
        enabled: true,
        type: 'crypto',
        instructions: 'Send the exact USD equivalent in Bitcoin (BTC) to the verified BlueWave dealership wallet address. Once sent, upload a screenshot or transaction hash for immediate verification.',
        config: {
          walletAddress: 'bc1qf4rxtj2ez7wprkp2j6dx99cynxwytc447asn47',
          network: 'Bitcoin Native SegWit / Mainnet'
        }
      }
    ],
    businessSettings: {
      businessName: 'BlueWave Outboard Motors',
      phone: '+1 (816) 430-1748',
      email: 'contact@bluewaveoutboards.com',
      address: '1801 Main St, Kansas City, MO 64108',
      hours: 'Mon - Fri: 8:00 AM - 6:00 PM | Sat: 9:00 AM - 4:00 PM',
      whatsapp: '+1 (816) 430-1748',
      warrantyInfo: 'All motors backed by genuine manufacturer warranty and dealer pre-delivery inspection.',
      shippingPolicy: 'Nationwide insured freight delivery directly to marinas, docks, and residences with hydraulic liftgate service.'
    },
    pages: {
      home: {
        heroBadge: 'MARINE POWER SPECIALISTS',
        heroTitle: 'POWER YOUR',
        heroHighlight: 'NEXT ADVENTURE.',
        heroSubtitle: 'New and used outboard motors for boat owners, anglers, and commercial operators. Sales, service, parts and delivery — all in one place.',
        heroImage: '/images/hero_outboard_boat_1791036528701.jpg',
        primaryCtaText: 'SHOP OUTBOARDS',
        secondaryCtaText: 'REQUEST A MOTOR',
        commitmentBadge: 'THE BLUEWAVE COMMITMENT',
        commitmentTitle: 'Precision Outboard Power,',
        commitmentHighlight: 'Backed by Marine Experts.',
        commitmentText: 'Whether you need a lightweight portable 4-stroke for your tender, a rugged inline engine for your bay boat, or high-output multi-engine power for offshore tournaments, BlueWave Outboard Motors delivers genuine reliability, honest consultations, and seamless procurement.',
        featurePoints: [
          { title: 'NEW & USED MOTORS', subtitle: 'Top-tier brands & sizes' },
          { title: 'SALES & SERVICE', subtitle: 'Factory-trained marine care' },
          { title: 'PARTS & ACCESSORIES', subtitle: 'Controls, rigging & props' },
          { title: 'DELIVERY AVAILABLE', subtitle: 'Direct to dock or freight' }
        ],
        repowerCard: {
          tag: 'IN-DEMAND REPOWER',
          powerRange: '115 – 300+ HP',
          title: 'Looking to repower your current hull?',
          desc: 'Share your current boat transom height, steering setup, and performance goals. We match you with the optimal motor class.',
          image: '/images/about_outboard_motor_1791036540139.jpg',
          ctaText: 'Request Repower Quote'
        }
      },
      about: {
        badge: 'ABOUT BLUEWAVE',
        title: 'Built around',
        titleHighlight: 'life on the water.',
        subtitle: 'BlueWave Outboard Motors is a marine-focused business designed to make finding the right outboard motor simple and straightforward.',
        image: '/images/about_outboard_motor_1791036540139.jpg',
        badgeOverlayTitle: 'Dealership Verified Quality',
        badgeOverlayDesc: 'Inspected, compression-tested, and ready for water.',
        badgeOverlayTag: 'BLUEWAVE SPEC',
        ctaText: 'Talk to BlueWave',
        bullets: [
          'New and used outboard motor sourcing',
          'Popular brands and horsepower classes',
          'Service, parts and accessories support',
          'Delivery options for customers'
        ],
        storyParagraph1: 'Founded with a pure passion for marine mechanics and blue-water performance, BlueWave Outboard Motors was established to provide boaters with an honest, transparent, and technically competent dealership experience.',
        storyParagraph2: 'From lightweight dinghy portables to multi-engine offshore tournament setups, every motor in our inventory undergoes extensive multi-point inspection, compression verification, and run testing.'
      },
      services: {
        badge: 'OUR SERVICES',
        title: 'More than',
        titleHighlight: 'just motors.',
        subtitle: 'BlueWave is built to support customers before, during and after the purchase.',
        serviceCards: [
          {
            id: 'sales',
            title: 'OUTBOARD SALES',
            desc: 'New and used motors across popular power classes.',
            image: '/images/mercury_offshore_motor_1791036614640.jpg',
            actionText: 'View Available Classes',
            actionPage: 'shop',
            bullets: [
              'New & certified pre-owned selections',
              '2.5 HP portables to 300+ HP V8 outboards',
              'Repower consultations for existing hulls'
            ]
          },
          {
            id: 'service',
            title: 'SERVICE & REPAIRS',
            desc: 'Maintenance and repair support can be arranged for customers.',
            image: '/images/service_outboard_engine_1791036551185.jpg',
            actionText: 'Inquire About Service',
            actionPage: 'contact',
            bullets: [
              '100-hour & seasonal service coordination',
              'Computer diagnostic testing & health reports',
              'Lower unit fluid, water pump & impeller renewal'
            ]
          },
          {
            id: 'parts',
            title: 'PARTS & ACCESSORIES',
            desc: 'Ask us about compatible controls, props, rigging, and accessories.',
            image: '/images/parts_propellers_rigging_1791036562604.jpg',
            actionText: 'Request Parts / Rigging',
            actionPage: 'order',
            bullets: [
              'Stainless steel & aluminum propellers',
              'Digital command link gauges & harnesses',
              'Side-mount & top-mount binnacle controls'
            ]
          }
        ]
      },
      shop: {
        badge: 'BLUEWAVE OUTBOARD SHOWROOM • U.S. INVENTORY',
        title: 'Outboards for',
        titleHighlight: 'every mission.',
        subtitle: 'Browse our extensive certified outboard inventory with upfront USD ($) pricing, genuine manufacturer warranties, and insured nationwide freight.',
        bannerImage: '/images/mercury_offshore_motor_1791036614640.jpg',
        noticeTitle: 'Nationwide Marine Freight',
        noticeText: 'All crated motors ship fully insured via specialized freight carriers with hydraulic liftgate delivery directly to your marina, residence, or commercial dock.'
      },
      contact: {
        badge: 'CONTACT US',
        title: "Let's get you",
        titleHighlight: 'on the water.',
        subtitle: "Tell us what you're looking for and we'll help you start the conversation.",
        bannerImage: '/images/parts_propellers_rigging_1791036562604.jpg',
        deskHeading: 'DIRECT DEALERSHIP DESK',
        deskDescription: 'Connect directly with BlueWave sales and certified rigging specialists for immediate pricing, trade-ins, and transport schedules.',
        responseTimeText: 'Average response time during dealership business hours is under 15 minutes.'
      },
      order: {
        badge: 'DIRECT OUTBOARD INVENTORY & CUSTOM ORDER',
        title: 'Request a',
        titleHighlight: 'Custom Quote.',
        subtitle: 'Looking for a specific horsepower, shaft length, or rigging configuration? Submit your requirements below and our dealership will confirm availability, crating fees, and estimated transit times within 2 to 4 business hours.',
        bannerImage: '/images/yamaha_v6_offshore_1791559510414.jpg',
        helpTitle: 'Need immediate assistance?',
        helpText: 'Call or message our dealership desk directly for real-time inventory verification and expedited quotes.'
      }
    },
    orders: [],
    paymentReceipts: [],
    messages: [],
    supportTickets: []
  };

  return memoryStore;
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With',
    },
  });
}

export const onRequest: any = async (context: {
  request: Request;
  env: Env;
  params: { path?: string[] };
}) => {
  const { request } = context;
  const url = new URL(request.url);

  // Handle CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With',
      },
    });
  }

  const store = initCloudflareStore();
  const path = url.pathname.replace(/^\/api\/?/, '');
  const segments = path.split('/').filter(Boolean);

  // 1. Health
  if (segments[0] === 'health') {
    return jsonResponse({ status: 'healthy', provider: 'Cloudflare Pages Functions', timestamp: new Date().toISOString() });
  }

  // 2. Products
  if (segments[0] === 'products') {
    if (request.method === 'GET') {
      if (segments[1]) {
        const prod = store.products.find((p) => p.id === segments[1]);
        if (!prod) return jsonResponse({ error: 'Product not found' }, 404);
        return jsonResponse(prod);
      }
      return jsonResponse(store.products);
    }

    if (request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const newProd = {
          ...body,
          id: `prod-${Date.now()}`,
          createdAt: new Date().toISOString(),
          availability: body.availability || 'Available',
          productPhotos: body.productPhotos || []
        };
        store.products.unshift(newProd);
        return jsonResponse(newProd, 201);
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 400);
      }
    }

    if (request.method === 'PUT' && segments[1]) {
      try {
        const body = await request.json() as any;
        const idx = store.products.findIndex((p) => p.id === segments[1]);
        if (idx === -1) return jsonResponse({ error: 'Product not found' }, 404);
        store.products[idx] = { ...store.products[idx], ...body, id: segments[1] };
        return jsonResponse(store.products[idx]);
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 400);
      }
    }

    if (request.method === 'PATCH' && segments[1]) {
      try {
        const body = await request.json() as any;
        const idx = store.products.findIndex((p) => p.id === segments[1]);
        if (idx === -1) return jsonResponse({ error: 'Product not found' }, 404);
        store.products[idx] = { ...store.products[idx], ...body };
        return jsonResponse(store.products[idx]);
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 400);
      }
    }

    if (request.method === 'DELETE' && segments[1]) {
      const idx = store.products.findIndex((p) => p.id === segments[1]);
      if (idx === -1) return jsonResponse({ error: 'Product not found' }, 404);
      store.products.splice(idx, 1);
      return jsonResponse({ success: true });
    }
  }

  // 3. Pages Content
  if (segments[0] === 'pages') {
    if (request.method === 'GET') {
      if (segments[1]) {
        const page = store.pages[segments[1]];
        if (!page) return jsonResponse({ error: 'Page not found' }, 404);
        return jsonResponse(page);
      }
      return jsonResponse(store.pages);
    }

    if (request.method === 'PUT' && segments[1]) {
      try {
        const body = await request.json();
        store.pages[segments[1]] = body;
        return jsonResponse({ success: true, message: `Page '${segments[1]}' updated successfully` });
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 400);
      }
    }
  }

  // 4. Payment Settings
  if (segments[0] === 'payment-settings') {
    if (request.method === 'GET') {
      return jsonResponse(store.paymentSettings);
    }
    if (request.method === 'PUT') {
      try {
        const body = await request.json() as any;
        if (Array.isArray(body)) {
          store.paymentSettings = body;
        } else if (body.methods && Array.isArray(body.methods)) {
          store.paymentSettings = body.methods;
        }
        return jsonResponse({ success: true, paymentMethods: store.paymentSettings });
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 400);
      }
    }
  }

  // 5. Business Settings
  if (segments[0] === 'business-settings') {
    if (request.method === 'GET') {
      return jsonResponse(store.businessSettings);
    }
    if (request.method === 'PUT') {
      try {
        const body = await request.json();
        store.businessSettings = { ...store.businessSettings, ...body };
        return jsonResponse({ success: true, businessSettings: store.businessSettings });
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 400);
      }
    }
  }

  // 6. Orders
  if (segments[0] === 'orders') {
    if (segments[1] === 'checkout' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const order = {
          id: orderId,
          orderNumber: orderId,
          customerName: body.fullName || 'Guest Customer',
          email: body.email,
          phone: body.phone,
          deliveryAddress: body.deliveryAddress,
          city: body.city,
          state: body.state,
          zipCode: body.zipCode,
          country: body.country || 'United States',
          items: body.items || [],
          subtotal: body.subtotal || 0,
          shipping: body.shipping || 0,
          totalAmount: body.total || 0,
          paymentMethod: body.paymentMethod,
          paymentStatus: 'Awaiting Payment',
          orderStatus: 'Pending Verification',
          createdAt: new Date().toISOString()
        };
        store.orders.unshift(order);
        return jsonResponse({ success: true, orderId, order });
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 400);
      }
    }

    if (request.method === 'GET') {
      if (segments[1]) {
        const order = store.orders.find((o) => o.id === segments[1] || o.orderNumber === segments[1]);
        if (!order) return jsonResponse({ error: 'Order not found' }, 404);
        return jsonResponse(order);
      }
      return jsonResponse(store.orders);
    }

    if (request.method === 'PATCH' && segments[1]) {
      try {
        const body = await request.json() as any;
        const idx = store.orders.findIndex((o) => o.id === segments[1] || o.orderNumber === segments[1]);
        if (idx === -1) return jsonResponse({ error: 'Order not found' }, 404);
        store.orders[idx] = { ...store.orders[idx], ...body };
        return jsonResponse(store.orders[idx]);
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 400);
      }
    }
  }

  // 7. Payment Receipts
  if (segments[0] === 'payment-receipts') {
    if (segments[1] === 'upload' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const receipt = {
          id: `rcpt-${Date.now()}`,
          orderId: body.orderId,
          receiptImageUrl: body.receiptImage,
          customerNotes: body.customerNotes || '',
          status: 'Awaiting Verification',
          uploadedAt: new Date().toISOString()
        };
        store.paymentReceipts.unshift(receipt);
        return jsonResponse({ success: true, receipt });
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 400);
      }
    }

    if (request.method === 'GET') {
      return jsonResponse(store.paymentReceipts);
    }

    if (request.method === 'PATCH' && segments[1]) {
      try {
        const body = await request.json() as any;
        const idx = store.paymentReceipts.findIndex((r) => r.id === segments[1]);
        if (idx === -1) return jsonResponse({ error: 'Receipt not found' }, 404);
        store.paymentReceipts[idx] = { ...store.paymentReceipts[idx], ...body };
        return jsonResponse(store.paymentReceipts[idx]);
      } catch (err: any) {
        return jsonResponse({ error: err.message }, 400);
      }
    }
  }

  // 8. Auth (Administrator)
  if (segments[0] === 'auth' && segments[1] === 'login' && request.method === 'POST') {
    try {
      const body = await request.json() as any;
      const user = body.username || body.email || body.emailOrUsername || '';
      const pass = body.password || '';
      if (
        (user === 'admin' || user === 'admin@bluewaveoutboards.com' || user === 'owner@bluewaveoutboards.com') &&
        (pass === 'bluewave2026' || pass === 'admin123' || pass === 'admin')
      ) {
        return jsonResponse({
          token: `bw_tok_${Date.now()}`,
          user: {
            id: 'bw_usr_admin_001',
            email: 'admin@bluewaveoutboards.com',
            role: 'admin',
            fullName: 'BlueWave Dealership Administrator'
          }
        });
      }
      return jsonResponse({ error: 'Invalid administrator credentials' }, 401);
    } catch (err: any) {
      return jsonResponse({ error: err.message }, 400);
    }
  }

  // 9. Upload
  if (segments[0] === 'upload' && request.method === 'POST') {
    try {
      const body = await request.json() as any;
      // Return base64 or URL back for edge hosting
      return jsonResponse({ url: body.image, success: true });
    } catch (err: any) {
      return jsonResponse({ error: err.message }, 400);
    }
  }

  // 10. Messages & Support
  if (segments[0] === 'messages') {
    if (request.method === 'GET') return jsonResponse(store.messages);
    if (request.method === 'POST') {
      const body = await request.json() as any;
      const msg = { ...body, id: `msg-${Date.now()}`, status: 'UNREAD', createdAt: new Date().toISOString() };
      store.messages.unshift(msg);
      return jsonResponse(msg, 201);
    }
  }

  if (segments[0] === 'support') {
    if (request.method === 'GET') return jsonResponse(store.supportTickets);
    if (request.method === 'POST') {
      const body = await request.json() as any;
      const ticket = { ...body, id: `tkt-${Date.now()}`, status: 'OPEN', createdAt: new Date().toISOString() };
      store.supportTickets.unshift(ticket);
      return jsonResponse(ticket, 201);
    }
  }

  return jsonResponse({ error: 'Endpoint not found', path: url.pathname }, 404);
};
