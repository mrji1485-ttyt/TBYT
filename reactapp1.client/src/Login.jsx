import { useState } from 'react';
import { Button, DatePicker, Card, Form, Input, Checkbox, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './Style.css';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

function Login() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const onFinish = async (values) => {
        console.log('Dữ liệu gửi đi:', values);
        setLoading(true);

        try {
            // 1. GỌI API ĐĂNG NHẬP
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: values.username, 
                    password: values.password  
                }),
            });

            // 2. Đọc kết quả trả về từ Server
            const data = await response.json();

            // 3. Kiểm tra kết quả
            if (response.ok) {
                // --- THÀNH CÔNG ---
                message.success(`Chào mừng ${data.user.fullName} quay trở lại!`);

                // QUAN TRỌNG: Lưu Token vào bộ nhớ trình duyệt
                localStorage.setItem('accessToken', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data.user));

                //redirect to main layout or dashboard
                console.log("Token đã lưu:", data.token);
                console.log("Quyền hạn:", data.user.roles);

                navigate('/dashboard');// Chuyển hướng đến trang dashboard
            } else {
                // --- FAILURE ---
                message.error(data.message || 'Đăng nhập thất bại!');
            }

        } catch (error) {
            // --- LỖI KẾT NỐI ---
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
                    <Title level={3}>Hệ thống quản lý thiết bị Y Tế</Title>
                    <p>Đăng nhập</p>
                </div>

                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
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
                </Form>
            </Card>
        </div>
    );
}

export default Login;