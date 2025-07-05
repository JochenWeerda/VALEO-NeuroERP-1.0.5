FROM grafana/grafana:9.4.7

# Kopiere die Dashboard-Konfigurationen
COPY ./dashboards /etc/grafana/dashboards
COPY ./datasources /etc/grafana/provisioning/datasources
COPY ./dashboard-providers /etc/grafana/provisioning/dashboards

# Umgebungsvariablen setzen
ENV GF_SECURITY_ADMIN_USER=admin
ENV GF_SECURITY_ADMIN_PASSWORD=admin
ENV GF_USERS_ALLOW_SIGN_UP=false
ENV GF_SERVER_DOMAIN=localhost
ENV GF_SMTP_ENABLED=false
ENV GF_DASHBOARDS_MIN_REFRESH_INTERVAL=5s

# Port freigeben
EXPOSE 3000

# Health-Check konfigurieren
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:3000/api/health || exit 1 