import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown } from 'antd';
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const navigate = useNavigate();
    const location = useLocation();

    // Cấu hình Menu bên trái
    const items = [
        { key: '/dashboard', icon: <PieChartOutlined />, label: 'Tổng quan' },
        { key: '/suppliers', icon: <DesktopOutlined />, label: 'Nhà cung cấp' },
        { key: '/users', icon: <UserOutlined />, label: 'Người dùng' },
        { key: '/devices', icon: <FileOutlined />, label: 'Thiết bị' },
        { key: '/reports', icon: <TeamOutlined />, label: 'Báo cáo' },
    ];

    // Xử lý khi bấm menu
    const handleMenuClick = (e) => {
        navigate(e.key);
    };

    // Xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('accessToken'); // Xóa token
        navigate('/login'); // Quay về login
    };
    // Xử lý Profile
    const handleProfileClick = () => {
        navigate('/profiles');
    };

    // --- Khai báo Menu ---
    const menuItems = [
        {
            key: '1',
            icon: <UserOutlined />,
            label: 'Hồ sơ cá nhân',
            onClick: handleProfileClick,
        },
        {
            type: 'divider', // Dòng kẻ ngang
        },
        {
            key: '2',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true, 
            onClick: handleLogout, 
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* --- SIDEBAR TRÁI --- */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}

                // Cấu hình Mobile
                breakpoint="lg"
                collapsedWidth="0"
                onBreakpoint={(broken) => {
                    setCollapsed(broken);
                }}

                style={{
                    height: '100vh',
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    zIndex: 1000
                }}
            >
                {/* Logo */}
                <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />

                
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={items}
                    onClick={handleMenuClick}  //
                />
            </Sider>

            {/* --- KHUNG BÊN PHẢI --- */}
            <Layout>
                {/* HEADER */}
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    {/* User Info góc phải */}
                    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                            <span style={{ fontWeight: 600 }}>Xin chào, Admin</span>
                        </div>
                    </Dropdown>
                </Header>

                {/* CONTENT (Nơi chứa Form nhập liệu) */}
                <Content style={{ margin: '16px 16px' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {/* Outlet là nơi react-router sẽ hiển thị các trang con vào đây */}
                        <Outlet />
                    </div>
                </Content>

                {/* FOOTER */}
                <Footer style={{ textAlign: 'center' }}>
                    Hệ thống Quản lý Thiết bị ©2026 Created by CNTT TTYT Lục Yên Team
                </Footer>
            </Layout>
        </Layout>
    );
};

export default MainLayout;