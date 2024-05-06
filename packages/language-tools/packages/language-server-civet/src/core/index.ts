import * as path from "node:path";
import type { DiagnosticMessage } from "@civetjs/compiler/types";
import {
  type CodeMapping,
  type ExtraServiceScript,
  forEachEmbeddedCode,
  type LanguagePlugin,
  type VirtualCode,
} from "@volar/language-core";
import type ts from "typescript";
import type { HTMLDocument } from "vscode-html-languageservice";
import { URI } from "vscode-uri";
import { type CivetInstall, getLanguageServerTypesDir } from "../utils.js";
import { civet2tsx } from "./civet2tsx";
import { CivetMetadata, getCivetMetadata } from "./parseCivet";
import { extractStylesheets } from "./parseCSS";
import { parseHTML } from "./parseHTML";
import { extractScriptTags } from "./parseJS.js";
import { getLineAndCharacterOfPosition } from "typescript";
import type { VirtualUpdate } from "@civetjs/compiler";

export function getLanguageModule(
  civetInstall: CivetInstall | undefined,
  ts: typeof import("typescript"),
): LanguagePlugin<CivetVirtualCode> {
  return {
    createVirtualCode(fileId, languageId, snapshot) {
      if (languageId === "civet") {
        const fileName = fileId.includes("://")
          ? URI.parse(fileId).fsPath.replace(/\\/g, "/")
          : fileId;
        return new CivetVirtualCode(fileName, snapshot);
      }
    },
    updateVirtualCode(_fileId, civetCode, snapshot) {
      civetCode.update(snapshot);
      return civetCode;
    },
    typescript: {
      extraFileExtensions: [{
        extension: "civet",
        isMixedContent: true,
        scriptKind: 7,
      }],
      getScript(civetCode) {
        for (const code of forEachEmbeddedCode(civetCode)) {
          if (code.id === "tsx") {
            return {
              code,
              extension: ".tsx",
              scriptKind: 4 satisfies ts.ScriptKind.TSX,
            };
          }
        }
        return undefined;
      },
      getExtraScripts(fileName, civetCode) {
        const result: ExtraServiceScript[] = [];
        for (const code of forEachEmbeddedCode(civetCode)) {
          if (code.id.endsWith(".mjs") || code.id.endsWith(".mts")) {
            const fileExtension = code.id.endsWith(".mjs") ? ".mjs" : ".mts";
            result.push({
              fileName: fileName + "." + code.id,
              code,
              extension: fileExtension,
              scriptKind: fileExtension === ".mjs"
                ? (1 satisfies ts.ScriptKind.JS)
                : (3 satisfies ts.ScriptKind.TS),
            });
          }
        }
        return result;
      },
      resolveLanguageServiceHost(host) {
        return {
          ...host,
          getScriptFileNames() {
            const languageServerTypesDirectory = getLanguageServerTypesDir(ts);
            const fileNames = host.getScriptFileNames();
            const addedFileNames = [];

            if (civetInstall) {
              addedFileNames.push(
                ...["./env.d.ts", "./civet-jsx.d.ts"].map((filePath) =>
                  ts.sys.resolvePath(path.resolve(civetInstall.path, filePath))
                ),
              );

              // If Civet version is < 4.0.8, add jsx-runtime-augment.d.ts to the files to fake `JSX` being available from "civet/jsx-runtime".
              // TODO: Remove this once a majority of users are on Civet 4.0.8+, erika - 2023-12-28
              if (
                civetInstall.version.major < 4 ||
                (civetInstall.version.major === 4 &&
                  civetInstall.version.minor === 0 &&
                  civetInstall.version.patch < 8)
              ) {
                addedFileNames.push(
                  ...["./jsx-runtime-augment.d.ts"].map((filePath) =>
                    ts.sys.resolvePath(
                      path.resolve(languageServerTypesDirectory, filePath),
                    )
                  ),
                );
              }
            } else {
              // If we don't have an Civet installation, add the fallback types from the language server.
              // See the README in packages/language-server/types for more information.
              addedFileNames.push(
                ...[
                  "./env.d.ts",
                  "./civet-jsx.d.ts",
                  "./jsx-runtime-fallback.d.ts",
                ].map((f) =>
                  ts.sys.resolvePath(
                    path.resolve(languageServerTypesDirectory, f),
                  )
                ),
              );
            }

            return [...fileNames, ...addedFileNames];
          },
          getCompilationSettings() {
            const baseCompilationSettings = host.getCompilationSettings();
            return {
              ...baseCompilationSettings,
              module: ts.ModuleKind.ESNext ?? 99,
              target: ts.ScriptTarget.ESNext ?? 99,
              jsx: ts.JsxEmit.Preserve ?? 1,
              resolveJsonModule: true,
              allowJs: true, // Needed for inline scripts, which are virtual .js files
              isolatedModules: true,
              moduleResolution: baseCompilationSettings.moduleResolution ===
                ts.ModuleResolutionKind.Classic ||
                !baseCompilationSettings.moduleResolution
                ? ts.ModuleResolutionKind.Node10
                : baseCompilationSettings.moduleResolution,
            };
          },
        };
      },
    },
  };
}


