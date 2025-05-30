import { useState } from 'react';

function Item({ name, onRemove }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '300px' }}>
      <span>{name}</span>
      <button onClick={onRemove}>Supprimer</button>
    </div>
  );
}

function App() {
  const [items, setItems] = useState(['Pomme ', 'Bannane', 'Coca Zero']);

  const addItem = () => {
    const inputNewItem = prompt("Ajouter un nouveau produit");
   
    if (!inputNewItem || inputNewItem.trim() === "") {
     return; // Ne fait rien
  }

  setItems([...items, inputNewItem.trim()]);

  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div >
      <h1>Liste de course :</h1> 
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <Item name={item} onRemove={() =>  removeItem(index)} />
          </li>
        ))}
      </ul>
      <button onClick={ addItem}>Ajouter</button>
    </div>
  );
}

export default App;
