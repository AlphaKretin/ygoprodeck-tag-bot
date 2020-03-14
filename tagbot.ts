import * as Eris from "eris";
import { token, admins } from "./auth.json";
import { prefix, maxSearch, deckMaxSize } from "./config.json";
import { uploadDeck } from "./modules/ftp";
import { updateTagMap, fullTagNames, tagMap } from "./modules/tags";
import { cleanString, messageCapSlice, errhand } from "./modules/util";
import { searchCard, updateCardNames } from "./modules/cards.js";
import { price } from "./modules/price";

process.on("unhandledRejection", errhand);

const bot = new Eris.Client(token);

async function update(): Promise<void> {
	const proms: Array<Promise<void>> = [];
	proms.push(updateTagMap().then(() => console.log("Tags updated")));
	proms.push(updateCardNames().then(() => console.log("Card names updated")));
	await Promise.all(proms);
}

bot.on("messageCreate", msg => {
	if (msg.author.bot) {
		return;
	}
	if (msg.content.startsWith(prefix)) {
		const command = cleanString(msg.content);
		// Admin-only commands
		if (admins.includes(msg.author.id)) {
		// Update command. Admin-only, updates the list of tags from the source.
			if (command.startsWith("update")) {
				msg.channel.createMessage("Updating!").then(m => {
					update().then(() => {
						m.edit("Update complete!");
					}, err => {
						m.edit("Error!\n```\n" + err + "```");
					});
				});
				return;
			}

			if (command.startsWith("server")) {
				const count = bot.guilds.size;
				const guildList = messageCapSlice(bot.guilds.map(g => g.name + " (Users: " + g.memberCount + ")").join("\n"));
				msg.channel.createMessage("I am in " + count + " servers. Type `.servers list` to see the whole list. This will send you " + guildList.length + " Direct Message(s).").then(async () => {
					if (command.includes("list")) {
						const chan = await msg.author.getDMChannel();
						for (const mes of guildList) {
							await chan.createMessage(mes);
						}
					}
				}).catch(errhand);
			}
		}

		// user commands
		if (command.startsWith("archives")) {
			const out = "This bot can display the following deck tags:\n`" + fullTagNames.join("`, `") + "`";
			const outMessages = messageCapSlice(out);
			if (outMessages.length > 1) {
				msg.channel.createMessage("This list of archives is very long! It takes multiple messages, so I'll send it to you in a DM").then(async () => {
					const chan = await msg.author.getDMChannel();
					for (const mes of outMessages) {
						await chan.createMessage(mes);
					}
				});
			} else {
				msg.channel.createMessage(out).catch(errhand);
			}
			return;
		}

		if (command.startsWith("deck")) {
			if (msg.attachments.length < 1) {
				msg.channel.createMessage("Sorry, you must upload a deck file to use this command.").catch(errhand);
				return;
			}
			const att = msg.attachments[0];
			if (!att.filename.endsWith(".ydk")) {
				msg.channel.createMessage("Sorry, you must upload a `.ydk` file to use this command.").catch(errhand);
				return;
			}
			if (att.size > deckMaxSize) {
				msg.channel.createMessage("Sorry, deck files are usually very small, so for security reasons, large files are not considered valid deck files.").catch(errhand);
				return;
			}
			uploadDeck(att).then(url => {
				msg.channel.createMessage("See your uploaded deck at <" + url + ">!").catch(errhand);
			}).catch(errhand);
		}

		if (command.startsWith("price")) {
			price(msg).catch(errhand);
		}

		for (const tag in tagMap) {
			if (command.startsWith(tag)) {
				msg.channel.createMessage(tagMap[tag]).catch(errhand);
				return;
			}
		}
	}
	const queryReg = /\[([^[]+?)\]/g; // declare anew in-scope to reset index
	let result = queryReg.exec(msg.content);
	const results = [];
	while (result !== null) {
		results.push(result[1]);
		result = queryReg.exec(msg.content);
	}
	if (results.length > 0) {
		const max = Math.min(results.length, maxSearch);
		for (let i = 0; i < max; i++) {
			searchCard(results[i], msg).catch(errhand);
		}
	}
});

bot.on("error", errhand);

bot.on("ready", () => {
	console.log("Logged in as %s - %s", bot.user.username, bot.user.id);
	update().then(() => console.log("Ready to go!"));
});

bot.connect();