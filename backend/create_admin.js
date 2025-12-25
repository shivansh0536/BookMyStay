const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@bookmystay.com';
    const password = await bcrypt.hash('admin123', 10);

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        if (existing.role !== 'ADMIN') {
            const updated = await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' }
            });
            console.log(`Updated existing user ${email} to ADMIN.`);
        } else {
            console.log(`User ${email} is already an ADMIN.`);
        }
    } else {
        await prisma.user.create({
            data: {
                email,
                password,
                name: 'System Admin',
                role: 'ADMIN'
            }
        });
        console.log(`Created new ADMIN user: ${email}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
