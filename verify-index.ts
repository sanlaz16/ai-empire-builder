
import { searchProductIndex } from './src/lib/productIndex';

async function test() {
    console.log('Testing Product Index...');
    try {
        const results = await searchProductIndex({
            niche: 'Pets',
            limit: 5
        });
        console.log(`Success! Found ${results.length} products.`);
        console.log(JSON.stringify(results[0], null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
