import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Intercept fetch requests to append x-restaurant-id and Authorization headers automatically
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  const token = localStorage.getItem('token');
  const loggedInRestaurantId = localStorage.getItem('restaurant_id');
  
  const pathMatch = window.location.pathname.match(/\/restaurant\/([^/]+)/);
  const pathRestaurantId = pathMatch ? pathMatch[1] : null;
  const restaurantId = pathRestaurantId || loggedInRestaurantId;

  const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
  if (url.includes('/api') || url.includes('localhost:8080/api')) {
    init = init || {};
    const headers = new Headers(init.headers);
    
    if (restaurantId) {
      headers.set('x-restaurant-id', restaurantId);
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (typeof input === 'string') {
      init.headers = headers;
    } else if (input instanceof Request) {
      try {
        headers.forEach((value, key) => {
          input.headers.set(key, value);
        });
      } catch (e) {
        console.error('Error setting headers on Request object:', e);
      }
    }
  }
  return originalFetch.apply(this, arguments);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
