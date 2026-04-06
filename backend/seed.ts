import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tenant } from './src/domain/tenant.entity';
import { User } from './src/domain/user.entity';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const tenantRepo = app.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  // Create Tenant A
  const tenantId = 'tenant-a';
  let tenant = await tenantRepo.findOne({ where: { id: tenantId } });
  if (!tenant) {
    tenant = tenantRepo.create({ id: tenantId, name: 'Acme Corp' });
    await tenantRepo.save(tenant);
    console.log('--- SEED: Tenant A created');
  } else {
    console.log('--- SEED: Tenant A already exists');
  }

  // Create Admin User
  const email = 'admin@acme.com';
  let admin = await userRepo.findOne({ where: { email } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    admin = userRepo.create({
      email,
      password: hashedPassword,
      tenantId: tenantId
    });
    await userRepo.save(admin);
    console.log('--- SEED: Admin user created');
  } else {
    console.log('--- SEED: Admin user already exists');
  }

  await app.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('--- SEED: Failed', err);
  process.exit(1);
});
