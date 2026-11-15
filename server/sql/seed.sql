INSERT INTO users (name, email, role) VALUES
  ('Admin Central', 'admin@parkly.local', 'Administrador'),
  ('Sofía Hernández', 'sofia@parkly.local', 'Operador'),
  ('Luis Ramírez', 'luis@parkly.local', 'Cajero')
ON CONFLICT (email) DO NOTHING;

INSERT INTO clients (name, phone, email, agreement, monthly_fee, monthly_until) VALUES
  ('María Fernanda López', '555 018 2440', 'maria.lopez@email.com', 'Mensualidad individual', 1450, CURRENT_DATE + INTERVAL '30 days'),
  ('Carlos Mendoza Ruiz', '555 013 8702', 'c.mendoza@email.com', 'Convenio individual', 1450, CURRENT_DATE + INTERVAL '14 days'),
  ('Andrea Salas', '555 019 5401', 'andrea.salas@email.com', 'Mensualidad individual', 1600, CURRENT_DATE - INTERVAL '4 days'),
  ('Grupo Cobalto', '555 010 8891', 'flotilla@cobalto.com', 'Convenio flotilla', 5200, CURRENT_DATE + INTERVAL '35 days')
ON CONFLICT DO NOTHING;

INSERT INTO vehicles (plate, brand, model, color, vehicle_type, client_id) VALUES
  ('ABC-123-A', 'Toyota', 'Corolla', 'Gris', 'Auto', (SELECT id FROM clients WHERE name = 'María Fernanda López')),
  ('JKL-456-B', 'Honda', 'CB 190', 'Negro', 'Moto', (SELECT id FROM clients WHERE name = 'Carlos Mendoza Ruiz')),
  ('MNO-789-C', 'Nissan', 'NP300', 'Blanco', 'Camioneta', (SELECT id FROM clients WHERE name = 'Grupo Cobalto')),
  ('XYZ-552-D', 'Mazda', '3', 'Rojo', 'Auto', NULL)
ON CONFLICT (plate) DO NOTHING;

INSERT INTO parking_spaces (code, floor, sector, space_type) VALUES
  ('A-01', 'Piso 1', 'A', 'General'), ('A-02', 'Piso 1', 'A', 'General'),
  ('A-03', 'Piso 1', 'A', 'General'), ('A-04', 'Piso 1', 'A', 'General'),
  ('A-05', 'Piso 1', 'A', 'General'), ('A-06', 'Piso 1', 'A', 'General'),
  ('A-07', 'Piso 1', 'A', 'General'), ('A-08', 'Piso 1', 'A', 'General'),
  ('A-09', 'Piso 1', 'A', 'Moto'), ('A-10', 'Piso 1', 'A', 'Accesible')
ON CONFLICT (code) DO NOTHING;