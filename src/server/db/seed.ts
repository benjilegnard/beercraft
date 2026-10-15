import { sql } from 'drizzle-orm';

import { hashPassword } from '../auth/password';
import { db } from './client';
import { categories, orderItems, orders, products, users, type NewProduct } from './schema';

async function seed() {
  const passwordHash = await hashPassword('beercraft123');

  db.transaction((tx) => {
    tx.delete(orderItems).run();
    tx.delete(orders).run();
    tx.delete(products).run();
    tx.delete(categories).run();
    tx.delete(users).run();
    // restart AUTOINCREMENT ids at 1 (the demo user is id 1)
    tx.run(sql`DELETE FROM sqlite_sequence`);

    const [ipa, stout, lager, sour] = tx
      .insert(categories)
      .values([
        { name: 'IPA', slug: 'ipa', description: 'Hoppy, bitter and aromatic pale ales.' },
        {
          name: 'Stout',
          slug: 'stout',
          description: 'Dark, roasty beers with coffee and chocolate notes.',
        },
        {
          name: 'Lager',
          slug: 'lager',
          description: 'Crisp, clean and refreshing bottom-fermented beers.',
        },
        { name: 'Sour', slug: 'sour', description: 'Tart and fruity wild or kettle-soured beers.' },
      ])
      .returning()
      .all();

    const productValues: NewProduct[] = [
      {
        categoryId: ipa.id,
        name: 'Hop Storm',
        slug: 'hop-storm',
        description: 'West Coast IPA, pine and grapefruit.',
        priceCents: 450,
        stock: 120,
        abv: 6.5,
      },
      {
        categoryId: ipa.id,
        name: 'Haze Runner',
        slug: 'haze-runner',
        description: 'Juicy New England IPA.',
        priceCents: 520,
        stock: 80,
        abv: 6.8,
      },
      {
        categoryId: ipa.id,
        name: 'Double Trouble',
        slug: 'double-trouble',
        description: 'Double IPA, resinous and bold.',
        priceCents: 650,
        stock: 40,
        abv: 8.5,
      },
      {
        categoryId: stout.id,
        name: 'Midnight Oil',
        slug: 'midnight-oil',
        description: 'Imperial stout with coffee notes.',
        priceCents: 700,
        stock: 30,
        abv: 10.2,
      },
      {
        categoryId: stout.id,
        name: 'Dry Harbour',
        slug: 'dry-harbour',
        description: 'Classic Irish dry stout.',
        priceCents: 380,
        stock: 100,
        abv: 4.2,
      },
      {
        categoryId: lager.id,
        name: 'Golden Hour',
        slug: 'golden-hour',
        description: 'Bavarian helles lager.',
        priceCents: 320,
        stock: 200,
        abv: 4.8,
      },
      {
        categoryId: lager.id,
        name: 'Pils Republic',
        slug: 'pils-republic',
        description: 'Czech-style pilsner.',
        priceCents: 340,
        stock: 150,
        abv: 5.0,
      },
      {
        categoryId: lager.id,
        name: 'Dark Matter',
        slug: 'dark-matter',
        description: 'Smooth Munich dunkel.',
        priceCents: 360,
        stock: 90,
        abv: 5.3,
      },
      {
        categoryId: sour.id,
        name: 'Raspberry Riot',
        slug: 'raspberry-riot',
        description: 'Raspberry Berliner weisse.',
        priceCents: 480,
        stock: 60,
        abv: 3.8,
      },
      {
        categoryId: sour.id,
        name: 'Gose Away',
        slug: 'gose-away',
        description: 'Salted gose with coriander.',
        priceCents: 460,
        stock: 50,
        abv: 4.5,
      },
    ];
    const insertedProducts = tx.insert(products).values(productValues).returning().all();

    const user = tx
      .insert(users)
      .values({ email: 'demo@beercraft.dev', name: 'Demo User', passwordHash })
      .returning()
      .get();

    const [first, second] = insertedProducts;
    const lines = [
      { product: first, quantity: 6 },
      { product: second, quantity: 4 },
    ];
    const order = tx
      .insert(orders)
      .values({
        userId: user.id,
        status: 'paid',
        totalCents: lines.reduce((sum, l) => sum + l.product.priceCents * l.quantity, 0),
      })
      .returning()
      .get();

    tx.insert(orderItems)
      .values(
        lines.map((l) => ({
          orderId: order.id,
          productId: l.product.id,
          quantity: l.quantity,
          unitPriceCents: l.product.priceCents,
        })),
      )
      .run();
  });

  console.log('Database seeded (demo user: demo@beercraft.dev / beercraft123)');
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
