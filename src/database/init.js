import { supabaseClient } from '../lib/supabase';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

// Obtention du chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour exécuter le schéma SQL
export async function initDatabase() {
    try {
        // Lire le fichier de schéma
        const schemaPath = path.resolve(__dirname, 'queries/schema.sql');
        const schemaSQL = await readFile(schemaPath, 'utf8');
        
        // Exécuter chaque instruction SQL séparément
        const statements = schemaSQL
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);

        for (const statement of statements) {
            const { error } = await supabaseClient.rpc('pg_temp.execute_sql', { 
                query: statement 
            });
            
            if (error) {
                // Ignorer les erreurs de "relation already exists"
                if (!error.message.includes('already exists')) {
                    console.error('Erreur lors de l\'initialisation de la base de données:', error);
                    throw error;
                }
            }
        }

        console.log('Base de données initialisée avec succès');
        return { success: true };
    } catch (error) {
        console.error('Erreur critique lors de l\'initialisation de la base de données:', error);
        throw error;
    }
}

// Fonction utilitaire pour exécuter du SQL personnalisé
export async function executeSQL(query) {
    const { data, error } = await supabaseClient.rpc('pg_temp.execute_sql', { query });
    if (error) throw error;
    return data;
}

// Fonction pour ajouter des données de test
export async function addTestData() {
    // Vérifier si des données existent déjà
    const { count: productCount } = await supabaseClient
        .from('produits')
        .select('*', { count: 'exact', head: true });

    if (productCount > 0) {
        console.log('Des données existent déjà, pas d\'ajout de données de test');
        return { success: true, message: 'Données déjà existantes' };
    }

    // Ajouter des enseignes de test
    const { data: stores, error: storeError } = await supabaseClient
        .from('enseignes')
        .insert([
            { nom: 'Lidl' },
            { nom: 'Auchan' },
            { nom: 'Hypercacher' }
        ])
        .select();

    if (storeError) throw storeError;

    // Ajouter des produits de test avec leurs prix
    const testProducts = [
        {
            nom: 'Pommes Golden',
            type: 'Fruits',
            quantite: 1,
            marque: 'Bio',
            volume: 1,
            categorie: 'Fruits',
            prices: [
                { magasin_id: stores[0].id, prix: 1.99 },  // Lidl
                { magasin_id: stores[1].id, prix: 2.49 },  // Auchan
                { magasin_id: stores[2].id, prix: 2.99 }   // Hypercacher
            ]
        },
        // Ajoutez d'autres produits de test ici
    ];

    for (const product of testProducts) {
        const { prices, ...productData } = product;
        await supabaseClient.rpc('add_product_with_prices', {
            p_product: productData,
            p_prices: prices
        });
    }

    return { success: true, message: 'Données de test ajoutées avec succès' };
}
