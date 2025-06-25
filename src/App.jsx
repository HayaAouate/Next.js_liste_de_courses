import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { useEffect, useState } from 'react';
import { supabaseClient,  deleteProduit, insertProduits } from './lib/supabase.js';
import Tabs from './components/Tabs.jsx';
import 'bulma/css/bulma.min.css';
import Hypercacher from './components/Hypercacher.jsx';
import Auchan from './components/Auchan.jsx';
import Lidl from './components/Lidl.jsx';
import {addSampleData} from "./services/sampleDataService.js";


function Item({ name, onRemove }) {
    return (
        <div className="box is-flex is-justify-content-space-between is-align-items-center">
            <span>{name}</span>
            <button className="button is-danger is-small" onClick={onRemove}>Supprimer</button>
        </div>
    );
}


function Home() {
    const [produits, setProduits] = useState([]);
    const [newProduct, setNewProduit] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        async function initData() {
        try {
            await addSampleData()
                .then(() => {
                    console.log('Exemples de données ajoutés avec succès');
                })
                .catch((error) => {
                    console.error('Erreur lors de l\'ajout des exemples de données:', error);
                }, []);
            } catch (error) {
            console.error('Erreur lors de l\'initialisation des données:', error);
        }
        } initData();
    }, []);


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
        const result = await deleteProduit(id);
        if (result && result.error) {
            console.error('Erreur lors de la suppression:', result.error);
            setError(result.error.message || 'Erreur lors de la suppression');
            return;
        }
        
        // Mise à jour de la liste des produits après suppression réussie
        const updatedProduits = produits.filter((produit) => produit.id !== id);
        setProduits(updatedProduits);

        if (updatedProduits.length === 0) {
            setError('Aucun produit restant dans la liste');
        } else {
            setError(null); // Réinitialiser l'erreur si tout s'est bien passé
        }
        }

    return (
        <div className={"container"}>
            <h1 className="title has-text-centered">Liste des produits</h1>
            {error && <p className="notification is-danger" style={{ color: 'black' }}>{error}</p>}
            <ul>
                {produits.map((produit) => (
                    <li key={produit.id}>
                        <Item name={`${produit.nom}   ${produit.quantite}`} onRemove={() => handleRemove(produit.id)} />
                    </li>
                ))}
            </ul>
            <div className={"field"}>
                <div className={"control"}>
                <input className={"input"}
                    type="text"
                    placeholder="Nom du produit"
                    value={newProduct}
                    onChange={(e) => setNewProduit(e.target.value)}
                />
                </div>
                <button className="button is-primary mt-2" onClick={handleAddProduct}>Ajouter</button>
            </div>
        </div>
    );
}



// Composant principal de l'application
function App() {
    const tabs = ['Hypercacher', 'Auchan', 'Lidl'];

    return (
        <Router>
            <div className="container is-fluid p-0" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Tabs tabs={tabs} />
                <div className="section p-4" style={{ flex: 1, overflow: 'auto' }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/hypercacher" element={<Hypercacher />} />
                        <Route path="/auchan" element={<Auchan />} />
                        <Route path="/lidl" element={<Lidl />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
