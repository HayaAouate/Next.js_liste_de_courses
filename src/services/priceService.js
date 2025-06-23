import { supabaseClient } from '../lib/supabase';

export async function getCheapestProducts(storeName) {
    try {
        // Récupérer les données nécessaires
        const [productsRes, pricesRes, storesRes] = await Promise.all([
            supabaseClient.from('produits').select('*'),
            supabaseClient.from('prix_produit_magasin').select('*'),
            supabaseClient.from('enseignes').select('*')
        ]);

        if (productsRes.error) throw productsRes.error;
        if (pricesRes.error) throw pricesRes.error;
        if (storesRes.error) throw storesRes.error;

        const products = productsRes.data;
        const prices = pricesRes.data;
        const stores = storesRes.data;

        // Trouver l'ID du magasin actuel
        const currentStore = stores.find(store => store.nom === storeName);
        if (!currentStore) return [];

        const productsInStore = [];
        
        // Pour chaque produit, vérifier s'il est le moins cher dans ce magasin
        products.forEach(product => {
            const productPrices = prices.filter(price => price.produit_id === product.id);
            
            if (productPrices.length > 0) {
                // Trouver le prix dans le magasin actuel
                const currentPrice = productPrices.find(price => price.magasin_id === currentStore.id);
                
                if (currentPrice) {
                    // Trouver le prix le plus bas pour ce produit
                    const cheapestPrice = productPrices.reduce((min, current) => 
                        (current.prix < min.prix) ? current : min
                    );
                    
                    // Vérifier si le prix actuel est le meilleur prix
                    const isCheapest = currentPrice.prix <= cheapestPrice.prix;
                    
                    productsInStore.push({
                        ...product,
                        price: currentPrice.prix,
                        isCheapest
                    });
                }
            }
        });

        // Trier les produits par nom
        return productsInStore.sort((a, b) => a.nom.localeCompare(b.nom));
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        throw error;
    }
}

export async function getProductPrices(productId) {
    try {
        const { data: prices, error } = await supabaseClient
            .from('prix_produit_magasin')
            .select(`
                prix,
                magasin_id,
                enseignes ( nom )
            `)
            .eq('produit_id', productId);
            
        if (error) throw error;
        
        return prices.map(p => ({
            prix: p.prix,
            magasin: p.enseignes.nom
        }));
    } catch (err) {
        console.error('Erreur lors de la récupération des prix:', err);
        return [];
    }
}
