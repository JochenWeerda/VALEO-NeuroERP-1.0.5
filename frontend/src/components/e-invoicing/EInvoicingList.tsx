import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card, Row, Col, Statistic, Input, Select, DatePicker } from 'antd';
import { DownloadOutlined, EyeOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceSummary, InvoiceFilter, InvoiceStatus } from '../../types/invoices';
import { EInvoicingApi } from '../../services/eInvoicingApi';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface EInvoicingListProps {
  // Props für die e-Invoicing-Liste
}

const EInvoicingList: React.FC<EInvoicingListProps> = () => {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<InvoiceFilter>({
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchInvoices();
  }, [filter, pagination.current, pagination.pageSize]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await EInvoicingApi.getInvoices(filter);
      setInvoices(data);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (error) {
      console.error('Fehler beim Laden der e-Rechnungen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoiceId: string) => {
    try {
      const blob = await EInvoicingApi.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Fehler beim Herunterladen:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'green';
      case 'PENDING': return 'orange';
      case 'OVERDUE': return 'red';
      case 'DRAFT': return 'blue';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Bezahlt';
      case 'PENDING': return 'Ausstehend';
      case 'OVERDUE': return 'Überfällig';
      case 'DRAFT': return 'Entwurf';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'Rechnungsnummer',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      fixed: 'left' as const,
      width: 150,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Kunde',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 200,
    },
    {
      title: 'Betrag',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number, record: InvoiceSummary) => 
        formatCurrency(amount, record.currency),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Erstellt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Aktionen',
      key: 'actions',
      fixed: 'right' as const,
      width: 150,
      render: (text: string, record: InvoiceSummary) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.invoiceId)}
            title="Anzeigen"
          />
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.invoiceId)}
            title="Herunterladen"
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.invoiceId)}
            title="Löschen"
          />
        </Space>
      ),
    },
  ];

  const handleView = (invoiceId: string) => {
    // Implementierung für Anzeigen der e-Rechnung
    console.log('Anzeigen e-Rechnung:', invoiceId);
  };

  const handleDelete = (invoiceId: string) => {
    // Implementierung für Löschen der e-Rechnung
    console.log('Löschen e-Rechnung:', invoiceId);
  };

  const handleSearch = (value: string) => {
    setFilter(prev => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilter(prev => ({ ...prev, status: value as InvoiceStatus }));
  };

  const handleDateRangeFilter = (dates: any) => {
    if (dates) {
      setFilter(prev => ({
        ...prev,
        startDate: dates[0]?.toISOString(),
        endDate: dates[1]?.toISOString(),
      }));
    } else {
      setFilter(prev => ({
        ...prev,
        startDate: '',
        endDate: ''
      }));
    }
  };

  const handleTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  // Mock-Statistiken
  const statistics = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    pendingInvoices: invoices.filter(inv => inv.status === 'open').length,
  };

  return (
    <div className="p-6">
      {/* Statistiken */}
      <Card size="small" className="mb-4">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Gesamt e-Rechnungen"
              value={statistics.totalInvoices}
              suffix="Stück"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Gesamtbetrag"
              value={statistics.totalAmount}
              precision={2}
              suffix="€"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Bezahlte e-Rechnungen"
              value={statistics.paidInvoices}
              suffix="Stück"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Ausstehende e-Rechnungen"
              value={statistics.pendingInvoices}
              suffix="Stück"
            />
          </Col>
        </Row>
      </Card>

      {/* Filter */}
      <Card size="small" className="mb-4">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="Suche nach Rechnungsnummer oder Kunde"
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusFilter}
            >
              <Option value="PAID">Bezahlt</Option>
              <Option value="PENDING">Ausstehend</Option>
              <Option value="OVERDUE">Überfällig</Option>
              <Option value="DRAFT">Entwurf</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['Startdatum', 'Enddatum']}
              onChange={handleDateRangeFilter}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => console.log('Neue e-Rechnung erstellen')}
              >
                Neue e-Rechnung
              </Button>
              <Button onClick={fetchInvoices}>
                Aktualisieren
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabelle */}
      <Card>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="invoiceId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} von ${total} e-Rechnungen`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default EInvoicingList; 