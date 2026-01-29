import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Row, Col, Avatar, Tabs, message, Tag } from 'antd';
import { UserOutlined, PhoneOutlined, SolutionOutlined, IdcardOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';

const API_URL = '/api/Users';

const Profile = () => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    // Hàm lấy Header chứa Token
    const getHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    // 1. Lấy thông tin user hiện tại
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/me`, { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                form.setFieldsValue({
                    fullName: data.fullName,
                    username: data.username,
                    phoneNumber: data.phoneNumber,
                    jobTitle: data.jobTitle,
                    hisCodeAcc: data.hisCodeAcc
                });
            } else {
                message.error('Không thể tải thông tin hồ sơ');
            }
        } catch (error) {
            message.error('Lỗi kết nối!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // 2. Cập nhật thông tin chung
    const handleUpdateInfo = async (values) => {
        setLoading(true);
        try {
            // Gọi API Update (dùng ID của user đã lấy được)
            const res = await fetch(`${API_URL}/${user.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ ...user, ...values }) // Giữ nguyên các trường cũ, chỉ thay đổi trường form nhập
            });

            if (res.ok) {
                message.success('Cập nhật hồ sơ thành công!');
                fetchProfile(); // Load lại dữ liệu mới
            } else {
                message.error('Cập nhật thất bại!');
            }
        } catch {
            message.error('Lỗi hệ thống!');
        } finally {
            setLoading(false);
        }
    };

    // 3. Đổi mật khẩu (Logic giả lập, bạn cần API đổi pass riêng ở Backend)
    const handleChangePassword = async (values) => {
        // Backend cần xử lý việc check mật khẩu cũ và hash mật khẩu mới
        message.info('Chức năng này cần Backend hỗ trợ API đổi mật khẩu riêng!');
    };

    // --- GIAO DIỆN ---
    const items = [
        {
            key: '1',
            label: 'Thông tin chung',
            children: (
                <Form layout="vertical" form={form} onFinish={handleUpdateInfo}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Số điện thoại" name="phoneNumber">
                                <Input prefix={<PhoneOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Chức danh" name="jobTitle">
                                <Input prefix={<SolutionOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Mã liên kết HIS" name="hisCodeAcc">
                                <Input prefix={<IdcardOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Tên đăng nhập (Không thể sửa)" name="username">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                        Lưu thay đổi
                    </Button>
                </Form>
            ),
        },
        {
            key: '2',
            label: 'Bảo mật & Mật khẩu',
            children: (
                <Form layout="vertical" form={passwordForm} onFinish={handleChangePassword}>
                    <Form.Item label="Mật khẩu cũ" name="oldPassword" rules={[{ required: true }]}>
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    <Form.Item
                        label="Nhập lại mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" danger loading={loading}>
                        Đổi mật khẩu
                    </Button>
                </Form>
            ),
        },
    ];

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ marginBottom: 20 }}>Hồ sơ người dùng</h2>
            <Card>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Avatar size={100} style={{ backgroundColor: '#1677ff', fontSize: 32 }}>
                        {user?.fullName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <h3 style={{ marginTop: 10 }}>{user?.fullName}</h3>
                    <Tag color="blue">{user?.jobTitle || 'Nhân viên'}</Tag>
                </div>

                <Tabs defaultActiveKey="1" items={items} />
            </Card>
        </div>
    );
};

export default Profile;