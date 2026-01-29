import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Modal, Form, Input, Popconfirm, message, Switch, Tag } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    AppstoreOutlined, // Icon cho khoa phòng
    BarcodeOutlined,
    FileTextOutlined,
    LockOutlined,
    UnlockOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api/departments/';

const Departments = () => {
    // 1. Khởi tạo State
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);

    const [form] = Form.useForm();
    const navigate = useNavigate();

    // --- CÁC HÀM TIỆN ÍCH (Token, Auth) ---
    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const checkAuth = (response) => {
        if (response.status === 401) {
            message.error('Phiên đăng nhập hết hạn!');
            localStorage.removeItem('token');
            navigate('/login');
            return false;
        }
        return true;
    };

    // 2. Lấy danh sách Khoa/Phòng
    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: getHeaders(),
            });

            if (!checkAuth(response)) return;

            if (response.ok) {
                const data = await response.json();
                // Backend .NET thường trả về camelCase (id, departmentCode...)
                setDepartments(data);
            } else {
                message.error('Không thể tải danh sách khoa phòng.');
            }
        } catch (error) {
            console.error(error);
            message.error('Lỗi kết nối Server!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // 3. Xử lý Thêm / Sửa / Xóa

    const handleAdd = () => {
        setEditingDept(null);
        form.resetFields();
        // Mặc định isActive là true khi thêm mới
        form.setFieldsValue({ isActive: true });
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingDept(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });

            if (!checkAuth(response)) return;

            if (response.ok) {
                message.success('Đã xóa khoa phòng thành công!');
                fetchDepartments();
            } else {
                const errData = await response.json();
                // Lỗi ràng buộc khóa ngoại (Foreign Key) nếu khoa đã có user
                message.error(errData.message || 'Xóa thất bại (Khoa đang chứa User?)');
            }
        } catch (error) {
            message.error('Lỗi kết nối khi xóa!');
        }
    };

    // Update trạng thái (Active/Inactive)
    const handleToggleStatus = async (record) => {
        const newStatus = !record.isActive;
        try {
            const response = await fetch(`${API_URL}/${record.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ ...record, isActive: newStatus })
            });

            if (!checkAuth(response)) return;

            if (response.ok) {
                message.success(`Đã cập nhật trạng thái: ${record.departmentCode}`);
                fetchDepartments();
            } else {
                message.error('Cập nhật trạng thái thất bại!');
            }
        } catch (error) {
            message.error('Lỗi kết nối!');
        }
    };

    // Submit Form (Lưu)
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const method = editingDept ? 'PUT' : 'POST';
            const url = editingDept ? `${API_URL}/${editingDept.id}` : API_URL;

            // Nếu sửa, gán thêm ID vào body
            const payload = editingDept ? { ...values, id: editingDept.id } : values;

            const response = await fetch(url, {
                method: method,
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!checkAuth(response)) return;

            if (response.ok) {
                message.success(editingDept ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                setIsModalOpen(false);
                fetchDepartments();
            } else {
                const errData = await response.json();
                // Check lỗi trùng mã DepartmentCode
                message.error(errData.message || 'Thao tác thất bại (Mã khoa bị trùng?)');
            }
        } catch (error) {
            message.error('Lỗi kết nối Server!');
        } finally {
            setLoading(false);
        }
    };

    // 4. Cấu hình cột Bảng
    const columns = [
        {
            title: 'Mã khoa',
            dataIndex: 'departmentCode',
            key: 'departmentCode',
            render: (text) => <Tag color="geekblue">{text}</Tag> // Hiển thị dạng Tag cho đẹp
        },
        {
            title: 'Tên khoa / Phòng',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true, // Nếu dài quá thì hiện dấu ...
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
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
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        style={{ color: '#faad14' }}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Xóa khoa phòng?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 5. Giao diện chính
    return (
        <div>
            {/* Header Page */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Quản lý Khoa - Phòng</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm mới
                </Button>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={departments}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal Add/Edit */}
            <Modal
                title={editingDept ? "Chỉnh sửa Khoa/Phòng" : "Thêm Khoa/Phòng mới"}
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
                        name="departmentCode"
                        label="Mã khoa phòng"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã khoa!' },
                            { max: 50, message: 'Mã tối đa 50 ký tự' }
                        ]}
                    >
                        <Input
                            prefix={<BarcodeOutlined />}
                            placeholder="VD: KHOA_NOI, P_IT..."
                            // Mã khoa thường không nên cho sửa để đảm bảo tính nhất quán dữ liệu
                            disabled={!!editingDept}
                        />
                    </Form.Item>

                    <Form.Item
                        name="fullName"
                        label="Tên đầy đủ"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên khoa phòng!' },
                            { max: 200, message: 'Tên tối đa 200 ký tự' }
                        ]}
                    >
                        <Input prefix={<AppstoreOutlined />} placeholder="VD: Khoa Nội Tổng Hợp" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả chức năng"
                        rules={[{ max: 500, message: 'Mô tả tối đa 500 ký tự' }]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Mô tả chức năng, nhiệm vụ..."
                            prefix={<FileTextOutlined />} // TextArea không hỗ trợ prefix prop trực tiếp, nhưng để đây cho đồng bộ logic
                        />
                    </Form.Item>

                    {/* Checkbox Active (Chỉ hiện khi thêm mới, khi sửa đã có Switch ở bảng) */}
                    {!editingDept && (
                        <Form.Item name="isActive" valuePropName="checked">
                            <Switch checkedChildren="Hoạt động" unCheckedChildren="Đang khóa" defaultChecked />
                        </Form.Item>
                    )}

                    <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingDept ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Departments;