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

  // Get user IDs for relationships
  const manager = await prisma.user.findUnique({
    where: { email: 'admin@hospital.com' },
  });
  const nurse1 = await prisma.user.findUnique({
    where: { email: 'enfermeira1@hospital.com' },
  });
  const nurse2 = await prisma.user.findUnique({
    where: { email: 'enfermeiro2@hospital.com' },
  });
  const employee1 = await prisma.user.findUnique({
    where: { email: 'funcionario1@hospital.com' },
  });
  const employee2 = await prisma.user.findUnique({
    where: { email: 'funcionaria2@hospital.com' },
  });
  const employee3 = await prisma.user.findUnique({
    where: { email: 'funcionario3@hospital.com' },
  });

  if (!manager || !nurse1 || !nurse2 || !employee1 || !employee2 || !employee3) {
    throw new Error('Required users not found');
  }

  // Create Vaccines
  const covidVaccine = await prisma.vaccine.upsert({
    where: {
      name_manufacturer: {
        name: 'COVID-19 (Pfizer)',
        manufacturer: 'Pfizer-BioNTech',
      },
    },
    update: {},
    create: {
      name: 'COVID-19 (Pfizer)',
      manufacturer: 'Pfizer-BioNTech',
      description:
        'Vacina contra COVID-19 baseada em mRNA. Altamente eficaz na prevenção de formas graves da doença.',
      dosesRequired: 2,
      intervalDays: 21,
      isObligatory: true,
      createdById: manager.id,
    },
  });

  const fluVaccine = await prisma.vaccine.upsert({
    where: {
      name_manufacturer: {
        name: 'Influenza (Tetravalente)',
        manufacturer: 'Sanofi Pasteur',
      },
    },
    update: {},
    create: {
      name: 'Influenza (Tetravalente)',
      manufacturer: 'Sanofi Pasteur',
      description:
        'Vacina contra gripe sazonal. Proteção contra 4 cepas do vírus influenza.',
      dosesRequired: 1,
      intervalDays: null,
      isObligatory: false,
      createdById: manager.id,
    },
  });

  const hepatitisVaccine = await prisma.vaccine.upsert({
    where: {
      name_manufacturer: {
        name: 'Hepatite B',
        manufacturer: 'Instituto Butantan',
      },
    },
    update: {},
    create: {
      name: 'Hepatite B',
      manufacturer: 'Instituto Butantan',
      description:
        'Vacina recombinante contra Hepatite B. Previne infecção hepática crônica.',
      dosesRequired: 3,
      intervalDays: 30,
      isObligatory: true,
      createdById: manager.id,
    },
  });

  const tetanusVaccine = await prisma.vaccine.upsert({
    where: {
      name_manufacturer: {
        name: 'Tétano (dT)',
        manufacturer: 'Serum Institute',
      },
    },
    update: {},
    create: {
      name: 'Tétano (dT)',
      manufacturer: 'Serum Institute',
      description:
        'Vacina dupla tipo adulto contra difteria e tétano. Reforço a cada 10 anos.',
      dosesRequired: 1,
      intervalDays: null,
      isObligatory: true,
      createdById: manager.id,
    },
  });

  // Create Vaccine Batches
  const covidBatch1 = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'COVID-PF-2024-001' },
    update: {},
    create: {
      batchNumber: 'COVID-PF-2024-001',
      vaccineId: covidVaccine.id,
      initialQuantity: 1000,
      currentQuantity: 850,
      expirationDate: new Date('2025-06-30'),
      receivedDate: new Date('2024-01-15'),
      status: 'AVAILABLE',
      createdById: manager.id,
    },
  });

  const covidBatch2 = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'COVID-PF-2024-002' },
    update: {},
    create: {
      batchNumber: 'COVID-PF-2024-002',
      vaccineId: covidVaccine.id,
      initialQuantity: 500,
      currentQuantity: 500,
      expirationDate: new Date('2025-08-31'),
      receivedDate: new Date('2024-03-01'),
      status: 'AVAILABLE',
      createdById: manager.id,
    },
  });

  const fluBatch = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'FLU-SP-2024-001' },
    update: {},
    create: {
      batchNumber: 'FLU-SP-2024-001',
      vaccineId: fluVaccine.id,
      initialQuantity: 2000,
      currentQuantity: 1700,
      expirationDate: new Date('2025-03-31'),
      receivedDate: new Date('2024-02-01'),
      status: 'AVAILABLE',
      createdById: manager.id,
    },
  });

  const hepatitisBatch = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'HEP-B-2024-001' },
    update: {},
    create: {
      batchNumber: 'HEP-B-2024-001',
      vaccineId: hepatitisVaccine.id,
      initialQuantity: 800,
      currentQuantity: 650,
      expirationDate: new Date('2026-12-31'),
      receivedDate: new Date('2024-01-10'),
      status: 'AVAILABLE',
      createdById: manager.id,
    },
  });

  const tetanusBatch = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'TET-DT-2024-001' },
    update: {},
    create: {
      batchNumber: 'TET-DT-2024-001',
      vaccineId: tetanusVaccine.id,
      initialQuantity: 600,
      currentQuantity: 580,
      expirationDate: new Date('2027-01-31'),
      receivedDate: new Date('2024-02-15'),
      status: 'AVAILABLE',
      createdById: manager.id,
    },
  });

  // Update vaccine totalStock with sum of all batch quantities
  await prisma.vaccine.update({
    where: { id: covidVaccine.id },
    data: { totalStock: 1350 }, // 850 + 500
  });

  await prisma.vaccine.update({
    where: { id: fluVaccine.id },
    data: { totalStock: 1700 },
  });

  await prisma.vaccine.update({
    where: { id: hepatitisVaccine.id },
    data: { totalStock: 650 },
  });

  await prisma.vaccine.update({
    where: { id: tetanusVaccine.id },
    data: { totalStock: 580 },
  });

  // Create Vaccine Applications
  // Employee 1 - Complete COVID vaccination (2 doses)
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee1.id,
        vaccineId: covidVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee1.id,
      vaccineId: covidVaccine.id,
      batchId: covidBatch1.id,
      appliedById: nurse1.id,
      doseNumber: 1,
      applicationDate: new Date('2024-03-10'),
      applicationSite: 'Left Deltoid',
      observations: 'Primeira dose aplicada sem intercorrências',
    },
  });

  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee1.id,
        vaccineId: covidVaccine.id,
        doseNumber: 2,
      },
    },
    update: {},
    create: {
      userId: employee1.id,
      vaccineId: covidVaccine.id,
      batchId: covidBatch1.id,
      appliedById: nurse1.id,
      doseNumber: 2,
      applicationDate: new Date('2024-03-31'),
      applicationSite: 'Right Deltoid',
      observations: 'Segunda dose - esquema completo',
    },
  });

  // Employee 1 - Flu vaccine
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee1.id,
        vaccineId: fluVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee1.id,
      vaccineId: fluVaccine.id,
      batchId: fluBatch.id,
      appliedById: nurse2.id,
      doseNumber: 1,
      applicationDate: new Date('2024-04-05'),
      applicationSite: 'Left Arm',
      observations: 'Campanha de vacinação contra gripe',
    },
  });

  // Employee 2 - COVID first dose only (incomplete)
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee2.id,
        vaccineId: covidVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee2.id,
      vaccineId: covidVaccine.id,
      batchId: covidBatch1.id,
      appliedById: nurse1.id,
      doseNumber: 1,
      applicationDate: new Date('2024-03-15'),
      applicationSite: 'Right Deltoid',
      observations: 'Aguardando segunda dose',
    },
  });

  // Employee 2 - Hepatitis B (dose 1 of 3)
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee2.id,
        vaccineId: hepatitisVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee2.id,
      vaccineId: hepatitisVaccine.id,
      batchId: hepatitisBatch.id,
      appliedById: nurse2.id,
      doseNumber: 1,
      applicationDate: new Date('2024-03-20'),
      applicationSite: 'Left Deltoid',
      observations: 'Início do esquema vacinal de Hepatite B',
    },
  });

  // Employee 3 - Tetanus
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee3.id,
        vaccineId: tetanusVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee3.id,
      vaccineId: tetanusVaccine.id,
      batchId: tetanusBatch.id,
      appliedById: nurse1.id,
      doseNumber: 1,
      applicationDate: new Date('2024-04-01'),
      applicationSite: 'Right Arm',
      observations: 'Reforço de rotina',
    },
  });

  // Employee 3 - Flu vaccine
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee3.id,
        vaccineId: fluVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee3.id,
      vaccineId: fluVaccine.id,
      batchId: fluBatch.id,
      appliedById: nurse2.id,
      doseNumber: 1,
      applicationDate: new Date('2024-04-10'),
      applicationSite: 'Left Deltoid',
      observations: 'Vacinação preventiva anual',
    },
  });

  // Nurse 1 - Self vaccination (COVID complete)
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: nurse1.id,
        vaccineId: covidVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: nurse1.id,
      vaccineId: covidVaccine.id,
      batchId: covidBatch2.id,
      appliedById: nurse2.id,
      doseNumber: 1,
      applicationDate: new Date('2024-03-05'),
      applicationSite: 'Left Deltoid',
      observations: 'Vacinação de profissional de saúde',
    },
  });

  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: nurse1.id,
        vaccineId: covidVaccine.id,
        doseNumber: 2,
      },
    },
    update: {},
    create: {
      userId: nurse1.id,
      vaccineId: covidVaccine.id,
      batchId: covidBatch2.id,
      appliedById: nurse2.id,
      doseNumber: 2,
      applicationDate: new Date('2024-03-26'),
      applicationSite: 'Right Deltoid',
      observations: 'Esquema completo - profissional de saúde',
    },
  });

  console.log('Seed completed successfully!');
  console.log('\n📋 Created users:');
  console.log('   - 2 Managers');
  console.log('   - 3 Nurses');
  console.log('   - 6 Employees (5 active + 1 inactive)');
  console.log('\n💉 Created vaccines:');
  console.log('   - COVID-19 (Pfizer) - 2 doses, 21 days interval');
  console.log('   - Influenza (Tetravalente) - 1 dose');
  console.log('   - Hepatite B - 3 doses, 30 days interval');
  console.log('   - Tétano (dT) - 1 dose');
  console.log('\n📦 Created vaccine batches:');
  console.log('   - 2 COVID-19 batches (1350 doses available)');
  console.log('   - 1 Flu batch (1700 doses available)');
  console.log('   - 1 Hepatitis B batch (650 doses available)');
  console.log('   - 1 Tetanus batch (580 doses available)');
  console.log('\n🩹 Created vaccine applications:');
  console.log('   - Employee 1: COVID complete (2/2) + Flu (1/1)');
  console.log('   - Employee 2: COVID incomplete (1/2) + Hepatitis B (1/3)');
  console.log('   - Employee 3: Tetanus (1/1) + Flu (1/1)');
  console.log('   - Nurse 1: COVID complete (2/2)');
  console.log('\n🔑 Default password for all users: senha123');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
