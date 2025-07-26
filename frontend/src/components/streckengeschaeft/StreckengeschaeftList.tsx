import React, { useState } from 'react';
import { 
  Table, 
  Input, 
  Button, 
  Space, 
  Modal, 
  message, 
  Card, 
  Typography, 
  Tag, 
  Tooltip,
  Row,
  Col,
  Statistic,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Streckengeschaeft, 
  StreckengeschaeftFilter, 
  VorgangsTyp, 
  StreckenStatus,
  getVorgangsTypLabel, 
  getStatusLabel, 
  getStatusColor,
  formatCurrency,
  formatNumber,
  formatDate,
  calculateGewinn,
  calculateGewinnmarge,
  calculateDeckungsbeitrag,
  StreckengeschaeftSummen
} from '../../types/streckengeschaeft';
import { StreckengeschaeftForm } from './StreckengeschaeftForm';
import { StreckengeschaeftFilterPanel } from './StreckengeschaeftFilterPanel';

const { Search } = Input;
const { Title, Text } = Typography;

// Mock-Daten für erweiterte Felder
const mockStreckengeschaeftData: Streckengeschaeft[] = [
  {
    streckeNr: 'STR-2024-001',
    vorgangsTyp: VorgangsTyp.KAUF,
    datum: '2024-01-15',
    vorgangPosition: 'POS-001',
    positionsNr: '001',
    artikelVon: 'ART-001',
    artikelBis: 'ART-002',
    artikelBezeichnung: 'Holzpellets Premium',
    artikelNr: 'HP-001',
    sortenNr: 'SORT-001',
    vertrag: 'V-2024-001',
    lieferschein: 'LS-2024-001',
    kennzeichen: 'KENN-001',
    lkwKennzeichen: 'M-AB-1234',
    menge: 1000,
    einheit: 'kg',
    ekPreis: 0.25,
    vkPreis: 0.35,
    frachtkosten: 150,
    preisProEinheit: 0.30,
    ekMenge: 1000,
    ekNetto: 250,
    ekLieferkosten: 50,
    ekRechnung: 'EK-R-001',
    ekKontakt: 'Max Mustermann',
    ekKontaktNr: 'EK-001',
    vkMenge: 1000,
    vkNetto: 350,
    vkLieferkosten: 100,
    vkRechnung: 'VK-R-001',
    vkKontakt: 'Anna Schmidt',
    vkKontaktNr: 'VK-001',
    lieferant: 'Holzlieferant GmbH',
    lieferantName: 'Holzlieferant GmbH',
    lieferantNr: 'L-001',
    kunde: 'Energieversorger AG',
    kundeName: 'Energieversorger AG',
    kundeNr: 'K-001',
    spediteurNr: 'SP-001',
    spediteurName: 'Schnell Transport',
    frachtart: 'LKW',
    beEntladestelle: 'Lagerhalle Nord',
    beEntladestellePLZ: '12345',
    land: 'Deutschland',
    partienNr: 'PART-001',
    nlsNr: 'NLS-001',
    bereich: 'Biomasse',
    spediteur: 'Schnell Transport',
    start: 'Hamburg',
    ursprung: 'Skandinavien',
    lagerhalle: 'Lager Nord',
    fahrzeugKennzeichen: 'HH-AB-5678',
    kostenstelle: 'KS-001',
    bedarfsnummer: 'BED-001',
    summeVk: 350,
    summeEk: 250,
    restwert: 100,
    geplanteMengeVk: 1000,
    geplanteMengeEk: 1000,
    status: StreckenStatus.BESTÄTIGT,
    erstelltAm: '2024-01-10',
    geaendertAm: '2024-01-15',
    erstelltVon: 'admin',
    bemerkung: 'Premium-Qualität, schnelle Lieferung',
    referenzNr: 'REF-001',
    waehrung: 'EUR',
    skonto: 2,
    rabatt: 5,
    istBiomasse: true,
    hatEingangsrechnung: true,
    hatSpeditionsrechnung: true,
    hatFrachtabrechnung: true,
    deckungsbeitrag: 50
  },
  {
    streckeNr: 'STR-2024-002',
    vorgangsTyp: VorgangsTyp.VERKAUF,
    datum: '2024-01-20',
    vorgangPosition: 'POS-002',
    positionsNr: '002',
    artikelVon: 'ART-003',
    artikelBis: 'ART-004',
    artikelBezeichnung: 'Hackschnitzel Standard',
    artikelNr: 'HS-001',
    sortenNr: 'SORT-002',
    vertrag: 'V-2024-002',
    lieferschein: 'LS-2024-002',
    kennzeichen: 'KENN-002',
    lkwKennzeichen: 'M-CD-5678',
    menge: 2000,
    einheit: 'kg',
    ekPreis: 0.15,
    vkPreis: 0.25,
    frachtkosten: 200,
    preisProEinheit: 0.20,
    ekMenge: 2000,
    ekNetto: 300,
    ekLieferkosten: 75,
    ekRechnung: 'EK-R-002',
    ekKontakt: 'Peter Müller',
    ekKontaktNr: 'EK-002',
    vkMenge: 2000,
    vkNetto: 500,
    vkLieferkosten: 125,
    vkRechnung: 'VK-R-002',
    vkKontakt: 'Maria Weber',
    vkKontaktNr: 'VK-002',
    lieferant: 'Waldholz AG',
    lieferantName: 'Waldholz AG',
    lieferantNr: 'L-002',
    kunde: 'Heizwerk Süd',
    kundeName: 'Heizwerk Süd',
    kundeNr: 'K-002',
    spediteurNr: 'SP-002',
    spediteurName: 'Grün Transport',
    frachtart: 'LKW',
    beEntladestelle: 'Heizwerk Süd',
    beEntladestellePLZ: '54321',
    land: 'Deutschland',
    partienNr: 'PART-002',
    nlsNr: 'NLS-002',
    bereich: 'Biomasse',
    spediteur: 'Grün Transport',
    start: 'München',
    ursprung: 'Bayern',
    lagerhalle: 'Lager Süd',
    fahrzeugKennzeichen: 'M-CD-9012',
    kostenstelle: 'KS-002',
    bedarfsnummer: 'BED-002',
    summeVk: 500,
    summeEk: 300,
    restwert: 200,
    geplanteMengeVk: 2000,
    geplanteMengeEk: 2000,
    status: StreckenStatus.IN_BEARBEITUNG,
    erstelltAm: '2024-01-18',
    geaendertAm: '2024-01-20',
    erstelltVon: 'admin',
    bemerkung: 'Standard-Qualität, regionale Herkunft',
    referenzNr: 'REF-002',
    waehrung: 'EUR',
    skonto: 1,
    rabatt: 3,
    istBiomasse: true,
    hatEingangsrechnung: false,
    hatSpeditionsrechnung: true,
    hatFrachtabrechnung: false,
    deckungsbeitrag: 125
  }
];

