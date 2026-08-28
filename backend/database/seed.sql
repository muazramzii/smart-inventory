USE smart_inventory;

-- ---- Users ----
-- Plain passwords: Admin@123 and Staff@123
INSERT INTO users (name, email, password_hash, role) VALUES
  ('System Admin', 'admin@inventory.local', '$2a$10$VyjL81vi4LaTUshdom3x2e0yUhGkr6l7vVQ89C.ySS0UZzYn2AVSq', 'admin'),
  ('Jane Staff',   'staff@inventory.local', '$2a$10$ew4LW10W7/v6PxXa6k6JO.FQWznBMTA36Cg3wM2A.DellcJPbDeju', 'staff');

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