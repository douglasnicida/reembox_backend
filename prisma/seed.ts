import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
    await prisma.company.upsert({
        where: { id: 0 },
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
                    active:  true,
                    auth: {
                      create: {
                        email: "admin@admin.com",
                        password: "$2a$10$DD0t0ukSeNPMU1vEUnBQPOgvBHvdOQ/Q7Tnz7l8JajmQnpc9DHbWG",
                        role: "ADMIN",
                      }
                    },
                }]
            }
        },
    })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })