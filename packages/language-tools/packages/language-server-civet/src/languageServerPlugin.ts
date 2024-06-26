import {
  Connection,
  LanguagePlugin,
  MessageType,
  ShowMessageNotification,
  VirtualCode,
} from "@volar/language-server/node";
import { URI } from "vscode-uri";
import { getLanguageModule } from "./core";
import { getSvelteLanguageModule } from "./core/svelte.js";
import { getVueLanguageModule } from "./core/vue.js";
import { getPrettierPluginPath, importPrettier } from "./importPackage.js";
import { getCivetInstall } from "./utils.js";

// Services
import { create as createCssService } from "volar-service-css";
import { create as createEmmetService } from "volar-service-emmet";
import { create as createPrettierService } from "volar-service-prettier";
import { create as createTypeScriptTwoSlashService } from "volar-service-typescript-twoslash-queries";

import type { ServerOptions } from "@volar/language-server/lib/server.js";
import { create as createCivetService } from "./plugins/civet.js";
import { create as createHtmlService } from "./plugins/html.js";
import { create as createTypescriptAddonsService } from "./plugins/typescript-addons/index.js";
import { create as createTypeScriptServices } from "./plugins/typescript/index.js";

export function createServerOptions(
  connection: Connection,
  ts: typeof import("typescript"),
): ServerOptions {
  return {
    watchFileExtensions: [
      "js",
      "cjs",
      "mjs",
      "ts",
      "cts",
      "mts",
      "jsx",
      "tsx",
      "json",
      "civet",
      "vue",
      "svelte",
    ],
    getServicePlugins() {
      return [
        createHtmlService(),
        createCssService(),
        createEmmetService(),
        ...createTypeScriptServices(ts),
        createTypeScriptTwoSlashService(ts),
        createTypescriptAddonsService(),
        createCivetService(ts),
        getPrettierService(),
      ];
    },
    getLanguagePlugins(serviceEnv, projectContext) {
      const languagePlugins: LanguagePlugin<VirtualCode>[] = [
        getVueLanguageModule(),
        getSvelteLanguageModule(),
      ];

      if (projectContext.typescript) {
        const rootPath = projectContext.typescript.configFileName
          ? projectContext.typescript.configFileName.split("/").slice(0, -1)
            .join("/")
          : serviceEnv.typescript!.uriToFileName(serviceEnv.workspaceFolder);
        const nearestPackageJson = ts.findConfigFile(
          rootPath,
          ts.sys.fileExists,
          "package.json",
        );

        const civetInstall = getCivetInstall([rootPath], {
          nearestPackageJson: nearestPackageJson,
          readDirectory: ts.sys.readDirectory,
        });

        if (civetInstall === "not-found") {
          connection.sendNotification(ShowMessageNotification.type, {
            message:
              `Couldn't find Civet in workspace "${rootPath}". Experience might be degraded. For the best experience, please make sure Civet is installed into your project and restart the language server.`,
            type: MessageType.Warning,
          });
        }

        languagePlugins.unshift(
          getLanguageModule(
            typeof civetInstall === "string" ? undefined : civetInstall,
            ts,
          ),
        );
      } else {
        console.warn("not ts context...");
      }

      // if (projectContext.typescript) {
      console.log(
        "🚗 ----------------------------------------------------------------------------------------------🚗",
      );
      console.log(
        "🚗 ~ file: languageServerPlugin.ts:111 ~ getLanguagePlugins ~ languagePlugins:",
        languagePlugins,
      );
      console.log(
        "🚗 ----------------------------------------------------------------------------------------------🚗",
      );

      return languagePlugins;
    },
  };

  function getPrettierService() {
    let prettier: ReturnType<typeof importPrettier>;
    let prettierPluginPath: ReturnType<typeof getPrettierPluginPath>;
    let hasShownNotification = false;

    return createPrettierService(
      (context) => {
        const workspaceUri = URI.parse(context.env.workspaceFolder);
        if (workspaceUri.scheme === "file") {
          prettier = importPrettier(workspaceUri.fsPath);
          prettierPluginPath = getPrettierPluginPath(workspaceUri.fsPath);
          if ((!prettier || !prettierPluginPath) && !hasShownNotification) {
            connection.sendNotification(ShowMessageNotification.type, {
              message:
                "Couldn't load `prettier` or `prettier-plugin-civet`. Formatting will not work. Please make sure those two packages are installed into your project and restart the language server.",
              type: MessageType.Warning,
            });
            hasShownNotification = true;
          }
          return prettier;
        }
      },
      {
        documentSelector: ["civet"],
        getFormattingOptions: async (
          prettierInstance,
          document,
          formatOptions,
          context,
        ) => {
          const filePath = URI.parse(document.uri).fsPath;

          let configOptions = null;
          try {
            configOptions = await prettierInstance.resolveConfig(filePath, {
              // This seems to be broken since Prettier 3, and it'll always use its cumbersome cache. Hopefully it works one day.
              useCache: false,
              editorconfig: true,
            });
          } catch (e) {
            connection.sendNotification(ShowMessageNotification.type, {
              message: `Failed to load Prettier config.\n\nError:\n${e}`,
              type: MessageType.Warning,
            });
            console.error("Failed to load Prettier config.", e);
          }

          const editorOptions = await context.env.getConfiguration<object>?.(
            "prettier",
            document.uri,
          );

          // Return a config with the following cascade:
          // - Prettier config file should always win if it exists, if it doesn't:
          // - Prettier config from the VS Code extension is used, if it doesn't exist:
          // - Use the editor's basic configuration settings
          const resolvedConfig = {
            filepath: filePath,
            tabWidth: formatOptions.tabSize,
            useTabs: !formatOptions.insertSpaces,
            ...editorOptions,
            ...configOptions,
          };

          return {
            ...resolvedConfig,
            plugins: [
              ...(await getCivetPrettierPlugin()),
              ...(resolvedConfig.plugins ?? []),
            ],
            parser: "civet",
          };

          async function getCivetPrettierPlugin() {
            if (!prettier || !prettierPluginPath) {
              return [];
            }

            const hasPluginLoadedAlready =
              (await prettier.getSupportInfo()).languages.some((l: any) =>
                l.name === "civet"
              ) ||
              resolvedConfig.plugins?.includes("prettier-plugin-civet"); // getSupportInfo doesn't seems to work very well in Prettier 3 for plugins

            return hasPluginLoadedAlready ? [] : [prettierPluginPath];
          }
        },
      },
    );
  }
}
