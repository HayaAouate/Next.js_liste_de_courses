import { supabaseClient } from '../../lib/supabase';

// Récupérer tous les produits avec leurs prix par magasin
export async function getAllProductsWithPrices() {
    const { data, error } = await supabaseClient
        .from('produits')
        .select(`
            *,
            prix_produit_magasin!inner(
                prix,
                enseignes!inner(
                    id,
                    nom
                )
            )
        `);

    if (error) throw error;
    return data;
}

// Ajouter un nouveau produit avec ses prix
export async function addProductWithPrices(productData, prices) {
    const { data: product, error: productError } = await supabaseClient
        .from('produits')
        .insert(productData)
        .select()
        .single();

    if (productError) throw productError;

    // Ajouter les prix pour chaque magasin
    const pricesToInsert = prices.map(price => ({
        produit_id: product.id,
        magasin_id: price.magasin_id,
        prix: price.prix
    }));

    const { error: pricesError } = await supabaseClient
        .from('prix_produit_magasin')
        .insert(pricesToInsert);

    if (pricesError) throw pricesError;

    return { ...product, prices: pricesToInsert };
}

// Mettre à jour les prix d'un produit
export async function updateProductPrices(productId, prices) {
    // Supprimer les anciens prix
    const { error: deleteError } = await supabaseClient
        .from('prix_produit_magasin')
        .delete()
        .eq('produit_id', productId);

    if (deleteError) throw deleteError;

    // Ajouter les nouveaux prix
    const pricesToInsert = prices.map(price => ({
        produit_id: productId,
        magasin_id: price.magasin_id,
        prix: price.prix
    }));

    const { data, error: insertError } = await supabaseClient
        .from('prix_produit_magasin')
        .insert(pricesToInsert)
        .select();

    if (insertError) throw insertError;

    return data;
}

// Récupérer les produits par magasin avec leurs prix
export async function getProductsByStore(storeId) {
    const { data, error } = await supabaseClient
        .from('prix_produit_magasin')
        .select(`
            prix,
            produits!inner(*)
        `)
        .eq('magasin_id', storeId);

    if (error) throw error;
    return data.map(item => ({
        ...item.produits,
        prix: item.prix
    }));
}
