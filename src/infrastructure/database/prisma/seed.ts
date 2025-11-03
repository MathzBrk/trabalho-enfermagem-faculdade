import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash password for all users (using 'senha123' as default)
  const defaultPassword = await bcrypt.hash('senha123', 10);

  // Create Manager users
  await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {},
    create: {
      name: 'Ana Silva',
      email: 'admin@hospital.com',
      password: defaultPassword,
      cpf: '123.456.789-00',
      phone: '(11) 98765-4321',
      role: 'MANAGER',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'gestor@hospital.com' },
    update: {},
    create: {
      name: 'Carlos Mendes',
      email: 'gestor@hospital.com',
      password: defaultPassword,
      cpf: '234.567.890-11',
      phone: '(11) 98765-4322',
      role: 'MANAGER',
      isActive: true,
    },
  });

  // Create Nurse users
  await prisma.user.upsert({
    where: { email: 'enfermeira1@hospital.com' },
    update: {},
    create: {
      name: 'Maria Santos',
      email: 'enfermeira1@hospital.com',
      password: defaultPassword,
      cpf: '345.678.901-22',
      phone: '(11) 98765-4323',
      coren: 'COREN-SP 123456',
      role: 'NURSE',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'enfermeiro2@hospital.com' },
    update: {},
    create: {
      name: 'João Oliveira',
      email: 'enfermeiro2@hospital.com',
      password: defaultPassword,
      cpf: '456.789.012-33',
      phone: '(11) 98765-4324',
      coren: 'COREN-SP 234567',
      role: 'NURSE',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'enfermeira3@hospital.com' },
    update: {},
    create: {
      name: 'Paula Costa',
      email: 'enfermeira3@hospital.com',
      password: defaultPassword,
      cpf: '567.890.123-44',
      phone: '(11) 98765-4325',
      coren: 'COREN-SP 345678',
      role: 'NURSE',
      isActive: true,
    },
  });

  // Create Employee users
  await prisma.user.upsert({
    where: { email: 'funcionario1@hospital.com' },
    update: {},
    create: {
      name: 'Roberto Almeida',
      email: 'funcionario1@hospital.com',
      password: defaultPassword,
      cpf: '678.901.234-55',
      phone: '(11) 98765-4326',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'funcionaria2@hospital.com' },
    update: {},
    create: {
      name: 'Juliana Pereira',
      email: 'funcionaria2@hospital.com',
      password: defaultPassword,
      cpf: '789.012.345-66',
      phone: '(11) 98765-4327',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'funcionario3@hospital.com' },
    update: {},
    create: {
      name: 'Pedro Souza',
      email: 'funcionario3@hospital.com',
      password: defaultPassword,
      cpf: '890.123.456-77',
      phone: '(11) 98765-4328',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'funcionaria4@hospital.com' },
    update: {},
    create: {
      name: 'Fernanda Lima',
      email: 'funcionaria4@hospital.com',
      password: defaultPassword,
      cpf: '901.234.567-88',
      phone: '(11) 98765-4329',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'funcionario5@hospital.com' },
    update: {},
    create: {
      name: 'Lucas Rocha',
      email: 'funcionario5@hospital.com',
      password: defaultPassword,
      cpf: '012.345.678-99',
      phone: '(11) 98765-4330',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  // Create one inactive employee for testing
  await prisma.user.upsert({
    where: { email: 'inativo@hospital.com' },
    update: {},
    create: {
      name: 'Marcos Ferreira',
      email: 'inativo@hospital.com',
      password: defaultPassword,
      cpf: '111.222.333-44',
      phone: '(11) 98765-4331',
      role: 'EMPLOYEE',
      isActive: false,
    },
  });

  console.log('Seed completed successfully!');
  console.log('\n= Created users:');
  console.log('   - 2 Managers');
  console.log('   - 3 Nurses');
  console.log('   - 6 Employees (5 active + 1 inactive)');
  console.log('\n= Default password for all users: senha123');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
