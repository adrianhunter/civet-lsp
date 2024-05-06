import {
  type CodeMapping,
  forEachEmbeddedCode,
  type LanguagePlugin,
  type VirtualCode,
} from "@volar/language-core";
import type ts from "typescript";
import { civet2tsx } from "./civet2tsx.js";

export function getLanguageModule(): LanguagePlugin<CivetVirtualCode> {
  return {
    createVirtualCode(fileId, languageId, snapshot) {
      console.log(
        "🚗 ----------------------------------------------------------------------🚗",
      );
      console.log(
        "🚗 ~ file: language.ts:14 ~ createVirtualCode ~ languageId:",
        languageId,
      );
      console.log(
        "🚗 ----------------------------------------------------------------------🚗",
      );

      console.log(
        "🚗 --------------------------------------------------------------🚗",
      );
      console.log(
        "🚗 ~ file: language.ts:14 ~ createVirtualCode ~ fileId:",
        fileId,
      );
      console.log(
        "🚗 --------------------------------------------------------------🚗",
      );

      if (languageId === "civet") {
        // fileId will never be a uri in ts plugin
        const fileName = fileId;
        return new CivetVirtualCode(fileName, snapshot);
      }
    },
    updateVirtualCode(_fileId, civetFile, snapshot) {
      civetFile.update(snapshot);
      return civetFile;
    },
    typescript: {
      extraFileExtensions: [{
        extension: "civet",
        isMixedContent: true,
        scriptKind: 7,
      }],
      getScript(civetCode) {
        console.log(
          "🚗 ------------------------------------------------------------🚗",
        );
        console.log(
          "🚗 ~ file: language.ts:41 ~ getScript ~ civetCode:",
          civetCode,
        );
        console.log(
          "🚗 ------------------------------------------------------------🚗",
        );

        for (const code of forEachEmbeddedCode(civetCode)) {
          if (code.id === "tsx") {
            return {
              code,
              extension: ".tsx",
              scriptKind: 4 satisfies ts.ScriptKind.TSX,
            };
          }
        }

        throw new Error("could not get script..");
      },
    },
  };
}

export class CivetVirtualCode implements VirtualCode {
  id = "root";
  languageId = "civet";
  mappings!: CodeMapping[];
  embeddedCodes!: VirtualCode[];
  codegenStacks = [];

  constructor(
    public fileName: string,
    public snapshot: ts.IScriptSnapshot,
  ) {
    this.onSnapshotUpdated();
  }

  public update(newSnapshot: ts.IScriptSnapshot) {
    this.snapshot = newSnapshot;
    this.onSnapshotUpdated();
  }

  onSnapshotUpdated() {
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
          format: false,
        },
      },
    ];

    this.embeddedCodes = [];

    const tsx = civet2tsx(
      this.snapshot.getText(0, this.snapshot.getLength()),
      this.fileName,
    );

    this.embeddedCodes.push(tsx.virtualFile);
  }
}
