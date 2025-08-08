import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import { writeJsonArtifacts } from '../config.js';
import { ArchGraph, ArchNode, CodeMap, DependencyEdge } from '../types.js';

export async function mapStructure(codeMap: CodeMap): Promise<ArchGraph> {
  const nodes: ArchNode[] = buildTree(codeMap);
  const deps: DependencyEdge[] = buildDeps(codeMap);
  const graph: ArchGraph = { createdAt: new Date().toISOString(), nodes, deps };
  await writeJsonArtifacts('arch-graph.json', graph);
  return graph;
}

function buildTree(codeMap: CodeMap): ArchNode[] {
  const rootByPath = new Map<string, ArchNode>();
  for (const file of codeMap.files) {
    const parts = file.path.split(path.sep);
    let currentPath = '';
    let parent: ArchNode | undefined;

    for (let i = 0; i < parts.length; i++) {
      currentPath = i === 0 ? parts[0] : path.join(currentPath, parts[i]);
      const isFile = i === parts.length - 1;
      const id = currentPath;

      let node = rootByPath.get(id);
      if (!node) {
        node = { id, type: isFile ? 'file' : 'directory', path: currentPath, children: [] };
        rootByPath.set(id, node);
        if (parent) parent.children!.push(node);
      }
      parent = node;
    }
  }

  // return only top‑level nodes
  const roots = new Set<ArchNode>();
  for (const node of rootByPath.values()) {
    if (!Array.from(rootByPath.values()).some(n => n.children?.includes(node))) {
      if (node.type === 'directory') roots.add(node);
  }
  }
  return Array.from(roots);
}

function buildDeps(codeMap: CodeMap): DependencyEdge[] {
  const edges: DependencyEdge[] = [];
  for (const f of codeMap.files) {
    for (const imp of f.imports) {
      if (imp.startsWith('.')) {
        const norm = path.normalize(path.join(path.dirname(f.path), imp));
        edges.push({ from: f.path, to: norm });
      }
    }
  }
  return edges;
}
