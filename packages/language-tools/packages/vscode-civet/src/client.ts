import * as path from "node:path";
import { DiagnosticModel, InitializationOptions } from "@volar/language-server";
import * as protocol from "@volar/language-server/protocol";
import {
  activateAutoInsertion,
  activateFindFileReferences,
  activateReloadProjects,
  activateTsConfigStatusItem,
  activateTsVersionStatusItem,
  createLabsInfo,
  getTsdk,
  LabsInfo,
} from "@volar/vscode";
import * as vscode from "vscode";
import * as lsp from "vscode-languageclient/node";

let client: lsp.BaseLanguageClient;

type InitOptions = InitializationOptions & {
  typescript: {
    tsdk: string;
  };
} & Record<string, unknown>;

export async function activate(
  context: vscode.ExtensionContext,
): Promise<LabsInfo> {
  const runtimeConfig = vscode.workspace.getConfiguration(
    "civet.language-server",
  );

  const { workspaceFolders } = vscode.workspace;
  const rootPath = workspaceFolders?.[0].uri.fsPath;

  let lsPath = await getConfiguredServerPath(context.workspaceState);
  if (
    typeof lsPath === "string" && lsPath.trim() !== "" &&
    typeof rootPath === "string"
  ) {
    lsPath = path.isAbsolute(lsPath) ? lsPath : path.join(rootPath, lsPath);
    console.info(`Using language server at ${lsPath}`);
  } else {
    lsPath = undefined;
  }
  const serverModule = lsPath
    ? require.resolve(lsPath)
    : vscode.Uri.joinPath(context.extensionUri, "dist/node/server.js").fsPath;

  const runOptions = { execArgv: [] };
  const debugOptions = { execArgv: ["--nolazy", "--inspect=" + 6009] };

  const serverOptions: lsp.ServerOptions = {
    run: {
      module: serverModule,
      transport: lsp.TransportKind.ipc,
      options: runOptions,
    },

    options: {

    },

    debug: {
      module: serverModule,
      transport: lsp.TransportKind.ipc,
      options: debugOptions,
    },
  };

  const serverRuntime = runtimeConfig.get<string>("runtime");
  if (serverRuntime) {
    //@ts-ignore
    serverOptions.run.runtime = serverRuntime;
    //@ts-ignore
    serverOptions.debug.runtime = serverRuntime;
    console.info(`Using ${serverRuntime} as runtime`);
  }

  const initializationOptions = {
    typescript: {

      tsdk: (await getTsdk(context)).tsdk,
    },

    diagnosticModel: DiagnosticModel.Push,
  } satisfies InitOptions;

  const clientOptions = {
    documentSelector: [{

      language: "civet"
    }],
    initializationOptions,

    "middleware": {
      /**
       * @description 
       * this fixes the issue when pressing "." and getting no autocomplete because 
       * civet produces a compile error
       */
      // async didChange(data, next) {
      //   if (data.contentChanges.length === 1 && data.contentChanges[0].text === '.') {
      //     return;
      //   }
      //   return await next(data)
      // },

      // 'handleRegisterCapability': {}
    }

  } satisfies lsp.LanguageClientOptions;
  client = new lsp.LanguageClient(
    "civet",
    "Civet Language Server",
    serverOptions,
    clientOptions,
  );
  await client.start();

  // support for auto close tag
  activateAutoInsertion("civet", client);
  activateFindFileReferences("civet.findFileReferences", client);
  activateReloadProjects("civet.reloadProjects", client);
  activateTsConfigStatusItem("civet", "civet.openTsConfig", client);
  activateTsVersionStatusItem(
    "civet",
    "civet.selectTypescriptVersion",
    context,
    client,
    (text) => text,
  );

  const volarLabs = createLabsInfo(protocol);
  volarLabs.addLanguageClient(client);

  return volarLabs.extensionExports;
}

export function deactivate(): Thenable<any> | undefined {
  return client?.stop();
}

async function getConfiguredServerPath(workspaceState: vscode.Memento) {
  const scope = "civet.language-server";
  const detailedLSPath = vscode.workspace.getConfiguration(scope).inspect<
    string
  >("ls-path");

  const lsPath = detailedLSPath?.globalLanguageValue ||
    detailedLSPath?.defaultLanguageValue ||
    detailedLSPath?.globalValue ||
    detailedLSPath?.defaultValue;

  const workspaceLSPath = detailedLSPath?.workspaceFolderLanguageValue ||
    detailedLSPath?.workspaceLanguageValue ||
    detailedLSPath?.workspaceFolderValue ||
    detailedLSPath?.workspaceValue;

  const useLocalLanguageServerKey = `${scope}.useLocalLS`;
  let useWorkspaceServer = workspaceState.get<boolean>(
    useLocalLanguageServerKey,
  );

  if (useWorkspaceServer === undefined && workspaceLSPath !== undefined) {
    const msg =
      "This workspace contains an Civet Language Server version. Would you like to use the workplace version?";
    const allowPrompt = "Allow";
    const dismissPrompt = "Dismiss";
    const neverPrompt = "Never in This Workspace";

    const result = await vscode.window.showInformationMessage(
      msg,
      allowPrompt,
      dismissPrompt,
      neverPrompt,
    );

    if (result === allowPrompt) {
      await workspaceState.update(useLocalLanguageServerKey, true);
      useWorkspaceServer = true;
    } else if (result === neverPrompt) {
      await workspaceState.update(useLocalLanguageServerKey, false);
    }
  }

  if (useWorkspaceServer === true) {
    return workspaceLSPath || lsPath;
  } else {
    return lsPath;
  }
}
