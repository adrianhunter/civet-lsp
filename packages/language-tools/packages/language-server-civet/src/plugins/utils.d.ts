import { HTMLDocument, Node, Range, TextEdit } from "vscode-html-languageservice";
import type { CivetMetadata, FrontmatterStatus } from "../core/parseCivet.js";
export declare function isJSDocument(languageId: string): boolean;
/**
 * Return true if a specific node could be a component.
 * This is not a 100% sure test as it'll return false for any component that does not match the standard format for a component
 */
export declare function isPossibleComponent(node: Node): boolean;
/**
 * Return if a given offset is inside the start tag of a component
 */
export declare function isInComponentStartTag(html: HTMLDocument, offset: number): boolean;
/**
 * Return if a given position is inside a JSX expression
 */
export declare function isInsideExpression(html: string, tagStart: number, position: number): boolean;
/**
 * Return if a given offset is inside the frontmatter
 */
export declare function isInsideFrontmatter(offset: number, frontmatter: FrontmatterStatus): boolean;
type FrontmatterEditPosition = "top" | "bottom";
export declare function ensureProperEditForFrontmatter(edit: TextEdit, metadata: CivetMetadata, newLine: string, position?: FrontmatterEditPosition): TextEdit;
/**
 * Force a range to be at the start of the frontmatter if it is outside
 */
export declare function ensureRangeIsInFrontmatter(range: Range, metadata: CivetMetadata, position?: FrontmatterEditPosition): Range;
export declare function getNewFrontmatterEdit(edit: TextEdit, civetMetadata: CivetMetadata, newLine: string): TextEdit;
export declare function getOpenFrontmatterEdit(edit: TextEdit, civetMetadata: CivetMetadata, newLine: string): TextEdit;
type FrontmatterEditValidity = {
    itShould: false;
    position: undefined;
} | {
    itShould: true;
    position: FrontmatterEditPosition;
};
export declare function editShouldBeInFrontmatter(range: Range, civetMetadata: CivetMetadata): FrontmatterEditValidity;
export {};
//# sourceMappingURL=utils.d.ts.map