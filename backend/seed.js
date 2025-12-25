const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // 1. Create a demo owner
    const password = await bcrypt.hash('password123', 10);

    // Try to find or create owner
    let owner = await prisma.user.findUnique({ where: { email: 'demo_owner@bookmystay.com' } });

    if (!owner) {
        owner = await prisma.user.create({
            data: {
                email: 'demo_owner@bookmystay.com',
                password,
                name: 'Demo Hotel Group',
                role: 'OWNER',
            },
        });
        console.log('Created Demo Owner:', owner.email);
    } else {
        console.log('Using existing Demo Owner:', owner.email);
    }

    // 2. Create 50 Hotels
    console.log('Creating 50 Hotels...');

    const hotelPromises = [];

    for (let i = 0; i < 50; i++) {
        hotelPromises.push((async () => {
            const city = faker.location.city();
            const hotel = await prisma.hotel.create({
                data: {
                    ownerId: owner.id,
                    name: `${faker.company.name()} Hotel`,
                    description: faker.lorem.paragraph(),
                    city: city,
                    address: faker.location.streetAddress(),
                    amenities: faker.helpers.arrayElements(['Wifi', 'Pool', 'Gym', 'Spa', 'Bar', 'Parking', 'Restaurant'], { min: 3, max: 6 }),
                    images: [
                        `https://source.unsplash.com/800x600/?hotel,room,${i}`,
                        `https://source.unsplash.com/800x600/?hotel,lobby,${i}`
                    ],
                    isVerified: true
                }
            });

            // 3. Create 10 Rooms for each Hotel
            const roomPromises = [];
            for (let j = 0; j < 10; j++) {
                const type = faker.helpers.arrayElement(['Single', 'Double', 'Suite']);
                let price = parseFloat(faker.commerce.price({ min: 50, max: 500 }));
                if (type === 'Suite') price += 200;

                roomPromises.push(prisma.room.create({
                    data: {
                        hotelId: hotel.id,
                        title: `${type} Room ${j + 101}`,
                        type,
                        pricePerNight: price,
                        capacity: type === 'Single' ? 1 : (type === 'Double' ? 2 : 4),
                        inventory: faker.number.int({ min: 1, max: 10 })
                    }
                }));
            }
            await Promise.all(roomPromises);
        })());
    }

    await Promise.all(hotelPromises);

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
