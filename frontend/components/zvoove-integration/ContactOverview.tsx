import React, { useState, useEffect } from 'react';
import {
  Table,
  Form,
  Select,
  DatePicker,
  Checkbox,
  Card,
  Typography,
  Button,
  Space,
  Input,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  Badge
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

// TypeScript Interfaces
interface ContactOverviewProps {
  filters: ContactFilters;
  onFilterChange: (filters: ContactFilters) => void;
  contacts: Contact[];
  loading?: boolean;
}

interface ContactFilters {
  // Kontakt-Typ
  contactType: 'sales' | 'purchase' | 'all';
  
  // Sortierung
  sortBy: 'contactNumber' | 'name' | 'date' | 'representative';
  sortOrder: 'asc' | 'desc';
  
  // Selektion
  representative: string;
  dateRange: {
    from: dayjs.Dayjs | null;
    to: dayjs.Dayjs | null;
  };
  parity: string;
  
  // Optionen
  onlyPlannedAppointments: boolean;
  articleSumsInPrint: boolean;
  
  // Suchfelder
  searchText: string;
  contactNumber: string;
}

interface Contact {
  id: string;
  contactNumber: string;
  name: string;
  representative: string;
  contactType: 'sales' | 'purchase';
  appointmentDate?: dayjs.Dayjs;
  orderQuantity: number;
  remainingQuantity: number;
  status: 'active' | 'inactive' | 'planned';
  phone?: string;
  email?: string;
  lastContact?: dayjs.Dayjs;
  notes?: string;
}

const { RangePicker } = DatePicker;
const { Option } = Select;

export const ContactOverview: React.FC<ContactOverviewProps> = ({
  filters,
  onFilterChange,
  contacts,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts);

  // Statistiken berechnen
  const calculateStats = () => {
    const totalContacts = contacts.length;
    const salesContacts = contacts.filter(c => c.contactType === 'sales').length;
    const purchaseContacts = contacts.filter(c => c.contactType === 'purchase').length;
    const plannedAppointments = contacts.filter(c => c.status === 'planned').length;
    const totalOrderQuantity = contacts.reduce((sum, c) => sum + c.orderQuantity, 0);
    const totalRemainingQuantity = contacts.reduce((sum, c) => sum + c.remainingQuantity, 0);

    return {
      totalContacts,
      salesContacts,
      purchaseContacts,
      plannedAppointments,
      totalOrderQuantity,
      totalRemainingQuantity
    };
  };

  const stats = calculateStats();

  // Filter anwenden
  useEffect(() => {
    let filtered = [...contacts];

    // Kontakt-Typ Filter
    if (filters.contactType !== 'all') {
      filtered = filtered.filter(c => c.contactType === filters.contactType);
    }

    // Vertreter Filter
    if (filters.representative) {
      filtered = filtered.filter(c => 
        c.representative.toLowerCase().includes(filters.representative.toLowerCase())
      );
    }

    // Datumsbereich Filter
    if (filters.dateRange.from && filters.dateRange.to) {
      filtered = filtered.filter(c => {
        if (c.appointmentDate) {
          return c.appointmentDate.isAfter(filters.dateRange.from) && 
                 c.appointmentDate.isBefore(filters.dateRange.to);
        }
        return false;
      });
    }

    // Nur geplante Termine
    if (filters.onlyPlannedAppointments) {
      filtered = filtered.filter(c => c.status === 'planned');
    }

    // Suchtext Filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.contactNumber.toLowerCase().includes(searchLower) ||
        c.representative.toLowerCase().includes(searchLower)
      );
    }

    // Sortierung
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'contactNumber':
          aValue = a.contactNumber;
          bValue = b.contactNumber;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'date':
          aValue = a.appointmentDate || dayjs(0);
          bValue = b.appointmentDate || dayjs(0);
          break;
        case 'representative':
          aValue = a.representative;
          bValue = b.representative;
          break;
        default:
          aValue = a.contactNumber;
          bValue = b.contactNumber;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredContacts(filtered);
  }, [contacts, filters]);

  // Filter zurücksetzen
  const resetFilters = () => {
    const defaultFilters: ContactFilters = {
      contactType: 'all',
      sortBy: 'contactNumber',
      sortOrder: 'asc',
      representative: '',
      dateRange: { from: null, to: null },
      parity: '',
      onlyPlannedAppointments: false,
      articleSumsInPrint: false,
      searchText: '',
      contactNumber: ''
    };
    
    onFilterChange(defaultFilters);
    form.resetFields();
  };

  // Tabellen-Spalten definieren
  const columns: ColumnsType<Contact> = [
    {
      title: 'Kontakt-Nr.',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
      width: 120,
      render: (text: string) => (
        <Typography.Text strong>{text}</Typography.Text>
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Contact) => (
        <div>
          <Typography.Text strong>{text}</Typography.Text>
          <div className="flex items-center space-x-2 mt-1">
            {record.phone && (
              <Tooltip title={record.phone}>
                <PhoneOutlined className="text-gray-500" />
              </Tooltip>
            )}
            {record.email && (
              <Tooltip title={record.email}>
                <MailOutlined className="text-gray-500" />
              </Tooltip>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Vertreter',
      dataIndex: 'representative',
      key: 'representative',
      width: 150,
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      )
    },
    {
      title: 'Typ',
      dataIndex: 'contactType',
      key: 'contactType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'sales' ? 'green' : 'orange'}>
          {type === 'sales' ? 'Verkauf' : 'Einkauf'}
        </Tag>
      )
    },
    {
      title: 'Termin',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      width: 120,
      render: (date: dayjs.Dayjs) => (
        date ? (
          <div className="flex items-center space-x-1">
            <CalendarOutlined className="text-gray-500" />
            <Typography.Text>{date.format('DD.MM.YYYY')}</Typography.Text>
          </div>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        )
      )
    },
    {
      title: 'Abnahme-Menge',
      dataIndex: 'orderQuantity',
      key: 'orderQuantity',
      width: 120,
      render: (quantity: number) => (
        <Typography.Text strong>{quantity.toLocaleString()}</Typography.Text>
      )
    },
    {
      title: 'Rest-Menge',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      width: 120,
      render: (quantity: number) => (
        <Badge 
          count={quantity} 
          showZero 
          color={quantity > 0 ? 'orange' : 'green'}
        />
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'green', text: 'Aktiv' },
          inactive: { color: 'red', text: 'Inaktiv' },
          planned: { color: 'blue', text: 'Geplant' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Aktionen',
      key: 'actions',
      width: 120,
      render: (_, record: Contact) => (
        <Space>
          <Tooltip title="Anzeigen">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
            />
          </Tooltip>
          <Tooltip title="Bearbeiten">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistiken */}
      <Row gutter={16}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Gesamt Kontakte"
              value={stats.totalContacts}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Verkaufskontakte"
              value={stats.salesContacts}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Einkaufskontakte"
              value={stats.purchaseContacts}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Geplante Termine"
              value={stats.plannedAppointments}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Abnahme-Menge"
              value={stats.totalOrderQuantity}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Rest-Menge"
              value={stats.totalRemainingQuantity}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(_, allValues) => {
            const newFilters: ContactFilters = {
              ...filters,
              ...allValues
            };
            onFilterChange(newFilters);
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Kontakt-Typ" name="contactType">
                <Select placeholder="Alle Kontakte">
                  <Option value="all">Alle Kontakte</Option>
                  <Option value="sales">Verkaufskontakte</Option>
                  <Option value="purchase">Einkaufskontakte</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={6}>
              <Form.Item label="Vertreter" name="representative">
                <Input 
                  placeholder="Vertreter suchen"
                  prefix={<SearchOutlined />}
                />
              </Form.Item>
            </Col>
            
            <Col span={6}>
              <Form.Item label="Zeitraum" name="dateRange">
                <RangePicker 
                  placeholder={['Von', 'Bis']}
                  format="DD.MM.YYYY"
                />
              </Form.Item>
            </Col>
            
            <Col span={6}>
              <Form.Item label="Sortierung" name="sortBy">
                <Select placeholder="Sortierung">
                  <Option value="contactNumber">Kontaktnummer</Option>
                  <Option value="name">Name</Option>
                  <Option value="date">Datum</Option>
                  <Option value="representative">Vertreter</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Suche" name="searchText">
                <Input 
                  placeholder="Name, Kontaktnummer oder Vertreter"
                  prefix={<SearchOutlined />}
                />
              </Form.Item>
            </Col>
            
            <Col span={4}>
              <Form.Item label="Sortierreihenfolge" name="sortOrder">
                <Select>
                  <Option value="asc">Aufsteigend</Option>
                  <Option value="desc">Absteigend</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={6}>
              <Form.Item label="Optionen">
                <Space direction="vertical">
                  <Checkbox 
                    name="onlyPlannedAppointments"
                    checked={filters.onlyPlannedAppointments}
                    onChange={(e) => onFilterChange({
                      ...filters,
                      onlyPlannedAppointments: e.target.checked
                    })}
                  >
                    Nur geplante Termine
                  </Checkbox>
                  <Checkbox 
                    name="articleSumsInPrint"
                    checked={filters.articleSumsInPrint}
                    onChange={(e) => onFilterChange({
                      ...filters,
                      articleSumsInPrint: e.target.checked
                    })}
                  >
                    Artikel-Summen im Ausdruck
                  </Checkbox>
                </Space>
              </Form.Item>
            </Col>
            
            <Col span={6}>
              <Form.Item label="Aktionen">
                <Space>
                  <Button 
                    icon={<FilterOutlined />}
                    onClick={resetFilters}
                  >
                    Filter zurücksetzen
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />}
                    type="primary"
                  >
                    Export
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Tabelle */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredContacts}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredContacts.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} von ${total} Kontakten`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}; 