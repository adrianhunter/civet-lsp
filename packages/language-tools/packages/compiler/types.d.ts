import type { SourceMapping, SourceMap as SourceMapCivet } from "@danielx/civet";
import { RootNode } from "./ast.js";
export {
  AttributeNode,
  BaseNode,
  BlockStatement,
  CommentNode,
  ComponentNode,
  CustomElementNode,
  DoctypeNode,
  ElementNode,
  ExpressionNode,
  FragmentNode,
  FrontmatterNode,
  LiteralNode,
  Node,
  ParentLikeNode,
  ParentNode,
  Point,
  Position,
  TagLikeNode,
  TextNode,
  ValueNode,
} from "./ast.js";
import { DiagnosticCode } from "./diagnostics.js";
import ts from "typescript"
interface PreprocessorResult {
  code: string;
  map?: string;
}
interface PreprocessorError {
  error: string;
}
interface ParseOptions {
  position?: boolean;
}
declare enum DiagnosticSeverity {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4,
}
interface DiagnosticMessage {
  severity: DiagnosticSeverity;
  code: DiagnosticCode;
  location: DiagnosticLocation;
  hint?: string;
  text: string;
}
interface DiagnosticLocation {
  file: string;
  line: number;
  column: number;
  length: number;
}
interface TransformOptions {
  internalURL?: string;
  filename?: string;
  normalizedFilename?: string;
  sourcemap?: boolean | "inline" | "external" | "both";
  astroGlobalArgs?: string;
  compact?: boolean;
  resultScopedSlot?: boolean;
  scopedStyleStrategy?: "where" | "class" | "attribute";
  /**
   * @deprecated "as" has been removed and no longer has any effect!
   */
  as?: "document" | "fragment";
  transitionsAnimationURL?: string;
  resolvePath?: (specifier: string) => Promise<string>;
  preprocessStyle?: (
    content: string,
    attrs: Record<string, string>,
  ) => null | Promise<PreprocessorResult | PreprocessorError>;
  annotateSourceFile?: boolean;
  /**
   * Render script tags to be processed (e.g. script tags that have no attributes or only a `src` attribute)
   * using a `renderScript` function from `internalURL`, instead of stripping the script entirely.
   * @experimental
   */
  renderScript?: boolean;
}
type ConvertToTSXOptions = Pick<
  TransformOptions,
  "filename" | "normalizedFilename"
>
type HoistedScript =
  & {
    type: string;
  }
  & ({
    type: "external";
    src: string;
  } | {
    type: "inline";
    code: string;
    map: string;
  });
interface HydratedComponent {
  exportName: string;
  specifier: string;
  resolvedPath: string;
}
interface TransformResult {
  code: string;
  map: string;
  scope: string;
  styleError: string[];
  diagnostics: DiagnosticMessage[];
  css: string[];
  scripts: HoistedScript[];
  hydratedComponents: HydratedComponent[];
  clientOnlyComponents: HydratedComponent[];
  containsHead: boolean;
  propagation: boolean;
}
interface SourceMap {
  file: string;
  mappings: string;
  names: string[];
  sources: string[];
  sourcesContent: string[];
  version: number;
}
interface TSXResult {
  code: string;
  map: SourceMap;
  mapRaw?: SourceMapCivet
  diagnostics: DiagnosticMessage[];

  metaRanges: {
    frontmatter: {
      start: number;
      end: number;
    };
    body: {
      start: number;
      end: number;
    };
  };
}
interface ParseResult {
  ast: RootNode;
  civetMap?: any;
  civetAst?: any;
  diagnostics: DiagnosticMessage[];
}
declare function transform(
  input: string,
  options?: TransformOptions,
): Promise<TransformResult>;
declare function parse(
  input: string,
  options?: ParseOptions,
): Promise<ParseResult>;
declare function convertToTSX(
  input: string,
  options?: ConvertToTSXOptions,
): Promise<TSXResult>;
declare function initialize(options: InitializeOptions): Promise<void>;
/**
 * When calling the core compiler APIs, e.g. `transform`, `parse`, etc, they
 * would automatically instantiate a WASM instance to process the input. When
 * done, you can call this to manually teardown the WASM instance.
 *
 * If the APIs are called again, they will automatically instantiate a new WASM
 * instance. In browsers, you have to call `initialize()` again before using the APIs.
 *
 * Note: Calling teardown is optional and exists mostly as an optimization only.
 */
declare function teardown(): void;
interface InitializeOptions {
  wasmURL?: string;
}

export {
  convertToTSX,
  ConvertToTSXOptions,
  DiagnosticLocation,
  DiagnosticMessage,
  DiagnosticSeverity,
  HoistedScript,
  HydratedComponent,
  initialize,
  InitializeOptions,
  parse,
  ParseOptions,
  ParseResult,
  PreprocessorError,
  PreprocessorResult,
  RootNode,
  SourceMap,
  teardown,
  transform,
  TransformOptions,
  TransformResult,
  TSXResult,
};
