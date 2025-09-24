"use client";

import { useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Cpu,
  Zap,
  Shield,
  CheckCircle,
  AlertTriangle,
  Activity,
  Database,
  Lock,
  Unlock,
  Wifi,
  WifiOff,
  Thermometer,
  Scale,
  Eye,
  FileCheck,
  Hash,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  FileText,
} from "lucide-react";

// Blockchain-verifizierte Dokumente
const blockchainDocuments = [
  {
    id: "doc-001",
    name: "Lieferschein LS-2024-0915-001",
    type: "Lieferschein",
    hash: "a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef",
    blockchainTx: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    timestamp: "2024-09-15T10:30:00Z",
    status: "verified",
    network: "Ethereum",
    gasUsed: 21000,
    confirmations: 12,
  },
  {
    id: "doc-002",
    name: "Qualitätsprotokoll QP-2024-0916-002",
    type: "Qualitätsprotokoll",
    hash: "f9e8d7c6b5a49876543210987654321fedcba9876543210fedcba9876543210fe",
    blockchainTx: "0x8f2d45Bb7744D0633926b955Bc565f55d48a55f5",
    timestamp: "2024-09-16T14:20:00Z",
    status: "verified",
    network: "Polygon",
    gasUsed: 18500,
    confirmations: 8,
  },
  {
    id: "doc-003",
    name: "Rechnung RG-2024-0917-003",
    type: "Rechnung",
    hash: "1a2b3c4d5e6f78901234567890abcdef1234567890abcdef1234567890abcdef1",
    blockchainTx: "pending",
    timestamp: "2024-09-17T09:15:00Z",
    status: "pending",
    network: "Ethereum",
    gasUsed: 0,
    confirmations: 0,
  },
];

// IoT-Sensor-Daten
const iotSensors = [
  {
    id: "sensor-001",
    name: "Temperatur-Sensor Lagerhalle A",
    type: "temperature",
    location: "Lagerhalle A, Regal R12",
    status: "online",
    lastReading: 18.5,
    unit: "°C",
    threshold: { min: 15, max: 25 },
    readings: [
      { timestamp: "2024-09-21T12:00:00Z", value: 18.5 },
      { timestamp: "2024-09-21T11:00:00Z", value: 18.2 },
      { timestamp: "2024-09-21T10:00:00Z", value: 19.1 },
    ],
  },
  {
    id: "sensor-002",
    name: "Gewichts-Sensor Waage 1",
    type: "weight",
    location: "Wiege-Station 1",
    status: "online",
    lastReading: 245.7,
    unit: "kg",
    threshold: { min: 0, max: 500 },
    readings: [
      { timestamp: "2024-09-21T12:00:00Z", value: 245.7 },
      { timestamp: "2024-09-21T11:30:00Z", value: 0 },
      { timestamp: "2024-09-21T11:00:00Z", value: 189.3 },
    ],
  },
  {
    id: "sensor-003",
    name: "Luftfeuchtigkeit Lagerhalle B",
    type: "humidity",
    location: "Lagerhalle B, Klimazone 1",
    status: "warning",
    lastReading: 68.5,
    unit: "%",
    threshold: { min: 40, max: 60 },
    readings: [
      { timestamp: "2024-09-21T12:00:00Z", value: 68.5 },
      { timestamp: "2024-09-21T11:00:00Z", value: 65.2 },
      { timestamp: "2024-09-21T10:00:00Z", value: 62.1 },
    ],
  },
  {
    id: "sensor-004",
    name: "Bewegungs-Sensor Eingang",
    type: "motion",
    location: "Haupteingang",
    status: "offline",
    lastReading: 0,
    unit: "Bewegungen",
    threshold: { min: 0, max: 100 },
    readings: [
      { timestamp: "2024-09-21T08:00:00Z", value: 45 },
      { timestamp: "2024-09-20T18:00:00Z", value: 67 },
      { timestamp: "2024-09-20T12:00:00Z", value: 23 },
    ],
  },
];

