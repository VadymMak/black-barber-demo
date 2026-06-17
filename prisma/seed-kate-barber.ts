import { PrismaClient, Vertical, StoreMode } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const categoryData = [
  { slug: 'haircut',    nameKey: 'Haircut',    sortOrder: 1 },
  { slug: 'beard',      nameKey: 'Beard',      sortOrder: 2 },
  { slug: 'styling',    nameKey: 'Styling',    sortOrder: 3 },
];

const products = [
  // ── HAIRCUT ──
  { slug: 'classic-cut',   nameKey: 'Classic Cut',   price: 25, category: 'haircut', metadata: { portionSize: '45min', cookTime: 45 } },
  { slug: 'layered-cut',   nameKey: 'Layered Cut',   price: 35, category: 'haircut', isHit: true, metadata: { portionSize: '55min', cookTime: 55 } },
  { slug: 'fade-cut',      nameKey: 'Fade Cut',      price: 30, category: 'haircut', metadata: { portionSize: '50min', cookTime: 50 } },
  { slug: 'buzz-cut',      nameKey: 'Buzz Cut',      price: 20, category: 'haircut', metadata: { portionSize: '30min', cookTime: 30 } },

  // ── BEARD ──
  { slug: 'beard-trim',  nameKey: 'Beard Trim',  price: 15, category: 'beard', metadata: { portionSize: '30min', cookTime: 30 } },
  { slug: 'full-shave',  nameKey: 'Full Shave',  price: 25, category: 'beard', isHit: true, metadata: { portionSize: '40min', cookTime: 40 } },
  { slug: 'beard-shape', nameKey: 'Beard Shape', price: 20, category: 'beard', metadata: { portionSize: '35min', cookTime: 35 } },

  // ── STYLING ──
  { slug: 'blowout',  nameKey: 'Blowout',  price: 20, category: 'styling', metadata: { portionSize: '30min', cookTime: 30 } },
  { slug: 'updo',     nameKey: 'Updo',     price: 30, category: 'styling', metadata: { portionSize: '45min', cookTime: 45 } },
  { slug: 'hair-treatment', nameKey: 'Hair Treatment', price: 40, category: 'styling', isNew: true, metadata: { portionSize: '60min', cookTime: 60 } },
];

const chairs = [
  { number: 'C1', seats: 1, zone: 'main', x: 80,  y: 80,  type: 'round', active: true },
  { number: 'C2', seats: 1, zone: 'main', x: 200, y: 80,  type: 'round', active: true },
  { number: 'C3', seats: 1, zone: 'main', x: 320, y: 80,  type: 'round', active: true },
  { number: 'V1', seats: 1, zone: 'private', x: 500, y: 80, type: 'round', active: true },
  { number: 'V2', seats: 1, zone: 'private', x: 620, y: 80, type: 'round', active: true },
];

const testimonials = [
  { name: 'James K.',  email: 'james@example.com',  rating: 5, text: 'Best haircut I\'ve had in years. Kate really knows her craft — clean fade, great attention to detail. Will be back!' },
  { name: 'Martin P.', email: 'martin@example.com', rating: 5, text: 'Amazing beard trim and shape. The studio is clean, modern and the atmosphere is great. Highly recommend.' },
  { name: 'David R.',  email: 'david@example.com',  rating: 5, text: 'I\'ve tried many barbers in Trenčín but Kate Barber is by far the best. Fast, precise and always consistent.' },
  { name: 'Lukas S.',  email: 'lukas@example.com',  rating: 4, text: 'Great experience from start to finish. Loved the hair treatment add-on. Staff is friendly and professional.' },
];

const knowledgeEntries = [
  { title: 'Opening Hours', content: 'Monday–Friday: 9:00–19:00, Saturday: 9:00–17:00, Sunday: Closed', category: 'faq' },
  { title: 'Booking', content: 'Book online via our website or call us directly. Walk-ins are always welcome subject to availability.', category: 'faq' },
  { title: 'Services', content: 'We offer haircuts, beard grooming (trim, shape, full shave), styling (blowout, updo), and hair treatments.', category: 'faq' },
  { title: 'Pricing', content: 'Haircuts from €20, Beard services from €15, Styling from €20. Check our services menu for full pricing.', category: 'faq' },
  { title: 'Payment', content: 'We accept cash, card, and Apple Pay. Payment on completion of service.', category: 'faq' },
];

