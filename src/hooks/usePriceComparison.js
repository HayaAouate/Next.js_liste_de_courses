import { useState, useEffect } from 'react';
import { getCheapestProducts, getProductPrices as fetchProductPrices } from '../services/priceService';
import { addSampleData as addSampleDataService } from '../services/sampleDataService';

export function usePriceComparison(storeName) {
    const [storeProducts, setStoreProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!storeName) return;
        
        async function fetchAndComparePrices() {
            try {
                setIsLoading(true);
                const products = await getCheapestProducts(storeName);
                setStoreProducts(products);
                setError(null);
            } catch (err) {
                console.error('Erreur lors de la comparaison des prix:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAndComparePrices();
    }, [storeName]);

    // Fonction pour ajouter des exemples de données
    async function addSampleData() {
        try {
            await addSampleDataService();
            // Recharger les données après l'ajout des exemples
            const products = await getCheapestProducts(storeName);
            setStoreProducts(products);
        } catch (error) {
            console.error('Erreur lors de l\'ajout des exemples de données:', error);
            throw error;
        }
    }

    // Fonction pour obtenir les prix d'un produit dans tous les magasins
    async function getProductPrices(productId) {
        try {
            const prices = await fetchProductPrices(productId);
            return prices.map(p => ({
                prix: p.prix,
                magasin: p.magasin
            }));
        } catch (err) {
            console.error('Erreur lors de la récupération des prix:', err);
            return [];
        }
    }

    return {
        storeProducts,
        isLoading,
        error,
        addSampleData,
        getProductPrices
    };
}
