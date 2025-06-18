import { useEffect, useState } from 'react';
import { supabaseClient,  deleteProduit, insertProduits } from './lib/supabase.js';

function Item({ name, onRemove }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '300px' }}>
            <span>{name}</span>
            <button onClick={onRemove}>Supprimer</button>
        </div>
    );
}

function App() {
    const [produits, setProduits] = useState([]);
    const [newProduct, setNewProduit] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProduits() {
            const { data, error } = await supabaseClient.from('produits').select('*');
            if (error) {
                setError(error.message);
            } else {
                setProduits(data);
            }
        }
        fetchProduits();
    }, []);

    const handleAddProduct = async () => {
        if (!newProduct.trim()) {
            alert('Veuillez entrer un nom de produit');
            return;
        }
        const produit = {
            nom: newProduct,
            type: '',
            quantite: 1,
        };
        const result = await insertProduits(produit);
        if (result.error) {
            console.error('Erreur détaillée:', result.error);
            setError('Erreur lors de l\'ajout du produit: ' + result.error.message);
        } else if (result.data && result.data.length > 0) {
            setProduits([...produits, result.data[0]]);
            setNewProduit('');
            setError(null);
        } else {
            setError('Aucune donnée retournée lors de l\'ajout du produit');
        }
    };

    const handleRemove = async (id) => {
        const { error } = await deleteProduit(id);
        if (error) {
            console.error('Erreur lors de la suppression:', error);
            setError(error.message);
        } else {
            setProduits(produits.filter((produit) => produit.id !== id));
        }
    };

    return (
        <div>
            <h1>Liste des produits</h1>
            {error && <p style={{ color: 'red' }}>Erreur : {error}</p>}
            <ul>
                {produits.map((produit) => (
                    <li key={produit.id}>
                        <Item name={`${produit.nom}   ${produit.quantite}`} onRemove={() => handleRemove(produit.id)} />
                    </li>
                ))}
            </ul>
            <div>
                <input
                    type="text"
                    placeholder="Nom du produit"
                    value={newProduct}
                    onChange={(e) => setNewProduit(e.target.value)}
                />
                <button onClick={handleAddProduct}>Ajouter</button>
            </div>
        </div>
    );
}

export default App;