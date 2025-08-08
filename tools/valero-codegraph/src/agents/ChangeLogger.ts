import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import { artifactsDir } from '../config.js';
import { RefactorSuggestion } from '../types.js';

export async function logChanges(suggestions: RefactorSuggestion[]) {
  await fse.ensureDir(artifactsDir);
  const logPath = path.join(artifactsDir, 'change-log.md');
  const header = `# Change Log\n\nDatum: ${new Date().toISOString()}\n\n`;
  const body = suggestions.map(s => `- ${s.filePath}: ${s.title} — ${s.description} (Impact: ${s.impact})`).join('\n');
  fs.appendFileSync(logPath, header + body + '\n\n');
}
