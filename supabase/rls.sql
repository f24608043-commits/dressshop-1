-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_form_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variation_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read categories
CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read brands
CREATE POLICY "Public can read brands" ON brands
  FOR SELECT USING (true);

-- Admins can manage brands
CREATE POLICY "Admins can manage brands" ON brands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read products
CREATE POLICY "Public can read products" ON products
  FOR SELECT USING (true);

-- Admins can manage products
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read product images
CREATE POLICY "Public can read product images" ON product_images
  FOR SELECT USING (true);

-- Admins can manage product images
CREATE POLICY "Admins can manage product images" ON product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read global forms
CREATE POLICY "Public can read global forms" ON global_forms
  FOR SELECT USING (true);

-- Admins can manage global forms
CREATE POLICY "Admins can manage global forms" ON global_forms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read global form options
CREATE POLICY "Public can read global form options" ON global_form_options
  FOR SELECT USING (true);

-- Admins can manage global form options
CREATE POLICY "Admins can manage global form options" ON global_form_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read product options
CREATE POLICY "Public can read product options" ON product_options
  FOR SELECT USING (true);

-- Admins can manage product options
CREATE POLICY "Admins can manage product options" ON product_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read product option values
CREATE POLICY "Public can read product option values" ON product_option_values
  FOR SELECT USING (true);

-- Admins can manage product option values
CREATE POLICY "Admins can manage product option values" ON product_option_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read product variations
CREATE POLICY "Public can read product variations" ON product_variations
  FOR SELECT USING (true);

-- Admins can manage product variations
CREATE POLICY "Admins can manage product variations" ON product_variations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read product variation values
CREATE POLICY "Public can read product variation values" ON product_variation_values
  FOR SELECT USING (true);

-- Admins can manage product variation values
CREATE POLICY "Admins can manage product variation values" ON product_variation_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can manage orders
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Users can read their own order items
CREATE POLICY "Users can read own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Admins can read all order items
CREATE POLICY "Admins can read all order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can manage order items
CREATE POLICY "Admins can manage order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read active coupons
CREATE POLICY "Public can read active coupons" ON coupons
  FOR SELECT USING (active = true);

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read approved reviews
CREATE POLICY "Public can read approved reviews" ON reviews
  FOR SELECT USING (approved = true);

-- Users can read their own reviews
CREATE POLICY "Users can read own reviews" ON reviews
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create reviews
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage reviews
CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read active deals
CREATE POLICY "Public can read active deals" ON deals
  FOR SELECT USING (active = true);

-- Admins can manage deals
CREATE POLICY "Admins can manage deals" ON deals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read deal products
CREATE POLICY "Public can read deal products" ON deal_products
  FOR SELECT USING (true);

-- Admins can manage deal products
CREATE POLICY "Admins can manage deal products" ON deal_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Anyone can create subscribers
CREATE POLICY "Anyone can create subscribers" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Admins can manage subscribers
CREATE POLICY "Admins can manage subscribers" ON subscribers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Anyone can create contact messages
CREATE POLICY "Anyone can create contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Admins can read contact messages
CREATE POLICY "Admins can read contact messages" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can manage contact messages
CREATE POLICY "Admins can manage contact messages" ON contact_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Public can read published blogs
CREATE POLICY "Public can read published blogs" ON blogs
  FOR SELECT USING (published = true);

-- Admins can manage blogs
CREATE POLICY "Admins can manage blogs" ON blogs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
