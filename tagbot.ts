import * as Eris from "eris";
import {token, admins} from "./auth.json";
import {prefix} from "./config.json";
import {updateTagMap, fullTagNames, tagMap} from "./modules/tags";
import {cleanString, messageCapSlice} from "./modules/util";
import { searchCard } from "./modules/cards.js";

process.on("unhandledRejection", error => console.error(error));

const bot = new Eris.Client(token);

const queryReg = /<([^<]+?)>/g;

bot.on("messageCreate", msg => {
	if (msg.author.bot) {
		return;
	}
	if (msg.content.startsWith(prefix)) {
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
				msg.channel.createMessage(out).catch(e => console.error(e));
			}
			return;
		}

		for (const tag in tagMap) {
			if (command.startsWith(tag)) {
				msg.channel.createMessage(tagMap[tag]).catch(e => console.error(e));
				return;
			}
		}
	}

	const result = queryReg.exec(msg.content);
	if (result !== null) {
		searchCard(result[1], msg).catch(e => console.error(e));
	}
});

bot.on("error", err => console.error(err));

bot.on("ready", () => {
	console.log("Logged in as %s - %s", bot.user.username, bot.user.id);
	updateTagMap().then(() => console.log("Tags updated, ready to go!"));
});

bot.connect();