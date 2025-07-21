import express from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { requirePermission } from '../../middleware/auth';
import config from '../../config/database';

const router = express.Router();

// =====================================================
// KPI ENDPOINTS
// =====================================================

// Get all KPIs
router.get('/kpis', requirePermission(['REPORTING_READ']), asyncHandler(async (req, res) => {
  const client = await config.connect();
  try {
    const result = await client.query(`
      SELECT 
        k.id,
        k.kpi_name,
        k.beschreibung,
        k.kategorie,
        k.einheit,
        k.ziel_wert,
        k.warnung_unter,
        k.warnung_ueber,
        k.trend_richtung,
        k.letzter_refresh,
        k.aktiv,
        kw.wert as aktueller_wert,
        kw.zeitstempel as letzter_wert_zeitstempel
      FROM reporting.kpi_definitionen k
      LEFT JOIN LATERAL (
        SELECT wert, zeitstempel
        FROM reporting.kpi_werte
        WHERE kpi_id = k.id
        ORDER BY zeitstempel DESC
        LIMIT 1
      ) kw ON true
      WHERE k.aktiv = true
      ORDER BY k.kategorie, k.kpi_name
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } finally {
    client.release();
  }
}));

// Get KPI by ID
router.get('/kpis/:id', requirePermission(['REPORTING_READ']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await config.connect();
  try {
    const result = await client.query(`
      SELECT 
        k.*,
        kw.wert as aktueller_wert,
        kw.zeitstempel as letzter_wert_zeitstempel
      FROM reporting.kpi_definitionen k
      LEFT JOIN LATERAL (
        SELECT wert, zeitstempel
        FROM reporting.kpi_werte
        WHERE kpi_id = k.id
        ORDER BY zeitstempel DESC
        LIMIT 1
      ) kw ON true
      WHERE k.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'KPI nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } finally {
    client.release();
  }
}));

// Create new KPI
router.post('/kpis', requirePermission(['REPORTING_WRITE']), asyncHandler(async (req, res) => {
  const {
    kpi_name,
    beschreibung,
    kategorie,
    berechnungs_formel,
    einheit,
    ziel_wert,
    warnung_unter,
    warnung_ueber,
    trend_richtung
  } = req.body;

  const client = await config.connect();
  try {
    const result = await client.query(`
      INSERT INTO reporting.kpi_definitionen (
        kpi_name, beschreibung, kategorie, berechnungs_formel, einheit,
        ziel_wert, warnung_unter, warnung_ueber, trend_richtung, erstellt_von
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      kpi_name, beschreibung, kategorie, berechnungs_formel, einheit,
      ziel_wert, warnung_unter, warnung_ueber, trend_richtung, req.user!.id
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } finally {
    client.release();
  }
}));

// Update KPI
router.put('/kpis/:id', requirePermission(['REPORTING_WRITE']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const client = await config.connect();
  try {
    const result = await client.query(`
      UPDATE reporting.kpi_definitionen
      SET 
        kpi_name = COALESCE($1, kpi_name),
        beschreibung = COALESCE($2, beschreibung),
        kategorie = COALESCE($3, kategorie),
        berechnungs_formel = COALESCE($4, berechnungs_formel),
        einheit = COALESCE($5, einheit),
        ziel_wert = COALESCE($6, ziel_wert),
        warnung_unter = COALESCE($7, warnung_unter),
        warnung_ueber = COALESCE($8, warnung_ueber),
        trend_richtung = COALESCE($9, trend_richtung),
        geaendert_von = $10,
        geaendert_am = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [
      updateData.kpi_name, updateData.beschreibung, updateData.kategorie,
      updateData.berechnungs_formel, updateData.einheit, updateData.ziel_wert,
      updateData.warnung_unter, updateData.warnung_ueber, updateData.trend_richtung,
      req.user!.id, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'KPI nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } finally {
    client.release();
  }
}));

// Calculate KPI value
router.post('/kpis/:id/calculate', requirePermission(['REPORTING_WRITE']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await config.connect();
  try {
    // Call the KPI calculation function
    const result = await client.query(
      'SELECT reporting.berechne_kpi($1) as wert',
      [id]
    );

    res.json({
      success: true,
      data: {
        kpi_id: id,
        wert: result.rows[0].wert,
        berechnet_am: new Date().toISOString()
      }
    });
  } finally {
    client.release();
  }
}));

// =====================================================
// REPORT TEMPLATES ENDPOINTS
// =====================================================

// Get all report templates
router.get('/templates', requirePermission(['REPORTING_READ']), asyncHandler(async (req, res) => {
  const client = await config.connect();
  try {
    const result = await client.query(`
      SELECT 
        bv.*,
        bk.kategorie_name,
        bk.farbe as kategorie_farbe
      FROM reporting.berichtsvorlagen bv
      JOIN reporting.berichtskategorien bk ON bv.kategorie_id = bk.id
      WHERE bv.aktiv = true
      ORDER BY bk.sortierung, bv.vorlagen_name
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } finally {
    client.release();
  }
}));

// Get report template by ID
router.get('/templates/:id', requirePermission(['REPORTING_READ']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await config.connect();
  try {
    const result = await client.query(`
      SELECT 
        bv.*,
        bk.kategorie_name,
        bk.farbe as kategorie_farbe
      FROM reporting.berichtsvorlagen bv
      JOIN reporting.berichtskategorien bk ON bv.kategorie_id = bk.id
      WHERE bv.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Berichtsvorlage nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } finally {
    client.release();
  }
}));

// Execute report
router.post('/templates/:id/execute', requirePermission(['REPORTING_WRITE']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { parameter_werte = {} } = req.body;

  const client = await config.connect();
  try {
    // Call the report execution function
    const result = await client.query(
      'SELECT reporting.fuehre_bericht_aus($1, $2, $3) as ausfuehrung_id',
      [id, JSON.stringify(parameter_werte), req.user!.id]
    );

    res.json({
      success: true,
      data: {
        ausfuehrung_id: result.rows[0].ausfuehrung_id,
        vorlagen_id: id,
        parameter_werte,
        status: 'GESTARTET'
      }
    });
  } finally {
    client.release();
  }
}));

// =====================================================
// DASHBOARD ENDPOINTS
// =====================================================

// Get all dashboards
router.get('/dashboards', requirePermission(['REPORTING_READ']), asyncHandler(async (req, res) => {
  const client = await config.connect();
  try {
    const result = await client.query(`
      SELECT 
        d.*,
        COUNT(w.id) as widget_anzahl
      FROM reporting.dashboards d
      LEFT JOIN reporting.dashboard_widgets w ON d.id = w.dashboard_id AND w.aktiv = true
      WHERE d.aktiv = true
      GROUP BY d.id
      ORDER BY d.standard_dashboard DESC, d.dashboard_name
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } finally {
    client.release();
  }
}));

// Get dashboard with widgets
router.get('/dashboards/:id', requirePermission(['REPORTING_READ']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await config.connect();
  try {
    const dashboardResult = await client.query(
      'SELECT * FROM reporting.dashboards WHERE id = $1',
      [id]
    );

    if (dashboardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard nicht gefunden'
      });
    }

    const widgetsResult = await client.query(`
      SELECT 
        w.*,
        bv.vorlagen_name as datenquelle_name
      FROM reporting.dashboard_widgets w
      LEFT JOIN reporting.berichtsvorlagen bv ON w.datenquelle_id = bv.id
      WHERE w.dashboard_id = $1 AND w.aktiv = true
      ORDER BY w.position_y, w.position_x
    `, [id]);

    res.json({
      success: true,
      data: {
        ...dashboardResult.rows[0],
        widgets: widgetsResult.rows
      }
    });
  } finally {
    client.release();
  }
}));

// =====================================================
// EXPORT ENDPOINTS
// =====================================================

// Get export jobs
router.get('/exports', requirePermission(['REPORTING_READ']), asyncHandler(async (req, res) => {
  const client = await config.connect();
  try {
    const result = await client.query(`
      SELECT 
        ej.*,
        bv.vorlagen_name,
        m.vorname || ' ' || m.nachname as erstellt_von_name
      FROM reporting.export_jobs ej
      LEFT JOIN reporting.berichtsvorlagen bv ON ej.berichtsvorlage_id = bv.id
      LEFT JOIN personal.mitarbeiter m ON ej.erstellt_von = m.id
      ORDER BY ej.erstellt_am DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } finally {
    client.release();
  }
}));

// Create export job
router.post('/exports', requirePermission(['REPORTING_WRITE']), asyncHandler(async (req, res) => {
  const {
    job_name,
    berichtsvorlage_id,
    export_format,
    parameter_werte,
    ziel_pfad
  } = req.body;

  const client = await config.connect();
  try {
    const result = await client.query(`
      INSERT INTO reporting.export_jobs (
        job_name, berichtsvorlage_id, export_format, parameter_werte,
        ziel_pfad, job_status, erstellt_von
      ) VALUES ($1, $2, $3, $4, $5, 'QUEUED', $6)
      RETURNING *
    `, [
      job_name, berichtsvorlage_id, export_format,
      JSON.stringify(parameter_werte), ziel_pfad, req.user!.id
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } finally {
    client.release();
  }
}));

// =====================================================
// SCHEDULED REPORTS ENDPOINTS
// =====================================================

// Get scheduled reports
router.get('/scheduled', requirePermission(['REPORTING_READ']), asyncHandler(async (req, res) => {
  const client = await config.connect();
  try {
    const result = await client.query(`
      SELECT 
        bv.*,
        bv.name as versendung_name,
        bv.versand_typ,
        bv.zeitplan_typ,
        bv.naechste_ausfuehrung,
        bv.letzte_ausfuehrung,
        bv.aktiv,
        bv.erstellt_von,
        m.vorname || ' ' || m.nachname as erstellt_von_name
      FROM reporting.berichtsversendung bv
      LEFT JOIN personal.mitarbeiter m ON bv.erstellt_von = m.id
      ORDER BY bv.naechste_ausfuehrung
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } finally {
    client.release();
  }
}));

// Create scheduled report
router.post('/scheduled', requirePermission(['REPORTING_WRITE']), asyncHandler(async (req, res) => {
  const {
    name,
    beschreibung,
    berichtsvorlage_id,
    versand_typ,
    empfaenger_definition,
    parameter_werte,
    export_format,
    zeitplan_typ,
    zeitplan_konfiguration
  } = req.body;

  const client = await config.connect();
  try {
    const result = await client.query(`
      INSERT INTO reporting.berichtsversendung (
        name, beschreibung, berichtsvorlage_id, versand_typ,
        empfaenger_definition, parameter_werte, export_format,
        zeitplan_typ, zeitplan_konfiguration, erstellt_von
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      name, beschreibung, berichtsvorlage_id, versand_typ,
      JSON.stringify(empfaenger_definition), JSON.stringify(parameter_werte),
      export_format, zeitplan_typ, JSON.stringify(zeitplan_konfiguration), req.user!.id
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } finally {
    client.release();
  }
}));

// =====================================================
// PERFORMANCE ENDPOINTS
// =====================================================

// Get performance metrics
router.get('/performance', requirePermission(['REPORTING_READ']), asyncHandler(async (req, res) => {
  const client = await config.connect();
  try {
    const result = await client.query(`
      SELECT 
        metrik_typ,
        AVG(dauer_ms) as durchschnitt_dauer_ms,
        MAX(dauer_ms) as max_dauer_ms,
        MIN(dauer_ms) as min_dauer_ms,
        COUNT(*) as anzahl_ausfuehrungen,
        AVG(datensatz_anzahl) as durchschnitt_datensätze,
        COUNT(CASE WHEN cache_hit = true THEN 1 END) as cache_hits,
        COUNT(CASE WHEN cache_hit = false THEN 1 END) as cache_misses
      FROM reporting.performance_metriken
      WHERE erstellt_am >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY metrik_typ
      ORDER BY metrik_typ
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } finally {
    client.release();
  }
}));

// =====================================================
// STATISTICS ENDPOINTS
// =====================================================

// Get overall statistics
router.get('/statistics', requirePermission(['REPORTING_READ']), asyncHandler(async (req, res) => {
  const client = await config.connect();
  try {
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM reporting.kpi_definitionen WHERE aktiv = true) as kpi_anzahl,
        (SELECT COUNT(*) FROM reporting.berichtsvorlagen WHERE aktiv = true) as berichte_anzahl,
        (SELECT COUNT(*) FROM reporting.dashboards WHERE aktiv = true) as dashboard_anzahl,
        (SELECT COUNT(*) FROM reporting.export_jobs WHERE job_status = 'COMPLETED' AND erstellt_am >= CURRENT_DATE - INTERVAL '7 days') as exports_woche,
        (SELECT COUNT(*) FROM reporting.berichtsversendung WHERE aktiv = true) as geplante_versendungen,
        (SELECT AVG(dauer_ms) FROM reporting.performance_metriken WHERE erstellt_am >= CURRENT_DATE - INTERVAL '7 days') as durchschnitt_antwortzeit
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } finally {
    client.release();
  }
}));

export default router; 