export class CivetVirtualCode implements VirtualCode {
  id = "root";
  languageId = "civet";
  mappings!: CodeMapping[];
  embeddedCodes!: VirtualCode[];
  civetMeta!: CivetMetadata;
  compilerDiagnostics!: DiagnosticMessage[];
  htmlDocument!: HTMLDocument;
  scriptCodeIds!: string[];
  codegenStacks = [];
  inited = false

  constructor(
    public fileName: string,
    public snapshot: ts.IScriptSnapshot,
  ) {
    this.onSnapshotUpdated();
  }

  get hasCompilationErrors(): boolean {
    return this.compilerDiagnostics.filter((diag) => diag.severity === 1)
      .length > 0;
  }

  public update(newSnapshot: ts.IScriptSnapshot) {



    console.log("🚗 -----------------------------------------------------------------------------------------🚗")
    console.log("🚗 -----------------------------------------------------------------------------------------🚗")

    const change = newSnapshot.getChangeRange(this.snapshot)

    this.snapshot = newSnapshot;

    // this.onVirtualUpdate(newSnapshot)
    // let newInput = ''

    // console.log("++++++++++++++++++++++")
    // if (changeRange?.newLength === 1) {
    //   const char = newSnapshot.getText(changeRange.span.start, changeRange.span.start + 1)

    //   console.log("🚗 ----------------------------------------------------------------🚗")
    //   console.log("🚗 ~ file: index.ts:174 ~ CivetVirtualCode ~ update ~ char:", char)
    //   console.log("🚗 ----------------------------------------------------------------🚗")

    //   if (char === ".") {
    //     const safeInput = newSnapshot.getText(0, changeRange.span.start) + newSnapshot.getText(changeRange.span.start + 1, newSnapshot.getLength())

    //     this.snapshot = newSnapshot;

    //     this.onVirtualUpdate({

    //       safeInput,
    //       char, start: changeRange.span.start
    //     })

    //     return

    //     // input = changeCharAtIndex(input, change.span.start, " ")
    //   } else {
    //     // newInput = newSnapshot.getText(0, newSnapshot.getLength())

    //   }
    // } else {
    //   // newInput = newSnapshot.getText(0, newSnapshot.getLength())


    // }

    // this.snapshot = newSnapshot;


    this.onSnapshotUpdated(change);
  }

  onSnapshotUpdated(change?: ts.TextChangeRange) {
    this.mappings = [
      {
        sourceOffsets: [0],
        generatedOffsets: [0],
        lengths: [this.snapshot.getLength()],
        data: {
          verification: true,
          completion: true,
          semantic: true,
          navigation: true,
          structure: true,
          format: true,
        },
      },
    ];
    this.compilerDiagnostics = [];



    const civetMetadata = getCivetMetadata(

      this.fileName,
      this.snapshot.getText(0, this.snapshot.getLength()),
    );

    if (civetMetadata.diagnostics.length > 0) {
      this.compilerDiagnostics.push(...civetMetadata.diagnostics);
    }

    const { htmlDocument, virtualCode: htmlVirtualCode } = parseHTML(
      this.snapshot,
      civetMetadata.frontmatter.status === "closed"
        ? civetMetadata.frontmatter.position.end.offset
        : 0,
    );
    this.htmlDocument = htmlDocument;

    const scriptTags = extractScriptTags(
      this.snapshot,
      htmlDocument,
      civetMetadata.ast,
    );

    this.scriptCodeIds = scriptTags.map((scriptTag) => scriptTag.id);

    htmlVirtualCode.embeddedCodes = [];
    htmlVirtualCode.embeddedCodes.push(
      ...extractStylesheets(this.snapshot, htmlDocument, civetMetadata.ast),
      ...scriptTags,
    );

    this.embeddedCodes = [];
    this.embeddedCodes.push(htmlVirtualCode);

    const tsx = civet2tsx(
      this.snapshot.getText(0, this.snapshot.getLength()),
      // this.snapshot.getText(0, this.snapshot.getLength()),
      this.fileName,
      htmlDocument,
      change
    );

    this.civetMeta = { ...civetMetadata, tsxRanges: tsx.ranges };
    //@ts-ignore
    this.compilerDiagnostics.push(...tsx.diagnostics);
    this.embeddedCodes.push(tsx.virtualCode);
  }
}



// onVirtualUpdate(newSnapshot: ts.IScriptSnapshot) {

//   console.log("🚗 ---------------------------------------------------------------------------------🚗")
//   console.log("🚗 ---------------------------------------------------------------------------------🚗")

//   // this.compilerDiagnostics = [];
//   const changeRange = newSnapshot.getChangeRange(this.snapshot)

//   let virtualUpdate: VirtualUpdate | undefined
//   if (!changeRange) {
//     return
//   }
//   // changeRange.span.start


//   let safeInput = ''

//   if (changeRange?.newLength === 1 && (newSnapshot.getText(changeRange.span.start, changeRange.span.start + 1) === ".")) {
//     // const char = newSnapshot.getText(changeRange.span.start, changeRange.span.start + 1)
//     // if (char === ".") {

