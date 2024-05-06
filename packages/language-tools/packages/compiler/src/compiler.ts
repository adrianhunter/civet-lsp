import * as civet from "@danielx/civet";

export { civet };

export const generate = civet.generate;

import type {
  ConvertToTSXOptions,
  ParseOptions,
  ParseResult,
  TSXResult,
} from "../types";

import type {
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
  // Position,
  RootNode,
  TagLikeNode,
  TextNode,
  ValueNode,
} from "../ast";
import ts, { getLineAndCharacterOfPosition, getPositionOfLineAndCharacter } from "typescript";
// import type ts from "typescript";
function civetXtoCivet(code: string) {
  return preProcess(code);
}

export const is = {
  parent(node: Node): node is ParentNode {
    return false;
  },
  literal(node: Node): node is LiteralNode {
    return false;
  },
  tag(node: Node): node is TagLikeNode {
    return false;
  },
  whitespace(node: Node): node is TextNode {
    return false;
  },
  root(node: Node): node is RootNode {
    return false;
  },
  element(node: Node): node is ElementNode {
    return false;
  },
  customElement(node: Node): node is CustomElementNode {
    return false;
  },
  component(node: Node): node is ComponentNode {
    return false;
  },
  fragment(node: Node): node is FragmentNode {
    return false;
  },
  expression(node: Node): node is ExpressionNode {
    return false;
  },
  text(node: Node): node is TextNode {
    return false;
  },
  doctype(node: Node): node is DoctypeNode {
    return false;
  },
  comment(node: Node): node is CommentNode {
    return false;
  },
  blockStatement(node: Node): node is BlockStatement {
    return node.type === "BlockStatement";
  },
  // frontmatter: (node: Node) => node is FrontmatterNode;
};

export function serialize(root: any, opts?: any) {
  // return preProcess(code);

  // const r = astroCompilerUtils.serialize(root, opts)

  const r = civet.generate(root, { "js": false, "noCache": true });
  return r;
}
export type { CivetAST } from "@danielx/civet";


export const parse = (input: string, options?: ParseOptions): ParseResult => {


  return {
    // ...wow,
    ast: {
      type: "root",
      children: []
    },
    diagnostics: []
    // civetMap: r.sourceMap.json("", ""),
    // civetAst: r.ast,
  };
};

export type {
  AttributeNode,
  ConvertToTSXOptions,
  Point,
  TSXResult,
} from "../types";

function preProcess(code: string) {
  code = code.replace("--", "//");
  code = code.replace("--", "//");

  return code;
}
function changeCharAtIndex(str: string, index: number, newChar: string) {
  if (index < 0 || index >= str.length) {
    return str; // return original string if index is out of bounds
  }
  return str.substring(0, index) + newChar + str.substring(index + newChar.length);
}



// Example usage:
// const originalString = "hello";
// const modifiedString = changeCharAtIndex(originalString, 1, "a"); // Change the character at index 1 to "a"
function postProcess(code: string) {
  code = code.replace("//", "--");
  code = code.replace("//", "--");
  return code;
}

// function compile(code: string, id: string) {

// }
let previoutResult: TSXResult | undefined;
export interface VirtualUpdate {

  // safeInput: string,
  char?: string,
  start: number

}
export const convertToTSX = (
  input: string,
  options?: ConvertToTSXOptions,
  opts?: ts.TextChangeRange | undefined
): TSXResult => {




  input = preProcess(input);

  // return acomp.convertToTSX(input, options);
  let civetR: ReturnType<typeof civet.compile>
  try {
    civetR = civet.compile(input, {
      "js": false,
      sourceMap: true,
      sync: true,
      // "inlineMap": true,
      "noCache": true,
      "parseOptions": {},
    });
  } catch (e) {


    if (opts && opts.newLength === 1) {
      const start = opts.span.start

      if (start && input[start] === ".") {



        input = input.substring(0, start) + " " + input.substring(start + 1)




        civetR = civet.compile(input, {
          "js": false,
          sourceMap: true,
          sync: true,
          // "inlineMap": true,
          "noCache": true,
          "parseOptions": {},
        });



        //@ts-ignore
        const pos = getLineAndCharacterOfPosition({ text: input }, start)




        const dog = forwardMap(civetR.sourceMap.data.lines, pos)


        //@ts-ignore
        const nice = getPositionOfLineAndCharacter({ text: civetR.code }, dog.line, dog.character)


        // const pos = 

        const final = civetR.code.substring(0, nice) + "." + civetR.code.substring(nice)

        civetR.code = final
        // return previoutResult
        // return {
        //   ...previoutResult,
        //   code: final
        // }
      } else {
        throw e
      }


    } else {
      throw e
    }


  }


  // const out = postProcess(civetR.code);

  //   let rr = acomp.convertToTSX(
  //     `---
  // const bro = 123;
  // ---

  // <script>
  // export function coolDog(asd: string) {
  // }
  // </script>
  //   `,
  //     {},
  //   );
  const code = civetR.code;


  function getMetaRanges(): TSXResult["metaRanges"] {
    // //-
    // foo := 123
    // //-
    const frontStart = code.indexOf("//-");
    const frontEnd = code.indexOf("//-", 2);

    return {
      frontmatter: { start: frontStart, end: frontEnd },
      body: { start: frontEnd + 3, end: code.length },
    };
  }



  //@ts-ignore
  let r: TSXResult = {
    mapRaw: civetR.sourceMap,
    //@ts-ignore
    code,
    //@ts-ignore
    map: civetR.sourceMap.json(
      options?.filename ?? "",
      options?.filename ?? ".tsx",
    ),
    // map: {
    //   file: options?.filename ?? "",
    //   sources: [],
    //   sourcesContent: [],
    //   names: [],
    //   mappings: decode(civetR.map),
    //   version: 0,
    // },
    diagnostics: [],
    // metaRanges: {
    //   frontmatter: { start: 30, end: 49 },
    //   body: { start: 60, end: 158 },
    // },
    metaRanges: getMetaRanges(),
    //   frontmatter: {
    //     start: 0,
    //     end: 0,
    //   },
    //   body: {
    //     start: 0,
    //     end: 0,
    //   },
    // },
  };

  previoutResult = r

  return r;
};

