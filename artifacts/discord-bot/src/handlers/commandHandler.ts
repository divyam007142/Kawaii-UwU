import { Client, Collection } from "discord.js";
import { readdirSync } from "fs";
import { pathToFileURL, fileURLToPath } from "url";
import path from "path";

export async function loadCommands(client: Client) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const foldersPath = path.join(__dirname, "..", "commands");

  const commandFolders = readdirSync(foldersPath);
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter(
      (f) => f.endsWith(".ts") || f.endsWith(".js")
    );
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command  = await import(pathToFileURL(filePath).href);
      if ("data" in command && "execute" in command) {
        ((client as any).commands as Collection<string, any>).set(
          command.data.name,
          command
        );
      }
    }
  }
}
