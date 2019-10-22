import * as Eris from "eris";
import fetch from "node-fetch";
import {token, admins} from "./auth.json";
import {prefix, source} from "./config.json";

const bot = new Eris.Client(token);
let tagMap: {[tag: string]: string} = {};
let fullTagNames: string[] = [];

// strip non alpha-numeric characters so that someone searching for "Battlin' Boxer" and "battlingboxer" gets the same result
function cleanString(s: string): string {
	return s.toLowerCase().replace(/[\W_]+/g, "");
}

async function updateTagMap(): Promise<void> {
	const rawResponse = await fetch(source);
	const rawContent = await rawResponse.text();
	const halves = rawContent.split("Links:");
	fullTagNames = halves[0].split(/\r\n|\r|\n/);
	const tags = fullTagNames.map(cleanString);
	const links = halves[1].split(/\r\n|\r|\n/);
	tagMap = {};
	for (let i = 0; i < Math.min(tags.length, links.length); i++) {
		tagMap[tags[i]] = links[i];
	}
}

bot.on("messageCreate", msg => {
	if (msg.author.bot || !msg.content.startsWith(prefix)) {
		return;
	}
	const command = cleanString(msg.content);
	// Update command. Admin-only, updates the list of tags from the source.
	if (command.startsWith("update") && admins.includes(msg.author.id)) {
		msg.channel.createMessage("Updating tag list!").then(m => {
			updateTagMap().then(() => {
				m.edit("Update complete!");
			}, err => {
				m.edit("Error!\n```\n" + err + "```");
			});
		});
		return;
	}

	if (command.startsWith("archives")) {
		msg.channel.createMessage("This bot can display the following deck tags:\n`" + fullTagNames.join("`, `") + "`");
		return;
	}

	for (const tag in tagMap) {
		if (command.startsWith(tag)) {
			msg.channel.createMessage(tagMap[tag]);
		}
	}
});

bot.on("error", err => console.error(err));

bot.on("ready", () => {
	console.log("Logged in as %s - %s", bot.user.username, bot.user.id);
	updateTagMap().then(() => console.log("Tags updated, ready to go!"));
});

bot.connect();