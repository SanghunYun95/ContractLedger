const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: dbPath,
  });

  await dataSource.initialize();
  console.log('DB initialized');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  // Create/Update tenant
  await queryRunner.query(`
    INSERT OR IGNORE INTO tenants (id, name, createdAt) 
    VALUES ('tenant-a', 'Acme Corp', CURRENT_TIMESTAMP)
  `);
  
  const tenants = await queryRunner.query(`SELECT id FROM tenants WHERE name = 'Acme Corp'`);
  if (!tenants || tenants.length === 0) {
    throw new Error('Tenant Acme Corp not found. Ensure the INSERT executed correctly.');
  }
  const tenantId = tenants[0].id;
  console.log('Tenant ID:', tenantId);

  // Create/Update user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const existingUser = await queryRunner.query(`SELECT id FROM users WHERE email = 'admin@acme.com'`);
  
  if (existingUser.length === 0) {
    await queryRunner.query(`
      INSERT INTO users (id, email, password, tenantId, createdAt) 
      VALUES ('admin-user-uuid', 'admin@acme.com', ?, ?, CURRENT_TIMESTAMP)
    `, [hashedPassword, tenantId]);
    console.log('Created user admin@acme.com');
  } else {
    await queryRunner.query(`
      UPDATE users SET password = ?, tenantId = ? WHERE email = 'admin@acme.com'
    `, [hashedPassword, tenantId]);
    console.log('Updated user admin@acme.com');
  }

  await queryRunner.release();
  await dataSource.destroy();
}

seed().catch(err => console.error(err));
