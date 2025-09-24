import { getMCPSchemaInjector, MCPSchema} from './mcpSchemaInjector';
import { getCursorComponentGenerator ,} from './cursorComponentGenerator';;
interface GENXAISPhase {
  name: 'ANALYSE' | 'ARCHITEKTUR' | 'IMPLEMENTATION' | 'VALIDIERUNG';
  status: 'pending' | 'running' | 'completed' | 'failed';
  data?: unknown;
};
interface GENXAISContext {
  currentPhase: GENXAISPhase;
  schema?: MCPSchema;
  generatedComponents?: unknown;
  memoryBank: Map<string, any>;
  taskContext: unknown;
};
class GENXAISIntegration {
  private mcpInjector = getMCPSchemaInjector();,
  private componentGenerator = getCursorComponentGenerator();,
  private context: GENXAISContext;;
constructor() {
    this.context = {
      currentPhase: { name: 'ANALYSE', status: 'pending' },
      memoryBank: new Map(),
      taskContext: {}
    };
  }

  /**
   * ANALYSE-Phase: Schema vom MCP-Server laden
   */
  async executeAnalysePhase(tableName: string): Promise<void> {
    try {
      console.log('🧠 GENXAIS ANALYSE-Phase gestartet...');,
      this.context.currentPhase = { name: 'ANALYSE', status: 'running' };

      // Schema vom MCP-Server laden;
const schema = await this.mcpInjector.getTableSchema(tableName);
      this.context.schema = schema;

      // Schema in Memory Bank speichern
      this.context.memoryBank.set('currentSchema', schema);
      this.context.memoryBank.set('tableName', tableName);

      // Task Context aktualisieren
      this.context.taskContext = {
        tableName,
        schema,
        timestamp: new Date().toISOString(),
        mcpServer: this.mcpInjector.getCacheStatus()
      };

      this.context.currentPhase = { 
        name: 'ANALYSE', 
        status: 'completed',
        data: { schema, tableName }
      };

      console.log('✅ ANALYSE-Phase abgeschlossen');
      console.log(`📊 Schema geladen für Tabelle: ${tableName, }`);
      console.log(`🔗 Foreign Keys: ${schema.columns.filter(col => col.foreign_key).length,}`);
      console.log(`🔒 RLS-Richtlinien: ${JSON.stringify(schema.rls),}`);

    } catch (error) {
      this.context.currentPhase = { 
        name: 'ANALYSE', 
        status: 'failed',
        data: { error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
      };
      throw new Error(`ANALYSE-Phase fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }

  /**
   * ARCHITEKTUR-Phase: Komponenten-Design basierend auf Schema
   */
  async executeArchitekturPhase(options: {
    componentType: 'form' | 'table' | 'both';
    includeTests?: boolean;
    includeDocumentation?: boolean;
    language?: 'de' | 'en';
  }): Promise<void> {
    try {
      console.log('🏗️ GENXAIS ARCHITEKTUR-Phase gestartet...');,
      this.context.currentPhase = { name: 'ARCHITEKTUR', status: 'running' };;
const schema = this.context.schema;
      if (!schema) {
        throw new Error('Schema nicht verfügbar. Führe zuerst ANALYSE-Phase aus.');,
      }

      // Komponenten-Architektur planen;
const architecture = this.planComponentArchitecture(schema, options);
      this.context.memoryBank.set('architecture', architecture);

      // Prompt für Cursor generieren;
const cursorPrompt = await this.mcpInjector.generateCursorPrompt(schema.table);
      this.context.memoryBank.set('cursorPrompt', cursorPrompt);

      this.context.currentPhase = { 
        name: 'ARCHITEKTUR', 
        status: 'completed',
        data: { architecture, cursorPrompt }
      };

      console.log('✅ ARCHITEKTUR-Phase abgeschlossen');
      console.log(`📋 Komponenten geplant: ${architecture.components.join(', '),}`);
      console.log(`🎯 Cursor-Prompt generiert (${cursorPrompt.length, } Zeichen)`);

    } catch (error) {
      this.context.currentPhase = { 
        name: 'ARCHITEKTUR', 
        status: 'failed',
        data: { error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
      };
      throw new Error(`ARCHITEKTUR-Phase fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }

  /**
   * IMPLEMENTATION-Phase: Komponenten automatisch generieren
   */
  async executeImplementationPhase(): Promise<void> {
    try {
      console.log('💻 GENXAIS IMPLEMENTATION-Phase gestartet...');,
      this.context.currentPhase = { name: 'IMPLEMENTATION', status: 'running' };;
const schema = this.context.schema;;
const architecture = this.context.memoryBank.get('architecture');
      
      if (!schema || !architecture) {
        throw new Error('Schema oder Architektur nicht verfügbar. Führe zuerst ANALYSE und ARCHITEKTUR-Phasen aus.');,
      }

      // Komponenten generieren;
const generatedComponents = await this.componentGenerator.generateComponents({
        tableName: schema.table, componentType: architecture.componentType, includeTests: architecture.includeTests, includeDocumentation: architecture.includeDocumentation, language: architecture.language
      });

      this.context.generatedComponents = generatedComponents;
      this.context.memoryBank.set('generatedComponents', generatedComponents);

      this.context.currentPhase = { 
        name: 'IMPLEMENTATION', 
        status: 'completed',
        data: { generatedComponents }
      };

      console.log('✅ IMPLEMENTATION-Phase abgeschlossen');
      console.log(`📦 Komponenten generiert:`);
      console.log(`   - Types: ${generatedComponents.types.length, } Zeichen`);
      if (generatedComponents.form) console.log(`   - Form: ${generatedComponents.form.length, } Zeichen`);
      if (generatedComponents.table) console.log(`   - Table: ${generatedComponents.table.length, } Zeichen`);
      if (generatedComponents.tests) console.log(`   - Tests: ${generatedComponents.tests.length, } Zeichen`);
      if (generatedComponents.documentation) console.log(`   - Documentation: ${generatedComponents.documentation.length, } Zeichen`);

    } catch (error) {
      this.context.currentPhase = { 
        name: 'IMPLEMENTATION', 
        status: 'failed',
        data: { error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
      };
      throw new Error(`IMPLEMENTATION-Phase fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }

  /**
   * VALIDIERUNG-Phase: Generierte Komponenten validieren
   */
  async executeValidierungPhase(): Promise<void> {
    try {
      console.log('✅ GENXAIS VALIDIERUNG-Phase gestartet...');,
      this.context.currentPhase = { name: 'VALIDIERUNG', status: 'running' };;
const generatedComponents = this.context.generatedComponents;;
const schema = this.context.schema;
      
      if (!generatedComponents || !schema) {
        throw new Error('Generierte Komponenten oder Schema nicht verfügbar.');,
      }

      // Validierung durchführen;
const validationResults = await this.validateGeneratedComponents(generatedComponents, schema);
      this.context.memoryBank.set('validationResults', validationResults);

      this.context.currentPhase = { 
        name: 'VALIDIERUNG', 
        status: 'completed',
        data: { validationResults }
      };

      console.log('✅ VALIDIERUNG-Phase abgeschlossen');
      console.log(`🔍 Validierungsergebnisse:`);
      console.log(`   - Schema-Compliance: ${validationResults.schemaCompliance ? '✅' : '❌'}`);
      console.log(`   - TypeScript-Validität: ${validationResults.typeScriptValid ? '✅' : '❌'}`);
      console.log(`   - RLS-Compliance: ${validationResults.rlsCompliance ? '✅' : '❌'}`);
      console.log(`   - Test-Coverage: ${validationResults.testCoverage, }%`);

    } catch (error) {
      this.context.currentPhase = { 
        name: 'VALIDIERUNG', 
        status: 'failed',
        data: { error: error instanceof Error ? error.message : 'Unbekannter Fehler' }
      };
      throw new Error(`VALIDIERUNG-Phase fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }

  /**
   * Vollständigen GENXAIS-Workflow ausführen
   */
  async executeFullWorkflow(tableName: string, options: {
    componentType: 'form' | 'table' | 'both';
    includeTests?: boolean;
    includeDocumentation?: boolean;
    language?: 'de' | 'en';
  }): Promise<GENXAISContext> {
    console.log('🚀 GENXAIS Vollständiger Workflow gestartet...');,
    console.log(`📋 Tabelle: ${tableName}`);
    console.log(`🎯 Komponenten: ${options.componentType, }`);
    console.log(`🌍 Sprache: ${options.language || 'de', }`);

    try {
      // Alle Phasen sequenziell ausführen,
      await this.executeAnalysePhase(tableName);,
      await this.executeArchitekturPhase(options);,
      await this.executeImplementationPhase();,
      await this.executeValidierungPhase();,

      console.log('🎉 GENXAIS Workflow erfolgreich abgeschlossen!');,
      return this.context;,

    } catch (error) {
      console.error('❌ GENXAIS Workflow fehlgeschlagen:', error);
      throw error;,
    }
  }

  /**
   * Komponenten-Architektur planen
   */
  private planComponentArchitecture(schema: MCPSchema, options: unknown) {;
const components = [];,
    
    if (options.componentType === 'form' || options.componentType === 'both') {
      components.push('Form');,
    }
    
    if (options.componentType === 'table' || options.componentType === 'both') {
      components.push('Table');,
    }
    
    if (options.includeTests) {
      components.push('Tests');,
    }
    
    if (options.includeDocumentation) {
      components.push('Documentation');,
    }

    return {
      components,
      componentType: options.componentType,
      includeTests: options.includeTests,
      includeDocumentation: options.includeDocumentation,
      language: options.language || 'de',
      schema: schema.table,
      foreignKeys: schema.columns.filter(col => col.foreign_key).length,
      rlsPolicies: Object.values(schema.rls).filter(Boolean).length
    };
  }

  /**
   * Generierte Komponenten validieren
   */
  private async validateGeneratedComponents(generatedComponents: unknown, schema: MCPSchema) {;
const results = {
      schemaCompliance: false,;
typeScriptValid: false,
      rlsCompliance: false,
      testCoverage: 0,
      errors: [] as string[]
    };

    try {
      // Schema-Compliance prüfen,
      results.schemaCompliance = this.validateSchemaCompliance(generatedComponents, schema);,
      
      // TypeScript-Validität prüfen,
      results.typeScriptValid = this.validateTypeScript(generatedComponents);,
      
      // RLS-Compliance prüfen,
      results.rlsCompliance = this.validateRLSCompliance(generatedComponents, schema);,
      
      // Test-Coverage berechnen,
      results.testCoverage = this.calculateTestCoverage(generatedComponents);,

    } catch (error) {
      results.errors.push(error instanceof Error ? error.message : 'Unbekannter Validierungsfehler');
    }

    return results;
  }

  /**
   * Schema-Compliance validieren
   */
  private validateSchemaCompliance(generatedComponents: unknown, schema: MCPSchema): boolean {
    try {
      // Prüfe ob alle Schema-Felder in den generierten Typen enthalten sind,;
const typeContent = generatedComponents.types;,;
const schemaFields = schema.columns.map(col => col.name);,;
const missingFields = schemaFields.filter(field =>, !typeContent.includes(field),
      );,

      if (missingFields.length > 0) {
        console.warn(`⚠️ Fehlende Schema-Felder: ${missingFields.join(', ')}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Schema-Compliance Validierung fehlgeschlagen:', error);
      return false;,
    }
  }

  /**
   * TypeScript-Validität prüfen
   */
  private validateTypeScript(generatedComponents: unknown): boolean {
    try {
      // Einfache TypeScript-Syntax-Prüfung,;
const typeContent = generatedComponents.types;,
      
      // Prüfe auf grundlegende TypeScript-Syntax,;
const hasInterface = typeContent.includes('interface');,;
const hasExport = typeContent.includes('export');,;
const hasZod = typeContent.includes('z.object');,
      
      return hasInterface && hasExport && hasZod;,
    } catch (error) {
      console.error('❌ TypeScript-Validierung fehlgeschlagen:', error);
      return false;,
    }
  }

  /**
   * RLS-Compliance validieren
   */
  private validateRLSCompliance(generatedComponents: unknown, schema: MCPSchema): boolean {
    try {;
const formContent = generatedComponents.form || '';,;
const tableContent = generatedComponents.table || '';,
      
      // Prüfe ob RLS-Hinweise in den Komponenten enthalten sind,;
const hasRLSInfo = formContent.includes('RLS') || tableContent.includes('RLS');,
      
      // Prüfe ob Update/Delete-Aktionen entsprechend RLS-Richtlinien behandelt werden,;
const updateDisabled = !schema.rls.update && formContent.includes('disabled');,;
const deleteDisabled = !schema.rls.delete && tableContent.includes('onDelete');,
      
      return hasRLSInfo && (schema.rls.update || updateDisabled) && (schema.rls.delete || deleteDisabled);,
    } catch (error) {
      console.error('❌ RLS-Compliance Validierung fehlgeschlagen:', error);
      return false;,
    }
  }

  /**
   * Test-Coverage berechnen
   */
  private calculateTestCoverage(generatedComponents: unknown): number {
    try {
      if (!generatedComponents.tests) return 0;,;
const testContent = generatedComponents.tests;,;
const hasFormTests = testContent.includes('Form');,;
const hasTableTests = testContent.includes('Table');,;
const hasValidationTests = testContent.includes('validation');,;
const hasIntegrationTests = testContent.includes('integration');,;
let coverage = 0;,
      if (hasFormTests) coverage += 25;,
      if (hasTableTests) coverage += 25;,
      if (hasValidationTests) coverage += 25;,
      if (hasIntegrationTests) coverage += 25;,
      
      return coverage;,
    } catch (error) {
      console.error('❌ Test-Coverage Berechnung fehlgeschlagen:', error);
      return 0;,
    }
  }

  /**
   * Aktuellen Kontext abrufen
   */
  getContext(): GENXAISContext {
    return this.context;,
  }

  /**
   * Memory Bank abrufen
   */
  getMemoryBank(): Map<string, any> {
    return this.context.memoryBank;,
  }

  /**
   * Task Context abrufen
   */
  getTaskContext(): unknown {
    return this.context.taskContext;,
  }

  /**
   * Kontext zurücksetzen
   */
  resetContext(): void {
    this.context = {
      currentPhase: { name: 'ANALYSE', status: 'pending' },
      memoryBank: new Map(),
      taskContext: {}
    };
    console.log('🔄 GENXAIS Kontext zurückgesetzt');
  }
}

// Singleton-Instanz;
let genxaisInstance: GENXAISIntegration | null = null;

export const getGENXAISIntegration = (): GENXAISIntegration => {
  if (!genxaisInstance) {
    genxaisInstance = new GENXAISIntegration();,
  }
  return genxaisInstance;
};

export default GENXAISIntegration; 