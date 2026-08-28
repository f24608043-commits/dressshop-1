import { PrismaClient, Role, ProductType, InputType, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Bridal & Jewellery E-Commerce Database Seeding...');

  // 1. Create Admin User
  const adminPasswordHash = await bcrypt.hash('Qasim.11', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'alexabraham587@gmail.com' },
    update: {
      role: Role.ADMIN,
      passwordHash: adminPasswordHash,
      name: 'Alex Abraham',
    },
    create: {
      email: 'alexabraham587@gmail.com',
      username: 'alexadmin',
      name: 'Alex Abraham',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      phone: '+1234567890',
      address: 'Bridal Couture Admin Suite 101',
      city: 'Mumbai',
      province: 'Maharashtra',
      postalCode: '400001',
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // 2. Create Demo Customer
  const customerPasswordHash = await bcrypt.hash('Customer.123', 10);
  const demoCustomer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      username: 'aashiraya',
      name: 'Aashi Raya',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      phone: '+919876543210',
      address: '74 Royal Palm Avenue',
      city: 'Delhi',
      province: 'Delhi',
      postalCode: '110001',
    },
  });
  console.log('✅ Customer user created:', demoCustomer.email);

  // 3. Create Bridal Brands / Designers
  const brandSabyasachi = await prisma.brand.upsert({
    where: { slug: 'sabyasachi-heritage' },
    update: {},
    create: { name: 'Sabyasachi Heritage', slug: 'sabyasachi-heritage' },
  });

  const brandManish = await prisma.brand.upsert({
    where: { slug: 'manish-couture' },
    update: {},
    create: { name: 'Manish Couture', slug: 'manish-couture' },
  });

  const brandRoyalJewels = await prisma.brand.upsert({
    where: { slug: 'royal-kundan-jewels' },
    update: {},
    create: { name: 'Royal Kundan Jewels', slug: 'royal-kundan-jewels' },
  });
  console.log('✅ Designer brands created');

  // 4. Create Categories
  const catLehengas = await prisma.category.upsert({
    where: { slug: 'bridal-lehengas' },
    update: {},
    create: {
      name: 'Bridal Lehengas',
      slug: 'bridal-lehengas',
      description: 'Hand-embroidered Zardozi & Velvet Bridal Lehengas for Weddings & Receptions',
      heroBannerImageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200',
    },
  });

  const catSarees = await prisma.category.upsert({
    where: { slug: 'sarees-and-drapes' },
    update: {},
    create: {
      name: 'Sarees & Drapes',
      slug: 'sarees-and-drapes',
      description: 'Pure Kanjivaram Silks, Organza Drapes, and Heavy Embroidered Net Sarees',
      heroBannerImageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1200',
    },
  });

  const catSalwar = await prisma.category.upsert({
    where: { slug: 'salwar-kameez' },
    update: {},
    create: {
      name: 'Salwar Kameez & Anarkalis',
      slug: 'salwar-kameez',
      description: 'Floor-length Anarkalis, Royal Shararas, and Peplum Kurti Sets',
      heroBannerImageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200',
    },
  });

  const catJewellery = await prisma.category.upsert({
    where: { slug: 'bridal-jewellery' },
    update: {},
    create: {
      name: 'Bridal Jewellery',
      slug: 'bridal-jewellery',
      description: 'Handcrafted Kundan, Polki, Pearl Chokers, Matha Patti, and Heavy Earrings',
      heroBannerImageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200',
    },
  });
  console.log('✅ Bridal categories created');

  // 5. Create Reusable Global Form Options (Hierarchical Structure)
  const globalBridalForm = await prisma.globalForm.upsert({
    where: { id: 'global-bridal-customization-form' },
    update: {},
    create: {
      id: 'global-bridal-customization-form',
      name: 'Bridal Dress Customization & Add-Ons Configurator',
      description: 'Global customization form supporting Stitching Options, Can-Can add-ons, and Accessories Package',
      active: true,
    },
  });

  // Clean old options for global form
  await prisma.globalFormOption.deleteMany({
    where: { globalFormId: globalBridalForm.id },
  });

  // Parent Option 1: Stitching Style (Radio group)
  const optStitching = await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      title: 'Stitching & Fit Type',
      price: 0,
      enabled: true,
      inputType: InputType.RADIO,
      displayOrder: 1,
      description: 'Choose your desired tailoring style',
    },
  });

  const subOptReady = await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      parentId: optStitching.id,
      title: 'Ready To Wear (Standard Sizes 32 - 52)',
      price: 24,
      enabled: true,
      inputType: InputType.RADIO,
      description: 'Stitching according to standard size charts. Delivered in 7 days.',
      displayOrder: 1,
    },
  });

  const subOptMeasure = await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      parentId: optStitching.id,
      title: 'Made To Measure (Custom Tailored Fit)',
      price: 36,
      enabled: true,
      inputType: InputType.RADIO,
      description: 'Our master artisan will record your custom waist, choli length, & bust measurements.',
      displayOrder: 2,
    },
  });

  const subOptUnstitched = await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      parentId: optStitching.id,
      title: 'Unstitched Fabric (DIY Custom Tailoring)',
      price: 0,
      enabled: true,
      inputType: InputType.RADIO,
      description: 'Includes raw unstitched fabric rolls with pre-worked embroidery borders.',
      displayOrder: 3,
    },
  });

  // Parent Option 2: Add-On Customizations (Checkboxes)
  const optAddons = await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      title: 'Add-On Enhancements',
      price: 0,
      enabled: true,
      inputType: InputType.CHECKBOX,
      displayOrder: 2,
      description: 'Add extra flair and flare to your dress',
    },
  });

  const addOnCanCan = await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      parentId: optAddons.id,
      title: 'Detachable Double Can-Can Layer',
      price: 13,
      imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=400',
      enabled: true,
      inputType: InputType.CHECKBOX,
      description: 'Adds extra dramatic ballgown flair to the lehenga skirt.',
      displayOrder: 1,
    },
  });

  const addOnShapewear = await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      parentId: optAddons.id,
      title: 'Seamless Saree/Lehenga Shapewear Petticoat',
      price: 7,
      imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=400',
      enabled: true,
      inputType: InputType.CHECKBOX,
      description: 'Mermaid shapewear skirt with comfortable elastic waist.',
      displayOrder: 2,
    },
  });

  // Parent Option 3: Matching Accessories Package (Nested Parent-Child Checkbox tree)
  const optAccPackage = await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      title: 'Matching Accessories Package',
      price: 0,
      enabled: true,
      inputType: InputType.CHECKBOX,
      description: 'Select matching accessories handcrafted for this ensemble',
      displayOrder: 3,
    },
  });

  // Child Options under Accessories Package
  await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      parentId: optAccPackage.id,
      title: 'Matching Kundan & Pearl Choker Necklace',
      price: 45,
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400',
      enabled: true,
      inputType: InputType.CHECKBOX,
      description: '24k Gold-plated Kundan choker with ruby red stone drops.',
      displayOrder: 1,
    },
  });

  await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      parentId: optAccPackage.id,
      title: 'Heavy Enamel Jhumka Earrings',
      price: 25,
      imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400',
      enabled: true,
      inputType: InputType.CHECKBOX,
      description: 'Traditional heavy ear drops matching outfit embroidery.',
      displayOrder: 2,
    },
  });

  await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      parentId: optAccPackage.id,
      title: 'Zari Embroidered Velvet Potli Bag',
      price: 18,
      imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=400',
      enabled: true,
      inputType: InputType.CHECKBOX,
      description: 'Drawstring velvet clutch bag with pearl tassels.',
      displayOrder: 3,
    },
  });

  await prisma.globalFormOption.create({
    data: {
      globalFormId: globalBridalForm.id,
      parentId: optAccPackage.id,
      title: 'Heavy Double Stole / Dupatta',
      price: 30,
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400',
      enabled: true,
      inputType: InputType.CHECKBOX,
      description: 'Second sheer organza veil dupatta with golden zari border.',
      displayOrder: 4,
    },
  });

  console.log('✅ Global Form with Hierarchical Options & Images Created');

  // 6. Create Featured Bridal Dress Product 1 (Variable Product: Elegant Maroon Faux Georgette Embroidered Lehenga)
  const productMaroonLehenga = await prisma.product.upsert({
    where: { slug: 'elegant-maroon-faux-georgette-embroidered-sequins-lehenga' },
    update: {},
    create: {
      name: 'Elegant Maroon Faux Georgette Embroidered Sequins A-Line Lehenga Wedding Wear',
      slug: 'elegant-maroon-faux-georgette-embroidered-sequins-lehenga',
      description: 'This A-Line Lehenga in maroon presents a graceful festive silhouette designed for elegant celebrations. Crafted in faux georgette, the ensemble reflects fluid movement with lightweight feel. The surface is enriched with detailed embroidery and sequins.',
      shortDescription: 'Maroon Faux Georgette Peplum Choli & Sequins Embroidered A-Line Lehenga.',
      basePrice: 78,
      originalPrice: 145,
      productType: ProductType.VARIABLE,
      featured: true,
      categoryId: catLehengas.id,
      brandId: brandSabyasachi.id,
      globalFormId: globalBridalForm.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800', altText: 'Maroon Bridal Lehenga Main Front', order: 1 },
          { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800', altText: 'Peplum Blouse Detail', order: 2 },
          { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800', altText: 'Dupatta & Embroidery Close-Up', order: 3 },
        ],
      },
    },
  });

  // Create Product Options for Maroon Lehenga (Color & Size)
  const optColor = await prisma.productOption.create({
    data: {
      name: 'Color Variant',
      inputType: InputType.COLOR_PICKER,
      productId: productMaroonLehenga.id,
      values: {
        create: [
          { value: 'Royal Maroon', priceAdjustment: 0 },
          { value: 'Navy Blue', priceAdjustment: 0 },
          { value: 'Hot Pink', priceAdjustment: 0 },
          { value: 'Emerald Green', priceAdjustment: 0 },
        ],
      },
    },
    include: { values: true },
  });

  const optSize = await prisma.productOption.create({
    data: {
      name: 'Bust Size',
      inputType: InputType.BUTTON_GROUP,
      productId: productMaroonLehenga.id,
      values: {
        create: [
          { value: '34', priceAdjustment: 0 },
          { value: '36', priceAdjustment: 0 },
          { value: '38', priceAdjustment: 0 },
          { value: '40', priceAdjustment: 0 },
          { value: '42', priceAdjustment: 5 },
          { value: '44', priceAdjustment: 5 },
        ],
      },
    },
    include: { values: true },
  });

  // Generate Variations for Maroon Lehenga
  for (const cVal of optColor.values) {
    for (const sVal of optSize.values) {
      const price = 78 + Number(sVal.priceAdjustment);
      const sku = `LHG-${cVal.value.substring(0, 3)}-${sVal.value}`.toUpperCase().replace(/\s+/g, '');
      await prisma.productVariation.create({
        data: {
          productId: productMaroonLehenga.id,
          sku,
          price,
          stock: 15,
          values: {
            create: [
              { optionValueId: cVal.id },
              { optionValueId: sVal.id },
            ],
          },
        },
      });
    }
  }

  // 7. Product 2: Royal Gold Kundan Choker Jewellery Set
  await prisma.product.upsert({
    where: { slug: 'royal-kundan-pearl-bridal-choker-set' },
    update: {},
    create: {
      name: 'Royal Kundan & Freshwater Pearl Bridal Choker Set with Earrings',
      slug: 'royal-kundan-pearl-bridal-choker-set',
      description: 'Handcrafted by royal master goldsmiths using authentic Meenakari enamel and uncut Kundan stones lined with real freshwater cultured pearls.',
      shortDescription: 'Regal 24K gold-plated Kundan choker with matching heavy ear drapes.',
      basePrice: 120,
      originalPrice: 195,
      productType: ProductType.SIMPLE,
      stock: 8,
      featured: true,
      categoryId: catJewellery.id,
      brandId: brandRoyalJewels.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800', altText: 'Kundan Choker Set Front', order: 1 },
          { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800', altText: 'Jhumka Earrings Detail', order: 2 },
        ],
      },
    },
  });

  // 8. Product 3: Rose Pink Sequins Embroidered Organza Saree
  await prisma.product.upsert({
    where: { slug: 'rose-pink-sequins-embroidered-organza-saree' },
    update: {},
    create: {
      name: 'Rose Pink Hand-Embroidered Organza Silk Saree with Blouse Piece',
      slug: 'rose-pink-sequins-embroidered-organza-saree',
      description: 'Graceful floral motifs embroidered in silver zari and micro sequins on lightweight organza silk. Comes with a unstitched heavy raw silk blouse piece.',
      shortDescription: 'Rose Pink Organza Silk Saree with silver Zari and micro-sequins.',
      basePrice: 92,
      originalPrice: 160,
      productType: ProductType.SIMPLE,
      stock: 12,
      featured: true,
      categoryId: catSarees.id,
      brandId: brandManish.id,
      globalFormId: globalBridalForm.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800', altText: 'Organza Saree Front View', order: 1 },
        ],
      },
    },
  });

  // 9. Create Coupons
  await prisma.coupon.upsert({
    where: { code: 'BRIDAL10' },
    update: { discountValue: 10, minOrderValue: 50 },
    create: {
      code: 'BRIDAL10',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minOrderValue: 50,
      active: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'ROYAL20' },
    update: { discountValue: 20, minOrderValue: 100 },
    create: {
      code: 'ROYAL20',
      discountType: DiscountType.FIXED,
      discountValue: 20,
      minOrderValue: 100,
      active: true,
    },
  });

  console.log('✅ Coupons created');
  console.log('🎉 Bridal & Jewellery Store seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
