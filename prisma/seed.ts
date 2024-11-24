import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Senhas já geradas com bcrypt com 10 rounds e os valores abaixo
    const password1 = "$2a$10$V0zQ/6rdmbohjJZ1jqHsm1Ej7Z9qC0vUL1Cq9t/3bG69HvczVmhE2"; // "admin123"
    const password2 = "$2a$10$Bw77tqAfIm7hr7jlf9ksy.qXsCh66P5oXnHtRiHHslNoS9s2S.LSi"; // "finance2024"
    const password3 = "$2a$10$Zn4T6LIGtxSYuKOLPiMhpe9X3KMC5e/ivX7f.V7nQt/Nbx6m8Z86e"; // "superuser456"
    const password4 = "$2a$10$Tk70vzkvFzOwMoEBY62s6JntjvjKLkGe2NGXH5N8RcxPHRrF6aJbO"; // "approver789"
    const password5 = "$2a$10$yFT2jHjZz3Zm5wTY8BYlI3fKdeXj5FXmCV0NVnkmYZ64v/Yc8P1VK"; // "userpassword"

    // Upsert Companies (Alterando os CNPJs)
    const companies = await Promise.all([
        prisma.company.upsert({
            where: { cnpj: "12345678000198" }, // Alterado CNPJ
            update: {},
            create: {
                cnpj: "12345678000198",
                name: "Tech Solutions",
                founded_year: "2015",
            },
        }),
        prisma.company.upsert({
            where: { cnpj: "98765432000101" }, // Alterado CNPJ
            update: {},
            create: {
                cnpj: "98765432000101",
                name: "Green Energy Co.",
                founded_year: "2018",
            },
        }),
        prisma.company.upsert({
            where: { cnpj: "19283746000112" }, // Alterado CNPJ
            update: {},
            create: {
                cnpj: "19283746000112",
                name: "HealthPlus",
                founded_year: "2020",
            },
        }),
        prisma.company.upsert({
            where: { cnpj: "56473829000123" }, // Alterado CNPJ
            update: {},
            create: {
                cnpj: "56473829000123",
                name: "EduTech",
                founded_year: "2021",
            },
        }),
        prisma.company.upsert({
            where: { cnpj: "74527419000133" }, // Alterado CNPJ
            update: {},
            create: {
                cnpj: "74527419000133",
                name: "Reembox",
                founded_year: "2010",
            },
        }),
    ]);

    // Upsert Users
    const users = await Promise.all([
        prisma.user.upsert({
            where: { cpf: "11111111111" },
            update: {},
            create: {
                name: "Admin User",
                cpf: "11111111111",
                phone: "11999999999",
                active: true,
                company: { connect: { cnpj: "12345678000198" } }, // Alterado CNPJ
                auth: {
                    create: {
                        email: "admin1@techsolutions.com",
                        password: password1,
                        role: "ADMIN",
                    },
                },
            },
        }),
        prisma.user.upsert({
            where: { cpf: "22222222222" },
            update: {},
            create: {
                name: "Finance User",
                cpf: "22222222222",
                phone: "11988888888",
                active: true,
                company: { connect: { cnpj: "98765432000101" } }, // Alterado CNPJ
                auth: {
                    create: {
                        email: "finance@greenenergy.com",
                        password: password2,
                        role: "FINANCE",
                    },
                },
            },
        }),
        prisma.user.upsert({
            where: { cpf: "33333333333" },
            update: {},
            create: {
                name: "Super User",
                cpf: "33333333333",
                phone: "11977777777",
                active: false,
                company: { connect: { cnpj: "19283746000112" } }, // Alterado CNPJ
                auth: {
                    create: {
                        email: "super@healthplus.com",
                        password: password3,
                        role: "SUPERUSER",
                    },
                },
            },
        }),
        prisma.user.upsert({
            where: { cpf: "44444444444" },
            update: {},
            create: {
                name: "Approver User",
                cpf: "44444444444",
                phone: "11966666666",
                active: true,
                company: { connect: { cnpj: "56473829000123" } }, // Alterado CNPJ
                auth: {
                    create: {
                        email: "approver@edutech.com",
                        password: password4,
                        role: "APPROVER",
                    },
                },
            },
        }),
        prisma.user.upsert({
            where: { cpf: "55555555555" },
            update: {},
            create: {
                name: "Regular User",
                cpf: "55555555555",
                phone: "11955555555",
                active: true,
                company: { connect: { cnpj: "74527419000133" } }, // Alterado CNPJ
                auth: {
                    create: {
                        email: "user@reembox.com",
                        password: password5,
                        role: "USER",
                    },
                },
            },
        }),
    ]);

    // Upsert Projects
    const projects = await Promise.all([
        prisma.project.upsert({
            where: { key: "PROJ01" },
            update: {},
            create: {
                key: "PROJ01",
                name: "Solar Panel Initiative",
                company: { connect: { cnpj: "98765432000101" } },
                customer: { connect: { id: 1 } },
                active: true,
            },
        }),
        prisma.project.upsert({
            where: { key: "PROJ02" },
            update: {},
            create: {
                key: "PROJ02",
                name: "AI Development",
                company: { connect: { cnpj: "12345678000198" } },
                customer: { connect: { id: 1 } },
                active: true,
            },
        }),
        prisma.project.upsert({
            where: { key: "PROJ03" },
            update: {},
            create: {
                key: "PROJ03",
                name: "Healthcare Modernization",
                company: { connect: { cnpj: "19283746000112" } },
                customer: { connect: { id: 1 } },
                active: true,
            },
        }),
        prisma.project.upsert({
            where: { key: "PROJ04" },
            update: {},
            create: {
                key: "PROJ04",
                name: "Education Portal",
                company: { connect: { cnpj: "56473829000123" } },
                customer: { connect: { id: 1 } },
                active: true,
            },
        }),
        prisma.project.upsert({
            where: { key: "PROJ05" },
            update: {},
            create: {
                key: "PROJ05",
                name: "Sustainability Initiative",
                company: { connect: { cnpj: "74527419000133" } },
                customer: { connect: { id: 1 } },
                active: true,
            },
        }),
    ]);

    // Upsert Cost Centers (Alterando os Códigos e Descrições)
    const costCenters = await Promise.all([
        prisma.costCenter.upsert({
            where: { id: 1 },
            update: {},
            create: {
                code: 'CCT01',
                description: "Tech Research",
                company: { connect: { cnpj: "12345678000198" } }, // Alterado CNPJ
            },
        }),
        prisma.costCenter.upsert({
            where: { id: 2 },
            update: {},
            create: {
                code: 'CCT02',
                description: "Sustainability Projects",
                company: { connect: { cnpj: "98765432000101" } }, // Alterado CNPJ
            },
        }),
        prisma.costCenter.upsert({
            where: { id: 3 },
            update: {},
            create: {
                code: 'CCT03',
                description: "Health Development",
                company: { connect: { cnpj: "19283746000112" } }, // Alterado CNPJ
            },
        }),
        prisma.costCenter.upsert({
            where: { id: 4 },
            update: {},
            create: {
                code: 'CCT04',
                description: "Education Programs",
                company: { connect: { cnpj: "56473829000123" } }, // Alterado CNPJ
            },
        }),
        prisma.costCenter.upsert({
            where: { id: 5 },
            update: {},
            create: {
                code: 'CCT05',
                description: "Project Management",
                company: { connect: { cnpj: "74527419000133" } }, // Alterado CNPJ
            },
        }),
    ]);

    const expenseCategories = await prisma.expenseCategory.createMany({
        data: [
          {
            description: "Category 1 - Marketing",
            active: true,
            companyId: 1, // Substitua com um companyId válido
          },
          {
            description: "Category 2 - Research and Development",
            active: true,
            companyId: 1, // Substitua com um companyId válido
          },
          {
            description: "Category 3 - Employee Benefits",
            active: true,
            companyId: 2, // Substitua com um companyId válido
          },
          {
            description: "Category 4 - Office Supplies",
            active: true,
            companyId: 2, // Substitua com um companyId válido
          },
          {
            description: "Category 5 - Travel and Accommodation",
            active: true,
            companyId: 3, // Substitua com um companyId válido
          },
        ],
      });

    // Upsert Expenses
    const expenses = await Promise.all([
        prisma.expense.upsert({
            where: { id: 1 },
            update: {},
            create: {
                value: 1500,
                quantity: 3,
                project: { connect: { key: "PROJ01" } },
                company: { connect: { id: 1 } },
                category: { connect: { id: 1 } },
                costCenter: { connect: { id: 1 } },
                notes: "Additional office supplies",
                expenseDate: new Date(),
            },
        }),
        prisma.expense.upsert({
            where: { id: 2 },
            update: {},
            create: {
                value: 2500,
                quantity: 4,
                project: { connect: { key: "PROJ02" } },
                company: { connect: { id: 2 } },
                category: { connect: { id: 2 } },
                costCenter: { connect: { id: 2 } },
                notes: "Business conference trip",
                expenseDate: new Date(),
            },
        }),
        prisma.expense.upsert({
            where: { id: 3 },
            update: {},
            create: {
                value: 3500,
                quantity: 2,
                project: { connect: { key: "PROJ03" } },
                company: { connect: { id: 3 } },
                category: { connect: { id: 3 } },
                costCenter: { connect: { id: 3 } },
                notes: "Medical equipment",
                expenseDate: new Date(),
            },
        }),
        prisma.expense.upsert({
            where: { id: 4 },
            update: {},
            create: {
                value: 1200,
                quantity: 5,
                project: { connect: { key: "PROJ04" } },
                company: { connect: { id: 4 } },
                category: { connect: { id: 4 } },
                costCenter: { connect: { id: 4 } },
                notes: "Software licenses",
                expenseDate: new Date(),
            },
        }),
        prisma.expense.upsert({
            where: { id: 5 },
            update: {},
            create: {
                value: 1800,
                quantity: 3,
                project: { connect: { key: "PROJ05" } },
                company: { connect: { id: 5 } },
                category: { connect: { id: 5 } },
                costCenter: { connect: { id: 5 } },
                notes: "Recycling materials",
                expenseDate: new Date(),
            },
        }),
    ]);

    const reports = await Promise.all([
        prisma.report.upsert({
            where: { id: 1 },
            update: {},
            create: {
                name: "Relatório Solar Panel Initiative",
                total: 0,  // Inicializando o total
                goal: '10000', // Novo campo goal
                creator: { connect: { id: 1 } },  // Associando criador (usuário com role "creator")
                approver: { connect: { id: 4 } },  // Associando aprovador (usuário com role "approver")
            },
        }),
        prisma.report.upsert({
            where: { id: 2 },
            update: {},
            create: {
                name: "Relatório AI Development",
                total: 0,  // Inicializando o total
                goal: '20000', // Novo campo goal
                creator: { connect: { id: 1 } },  // Associando criador (usuário com role "creator")
                approver: { connect: { id: 4 } },  // Associando aprovador (usuário com role "approver")
            },
        }),
        prisma.report.upsert({
            where: { id: 4 },
            update: {},
            create: {
                name: "Relatório Education Portal",
                total: 0,  // Inicializando o total
                goal: '5000', // Novo campo goal
                creator: { connect: { id: 16 } },  // Associando criador (usuário com role "creator")
                approver: { connect: { id: 1 } },  // Associando aprovador (usuário com role "approver")
            },
        }),
        prisma.report.upsert({
            where: { id: 5 },
            update: {},
            create: {
                name: "Relatório Sustainability Initiative",
                total: 0,  // Inicializando o total
                goal: '12000', // Novo campo goal
                creator: { connect: { id: 2 } },  // Associando criador (usuário com role "creator")
                approver: { connect: { id: 1 } },  // Associando aprovador (usuário com role "approver")
            },
        }),
    ]);
    
    // Associando algumas despesas aos relatórios e atualizando o total
    
    const expensesReport2 = await prisma.reportExpense.createMany({
        data: [
            { expenseId: 4, reportId: 2 }, // Despesa de 3500 (AI Development)
            { expenseId: 4, reportId: 2 }, // Despesa de 1200 (AI Development)
        ],
    });
    
    const expensesReport4 = await prisma.reportExpense.createMany({
        data: [
            { expenseId: 6, reportId: 4 }, // Despesa de 1200 (Education Portal)
        ],
    });
    
    const expensesReport5 = await prisma.reportExpense.createMany({
        data: [
            { expenseId: 7, reportId: 5 }, // Despesa de 1800 (Sustainability Initiative)
        ],
    });
    
    // Atualizando os totais dos relatórios
    
    const updateReportTotals = await Promise.all([
        prisma.report.update({
            where: { id: 1 },
            data: {
                total: 1500 + 2500, // Soma das despesas associadas
            },
        }),
        prisma.report.update({
            where: { id: 2 },
            data: {
                total: 3500 + 1200, // Soma das despesas associadas
            },
        }),
        prisma.report.update({
            where: { id: 4 },
            data: {
                total: 1200, // Soma das despesas associadas
            },
        }),
        prisma.report.update({
            where: { id: 5 },
            data: {
                total: 1800, // Soma das despesas associadas
            },
        }),
    ]);

    console.log("Seed data has been inserted!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
