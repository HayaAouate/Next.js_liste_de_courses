import { supabaseClient } from '../lib/supabase';

// Fonction utilitaire pour effectuer des requêtes avec gestion des erreurs
async function fetchWithAuth(query) {
    const { data, error } = await query;
    if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(`Erreur lors de la récupération des données: ${error.message}`);
    }
    return data;
}

export async function getCheapestProducts(storeName) {
    try {
        if (!storeName) {
            throw new Error('Le nom du magasin est requis');
        }

        console.log(`Récupération des produits pour le magasin: ${storeName}`);
        
        // Récupérer les données nécessaires avec gestion d'erreur améliorée
        const [products, prices, stores] = await Promise.all([
            fetchWithAuth(supabaseClient.from('produits').select('*')),
            fetchWithAuth(supabaseClient.from('prix_produit_magasin').select('*')),
            fetchWithAuth(supabaseClient.from('enseignes').select('*'))
        ]);

        console.log('Données récupérées:', { products, prices, stores });

        // Trouver l'ID du magasin actuel
        console.log('Liste complète des magasins:', stores);
        const currentStore = stores.find(store => store.nom === storeName);
        console.log(`Magasin recherché: ${storeName}`, 'Magasin trouvé:', currentStore);
        
        if (!currentStore) {
            console.error(`Magasin non trouvé: ${storeName}`);
            return [];
        }

        const productsInStore = [];
        
        console.log(`Produits à analyser: ${products.length}`, 'Prix disponibles:', prices.length);
        
        // Pour chaque produit, vérifier s'il est le moins cher dans ce magasin
        products.forEach((product, index) => {
            console.log(`Traitement du produit ${index + 1}/${products.length}:`, product.nom);
            const productPrices = prices.filter(price => price.produit_id === product.id);
            
            if (productPrices.length > 0) {
                // Trouver le prix dans le magasin actuel
                const currentPrice = productPrices.find(price => price.magasin_id === currentStore.id);
                
                if (currentPrice) {
                    console.log(`Prix actuel pour ${product.nom} dans ${storeName}:`, currentPrice.prix);
                    
                    // Trouver le prix le plus bas pour ce produit
                    const cheapestPrice = productPrices.reduce((min, current) => {
                        console.log(`Comparaison des prix pour ${product.nom}:`, {
                            min: min.prix,
                            current: current.prix,
                            isCheaper: current.prix < min.prix
                        });
                        return (current.prix < min.prix) ? current : min;
                    });
                    
                    console.log(`Prix le plus bas pour ${product.nom}:`, cheapestPrice);
                    
                    // Vérifier si le prix actuel est le meilleur prix
                    const isCheapest = Math.abs(currentPrice.prix - cheapestPrice.prix) < 0.01; // Tolérance pour les arrondis
                    console.log(`Est-ce le meilleur prix pour ${product.nom}?`, isCheapest);
                    
                    // Ne garder que les produits avec le meilleur prix
                    if (isCheapest) {
                        productsInStore.push({
                            ...product,
                            price: currentPrice.prix,
                            isCheapest: true
                        });
                    }
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
