import dotenv from "dotenv";
dotenv.config();

import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { pathToFileURL, fileURLToPath } from "url";
import path from "path";

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  throw new Error("DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID must be set");
}

const commands: object[] = [];
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foldersPath = path.join(__dirname, "commands");

const commandFolders = readdirSync(foldersPath);
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(pathToFileURL(filePath).href);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST().setToken(token);

console.log(`Deploying ${commands.length} commands...`);
const data = await rest.put(Routes.applicationCommands(clientId), { body: commands }) as object[];
console.log(`Successfully deployed ${(data as any[]).length} commands.`);
