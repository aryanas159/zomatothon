import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3001/api/recommendations';
const QUICK_PICK_ITEMS = [1, 7, 12, 18, 23, 31, 44, 56];

function App() {
  const [itemInput, setItemInput] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [cartRecommendations, setCartRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [itemsById, setItemsById] = useState({});
  const [itemIdByName, setItemIdByName] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch trending items on load
  useEffect(() => {
    fetchItemsCatalog();
    fetchTrending();
  }, []);

  const addItemToCart = (itemId) => {
    const parsed = parseInt(itemId, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
      setError('Please enter a valid positive item ID.');
      return;
    }
    setError(null);
    if (!cartItems.includes(parsed)) {
      setCartItems((prev) => [...prev, parsed]);
    }
    setItemInput('');
  };

  const removeItemFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item !== itemId));
  };

  const getCartSuggestions = async () => {
    if (cartItems.length === 0) {
      setError('Add at least one item to the cart first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        cart: cartItems.join(','),
        top_n: '6'
      });
      const response = await fetch(`${API_BASE}/cart?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      setCartRecommendations(data.recommendations || []);
    } catch (err) {
      setError('Failed to fetch cart recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await fetch(`${API_BASE}/trending`);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      setTrending(data.trending || []);
    } catch (err) {
      console.error("Trending fetch failed", err);
    }
  };

  const fetchItemsCatalog = async () => {
    try {
      const response = await fetch(`${API_BASE}/items`);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      const catalog = data.items || [];
      const idMap = {};
      const nameMap = {};

      catalog.forEach((item) => {
        idMap[item.item_id] = item.name;
        if (!nameMap[item.name]) {
          nameMap[item.name] = item.item_id;
        }
      });

      setItemsById(idMap);
      setItemIdByName(nameMap);
    } catch (err) {
      console.error('Item catalog fetch failed', err);
    }
  };

  const getItemDisplay = (itemId) => {
    const name = itemsById[itemId];
    return name ? `${name} (ID ${itemId})` : `Item ${itemId}`;
  };

  const getRecommendationDisplay = (name) => {
    const id = itemIdByName[name];
    return Number.isInteger(id) ? `${name} (ID ${id})` : name;
  };

  return (
    <div className="app-page">
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />

      <header className="app-header">
        <p className="badge">Live Cart Recommendation Demo</p>
        <h1 className="app-title">Zomatothon Engine</h1>
        <p className="app-subtitle">Add items to a cart and get instant ML-powered suggestions.</p>
      </header>

      <main className="layout-grid">
        <section className="panel">
          <h2 className="panel-title">Build Cart</h2>
          <div className="panel-controls">
            <div className="input-row">
              <input
                type="number"
                placeholder="Enter item ID"
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                className="input"
              />
              <button className="button secondary-button" onClick={() => addItemToCart(itemInput)}>
                Add
              </button>
            </div>
            <div className="quick-picks">
              {QUICK_PICK_ITEMS.map((item) => (
                <button
                  key={item}
                  className="chip"
                  onClick={() => addItemToCart(item)}
                >
                  + {getItemDisplay(item)}
                </button>
              ))}
            </div>
            <div className="cart-list">
              {cartItems.length > 0 ? cartItems.map((item) => (
                <div key={item} className="cart-row">
                  <span>{getItemDisplay(item)}</span>
                  <button className="remove-btn" onClick={() => removeItemFromCart(item)}>
                    Remove
                  </button>
                </div>
              )) : <p className="empty-message">Your cart is empty.</p>}
            </div>
            <button onClick={getCartSuggestions} className="button">
              Get Cart Suggestions
            </button>
          </div>
        </section>

        <div className="main-content">
          <section>
            <h2 className="section-title">Suggested Next Adds</h2>
            {error ? <p className="error-message">{error}</p> : null}
            {loading ? (
              <div className="loading">Crunching cart patterns...</div>
            ) : (
              <div className="cards-grid cards-grid-two">
                {cartRecommendations.length > 0 ? cartRecommendations.map((item, idx) => (
                  <RecommendationCard key={`${item}-${idx}`} label={getRecommendationDisplay(item)} type="For This Cart" />
                )) : (
                  <p className="empty-message">Add items to cart and click "Get Cart Suggestions".</p>
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="section-title">
              Trending Now
            </h2>
            <div className="cards-grid cards-grid-three">
              {trending.length > 0 ? trending.map((item, idx) => (
                <RecommendationCard key={`${item}-${idx}`} label={getRecommendationDisplay(item)} type="Trending" />
              )) : <p className="empty-message">No trending data available.</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const RecommendationCard = ({ label, type }) => (
  <div className="restaurant-card">
    <div className="card-type">{type}</div>
    <div className="card-title">{label}</div>
    <div className="card-tags">
      <span className="tag tag-green">Highly Rated</span>
      <span className="tag tag-blue">Fast Delivery</span>
    </div>
  </div>
);

export default App;
