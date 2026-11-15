-- Ejecutar conectado a la base estacionamiento.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  role VARCHAR(30) NOT NULL CHECK (role IN ('Administrador', 'Operador', 'Cajero')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(160),
  agreement VARCHAR(160),
  monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (monthly_fee >= 0),
  monthly_until DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS agreement VARCHAR(160);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  plate VARCHAR(16) NOT NULL UNIQUE,
  brand VARCHAR(70) NOT NULL,
  model VARCHAR(70) NOT NULL,
  color VARCHAR(40),
  vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('Auto', 'Moto', 'Camioneta')),
  client_id INTEGER REFERENCES clients(id) ON DELETE RESTRICT,
  visitor_name VARCHAR(140),
  image_data TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_data TEXT;

CREATE TABLE IF NOT EXISTS parking_spaces (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  floor VARCHAR(40) NOT NULL,
  sector VARCHAR(40) NOT NULL,
  space_type VARCHAR(20) NOT NULL CHECK (space_type IN ('General', 'Accesible', 'Moto')),
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operations (
  id SERIAL PRIMARY KEY,
  ticket_code VARCHAR(24) NOT NULL UNIQUE,
  plate VARCHAR(16) NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  space_id INTEGER NOT NULL REFERENCES parking_spaces(id) ON DELETE RESTRICT,
  entry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exit_at TIMESTAMPTZ,
  amount NUMERIC(10, 2) CHECK (amount IS NULL OR amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  operation_id INTEGER REFERENCES operations(id) ON DELETE RESTRICT,
  plate VARCHAR(16),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  method VARCHAR(20) NOT NULL CHECK (method IN ('Efectivo', 'QR')),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_client ON vehicles(client_id);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON parking_spaces(status, is_active);
CREATE INDEX IF NOT EXISTS idx_operations_entry ON operations(entry_at DESC);
CREATE INDEX IF NOT EXISTS idx_operations_active_plate ON operations(UPPER(plate)) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);

INSERT INTO users (name, email, role) VALUES
  ('Admin Central', 'admin@parkly.local', 'Administrador'),
  ('Sofía Hernández', 'sofia@parkly.local', 'Operador'),
  ('Luis Ramírez', 'luis@parkly.local', 'Cajero')
ON CONFLICT (email) DO NOTHING;

INSERT INTO clients (name, phone, email, agreement, monthly_fee, monthly_until)
SELECT seed.name, seed.phone, seed.email, seed.agreement, seed.monthly_fee, seed.monthly_until
FROM (VALUES
  ('María Fernanda López', '555 018 2440', 'maria.lopez@email.com', 'Mensualidad individual', 1450::NUMERIC, CURRENT_DATE + INTERVAL '30 days'),
  ('Carlos Mendoza Ruiz', '555 013 8702', 'c.mendoza@email.com', 'Convenio individual', 1450::NUMERIC, CURRENT_DATE + INTERVAL '14 days'),
  ('Andrea Salas', '555 019 5401', 'andrea.salas@email.com', 'Mensualidad individual', 1600::NUMERIC, CURRENT_DATE - INTERVAL '4 days'),
  ('Grupo Cobalto', '555 010 8891', 'flotilla@cobalto.com', 'Convenio flotilla', 5200::NUMERIC, CURRENT_DATE + INTERVAL '35 days')
) AS seed(name, phone, email, agreement, monthly_fee, monthly_until)
WHERE NOT EXISTS (SELECT 1 FROM clients existing WHERE existing.name = seed.name);

INSERT INTO vehicles (plate, brand, model, color, vehicle_type, client_id) VALUES
  ('ABC-123-A', 'Toyota', 'Corolla', 'Gris', 'Auto', (SELECT id FROM clients WHERE name = 'María Fernanda López' ORDER BY id LIMIT 1)),
  ('JKL-456-B', 'Honda', 'CB 190', 'Negro', 'Moto', (SELECT id FROM clients WHERE name = 'Carlos Mendoza Ruiz' ORDER BY id LIMIT 1)),
  ('MNO-789-C', 'Nissan', 'NP300', 'Blanco', 'Camioneta', (SELECT id FROM clients WHERE name = 'Grupo Cobalto' ORDER BY id LIMIT 1)),
  ('XYZ-552-D', 'Mazda', '3', 'Rojo', 'Auto', NULL)
ON CONFLICT (plate) DO NOTHING;

INSERT INTO parking_spaces (code, floor, sector, space_type) VALUES
  ('A-01', 'Piso 1', 'A', 'General'), ('A-02', 'Piso 1', 'A', 'General'),
  ('A-03', 'Piso 1', 'A', 'General'), ('A-04', 'Piso 1', 'A', 'General'),
  ('A-05', 'Piso 1', 'A', 'General'), ('A-06', 'Piso 1', 'A', 'General'),
  ('A-07', 'Piso 1', 'A', 'General'), ('A-08', 'Piso 1', 'A', 'General'),
  ('A-09', 'Piso 1', 'A', 'Moto'), ('A-10', 'Piso 1', 'A', 'Accesible')
ON CONFLICT (code) DO NOTHING;