import React from 'react';
import '../styles/Inventory.css';

const Inventory = () => {
  const products = [
    { name: 'Mushrooms', quantity: '123g', entryDate: '05/24/2024', expiryDate: '06/04/2024' },
    { name: 'Meat', quantity: '123g', entryDate: '06/04/2024', expiryDate: '06/04/2024' },
    // Add more products here
  ];

  return (
    <div className="inventory-container">
      <h1>Inventory - Raw Materials</h1>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Entry Date</th>
            <th>Expiration Date</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod, index) => (
            <tr key={index}>
              <td>{prod.name}</td>
              <td>{prod.quantity}</td>
              <td>{prod.entryDate}</td>
              <td>{prod.expiryDate}</td>
              <td>Expires on {prod.expiryDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
