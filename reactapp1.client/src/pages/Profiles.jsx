import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Row, Col, Avatar, Tabs, message, Tag } from 'antd';
import { UserOutlined, PhoneOutlined, SolutionOutlined, IdcardOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { API_ROOT } from '../config';
const API_USERS = `${API_ROOT}/api/Users`;

const Profile = () => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    // Hàm lấy Header chứa Token
    const getHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // 1. Lấy thông tin user hiện tại
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_USERS}/me`, {
                method: 'GET',
                headers: getHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                form.setFieldsValue({
                    FullName: data.fullName || data.FullName,
                    UserName: data.userName || data.UserName,
                    PhoneNumber: data.phoneNumber || data.PhoneNumber,
                    JobTitle: data.jobTitle || data.JobTitle,
                    HisCodeAcc: data.hisCodeAcc || data.HisCodeAcc
                });
            } else {
                message.error('Không thể tải thông tin hồ sơ');
            }
        } catch (error) {
            error.message('Lỗi kết nối!');
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
            const res = await fetch(`${API_USERS}/${user.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ ...user, ...values })
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

    // 3. Đổi mật khẩu
    const handleChangePassword = async (values) => {
        message.info(values+'Chức năng này cần Backend hỗ trợ API đổi mật khẩu riêng!');
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
                            <Form.Item label="Họ và tên" name="FullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Số điện thoại" name="PhoneNumber">
                                <Input prefix={<PhoneOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Chức danh" name="JobTitle">
                                <Input prefix={<SolutionOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Mã liên kết HIS" name="HisCodeAcc">
                                <Input prefix={<IdcardOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Tên đăng nhập (Không thể sửa)" name="UserName">
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