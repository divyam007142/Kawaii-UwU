import { Client } from "discord.js";
import { readdirSync } from "fs";
import { pathToFileURL, fileURLToPath } from "url";
import path from "path";

export async function loadEvents(client: Client) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const eventsPath = path.join(__dirname, "..", "events");

  const eventFiles = readdirSync(eventsPath).filter(
    (f) => f.endsWith(".ts") || f.endsWith(".js")
  );

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event    = await import(pathToFileURL(filePath).href);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}
