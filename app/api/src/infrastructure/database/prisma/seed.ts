import bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash password for all users (using 'senha123' as default)
  const defaultPassword = await bcrypt.hash('senha123', 10);

  // ============================================
  // CREATE USERS
  // ============================================

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

  // ============================================
  // GET USER REFERENCES
  // ============================================

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

  const allEmployees = [
    employee1,
    employee2,
    employee3,
    employee4,
    employee5,
    employee6,
    employee7,
    employee8,
    employee9,
    employee10,
  ];
  const allNurses = [nurse1, nurse2, nurse3, nurse4];

  // Buscar TODOS os usuários ativos (exceto inativo) para aplicações de vacinas
  const allActiveUsers = await prisma.user.findMany({
    where: {
      isActive: true,
    },
  });

  // ============================================
  // CREATE VACCINES
  // ============================================

  // Vaccine 1: COVID-19 (2 doses) - TODOS OS USUÁRIOS TOMARAM
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

  // Vaccine 2: Flu (1 dose) - TODOS OS USUÁRIOS TOMARAM
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

  // Vaccine 3: Hepatitis B (3 doses) - Alguns completaram, outros parcialmente
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

  // Vaccine 4: Tetanus (1 dose)
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

  // Vaccine 5: MMR (2 doses) - Alguns completaram, outros parcialmente
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
        'Vacina contra sarampo, caxumba e rubéola. Proteção tripla com duas doses recomendadas.',
      dosesRequired: 2,
      intervalDays: 30,
      isObligatory: true,
      createdById: manager2!.id,
    },
  });

  // Vaccine 6: Yellow Fever (1 dose)
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

  // Vaccine 7: HPV (3 doses) - Alguns completaram, outros parcialmente
  const hpvVaccine = await prisma.vaccine.upsert({
    where: {
      name_manufacturer: {
        name: 'HPV Quadrivalente',
        manufacturer: 'MSD',
      },
    },
    update: {},
    create: {
      name: 'HPV Quadrivalente',
      manufacturer: 'MSD',
      description:
        'Vacina contra HPV. Proteção contra os tipos 6, 11, 16 e 18 do vírus.',
      dosesRequired: 3,
      intervalDays: 60,
      isObligatory: false,
      createdById: manager2!.id,
    },
  });

  // ============================================
  // CREATE VACCINE BATCHES
  // ============================================
  // A maioria com validade futura, apenas 3 vencidos

  // COVID Batches
  const covidBatch1 = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'COVID-PF-2025-001' },
    update: {},
    create: {
      batchNumber: 'COVID-PF-2025-001',
      vaccineId: covidVaccine.id,
      initialQuantity: 1000,
      currentQuantity: 750,
      expirationDate: new Date('2026-06-30'),
      receivedDate: new Date('2025-01-15'),
      status: 'AVAILABLE',
      createdById: manager.id,
    },
  });

  const covidBatch2 = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'COVID-PF-2025-002' },
    update: {},
    create: {
      batchNumber: 'COVID-PF-2025-002',
      vaccineId: covidVaccine.id,
      initialQuantity: 800,
      currentQuantity: 600,
      expirationDate: new Date('2026-08-31'),
      receivedDate: new Date('2025-03-01'),
      status: 'AVAILABLE',
      createdById: manager.id,
    },
  });

  // Flu Batches
  const fluBatch1 = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'FLU-SP-2025-001' },
    update: {},
    create: {
      batchNumber: 'FLU-SP-2025-001',
      vaccineId: fluVaccine.id,
      initialQuantity: 2000,
      currentQuantity: 1664,
      expirationDate: new Date('2026-03-31'),
      receivedDate: new Date('2025-02-01'),
      status: 'AVAILABLE',
      createdById: manager.id,
    },
  });

  // LOTE VENCIDO 1
  await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'FLU-SP-2024-OLD' },
    update: {},
    create: {
      batchNumber: 'FLU-SP-2024-OLD',
      vaccineId: fluVaccine.id,
      initialQuantity: 500,
      currentQuantity: 120,
      expirationDate: new Date('2025-01-15'),
      receivedDate: new Date('2024-06-01'),
      status: 'EXPIRED',
      createdById: manager.id,
    },
  });

  // Hepatitis B Batches
  const hepatitisBatch1 = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'HEP-B-2025-001' },
    update: {},
    create: {
      batchNumber: 'HEP-B-2025-001',
      vaccineId: hepatitisVaccine.id,
      initialQuantity: 1200,
      currentQuantity: 900,
      expirationDate: new Date('2027-12-31'),
      receivedDate: new Date('2025-01-10'),
      status: 'AVAILABLE',
      createdById: manager.id,
    },
  });

  // LOTE VENCIDO 2
  await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'HEP-B-2024-OLD' },
    update: {},
    create: {
      batchNumber: 'HEP-B-2024-OLD',
      vaccineId: hepatitisVaccine.id,
      initialQuantity: 300,
      currentQuantity: 80,
      expirationDate: new Date('2025-02-28'),
      receivedDate: new Date('2024-05-15'),
      status: 'EXPIRED',
      createdById: manager.id,
    },
  });

  // Tetanus Batch
  const tetanusBatch = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'TET-DT-2025-001' },
    update: {},
    create: {
      batchNumber: 'TET-DT-2025-001',
      vaccineId: tetanusVaccine.id,
      initialQuantity: 600,
      currentQuantity: 584,
      expirationDate: new Date('2028-01-31'),
      receivedDate: new Date('2025-02-15'),
      status: 'AVAILABLE',
      createdById: manager.id,
    },
  });

  // MMR Batches
  const mmrBatch1 = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'MMR-GSK-2025-001' },
    update: {},
    create: {
      batchNumber: 'MMR-GSK-2025-001',
      vaccineId: mmrVaccine.id,
      initialQuantity: 800,
      currentQuantity: 770,
      expirationDate: new Date('2026-12-31'),
      receivedDate: new Date('2025-02-20'),
      status: 'AVAILABLE',
      createdById: manager2!.id,
    },
  });

  // Yellow Fever Batch
  const yellowFeverBatch = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'YF-BIO-2025-001' },
    update: {},
    create: {
      batchNumber: 'YF-BIO-2025-001',
      vaccineId: yellowFeverVaccine.id,
      initialQuantity: 500,
      currentQuantity: 420,
      expirationDate: new Date('2027-06-30'),
      receivedDate: new Date('2025-03-10'),
      status: 'AVAILABLE',
      createdById: manager.id,
    },
  });

  // HPV Batches
  const hpvBatch1 = await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'HPV-MSD-2025-001' },
    update: {},
    create: {
      batchNumber: 'HPV-MSD-2025-001',
      vaccineId: hpvVaccine.id,
      initialQuantity: 600,
      currentQuantity: 480,
      expirationDate: new Date('2026-09-30'),
      receivedDate: new Date('2025-01-20'),
      status: 'AVAILABLE',
      createdById: manager2!.id,
    },
  });

  // LOTE VENCIDO 3
  await prisma.vaccineBatch.upsert({
    where: { batchNumber: 'HPV-MSD-2024-OLD' },
    update: {},
    create: {
      batchNumber: 'HPV-MSD-2024-OLD',
      vaccineId: hpvVaccine.id,
      initialQuantity: 200,
      currentQuantity: 45,
      expirationDate: new Date('2025-03-15'),
      receivedDate: new Date('2024-07-01'),
      status: 'EXPIRED',
      createdById: manager2!.id,
    },
  });

  // ============================================
  // CREATE VACCINE APPLICATIONS
  // ============================================

  // COVID-19: TODOS os EMPLOYEES tomaram todas as doses (2 doses)
  for (let i = 0; i < allEmployees.length; i++) {
    const employee = allEmployees[i];
    const nurse = allNurses[i % allNurses.length];
    const batch = i % 2 === 0 ? covidBatch1 : covidBatch2;

    // Dose 1
    await prisma.vaccineApplication.upsert({
      where: {
        userId_vaccineId_doseNumber: {
          userId: employee.id,
          vaccineId: covidVaccine.id,
          doseNumber: 1,
        },
      },
      update: {},
      create: {
        userId: employee.id,
        vaccineId: covidVaccine.id,
        batchId: batch.id,
        appliedById: nurse.id,
        doseNumber: 1,
        applicationDate: new Date('2025-06-10'),
        applicationSite: 'Left Deltoid',
        observations: 'Primeira dose COVID-19',
      },
    });

    // Dose 2
    await prisma.vaccineApplication.upsert({
      where: {
        userId_vaccineId_doseNumber: {
          userId: employee.id,
          vaccineId: covidVaccine.id,
          doseNumber: 2,
        },
      },
      update: {},
      create: {
        userId: employee.id,
        vaccineId: covidVaccine.id,
        batchId: batch.id,
        appliedById: nurse.id,
        doseNumber: 2,
        applicationDate: new Date('2025-07-01'),
        applicationSite: 'Right Deltoid',
        observations: 'Segunda dose COVID-19 - esquema completo',
      },
    });
  }

  // INFLUENZA: TODOS os usuários ativos tomaram (1 dose) - 100% COVERAGE
  for (let i = 0; i < allActiveUsers.length; i++) {
    const user = allActiveUsers[i];
    const applierNurse = allNurses[i % allNurses.length];

    await prisma.vaccineApplication.upsert({
      where: {
        userId_vaccineId_doseNumber: {
          userId: user.id,
          vaccineId: fluVaccine.id,
          doseNumber: 1,
        },
      },
      update: {},
      create: {
        userId: user.id,
        vaccineId: fluVaccine.id,
        batchId: fluBatch1.id,
        appliedById: applierNurse.id,
        doseNumber: 1,
        applicationDate: new Date('2025-08-05'),
        applicationSite: 'Left Arm',
        observations: 'Vacinação anual contra gripe - cobertura 100%',
      },
    });
  }

  // HEPATITE B (3 doses): Distribuição variada
  // Funcionários 1-3: Completaram as 3 doses
  for (let i = 0; i < 3; i++) {
    const employee = allEmployees[i];
    const nurse = allNurses[i % allNurses.length];

    for (let dose = 1; dose <= 3; dose++) {
      const daysOffset = (dose - 1) * 30;
      const baseDate = new Date('2025-04-01');
      baseDate.setDate(baseDate.getDate() + daysOffset);

      await prisma.vaccineApplication.upsert({
        where: {
          userId_vaccineId_doseNumber: {
            userId: employee.id,
            vaccineId: hepatitisVaccine.id,
            doseNumber: dose,
          },
        },
        update: {},
        create: {
          userId: employee.id,
          vaccineId: hepatitisVaccine.id,
          batchId: hepatitisBatch1.id,
          appliedById: nurse.id,
          doseNumber: dose,
          applicationDate: baseDate,
          applicationSite: dose % 2 === 0 ? 'Right Deltoid' : 'Left Deltoid',
          observations: `Dose ${dose}/3 de Hepatite B`,
        },
      });
    }
  }

  // Funcionários 4-6: Tomaram 2 doses (parcial)
  for (let i = 3; i < 6; i++) {
    const employee = allEmployees[i];
    const nurse = allNurses[i % allNurses.length];

    for (let dose = 1; dose <= 2; dose++) {
      const daysOffset = (dose - 1) * 30;
      const baseDate = new Date('2025-05-15');
      baseDate.setDate(baseDate.getDate() + daysOffset);

      await prisma.vaccineApplication.upsert({
        where: {
          userId_vaccineId_doseNumber: {
            userId: employee.id,
            vaccineId: hepatitisVaccine.id,
            doseNumber: dose,
          },
        },
        update: {},
        create: {
          userId: employee.id,
          vaccineId: hepatitisVaccine.id,
          batchId: hepatitisBatch1.id,
          appliedById: nurse.id,
          doseNumber: dose,
          applicationDate: baseDate,
          applicationSite: dose % 2 === 0 ? 'Right Deltoid' : 'Left Deltoid',
          observations: `Dose ${dose}/3 de Hepatite B - falta dose 3`,
        },
      });
    }
  }

  // Funcionários 7-9: Tomaram apenas 1 dose (parcial)
  for (let i = 6; i < 9; i++) {
    const employee = allEmployees[i];
    const nurse = allNurses[i % allNurses.length];

    await prisma.vaccineApplication.upsert({
      where: {
        userId_vaccineId_doseNumber: {
          userId: employee.id,
          vaccineId: hepatitisVaccine.id,
          doseNumber: 1,
        },
      },
      update: {},
      create: {
        userId: employee.id,
        vaccineId: hepatitisVaccine.id,
        batchId: hepatitisBatch1.id,
        appliedById: nurse.id,
        doseNumber: 1,
        applicationDate: new Date('2025-07-20'),
        applicationSite: 'Left Deltoid',
        observations: 'Dose 1/3 de Hepatite B - faltam doses 2 e 3',
      },
    });
  }

  // Funcionário 10: Não tomou nenhuma dose ainda

  // TÉTANO (1 dose): TODOS os usuários ativos tomaram (100% COVERAGE)
  for (let i = 0; i < allActiveUsers.length; i++) {
    const user = allActiveUsers[i];
    const applierNurse = allNurses[i % allNurses.length];

    await prisma.vaccineApplication.upsert({
      where: {
        userId_vaccineId_doseNumber: {
          userId: user.id,
          vaccineId: tetanusVaccine.id,
          doseNumber: 1,
        },
      },
      update: {},
      create: {
        userId: user.id,
        vaccineId: tetanusVaccine.id,
        batchId: tetanusBatch.id,
        appliedById: applierNurse.id,
        doseNumber: 1,
        applicationDate: new Date('2025-09-10'),
        applicationSite: 'Right Arm',
        observations: 'Reforço de tétano - cobertura 100%',
      },
    });
  }

  // MMR (2 doses): 90% de TODOS os usuários ativos completaram
  // Total de usuários ativos: 16 (2 managers + 4 nurses + 10 employees)
  // 90% de 16 = 14.4, arredondando = 14 usuários completam, 2 usuários ficam com 1 dose
  const totalActiveUsers = allActiveUsers.length;
  const usersToComplete = Math.floor(totalActiveUsers * 0.9); // 14 usuários

  // Primeiros 14 usuários: Completaram as 2 doses (90%)
  for (let i = 0; i < usersToComplete; i++) {
    const user = allActiveUsers[i];
    const applierNurse = allNurses[i % allNurses.length];

    for (let dose = 1; dose <= 2; dose++) {
      const daysOffset = (dose - 1) * 30;
      const baseDate = new Date('2025-05-01');
      baseDate.setDate(baseDate.getDate() + daysOffset);

      await prisma.vaccineApplication.upsert({
        where: {
          userId_vaccineId_doseNumber: {
            userId: user.id,
            vaccineId: mmrVaccine.id,
            doseNumber: dose,
          },
        },
        update: {},
        create: {
          userId: user.id,
          vaccineId: mmrVaccine.id,
          batchId: mmrBatch1.id,
          appliedById: applierNurse.id,
          doseNumber: dose,
          applicationDate: baseDate,
          applicationSite: dose % 2 === 0 ? 'Right Deltoid' : 'Left Deltoid',
          observations: `Dose ${dose}/2 de MMR - cobertura 90%`,
        },
      });
    }
  }

  // Últimos 2 usuários: Tomaram apenas 1 dose (10% incompleto)
  for (let i = usersToComplete; i < totalActiveUsers; i++) {
    const user = allActiveUsers[i];
    const applierNurse = allNurses[i % allNurses.length];

    await prisma.vaccineApplication.upsert({
      where: {
        userId_vaccineId_doseNumber: {
          userId: user.id,
          vaccineId: mmrVaccine.id,
          doseNumber: 1,
        },
      },
      update: {},
      create: {
        userId: user.id,
        vaccineId: mmrVaccine.id,
        batchId: mmrBatch1.id,
        appliedById: applierNurse.id,
        doseNumber: 1,
        applicationDate: new Date('2025-06-15'),
        applicationSite: 'Left Deltoid',
        observations: 'Dose 1/2 de MMR - falta dose 2 (10% incompleto)',
      },
    });
  }

  // FEBRE AMARELA (1 dose): Alguns funcionários tomaram
  for (let i = 0; i < 5; i++) {
    const employee = allEmployees[i];
    const nurse = allNurses[i % allNurses.length];

    await prisma.vaccineApplication.upsert({
      where: {
        userId_vaccineId_doseNumber: {
          userId: employee.id,
          vaccineId: yellowFeverVaccine.id,
          doseNumber: 1,
        },
      },
      update: {},
      create: {
        userId: employee.id,
        vaccineId: yellowFeverVaccine.id,
        batchId: yellowFeverBatch.id,
        appliedById: nurse.id,
        doseNumber: 1,
        applicationDate: new Date('2025-07-05'),
        applicationSite: 'Right Arm',
        observations: 'Dose única - válida por 10 anos',
      },
    });
  }

  // HPV (3 doses): Distribuição variada
  // Funcionários 1-2: Completaram as 3 doses
  for (let i = 0; i < 2; i++) {
    const employee = allEmployees[i];
    const nurse = allNurses[i % allNurses.length];

    for (let dose = 1; dose <= 3; dose++) {
      const daysOffset = (dose - 1) * 60;
      const baseDate = new Date('2025-03-01');
      baseDate.setDate(baseDate.getDate() + daysOffset);

      await prisma.vaccineApplication.upsert({
        where: {
          userId_vaccineId_doseNumber: {
            userId: employee.id,
            vaccineId: hpvVaccine.id,
            doseNumber: dose,
          },
        },
        update: {},
        create: {
          userId: employee.id,
          vaccineId: hpvVaccine.id,
          batchId: hpvBatch1.id,
          appliedById: nurse.id,
          doseNumber: dose,
          applicationDate: baseDate,
          applicationSite: dose % 2 === 0 ? 'Right Deltoid' : 'Left Deltoid',
          observations: `Dose ${dose}/3 de HPV`,
        },
      });
    }
  }

  // Funcionários 3-5: Tomaram 2 doses (parcial)
  for (let i = 2; i < 5; i++) {
    const employee = allEmployees[i];
    const nurse = allNurses[i % allNurses.length];

    for (let dose = 1; dose <= 2; dose++) {
      const daysOffset = (dose - 1) * 60;
      const baseDate = new Date('2025-04-01');
      baseDate.setDate(baseDate.getDate() + daysOffset);

      await prisma.vaccineApplication.upsert({
        where: {
          userId_vaccineId_doseNumber: {
            userId: employee.id,
            vaccineId: hpvVaccine.id,
            doseNumber: dose,
          },
        },
        update: {},
        create: {
          userId: employee.id,
          vaccineId: hpvVaccine.id,
          batchId: hpvBatch1.id,
          appliedById: nurse.id,
          doseNumber: dose,
          applicationDate: baseDate,
          applicationSite: dose % 2 === 0 ? 'Right Deltoid' : 'Left Deltoid',
          observations: `Dose ${dose}/3 de HPV - falta dose 3`,
        },
      });
    }
  }

  // Funcionários 6-8: Tomaram apenas 1 dose (parcial)
  for (let i = 5; i < 8; i++) {
    const employee = allEmployees[i];
    const nurse = allNurses[i % allNurses.length];

    await prisma.vaccineApplication.upsert({
      where: {
        userId_vaccineId_doseNumber: {
          userId: employee.id,
          vaccineId: hpvVaccine.id,
          doseNumber: 1,
        },
      },
      update: {},
      create: {
        userId: employee.id,
        vaccineId: hpvVaccine.id,
        batchId: hpvBatch1.id,
        appliedById: nurse.id,
        doseNumber: 1,
        applicationDate: new Date('2025-08-20'),
        applicationSite: 'Left Deltoid',
        observations: 'Dose 1/3 de HPV - faltam doses 2 e 3',
      },
    });
  }

  // ============================================
  // CREATE VACCINE SCHEDULINGS (FUTURO - após 27/11/2025)
  // ============================================

  // SCHEDULED - Hepatite B dose 3 para funcionários que tomaram 2 doses
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee4.id,
      vaccineId: hepatitisVaccine.id,
      assignedNurseId: nurse1.id,
      scheduledDate: new Date('2025-12-15T10:00:00'),
      doseNumber: 3,
      status: 'SCHEDULED',
      notes: 'Terceira dose de Hepatite B - completar esquema vacinal',
    },
  });

  await prisma.vaccineScheduling.create({
    data: {
      userId: employee5.id,
      vaccineId: hepatitisVaccine.id,
      assignedNurseId: nurse2.id,
      scheduledDate: new Date('2025-12-20T14:30:00'),
      doseNumber: 3,
      status: 'SCHEDULED',
      notes: 'Terceira dose de Hepatite B',
    },
  });

  // SCHEDULED - Hepatite B dose 2 para funcionários que tomaram 1 dose
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee7.id,
      vaccineId: hepatitisVaccine.id,
      assignedNurseId: nurse3.id,
      scheduledDate: new Date('2025-11-28T09:00:00'),
      doseNumber: 2,
      status: 'SCHEDULED',
      notes: 'Segunda dose de Hepatite B',
    },
  });

  // CONFIRMED - HPV doses pendentes
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee3.id,
      vaccineId: hpvVaccine.id,
      assignedNurseId: nurse4.id,
      scheduledDate: new Date('2025-12-01T10:30:00'),
      doseNumber: 3,
      status: 'CONFIRMED',
      notes: 'Terceira dose de HPV - confirmado',
    },
  });

  // SCHEDULED - MMR dose 2 para os 2 usuários que não completaram (10%)
  const incompleteMmrUsers = allActiveUsers.slice(usersToComplete);

  if (incompleteMmrUsers.length > 0) {
    await prisma.vaccineScheduling.create({
      data: {
        userId: incompleteMmrUsers[0].id,
        vaccineId: mmrVaccine.id,
        assignedNurseId: nurse1.id,
        scheduledDate: new Date('2025-12-18T13:30:00'),
        doseNumber: 2,
        status: 'SCHEDULED',
        notes: 'Segunda dose de MMR - completar esquema vacinal (90% coverage)',
      },
    });
  }

  if (incompleteMmrUsers.length > 1) {
    await prisma.vaccineScheduling.create({
      data: {
        userId: incompleteMmrUsers[1].id,
        vaccineId: mmrVaccine.id,
        assignedNurseId: nurse2.id,
        scheduledDate: new Date('2025-12-22T10:00:00'),
        doseNumber: 2,
        status: 'SCHEDULED',
        notes: 'Segunda dose de MMR - completar esquema vacinal (90% coverage)',
      },
    });
  }

  // CANCELLED - Alguns agendamentos cancelados
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee9.id,
      vaccineId: yellowFeverVaccine.id,
      assignedNurseId: nurse2.id,
      scheduledDate: new Date('2025-12-03T14:00:00'),
      doseNumber: 1,
      status: 'CANCELLED',
      notes: 'Cancelado pelo funcionário - reagendar',
    },
  });

  await prisma.vaccineScheduling.create({
    data: {
      userId: employee10.id,
      vaccineId: hepatitisVaccine.id,
      assignedNurseId: nurse4.id,
      scheduledDate: new Date('2025-11-29T11:00:00'),
      doseNumber: 1,
      status: 'CANCELLED',
      notes: 'Cancelado - funcionário indisponível',
    },
  });

  // COMPLETED - Agendamentos já completados (com relacionamento coeso às applications)
  // Scheduling 1: Influenza para manager1
  const completedScheduling1 = await prisma.vaccineScheduling.create({
    data: {
      userId: manager.id,
      vaccineId: fluVaccine.id,
      assignedNurseId: nurse1.id,
      scheduledDate: new Date('2025-08-05T10:00:00'),
      doseNumber: 1,
      status: 'COMPLETED',
      notes: 'Vacinação contra gripe realizada - agendamento completado',
    },
  });

  // Linkando o agendamento completado à aplicação de influenza do manager
  await prisma.vaccineApplication.update({
    where: {
      userId_vaccineId_doseNumber: {
        userId: manager.id,
        vaccineId: fluVaccine.id,
        doseNumber: 1,
      },
    },
    data: {
      schedulingId: completedScheduling1.id,
    },
  });

  // Scheduling 2: Tétano para employee1
  const completedScheduling2 = await prisma.vaccineScheduling.create({
    data: {
      userId: employee1.id,
      vaccineId: tetanusVaccine.id,
      assignedNurseId: nurse2.id,
      scheduledDate: new Date('2025-09-10T09:00:00'),
      doseNumber: 1,
      status: 'COMPLETED',
      notes: 'Reforço de tétano aplicado - agendamento completado',
    },
  });

  // Linkando o agendamento completado à aplicação de tétano do employee1
  await prisma.vaccineApplication.update({
    where: {
      userId_vaccineId_doseNumber: {
        userId: employee1.id,
        vaccineId: tetanusVaccine.id,
        doseNumber: 1,
      },
    },
    data: {
      schedulingId: completedScheduling2.id,
    },
  });

  // Mais agendamentos SCHEDULED para diferentes funcionários e vacinas
  await prisma.vaccineScheduling.create({
    data: {
      userId: employee10.id,
      vaccineId: hepatitisVaccine.id,
      assignedNurseId: nurse1.id,
      scheduledDate: new Date('2026-01-15T10:00:00'),
      doseNumber: 1,
      status: 'SCHEDULED',
      notes: 'Iniciar esquema de Hepatite B',
    },
  });

  await prisma.vaccineScheduling.create({
    data: {
      userId: employee9.id,
      vaccineId: hepatitisVaccine.id,
      assignedNurseId: nurse3.id,
      scheduledDate: new Date('2026-01-20T14:00:00'),
      doseNumber: 2,
      status: 'SCHEDULED',
      notes: 'Segunda dose de Hepatite B',
    },
  });

  // ============================================
  // UPDATE VACCINE STOCK
  // ============================================

  await prisma.vaccine.update({
    where: { id: covidVaccine.id },
    data: { totalStock: 1350 },
  });

  await prisma.vaccine.update({
    where: { id: fluVaccine.id },
    data: { totalStock: 1664 }, // 1680 - 16 aplicações (todos os usuários ativos)
  });

  await prisma.vaccine.update({
    where: { id: hepatitisVaccine.id },
    data: { totalStock: 980 },
  });

  await prisma.vaccine.update({
    where: { id: tetanusVaccine.id },
    data: { totalStock: 584 }, // 600 - 16 aplicações (todos os usuários ativos)
  });

  await prisma.vaccine.update({
    where: { id: mmrVaccine.id },
    data: { totalStock: 770 }, // 800 - 30 aplicações (14 usuários com 2 doses + 2 com 1 dose)
  });

  await prisma.vaccine.update({
    where: { id: yellowFeverVaccine.id },
    data: { totalStock: 420 },
  });

  await prisma.vaccine.update({
    where: { id: hpvVaccine.id },
    data: { totalStock: 525 },
  });

  console.log('✅ Seed completed successfully!\n');
  console.log('📋 Created users:');
  console.log('   - 2 Managers');
  console.log('   - 4 Nurses');
  console.log('   - 11 Employees (10 active + 1 inactive)');
  console.log('   - TOTAL ACTIVE USERS: 16\n');

  console.log('💉 Created vaccines:');
  console.log('   - COVID-19 (Pfizer) - 2 doses, 21 days interval');
  console.log('   - Influenza (Tetravalente) - 1 dose');
  console.log('   - Hepatite B - 3 doses, 30 days interval');
  console.log('   - Tétano (dT) - 1 dose');
  console.log('   - Tríplice Viral (SCR) - 2 doses, 30 days interval');
  console.log('   - Febre Amarela - 1 dose');
  console.log('   - HPV Quadrivalente - 3 doses, 60 days interval\n');

  console.log('📦 Created vaccine batches:');
  console.log('   - 11 batches total');
  console.log('   - 8 batches with future expiration dates');
  console.log(
    '   - 3 EXPIRED batches (FLU-SP-2024-OLD, HEP-B-2024-OLD, HPV-MSD-2024-OLD)\n',
  );

  console.log('🩹 Created vaccine applications:');
  console.log(
    '   - COVID-19: ALL 10 employees completed (2 doses each = 20 applications)',
  );
  console.log(
    '   - Influenza: ALL 16 ACTIVE USERS vaccinated (1 dose = 16 applications) - 100% COVERAGE ✅',
  );
  console.log('   - Hepatite B:');
  console.log('     • 3 employees completed (3 doses = 9 applications)');
  console.log('     • 3 employees partial (2 doses = 6 applications)');
  console.log('     • 3 employees partial (1 dose = 3 applications)');
  console.log('     • 1 employee not started');
  console.log(
    '   - Tétano: ALL 16 ACTIVE USERS vaccinated (1 dose = 16 applications) - 100% COVERAGE ✅',
  );
  console.log('   - MMR (2 doses):');
  console.log(
    '     • 14 users completed (2 doses = 28 applications) - 90% COVERAGE ✅',
  );
  console.log('     • 2 users partial (1 dose = 2 applications) - 10% incomplete');
  console.log(
    '   - Febre Amarela: 5 employees vaccinated (1 dose = 5 applications)',
  );
  console.log('   - HPV:');
  console.log('     • 2 employees completed (3 doses = 6 applications)');
  console.log('     • 3 employees partial (2 doses = 6 applications)');
  console.log('     • 3 employees partial (1 dose = 3 applications)');
  console.log('   - TOTAL: 110+ vaccine applications\n');

  console.log(
    '📅 Created vaccine schedulings (ALL in the future, after 2025-11-27):',
  );
  console.log('   - SCHEDULED: 7 appointments');
  console.log('   - CONFIRMED: 1 appointment');
  console.log('   - COMPLETED: 2 appointments (linked to applications ✅)');
  console.log('   - CANCELLED: 2 appointments');
  console.log('   - TOTAL: 12 schedulings');
  console.log('   - ⚠️  NO ORPHAN RELATIONSHIPS - All COMPLETED schedulings link to applications\n');

  console.log('🔑 Default password for all users: senha123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
