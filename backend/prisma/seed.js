import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const admin = await prisma.user.create({
    data: {
      name: 'Ibrahim Admin',
      email: 'admin@alphacrm.com',
      passwordHash: 'placeholder_hash_phase4',
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Sarah Manager',
      email: 'sarah@alphacrm.com',
      passwordHash: 'placeholder_hash_phase4',
      role: 'MANAGER',
    },
  });

  const salesRep = await prisma.user.create({
    data: {
      name: 'John Sales',
      email: 'john@alphacrm.com',
      passwordHash: 'placeholder_hash_phase4',
      role: 'SALES_REP',
    },
  });

  console.log('✅ Users created:', admin.name, manager.name, salesRep.name);

  // Create contacts
  const contact1 = await prisma.contact.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@company.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      ownerId: salesRep.id,
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@startup.com',
      company: 'StartupXYZ',
      ownerId: salesRep.id,
    },
  });

  const contact3 = await prisma.contact.create({
    data: {
      name: 'Carol White',
      email: 'carol@enterprise.com',
      phone: '+9876543210',
      company: 'Enterprise Ltd',
      ownerId: manager.id,
    },
  });

  console.log('✅ Contacts created:', contact1.name, contact2.name, contact3.name);

  // Create deals
  await prisma.deal.create({
    data: {
      title: 'Acme Corp Software License',
      value: 5000,
      stage: 'PROPOSAL',
      contactId: contact1.id,
      ownerId: salesRep.id,
    },
  });

  await prisma.deal.create({
    data: {
      title: 'StartupXYZ Onboarding',
      value: 1200,
      stage: 'LEAD',
      contactId: contact2.id,
      ownerId: salesRep.id,
    },
  });

  await prisma.deal.create({
    data: {
      title: 'Enterprise Ltd Annual Contract',
      value: 25000,
      stage: 'QUALIFIED',
      contactId: contact3.id,
      ownerId: manager.id,
    },
  });

  console.log('✅ Deals created');
  console.log('🌱 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
