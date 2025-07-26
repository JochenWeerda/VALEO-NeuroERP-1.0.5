import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Button, 
  Card, 
  Collapse, 
  Checkbox, 
  Row, 
  Col, 
  Divider,
  Tabs,
  Typography,
  Space
} from 'antd';
import { 
  FilterOutlined, 
  SearchOutlined, 
  ClearOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { 
  StreckengeschaeftFilter, 
  VorgangsTyp, 
  StreckenStatus, 
  BiomasseOption,
  getVorgangsTypLabel, 
  getStatusLabel, 
  getBiomasseOptionLabel 
} from '../../types/streckengeschaeft';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface StreckengeschaeftFilterPanelProps {
  onFilterChange: (filter: StreckengeschaeftFilter) => void;
  onReset: () => void;
  loading?: boolean;
}

export const StreckengeschaeftFilterPanel: React.FC<StreckengeschaeftFilterPanelProps> = ({
  onFilterChange,
  onReset,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (allValues: any) => {
    const { datumRange, ...restValues } = allValues;
    
    const filterData: StreckengeschaeftFilter = {
      ...restValues,
      datumVon: datumRange?.[0]?.format('YYYY-MM-DD'),
      datumBis: datumRange?.[1]?.format('YYYY-MM-DD'),
    };

    onFilterChange(filterData);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const vorgangsTypOptions = Object.values(VorgangsTyp).map(typ => ({
    label: getVorgangsTypLabel(typ),
    value: typ
  }));

  const statusOptions = Object.values(StreckenStatus).map(status => ({
    label: getStatusLabel(status),
    value: status
  }));

  const biomasseOptions = Object.values(BiomasseOption).map(option => ({
    label: getBiomasseOptionLabel(option),
    value: option
  }));

  return (
    <Card 
      className="mb-4 shadow-sm"
      title={
        <Space>
          <FilterOutlined />
          <span>Filter für Streckengeschäfte</span>
        </Space>
      }
      extra={
        <Space>
          <Button
            type="text"
            icon={expanded ? <FilterOutlined /> : <FilterOutlined />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Einklappen' : 'Ausklappen'}
          </Button>
        </Space>
      }
    >
      <Collapse activeKey={expanded ? ['1'] : []} ghost>
        <Collapse.Panel key="1" showArrow={false} header="">
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleFilterChange}
            className="mt-4"
          >
            <Tabs defaultActiveKey="1" size="small">
              
              {/* STRECKE Tab */}
              <TabPane tab="STRECKE" key="1">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Strecke-Nr. von" name="streckeNrVon">
                      <Input placeholder="Von Strecke-Nr." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Strecke-Nr. bis" name="streckeNrBis">
                      <Input placeholder="Bis Strecke-Nr." />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Artikel-Nr. von" name="artikelNrVon">
                      <Input placeholder="Von Artikel-Nr." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Artikel-Nr. bis" name="artikelNrBis">
                      <Input placeholder="Bis Artikel-Nr." />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="nurErledigte" valuePropName="checked">
                      <Checkbox>Nur erledigte Strecken</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="nurUnerledigte" valuePropName="checked">
                      <Checkbox>Nur unerledigte Strecken</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="vorgaengeGetrennt" valuePropName="checked">
                      <Checkbox>Vorgänge getrennt</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              {/* LIEFERANTEN/KUNDEN Tab */}
              <TabPane tab="LIEFERANTEN/KUNDEN" key="2">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Lieferant-Nr. von" name="lieferantNrVon">
                      <Input placeholder="Von Lieferant-Nr." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Lieferant-Nr. bis" name="lieferantNrBis">
                      <Input placeholder="Bis Lieferant-Nr." />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Kunde-Nr. von" name="kundeNrVon">
                      <Input placeholder="Von Kunde-Nr." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Kunde-Nr. bis" name="kundeNrBis">
                      <Input placeholder="Bis Kunde-Nr." />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="nurOhneLieferant" valuePropName="checked">
                      <Checkbox>Nur Strecken ohne Lieferant</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="nurOhneKunde" valuePropName="checked">
                      <Checkbox>Nur Strecken ohne Kunde</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              {/* KONTRAKTE Tab */}
              <TabPane tab="KONTRAKTE" key="3">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="EK-Kontakt-Nr. von" name="ekKontaktNrVon">
                      <Input placeholder="Von EK-Kontakt-Nr." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="EK-Kontakt-Nr. bis" name="ekKontaktNrBis">
                      <Input placeholder="Bis EK-Kontakt-Nr." />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="VK-Kontakt-Nr. von" name="vkKontaktNrVon">
                      <Input placeholder="Von VK-Kontakt-Nr." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="VK-Kontakt-Nr. bis" name="vkKontaktNrBis">
                      <Input placeholder="Bis VK-Kontakt-Nr." />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="EK/VK nach Biomasse" name="biomasseOption">
                      <Select placeholder="Biomasse-Option wählen">
                        {biomasseOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              {/* LIEFERRECHNUNG Tab */}
              <TabPane tab="LIEFERRECHNUNG" key="4">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Liefer-Rechnungsdatum von" name="lieferRechnungsdatumVon">
                      <DatePicker placeholder="Von Datum" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Liefer-Rechnungsdatum bis" name="lieferRechnungsdatumBis">
                      <DatePicker placeholder="Bis Datum" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="LKW-Kennzeichen von" name="lkwKennzeichenVon">
                      <Input placeholder="Von LKW-Kennzeichen" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="LKW-Kennzeichen bis" name="lkwKennzeichenBis">
                      <Input placeholder="Bis LKW-Kennzeichen" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="keineEingangsrechnung" valuePropName="checked">
                      <Checkbox>Keine Eingangsrechnung</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="keineSpeditionsrechnung" valuePropName="checked">
                      <Checkbox>Keine Speditionsrechnung</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="keineFrachtabrechnung" valuePropName="checked">
                      <Checkbox>Keine Frachtabrechnung</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="deckungsbeitragAusStreckendaten" valuePropName="checked">
                      <Checkbox>Deckungsbeitrag aus Streckendaten berechnen</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              {/* BE-/ENTLADESTELLE Tab */}
              <TabPane tab="BE-/ENTLADESTELLE" key="5">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Land" name="land">
                      <Input placeholder="Land eingeben" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Be-/Entladestelle PLZ von" name="beEntladestellePLZVon">
                      <Input placeholder="Von PLZ" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Be-/Entladestelle PLZ bis" name="beEntladestellePLZBis">
                      <Input placeholder="Bis PLZ" />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              {/* PARTIE/NLS Tab */}
              <TabPane tab="PARTIE/NLS" key="6">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Partie-Nr. von" name="partienNrVon">
                      <Input placeholder="Von Partie-Nr." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Partie-Nr. bis" name="partienNrBis">
                      <Input placeholder="Bis Partie-Nr." />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="NLS-Nr. von" name="nlsNrVon">
                      <Input placeholder="Von NLS-Nr." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="NLS-Nr. bis" name="nlsNrBis">
                      <Input placeholder="Bis NLS-Nr." />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              {/* SONSTIGE SELEKTIONEN Tab */}
              <TabPane tab="SONSTIGE SELEKTIONEN" key="7">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Spediteur" name="spediteur">
                      <Input placeholder="Spediteur eingeben" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Start" name="start">
                      <Input placeholder="Start eingeben" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Ursprung" name="ursprung">
                      <Input placeholder="Ursprung eingeben" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Lagerhalle" name="lagerhalle">
                      <Input placeholder="Lagerhalle eingeben" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Fahrzeug-Kennzeichen" name="fahrzeugKennzeichen">
                      <Input placeholder="Fahrzeug-Kennzeichen" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Sorten-Nr." name="sortenNr">
                      <Input placeholder="Sorten-Nr." />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Kostenstelle" name="kostenstelle">
                      <Input placeholder="Kostenstelle" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Bedarfsnummer" name="bedarfsnummer">
                      <Input placeholder="Bedarfsnummer" />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              {/* ALLGEMEINE FILTER Tab */}
              <TabPane tab="ALLGEMEINE FILTER" key="8">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Vorgangstyp" name="vorgangsTyp">
                      <Select placeholder="Vorgangstyp wählen" allowClear>
                        {vorgangsTypOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Status" name="status">
                      <Select placeholder="Status wählen" allowClear>
                        {statusOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Datum von/bis" name="datumRange">
                      <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item label="Min. Menge" name="minMenge">
                      <InputNumber placeholder="Min" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Max. Menge" name="maxMenge">
                      <InputNumber placeholder="Max" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Min. EK-Preis" name="minEkPreis">
                      <InputNumber placeholder="Min" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Max. EK-Preis" name="maxEkPreis">
                      <InputNumber placeholder="Max" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item label="Min. VK-Preis" name="minVkPreis">
                      <InputNumber placeholder="Min" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Max. VK-Preis" name="maxVkPreis">
                      <InputNumber placeholder="Max" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>

            <Divider />

            <Row gutter={16} justify="end">
              <Col>
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={handleReset}
                  disabled={loading}
                >
                  Zurücksetzen
                </Button>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  Filter anwenden
                </Button>
              </Col>
            </Row>
          </Form>
        </Collapse.Panel>
      </Collapse>
    </Card>
  );
}; 