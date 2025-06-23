import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('VITE_SUPABASE_URL or VITE_SUPABASE_KEY is missing in environment variables');
}

// Utilisation d'un singleton pour éviter plusieurs instances
// Configuration des options globales pour inclure les en-têtes d'autorisation
const supabaseOptions = {
    global: {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    }
};

// Création du client Supabase avec les options
const supabaseClient = createClient(supabaseUrl, supabaseKey, supabaseOptions);

export  default supabaseClient ;
export { supabaseClient };

export async function insertProduits(produit) {
        try {
            const { data, error } = await supabaseClient
                .from('produits')
                .insert([produit])
                .select();

            if (error) {
                console.error('Erreur lors de l\'insertion des produits:', error);
                return { error };
            }
            console.log('Produits insérés avec succès:', data);
            return { data };
        } catch (error) {
            console.error('Erreur inattendue:', error);
            return { error };
        }
}
// Fonction pour lire les produits
export async function readProduits() {
    const { data, error } = await supabaseClient
        .from('produits')
        .select('*');

    if (error) {
        console.error('Erreur lors de la lecture des produits:', error);
        return null;
    }
    return data;
}

// Fonction pour mettre à jour un produit
export async function updateProduit(id, updates) {
    const { data, error } = await supabaseClient
        .from('produits')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Erreur lors de la mise à jour du produit:', error);
        return null;
    }
    return data;
}

// Fonction pour supprimer un produit
export async function deleteProduit(id) {
    const { data, error } = await supabaseClient
        .from('produits')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        return { error };
    }
    //verif di des produits restent dans la base de données
    const{ data: remainingProduits, error: fetchError } = await supabaseClient
        .from('produits')
        .select('*');

    if (fetchError) {
        console.log('Erreur lors de la verification des produits restants:', fetchError);
        return {error: 'Erreur lors de la verification des produits restants'};
    }
    if (!remainingProduits || remainingProduits.length === 0) {
        console.log('Aucun produit restant dans la liste');
        return { message: 'Aucun produit restant dans la liste' };
    }
    return data;
}


//avoir un impot avec un parametre sera utiliser ds insert Produit