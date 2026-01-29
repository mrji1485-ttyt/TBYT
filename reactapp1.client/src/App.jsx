import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import các thành phần
import Login from './Login';
import MainLayout from './MainLayout';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Users from './pages/Users';
import Profiles from './pages/Profiles';

// --- PHẦN 1: ĐƯA CÁC HÀM NÀY RA NGOÀI (Trước function App) ---

// Hàm kiểm đăng nhập
const isAuthenticated = () => {
    // ⚠️ LƯU Ý: Phải khớp tên với lúc lưu bên Login.jsx (lúc nãy là 'token')
    const token = localStorage.getItem('accessToken');
    return token !== null && token !== "";
};

// Component bảo vệ (Phải nằm ngoài App)
const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// -------------------------------------------------------------

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Route Đăng nhập */}
                <Route path="/login" element={<Login />} />

                {/* 2. Route Admin */}
                <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    {/* Các trang con bên trong giao diện Admin */}
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="suppliers" element={<Suppliers />} />
                    <Route path="users" element={<Users />} />
                    <Route path="profiles" element={<Profile />} />
                </Route>

                {/* 3. Bắt các đường dẫn lạ -> Chuyển về Login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;