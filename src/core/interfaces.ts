/**
 * Abstract interfaces for Codebaxing components.
 */

import type { ParsedFile } from './models.js';

export interface IParser {
  /** Determine if this parser can handle the given file. */
  canParse(filepath: string): boolean;

  /** Parse a source file and extract all symbols. */
  parseFile(filepath: string): ParsedFile;

  /** Return list of file extensions this parser supports. */
  getSupportedExtensions(): string[];
}

export interface IEmbeddingService {
  readonly dimensions: number;
  embed(text: string, isQuery?: boolean): Promise<number[]>;
  embedBatch(texts: string[], isQuery?: boolean): Promise<number[][]>;
  getStats(): Record<string, unknown>;
  clearCache(): void;
  unload(): Promise<void>;
}
