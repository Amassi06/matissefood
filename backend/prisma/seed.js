const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const passwordHash = await bcrypt.hash('MatisseFood94.?!', 12);
    const admin = await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash
        }
    });
    console.log(`✅ Admin created: ${admin.username}`);

    // Delete old prizes and recreate
    await prisma.code.updateMany({ where: { status: 'GENERATED' }, data: { prizeId: null } });
    await prisma.prize.deleteMany({});

    // Create Matisse Food prizes
    const prizes = [
    { 
        name: 'Perdu !', 
        description: 'Pas de chance cette fois-ci. Retentez le coup lors de votre prochaine visite chez Matisse !', 
        probability: 30, 
        tier: 'LOSS' 
    },
    { 
        name: 'Canette 33cl Offerte', 
        description: 'Une canette au choix offerte lors de votre prochaine visite. Parfait pour accompagner votre repas !', 
        probability: 25, 
        tier: 'SMALL' 
    },
    { 
        name: 'Boisson Maison Offerte', 
        description: 'Une Citronnade ou un Bissap maison offert lors de votre prochaine visite.', 
        probability: 7, 
        tier: 'SMALL' 
    },
    { 
        name: 'Maxi Cookie Offert', 
        description: 'Un Maxi Cookie maison offert en dessert lors de votre prochaine visite.', 
        probability: 10, 
        tier: 'MEDIUM' 
    },
    { 
        name: 'Frites Cheddar Offertes', 
        description: 'Une barquette de frites sauce cheddar offerte lors de votre prochaine commande !', 
        probability: 25, 
        tier: 'MEDIUM' 
    },
    { 
        name: 'Iron Smash Burger Offert', 
        description: 'JACKPOT ! Un Iron Smash Burger offert lors de votre prochaine visite !', 
        probability: 2, 
        tier: 'JACKPOT' 
    },
    { 
        name: 'Kebab Classique Offert', 
        description: 'MÉGA JACKPOT ! Un Kebab Classique offert lors de votre prochaine visite !', 
        probability: 1, 
        tier: 'JACKPOT' 
    }
];

    await prisma.prize.createMany({ data: prizes });
    console.log(`✅ ${prizes.length} prizes created`);

    // Create default settings
    const settings = [
        { key: 'googleMapsUrl', value: 'https://www.google.com/maps/place/Matisse+Food+Ivry/@48.8177259,2.3704562,485m/data=!3m1!1e3!4m8!3m7!1s0x47e673e44823606b:0x3e9e5c3d56cea04a!8m2!3d48.8177259!4d2.3730365!9m1!1b1!16s%2Fg%2F11trls3d2h?entry=ttu' },
        { key: 'engagementTimerSeconds', value: '15' },
        { key: 'welcomeMessage', value: 'Bienvenue chez Matisse Food ! Tentez votre chance et gagnez des récompenses.' },
        { key: 'restaurantName', value: 'Matisse Food' }
    ];

    for (const setting of settings) {
        await prisma.settings.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting
        });
    }
    console.log(`✅ Settings configured`);

    console.log('🎉 Seed complete!');
}

main()
    .catch(e => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
