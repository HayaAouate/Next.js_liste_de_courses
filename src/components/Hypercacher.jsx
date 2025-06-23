import { usePriceComparison } from '../hooks/usePriceComparison';

const Hypercacher = () => {
    const { storeProducts, isLoading, error, addSampleData } = usePriceComparison('Hypercacher');

    if (isLoading) return <div>Chargement des produits...</div>;
    if (error) return <div>Erreur: {error}</div>;

    return (
        <div style={{ width: '100%' }}>
            <h2 className="title">Hypercacher - Meilleurs prix</h2>
            
            {storeProducts.length > 0 ? (
                <div className="box">
                    <table className="table is-fullwidth">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th className="has-text-right">Prix</th>
                                <th>Meilleur prix</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storeProducts.map(product => (
                                <tr key={product.id}>
                                    <td>{product.nom}</td>
                                    <td className="has-text-right has-text-weight-bold">
                                        {product.price.toFixed(2)}€
                                    </td>
                                    <td>
                                        {product.isCheapest ? (
                                            <span className="tag is-success">Meilleur prix</span>
                                        ) : (
                                            <span className="tag is-light">Prix moyen</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="notification is-light">
                    <p>Aucun produit n'est actuellement le moins cher dans ce magasin.</p>
                    <button 
                        className="button is-small is-primary mt-2"
                        onClick={addSampleData}
                    >
                        Ajouter des exemples de données
                    </button>
                </div>
            )}
        </div>
    );
};

export default Hypercacher;