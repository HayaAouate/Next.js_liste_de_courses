-- Suppression des tables si elles existent (attention, cela va supprimer les données)
DROP TABLE IF EXISTS public.prix_produit_magasin CASCADE;
DROP TABLE IF EXISTS public.produits CASCADE;
DROP TABLE IF EXISTS public.enseignes CASCADE;

-- Table des enseignes
CREATE TABLE public.enseignes (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des produits
CREATE TABLE public.produits (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    quantite INTEGER,
    marque VARCHAR(100),
    volume FLOAT,
    categorie VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table de liaison pour les prix des produits par magasin
CREATE TABLE public.prix_produit_magasin (
    id SERIAL PRIMARY KEY,
    produit_id INTEGER NOT NULL,
    magasin_id INTEGER NOT NULL,
    prix DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Contraintes de clé étrangère
    CONSTRAINT fk_produit 
        FOREIGN KEY (produit_id) 
        REFERENCES public.produits(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_magasin 
        FOREIGN KEY (magasin_id) 
        REFERENCES public.enseignes(id) 
        ON DELETE CASCADE,
    
    -- Contrainte d'unicité
    CONSTRAINT unique_produit_magasin 
        UNIQUE (produit_id, magasin_id)
);

-- Création des index pour optimiser les jointures
CREATE INDEX idx_prix_produit_magasin_produit_id 
    ON public.prix_produit_magasin(produit_id);
    
CREATE INDEX idx_prix_produit_magasin_magasin_id 
    ON public.prix_produit_magasin(magasin_id);

-- Activer le Row Level Security sur la table
ALTER TABLE public.prix_produit_magasin ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow read access to all authenticated users"
ON public.prix_produit_magasin
FOR SELECT
TO authenticated
USING (true);

-- Politique pour permettre l'insertion aux utilisateurs authentifiés
CREATE POLICY "Allow insert for authenticated users"
ON public.prix_produit_magasin
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Allow update for authenticated users"
ON public.prix_produit_magasin
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Politique pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Allow delete for authenticated users"
ON public.prix_produit_magasin
FOR DELETE
TO authenticated
USING (true);

-- Insertion des enseignes de test
INSERT INTO public.enseignes (nom) VALUES 
('Liddle'),
('Auchan'),
('Hypercacher')
ON CONFLICT (nom) DO NOTHING;

-- Insertion des produits de test
WITH inserted_products AS (
    INSERT INTO public.produits (nom, type, quantite, marque, volume, categorie)
    VALUES 
    ('Pommes Golden', 'Fruits', 1, 'Bio', 1.0, 'Fruits'),
    ('Bananes', 'Fruits', 6, 'Chiquita', 1.0, 'Fruits'),
    ('Oranges', 'Fruits', 4, 'Valencia', 1.0, 'Fruits')
    ON CONFLICT (nom) DO NOTHING
    RETURNING id, nom
)
-- Insertion des prix pour chaque produit et chaque enseigne
INSERT INTO public.prix_produit_magasin (produit_id, magasin_id, prix)
SELECT 
    p.id,
    e.id,
    CASE 
        WHEN e.nom = 'Liddle' AND p.nom = 'Pommes Golden' THEN 1.99
        WHEN e.nom = 'Auchan' AND p.nom = 'Pommes Golden' THEN 2.49
        WHEN e.nom = 'Hypercacher' AND p.nom = 'Pommes Golden' THEN 2.99
        WHEN e.nom = 'Liddle' AND p.nom = 'Bananes' THEN 2.49
        WHEN e.nom = 'Auchan' AND p.nom = 'Bananes' THEN 2.99
        WHEN e.nom = 'Hypercacher' AND p.nom = 'Bananes' THEN 3.49
        WHEN e.nom = 'Liddle' AND p.nom = 'Oranges' THEN 2.99
        WHEN e.nom = 'Auchan' AND p.nom = 'Oranges' THEN 3.49
        WHEN e.nom = 'Hypercacher' AND p.nom = 'Oranges' THEN 3.99
    END as prix
FROM 
    inserted_products p
CROSS JOIN 
    public.enseignes e
WHERE 
    CASE 
        WHEN e.nom = 'Liddle' AND p.nom = 'Pommes Golden' THEN 1.99
        WHEN e.nom = 'Auchan' AND p.nom = 'Pommes Golden' THEN 2.49
        WHEN e.nom = 'Hypercacher' AND p.nom = 'Pommes Golden' THEN 2.99
        WHEN e.nom = 'Liddle' AND p.nom = 'Bananes' THEN 2.49
        WHEN e.nom = 'Auchan' AND p.nom = 'Bananes' THEN 2.99
        WHEN e.nom = 'Hypercacher' AND p.nom = 'Bananes' THEN 3.49
        WHEN e.nom = 'Liddle' AND p.nom = 'Oranges' THEN 2.99
        WHEN e.nom = 'Auchan' AND p.nom = 'Oranges' THEN 3.49
        WHEN e.nom = 'Hypercacher' AND p.nom = 'Oranges' THEN 3.99
    END IS NOT NULL
ON CONFLICT (produit_id, magasin_id) DO NOTHING;

-- Fonction pour ajouter un produit avec ses prix
CREATE OR REPLACE FUNCTION public.add_product_with_prices(
    p_nom TEXT,
    p_type TEXT,
    p_quantite INTEGER,
    p_marque TEXT,
    p_volume FLOAT,
    p_categorie TEXT,
    p_prices JSONB
) 
RETURNS JSONB AS $$
DECLARE
    new_product_id INTEGER;
    price_item JSONB;
    result JSONB;
BEGIN
    -- Insérer le produit
    INSERT INTO public.produits (nom, type, quantite, marque, volume, categorie)
    VALUES (p_nom, p_type, p_quantite, p_marque, p_volume, p_categorie)
    RETURNING id INTO new_product_id;

    -- Ajouter les prix
    FOR price_item IN SELECT * FROM jsonb_array_elements(p_prices)
    LOOP
        INSERT INTO public.prix_produit_magasin (produit_id, magasin_id, prix)
        VALUES (
            new_product_id,
            (price_item->>'magasin_id')::INTEGER,
            (price_item->>'prix')::DECIMAL(10,2)
        )
        ON CONFLICT (produit_id, magasin_id) 
        DO UPDATE SET prix = EXCLUDED.prix;
    END LOOP;

    -- Retourner le résultat
    SELECT jsonb_build_object(
        'id', new_product_id,
        'nom', p_nom,
        'type', p_type,
        'quantite', p_quantite,
        'marque', p_marque,
        'volume', p_volume,
        'categorie', p_categorie
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;
