import { supabaseClient } from '../lib/supabase';

// Données d'exemple
const SAMPLE_PRODUCTS = [
    { 
        id: 9,
        nom: 'Pommes Golden',
        type: 'Fruits', 
        quantite: 1, 
        marque: 'Bio',
        volume: 1,
        categorie: 'Fruits',
        prix: {
            'Lidl': 1.89,
            'Liddle': 1.99,
            'Auchan': 2.49,
            'Hypercacher': 2.99
        }
    },
    {  id: 10,
        nom: 'Bananes', 
        type: 'Fruits', 
        quantite: 6, 
        marque: 'Chiquita',
        volume: 1,
        categorie: 'Fruits',
        prix: {
            'Lidl': 2.29,
            'Liddle': 2.49,
            'Auchan': 2.99,
            'Hypercacher': 3.49
        }
    },
    {  id: 11,
        nom: 'Oranges', 
        type: 'Fruits', 
        quantite: 4, 
        marque: 'Valencia',
        volume: 1,
        categorie: 'Fruits',
        prix: {
            'Lidl': 2.79,
            'Liddle': 2.99,
            'Auchan': 3.49,
            'Hypercacher': 3.99
        }
    }
];

export async function addSampleData() {
    try {

        const storeNames = ['Lidl', 'Liddle', 'Auchan', 'Hypercacher'];
        const { data: existingStores } = await supabaseClient
            .from('enseignes')
            .select('*')
            .in('nom', storeNames);


        const existingStoreNames = existingStores.map(store => store.nom);
        const storesToAdd = storeNames
            .filter(name => !existingStoreNames.includes(name))
            .map(nom => ({ nom }));

        if (storesToAdd.length > 0) {
            await supabaseClient
                .from('enseignes')
                .insert(storesToAdd);
        }
        
        // Récupérer à nouveau la liste des magasins pour avoir les IDs
        const { data: allStores } = await supabaseClient
            .from('enseignes')
            .select('*')
            .in('nom', storeNames);
            
        const storeIds = {};
        allStores.forEach(store => {
            storeIds[store.nom] = store.id;
        });

        // Récupérer tous les produits existants avec leurs prix
        const { data: existingProducts } = await supabaseClient
            .from('produits')
            .select('*, prix_produit_magasin(*)')
            .in('nom', SAMPLE_PRODUCTS.map(p => p.nom));

        const existingProductNames = existingProducts?.map(p => p.nom) || [];
        const productsToAdd = SAMPLE_PRODUCTS.filter(p => !existingProductNames.includes(p.nom));

        // Ajouter les nouveaux produits
        if (productsToAdd.length > 0) {
            const { data: newProducts, error: insertError } = await supabaseClient
                .from('produits')
                .insert(productsToAdd.map(({ prix, ...product }) => product))
                .select();
                
            console.log('Nouveaux produits ajoutés:', newProducts);
            if (insertError) {
                console.error('Erreur lors de l\'insertion des produits:', insertError);
            }

            // Ajouter les prix pour les nouveaux produits
            if (newProducts && newProducts.length > 0) {
                // Créer un mapping entre les noms de produits et les nouveaux IDs
                const productNameToId = {};
                newProducts.forEach(prod => {
                    productNameToId[prod.nom] = prod.id;
                });
                
                // Mettre à jour les prix avec les bons IDs
                await updateProductPrices(newProducts, SAMPLE_PRODUCTS, storeIds, productNameToId);
            }
        }

        
        // Mettre à jour les prix des produits existants si nécessaire
        if (existingProducts && existingProducts.length > 0) {
            await updateProductPrices(existingProducts, SAMPLE_PRODUCTS, storeIds);
        }

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de l\'ajout des exemples de données:', error);
        throw error;
    }
}

async function updateProductPrices(products, sampleProducts, storeIds, productNameToId = null) {
    const pricesToAdd = [];
    
    // Créer un mapping des noms de produits vers les IDs si non fourni
    if (!productNameToId) {
        productNameToId = {};
        products.forEach(prod => {
            productNameToId[prod.nom] = prod.id;
        });
    }
    
    for (const product of products) {
        // Trouver le produit dans SAMPLE_PRODUCTS pour obtenir les prix
        const productInfo = sampleProducts.find(p => p.nom === product.nom);
        
        if (productInfo?.prix) {
            // Vérifier les prix existants pour ce produit
            const existingPrices = product.prix_produit_magasin || [];
            
            // Pour chaque magasin défini dans les données d'exemple
            for (const [storeName, price] of Object.entries(productInfo.prix)) {
                const storeId = storeIds[storeName];
                if (!storeId) continue;
                
                // Vérifier si un prix existe déjà pour ce produit et ce magasin
                const existingPrice = existingPrices.find(p => p.magasin_id === storeId);
                
                if (!existingPrice) {
                    // Utiliser l'ID du produit depuis le mapping
                    const productId = productNameToId[product.nom] || product.id;
                    
                    // Aucun prix n'existe pour ce magasin, on l'ajoute
                    pricesToAdd.push({
                        produit_id: productId,
                        magasin_id: storeId,
                        prix: price
                    });
                }
                // Note: Si le prix existe déjà, on ne fait rien pour éviter d'écraser les modifications manuelles
            }
        }
    }
    
    // Insérer les nouveaux prix en une seule requête
    if (pricesToAdd.length > 0) {
        const { error } = await supabaseClient
            .from('prix_produit_magasin')
            .insert(pricesToAdd);
            
        if (error) {
            console.error('Erreur lors de l\'ajout des prix:', error);
            throw error;
        }
        console.log(`${pricesToAdd.length} nouveaux prix ajoutés`);
    }
}
