import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';

const Dashboard = () => {
    return (
        <div>
            <h2>Tổng quan hệ thống</h2>
            <Row gutter={16}>
                <Col span={8}>
                    <Card><Statistic title="Tổng thiết bị" value={1128} /></Card>
                </Col>
                <Col span={8}>
                    <Card><Statistic title="Đang báo hỏng" value={5} valueStyle={{ color: '#cf1322' }} /></Card>
                </Col>
                <Col span={8}>
                    <Card><Statistic title="Nhà cung cấp" value={24} /></Card>
                </Col>
            </Row>
        </div>
    );
};
export default Dashboard;