async function main() {
  console.log('🌱 Seeding Kate Barber Studio...');

  const themeConfig = {
    colors: {
      bg:            '#F5F0EA',
      primary:       '#C96030',
      primaryDark:   '#A04820',
      primaryLight:  '#F5E6DC',
      text:          '#141414',
      textSecondary: '#6B6560',
      textMuted:     '#8A7F7A',
      border:        '#E8E2DA',
      bgSubtle:      '#EDE8E0',
      bgDark:        '#141414',
      headerBg:      'rgba(245,240,234,0.92)',
      contrast:      '#ffffff',
      overlay:       '#141414',
      overlayAlpha:  'rgba(20,20,20,0.65)',
      success:       '#16a34a',
      error:         '#ef4444',
      warning:       '#fbbf24',
      successLight:  '#dcfce7',
      errorLight:    '#fef2f2',
      infoLight:     '#F5E6DC',
    },
    layout: {
      heroType:     'full-width',
      cardStyle:    'border',
      navPosition:  'top',
      borderRadius: 'rounded',
    },
  };

  const storeData = {
    name: 'Kate Barber',
    description: 'Premium Barbershop · Haircuts · Beard · Styling',
    vertical: Vertical.RESTAURANT,
    regionBundle: 'EU',
    primaryMode: StoreMode.PHYSICAL,
    address: 'Mierové námestie 10',
    city: 'Trenčín',
    openingHours: JSON.stringify({
      mon: { open: '09:00', close: '19:00' },
      tue: { open: '09:00', close: '19:00' },
      wed: { open: '09:00', close: '19:00' },
      thu: { open: '09:00', close: '19:00' },
      fri: { open: '09:00', close: '19:00' },
      sat: { open: '09:00', close: '17:00' },
      sun: null,
    }),
    phone: '+421 900 111 222',
    email: 'kate@katebarber.sk',
    themeConfig,
  };

  const store = await db.store.upsert({
    where: { slug: 'kate-barber' },
    update: storeData,
    create: { slug: 'kate-barber', ...storeData },
  });
  console.log('✅ Store:', store.name);

  const categoryMap: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await db.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: cat.slug } },
      update: { nameKey: cat.nameKey, sortOrder: cat.sortOrder },
      create: { storeId: store.id, slug: cat.slug, nameKey: cat.nameKey, sortOrder: cat.sortOrder },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log('✅ Categories:', categoryData.length);

  for (const p of products) {
    await db.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: p.slug } },
      update: { price: p.price },
      create: {
        storeId: store.id,
        slug: p.slug,
        nameKey: p.nameKey,
        price: p.price,
        currency: 'EUR',
        inStock: true,
        isHit: (p as { isHit?: boolean }).isHit ?? false,
        isNew: (p as { isNew?: boolean }).isNew ?? false,
        rating: 0,
        reviewCount: 0,
        image: '/placeholder-product.svg',
        categoryId: categoryMap[p.category],
        metadata: (p as { metadata?: object }).metadata ?? null,
      },
    });
  }
  console.log('✅ Services:', products.length);

  for (const c of chairs) {
    await db.restaurantTable.upsert({
      where: { storeId_number: { storeId: store.id, number: c.number } },
      update: {},
      create: { storeId: store.id, ...c },
    });
  }
  console.log('✅ Chairs:', chairs.length);

  await db.deliveryZone.upsert({
    where: { id: 'kate-barber-walkin' },
    update: {},
    create: {
      id: 'kate-barber-walkin',
      storeId: store.id,
      name: 'Walk-in / Appointment',
      fee: 0,
      minOrder: 0,
      estimatedMin: 30,
      estimatedMax: 60,
      active: true,
    },
  });
  console.log('✅ Service zone');

  const galleryCount = await db.galleryImage.count({ where: { storeId: store.id } });
  if (galleryCount === 0) {
    for (let i = 0; i < 6; i++) {
      await db.galleryImage.create({
        data: { storeId: store.id, url: '/placeholder-product.svg', alt: `Kate Barber photo ${i + 1}`, sortOrder: i, active: true },
      });
    }
    console.log('✅ Gallery: 6 placeholders');
  }

  for (const t of testimonials) {
    const customer = await db.customer.upsert({
      where: { storeId_email: { storeId: store.id, email: t.email } },
      update: {},
      create: { storeId: store.id, email: t.email, name: t.name, isVerified: true },
    });
    const exists = await db.testimonial.findFirst({ where: { storeId: store.id, customerId: customer.id } });
    if (!exists) {
      await db.testimonial.create({
        data: { storeId: store.id, customerId: customer.id, text: t.text, rating: t.rating, status: 'APPROVED', locale: 'sk' },
      });
    }
  }
  console.log('✅ Testimonials:', testimonials.length);

  for (const e of knowledgeEntries) {
    const exists = await db.knowledgeEntry.findFirst({ where: { storeId: store.id, title: e.title } });
    if (!exists) {
      await db.knowledgeEntry.create({ data: { storeId: store.id, ...e } });
    }
  }
  console.log('✅ KnowledgeBase:', knowledgeEntries.length);

  const passwordHash = await bcrypt.hash('katebarber2026', 10);
  await db.adminUser.upsert({
    where: { email: 'admin@katebarber.sk' },
    update: {},
    create: { email: 'admin@katebarber.sk', name: 'Kate Admin', role: 'superadmin', passwordHash, storeId: store.id },
  });
  console.log('✅ Admin: admin@katebarber.sk');

  console.log('🎉 Kate Barber Studio seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); await pool.end(); });
