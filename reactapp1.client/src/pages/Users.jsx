import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Modal, Form, Input, Select, Tag, Popconfirm, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_ROOT } from '../config'; 

// Định nghĩa URL API gốc (Bạn sửa lại nếu backend khác)
const API_USERS = '${API_ROOT}/api/users';
const API_DEPARTMENTS = '${API_ROOT}/api/departments';
const Users = () => {
    // 1. Khởi tạo State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [departments, setDepartments] = useState([]);

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
            const response = await fetch(API_USERS, {
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

    const fetchDepartments = async () => {
        try {
            const response = await fetch(API_DEPARTMENTS, {
                method: 'GET',
                headers: getHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách khoa:", error);
        }
    };

    // Chạy khi load trang
    useEffect(() => {
        fetchDepartments();
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
            const response = await fetch(`${API_USERS}/${id}`, {
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
            const response = await fetch(`${API_USERS}/${record.id}`, {
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
            const url = editingUser ? `${API_USERS}/${editingUser.id}` : API_USERS;

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
            dataIndex: 'departmentID',
            key: 'department',
            render: (deptId) => {
                // 👇 Logic: Dùng ID tìm trong mảng departments để lấy tên hiển thị
                const dept = departments.find(d => d.id === deptId);
                return <Tag color="blue">{dept ? dept.fullName : 'Chưa phân khoa'}</Tag>;
            }// Sau này bổ xung IsActive thì uncomment đoạn dưới
            // {
            //     title: 'Trạng thái',
            //     dataIndex: 'isActive',
            //     render: (active, record) => (
            //         <Switch checked={active} onChange={() => handleToggleStatus(record)} />
            //     )
            // },
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Quản lý Người dùng</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingUser ? "Sửa thông tin" : "Thêm người dùng"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                        <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                        <Input disabled={!!editingUser} />
                    </Form.Item>

                    <Form.Item
                        name="passwordHash"
                        label={editingUser ? "Mật khẩu mới (Bỏ qua nếu không đổi)" : "Mật khẩu"}
                        rules={editingUser ? [] : [{ required: true, message: 'Nhập mật khẩu!' }]}
                    >
                        <Input.Password placeholder="******" />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <Form.Item name="phoneNumber" label="Số điện thoại" style={{ flex: 1 }}>
                            <Input prefix={<PhoneOutlined />} />
                        </Form.Item>
                        <Form.Item name="hisCodeAcc" label="Mã HIS" style={{ flex: 1 }}>
                            <Input prefix={<QrcodeOutlined />} />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <Form.Item name="jobTitle" label="Chức danh" style={{ flex: 1 }}>
                            <Input prefix={<SolutionOutlined />} />
                        </Form.Item>

                        {/* 👇 DROP DOWN CHỌN KHOA PHÒNG */}
                        <Form.Item
                            name="departmentID"
                            label="Khoa phòng"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: 'Vui lòng chọn khoa!' }]}
                        >
                            <Select
                                placeholder="-- Chọn khoa --"
                                loading={departments.length === 0} // Hiệu ứng xoay khi chưa tải xong data
                                showSearch // Cho phép gõ tìm kiếm
                                optionFilterProp="children" // Tìm kiếm theo tên hiển thị
                            >
                                {departments.map(dept => (
                                    <Select.Option key={dept.id} value={dept.id}>
                                        {dept.fullName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {editingUser ? "Cập nhật" : "Lưu lại"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Users;