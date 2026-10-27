import { Route, Routes } from 'react-router-dom';
import './App.css'
import { ItemDetailContainer } from './components/ItemDetailsContainer/ItemDetailContainer.jsx';
import { ItemListContainer } from './components/ItemListContainer/ItemListContainer.jsx';
import Cart from './components/cart/Cart.jsx';
import ProductFormContainer from './components/adminComponents/ProductForm/ProductFormContainer.jsx';
import ProductSuccess from './components/adminComponents/ProductSuccess.jsx';
import AdminLogin from './components/adminComponents/AdminLogin.jsx';
import AdminProducts from './components/adminComponents/AdminProducts.jsx';
import AdminOrders from './components/adminComponents/AdminOrders.jsx';
import ProtectedRoute from './components/protectedRoute/ProtectedRoute.jsx';
import AdminLayouts from './layouts/AdminLayouts.jsx';
import PublicLayouts from './layouts/PublicLayouts.jsx';

function App() {
  return (
    <Routes>
      <Route element={<PublicLayouts />}>
        <Route path="/" element={<ItemListContainer />} />
        <Route path="/category/:category" element={<ItemListContainer />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ItemDetailContainer />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayouts />}>
            <Route path="/admin" element={<ProductFormContainer />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route
              path="/admin/products/:id/edit"
              element={<ProductFormContainer />}
            />
            <Route
              path="/admin/products/success/:id"
              element={<ProductSuccess />}
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;