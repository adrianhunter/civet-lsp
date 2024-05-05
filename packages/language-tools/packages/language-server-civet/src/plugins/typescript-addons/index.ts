import type {
  CompletionList,
  ServicePlugin,
  ServicePluginInstance,
} from "@volar/language-server";
import { CivetVirtualCode } from "../../core/index.js";
import { isInsideFrontmatter, isJSDocument } from "../utils.js";
import { getSnippetCompletions } from "./snippets.js";

export const create = (): ServicePlugin => {
  return {
    create(context): ServicePluginInstance {
      return {
        isAdditionalCompletion: true,
        // Q: Why the empty transform and resolve functions?
        // A: Volar will skip mapping the completion items if those functions are defined, as such we can return the snippets
        // completions as-is, this is notably useful for snippets that insert to the frontmatter, since we don't need to map anything.
        transformCompletionItem(item) {
          return item;
        },
        provideCompletionItems(document, position, completionContext, token) {
          if (
            !context ||
            !isJSDocument ||
            token.isCancellationRequested ||
            completionContext.triggerKind === 2
          ) {
            return null;
          }

          const [_, source] = context.documents.getVirtualCodeByUri(
            document.uri,
          );
          const code = source?.generated?.code;
          if (!(code instanceof CivetVirtualCode)) return undefined;

          if (
            !isInsideFrontmatter(
              document.offsetAt(position),
              code.civetMeta.frontmatter,
            )
          ) {
            return null;
          }

          const completionList: CompletionList = {
            items: [],
            isIncomplete: false,
          };

          completionList.items.push(
            ...getSnippetCompletions(code.civetMeta.frontmatter),
          );

          return completionList;
        },
        resolveCompletionItem(item) {
          return item;
        },
      };
    },
  };
};
