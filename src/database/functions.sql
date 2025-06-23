-- Fonction pour ajouter un produit avec ses prix
CREATE OR REPLACE FUNCTION add_product_with_prices(
    p_product JSONB,
    p_prices JSONB[]
) RETURNS JSONB AS $$
DECLARE
    new_product_id INTEGER;
    price_item JSONB;
    result JSONB;
BEGIN
    -- Insérer le produit
    INSERT INTO produits (
        nom, 
        type, 
        quantite, 
        marque, 
        volume, 
        categorie
    ) VALUES (
        p_product->>'nom',
        p_product->>'type',
        (p_product->>'quantite')::INTEGER,
        p_product->>'marque',
        (p_product->>'volume')::FLOAT,
        p_product->>'categorie'
    ) RETURNING id INTO new_product_id;

    -- Ajouter les prix
    FOREACH price_item IN ARRAY p_prices
    LOOP
        INSERT INTO prix_produit_magasin (
            produit_id,
            magasin_id,
            prix
        ) VALUES (
            new_product_id,
            (price_item->>'magasin_id')::INTEGER,
            (price_item->>'prix')::DECIMAL(10,2)
        );
    END LOOP;

    -- Retourner le produit avec son ID
    SELECT jsonb_build_object(
        'id', new_product_id,
        'nom', p_product->>'nom',
        'type', p_product->>'type',
        'quantite', (p_product->>'quantite')::INTEGER,
        'marque', p_product->>'marque',
        'volume', (p_product->>'volume')::FLOAT,
        'categorie', p_product->>'categorie',
        'prices', p_prices
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour exécuter du SQL dynamique (utilisée pour l'initialisation)
CREATE OR REPLACE FUNCTION pg_temp.execute_sql(query TEXT) 
RETURNS JSONB AS $$
BEGIN
    EXECUTE query;
    RETURN jsonb_build_object('status', 'success');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;
