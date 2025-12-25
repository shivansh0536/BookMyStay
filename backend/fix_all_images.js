const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Curated list of high-quality Unsplash Hotel/Room images
// Using direct IDs to ensure stability and avoid "random" redirects failing
const hotelImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1563911302283-d2bc129e7c1f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571896349842-6e53ce41be03?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512918760532-3ed64bc8066e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1496417263034-38ec4f0d6b21?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522771753035-1a5b6519b6bb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606046604972-77cc76aee944?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1533759413974-9e15f3b745ac?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1586611292717-f828b167408c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1550953818-ba387fb73f50?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1602484083049-366a7b29a28c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1537237852886-c43ec2905f93?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1463130436881-872f2a74c766?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534612899740-55c821a90129?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1578774204375-826c48318625?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1609949165382-2e5527023e13?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1574643156929-51fa098b0394?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1529290130-4ca3753253ae?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544124339-422d9b6e0338?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560669887-12a8f0991841?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1594563703937-fd6963185261?auto=format&fit=crop&w=800&q=80",
];

async function main() {
    console.log('Fetching all hotels...');
    const hotels = await prisma.hotel.findMany({ select: { id: true, name: true } });
    console.log(`Found ${hotels.length} hotels.`);

    console.log('Updating images...');

    for (let i = 0; i < hotels.length; i++) {
        const hotel = hotels[i];
        // Use modulo to cycle through images if there are more hotels than images
        // But we have ~50 images, so should be mostly unique
        const primaryImage = hotelImages[i % hotelImages.length];

        // Pick another random one for the second image
        const secondaryImage = hotelImages[(i + 5) % hotelImages.length];

        await prisma.hotel.update({
            where: { id: hotel.id },
            data: {
                images: [primaryImage, secondaryImage]
            }
        });
        console.log(`Updated ${hotel.name} with unique images.`);
    }

    console.log('All hotels updated successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
