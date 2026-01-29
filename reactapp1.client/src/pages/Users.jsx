import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Modal, Form, Input, Select, Tag, Popconfirm, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Định nghĩa URL API gốc (Bạn sửa lại nếu backend khác)
const API_URL = '/api/users';

const Users = () => {
    // 1. Khởi tạo State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [form] = Form.useForm();
    const navigate = useNavigate();

    // Hàm lấy Header có chứa Token
    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Hàm kiểm tra lỗi 401 (Hết hạn token)
    const checkAuth = (response) => {
        if (response.status === 401) {
            message.error('Phiên đăng nhập hết hạn!');
            localStorage.removeItem('token');
            navigate('/login');
            return false;
        }
        return true;
    };

    // 2. Lấy danh sách Users từ Database
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: getHeaders(),
            });

            if (!checkAuth(response)) return;

            if (response.ok) {
                const data = await response.json();
                setUsers(data); // Backend cần trả về mảng danh sách user
            } else {
                message.error('Không thể tải danh sách người dùng.');
            }
        } catch (error) {
            console.error(error);
            message.error('Lỗi kết nối Server!');
        } finally {
            setLoading(false);
        }
    };

    // Chạy khi load trang
    useEffect(() => {
        fetchUsers();
    }, []);

    // 3. Các hàm xử lý hành động

    // Mở Modal Thêm mới
    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    // Mở Modal Sửa
    const handleEdit = (record) => {
        setEditingUser(record);
        // Lưu ý: Password thường không trả về từ API, nên form sẽ để trống ô pass
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    // Xử lý Xóa (DELETE)
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });

            if (!checkAuth(response)) return;

            if (response.ok) {
                message.success('Đã xóa người dùng thành công!');
                fetchUsers(); // Load lại dữ liệu mới nhất
            } else {
                const errData = await response.json();
                message.error(errData.message || 'Xóa thất bại!');
            }
        } catch (error) {
            error.message('Lỗi kết nối khi xóa!');
        }
    };

    // Xử lý Khóa/Mở khóa nhanh (PUT Update Status)
    const handleToggleStatus = async (record) => {
        const newStatus = !record.isActive;
        try {
            // Giả sử Backend có API update riêng hoặc dùng API update chung
            // Ở đây dùng API update user chung, chỉ gửi field cần sửa
            const response = await fetch(`${API_URL}/${record.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ ...record, isActive: newStatus })
            });

            if (!checkAuth(response)) return;

            if (response.ok) {
                message.success(`Đã ${newStatus ? 'mở khóa' : 'khóa'} tài khoản ${record.userName}`);
                fetchUsers(); // Load lại bảng
            } else {
                message.error('Cập nhật trạng thái thất bại!');
            }
        } catch (error) {
            error.message('Lỗi kết nối!');
        }
    };

    // Xử lý khi bấm nút "Lưu" (CREATE hoặc UPDATE)
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const method = editingUser ? 'PUT' : 'POST';
            const url = editingUser ? `${API_URL}/${editingUser.id}` : API_URL;

            // Nếu đang sửa mà không nhập password -> Xóa field password đi để Backend không update đè
            if (editingUser && !values.password) {
                delete values.password;
            }

            // Gắn thêm ID nếu là sửa (một số backend cần ID trong body)
            const payload = editingUser ? { ...values, id: editingUser.id } : values;

            const response = await fetch(url, {
                method: method,
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!checkAuth(response)) return;

            if (response.ok) {
                message.success(editingUser ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                setIsModalOpen(false);
                fetchUsers(); // Load lại dữ liệu
            } else {
                const errData = await response.json();
                message.error(errData.message || 'Thao tác thất bại (Trùng tên đăng nhập?)');
            }
        } catch (error) {
            error.message('Lỗi kết nối Server!');
        } finally {
            setLoading(false);
        }
    };

    // 4. Cấu hình cột bảng
    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Tài khoản',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Khoa phòng',
            dataIndex: 'department',
            key: 'department',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (active, record) => (
                <Switch
                    checked={active}
                    onChange={() => handleToggleStatus(record)}
                    checkedChildren={<UnlockOutlined />}
                    unCheckedChildren={<LockOutlined />}
                />
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        style={{ color: '#faad14' }}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa người dùng?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 5. Giao diện (Render)
    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Danh sách Người dùng</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm người dùng
                </Button>
            </div>

            {/* Bảng dữ liệu */}
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal Form */}
            <Modal
                title={editingUser ? "Chỉnh sửa thông tin" : "Thêm người dùng mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input placeholder="Ví dụ: Nguyễn Văn A" prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="userName"
                        label="Tên đăng nhập"
                        rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
                    >
                        <Input placeholder="Ví dụ: admin001" disabled={!!editingUser} />
                    </Form.Item>

                    {/* Logic hiển thị mật khẩu: 
                        - Khi thêm mới: Bắt buộc nhập.
                        - Khi sửa: Không bắt buộc (nhập thì đổi, không nhập thì thôi). 
                    */}
                    <Form.Item
                        name="password"
                        label={editingUser ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"}
                        rules={editingUser ? [] : [{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu..." />
                    </Form.Item>

                    <Form.Item
                        name="department"
                        label="Khoa phòng / Bộ phận"
                        rules={[{ required: true, message: 'Vui lòng chọn khoa phòng!' }]}
                    >
                        <Select placeholder="Chọn khoa phòng">
                            <Select.Option value="IT">Phòng IT</Select.Option>
                            <Select.Option value="Ban Giam Doc">Ban Giám Đốc</Select.Option>
                            <Select.Option value="Khoa Noi">Khoa Nội</Select.Option>
                            <Select.Option value="Khoa Ngoai">Khoa Ngoại</Select.Option>
                            <Select.Option value="Chan Doan Hinh Anh">Chẩn đoán hình ảnh</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingUser ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Users;