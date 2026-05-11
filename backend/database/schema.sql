-- ============================================================================
-- Smart Inventory Management System — Database Schema
-- MySQL 8.x
-- ============================================================================

DROP DATABASE IF EXISTS smart_inventory;
CREATE DATABASE smart_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_inventory;

-- ----------------------------------------------------------------------------
-- 1. USERS — Login credentials and roles
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)        NOT NULL,
  email         VARCHAR(150)        NOT NULL UNIQUE,
  password_hash VARCHAR(255)        NOT NULL,
  role          ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  is_active     BOOLEAN             NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_users_email (email),
  INDEX idx_users_role  (role)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. SUPPLIERS
-- ----------------------------------------------------------------------------
CREATE TABLE suppliers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  contact    VARCHAR(150) DEFAULT NULL,
  phone      VARCHAR(30)  DEFAULT NULL,
  email      VARCHAR(150) DEFAULT NULL,
  address    TEXT         DEFAULT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. PRODUCTS
-- ----------------------------------------------------------------------------
CREATE TABLE products (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku                 VARCHAR(50)  NOT NULL UNIQUE,
  name                VARCHAR(150) NOT NULL,
  description         TEXT         DEFAULT NULL,
  category_id         INT UNSIGNED DEFAULT NULL,
  unit                VARCHAR(20)  NOT NULL DEFAULT 'pcs',
  unit_price          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  current_stock       INT          NOT NULL DEFAULT 0,
  low_stock_threshold INT          NOT NULL DEFAULT 10,
  is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX idx_products_name      (name),
  INDEX idx_products_sku       (sku),
  INDEX idx_products_category  (category_id),
  INDEX idx_products_active    (is_active),
  INDEX idx_products_low_stock (current_stock, low_stock_threshold)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. TRANSACTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE transactions (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  supplier_id INT UNSIGNED DEFAULT NULL,
  type        ENUM('IN','OUT') NOT NULL,
  quantity    INT          NOT NULL CHECK (quantity > 0),
  unit_price  DECIMAL(12,2) DEFAULT NULL,
  note        VARCHAR(255) DEFAULT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_tx_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_tx_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_tx_supplier
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX idx_tx_product (product_id),
  INDEX idx_tx_user    (user_id),
  INDEX idx_tx_type    (type),
  INDEX idx_tx_created (created_at)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED DEFAULT NULL,
  action     VARCHAR(50)  NOT NULL,
  entity     VARCHAR(50)  DEFAULT NULL,
  entity_id  VARCHAR(50)  DEFAULT NULL,
  details    JSON         DEFAULT NULL,
  ip_address VARCHAR(45)  DEFAULT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_audit_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX idx_audit_user    (user_id),
  INDEX idx_audit_action  (action),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;