import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { Suspense } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Editor from './pages/Editor';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Corporate from './pages/Corporate';
import AdminDashboard from './pages/AdminDashboard';
import Success from './pages/Success';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';

const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white text-start flex flex-col">
      {!isAdminPath && <Navbar />}
      {!isAdminPath && <CartDrawer />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:categoryName" element={<Shop />} />
          <Route path="/product/:productId" element={<Editor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/order-success" element={<Success />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </Suspense>
  );
}

export default App;
