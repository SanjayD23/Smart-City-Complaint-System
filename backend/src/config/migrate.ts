import pool from './database';

const createTables = async () => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create users table
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('citizen', 'admin', 'officer')),
        department_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create departments table
        await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create complaints table
        await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        citizen_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(500),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'rejected')),
        department_id INTEGER REFERENCES departments(id),
        officer_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create complaint_updates table
        await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_updates (
        id SERIAL PRIMARY KEY,
        complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
        officer_id INTEGER REFERENCES users(id),
        status VARCHAR(50) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create indexes for better performance
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
      CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department_id);
      CREATE INDEX IF NOT EXISTS idx_complaints_officer ON complaints(officer_id);
      CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

        // Insert default departments
        await client.query(`
      INSERT INTO departments (name, description) VALUES
        ('Water Supply', 'Issues related to water supply and drainage'),
        ('Road Maintenance', 'Road repairs, potholes, and street lighting'),
        ('Waste Management', 'Garbage collection and sanitation'),
        ('Electricity', 'Power supply and electrical issues'),
        ('Public Safety', 'Safety concerns and law enforcement')
      ON CONFLICT (name) DO NOTHING;
    `);

        // Create a default admin user (password: admin123)
        await client.query(`
      INSERT INTO users (email, password_hash, name, role) VALUES
        ('admin@smartcity.com', '$2b$10$rKvVJZ3YqXqJ9YqXqJ9YqOZJ9YqXqJ9YqXqJ9YqXqJ9YqXqJ9YqXq', 'System Admin', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);

        await client.query('COMMIT');
        console.log('✅ Database tables created successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating tables:', error);
        throw error;
    } finally {
        client.release();
    }
};

export default createTables;
