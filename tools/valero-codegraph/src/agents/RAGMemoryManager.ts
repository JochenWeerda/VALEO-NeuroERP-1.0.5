import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import { CodeMap, RagIndex, RagVector } from '../types.js';
import { embeddingDim, writeIndexFile } from '../config.js';

export async function buildIndex(codeMap: CodeMap): Promise<RagIndex> {
  const vectors: RagVector[] = codeMap.chunks.map(chunk => ({
    id: chunk.id,
    vector: embed(chunk.text),
    meta: { filePath: chunk.filePath, startLine: chunk.startLine, endLine: chunk.endLine },
  }));
  const index: RagIndex = { builtAt: new Date().toISOString(), dim: embeddingDim, vectors };
  await writeIndexFile('index.json', index);
  return index;
}

export function queryIndex(index: RagIndex, query: string, topK = 5) {
  const q = embed(query);
  const scored = index.vectors.map(v => ({ v, score: cosine(q, v.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ v, score }) => ({ id: v.id, score, meta: v.meta }));
  return scored;
}

function embed(text: string): number[] {
  // very simple hashing‑based embedding for local use
  const vec = new Array(embeddingDim).fill(0);
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const t of tokens) {
    let h = 0;
    for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
    const idx = h % embeddingDim;
    vec[idx] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0)) || 1;
  return vec.map(x => x / norm);
}

function cosine(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) s += a[i] * b[i];
  return s;
}
