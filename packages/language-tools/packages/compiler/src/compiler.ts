import * as acomp from "@astrojs/compiler/sync";
import type { ConvertToTSXOptions, TSXResult } from "@astrojs/compiler/types";
// import * as civet from "@danielx/civet";

function preProcess(code: string) {
  code = code.replaceAll("--", "//");
  return code;
}

function postProcess(code: string) {
  code = code.replaceAll("//", "--");
  return code;
}
export const convertToTSX = (
  input: string,
  options: ConvertToTSXOptions | undefined,
) => {
  // input = preProcess(input);
  // return acomp.convertToTSX(input, options);

  // const civetR = civet.compile(input, {
  //   "js": false,
  //   sourceMap: true,
  //   sync: true,
  // });

  // const out = postProcess(civetR.code);

  let r = acomp.convertToTSX(input, options);

  // let r: TSXResult = {
  //   code: civetR.code,
  //   //@ts-ignore
  //   map: civetR.sourceMap,
  //   // map: {
  //   //   file: options?.filename ?? "",
  //   //   sources: [],
  //   //   sourcesContent: [],
  //   //   names: [],
  //   //   mappings: decode(civetR.map),
  //   //   version: 0,
  //   // },
  //   diagnostics: [],
  //   // metaRanges: {
  //   //   frontmatter: {
  //   //     start: 0,
  //   //     end: 0,
  //   //   },
  //   //   body: {
  //   //     start: 0,
  //   //     end: 0,
  //   //   },
  //   // },
  // };

  return r;
};
