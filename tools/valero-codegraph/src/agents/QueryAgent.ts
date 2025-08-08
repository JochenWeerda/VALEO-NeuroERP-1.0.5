import fs from 'fs';
import path from 'path';
import { RagIndex } from '../types.js';
import { indexDir } from '../config.js';
import { queryIndex } from './RAGMemoryManager.js';

export function loadIndex(): RagIndex | null {
  const p = path.join(indexDir, 'index.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8')) as RagIndex;
}

export function query(queryText: string, topK = 5) {
  const idx = loadIndex();
  if (!idx) return [];
  return queryIndex(idx, queryText, topK);
}
