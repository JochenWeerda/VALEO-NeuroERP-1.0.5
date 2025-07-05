FROM prom/prometheus:v2.42.0

# Kopiere die Prometheus-Konfiguration
COPY prometheus.yml /etc/prometheus/prometheus.yml

# Port freigeben
EXPOSE 9090

# Health-Check konfigurieren
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:9090/-/healthy || exit 1

# Prometheus mit der benutzerdefinierten Konfiguration starten
CMD ["--config.file=/etc/prometheus/prometheus.yml", \
     "--storage.tsdb.path=/prometheus", \
     "--web.console.libraries=/usr/share/prometheus/console_libraries", \
     "--web.console.templates=/usr/share/prometheus/consoles", \
     "--web.enable-lifecycle", \
     "--storage.tsdb.retention.time=15d"] 