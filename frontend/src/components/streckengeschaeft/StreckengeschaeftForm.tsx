import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Row,
  Col,
  Card,
  Typography,
  Divider,
  Tabs,
  Checkbox,
  Space,
  message
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  CalculatorOutlined
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Streckengeschaeft,
  StreckengeschaeftFormData,
  StreckengeschaeftSchema,
  VorgangsTyp,
  StreckenStatus,
  getVorgangsTypLabel,
  getStatusLabel,
  formatCurrency,
  calculateGewinn,
  calculateGewinnmarge,
  calculateDeckungsbeitrag
} from '../../types/streckengeschaeft';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

interface StreckengeschaeftFormProps {
  initialData?: Streckengeschaeft | null;
  onSubmit: (data: StreckengeschaeftFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const StreckengeschaeftForm: React.FC<StreckengeschaeftFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<StreckengeschaeftFormData>({
    resolver: zodResolver(StreckengeschaeftSchema),
    defaultValues: {
      streckeNr: '',
      vorgangsTyp: VorgangsTyp.KAUF,
      datum: new Date().toISOString().split('T')[0],
      vorgangPosition: '',
      positionsNr: '',
      artikelVon: '',
      artikelBis: '',
      artikelBezeichnung: '',
      artikelNr: '',
      sortenNr: '',
      vertrag: '',
      lieferschein: '',
      kennzeichen: '',
      lkwKennzeichen: '',
      menge: 0,
      einheit: 'kg',
      ekPreis: 0,
      vkPreis: 0,
      frachtkosten: 0,
      preisProEinheit: 0,
      ekMenge: 0,
      ekNetto: 0,
      ekLieferkosten: 0,
      ekRechnung: '',
      ekKontakt: '',
      ekKontaktNr: '',
      vkMenge: 0,
      vkNetto: 0,
      vkLieferkosten: 0,
      vkRechnung: '',
      vkKontakt: '',
      vkKontaktNr: '',
      lieferant: '',
      lieferantName: '',
      lieferantNr: '',
      kunde: '',
      kundeName: '',
      kundeNr: '',
      spediteurNr: '',
      spediteurName: '',
      frachtart: 'LKW',
      beEntladestelle: '',
      beEntladestellePLZ: '',
      land: 'Deutschland',
      partienNr: '',
      nlsNr: '',
      bereich: '',
      spediteur: '',
      start: '',
      ursprung: '',
      lagerhalle: '',
      fahrzeugKennzeichen: '',
      kostenstelle: '',
      bedarfsnummer: '',
      summeVk: 0,
      summeEk: 0,
      restwert: 0,
      geplanteMengeVk: 0,
      geplanteMengeEk: 0,
      bemerkung: '',
      referenzNr: '',
      waehrung: 'EUR',
      skonto: 0,
      rabatt: 0,
      istBiomasse: false,
      hatEingangsrechnung: false,
      hatSpeditionsrechnung: false,
      hatFrachtabrechnung: false,
      deckungsbeitrag: 0
    }
  });

  // Watch für Berechnungen
  const watchedValues = watch();
  const { ekPreis, vkPreis, menge, frachtkosten, ekMenge, vkMenge } = watchedValues;

  // Berechnungen automatisch aktualisieren
  useEffect(() => {
    const ekNetto = ekPreis * ekMenge;
    const vkNetto = vkPreis * vkMenge;
    const summeEk = ekNetto + (watchedValues.ekLieferkosten || 0);
    const summeVk = vkNetto + (watchedValues.vkLieferkosten || 0);
    const deckungsbeitrag = calculateDeckungsbeitrag(summeVk, summeEk, frachtkosten);
    const restwert = summeVk - summeEk - frachtkosten;

    setValue('ekNetto', ekNetto);
    setValue('vkNetto', vkNetto);
    setValue('summeEk', summeEk);
    setValue('summeVk', summeVk);
    setValue('deckungsbeitrag', deckungsbeitrag);
    setValue('restwert', restwert);
  }, [ekPreis, vkPreis, menge, frachtkosten, ekMenge, vkMenge, watchedValues.ekLieferkosten, watchedValues.vkLieferkosten, setValue]);

  // Initial-Daten setzen
  useEffect(() => {
    if (initialData) {
      const formData: any = { ...initialData };
      if (initialData.datum) {
        formData.datum = initialData.datum as any;
      }
      setValue('datum', formData.datum);
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined) {
          setValue(key as keyof StreckengeschaeftFormData, formData[key]);
        }
      });
    }
  }, [initialData, setValue]);

  const handleFormSubmit = (values: StreckengeschaeftFormData) => {
    // Direkte Übergabe ohne Datum-Konvertierung
    onSubmit(values);
  };

  const vorgangsTypOptions = Object.values(VorgangsTyp).map(typ => ({
    label: getVorgangsTypLabel(typ),
    value: typ
  }));

  const statusOptions = Object.values(StreckenStatus).map(status => ({
    label: getStatusLabel(status),
    value: status
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4}>
          {initialData ? 'Streckengeschäft bearbeiten' : 'Neues Streckengeschäft'}
        </Title>
        <Space>
          <Button
            icon={<CalculatorOutlined />}
            onClick={() => message.info('Berechnungen werden automatisch aktualisiert')}
          >
            Berechnungen
          </Button>
        </Space>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        <Tabs defaultActiveKey="1" size="small">

          {/* GRUNDDATEN Tab */}
          <TabPane tab="GRUNDDATEN" key="1">
            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="streckeNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Strecke-Nr."
                      validateStatus={errors.streckeNr ? 'error' : ''}
                      help={errors.streckeNr?.message}
                    >
                      <Input {...field} placeholder="Strecke-Nr. eingeben" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="vorgangsTyp"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Vorgangstyp"
                      validateStatus={errors.vorgangsTyp ? 'error' : ''}
                      help={errors.vorgangsTyp?.message}
                    >
                      <Select {...field} placeholder="Vorgangstyp wählen">
                        {vorgangsTypOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="datum"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Datum"
                      validateStatus={errors.datum ? 'error' : ''}
                      help={errors.datum?.message}
                    >
                      <DatePicker
                        {...field}
                        style={{ width: '100%' }}
                        format="DD.MM.YYYY"
                      />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="vorgangPosition"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Vorgangsposition"
                      validateStatus={errors.vorgangPosition ? 'error' : ''}
                      help={errors.vorgangPosition?.message}
                    >
                      <Input {...field} placeholder="Vorgangsposition" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="positionsNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Positions-Nr."
                      validateStatus={errors.positionsNr ? 'error' : ''}
                      help={errors.positionsNr?.message}
                    >
                      <Input {...field} placeholder="Positions-Nr." />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="bereich"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Bereich"
                      validateStatus={errors.bereich ? 'error' : ''}
                      help={errors.bereich?.message}
                    >
                      <Input {...field} placeholder="Bereich" />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>

          {/* ARTIKEL Tab */}
          <TabPane tab="ARTIKEL" key="2">
            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="artikelVon"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Artikel von"
                      validateStatus={errors.artikelVon ? 'error' : ''}
                      help={errors.artikelVon?.message}
                    >
                      <Input {...field} placeholder="Artikel von" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="artikelBis"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Artikel bis"
                      validateStatus={errors.artikelBis ? 'error' : ''}
                      help={errors.artikelBis?.message}
                    >
                      <Input {...field} placeholder="Artikel bis" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="artikelNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Artikel-Nr."
                      validateStatus={errors.artikelNr ? 'error' : ''}
                      help={errors.artikelNr?.message}
                    >
                      <Input {...field} placeholder="Artikel-Nr." />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Controller
                  name="artikelBezeichnung"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Artikelbezeichnung"
                      validateStatus={errors.artikelBezeichnung ? 'error' : ''}
                      help={errors.artikelBezeichnung?.message}
                    >
                      <Input {...field} placeholder="Artikelbezeichnung" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={12}>
                <Controller
                  name="sortenNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Sorten-Nr."
                      validateStatus={errors.sortenNr ? 'error' : ''}
                      help={errors.sortenNr?.message}
                    >
                      <Input {...field} placeholder="Sorten-Nr." />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="menge"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Menge"
                      validateStatus={errors.menge ? 'error' : ''}
                      help={errors.menge?.message}
                    >
                      <InputNumber {...field} placeholder="Menge" style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="einheit"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Einheit"
                      validateStatus={errors.einheit ? 'error' : ''}
                      help={errors.einheit?.message}
                    >
                      <Select {...field} placeholder="Einheit wählen">
                        <Option value="kg">kg</Option>
                        <Option value="t">t</Option>
                        <Option value="Stück">Stück</Option>
                        <Option value="m³">m³</Option>
                        <Option value="l">l</Option>
                      </Select>
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="preisProEinheit"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Preis pro Einheit"
                      validateStatus={errors.preisProEinheit ? 'error' : ''}
                      help={errors.preisProEinheit?.message}
                    >
                      <InputNumber {...field} placeholder="0.00" style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>

          {/* VERTRÄGE & LIEFERSCHEINE Tab */}
          <TabPane tab="VERTRÄGE & LIEFERSCHEINE" key="3">
            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="vertrag"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Vertrag"
                      validateStatus={errors.vertrag ? 'error' : ''}
                      help={errors.vertrag?.message}
                    >
                      <Input {...field} placeholder="Vertrag" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="lieferschein"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Lieferschein"
                      validateStatus={errors.lieferschein ? 'error' : ''}
                      help={errors.lieferschein?.message}
                    >
                      <Input {...field} placeholder="Lieferschein" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="kennzeichen"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Kennzeichen"
                      validateStatus={errors.kennzeichen ? 'error' : ''}
                      help={errors.kennzeichen?.message}
                    >
                      <Input {...field} placeholder="Kennzeichen" />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Controller
                  name="lkwKennzeichen"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="LKW-Kennzeichen"
                      validateStatus={errors.lkwKennzeichen ? 'error' : ''}
                      help={errors.lkwKennzeichen?.message}
                    >
                      <Input {...field} placeholder="LKW-Kennzeichen" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={12}>
                <Controller
                  name="fahrzeugKennzeichen"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Fahrzeug-Kennzeichen"
                      validateStatus={errors.fahrzeugKennzeichen ? 'error' : ''}
                      help={errors.fahrzeugKennzeichen?.message}
                    >
                      <Input {...field} placeholder="Fahrzeug-Kennzeichen" />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>

          {/* EINKAUF Tab */}
          <TabPane tab="EINKAUF" key="4">
            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="ekPreis"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="EK-Preis"
                      validateStatus={errors.ekPreis ? 'error' : ''}
                      help={errors.ekPreis?.message}
                    >
                      <InputNumber {...field} placeholder="0.00" style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="ekMenge"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="EK-Menge"
                      validateStatus={errors.ekMenge ? 'error' : ''}
                      help={errors.ekMenge?.message}
                    >
                      <InputNumber {...field} placeholder="0" style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="ekLieferkosten"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="EK-Lieferkosten"
                      validateStatus={errors.ekLieferkosten ? 'error' : ''}
                      help={errors.ekLieferkosten?.message}
                    >
                      <InputNumber {...field} placeholder="0.00" style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="ekNetto"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="EK-Netto (berechnet)"
                      validateStatus={errors.ekNetto ? 'error' : ''}
                      help={errors.ekNetto?.message}
                    >
                      <InputNumber {...field} disabled style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="ekRechnung"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="EK-Rechnung"
                      validateStatus={errors.ekRechnung ? 'error' : ''}
                      help={errors.ekRechnung?.message}
                    >
                      <Input {...field} placeholder="EK-Rechnung" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="ekKontakt"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="EK-Kontakt"
                      validateStatus={errors.ekKontakt ? 'error' : ''}
                      help={errors.ekKontakt?.message}
                    >
                      <Input {...field} placeholder="EK-Kontakt" />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Controller
                  name="ekKontaktNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="EK-Kontakt-Nr."
                      validateStatus={errors.ekKontaktNr ? 'error' : ''}
                      help={errors.ekKontaktNr?.message}
                    >
                      <Input {...field} placeholder="EK-Kontakt-Nr." />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={12}>
                <Controller
                  name="summeEk"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Summe EK (berechnet)"
                      validateStatus={errors.summeEk ? 'error' : ''}
                      help={errors.summeEk?.message}
                    >
                      <InputNumber {...field} disabled style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>

          {/* VERKAUF Tab */}
          <TabPane tab="VERKAUF" key="5">
            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="vkPreis"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="VK-Preis"
                      validateStatus={errors.vkPreis ? 'error' : ''}
                      help={errors.vkPreis?.message}
                    >
                      <InputNumber {...field} placeholder="0.00" style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="vkMenge"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="VK-Menge"
                      validateStatus={errors.vkMenge ? 'error' : ''}
                      help={errors.vkMenge?.message}
                    >
                      <InputNumber {...field} placeholder="0" style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="vkLieferkosten"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="VK-Lieferkosten"
                      validateStatus={errors.vkLieferkosten ? 'error' : ''}
                      help={errors.vkLieferkosten?.message}
                    >
                      <InputNumber {...field} placeholder="0.00" style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="vkNetto"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="VK-Netto (berechnet)"
                      validateStatus={errors.vkNetto ? 'error' : ''}
                      help={errors.vkNetto?.message}
                    >
                      <InputNumber {...field} disabled style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="vkRechnung"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="VK-Rechnung"
                      validateStatus={errors.vkRechnung ? 'error' : ''}
                      help={errors.vkRechnung?.message}
                    >
                      <Input {...field} placeholder="VK-Rechnung" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="vkKontakt"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="VK-Kontakt"
                      validateStatus={errors.vkKontakt ? 'error' : ''}
                      help={errors.vkKontakt?.message}
                    >
                      <Input {...field} placeholder="VK-Kontakt" />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Controller
                  name="vkKontaktNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="VK-Kontakt-Nr."
                      validateStatus={errors.vkKontaktNr ? 'error' : ''}
                      help={errors.vkKontaktNr?.message}
                    >
                      <Input {...field} placeholder="VK-Kontakt-Nr." />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={12}>
                <Controller
                  name="summeVk"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Summe VK (berechnet)"
                      validateStatus={errors.summeVk ? 'error' : ''}
                      help={errors.summeVk?.message}
                    >
                      <InputNumber {...field} disabled style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>

          {/* PARTNER Tab */}
          <TabPane tab="PARTNER" key="6">
            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="lieferant"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Lieferant"
                      validateStatus={errors.lieferant ? 'error' : ''}
                      help={errors.lieferant?.message}
                    >
                      <Input {...field} placeholder="Lieferant" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="lieferantName"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Lieferantname"
                      validateStatus={errors.lieferantName ? 'error' : ''}
                      help={errors.lieferantName?.message}
                    >
                      <Input {...field} placeholder="Lieferantname" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="lieferantNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Lieferant-Nr."
                      validateStatus={errors.lieferantNr ? 'error' : ''}
                      help={errors.lieferantNr?.message}
                    >
                      <Input {...field} placeholder="Lieferant-Nr." />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="kunde"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Kunde"
                      validateStatus={errors.kunde ? 'error' : ''}
                      help={errors.kunde?.message}
                    >
                      <Input {...field} placeholder="Kunde" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="kundeName"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Kundenname"
                      validateStatus={errors.kundeName ? 'error' : ''}
                      help={errors.kundeName?.message}
                    >
                      <Input {...field} placeholder="Kundenname" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="kundeNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Kunde-Nr."
                      validateStatus={errors.kundeNr ? 'error' : ''}
                      help={errors.kundeNr?.message}
                    >
                      <Input {...field} placeholder="Kunde-Nr." />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>

          {/* SPEDITION Tab */}
          <TabPane tab="SPEDITION" key="7">
            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="spediteurNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Spediteur-Nr."
                      validateStatus={errors.spediteurNr ? 'error' : ''}
                      help={errors.spediteurNr?.message}
                    >
                      <Input {...field} placeholder="Spediteur-Nr." />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="spediteurName"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Spediteurname"
                      validateStatus={errors.spediteurName ? 'error' : ''}
                      help={errors.spediteurName?.message}
                    >
                      <Input {...field} placeholder="Spediteurname" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="frachtart"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Frachtart"
                      validateStatus={errors.frachtart ? 'error' : ''}
                      help={errors.frachtart?.message}
                    >
                      <Select {...field} placeholder="Frachtart wählen">
                        <Option value="LKW">LKW</Option>
                        <Option value="Bahn">Bahn</Option>
                        <Option value="Schiff">Schiff</Option>
                        <Option value="Flugzeug">Flugzeug</Option>
                      </Select>
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="frachtkosten"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Frachtkosten"
                      validateStatus={errors.frachtkosten ? 'error' : ''}
                      help={errors.frachtkosten?.message}
                    >
                      <InputNumber {...field} placeholder="0.00" style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="spediteur"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Spediteur"
                      validateStatus={errors.spediteur ? 'error' : ''}
                      help={errors.spediteur?.message}
                    >
                      <Input {...field} placeholder="Spediteur" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="start"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Start"
                      validateStatus={errors.start ? 'error' : ''}
                      help={errors.start?.message}
                    >
                      <Input {...field} placeholder="Start" />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="ursprung"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Ursprung"
                      validateStatus={errors.ursprung ? 'error' : ''}
                      help={errors.ursprung?.message}
                    >
                      <Input {...field} placeholder="Ursprung" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="lagerhalle"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Lagerhalle"
                      validateStatus={errors.lagerhalle ? 'error' : ''}
                      help={errors.lagerhalle?.message}
                    >
                      <Input {...field} placeholder="Lagerhalle" />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>

          {/* BE-/ENTLADESTELLE Tab */}
          <TabPane tab="BE-/ENTLADESTELLE" key="8">
            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="beEntladestelle"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Be-/Entladestelle"
                      validateStatus={errors.beEntladestelle ? 'error' : ''}
                      help={errors.beEntladestelle?.message}
                    >
                      <Input {...field} placeholder="Be-/Entladestelle" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="beEntladestellePLZ"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="PLZ Be-/Entladestelle"
                      validateStatus={errors.beEntladestellePLZ ? 'error' : ''}
                      help={errors.beEntladestellePLZ?.message}
                    >
                      <Input {...field} placeholder="PLZ" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="land"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Land"
                      validateStatus={errors.land ? 'error' : ''}
                      help={errors.land?.message}
                    >
                      <Input {...field} placeholder="Land" />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>

          {/* PARTIE/NLS Tab */}
          <TabPane tab="PARTIE/NLS" key="9">
            <Row gutter={16}>
              <Col span={12}>
                <Controller
                  name="partienNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Partien-Nr."
                      validateStatus={errors.partienNr ? 'error' : ''}
                      help={errors.partienNr?.message}
                    >
                      <Input {...field} placeholder="Partien-Nr." />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={12}>
                <Controller
                  name="nlsNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="NLS-Nr."
                      validateStatus={errors.nlsNr ? 'error' : ''}
                      help={errors.nlsNr?.message}
                    >
                      <Input {...field} placeholder="NLS-Nr." />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>

          {/* SONSTIGES Tab */}
          <TabPane tab="SONSTIGES" key="10">
            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="kostenstelle"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Kostenstelle"
                      validateStatus={errors.kostenstelle ? 'error' : ''}
                      help={errors.kostenstelle?.message}
                    >
                      <Input {...field} placeholder="Kostenstelle" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="bedarfsnummer"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Bedarfsnummer"
                      validateStatus={errors.bedarfsnummer ? 'error' : ''}
                      help={errors.bedarfsnummer?.message}
                    >
                      <Input {...field} placeholder="Bedarfsnummer" />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="referenzNr"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Referenz-Nr."
                      validateStatus={errors.referenzNr ? 'error' : ''}
                      help={errors.referenzNr?.message}
                    >
                      <Input {...field} placeholder="Referenz-Nr." />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Controller
                  name="waehrung"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Währung"
                      validateStatus={errors.waehrung ? 'error' : ''}
                      help={errors.waehrung?.message}
                    >
                      <Select {...field} placeholder="Währung wählen">
                        <Option value="EUR">EUR</Option>
                        <Option value="USD">USD</Option>
                        <Option value="CHF">CHF</Option>
                      </Select>
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="skonto"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Skonto (%)"
                      validateStatus={errors.skonto ? 'error' : ''}
                      help={errors.skonto?.message}
                    >
                      <InputNumber {...field} placeholder="0" min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={8}>
                <Controller
                  name="rabatt"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Rabatt (%)"
                      validateStatus={errors.rabatt ? 'error' : ''}
                      help={errors.rabatt?.message}
                    >
                      <InputNumber {...field} placeholder="0" min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  )}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Controller
                  name="bemerkung"
                  control={control}
                  render={({ field }) => (
                    <Form.Item
                      label="Bemerkung"
                      validateStatus={errors.bemerkung ? 'error' : ''}
                      help={errors.bemerkung?.message}
                    >
                      <Input.TextArea {...field} placeholder="Bemerkung" rows={3} />
                    </Form.Item>
                  )}
                />
              </Col>
              <Col span={12}>
                <div className="space-y-4">
                  <Controller
                    name="istBiomasse"
                    control={control}
                    render={({ field }) => (
                      <Form.Item label="Biomasse">
                        <Checkbox {...field} checked={field.value}>
                          Ist Biomasse
                        </Checkbox>
                      </Form.Item>
                    )}
                  />

                  <Controller
                    name="hatEingangsrechnung"
                    control={control}
                    render={({ field }) => (
                      <Form.Item label="Rechnungen">
                        <Checkbox {...field} checked={field.value}>
                          Hat Eingangsrechnung
                        </Checkbox>
                      </Form.Item>
                    )}
                  />

                  <Controller
                    name="hatSpeditionsrechnung"
                    control={control}
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value}>
                        Hat Speditionsrechnung
                      </Checkbox>
                    )}
                  />

                  <Controller
                    name="hatFrachtabrechnung"
                    control={control}
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value}>
                        Hat Frachtabrechnung
                      </Checkbox>
                    )}
                  />
                </div>
              </Col>
            </Row>
          </TabPane>

          {/* BERECHNUNGEN Tab */}
          <TabPane tab="BERECHNUNGEN" key="11">
            <Card size="small" className="mb-4">
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Restwert (berechnet)">
                    <Controller
                      name="restwert"
                      control={control}
                      render={({ field }) => (
                        <InputNumber {...field} disabled style={{ width: '100%' }} />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Deckungsbeitrag (berechnet)">
                    <Controller
                      name="deckungsbeitrag"
                      control={control}
                      render={({ field }) => (
                        <InputNumber {...field} disabled style={{ width: '100%' }} />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Geplante Menge VK">
                    <Controller
                      name="geplanteMengeVk"
                      control={control}
                      render={({ field }) => (
                        <InputNumber {...field} placeholder="0" style={{ width: '100%' }} />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Geplante Menge EK">
                    <Controller
                      name="geplanteMengeEk"
                      control={control}
                      render={({ field }) => (
                        <InputNumber {...field} placeholder="0" style={{ width: '100%' }} />
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <div className="text-sm text-gray-600">
              <Text strong>Hinweis:</Text> Berechnungen werden automatisch basierend auf EK-Preis, VK-Preis, Mengen und Frachtkosten aktualisiert.
            </div>
          </TabPane>
        </Tabs>

        <Divider />

        <div className="flex justify-end space-x-2">
          <Button
            icon={<CloseOutlined />}
            onClick={onCancel}
            disabled={loading}
          >
            Abbrechen
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit(handleFormSubmit)}
            loading={loading}
            disabled={!isValid}
          >
            {initialData ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </div>
      </Form>
    </div>
  );
}; 