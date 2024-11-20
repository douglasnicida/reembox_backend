import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Upsert Company
    const company = await prisma.company.upsert({
        where: { cnpj: '74527419000132' },
        update: {},
        create: {
            cnpj: '74527419000132',
            name: 'Reembox',
            founded_year: "2010",
            users: {
                create: [{
                    name: "admin",
                    phone: "11123456789",
                    cpf: "67227161048",
                    active: true,
                    auth: {
                        create: {
                            email: "admin@admin.com",
                            password: "$2a$10$DD0t0ukSeNPMU1vEUnBQPOgvBHvdOQ/Q7Tnz7l8JajmQnpc9DHbWG", // hashed password
                            role: "ADMIN",
                        }
                    },
                }]
            },
            costCenters: {
                create: [{
                    code: "CC01",
                    description: "Development",
                }]
            },
            expenseCategories: {
                create: [{
                    description: "Travel Expenses"
                }]
            }
        },
    });

    // Upsert JobTitle
    const jobTitle = await prisma.jobTitle.upsert({
        where: { id: 1 }, // Using title as unique identifier
        update: { title: "Software Engineer" },
        create: {
            title: "Software Engineer",
            companyId: company.id, // Associating with the company ID
        }
    });

    const admin = await prisma.user.findFirst({where: {name: 'admin'}, select: {id: true}})

    // Upsert User
    const user = await prisma.user.upsert({
        where: { cpf: "12345678901" }, // Unique identifier
        update: {
            name: "John Doe",
            phone: "11987654321",
            jobTitleId: jobTitle.id,
            managerId: admin.id
        },
        create: {
            name: "John Doe",
            phone: "11987654321",
            cpf: "12345678901",
            companyId: company.id,
            jobTitleId: jobTitle.id,
            managerId: admin.id
        }
    });

    // Upsert Customer
    const customer = await prisma.customer.upsert({
      where: { id: 1 }, // Unique identifier
      update: {
        name: "Acme Corp",
        email: "contact@acmecorp.com",
        phone: "11912345678",
      },
      create: {
          name: "Acme Corp",
          email: "contact@acmecorp.com",
          phone: "11912345678",
      }
  });

    // Upsert Project
    const project = await prisma.project.upsert({
        where: { key: "PROJ-001" }, // Unique identifier
        update: {},
        create: {
            key: "PROJ-001",
            name: "Project Alpha",
            companyId: company.id,
            customerId: 1, // Assuming a customer will be created next
        }
    });

    // Upsert Expense Category and Expense
    const expenseCategory = await prisma.expenseCategory.upsert({
        where:{ id : 1 }, // Unique identifier
        update:{
          description : "Office Supplies",
          companyId : company.id,
        },
        create:{
            description : "Office Supplies",
            companyId : company.id,
        }
    });

    const expense = await prisma.expense.upsert({
      where:{ id : 1 },  
      update:{ 
        costCenterId : 1, 
        notes: "teste",
        projectId : project.id, 
        categoryId : expenseCategory.id, 
        value : 100.50, 
        quantity : 2,
        expenseDate : new Date(), 
      },
      create:{
          value : 100.50,
          quantity : 2,
          notes: "teste",
          companyId : company.id,
          projectId : project.id,
          costCenterId : 1, 
          categoryId : expenseCategory.id,
      }
   });

   await prisma.expense.upsert({
    where:{ id : 2 },  
    update:{ 
      costCenterId : 1, 
      notes: "teste2",
      projectId : project.id, 
      categoryId : expenseCategory.id, 
      value : 100.50, 
      quantity : 2,
      expenseDate : new Date(), 
    },
    create:{
        value : 100.50,
        quantity : 2,
        notes: "teste2",
        companyId : company.id,
        projectId : project.id,
        costCenterId : 1, 
        categoryId : expenseCategory.id,
    }
 });

   // Upsert Report
   const report = await prisma.report.upsert({
       where:{ id: 1}, 
       update:{
           name:"Monthly Report",
           goal:"Review expenses for the month.",
           total: 0,
           creatorId:user.id,
           approverId:admin.id,
       },
       create:{
           name:"Monthly Report",
           goal:"Review expenses for the month.",
           total: 0,
           creatorId:user.id,
           approverId:admin.id, 
       }
   });

   console.log("Seed data created successfully!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });