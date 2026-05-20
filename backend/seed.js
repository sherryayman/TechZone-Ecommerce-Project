const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const products = [
  {
    name: 'iPhone 15 Pro Max',
    description: 'أقوى آيفون على الإطلاق مع شريحة A17 Pro وكاميرا 48MP وشاشة Super Retina XDR بحجم 6.7 إنش',
    price: 54999, originalPrice: 59999,
    category: 'iPhone', brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
    ],
    stock: 25, rating: 4.8, numReviews: 124,
    featured: true, isNew: true,
    specifications: {
      'الشاشة': '6.7 إنش Super Retina XDR',
      'المعالج': 'Apple A17 Pro',
      'الكاميرا': '48MP + 12MP + 12MP',
      'البطارية': '4422 mAh',
      'التخزين': '256GB',
      'نظام التشغيل': 'iOS 17',
    },
  },
  {
    name: 'iPhone 15',
    description: 'آيفون 15 بتصميم مُعاد تصوره مع Dynamic Island وكاميرا 48MP وبطارية تدوم طويلاً',
    price: 39999, originalPrice: 42999,
    category: 'iPhone', brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
    stock: 40, rating: 4.6, numReviews: 89, featured: true,
    specifications: {
      'الشاشة': '6.1 إنش OLED',
      'المعالج': 'Apple A16 Bionic',
      'الكاميرا': '48MP + 12MP',
      'البطارية': '3877 mAh',
      'التخزين': '128GB',
    },
  },
  {
    name: 'iPad Pro 12.9" M2',
    description: 'آيباد برو بشاشة Liquid Retina XDR بحجم 12.9 إنش ومعالج Apple M2 لأداء استثنائي',
    price: 44999, originalPrice: 47999,
    category: 'iPad', brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
    stock: 18, rating: 4.9, numReviews: 67, featured: true,
    specifications: {
      'الشاشة': '12.9 إنش Liquid Retina XDR',
      'المعالج': 'Apple M2',
      'التخزين': '256GB',
      'الاتصال': 'Wi-Fi + Cellular',
      'الكاميرا': '12MP Wide + 10MP Ultra Wide',
    },
  },
  {
    name: 'iPad Air M1',
    description: 'آيباد إير بمعالج M1 القوي وشاشة Liquid Retina 10.9 إنش بألوان زاهية',
    price: 28999, originalPrice: 31999,
    category: 'iPad', brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500',
    stock: 30, rating: 4.7, numReviews: 92, featured: false,
    specifications: {
      'الشاشة': '10.9 إنش Liquid Retina',
      'المعالج': 'Apple M1',
      'التخزين': '64GB',
      'الكاميرا': '12MP',
    },
  },
  {
    name: 'MacBook Pro 14" M3 Pro',
    description: 'ماك بوك برو بمعالج M3 Pro وشاشة Liquid Retina XDR للمهندسين والمصممين',
    price: 89999, originalPrice: 94999,
    category: 'MacBook', brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    stock: 12, rating: 4.9, numReviews: 45,
    featured: true, isNew: true,
    specifications: {
      'الشاشة': '14.2 إنش Liquid Retina XDR',
      'المعالج': 'Apple M3 Pro',
      'الذاكرة': '18GB',
      'التخزين': '512GB SSD',
      'البطارية': '22 ساعة',
    },
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'أقوى هاتف سامسونج بمعالج Snapdragon 8 Gen 3 وقلم S Pen وكاميرا 200MP',
    price: 49999, originalPrice: 54999,
    category: 'Android', brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
    stock: 20, rating: 4.7, numReviews: 78,
    featured: true, isNew: true,
    specifications: {
      'الشاشة': '6.8 إنش Dynamic AMOLED',
      'المعالج': 'Snapdragon 8 Gen 3',
      'الكاميرا': '200MP + 12MP + 10MP + 10MP',
      'البطارية': '5000 mAh',
      'التخزين': '256GB',
    },
  },
  {
    name: 'Samsung Galaxy Tab S9 Ultra',
    description: 'تابلت سامسونج الرائد بشاشة AMOLED 14.6 إنش وأداء خارق مع S Pen',
    price: 38999, originalPrice: 41999,
    category: 'Tablet', brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=500',
    stock: 15, rating: 4.6, numReviews: 53, featured: false,
    specifications: {
      'الشاشة': '14.6 إنش Dynamic AMOLED',
      'المعالج': 'Snapdragon 8 Gen 2',
      'الذاكرة': '12GB RAM',
      'التخزين': '256GB',
      'S Pen': 'مضمن',
    },
  },
  {
    name: 'Apple Watch Series 9',
    description: 'ساعة أبل الذكية بشاشة Always-On ومعالج S9 وميزة Double Tap الجديدة',
    price: 15999, originalPrice: 17999,
    category: 'Smartwatch', brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500',
    stock: 35, rating: 4.8, numReviews: 110,
    featured: false, isNew: true,
    specifications: {
      'الشاشة': 'Retina LTPO OLED',
      'المعالج': 'Apple S9',
      'مقاومة الماء': 'IP6X + WR50',
      'مستشعرات': 'ECG، نبضات، أكسجين الدم',
    },
  },
  {
    name: 'AirPods Pro 2nd Gen',
    description: 'سماعات آير بودز برو الجيل الثاني مع إلغاء ضوضاء H2 المحسّن وصوت Spatial Audio',
    price: 9999, originalPrice: 11499,
    category: 'Accessories', brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500',
    stock: 50, rating: 4.7, numReviews: 200, featured: false,
    specifications: {
      'المعالج': 'Apple H2',
      'إلغاء الضوضاء': 'نعم - ANC متطور',
      'مدة البطارية': '30 ساعة مع العلبة',
      'المقاومة': 'IPX4',
    },
  },
  {
    name: 'Dell XPS 15 OLED',
    description: 'لابتوب ديل XPS بشاشة OLED 15.6 إنش 4K ومعالج Intel Core i9 لأداء احترافي',
    price: 69999, originalPrice: 74999,
    category: 'Laptop', brand: 'Dell',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500',
    stock: 8, rating: 4.5, numReviews: 38, featured: false,
    specifications: {
      'الشاشة': '15.6 إنش OLED 4K',
      'المعالج': 'Intel Core i9-13900H',
      'الذاكرة': '32GB DDR5',
      'التخزين': '1TB SSD',
      'كارت الشاشة': 'NVIDIA RTX 4060',
    },
  },
  {
    name: 'iPhone 14 Pro',
    description: 'آيفون 14 برو مع Dynamic Island وكاميرا 48MP وشريحة A16 Bionic',
    price: 34999, originalPrice: 39999,
    category: 'iPhone', brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1667232928006-40c716c10b87?w=500',
    stock: 30, rating: 4.6, numReviews: 156, featured: false,
    specifications: {
      'الشاشة': '6.1 إنش Super Retina XDR',
      'المعالج': 'Apple A16 Bionic',
      'الكاميرا': '48MP + 12MP + 12MP',
      'التخزين': '128GB',
    },
  },
  {
    name: 'Samsung Galaxy A54',
    description: 'هاتف سامسونج متوسط الفئة بكاميرا 50MP وشاشة Super AMOLED وبطارية 5000mAh',
    price: 12999, originalPrice: 14999,
    category: 'Android', brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500',
    stock: 45, rating: 4.3, numReviews: 95, featured: false,
    specifications: {
      'الشاشة': '6.4 إنش Super AMOLED',
      'المعالج': 'Exynos 1380',
      'الكاميرا': '50MP + 12MP + 5MP',
      'البطارية': '5000 mAh',
      'التخزين': '128GB',
    },
  },
];

async function seed() {
  if (!process.env.JWT_SECRET) {
    console.warn('⚠ JWT_SECRET is not set. The seed will still run, but the server will refuse to start without it.');
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/electronics-store');
  console.log('Connected to MongoDB');

  await User.deleteMany();
  await Product.deleteMany();

  // Create users one by one so the pre('save') hook hashes their passwords
  await User.create({
    name: 'Admin',
    email: 'admin@techstore.com',
    password: 'admin123',
    role: 'admin',
  });
  await User.create({
    name: 'Ahmed Mohamed',
    email: 'ahmed@example.com',
    password: 'password123',
    role: 'user',
  });

  // Use create() so schema validation runs and Map fields are normalized
  await Product.create(products);

  console.log('✅ Data seeded successfully!');
  console.log('👤 Admin: admin@techstore.com / admin123');
  console.log('👤 User:  ahmed@example.com / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
