import React from 'react';
import { Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const Suppliers = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Danh sách Nhà cung cấp</h2>
                <Button type="primary" icon={<PlusOutlined />}>Thêm mới</Button>
            </div>
            <p>Form nhập liệu sẽ nằm ở đây...</p>
        </div>
    );
};
export default Suppliers;