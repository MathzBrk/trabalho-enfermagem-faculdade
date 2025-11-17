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

  await prisma.user.upsert({
    where: { email: 'enfermeira4@hospital.com' },
    update: {},
    create: {
      name: 'Sandra Martins',
      email: 'enfermeira4@hospital.com',
      password: defaultPassword,
      cpf: '222.333.444-55',
      phone: '(11) 98765-4332',
      coren: 'COREN-SP 456789',
      role: 'NURSE',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'funcionario6@hospital.com' },
    update: {},
    create: {
      name: 'Carla Oliveira',
      email: 'funcionario6@hospital.com',
      password: defaultPassword,
      cpf: '333.444.555-66',
      phone: '(11) 98765-4333',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'funcionario7@hospital.com' },
    update: {},
    create: {
      name: 'Ricardo Silva',
      email: 'funcionario7@hospital.com',
      password: defaultPassword,
      cpf: '444.555.666-77',
      phone: '(11) 98765-4334',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'funcionaria8@hospital.com' },
    update: {},
    create: {
      name: 'Beatriz Costa',
      email: 'funcionaria8@hospital.com',
      password: defaultPassword,
      cpf: '555.666.777-88',
      phone: '(11) 98765-4335',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'funcionario9@hospital.com' },
    update: {},
    create: {
      name: 'André Souza',
      email: 'funcionario9@hospital.com',
      password: defaultPassword,
      cpf: '666.777.888-99',
      phone: '(11) 98765-4336',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'funcionaria10@hospital.com' },
    update: {},
    create: {
      name: 'Tatiana Alves',
      email: 'funcionaria10@hospital.com',
      password: defaultPassword,
      cpf: '777.888.999-00',
      phone: '(11) 98765-4337',
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
  const manager2 = await prisma.user.findUnique({
    where: { email: 'gestor@hospital.com' },
  });
  const nurse1 = await prisma.user.findUnique({
    where: { email: 'enfermeira1@hospital.com' },
  });
  const nurse2 = await prisma.user.findUnique({
    where: { email: 'enfermeiro2@hospital.com' },
  });
  const nurse3 = await prisma.user.findUnique({
    where: { email: 'enfermeira3@hospital.com' },
  });
  const nurse4 = await prisma.user.findUnique({
    where: { email: 'enfermeira4@hospital.com' },
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
  const employee4 = await prisma.user.findUnique({
    where: { email: 'funcionaria4@hospital.com' },
  });
  const employee5 = await prisma.user.findUnique({
    where: { email: 'funcionario5@hospital.com' },
  });
  const employee6 = await prisma.user.findUnique({
    where: { email: 'funcionario6@hospital.com' },
  });
  const employee7 = await prisma.user.findUnique({
    where: { email: 'funcionario7@hospital.com' },
  });
  const employee8 = await prisma.user.findUnique({
    where: { email: 'funcionaria8@hospital.com' },
  });
  const employee9 = await prisma.user.findUnique({
    where: { email: 'funcionario9@hospital.com' },
  });
  const employee10 = await prisma.user.findUnique({
    where: { email: 'funcionaria10@hospital.com' },
  });

  if (
    !manager ||
    !manager2 ||
    !nurse1 ||
    !nurse2 ||
    !nurse3 ||
    !nurse4 ||
    !employee1 ||
    !employee2 ||
    !employee3 ||
    !employee4 ||
    !employee5 ||
    !employee6 ||
    !employee7 ||
    !employee8 ||
    !employee9 ||
    !employee10
  ) {
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

  const mmrVaccine = await prisma.vaccine.upsert({
    where: {
      name_manufacturer: {
        name: 'Tríplice Viral (SCR)',
        manufacturer: 'GlaxoSmithKline',
      },
    },
    update: {},
    create: {
      name: 'Tríplice Viral (SCR)',
      manufacturer: 'GlaxoSmithKline',
      description:
        'Vacina contra sarampo, caxumba e rubéola. Proteção tripla em dose única.',
      dosesRequired: 2,
      intervalDays: 30,
      isObligatory: true,
      createdById: manager2!.id,
    },
  });

  const yellowFeverVaccine = await prisma.vaccine.upsert({
    where: {
      name_manufacturer: {
        name: 'Febre Amarela',
        manufacturer: 'Bio-Manguinhos',
      },
    },
    update: {},
    create: {
      name: 'Febre Amarela',
      manufacturer: 'Bio-Manguinhos',
      description:
        'Vacina atenuada contra febre amarela. Dose única com validade de 10 anos.',
      dosesRequired: 1,
      intervalDays: null,
      isObligatory: false,
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

  const mmrBatch1 = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'MMR-GSK-2024-001' },
    update: {},
    create: {
      batchNumber: 'MMR-GSK-2024-001',
      vaccineId: mmrVaccine.id,
      initialQuantity: 400,
      currentQuantity: 350,
      expirationDate: new Date('2025-12-31'),
      receivedDate: new Date('2024-02-20'),
      status: 'AVAILABLE',
      createdById: manager2!.id,
    },
  });

  const yellowFeverBatch = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'YF-BIO-2024-001' },
    update: {},
    create: {
      batchNumber: 'YF-BIO-2024-001',
      vaccineId: yellowFeverVaccine.id,
      initialQuantity: 300,
      currentQuantity: 250,
      expirationDate: new Date('2026-06-30'),
      receivedDate: new Date('2024-03-10'),
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
    data: { totalStock: 1708 }, // 1700 + 8
  });

  await prisma.vaccine.update({
    where: { id: hepatitisVaccine.id },
    data: { totalStock: 800 }, // 650 + 150
  });

  await prisma.vaccine.update({
    where: { id: tetanusVaccine.id },
    data: { totalStock: 580 },
  });

  await prisma.vaccine.update({
    where: { id: mmrVaccine.id },
    data: { totalStock: 350 },
  });

  await prisma.vaccine.update({
    where: { id: yellowFeverVaccine.id },
    data: { totalStock: 250 },
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

  // Nurse 1 - COVID vaccination (complete, administered by Nurse 2)
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

  // Employee 4 - Hepatitis B (complete 3 doses)
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee4!.id,
        vaccineId: hepatitisVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee4!.id,
      vaccineId: hepatitisVaccine.id,
      batchId: hepatitisBatch.id,
      appliedById: nurse3!.id,
      doseNumber: 1,
      applicationDate: new Date('2024-01-10'),
      applicationSite: 'Left Deltoid',
      observations: 'Primeira dose do esquema',
    },
  });

  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee4!.id,
        vaccineId: hepatitisVaccine.id,
        doseNumber: 2,
      },
    },
    update: {},
    create: {
      userId: employee4!.id,
      vaccineId: hepatitisVaccine.id,
      batchId: hepatitisBatch.id,
      appliedById: nurse3!.id,
      doseNumber: 2,
      applicationDate: new Date('2024-02-09'),
      applicationSite: 'Right Deltoid',
      observations: 'Segunda dose aplicada',
    },
  });

  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee4!.id,
        vaccineId: hepatitisVaccine.id,
        doseNumber: 3,
      },
    },
    update: {},
    create: {
      userId: employee4!.id,
      vaccineId: hepatitisVaccine.id,
      batchId: hepatitisBatch.id,
      appliedById: nurse1.id,
      doseNumber: 3,
      applicationDate: new Date('2024-03-11'),
      applicationSite: 'Left Arm',
      observations: 'Esquema completo de Hepatite B',
    },
  });

  // Employee 5 - MMR (first dose)
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee5!.id,
        vaccineId: mmrVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee5!.id,
      vaccineId: mmrVaccine.id,
      batchId: mmrBatch1.id,
      appliedById: nurse2.id,
      doseNumber: 1,
      applicationDate: new Date('2024-03-12'),
      applicationSite: 'Left Deltoid',
      observations: 'Primeira dose - aguardando segunda',
    },
  });

  // Employee 6 - Yellow Fever
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee6!.id,
        vaccineId: yellowFeverVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee6!.id,
      vaccineId: yellowFeverVaccine.id,
      batchId: yellowFeverBatch.id,
      appliedById: nurse4!.id,
      doseNumber: 1,
      applicationDate: new Date('2024-03-20'),
      applicationSite: 'Right Arm',
      observations: 'Dose única - válida por 10 anos',
    },
  });

  // Employee 7 - COVID complete + Flu
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee7!.id,
        vaccineId: covidVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee7!.id,
      vaccineId: covidVaccine.id,
      batchId: covidBatch1.id,
      appliedById: nurse1.id,
      doseNumber: 1,
      applicationDate: new Date('2024-02-15'),
      applicationSite: 'Left Deltoid',
      observations: 'Primeira dose COVID',
    },
  });

  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee7!.id,
        vaccineId: covidVaccine.id,
        doseNumber: 2,
      },
    },
    update: {},
    create: {
      userId: employee7!.id,
      vaccineId: covidVaccine.id,
      batchId: covidBatch1.id,
      appliedById: nurse2.id,
      doseNumber: 2,
      applicationDate: new Date('2024-03-07'),
      applicationSite: 'Right Deltoid',
      observations: 'Segunda dose - esquema completo',
    },
  });

  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee7!.id,
        vaccineId: fluVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee7!.id,
      vaccineId: fluVaccine.id,
      batchId: fluBatch.id,
      appliedById: nurse3!.id,
      doseNumber: 1,
      applicationDate: new Date('2024-04-08'),
      applicationSite: 'Left Arm',
      observations: 'Campanha de vacinação',
    },
  });

  // Employee 8 - Tetanus + MMR (complete)
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee8!.id,
        vaccineId: tetanusVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee8!.id,
      vaccineId: tetanusVaccine.id,
      batchId: tetanusBatch.id,
      appliedById: nurse4!.id,
      doseNumber: 1,
      applicationDate: new Date('2024-02-20'),
      applicationSite: 'Left Deltoid',
      observations: 'Reforço de tétano',
    },
  });

  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee8!.id,
        vaccineId: mmrVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee8!.id,
      vaccineId: mmrVaccine.id,
      batchId: mmrBatch1.id,
      appliedById: nurse1.id,
      doseNumber: 1,
      applicationDate: new Date('2024-03-01'),
      applicationSite: 'Right Deltoid',
      observations: 'Primeira dose MMR',
    },
  });

  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee8!.id,
        vaccineId: mmrVaccine.id,
        doseNumber: 2,
      },
    },
    update: {},
    create: {
      userId: employee8!.id,
      vaccineId: mmrVaccine.id,
      batchId: mmrBatch1.id,
      appliedById: nurse2.id,
      doseNumber: 2,
      applicationDate: new Date('2024-03-31'),
      applicationSite: 'Left Deltoid',
      observations: 'Segunda dose - esquema completo MMR',
    },
  });

  // Employee 9 - Flu only
  await prisma.vaccineApplication.upsert({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee9!.id,
        vaccineId: fluVaccine.id,
        doseNumber: 1,
      },
    },
    update: {},
    create: {
      userId: employee9!.id,
      vaccineId: fluVaccine.id,
      batchId: fluBatch.id,
      appliedById: nurse3!.id,
      doseNumber: 1,
      applicationDate: new Date('2024-04-15'),
      applicationSite: 'Right Arm',
      observations: 'Vacinação contra gripe',
    },
  });

  // ============================================
  // CREATE VACCINE SCHEDULINGS
  // ============================================

  // Scheduled - Employee 2 needs COVID dose 2
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee2.id,
      vaccineId: covidVaccine.id,
      assignedNurseId: nurse1.id,
      scheduledDate: new Date('2025-12-01T10:00:00'),
      doseNumber: 2,
      status: 'SCHEDULED',
      notes: 'Segunda dose COVID-19 - completar esquema vacinal',
    },
  });

  // Confirmed - Employee 5 needs MMR dose 2
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee5!.id,
      vaccineId: mmrVaccine.id,
      assignedNurseId: nurse2.id,
      scheduledDate: new Date('2025-12-05T14:00:00'),
      doseNumber: 2,
      status: 'CONFIRMED',
      notes: 'Segunda dose MMR - paciente confirmou presença',
    },
  });

  // Scheduled - Employee 2 needs Hepatitis B dose 2
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee2.id,
      vaccineId: hepatitisVaccine.id,
      assignedNurseId: nurse3!.id,
      scheduledDate: new Date('2025-12-10T09:30:00'),
      doseNumber: 2,
      status: 'SCHEDULED',
      notes: 'Segunda dose de Hepatite B',
    },
  });

  // Scheduled - Employee 10 - First COVID dose
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee10!.id,
      vaccineId: covidVaccine.id,
      assignedNurseId: nurse4!.id,
      scheduledDate: new Date('2025-11-25T11:00:00'),
      doseNumber: 1,
      status: 'CONFIRMED',
      notes: 'Primeira dose COVID-19 - novo funcionário',
    },
  });

  // Scheduled - Employee 10 - Hepatitis B
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee10!.id,
      vaccineId: hepatitisVaccine.id,
      assignedNurseId: nurse1.id,
      scheduledDate: new Date('2025-11-26T15:00:00'),
      doseNumber: 1,
      status: 'SCHEDULED',
      notes: 'Iniciar esquema de Hepatite B',
    },
  });

  // Scheduled - Employee 9 - Tetanus
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee9!.id,
      vaccineId: tetanusVaccine.id,
      assignedNurseId: nurse2.id,
      scheduledDate: new Date('2025-11-28T10:30:00'),
      doseNumber: 1,
      status: 'SCHEDULED',
      notes: 'Reforço de tétano - obrigatório',
    },
  });

  // Cancelled - Employee 6 cancelled MMR
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee6!.id,
      vaccineId: mmrVaccine.id,
      assignedNurseId: nurse3!.id,
      scheduledDate: new Date('2024-04-20T14:00:00'),
      doseNumber: 1,
      status: 'CANCELLED',
      notes: 'Cancelado pelo funcionário - reagendar',
    },
  });

  // Completed - Employee 1's flu vaccination (linked to application)
  const completedScheduling1 = await prisma.vaccineScheduling.create({
    data: {
      userId: employee1.id,
      vaccineId: fluVaccine.id,
      assignedNurseId: nurse2.id,
      scheduledDate: new Date('2024-04-05T10:00:00'),
      doseNumber: 1,
      status: 'COMPLETED',
      notes: 'Agendamento concluído - vacinação realizada',
    },
  });

  // Link the completed scheduling to the application
  await prisma.vaccineApplication.update({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee1.id,
        vaccineId: fluVaccine.id,
        doseNumber: 1,
      },
    },
    data: {
      schedulingId: completedScheduling1.id,
    },
  });

  // ============================================
  // CREATE NOTIFICATIONS
  // ============================================

  // DOSE_REMINDER notifications
  await prisma.notification.create({
    data: {
      userId: employee2.id,
      type: 'DOSE_REMINDER',
      title: 'Lembrete de Segunda Dose',
      message:
        'Sua segunda dose da vacina COVID-19 (Pfizer) está agendada para 01/12/2025 às 10:00. Não se esqueça!',
      metadata: {
        vaccineId: covidVaccine.id,
        vaccineName: 'COVID-19 (Pfizer)',
        doseNumber: 2,
        scheduledDate: '2025-12-01T10:00:00',
      },
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: employee5!.id,
      type: 'DOSE_REMINDER',
      title: 'Lembrete de Vacinação',
      message:
        'Você tem uma dose agendada da vacina Tríplice Viral (SCR) para 05/12/2025 às 14:00.',
      metadata: {
        vaccineId: mmrVaccine.id,
        vaccineName: 'Tríplice Viral (SCR)',
        doseNumber: 2,
        scheduledDate: '2025-12-05T14:00:00',
      },
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: employee10!.id,
      type: 'DOSE_REMINDER',
      title: 'Lembrete: Vacinação Amanhã',
      message:
        'Lembre-se da sua vacinação COVID-19 (Pfizer) agendada para amanhã, 25/11/2025 às 11:00.',
      metadata: {
        vaccineId: covidVaccine.id,
        vaccineName: 'COVID-19 (Pfizer)',
        doseNumber: 1,
        scheduledDate: '2025-11-25T11:00:00',
      },
      isRead: false,
    },
  });

  // SCHEDULING_CONFIRMED notifications
  await prisma.notification.create({
    data: {
      userId: employee5!.id,
      type: 'SCHEDULING_CONFIRMED',
      title: 'Agendamento Confirmado',
      message:
        'Seu agendamento para a segunda dose de Tríplice Viral (SCR) foi confirmado para 05/12/2025 às 14:00.',
      metadata: {
        vaccineId: mmrVaccine.id,
        vaccineName: 'Tríplice Viral (SCR)',
        scheduledDate: '2025-12-05T14:00:00',
      },
      isRead: true,
      readAt: new Date('2024-04-12T09:00:00'),
    },
  });

  await prisma.notification.create({
    data: {
      userId: employee10!.id,
      type: 'SCHEDULING_CONFIRMED',
      title: 'Vacinação Agendada',
      message:
        'Sua vacinação COVID-19 foi agendada com sucesso para 25/11/2025 às 11:00 com a enfermeira Sandra Martins.',
      metadata: {
        vaccineId: covidVaccine.id,
        vaccineName: 'COVID-19 (Pfizer)',
        nurseName: 'Sandra Martins',
        scheduledDate: '2025-11-25T11:00:00',
      },
      isRead: false,
    },
  });

  // LOW_STOCK notifications (for managers)
  await prisma.notification.create({
    data: {
      userId: manager.id,
      type: 'LOW_STOCK',
      title: 'Alerta: Estoque Baixo',
      message:
        'O lote FLU-SP-2024-002 da vacina Influenza (Tetravalente) está com estoque crítico: apenas 8 doses restantes.',
      metadata: {
        batchNumber: 'FLU-SP-2024-002',
        vaccineId: fluVaccine.id,
        vaccineName: 'Influenza (Tetravalente)',
        currentQuantity: 8,
        minStockLevel: 10,
      },
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: manager2!.id,
      type: 'LOW_STOCK',
      title: 'Estoque Crítico',
      message:
        'URGENTE: O estoque do lote FLU-SP-2024-002 está muito baixo (8 doses). Reposição necessária.',
      metadata: {
        batchNumber: 'FLU-SP-2024-002',
        vaccineId: fluVaccine.id,
        vaccineName: 'Influenza (Tetravalente)',
        currentQuantity: 8,
      },
      isRead: true,
      readAt: new Date('2024-04-10T08:30:00'),
    },
  });

  // VACCINE_EXPIRING notifications (for managers)
  await prisma.notification.create({
    data: {
      userId: manager.id,
      type: 'VACCINE_EXPIRING',
      title: 'Vacina Próxima do Vencimento',
      message:
        'O lote HEP-B-2024-002 da vacina Hepatite B vence em 15/02/2025. Ainda há 150 doses disponíveis.',
      metadata: {
        batchNumber: 'HEP-B-2024-002',
        vaccineId: hepatitisVaccine.id,
        vaccineName: 'Hepatite B',
        expirationDate: '2025-02-15',
        currentQuantity: 150,
      },
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: manager2!.id,
      type: 'VACCINE_EXPIRING',
      title: 'Lote Próximo ao Vencimento',
      message:
        'Atenção: O lote HEP-B-2024-002 (Hepatite B) vence em menos de 3 meses. Priorizar uso das 150 doses restantes.',
      metadata: {
        batchNumber: 'HEP-B-2024-002',
        vaccineId: hepatitisVaccine.id,
        vaccineName: 'Hepatite B',
        expirationDate: '2025-02-15',
        currentQuantity: 150,
      },
      isRead: false,
    },
  });

  // GENERAL notifications
  await prisma.notification.create({
    data: {
      userId: employee1.id,
      type: 'GENERAL',
      title: 'Campanha de Vacinação',
      message:
        'Nova campanha de vacinação contra gripe disponível. Agende sua dose na recepção.',
      metadata: {
        campaignType: 'Influenza 2024',
      },
      isRead: true,
      readAt: new Date('2024-03-28T10:00:00'),
    },
  });

  await prisma.notification.create({
    data: {
      userId: employee3.id,
      type: 'GENERAL',
      title: 'Atualização do Sistema',
      message:
        'O sistema de vacinação será atualizado no próximo sábado. Todos os agendamentos serão mantidos.',
      metadata: {
        maintenanceDate: '2024-04-27',
      },
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: nurse1.id,
      type: 'GENERAL',
      title: 'Reunião de Equipe',
      message:
        'Reunião de equipe de enfermagem agendada para 30/04/2024 às 09:00 na sala de reuniões.',
      metadata: {
        meetingDate: '2024-04-30T09:00:00',
        location: 'Sala de Reuniões',
      },
      isRead: true,
      readAt: new Date('2024-04-18T14:20:00'),
    },
  });

  await prisma.notification.create({
    data: {
      userId: nurse2.id,
      type: 'GENERAL',
      title: 'Novo Protocolo de Vacinação',
      message:
        'Foi implementado um novo protocolo para aplicação de vacinas de RNA mensageiro. Consulte o manual atualizado.',
      metadata: {
        protocolVersion: '2.1',
        documentUrl: '/docs/protocols/mrna-vaccines-v2.1.pdf',
      },
      isRead: false,
    },
  });

  console.log('Seed completed successfully!');
  console.log('\n📋 Created users:');
  console.log('   - 2 Managers');
  console.log('   - 4 Nurses');
  console.log('   - 11 Employees (10 active + 1 inactive)');
  console.log('\n💉 Created vaccines:');
  console.log('   - COVID-19 (Pfizer) - 2 doses, 21 days interval');
  console.log('   - Influenza (Tetravalente) - 1 dose');
  console.log('   - Hepatite B - 3 doses, 30 days interval');
  console.log('   - Tétano (dT) - 1 dose');
  console.log('   - Tríplice Viral (SCR) - 2 doses, 30 days interval');
  console.log('   - Febre Amarela - 1 dose');
  console.log('\n📦 Created vaccine batches:');
  console.log('   - 2 COVID-19 batches (1350 doses)');
  console.log('   - 2 Flu batches (1708 doses total)');
  console.log('   - 2 Hepatitis B batches (800 doses)');
  console.log('   - 1 Tetanus batch (580 doses)');
  console.log('   - 1 MMR batch (350 doses)');
  console.log('   - 1 Yellow Fever batch (250 doses)');
  console.log('\n🩹 Created vaccine applications:');
  console.log('   - 25+ applications across all employees and nurses');
  console.log('   - Complete vaccination schemes for several employees');
  console.log('   - Partial schemes pending completion');
  console.log('\n📅 Created vaccine schedulings:');
  console.log('   - 8 schedulings with different statuses:');
  console.log('     • SCHEDULED: 4 appointments');
  console.log('     • CONFIRMED: 2 appointments');
  console.log('     • COMPLETED: 1 appointment');
  console.log('     • CANCELLED: 1 appointment');
  console.log('\n🔔 Created notifications:');
  console.log('   - 13 notifications of different types:');
  console.log('     • DOSE_REMINDER: 3 notifications');
  console.log('     • SCHEDULING_CONFIRMED: 2 notifications');
  console.log('     • LOW_STOCK: 2 notifications (for managers)');
  console.log('     • VACCINE_EXPIRING: 2 notifications (for managers)');
  console.log('     • GENERAL: 4 notifications');
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
