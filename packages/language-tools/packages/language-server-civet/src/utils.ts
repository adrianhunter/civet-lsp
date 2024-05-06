import * as path from "node:path";
import { getPackagePath } from "./importPackage.js";

export interface CivetInstall {
  path: string;
  version: {
    full: string;
    major: number;
    minor: number;
    patch: number;
  };
}

export function getLanguageServerTypesDir(ts: typeof import("typescript")) {
  return ts.sys.resolvePath(path.resolve(__dirname, "../types"));
}

export function getCivetInstall(
  basePaths: string[],
  checkForCivet?: {
    nearestPackageJson: string | undefined;
    readDirectory: typeof import("typescript").sys.readDirectory;
  },
): CivetInstall | "not-an-civet-project" | "not-found" {
  let civetPath;
  let version;

  if (checkForCivet && checkForCivet.nearestPackageJson) {
    basePaths.push(path.dirname(checkForCivet.nearestPackageJson));

    let deps: Set<string> = new Set();
    try {
      const packageJSON = require(checkForCivet.nearestPackageJson);
      [
        ...Object.keys(packageJSON.dependencies ?? {}),
        ...Object.keys(packageJSON.devDependencies ?? {}),
        ...Object.keys(packageJSON.peerDependencies ?? {}),
      ].forEach((dep) => deps.add(dep));
    } catch {}

    if (!deps.has("@danielx/civet")) {
      const directoryContent = checkForCivet.readDirectory(
        path.dirname(checkForCivet.nearestPackageJson),
        [".js", ".mjs", ".cjs", ".ts", ".mts", ".cts"],
        undefined,
        undefined,
        1,
      );

      if (
        !directoryContent.some((file) =>
          path.basename(file).startsWith("civet.config")
        )
      ) {
        return "not-an-civet-project";
      }
    }
  }

  try {
    civetPath = getPackagePath("@danielx/civet", basePaths);

    if (!civetPath) {
      throw Error;
    }

    version = require(path.resolve(civetPath, "package.json")).version;
  } catch {
    // If we couldn't find it inside the workspace's node_modules, it might means we're in the monorepo
    try {
      civetPath = getPackagePath("./packages/civet", basePaths);

      if (!civetPath) {
        throw Error;
      }

      version = require(path.resolve(civetPath, "package.json")).version;
    } catch (e) {
      // If we still couldn't find it, it probably just doesn't exist
      console.error(
        `${
          basePaths[0]
        } seems to be an Civet project, but we couldn't find Civet or Civet is not installed`,
      );

      return "not-found";
    }
  }

  if (!version) {
    return "not-found";
  }

  let [major, minor, patch] = version.split(".");

  if (patch.includes("-")) {
    const patchParts = patch.split("-");
    patch = patchParts[0];
  }

  return {
    path: civetPath,
    version: {
      full: version,
      major: Number(major),
      minor: Number(minor),
      patch: Number(patch),
    },
  };
}