// Blockchain-Netzwerke
const blockchainNetworks = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    status: "active",
    gasPrice: 25,
    blockTime: 12,
    documents: 1247,
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    status: "active",
    gasPrice: 1,
    blockTime: 2,
    documents: 892,
  },
  {
    id: "binance",
    name: "BSC",
    symbol: "BNB",
    status: "maintenance",
    gasPrice: 5,
    blockTime: 3,
    documents: 456,
  },
];

// IoT-Analytics
const iotAnalytics = {
  totalSensors: 24,
  activeSensors: 22,
  offlineSensors: 2,
  alertsToday: 3,
  dataPointsToday: 3456,
  avgResponseTime: 1.2, // Sekunden
  uptime: 99.7, // %
  energyConsumption: 45, // kWh/Monat
  costSavings: 12500, // €/Jahr durch Predictive Maintenance
};

export default function BlockchainIotDemoPage() {
  const [selectedDocument, setSelectedDocument] = useState("");
  const [selectedSensor, setSelectedSensor] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "verified" | "failed"
  >("idle");
  const [verificationProgress, setVerificationProgress] = useState(0);

  // Blockchain-Verifikation simulieren
  const verifyDocument = useCallback(async (docId: string) => {
    setVerificationStatus("verifying");
    setVerificationProgress(0);
    
    // Simulierte Verifikations-Schritte
    const steps = [
      "Blockchain-Verbindung herstellen...",
      "Transaktion suchen...",
      "Hash vergleichen...",
      "Signatur validieren...",
      "Verifikation abschließen...",
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setVerificationProgress(((i + 1) / steps.length) * 100);
    }
    
    setVerificationStatus("verified");
    setTimeout(() => setVerificationStatus("idle"), 3000);
  }, []);

  // IoT-Sensor-Daten aktualisieren
  const refreshSensorData = useCallback((sensorId: string) => {
    alert(`Sensor ${sensorId} Daten werden aktualisiert...`);
  }, []);
  
  // Sensor konfigurieren
  const configureSensor = useCallback((sensorId: string) => {
    alert(`Sensor ${sensorId} Konfiguration wird geöffnet...`);
  }, []);
  
  // Status-Indikatoren
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "online":
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "offline":
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  }, []);
  
  const getSensorIcon = useCallback((type: string) => {
    switch (type) {
      case "temperature":
        return <Thermometer className="h-4 w-4" />;
      case "weight":
        return <Scale className="h-4 w-4" />;
      case "humidity":
        return <Activity className="h-4 w-4" />;
      case "motion":
        return <Eye className="h-4 w-4" />;
      default:
        return <Cpu className="h-4 w-4" />;
    }
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Blockchain & IoT Integration
        </h1>
        <p className="text-gray-600 mt-2">
          Unveränderliche Dokumentenketten & Sensor-Daten in VALEO NeuroERP
          Masken
        </p>
      </div>
      
      <Tabs defaultValue="blockchain" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="iot">IoT Sensoren</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Blockchain-Tab */}
        <TabsContent value="blockchain" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <FileCheck className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {
                        blockchainDocuments.filter(
                          (d) => d.status === "verified"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-600">
                      Verifizierte Dokumente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Hash className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {blockchainDocuments.length}
                    </p>
                    <p className="text-xs text-gray-600">Blockchain-Einträge</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-xs text-gray-600">Integrität</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Blockchain-Netzwerke */}
          <Card>
            <CardHeader>
              <CardTitle>Blockchain-Netzwerke</CardTitle>
              <CardDescription>
                Verfügbare Blockchain-Netzwerke für Dokumenten-Verifikation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {blockchainNetworks.map((network) => (
                  <Card
                    key={network.id}
                    className={`border-2 ${
                      network.status === "active"
                        ? "border-green-200 bg-green-50"
                        : network.status === "maintenance"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-gray-200"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Database className="h-6 w-6 text-gray-600" />
                          <div>
                            <h3 className="font-semibold">{network.name}</h3>
                            <Badge
                              className={
                                network.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : network.status === "maintenance"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }
                            >
                              {network.status === "active"
                                ? "Aktiv"
                                : network.status === "maintenance"
                                  ? "Wartung"
                                  : "Inaktiv"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Gas-Preis:</span>
                          <span className="font-medium">
                            {network.gasPrice} gwei
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Block-Zeit:</span>
                          <span className="font-medium">
                            {network.blockTime}s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dokumente:</span>
                          <span className="font-medium">
                            {network.documents}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Blockchain-Dokumente */}
          <Card>
            <CardHeader>
              <CardTitle>Blockchain-verifizierte Dokumente</CardTitle>
              <CardDescription>
                Dokumente mit unveränderlicher Blockchain-Verifikation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dokument</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Blockchain TX</TableHead>
                    <TableHead>Netzwerk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bestätigungen</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockchainDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-xs truncate">
                        {doc.blockchainTx}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{doc.network}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(doc.status)}
                          <span className="text-sm capitalize">
                            {doc.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{doc.confirmations}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyDocument(doc.id)}
                          >
                            <Shield className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Verifikations-Status */}
          {verificationStatus !== "idle" && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {verificationStatus === "verifying" && (
                      <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
                    )}
                    {verificationStatus === "verified" && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {verificationStatus === "failed" && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">
                        {verificationStatus === "verifying"
                          ? "Verifikation läuft..."
                          : verificationStatus === "verified"
                            ? "Dokument verifiziert!"
                            : "Verifikation fehlgeschlagen"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Blockchain-Integrität wird überprüft
                      </div>
                    </div>
                  </div>
                </div>
                {verificationStatus === "verifying" && (
                  <Progress value={verificationProgress} />
                )}
                {verificationStatus === "verified" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Dokument ist authentisch und unverändert.
                      Blockchain-Verifikation erfolgreich.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* IoT-Tab */}
        <TabsContent value="iot" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {iotAnalytics.totalSensors}
                    </p>
                    <p className="text-xs text-gray-600">Sensoren gesamt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {iotAnalytics.activeSensors}
                    </p>
                    <p className="text-xs text-gray-600">Aktive Sensoren</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {iotAnalytics.dataPointsToday.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">Datenpunkte/Tag</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {iotAnalytics.costSavings.toLocaleString()}€
                    </p>
                    <p className="text-xs text-gray-600">Einsparungen/Jahr</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* IoT-Sensoren */}
          <Card>
            <CardHeader>
              <CardTitle>IoT-Sensor-Netzwerk</CardTitle>
              <CardDescription>
                Echtzeit-Sensor-Daten für automatisierte Prozesse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {iotSensors.map((sensor) => (
                  <Card
                    key={sensor.id}
                    className={`border-2 ${
                      sensor.status === "online"
                        ? "border-green-200 bg-green-50"
                        : sensor.status === "warning"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-red-200 bg-red-50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getSensorIcon(sensor.type)}
                          <div>
                            <h3 className="font-semibold text-sm">
                              {sensor.name}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {sensor.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(sensor.status)}
                          <Badge
                            className={
                              sensor.status === "online"
                                ? "bg-green-100 text-green-800"
                                : sensor.status === "warning"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {sensor.status === "online"
                              ? "Online"
                              : sensor.status === "warning"
                                ? "Warnung"
                                : "Offline"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Aktueller Wert:</span>
                          <span
                            className={`font-bold ${
                              sensor.lastReading < sensor.threshold.min ||
                              sensor.lastReading > sensor.threshold.max
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {sensor.lastReading} {sensor.unit}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Schwellenwert: {sensor.threshold.min} -{" "}
                          {sensor.threshold.max} {sensor.unit}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => refreshSensorData(sensor.id)}
                          >
                            <Activity className="h-3 w-3 mr-1" />
                            Aktualisieren
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => configureSensor(sensor.id)}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Konfigurieren
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Integration-Tab */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain & IoT Integration</CardTitle>
              <CardDescription>
                Wie Sensor-Daten in Blockchain-verifizierte Masken integriert
                werden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    Automatische Masken-Generierung
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked />
                      <Label>
                        Sensor-Daten automatisch in Masken einbinden
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked />
                      <Label>Blockchain-Verifikation für alle Dokumente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox />
                      <Label>KI-gestützte Anomalie-Erkennung</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox />
                      <Label>Predictive Maintenance Integration</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Integrations-Beispiele</h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 border rounded">
                      <div className="font-medium">
                        Temperatur-Sensor → Qualitätsmaske
                      </div>
                      <div className="text-gray-600">
                        Automatische Temperatur-Protokollierung in
                        Qualitätsprüfungen
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium">
                        Gewichts-Sensor → Lieferschein
                      </div>
                      <div className="text-gray-600">
                        Echtzeit-Gewichtserfassung bei Wareneingang
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium">
                        Blockchain → Alle Dokumente
                      </div>
                      <div className="text-gray-600">
                        Unveränderliche Verifikation aller Geschäftsdokumente
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Integration Vorteile:</strong>
                  <br />• Echtzeit-Daten in allen Geschäftsprozessen
                  <br />• Unveränderliche Dokumenten-Historie
                  <br />• Automatisierte Qualitätssicherung
                  <br />• Predictive Maintenance für Anlagen
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          {/* Live-Integration-Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Live-Integration Demo</CardTitle>
              <CardDescription>
                Simulierte Integration von IoT-Daten in Blockchain-verifizierte
                Masken
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded">
                  <Thermometer className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">Sensor-Daten</div>
                  <div className="text-sm text-gray-600">
                    18.5°C Lagerhalle A
                  </div>
                </div>
                <div className="text-center p-4 border-2 border-dashed border-blue-300 rounded">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">Masken-Integration</div>
                  <div className="text-sm text-gray-600">
                    Temperatur → Qualitätsprotokoll
                  </div>
                </div>
                <div className="text-center p-4 border-2 border-dashed border-green-300 rounded">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="font-medium">Blockchain-Verifikation</div>
                  <div className="text-sm text-gray-600">Hash: a1b2c3d4...</div>
                </div>
              </div>
              <div className="flex justify-center">
                <Button className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Live-Integration starten</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics-Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain-Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Durchschnittliche Gas-Kosten:</span>
                    <span className="font-medium">15,000 gwei</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ø Bestätigungszeit:</span>
                    <span className="font-medium">2.3 Minuten</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verifikations-Erfolgsrate:</span>
                    <span className="font-medium text-green-600">99.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monatliche Transaktionen:</span>
                    <span className="font-medium">2,450</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>IoT-System-Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>System-Uptime:</span>
                    <span className="font-medium text-green-600">
                      {iotAnalytics.uptime}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ø Response-Zeit:</span>
                    <span className="font-medium">
                      {iotAnalytics.avgResponseTime}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energieverbrauch:</span>
                    <span className="font-medium">
                      {iotAnalytics.energyConsumption} kWh/Monat
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aktive Alerts:</span>
                    <span className="font-medium text-orange-600">
                      {iotAnalytics.alertsToday}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Business Impact</CardTitle>
              <CardDescription>
                Wirtschaftliche Vorteile der Blockchain & IoT Integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {iotAnalytics.costSavings.toLocaleString()}€
                  </div>
                  <div className="text-sm text-green-600">
                    Jährliche Einsparungen
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Predictive Maintenance
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    99.8%
                  </div>
                  <div className="text-sm text-blue-600">
                    Dokumenten-Integrität
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Blockchain-Verifikation
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    85%
                  </div>
                  <div className="text-sm text-purple-600">
                    Prozess-Automatisierung
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    IoT-getriebene Workflows
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              <strong>Analytics Insights:</strong>
              <br />• Blockchain-Verifikation sichert 99.8%
              Dokumenten-Integrität
              <br />• IoT-System erreicht 99.7% Uptime mit minimalen Kosten
              <br />• Predictive Maintenance spart 12.500€ jährlich
              <br />• 85% der Qualitätsprozesse sind jetzt automatisiert
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
