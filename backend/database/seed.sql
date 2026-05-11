USE smart_inventory;

-- ---- Users ----
-- Replace the two hashes below with the output from your bcrypt one-liner
-- Plain passwords: Admin@123 and Staff@123
INSERT INTO users (name, email, password_hash, role) VALUES
  ('System Admin', 'admin@inventory.local', '4b6aa25db23609a78fc4f9d2e0744f0e7bc2a0568b58d3e643fb47b60feee4453c5904585a044531a58b1b0531263db8', 'admin'),
  ('Jane Staff',   'staff@inventory.local', '4b6aa25db23609a78fc4f9d2e0744f0e7bc2a0568b58d3e643fb47b60feee4453c5904585a044531a58b1b0531263db8cd', 'staff');

-- ---- Categories ----
INSERT INTO categories (name, description) VALUES
  ('Stationery',  'Pens, paper, notebooks'),
  ('Electronics', 'Computers, projectors, accessories'),
  ('Furniture',   'Desks, chairs, shelves'),
  ('Cleaning',    'Cleaning supplies and equipment');

-- ---- Suppliers ----
INSERT INTO suppliers (name, contact, phone, email) VALUES
  ('OfficePro Sdn Bhd',  'Mr. Tan',   '+60-12-3456789', 'sales@officepro.example'),
  ('TechWorld Supplies', 'Ms. Aisha', '+60-11-2233445', 'orders@techworld.example');

-- ---- Products ----
INSERT INTO products (sku, name, description, category_id, unit, unit_price, current_stock, low_stock_threshold) VALUES
  ('STN-001', 'Blue Ballpoint Pen',    '0.7mm blue ink',        1, 'pcs', 1.20,  150, 50),
  ('STN-002', 'A4 Notebook 80 pages',  'Spiral-bound',          1, 'pcs', 4.50,    8, 20),
  ('ELE-001', 'HDMI Cable 2m',         '4K-ready',              2, 'pcs', 15.00,  25, 10),
  ('ELE-002', 'Wireless Mouse',        'USB receiver included', 2, 'pcs', 35.00,   3, 10),
  ('FUR-001', 'Student Chair',         'Plastic, stackable',    3, 'pcs', 75.00,  40, 15),
  ('CLN-001', 'Floor Cleaner 5L',      'Lemon-scented',         4, 'btl', 22.00,  12, 10);