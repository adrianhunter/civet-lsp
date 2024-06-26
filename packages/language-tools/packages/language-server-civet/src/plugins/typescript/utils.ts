import type { TextEdit } from "vscode-html-languageservice";
import type { CivetVirtualCode } from "../../core/index.js";
import {
  editShouldBeInFrontmatter,
  ensureProperEditForFrontmatter,
} from "../utils.js";

export function mapEdit(
  edit: TextEdit,
  code: CivetVirtualCode,
  languageId: string,
) {
  // Don't attempt to move the edit to the frontmatter if the file isn't the root TSX file, it means it's a script tag
  if (languageId === "typescriptreact") {
    if (editShouldBeInFrontmatter(edit.range, code.civetMeta).itShould) {
      edit = ensureProperEditForFrontmatter(edit, code.civetMeta, "\n");
    }
  } else {
    // If the edit is at the start of the file, add a newline before it, otherwise we'll get `<script>text`
    if (edit.range.start.line === 0 && edit.range.start.character === 0) {
      edit.newText = "\n" + edit.newText;
    }
  }

  return edit;
}
