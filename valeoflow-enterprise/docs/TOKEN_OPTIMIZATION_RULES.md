# ValeoFlow Token-Optimierungsregeln

## 🎯 Token-Limits (Claude Flow)

### Plan-spezifische Limits
- **Pro Plan**: 7.000 Tokens
- **Max5 Plan**: 35.000 Tokens  
- **Max20 Plan**: 140.000 Tokens
- **Custom Max**: Automatische Erkennung basierend auf höchstem vorherigen Block

### Konversationslängen-Limits
- **Maximale Konversationslänge**: ~50-100 Nachrichten
- **Empfohlene Länge**: 30-50 Nachrichten
- **Kritische Schwelle**: 80+ Nachrichten

## 📝 Optimierungsstrategien

### 1. Konversations-Management
```markdown
✅ Empfohlen:
- Neue Konversation nach 50 Nachrichten starten
- Wichtige Kontext-Informationen in Memory-Bank speichern
- Zusammenfassungen nach jedem Hauptabschnitt

❌ Vermeiden:
- Sehr lange Konversationen (>80 Nachrichten)
- Wiederholte Kontext-Erklärungen
- Unnötige Code-Blöcke in Antworten
```

### 2. Antwort-Optimierung
```markdown
✅ Token-sparend:
- Kurze, präzise Antworten
- Code nur bei Änderungen zeigen
- Zusammenfassungen statt vollständiger Code
- Verweise auf vorherige Dateien

❌ Token-intensiv:
- Vollständige Code-Dateien wiederholen
- Lange Erklärungen ohne Mehrwert
- Unnötige Formatierungen
```

### 3. Memory-Bank Integration
```markdown
Verwendung:
- Wichtige Entscheidungen speichern
- Projekt-Status dokumentieren
- Technische Details archivieren
- Kontext für neue Konversationen
```

## 🔄 Konversations-Wechsel

### Trigger für neue Konversation:
1. **50+ Nachrichten** erreicht
2. **Themenwechsel** (z.B. von Backend zu Frontend)
3. **Phase-Abschluss** (z.B. Phase 1 → Phase 2)
4. **Token-Warnung** erhalten

### Übergabe-Prozess:
```markdown
1. Aktuellen Status in Memory-Bank speichern
2. Zusammenfassung der erreichten Ziele
3. Nächste Schritte dokumentieren
4. Neue Konversation mit Kontext-Referenz starten
```

## 📊 Monitoring

### Token-Verbrauch überwachen:
```bash
# Token-Monitoring aktivieren
python claude-flow-alpha/scripts/claude-monitor.py --plan pro

# Warnungen bei:
- 80% Token-Verbrauch
- 50+ Nachrichten
- Hohe Burn-Rate
```

### Automatische Optimierung:
- **Pro Plan**: Auto-switch zu Custom Max bei Überschreitung
- **Burn-Rate Monitoring**: Warnung bei hohem Verbrauch
- **Session-Duration**: 5 Stunden Maximum

## 🎯 Best Practices

### Für ValeoFlow-Entwicklung:
1. **Modulare Konversationen**: Ein Thema pro Konversation
2. **Memory-Bank nutzen**: Status und Entscheidungen speichern
3. **Kurze Antworten**: Fokus auf Aktionen statt Erklärungen
4. **Code-Referenzen**: Verweise statt vollständiger Code
5. **Zusammenfassungen**: Nach jedem Hauptabschnitt

### Token-Effizienz:
- **Max 2000 Tokens** pro Antwort
- **Max 50 Nachrichten** pro Konversation
- **Memory-Bank** für Kontext-Übertragung
- **Kurze Prompts** mit klaren Anweisungen

## 🚨 Notfall-Prozeduren

### Bei Token-Limit-Überschreitung:
1. **Sofort Memory-Bank speichern**
2. **Zusammenfassung erstellen**
3. **Neue Konversation starten**
4. **Kontext aus Memory-Bank laden**

### Bei Konversations-Limit:
1. **Status dokumentieren**
2. **Nächste Schritte definieren**
3. **Neue Konversation mit Referenz**
4. **Memory-Bank für Übergabe nutzen** 