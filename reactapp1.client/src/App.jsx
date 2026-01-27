import { useState } from 'react';
import { Button, DatePicker, Card, Form, Input, Checkbox, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './App.css';

const { Title } = Typography;

function App() {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        console.log('Dữ liệu gửi đi:', values);
        setLoading(true);

        try {
            // 1. GỌI API ĐĂNG NHẬP (Kết nối Server .NET)
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: values.username, // Bên .NET nhận là property Username
                    password: values.password  // Bên .NET nhận là property Password
                }),
            });

            // 2. Đọc kết quả trả về từ Server
            const data = await response.json();

            // 3. Kiểm tra kết quả
            if (response.ok) {
                // --- THÀNH CÔNG ---
                message.success(`Chào mừng ${data.user.fullName} quay trở lại!`);

                // QUAN TRỌNG: Lưu "Vé thông hành" (Token) vào bộ nhớ trình duyệt
                localStorage.setItem('accessToken', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data.user));

                // Chuyển hướng hoặc làm gì đó sau khi đăng nhập (Ví dụ log ra console xem chơi)
                console.log("Token đã lưu:", data.token);
                console.log("Quyền hạn:", data.user.roles);
            } else {
                // --- THẤT BẠI (Sai pass hoặc user) ---
                // data.message lấy từ: return Unauthorized(new { message = "..." }) bên .NET
                message.error(data.message || 'Đăng nhập thất bại!');
            }

        } catch (error) {
            // --- LỖI KẾT NỐI (Server sập, mất mạng...) ---
            console.error('Lỗi:', error);
            message.error('Không thể kết nối đến Server!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={3}>Đăng Nhập Hệ Thống</Title>
                    <p>Quản lý thiết bị Y Tế</p>
                </div>

                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập Mã HIS!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Mã HIS (VD: ADMIN001)" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                        </Form.Item>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large">
                            Đăng nhập
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <span>Hoặc chọn ngày làm việc: </span>
                        <DatePicker style={{ width: '100%', marginTop: 10 }} />
                    </div>
                </Form>
            </Card>
        </div>
    );
}

export default App;