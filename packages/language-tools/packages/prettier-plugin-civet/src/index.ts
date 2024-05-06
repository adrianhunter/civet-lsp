import { convertToTSX, parse } from "@civetjs/compiler";
// import { parse } from '@civetjs/compiler/sync';

import type { Parser, Printer, SupportLanguage } from "prettier";
import * as prettierPluginBabel from "prettier/plugins/babel";
import { options } from "./options";
// import { print as printAstro } from "./printer";
import { print } from "./printer-civet";

import { embed } from "./printer-civet/embed";

// import { embed as embedAstro } from "./printer/embed";

const babelParser = prettierPluginBabel.parsers["babel-ts"];

// https://prettier.io/docs/en/plugins.html#languages
export const languages: Partial<SupportLanguage>[] = [
  {
    name: "civet",
    parsers: ["civet"],
    extensions: [".civet"],
    vscodeLanguageIds: ["civet"],
  },
  // {
  //   name: "astro",
  //   parsers: ["astro"],
  //   extensions: [".astro"],
  //   vscodeLanguageIds: ["astro"],
  // },
];

// https://prettier.io/docs/en/plugins.html#parsers
export const parsers: Record<string, Parser> = {
  //@ts-ignore
  _result: {},
  civet: {
    parse(source) {
      let r = parse(source, { position: true });
      //@ts-ignore
      this._result = r;

      return r.ast;
    },
    astFormat: "civet",
    locStart: (node) => node.position.start.offset,
    locEnd: (node) => node.position.end.offset,
  },
  civetExpressionParser: {
    ...babelParser,
    preprocess(text) {
      // const r = convertToTSX(text, {});
      // note the trailing newline: if the statement ends in a // comment,
      // we can't add the closing bracket right afterwards
      return `<>{${text}\n}</>`;
    },
    parse(text, opts) {
      const ast = babelParser.parse(text, opts);

      return {
        ...ast,
        program: ast.program.body[0].expression.children[0].expression,
      };
    },
  },
  // astroExpressionParser: {
  //   ...babelParser,
  //   preprocess(text) {
  //     // note the trailing newline: if the statement ends in a // comment,
  //     // we can't add the closing bracket right afterwards
  //     return `<>{${text}\n}</>`;
  //   },
  //   parse(text, opts) {
  //     const ast = babelParser.parse(text, opts);

  //     return {
  //       ...ast,
  //       program: ast.program.body[0].expression.children[0].expression,
  //     };
  //   },
  // },
  // astro: {
  //   parse: (source) => parse(source, { position: true }).ast,
  //   astFormat: "astro",
  //   locStart: (node) => node.position.start.offset,
  //   locEnd: (node) => node.position.end.offset,
  // },
  // astroExpressionParser: {
  //   ...babelParser,
  //   preprocess(text) {
  //     // note the trailing newline: if the statement ends in a // comment,
  //     // we can't add the closing bracket right afterwards
  //     return `<>{${text}\n}</>`;
  //   },
  //   parse(text, opts) {
  //     const ast = babelParser.parse(text, opts);

  //     return {
  //       ...ast,
  //       program: ast.program.body[0].expression.children[0].expression,
  //     };
  //   },
  // },
};

// https://prettier.io/docs/en/plugins.html#printers
export const printers: Record<string, Printer> = {
  civet: {
    print,
    embed,
  },
  // astro: {
  //   print: printAstro,
  //   embed: embedAstro,
  // },
};

const defaultOptions = {
  tabWidth: 2,
};

export { defaultOptions, options };
