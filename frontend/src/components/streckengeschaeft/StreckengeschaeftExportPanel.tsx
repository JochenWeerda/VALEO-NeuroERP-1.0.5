import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Divider,
  Row,
  Col,
  Select,
  Input,
  Checkbox,
  Modal,
  Form,
  message,
  Upload,
  Progress,
  Alert,
  Tabs,
  List,
  Avatar,
  Tag,
  Tooltip,
  Popconfirm,
  Switch,
  InputNumber,
  Radio,
  UploadFile,
} from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  MailOutlined,
  WhatsAppOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  UploadOutlined,
  SettingOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CloudUploadOutlined,
  // ConvertOutlined,
} from '@ant-design/icons';
import { StreckengeschaeftApi, downloadBlob, formatFileSize } from '../../services/streckengeschaeftApi';
import { StreckengeschaeftFilter } from '../../types/streckengeschaeft';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface StreckengeschaeftExportPanelProps {
  filter?: StreckengeschaeftFilter;
  selectedIds?: string[];
  onExportComplete?: () => void;
}

interface Printer {
  name: string;
  id: string;
  isDefault: boolean;
  isNetwork: boolean;
  location?: string;
  status: 'ready' | 'offline' | 'error';
}

interface ConversionJob {
  id: string;
  filename: string;
  originalFormat: string;
  targetFormat: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export const StreckengeschaeftExportPanel: React.FC<StreckengeschaeftExportPanelProps> = ({
  filter,
  selectedIds = [],
  onExportComplete
}) => {
  const [form] = Form.useForm();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [conversionJobs, setConversionJobs] = useState<ConversionJob[]>([]);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [whatsappModalVisible, setWhatsappModalVisible] = useState(false);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [conversionModalVisible, setConversionModalVisible] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

  // Load available printers
  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    try {
      const availablePrinters = await StreckengeschaeftApi.getAvailablePrinters();
      setPrinters(availablePrinters);
      const defaultPrinter = availablePrinters.find(p => p.isDefault);
      if (defaultPrinter) {
        setSelectedPrinter(defaultPrinter.id);
      }
    } catch (error) {
      console.error('Failed to load printers:', error);
      message.error('Drucker konnten nicht geladen werden');
    }
  };

