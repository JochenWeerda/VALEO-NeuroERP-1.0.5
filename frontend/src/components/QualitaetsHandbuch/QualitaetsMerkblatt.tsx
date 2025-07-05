import React, { useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';

const QualitaetsMerkblatt: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Maßnahmen_für_den_sicheren_Umgang_mit_Getreide',
  });
  
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button 
          variant="outlined" 
          startIcon={<PrintIcon />} 
          onClick={handlePrint}
          sx={{ mr: 1 }}
        >
          Drucken
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
        >
          Als PDF speichern
        </Button>
      </Box>
      
      <Paper sx={{ p: 4 }} ref={printRef}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Maßnahmen für den sicheren Umgang mit Getreide, Ölsaaten und Leguminosen
        </Typography>
        
        <Typography variant="subtitle1" align="center" gutterBottom>
          (Stand: Mai 2023)
        </Typography>
        
        <Box mt={4}>
          <Typography variant="body1" paragraph>
            In diesem Merkblatt sind die wichtigsten Schritte zur Sicherstellung einer hochwertigen Getreide-, Ölsaaten- und Leguminosenqualität zusammengefasst. Die Regelungen der guten landwirtschaftlichen Praxis sowie alle relevanten gesetzlichen Vorschriften, insbesondere die Vorgaben der Lebensmittel- und Futtermittelgesetzgebung, sind von allen Beteiligten der Wertschöpfungskette einzuhalten.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Regelmäßige Aufzeichnungen – möglichst elektronisch – über betriebseigene Maßnahmen dokumentieren die Qualitätssicherung und unterstützen die Rückverfolgbarkeit. Dies gilt für alle Marktpartner. Entsprechende Hinweise zur Dokumentation werden im nachfolgenden Text mit dem Zeichen (􀀀) markiert.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Die getreide-, ölsaaten- und leguminosenanhaftenden Stäube oder andere Verunreinigungen können Belastungen aufweisen, die in der Lebensmittel- und Futtermittelherstellung unerwünscht sind. Diese müssen so eliminiert werden, dass sie der weiteren Verarbeitungskette entzogen werden. Darüber hinaus ist in der Kette vom Erzeugerbetrieb bis zur Verarbeitung zu verhindern, dass eine unerwünschte Vermischung mit anderen Rohstoffen erfolgt. Eine solche Vermischung kann zu unkalkulierbaren Risiken für alle Unternehmen in der Wertschöpfungskette führen.
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h5" gutterBottom>
            Anbau
          </Typography>
          
          <Typography variant="body1" component="div">
            <ul>
              <li>Alle acker- und pflanzenbaulichen Maßnahmen sind auf die Minimierung unerwünschter Stoffe in der Nahrungsmittelkette auszurichten. Der Pflanzenschutz darf nach den gesetzlichen Vorgaben nur von sachkundigen Personen durchgeführt werden, die die gesetzlich vorgeschriebenen Fortbildungen wahrnehmen.</li>
              <li>Hohe Mykotoxingehalte führen zu erheblichen Einschränkungen der Verwertungs- und Vermarktungsmöglichkeiten. Unter anderem sollte mit folgenden Maßnahmen diesem Risiko begegnet werden:
                <ul>
                  <li>Auswahl standortangepasster, gering anfälliger Sorten</li>
                  <li>standort- und situationsangepasste Bodenbearbeitung</li>
                  <li>Fruchtfolge</li>
                  <li>zeitlich optimierter Fungizideinsatz</li>
                  <li>Feldrandhygiene</li>
                </ul>
              </li>
              <li>Die Verwendung von organischen Substanzen als Düngemittel (Klärschlamm, Fleischknochenmehl, Gärsubstrate aus Abfallanlagen), auch unbeabsichtigte Einträge von benachbarten Flächen, beschränkt die Verwertungsmöglichkeiten des Ernteproduktes und muss den Marktpartnern ausdrücklich mitgeteilt werden.</li>
            </ul>
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h5" gutterBottom>
            Ernte
          </Typography>
          
          <Typography variant="body1" component="div">
            <ul>
              <li>Unerwünschte Bestandteile (Fremdbesatz und Staubanteile) sowie Bruchkorn werden bereits bei der Ernte durch die richtige Schnitthöhe und optimale Einstellung des Mähdreschers (Siebe, Windmenge etc.) erheblich reduziert.</li>
              <li>Erntemaschinen (z. B. Mähdrescher) müssen zur Vermeidung des Eintrags unerwünschter Stoffe in technisch einwandfreiem Zustand sein.</li>
            </ul>
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h5" gutterBottom>
            Transport
          </Typography>
          
          <Typography variant="body1" component="div">
            <ul>
              <li>Sämtliche Transportmittel (auch Mähdrescher und Fremdfahrzeuge) müssen zur Vermeidung von Verunreinigungen sauber, trocken und für den Transport geeignet sein. Beim Einsatz von Reinigungs-, Desinfektions- und Pflegemitteln ist darauf zu achten, dass nur lebensmittelverträgliche Substanzen verwendet werden.</li>
              <li>Verschmutzte Transportmittel sind vor der Beladung sorgfältig zu reinigen (Besen- und/oder Druckluft- bzw. Nassreinigung; ggf. Desinfektion und Nachspülen mit sauberem Wasser).</li>
              <li>Transportmittel dürfen nicht mit Getreide, Ölsaaten und Leguminosen beladen werden, wenn diese zuvor auch für den Transport folgender Güter in loser Schüttung genutzt wurden:
                <ul>
                  <li>Asbest und asbesthaltige Materialien</li>
                  <li>bestimmte tierische Bestandteile (z. B. Schlachtabfälle, Fleischknochenmehl, Tiermehl, Fischmehl, Speisereste)</li>
                  <li>Klärschlamm, Fäkalien und tierische Exkremente</li>
                  <li>Haushalts- und Industrieabfälle</li>
                  <li>Glas, Metallspäne</li>
                  <li>ätzende oder giftige Stoffe (auch gebeiztes Saat- und Pflanzgut in loser Schüttung)</li>
                </ul>
              </li>
              <li>Ausgenommen sind die Transportmittel, bei denen der Transporteur nachweist, dass diese und die Laderäume nach einem festgelegten Verfahren durch eine zugelassene Prüfinstitution oder autorisierte Person freigegeben wurden, bevor eine erneute Beladung erfolgt.</li>
              <li>Transportmittel, die den Anforderungen aus diesem Kapitel hinsichtlich der Sauberkeit nicht entsprechen, dürfen nicht beladen werden.</li>
            </ul>
          </Typography>
          
          <Alert severity="info" sx={{ my: 3 }}>
            Hinweise zu Transportfolgen, spezifischen Reinigungsverfahren sowie weiteren unerwünschten Vorfrachten enthält u. a. die Datenbank Ladungen/Straßentransporte und der QS-Leitfaden Futtermittelwirtschaft (Kapitel 5).
          </Alert>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h5" gutterBottom>
            Lagerung
          </Typography>
          
          <Typography variant="body1" paragraph>
            Grundlegende Hinweise über geeignete und effektive Maßnahmen in der Lagerung finden sich in der Leitlinie zum Vorratsschutz.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Maßnahmen vor der Lagerung
          </Typography>
          
          <Typography variant="body1" component="div">
            <ul>
              <li>Bei der Zwischenlagerung von Getreide, Ölsaaten und Leguminosen auf dem Transportmittel sind Maßnahmen zum Schutz vor äußeren Einflüssen (i. d. R. Plane) zu treffen.</li>
              <li>Der unmittelbare Be- und Entladebereich muss in einem sauberen und leicht zu reinigenden Zustand sein. Keine Lagerung von gebeiztem Saat- und Pflanzgut (lose), Pflanzenschutzmitteln, Mineralölen und sonstigen Gefahrstoffen in Getreide-, Ölsaaten- und Leguminosenlagern!</li>
              <li>Die Wände, Böden und sonstigen Oberflächen der Lagerstätte einschließlich Schüttgossen und Fördereinrichtungen sowie Trockner müssen in baulich einwandfreiem Zustand sein. Sie sind regelmäßig zu säubern und frei von Schädlingen, Schimmel und Feuchtigkeit zu halten.</li>
              <li>Gebäude, die für die Lagerung genutzt werden, müssen trocken und gegen Eindringen von Nässe geschützt sein; undichte Stellen müssen vor der Einlagerung repariert werden. Ausnahmsweise kurzfristig auf Freiflächen gelagertes Getreide muss vor nachteiliger Beeinflussung geschützt werden.</li>
              <li>Es sind Maßnahmen zu treffen, um den Zugang und Verschmutzungen durch Tiere zu verhindern. Deshalb sind Türen und Fenster zum Lager geschlossen zu halten oder durch geeignete Schutzmaßnahmen zu sichern (z. B. durch Netze).</li>
              <li>Das Lager sollte zudem möglichst vor dem unbefugten Zugang Dritter geschützt werden.</li>
              <li>Um das Risiko einer Verunreinigung von Getreide, Ölsaaten und Leguminosen durch Fremdkörper zu vermeiden, sind Glühbirnen und Leuchtstoffröhren gegen Glasbruch zu sichern bzw. zu ummanteln. Andere Fremdkörper sind generell aus dem Lagerbereich zu entfernen.</li>
              <li>Werkzeuge, Schrauben, etc. sind sofort aus dem Lager zu entfernen, wenn diese dort nicht mehr gebraucht werden.</li>
            </ul>
          </Typography>
          
          <Typography variant="body1" paragraph>
            Bei der Anwendung von Vorratsschutzmitteln ist die Zulassung für das jeweilige Lagergut und die Sachkunde des Anwenders zu beachten.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Maßnahmen bei der Einlagerung und während der Lagerung
          </Typography>
          
          <Typography variant="body1" component="div">
            <ul>
              <li>Während der Lagerung sind Verunreinigungen jeder Art und Vermischungen mit anderen Rohstoffen zu vermeiden (besondere Vorsicht z. B. bei Getreide- nach Rapslagerung). Weiterhin ist das Lagergut vor Beeinträchtigungen durch kontaminierte Förder-, Transport- und Lagereinrichtungen zu schützen.</li>
              <li>Getreide, Ölsaaten und Leguminosen sind entsprechend der Lagerdauer in einen lagerfähigen Zustand zu bringen (z. B. durch Reinigung, Kühlung, Trocknung und/oder Belüftung).</li>
              <li>Die Trocknung von Getreide, Ölsaaten und Leguminosen hat qualitätsorientiert und so zu erfolgen, dass die Gehalte an unerwünschten Stoffen nicht erhöht bzw. vermieden werden. Dies setzt geeignete Anlagen und darauf abgestimmte Brennmaterialien voraus.</li>
              <li>Sofern möglich, sollten indirekte Trocknungsverfahren genutzt werden. Kommen Direkttrocknungsverfahren zum Einsatz, so ist der Brenner jährlich vor Inbetriebnahme von einem Serviceunternehmen auf die korrekte Einstellung und Verbrennung (Prüfprotokoll/Rauchgasmessung) kontrollieren zu lassen. Empfohlen werden Rückstellmuster und die Untersuchung des Trockengutes auf Schadstoffrückstände.</li>
              <li>Die Temperatur und der sonstige Qualitätszustand müssen regelmäßig (zu Beginn der Lagerung mind. 14-tägig) überprüft werden. Jeder Temperaturanstieg muss näher untersucht werden, um rechtzeitig geeignete Maßnahmen einleiten zu können.</li>
              <li>Nach der Ernte zur Gesunderhaltung durchgeführte chemische Behandlungsmaßnahmen (auch bei Teilen einer Partie) sind dem Käufer schriftlich mitzuteilen.</li>
            </ul>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default QualitaetsMerkblatt; 