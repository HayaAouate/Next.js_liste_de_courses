import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// Vérification des variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY; // Utilisez la clé anon ou service_role

if (!supabaseUrl || !supabaseKey) {
  console.error('Veuillez configurer VITE_SUPABASE_URL et VITE_SUPABASE_KEY dans votre .env');
  // eslint-disable-next-line no-undef
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Types de produits pour notre liste de courses
const TYPES_PRODUITS = ['Fruits', 'Légumes', 'Viandes', 'Produits laitiers', 'Épicerie'];

// Génère un produit aléatoire
function genererProduit() {
  return {
    nom: faker.commerce.productName(),
    type: faker.helpers.arrayElement(TYPES_PRODUITS),
    quantite: faker.number.int({ min: 1, max: 5 }),
    achete: faker.datatype.boolean(),
    date_ajout: new Date().toISOString()
  };
}

async function seed() {
  console.log('Début de la création du jeu de données...');
  
  try {
    // Vérifier la connexion à Supabase
    const { error: testError } = await supabase
      .from('produits')
      .select('*')
      .limit(1);
      
    if (testError) {
      console.error('Erreur de connexion à Supabase:', testError);
      return;
    }

    // Créer 20 produits de test
    const produits = [];
    for (let i = 0; i < 20; i++) {
      produits.push(genererProduit());
    }

    // Vider la table avant d'insérer de nouvelles données (optionnel)
    const { error: deleteError } = await supabase
      .from('produits')
      .delete()
      .neq('id', 0);

    if (deleteError) {
      console.error('Erreur lors de la suppression des anciennes données:', deleteError);
      return;
    }

    // Insérer les produits dans la base de données
    const { data, error } = await supabase
      .from('produits')
      .insert(produits)
      .select();
    
    if (error) {
      console.error('Erreur lors de l\'insertion des données:', error);
      return;
    }
    
    console.log('✅ Jeu de données créé avec succès!');
    console.log(`${data.length} produits insérés.`);
    
  } catch (error) {
    console.error('Erreur inattendue:', error);
  } finally {
    // Fermer la connexion
    await supabase.auth.signOut();
    // eslint-disable-next-line no-undef
    process.exit(0);
  }
}

// Exécuter le script
seed().catch(console.error);
