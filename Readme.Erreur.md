# Liste des erreurs et solutions

- **Erreur :**  
  `GET https://jastbbvbnpbsgryfjxei.supabase.co/rest/v1/courses?select=* 404 (Not Found)`  
  **Solution :**
    - Vérifier que la table **courses** existe dans la base Supabase
    - Vérifier l’orthographe exacte de la table
    - Contrôler les règles RLS qui peuvent bloquer l’accès

- **Erreur :**  
  SyntaxError liée à `import` dans Node.js :  
  `Cannot use import statement outside a module`  
  **Solution :**
    - Ajouter `"type": "module"` dans le `package.json`
    - Ou utiliser `require()` au lieu de `import`
    - Installer et configurer `dotenv` si besoin :
      ```bash
      npm install dotenv
      ```  
    - Charger dotenv dans le code :
      ```js
      require('dotenv').config()
      ```

- **Erreur :**  
  Variables d’environnement non chargées / manquantes  
  **Solution :**
    - Créer un fichier `.env` à la racine du projet
    - Préfixer les variables pour Vite avec `VITE_` (ex: `VITE_SUPABASE_URL`)
    - Redémarrer le serveur après modification du `.env`

- **Erreur :**  
    Lancer un fichier specifique
  **Solution :**
    -node src/lib/faker.js

- **Erreur :**
   Mis a jour den Front des produits supprimé , synchronisation avec la BDD ss recharger la page 
  **Solution :**
  Le problème vient du fait que l'état local (produits) n'est pas mis à jour après la suppression d'un produit dans la base de données. React met à jour l'interface utilisateur uniquement lorsque l'état local change. Pour résoudre ce problème, vous devez mettre à jour l'état produits après avoir supprimé un produit.  Voici la solution corrigée :
  Explication :
  Après l'appel à deleteProduit, filtrez l'état local pour retirer le produit supprimé.
  Cela déclenchera une mise à jour automatique de l'interface utilisateur sans recharger la page.

- **Erreur :**  
  App.jsx:2 Uncaught SyntaxError: The requested module '/src/lib/supabase.js' does not provide an export named 'insertProduits'
  **Solution :**
    - Vérifier que la fonction `insertProduits` est bien exportée dans `supabase.js`
- **Erreur :**  
    modifie le nom d'un composant NE PAS OUBLIER DE LE CHANGER DANS LES FICHIERS QUI L'UTILISENT AVEC LES IMPORTS

- **Erreur :** 
  Multiple GoTrueClient instances detected in the same browser context.
 It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.
- **Solution :**
  - Vérifier que vous n'initialisez pas plusieurs instances de `createClient` dans le même contexte.
  - Utiliser un seul client Supabase partagé dans toute l'application.
  