  // Export Functions
  const handleExport = async (format: 'excel' | 'pdf' | 'libreoffice') => {
    setLoading(true);
    try {
      let blob: Blob;
      const timestamp = new Date().toISOString().split('T')[0];
      
      switch (format) {
        case 'excel':
          blob = await StreckengeschaeftApi.exportToExcel(filter);
          downloadBlob(blob, `Streckengeschaeft_${timestamp}.xlsx`);
          break;
        case 'pdf':
          blob = await StreckengeschaeftApi.exportToPDF(filter);
          downloadBlob(blob, `Streckengeschaeft_${timestamp}.pdf`);
          break;
        case 'libreoffice':
          blob = await StreckengeschaeftApi.exportToLibreOffice(filter, 'ods');
          downloadBlob(blob, `Streckengeschaeft_${timestamp}.ods`);
          break;
      }
      
      message.success(`${format.toUpperCase()}-Export erfolgreich`);
      onExportComplete?.();
    } catch (error) {
      console.error('Export failed:', error);
      message.error(`Export fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  // Print Functions
  const handlePrint = async () => {
    if (!selectedIds.length) {
      message.warning('Bitte wählen Sie mindestens ein Streckengeschäft aus');
      return;
    }

    setLoading(true);
    try {
      const printOptions = form.getFieldsValue(['copies', 'orientation', 'paperSize', 'includeSummen']);
      
      if (selectedIds.length === 1) {
        const result = await StreckengeschaeftApi.printStreckengeschaeft(
          selectedIds[0],
          selectedPrinter,
          printOptions
        );
        
        if (result.success) {
          message.success(`Druckauftrag erfolgreich gesendet (Job-ID: ${result.jobId})`);
        } else {
          message.error(`Druckfehler: ${result.error}`);
        }
      } else {
        const result = await StreckengeschaeftApi.printMultiple(
          selectedIds,
          selectedPrinter,
          printOptions
        );
        
        if (result.success) {
          message.success(`${result.jobIds?.length || 0} Druckaufträge erfolgreich gesendet`);
        } else {
          message.error(`Druckfehler: ${result.errors?.join(', ')}`);
        }
      }
      
      setPrintModalVisible(false);
    } catch (error) {
      console.error('Print failed:', error);
      message.error(`Drucken fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  // Email Functions
  const handleEmail = async () => {
    if (!selectedIds.length) {
      message.warning('Bitte wählen Sie mindestens ein Streckengeschäft aus');
      return;
    }

    setLoading(true);
    try {
      const emailData = form.getFieldsValue(['to', 'cc', 'bcc', 'subject', 'message', 'includeAttachment', 'attachmentFormat']);
      
      // Send email for each selected ID
      const results = await Promise.allSettled(
        selectedIds.map(id => StreckengeschaeftApi.sendEmail(id, emailData))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;
      
      if (successful > 0) {
        message.success(`${successful} E-Mail(s) erfolgreich gesendet`);
      }
      if (failed > 0) {
        message.warning(`${failed} E-Mail(s) fehlgeschlagen`);
      }
      
      setEmailModalVisible(false);
    } catch (error) {
      console.error('Email failed:', error);
      message.error(`E-Mail fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp Functions
  const handleWhatsApp = async () => {
    if (!selectedIds.length) {
      message.warning('Bitte wählen Sie mindestens ein Streckengeschäft aus');
      return;
    }

    setLoading(true);
    try {
      const { phoneNumber, message: whatsappMessage, includeAttachment } = form.getFieldsValue();
      
      // Send WhatsApp for each selected ID
      const results = await Promise.allSettled(
        selectedIds.map(id => StreckengeschaeftApi.sendWhatsApp(id, phoneNumber, whatsappMessage, includeAttachment))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;
      
      if (successful > 0) {
        message.success(`${successful} WhatsApp-Nachricht(en) erfolgreich gesendet`);
      }
      if (failed > 0) {
        message.warning(`${failed} WhatsApp-Nachricht(en) fehlgeschlagen`);
      }
      
      setWhatsappModalVisible(false);
    } catch (error) {
      console.error('WhatsApp failed:', error);
      message.error(`WhatsApp fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  // File Conversion Functions
  const handleFileConversion = async () => {
    if (!uploadedFiles.length) {
      message.warning('Bitte laden Sie mindestens eine Datei hoch');
      return;
    }

    const { targetFormat, quality, password, watermark } = form.getFieldsValue();
    
    for (const file of uploadedFiles) {
      if (file.originFileObj) {
        const jobId = `job_${Date.now()}_${Math.random()}`;
        const newJob: ConversionJob = {
          id: jobId,
          filename: file.name,
          originalFormat: file.name.split('.').pop() || 'unknown',
          targetFormat,
          progress: 0,
          status: 'pending'
        };
        
        setConversionJobs(prev => [...prev, newJob]);
        
        try {
          const blob = await StreckengeschaeftApi.convertFile(
            file.originFileObj,
            targetFormat,
            { quality, password, watermark }
          );
          
          downloadBlob(blob, `${file.name.split('.')[0]}.${targetFormat}`);
          
          setConversionJobs(prev => 
            prev.map(job => 
              job.id === jobId 
                ? { ...job, progress: 100, status: 'completed' as const }
                : job
            )
          );
          
          message.success(`${file.name} erfolgreich konvertiert`);
        } catch (error) {
          console.error('Conversion failed:', error);
          setConversionJobs(prev => 
            prev.map(job => 
              job.id === jobId 
                ? { ...job, status: 'error' as const, error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
                : job
            )
          );
          message.error(`Konvertierung von ${file.name} fehlgeschlagen`);
        }
      }
    }
  };

  const getPrinterStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'success';
      case 'offline': return 'default';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getPrinterStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Bereit';
      case 'offline': return 'Offline';
      case 'error': return 'Fehler';
      default: return 'Unbekannt';
    }
  };

  return (
    <Card 
      title={
        <Space>
          <DownloadOutlined />
          <span>Export & Kommunikation</span>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadPrinters}
            size="small"
          >
            Drucker aktualisieren
          </Button>
        </Space>
      }
    >
      <Tabs defaultActiveKey="1">
        
        {/* Export Tab */}
        <TabPane tab="Export" key="1">
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small" className="text-center">
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  size="large"
                  block
                  loading={loading}
                  onClick={() => handleExport('excel')}
                >
                  Excel Export
                </Button>
                <Typography.Text type="secondary" className="block mt-2">
                  Export als .xlsx Datei
                </Typography.Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" className="text-center">
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  size="large"
                  block
                  loading={loading}
                  onClick={() => handleExport('pdf')}
                >
                  PDF Export
                </Button>
                <Typography.Text type="secondary" className="block mt-2">
                  Export als .pdf Datei
                </Typography.Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" className="text-center">
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  size="large"
                  block
                  loading={loading}
                  onClick={() => handleExport('libreoffice')}
                >
                  LibreOffice Export
                </Button>
                <Typography.Text type="secondary" className="block mt-2">
                  Export als .ods Datei
                </Typography.Text>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Drucken Tab */}
        <TabPane tab="Drucken" key="2">
          <Row gutter={16}>
            <Col span={12}>
              <Form layout="vertical">
                <Form.Item label="Verfügbare Drucker">
                  <Select
                    value={selectedPrinter}
                    onChange={setSelectedPrinter}
                    placeholder="Drucker auswählen"
                  >
                    {printers.map(printer => (
                      <Option key={printer.id} value={printer.id}>
                        <Space>
                          <span>{printer.name}</span>
                          <Tag color={getPrinterStatusColor(printer.status)}>
                            {getPrinterStatusText(printer.status)}
                          </Tag>
                          {printer.isDefault && <Tag color="blue">Standard</Tag>}
                          {printer.isNetwork && <Tag color="green">Netzwerk</Tag>}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={() => setPrintModalVisible(true)}
                    disabled={!selectedIds.length}
                  >
                    Drucken ({selectedIds.length} ausgewählt)
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            
            <Col span={12}>
              <Alert
                message="Drucker-Informationen"
                description={
                  <div>
                    <p><strong>Ausgewählte Streckengeschäfte:</strong> {selectedIds.length}</p>
                    <p><strong>Standard-Drucker:</strong> {printers.find(p => p.isDefault)?.name || 'Keiner'}</p>
                    <p><strong>Netzwerk-Drucker:</strong> {printers.filter(p => p.isNetwork).length}</p>
                  </div>
                }
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </TabPane>

        {/* E-Mail Tab */}
        <TabPane tab="E-Mail" key="3">
          <Row gutter={16}>
            <Col span={12}>
              <Form layout="vertical">
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<MailOutlined />}
                    onClick={() => setEmailModalVisible(true)}
                    disabled={!selectedIds.length}
                  >
                    E-Mail senden ({selectedIds.length} ausgewählt)
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            
            <Col span={12}>
              <Alert
                message="E-Mail-Funktionen"
                description="Senden Sie Streckengeschäfte per E-Mail mit optionalen Anhängen in verschiedenen Formaten."
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </TabPane>

        {/* WhatsApp Tab */}
        <TabPane tab="WhatsApp" key="4">
          <Row gutter={16}>
            <Col span={12}>
              <Form layout="vertical">
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<WhatsAppOutlined />}
                    onClick={() => setWhatsappModalVisible(true)}
                    disabled={!selectedIds.length}
                  >
                    WhatsApp senden ({selectedIds.length} ausgewählt)
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            
            <Col span={12}>
              <Alert
                message="WhatsApp-Integration"
                description="Senden Sie Streckengeschäfte direkt über WhatsApp mit optionalen Anhängen."
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </TabPane>

        {/* Konvertierung Tab */}
        <TabPane tab="Datei-Konvertierung" key="5">
          <Row gutter={16}>
            <Col span={12}>
              <Form layout="vertical">
                <Form.Item label="Dateien hochladen">
                  <Upload
                    multiple
                    fileList={uploadedFiles}
                    onChange={({ fileList }) => setUploadedFiles(fileList)}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>Dateien auswählen</Button>
                  </Upload>
                </Form.Item>
                
                <Form.Item label="Ziel-Format">
                  <Select defaultValue="pdf">
                    <Option value="pdf">PDF</Option>
                    <Option value="excel">Excel</Option>
                    <Option value="word">Word</Option>
                    <Option value="libreoffice">LibreOffice</Option>
                    <Option value="html">HTML</Option>
                    <Option value="txt">Text</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<CloudUploadOutlined />}
                    onClick={() => setConversionModalVisible(true)}
                    disabled={!uploadedFiles.length}
                  >
                    Konvertieren ({uploadedFiles.length} Dateien)
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            
            <Col span={12}>
              <Alert
                message="Datei-Konvertierung"
                description="Konvertieren Sie Dateien in verschiedene Formate mit erweiterten Optionen."
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Print Modal */}
      <Modal
        title="Drucken"
        open={printModalVisible}
        onCancel={() => setPrintModalVisible(false)}
        onOk={handlePrint}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Kopien" name="copies">
                <InputNumber min={1} max={100} defaultValue={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ausrichtung" name="orientation">
                <Select defaultValue="portrait">
                  <Option value="portrait">Hochformat</Option>
                  <Option value="landscape">Querformat</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Papiergröße" name="paperSize">
                <Select defaultValue="A4">
                  <Option value="A4">A4</Option>
                  <Option value="A3">A3</Option>
                  <Option value="letter">Letter</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="includeSummen" valuePropName="checked">
                <Checkbox>Summen einschließen</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Email Modal */}
      <Modal
        title="E-Mail senden"
        open={emailModalVisible}
        onCancel={() => setEmailModalVisible(false)}
        onOk={handleEmail}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="An" name="to" rules={[{ required: true, message: 'Empfänger erforderlich' }]}>
            <Select mode="tags" placeholder="E-Mail-Adressen eingeben" />
          </Form.Item>
          
          <Form.Item label="CC" name="cc">
            <Select mode="tags" placeholder="CC-E-Mail-Adressen" />
          </Form.Item>
          
          <Form.Item label="BCC" name="bcc">
            <Select mode="tags" placeholder="BCC-E-Mail-Adressen" />
          </Form.Item>
          
          <Form.Item label="Betreff" name="subject" rules={[{ required: true, message: 'Betreff erforderlich' }]}>
            <Input placeholder="E-Mail-Betreff" />
          </Form.Item>
          
          <Form.Item label="Nachricht" name="message">
            <TextArea rows={4} placeholder="Optionale Nachricht" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="includeAttachment" valuePropName="checked">
                <Checkbox>Anhang einschließen</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Anhang-Format" name="attachmentFormat">
                <Select defaultValue="pdf">
                  <Option value="pdf">PDF</Option>
                  <Option value="excel">Excel</Option>
                  <Option value="libreoffice">LibreOffice</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* WhatsApp Modal */}
      <Modal
        title="WhatsApp senden"
        open={whatsappModalVisible}
        onCancel={() => setWhatsappModalVisible(false)}
        onOk={handleWhatsApp}
        confirmLoading={loading}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Telefonnummer" name="phoneNumber" rules={[{ required: true, message: 'Telefonnummer erforderlich' }]}>
            <Input placeholder="+49 123 456789" />
          </Form.Item>
          
          <Form.Item label="Nachricht" name="message">
            <TextArea rows={4} placeholder="Optionale Nachricht" />
          </Form.Item>
          
          <Form.Item name="includeAttachment" valuePropName="checked">
            <Checkbox>Anhang einschließen</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Conversion Modal */}
      <Modal
        title="Datei-Konvertierung"
        open={conversionModalVisible}
        onCancel={() => setConversionModalVisible(false)}
        onOk={handleFileConversion}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ziel-Format" name="targetFormat" rules={[{ required: true }]}>
                <Select defaultValue="pdf">
                  <Option value="pdf">PDF</Option>
                  <Option value="excel">Excel</Option>
                  <Option value="word">Word</Option>
                  <Option value="libreoffice">LibreOffice</Option>
                  <Option value="html">HTML</Option>
                  <Option value="txt">Text</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Qualität" name="quality">
                <Select defaultValue="medium">
                  <Option value="low">Niedrig</Option>
                  <Option value="medium">Mittel</Option>
                  <Option value="high">Hoch</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="Passwort (optional)" name="password">
            <Input.Password placeholder="Passwort für geschützte Dateien" />
          </Form.Item>
          
          <Form.Item label="Wasserzeichen (optional)" name="watermark">
            <Input placeholder="Wasserzeichen-Text" />
          </Form.Item>
          
          <Divider>Konvertierungs-Jobs</Divider>
          
          <List
            dataSource={conversionJobs}
            renderItem={job => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar icon={
                      job.status === 'completed' ? <CheckCircleOutlined /> :
                      job.status === 'error' ? <WarningOutlined /> :
                      <InfoCircleOutlined />
                    } />
                  }
                  title={job.filename}
                  description={`${job.originalFormat} → ${job.targetFormat}`}
                />
                <div>
                  {job.status === 'processing' && <Progress percent={job.progress} size="small" />}
                  {job.status === 'completed' && <Tag color="success">Abgeschlossen</Tag>}
                  {job.status === 'error' && <Tag color="error">{job.error}</Tag>}
                  {job.status === 'pending' && <Tag color="default">Wartend</Tag>}
                </div>
              </List.Item>
            )}
          />
        </Form>
      </Modal>
    </Card>
  );
}; 