// Mock-Summen-Daten
const mockSummen: StreckengeschaeftSummen = {
  ekBetragInklMwSt: 654.50,
  vkBetragInklMwSt: 1012.00,
  frachtkosten: 350.00,
  sollDifferenz: 357.50,
  istDifferenz: 350.00,
  mwst: 157.50,
  deckungsbeitrag: 175.00,
  differenzSollIst: 7.50,
  restMenge: 0,
  restWert: 300.00,
  geplanteMengenEk: 3000,
  geplanteMengenVk: 3000
};

export const StreckengeschaeftList: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<StreckengeschaeftFilter>({});
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Streckengeschaeft | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  const queryClient = useQueryClient();

  // Mock Query für Streckengeschäfte
  const { data: streckengeschaeftData = [], isLoading } = useQuery({
    queryKey: ['streckengeschaeft', filter, searchText],
    queryFn: () => {
      // Mock-Filterung
      let filteredData = [...mockStreckengeschaeftData];
      
      if (searchText) {
        filteredData = filteredData.filter(item =>
          item.streckeNr.toLowerCase().includes(searchText.toLowerCase()) ||
          item.artikelBezeichnung.toLowerCase().includes(searchText.toLowerCase()) ||
          item.lieferantName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.kundeName.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      
      return filteredData;
    }
  });

  // Mock Query für Summen
  const { data: summen = mockSummen } = useQuery({
    queryKey: ['streckengeschaeft-summen', filter],
    queryFn: () => mockSummen
  });

  // Mock Mutation für Erstellen/Bearbeiten
  const createMutation = useMutation({
    mutationFn: (data: Streckengeschaeft) => {
      return new Promise<Streckengeschaeft>((resolve) => {
        setTimeout(() => resolve(data), 1000);
      });
    },
    onSuccess: () => {
      message.success('Streckengeschäft erfolgreich erstellt');
      setIsFormVisible(false);
      queryClient.invalidateQueries({ queryKey: ['streckengeschaeft'] });
    }
  });

  // Mock Mutation für Löschen
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });
    },
    onSuccess: () => {
      message.success('Streckengeschäft erfolgreich gelöscht');
      queryClient.invalidateQueries({ queryKey: ['streckengeschaeft'] });
    }
  });

  const handleCreate = () => {
    setEditingRecord(null);
    setIsFormVisible(true);
  };

  const handleEdit = (record: Streckengeschaeft) => {
    setEditingRecord(record);
    setIsFormVisible(true);
  };

  const handleDelete = (record: Streckengeschaeft) => {
    Modal.confirm({
      title: 'Streckengeschäft löschen',
      content: `Möchten Sie das Streckengeschäft "${record.streckeNr}" wirklich löschen?`,
      okText: 'Löschen',
      okType: 'danger',
      cancelText: 'Abbrechen',
      onOk: () => deleteMutation.mutate(record.streckeNr)
    });
  };

  const handleFormSubmit = (values: any) => {
    if (editingRecord) {
      // Bearbeiten
      createMutation.mutate({ ...editingRecord, ...values });
    } else {
      // Erstellen
      const newRecord: Streckengeschaeft = {
        ...values,
        streckeNr: `STR-${Date.now()}`,
        status: StreckenStatus.ENTWURF,
        erstelltAm: new Date().toISOString().split('T')[0],
        geaendertAm: new Date().toISOString().split('T')[0],
        erstelltVon: 'admin'
      };
      createMutation.mutate(newRecord);
    }
  };

  const columns = [
    {
      title: 'Strecke-Nr.',
      dataIndex: 'streckeNr',
      key: 'streckeNr',
      fixed: 'left' as const,
      width: 120,
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Datum',
      dataIndex: 'datum',
      key: 'datum',
      width: 100,
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Vorgang',
      dataIndex: 'vorgangsTyp',
      key: 'vorgangsTyp',
      width: 100,
      render: (text: VorgangsTyp) => (
        <Tag color={text === VorgangsTyp.KAUF ? 'blue' : 'green'}>
          {getVorgangsTypLabel(text)}
        </Tag>
      )
    },
    {
      title: 'Vorgangsposition',
      dataIndex: 'vorgangPosition',
      key: 'vorgangPosition',
      width: 120
    },
    {
      title: 'Positions-Nr.',
      dataIndex: 'positionsNr',
      key: 'positionsNr',
      width: 100
    },
    {
      title: 'Vertrag',
      dataIndex: 'vertrag',
      key: 'vertrag',
      width: 100
    },
    {
      title: 'Lieferschein',
      dataIndex: 'lieferschein',
      key: 'lieferschein',
      width: 120
    },
    {
      title: 'Kennzeichen',
      dataIndex: 'kennzeichen',
      key: 'kennzeichen',
      width: 100
    },
    {
      title: 'Artikel-Nr.',
      dataIndex: 'artikelNr',
      key: 'artikelNr',
      width: 100
    },
    {
      title: 'Artikelbezeichnung',
      dataIndex: 'artikelBezeichnung',
      key: 'artikelBezeichnung',
      width: 200
    },
    {
      title: 'Bereich',
      dataIndex: 'bereich',
      key: 'bereich',
      width: 100
    },
    {
      title: 'Lieferant',
      dataIndex: 'lieferantName',
      key: 'lieferantName',
      width: 150
    },
    {
      title: 'EK-Kontakt',
      dataIndex: 'ekKontakt',
      key: 'ekKontakt',
      width: 120
    },
    {
      title: 'EK-Menge',
      dataIndex: 'ekMenge',
      key: 'ekMenge',
      width: 100,
      render: (value: number) => formatNumber(value)
    },
    {
      title: 'EK-Netto',
      dataIndex: 'ekNetto',
      key: 'ekNetto',
      width: 100,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'EK-Lieferkosten',
      dataIndex: 'ekLieferkosten',
      key: 'ekLieferkosten',
      width: 120,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'EK-Rechnung',
      dataIndex: 'ekRechnung',
      key: 'ekRechnung',
      width: 100
    },
    {
      title: 'Kunde',
      dataIndex: 'kundeName',
      key: 'kundeName',
      width: 150
    },
    {
      title: 'VK-Kontakt',
      dataIndex: 'vkKontakt',
      key: 'vkKontakt',
      width: 120
    },
    {
      title: 'VK-Menge',
      dataIndex: 'vkMenge',
      key: 'vkMenge',
      width: 100,
      render: (value: number) => formatNumber(value)
    },
    {
      title: 'VK-Netto',
      dataIndex: 'vkNetto',
      key: 'vkNetto',
      width: 100,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'VK-Lieferkosten',
      dataIndex: 'vkLieferkosten',
      key: 'vkLieferkosten',
      width: 120,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'VK-Rechnung',
      dataIndex: 'vkRechnung',
      key: 'vkRechnung',
      width: 100
    },
    {
      title: 'Spediteur-Nr.',
      dataIndex: 'spediteurNr',
      key: 'spediteurNr',
      width: 100
    },
    {
      title: 'Speditionsname',
      dataIndex: 'spediteurName',
      key: 'spediteurName',
      width: 150
    },
    {
      title: 'Frachtart',
      dataIndex: 'frachtart',
      key: 'frachtart',
      width: 100
    },
    {
      title: 'Frachtkosten',
      dataIndex: 'frachtkosten',
      key: 'frachtkosten',
      width: 100,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'Preis pro Einheit',
      dataIndex: 'preisProEinheit',
      key: 'preisProEinheit',
      width: 120,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'Summe VK',
      dataIndex: 'summeVk',
      key: 'summeVk',
      width: 100,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'Summe EK',
      dataIndex: 'summeEk',
      key: 'summeEk',
      width: 100,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'Restwert',
      dataIndex: 'restwert',
      key: 'restwert',
      width: 100,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'Geplante Menge VK',
      dataIndex: 'geplanteMengeVk',
      key: 'geplanteMengeVk',
      width: 140,
      render: (value: number) => formatNumber(value)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      fixed: 'right' as const,
      render: (text: StreckenStatus) => (
        <Tag color={getStatusColor(text)}>
          {getStatusLabel(text)}
        </Tag>
      )
    },
    {
      title: 'Aktionen',
      key: 'actions',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: Streckengeschaeft) => (
        <Space size="small">
          <Tooltip title="Anzeigen">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />} 
            />
          </Tooltip>
          <Tooltip title="Bearbeiten">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Löschen">
            <Button 
              type="text" 
              size="small" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Title level={3}>Streckengeschäfte</Title>
        <Space>
          <Button 
            icon={<DownloadOutlined />}
            onClick={() => message.info('Export-Funktion wird implementiert')}
          >
            Export
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['streckengeschaeft'] })}
            loading={isLoading}
          >
            Aktualisieren
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Neues Streckengeschäft
          </Button>
        </Space>
      </div>

      {/* Filter Panel */}
      <StreckengeschaeftFilterPanel
        onFilterChange={setFilter}
        onReset={() => setFilter({})}
        loading={isLoading}
      />

      {/* Summen-Anzeige */}
      <Card size="small" className="mb-4">
        <Row gutter={16}>
          <Col span={3}>
            <Statistic 
              title="EK-Betrag inkl. MwSt." 
              value={summen.ekBetragInklMwSt} 
              precision={2}
              suffix="€"
            />
          </Col>
          <Col span={3}>
            <Statistic 
              title="VK-Betrag inkl. MwSt." 
              value={summen.vkBetragInklMwSt} 
              precision={2}
              suffix="€"
            />
          </Col>
          <Col span={3}>
            <Statistic 
              title="Frachtkosten" 
              value={summen.frachtkosten} 
              precision={2}
              suffix="€"
            />
          </Col>
          <Col span={3}>
            <Statistic 
              title="Soll/Ist Differenz" 
              value={summen.sollDifferenz} 
              precision={2}
              suffix="€"
            />
          </Col>
          <Col span={3}>
            <Statistic 
              title="MwSt." 
              value={summen.mwst} 
              precision={2}
              suffix="€"
            />
          </Col>
          <Col span={3}>
            <Statistic 
              title="Deckungsbeitrag" 
              value={summen.deckungsbeitrag} 
              precision={2}
              suffix="€"
              valueStyle={{ color: summen.deckungsbeitrag > 0 ? '#3f8600' : '#cf1322' }}
            />
          </Col>
          <Col span={3}>
            <Statistic 
              title="Differenz Soll/Ist" 
              value={summen.differenzSollIst} 
              precision={2}
              suffix="€"
              valueStyle={{ color: summen.differenzSollIst > 0 ? '#3f8600' : '#cf1322' }}
            />
          </Col>
          <Col span={3}>
            <Statistic 
              title="Rest-Menge" 
              value={summen.restMenge} 
              suffix="kg"
            />
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={3}>
            <Statistic 
              title="Rest-Wert" 
              value={summen.restWert} 
              precision={2}
              suffix="€"
            />
          </Col>
          <Col span={3}>
            <Statistic 
              title="Geplante Mengen EK" 
              value={summen.geplanteMengenEk} 
              suffix="kg"
            />
          </Col>
          <Col span={3}>
            <Statistic 
              title="Geplante Mengen VK" 
              value={summen.geplanteMengenVk} 
              suffix="kg"
            />
          </Col>
        </Row>
      </Card>

      {/* Tabelle */}
      <Card>
        <div className="mb-4">
          <Search
            placeholder="Streckengeschäfte durchsuchen..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={streckengeschaeftData}
          rowKey="streckeNr"
          loading={isLoading}
          scroll={{ x: 3000 }}
          pagination={{
            total: streckengeschaeftData.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} von ${total} Streckengeschäften`
          }}
          rowSelection={rowSelection}
          size="small"
        />
      </Card>

      {/* Form Modal */}
      <Modal
        title={editingRecord ? 'Streckengeschäft bearbeiten' : 'Neues Streckengeschäft'}
        open={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        footer={null}
        width={1200}
        destroyOnClose
      >
        <StreckengeschaeftForm
          initialData={editingRecord}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormVisible(false)}
          loading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
}; 