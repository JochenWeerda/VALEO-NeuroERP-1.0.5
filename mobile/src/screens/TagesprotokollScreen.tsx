import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Chip,
  Divider,
  TextInput,
  List,
  IconButton,
  Menu,
  Portal,
  Modal,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialIcons } from '@react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Types
interface TagesprotokollEintrag {
  id: string;
  kunde_id: string;
  kunde_name: string;
  kontakt_typ: 'TELEFON' | 'PERSOENLICH' | 'WHATSAPP' | 'EMAIL';
  thema: string;
  ergebnis: string;
  naechste_schritte: string;
  zeitaufwand_minuten: number;
  koordinaten?: {
    latitude: number;
    longitude: number;
  };
  fotos?: string[];
  unterschrift?: string;
  erstellt_am: string;
  status: 'ENTWURF' | 'FREIGEGEBEN' | 'ARCHIVIERT';
}

interface Kunde {
  id: string;
  name: string;
  adresse: string;
  telefon: string;
  email: string;
}

const TagesprotokollScreen: React.FC = () => {
  const navigation = useNavigation();
  const [protokolle, setProtokolle] = useState<TagesprotokollEintrag[]>([]);
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALLE');

  // Mock-Daten für Entwicklung
  const mockProtokolle: TagesprotokollEintrag[] = [
    {
      id: '1',
      kunde_id: '1',
      kunde_name: 'Bauernhof Müller',
      kontakt_typ: 'PERSOENLICH',
      thema: 'Futtermittel-Bestellung',
      ergebnis: 'Neue Bestellung für 5 Tonnen Schweinefutter',
      naechste_schritte: 'Lieferung nächste Woche koordinieren',
      zeitaufwand_minuten: 45,
      koordinaten: { latitude: 52.5200, longitude: 13.4050 },
      erstellt_am: '2024-12-15T10:30:00Z',
      status: 'FREIGEGEBEN'
    },
    {
      id: '2',
      kunde_id: '2',
      kunde_name: 'Agrarhandel Schmidt',
      kontakt_typ: 'TELEFON',
      thema: 'Preisanfrage Düngemittel',
      ergebnis: 'Preisliste zugesendet',
      naechste_schritte: 'Angebot folgt per E-Mail',
      zeitaufwand_minuten: 15,
      erstellt_am: '2024-12-15T14:15:00Z',
      status: 'ENTWURF'
    },
    {
      id: '3',
      kunde_id: '3',
      kunde_name: 'Landwirtschaft Weber',
      kontakt_typ: 'WHATSAPP',
      thema: 'Lohnspritzen-Termin',
      ergebnis: 'Termin für nächste Woche vereinbart',
      naechste_schritte: 'Maschinen und Personal einplanen',
      zeitaufwand_minuten: 20,
      erstellt_am: '2024-12-15T16:45:00Z',
      status: 'FREIGEGEBEN'
    }
  ];

  const mockKunden: Kunde[] = [
    {
      id: '1',
      name: 'Bauernhof Müller',
      adresse: 'Musterstraße 1, 12345 Musterstadt',
      telefon: '+49 123 456789',
      email: 'mueller@bauernhof.de'
    },
    {
      id: '2',
      name: 'Agrarhandel Schmidt',
      adresse: 'Landstraße 15, 54321 Dorfstadt',
      telefon: '+49 987 654321',
      email: 'info@agrar-schmidt.de'
    },
    {
      id: '3',
      name: 'Landwirtschaft Weber',
      adresse: 'Feldweg 8, 67890 Weilerstadt',
      telefon: '+49 555 123456',
      email: 'weber@landwirtschaft.de'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Prüfe Internetverbindung
      const netInfo = await NetInfo.fetch();
      
      if (netInfo.isConnected) {
        // Lade Daten vom Server
        // const response = await api.get('/crm/tagesprotokolle');
        // setProtokolle(response.data);
        
        // Mock-Daten für Entwicklung
        setProtokolle(mockProtokolle);
        setKunden(mockKunden);
      } else {
        // Lade lokale Daten
        const localData = await AsyncStorage.getItem('tagesprotokolle');
        if (localData) {
          setProtokolle(JSON.parse(localData));
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      Alert.alert('Fehler', 'Daten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleNeuerEintrag = () => {
    navigation.navigate('NeuerTagesprotokollEintrag');
  };

  const handleEintragBearbeiten = (eintrag: TagesprotokollEintrag) => {
    navigation.navigate('TagesprotokollEintragBearbeiten', { eintrag });
  };

  const handleEintragLoeschen = async (eintragId: string) => {
    Alert.alert(
      'Eintrag löschen',
      'Möchten Sie diesen Eintrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              // API-Aufruf zum Löschen
              // await api.delete(`/crm/tagesprotokolle/${eintragId}`);
              
              // Lokale Aktualisierung
              setProtokolle(prev => prev.filter(p => p.id !== eintragId));
              
              // Lokale Speicherung
              await AsyncStorage.setItem('tagesprotokolle', JSON.stringify(protokolle));
              
              Alert.alert('Erfolg', 'Eintrag wurde gelöscht');
            } catch (error) {
              console.error('Fehler beim Löschen:', error);
              Alert.alert('Fehler', 'Eintrag konnte nicht gelöscht werden');
            }
          }
        }
      ]
    );
  };

  const getKontaktTypIcon = (typ: string) => {
    switch (typ) {
      case 'TELEFON':
        return 'phone';
      case 'PERSOENLICH':
        return 'person';
      case 'WHATSAPP':
        return 'chat';
      case 'EMAIL':
        return 'email';
      default:
        return 'contact-support';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FREIGEGEBEN':
        return '#4CAF50';
      case 'ENTWURF':
        return '#FF9800';
      case 'ARCHIVIERT':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'FREIGEGEBEN':
        return 'Freigegeben';
      case 'ENTWURF':
        return 'Entwurf';
      case 'ARCHIVIERT':
        return 'Archiviert';
      default:
        return 'Unbekannt';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredProtokolle = protokolle.filter(protokoll => {
    if (selectedFilter === 'ALLE') return true;
    return protokoll.status === selectedFilter;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Lade Tagesprotokolle...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header mit Filter */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title>Tagesprotokoll</Title>
            <Button
              mode="outlined"
              onPress={() => setFilterModalVisible(true)}
              icon="filter-variant"
            >
              Filter
            </Button>
          </View>
          <View style={styles.statsRow}>
            <Chip icon="calendar-today">
              {protokolle.length} Einträge
            </Chip>
            <Chip icon="clock">
              {protokolle.reduce((sum, p) => sum + p.zeitaufwand_minuten, 0)} Min.
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Protokoll-Liste */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredProtokolle.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title>Keine Einträge</Title>
              <Paragraph>
                {selectedFilter === 'ALLE' 
                  ? 'Noch keine Tagesprotokoll-Einträge vorhanden.'
                  : `Keine Einträge mit Status "${getStatusText(selectedFilter)}" vorhanden.`
                }
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          filteredProtokolle.map((eintrag) => (
            <Card key={eintrag.id} style={styles.protokollCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.customerInfo}>
                    <Title style={styles.customerName}>
                      {eintrag.kunde_name}
                    </Title>
                    <View style={styles.contactInfo}>
                      <MaterialIcons
                        name={getKontaktTypIcon(eintrag.kontakt_typ)}
                        size={16}
                        color="#666"
                      />
                      <Text style={styles.contactText}>
                        {eintrag.kontakt_typ}
                      </Text>
                      <Text style={styles.timeText}>
                        {eintrag.zeitaufwand_minuten} Min.
                      </Text>
                    </View>
                  </View>
                  <Menu
                    visible={menuVisible === eintrag.id}
                    onDismiss={() => setMenuVisible(null)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => setMenuVisible(eintrag.id)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setMenuVisible(null);
                        handleEintragBearbeiten(eintrag);
                      }}
                      title="Bearbeiten"
                      leadingIcon="pencil"
                    />
                    <Menu.Item
                      onPress={() => {
                        setMenuVisible(null);
                        handleEintragLoeschen(eintrag.id);
                      }}
                      title="Löschen"
                      leadingIcon="delete"
                    />
                  </Menu>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.contentSection}>
                  <Text style={styles.sectionTitle}>Thema</Text>
                  <Text style={styles.sectionContent}>{eintrag.thema}</Text>
                </View>

                <View style={styles.contentSection}>
                  <Text style={styles.sectionTitle}>Ergebnis</Text>
                  <Text style={styles.sectionContent}>{eintrag.ergebnis}</Text>
                </View>

                <View style={styles.contentSection}>
                  <Text style={styles.sectionTitle}>Nächste Schritte</Text>
                  <Text style={styles.sectionContent}>{eintrag.naechste_schritte}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Chip
                    mode="outlined"
                    textStyle={{ color: getStatusColor(eintrag.status) }}
                    style={{ borderColor: getStatusColor(eintrag.status) }}
                  >
                    {getStatusText(eintrag.status)}
                  </Chip>
                  <Text style={styles.dateText}>
                    {formatDate(eintrag.erstellt_am)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title>Filter</Title>
          <View style={styles.filterOptions}>
            <Button
              mode={selectedFilter === 'ALLE' ? 'contained' : 'outlined'}
              onPress={() => {
                setSelectedFilter('ALLE');
                setFilterModalVisible(false);
              }}
              style={styles.filterButton}
            >
              Alle
            </Button>
            <Button
              mode={selectedFilter === 'ENTWURF' ? 'contained' : 'outlined'}
              onPress={() => {
                setSelectedFilter('ENTWURF');
                setFilterModalVisible(false);
              }}
              style={styles.filterButton}
            >
              Entwürfe
            </Button>
            <Button
              mode={selectedFilter === 'FREIGEGEBEN' ? 'contained' : 'outlined'}
              onPress={() => {
                setSelectedFilter('FREIGEGEBEN');
                setFilterModalVisible(false);
              }}
              style={styles.filterButton}
            >
              Freigegeben
            </Button>
            <Button
              mode={selectedFilter === 'ARCHIVIERT' ? 'contained' : 'outlined'}
              onPress={() => {
                setSelectedFilter('ARCHIVIERT');
                setFilterModalVisible(false);
              }}
              style={styles.filterButton}
            >
              Archiviert
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleNeuerEintrag}
        label="Neuer Eintrag"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  emptyCard: {
    margin: 16,
    alignItems: 'center',
  },
  protokollCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  contentSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  filterOptions: {
    marginTop: 16,
  },
  filterButton: {
    marginBottom: 8,
  },
});

export default TagesprotokollScreen; 