const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Verified Unsplash Hotel Images
const HOTEL_IMAGES = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-6e53ce41e8f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1455587734955-081b22074882?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496417263034-38ec4f0d665a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517840901100-8179e982acb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1561026483-a4e7ab0077c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // New
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // New
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // New
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // New
    'https://images.unsplash.com/photo-1596436889106-be35e843f974?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'  // New
];

async function main() {
    console.log('Starting image repair...');

    const hotels = await prisma.hotel.findMany();
    console.log(`Found ${hotels.length} hotels to check.`);

    let updatedCount = 0;

    const updates = hotels.map(hotel => {
        // Always replace with fresh images to guarantee validity
        const img1 = HOTEL_IMAGES[Math.floor(Math.random() * HOTEL_IMAGES.length)];
        let img2 = HOTEL_IMAGES[Math.floor(Math.random() * HOTEL_IMAGES.length)];
        while (img1 === img2) {
            img2 = HOTEL_IMAGES[Math.floor(Math.random() * HOTEL_IMAGES.length)];
        }

        updatedCount++;
        return prisma.hotel.update({
            where: { id: hotel.id },
            data: {
                images: [img1, img2]
            }
        });
    });

    await Promise.all(updates);

    console.log(`Successfully updated ${updatedCount} hotels.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