//     // }
//     // safeInput = this.snapshot.getText(0, this.snapshot.getLength())
//     safeInput = newSnapshot.getText(0, changeRange.span.start) + " " + newSnapshot.getText(changeRange.span.start + 1, newSnapshot.getLength())
//     virtualUpdate = {
//       "char": ".",
//       "start": changeRange.span.start,
//       // safeInput
//     }



//   } else {
//     // const node = this.htmlDocument.findNodeAt(changeRange.span.start)

//     safeInput = newSnapshot.getText(0, newSnapshot.getLength())



//   }
//   this.snapshot = newSnapshot;

//   console.log("🚗 -----------------------------------------------------------------------------------🚗")
//   console.log("🚗 ~ file: index.ts:252 ~ CivetVirtualCode ~ onVirtualUpdate ~ safeInput:", safeInput)
//   console.log("🚗 -----------------------------------------------------------------------------------🚗")


//   this.mappings = [
//     {
//       sourceOffsets: [0],
//       generatedOffsets: [0],
//       lengths: [this.snapshot.getLength()],
//       data: {
//         verification: true,
//         completion: true,
//         semantic: true,
//         navigation: true,
//         structure: true,
//         format: true,
//       },
//     },
//   ];
//   this.compilerDiagnostics = [];



//   const civetMetadata = getCivetMetadata(

//     this.fileName,
//     safeInput
//   );

//   if (civetMetadata.diagnostics.length > 0) {
//     this.compilerDiagnostics.push(...civetMetadata.diagnostics);
//   }

//   const { htmlDocument, virtualCode: htmlVirtualCode } = parseHTML(
//     this.snapshot,
//     civetMetadata.frontmatter.status === "closed"
//       ? civetMetadata.frontmatter.position.end.offset
//       : 0,
//   );
//   this.htmlDocument = htmlDocument;

//   const scriptTags = extractScriptTags(
//     this.snapshot,
//     htmlDocument,
//     civetMetadata.ast,
//   );

//   this.scriptCodeIds = scriptTags.map((scriptTag) => scriptTag.id);

//   htmlVirtualCode.embeddedCodes = [];
//   htmlVirtualCode.embeddedCodes.push(
//     ...extractStylesheets(this.snapshot, htmlDocument, civetMetadata.ast),
//     ...scriptTags,
//   );

//   this.embeddedCodes = [];
//   this.embeddedCodes.push(htmlVirtualCode);

//   const tsx = civet2tsx(
//     safeInput,
//     // this.snapshot.getText(0, this.snapshot.getLength()),
//     this.fileName,
//     htmlDocument,
//     virtualUpdate
//   );

//   this.civetMeta = { ...civetMetadata, tsxRanges: tsx.ranges };
//   //@ts-ignore
//   this.compilerDiagnostics.push(...tsx.diagnostics);
//   this.embeddedCodes.push(tsx.virtualCode);
//   // const civetMetadata = getCivetMetadata(
//   //   this.fileName,
//   //   this.snapshot.getText(0, this.snapshot.getLength()),
//   //   // opts.safeInput
//   // );

//   // if (civetMetadata.diagnostics.length > 0) {
//   //   this.compilerDiagnostics.push(...civetMetadata.diagnostics);
//   // }

//   // const { htmlDocument, virtualCode: htmlVirtualCode } = parseHTML(
//   //   this.snapshot,
//   //   0
//   // );
//   // this.htmlDocument = htmlDocument;

//   // // const scriptTags = extractScriptTags(
//   // //   this.snapshot,
//   // //   htmlDocument,
//   // //   civetMetadata.ast,
//   // // );

//   // // this.scriptCodeIds = scriptTags.map((scriptTag) => scriptTag.id);

//   // htmlVirtualCode.embeddedCodes = [];
//   // htmlVirtualCode.embeddedCodes.push(
//   //   ...extractStylesheets(this.snapshot, htmlDocument, civetMetadata.ast),
//   //   ...scriptTags,
//   // );

//   // this.embeddedCodes = [];
//   // this.embeddedCodes.push(htmlVirtualCode);

//   // const tsx = civet2tsx(
//   //   opts.safeInput,
//   //   // this.snapshot.getText(0, this.snapshot.getLength()),
//   //   // this.snapshot.getText(0, this.snapshot.getLength()),
//   //   this.fileName,
//   //   htmlDocument,
//   //   opts
//   //   // this.snapshot.getText(0, this.snapshot.getLength()),
//   //   // change
//   // );


//   // console.log("🚗 -----------------------------------------------------🚗")
//   // console.log("🚗 ~ file: index.ts:324 ~ CivetVirtualCode ~ tsx:", tsx)
//   // console.log("🚗 -----------------------------------------------------🚗")


//   // this.civetMeta = { ...civetMetadata, tsxRanges: tsx.ranges };
//   // //@ts-ignore
//   // this.compilerDiagnostics.push(...tsx.diagnostics);
//   // this.embeddedCodes.push(tsx.virtualCode);


// }