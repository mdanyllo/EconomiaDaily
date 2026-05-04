import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    try {
      axios.get('http://157.151.13.163:4000/pending')
      setOffers(res.data);
    } catch {
      console.log('Sem backend ainda');
    }
  }

  return (
    <div style={{
      padding: 30,
      fontFamily: 'Arial',
      background: '#111',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1>EconomiaDaily Admin</h1>

      <h2>Promoções pendentes</h2>

      {offers.length === 0 ? (
        <p>Nenhuma promoção pendente</p>
      ) : (
        offers.map((offer) => (
          <div
            key={offer.id}
            style={{
              border: '1px solid #333',
              padding: 20,
              marginBottom: 15,
              borderRadius: 10
            }}
          >
            <h3>{offer.title}</h3>
            <p>R$ {offer.price}</p>
          </div>
        ))
      )}
    </div>
  );
}
