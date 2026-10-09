import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Beranda from './pages/Beranda';
import Menu from './pages/Menu';
import DetailPaket from './pages/DetailPaket';
import Keranjang from './pages/Keranjang';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import PesananSukses from './pages/PesananSukses';
import RiwayatPesanan from './pages/RiwayatPesanan';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Beranda />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/:id" element={<DetailPaket />} />
        <Route path="/keranjang" element={<Keranjang />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pesanan-sukses/:id"
          element={
            <ProtectedRoute>
              <PesananSukses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pesanan-saya"
          element={
            <ProtectedRoute>
              <RiwayatPesanan />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