// import {
//   // CompletionItemKind,
//   // DiagnosticSeverity,
//   // DocumentSymbol,
//   type Position,
//   // Range,
//   // SymbolKind,
//   // SymbolTag,
// } from 'vscode-languageserver';
export interface Position {
  /**
   * Line position in a document (zero-based).
   *
   * If a line number is greater than the number of lines in a document, it defaults back to the number of lines in the document.
   * If a line number is negative, it defaults to 0.
   */
  line: number;
  /**
   * Character offset on a line in a document (zero-based).
   *
   * The meaning of this offset is determined by the negotiated
   * `PositionEncodingKind`.
   *
   * If the character value is greater than the line length it defaults back to the
   * line length.
   */
  character: number;
}
export type SourcemapLines = civet.SourceMap['data']['lines'];

/**
 * The normal direction for sourcemapping is reverse, given a position in the generated file it points to a position in the source file.
 *
 * To do the opposite and find the position in the generated file from the source file ("forward map") we want to find the "best" mapping.
 * The best mapping is the closest mapping with line <= original line (ideally it will be equal to the original line), and column <= (original column).
 *
 * To find that mapping we check every reverse mapping holding on to the best one so far.
 * If we're in the middle of an identifier and the best one begins a few characters before the original column that is probably fine since we don't map
 * into the middle of identifiers.
 *
 * We linearly advance the found line and offset by the difference.
 */
export function forwardMap(sourcemapLines: SourcemapLines, position: Position) {
  // assert("line" in position, "position must have line")
  // assert("character" in position, "position must have character")

  const { line: origLine, character: origOffset } = position

  let col = 0
  let bestLine = -1,
    bestOffset = -1,
    foundLine = -1,
    foundOffset = -1

  sourcemapLines.forEach((line, i) => {
    col = 0
    line.forEach((mapping) => {
      col += mapping[0]

      if (mapping.length === 4) {
        // find best line without going beyond
        const [_p, _f, srcLine, srcOffset] = mapping
        if (srcLine <= origLine) {
          if (srcLine > bestLine && (srcOffset <= origOffset) || srcLine === bestLine && (srcOffset <= origOffset) && (srcOffset >= bestOffset)) {
            bestLine = srcLine
            bestOffset = srcOffset
            foundLine = i
            foundOffset = col
          }
        }
      }
    })
  })

  if (foundLine >= 0) {
    const genLine = foundLine + origLine - bestLine
    const genOffset = foundOffset + origOffset - bestOffset


    return {
      line: genLine,
      character: genOffset
    }
  }

  return position
}

export function positionToOffset(mappings: any, line: number, column: number) {
  let offset = 0;
  for (const mapping of mappings) {
    if (!mapping.originalLine || !mapping.originalColumn || !mapping.generatedLine || !mapping.generatedColumn) {
      continue; // Skip unmapped positions
    }
    if (mapping.originalLine > line || (mapping.originalLine === line && mapping.originalColumn > column)) {
      break; // Stop when reaching the target position
    }
    offset += mapping.generatedColumn - mapping.originalColumn;
    if (mapping.originalLine < line) {
      offset += 1; // Add newline character offset if moving to a new line
    }
  }
  return offset;
}

export function offsetToPosition(mappings: any, offset: number) {
  let line = 1;
  let column = 0;
  for (const mapping of mappings) {
    if (!mapping.originalLine || !mapping.originalColumn || !mapping.generatedLine || !mapping.generatedColumn) {
      continue; // Skip unmapped positions
    }
    if (offset <= 0) {
      break; // Stop when reaching the target offset
    }
    const diff = mapping.generatedColumn - mapping.originalColumn;
    if (offset <= diff) {
      // Offset is within this mapping
      line = mapping.originalLine;
      column = mapping.originalColumn + offset;
      break;
    } else {
      // Offset exceeds this mapping
      offset -= diff;
      if (mapping.originalLine < line) {
        offset -= 1; // Subtract newline character offset if moving to a new line
      }
      line = mapping.originalLine;
      column = mapping.originalColumn;
    }
  }
  return { line, column };
}