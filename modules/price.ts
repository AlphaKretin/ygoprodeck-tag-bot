import * as Eris from "eris";
import { dbsource, embed, priceSource } from "../config.json";
import { cardFuzzy } from "./cards";
import fetch from "node-fetch";

interface SetInfo {
	price: number | null;
	set: string;
	url: string;
	rarity?: string;
	rarity_short?: string;
}

interface APIPrice {
	card: string;
	set_info: SetInfo[];
}

function messageCapSlice(outString: string, cap = 1024): string[] {
	const outStrings: string[] = [];
	while (outString.length > cap) {
		let index = outString.slice(0, cap).lastIndexOf("\n");
		if (index === -1 || index >= cap) {
			index = outString.slice(0, cap).lastIndexOf(".");
			if (index === -1 || index >= cap) {
				index = outString.slice(0, cap).lastIndexOf(" ");
				if (index === -1 || index >= cap) {
					index = cap - 1;
				}
			}
		}
		outStrings.push(outString.slice(0, index + 1));
		outString = outString.slice(index + 1);
	}
	outStrings.push(outString);
	return outStrings;
}

interface Vendor {
	name: string;
	api: string;
	aliases: string[];
	format: (price: number) => string;
}

const vendors: Vendor[] = [
	{
		name: "TCGplayer",
		api: "tcgplayer",
		aliases: ["tcg"],
		format: (price: number): string => `$${price}`
	},
	{
		name: "Cardmarket",
		api: "cardmarket",
		aliases: ["market"],
		format: (price: number): string => `€${price}`
	},
	{
		name: "CoolStuffInc",
		api: "coolstuffinc",
		aliases: ["cool", "coolstuff"],
		format: (price: number): string => `$${price}`
	}
];

export async function price(msg: Eris.Message): Promise<void> {
	const terms = msg.content.toLowerCase().trim().split(/\s+/);
	let vendor: Vendor | undefined;
	for (const vend of vendors) {
		if (vend.name.toLowerCase() == terms[1] || vend.aliases.includes(terms[1])) {
			vendor = vend;
		}
	}
	if (vendor === undefined) {
		await msg.channel.createMessage(
			"Please provide the name of a vendor to see their prices! The options are TCGPlayer, Cardmarket, and CoolStuffInc!"
		);
		return;
	}
	const query = terms.splice(2).join(" ");
	if (query.length < 1) {
		await msg.channel.createMessage("Please provide the name of a card to see prices for!");
		return;
	}
	const fuzzyResult = cardFuzzy.en.search(query);
	if (fuzzyResult.length < 1) {
		await msg.channel.createMessage(`Sorry, I couldn't find a card named \`${query}\``);
		return;
	}
	const result = "name" in fuzzyResult[0] ? fuzzyResult[0] : fuzzyResult[0].item;
	const card = result.name;
	const url = `${priceSource}?cardone=${encodeURIComponent(card)}&vendor=${vendor.api}`;
	const response = await fetch(url);
	const prices: APIPrice = await response.json();
	const priceProfiles = messageCapSlice(
		prices.set_info
			.map(s => {
				const rarity = s.rarity ? ` (${s.rarity})` : s.rarity_short ? ` ${s.rarity_short}` : "";
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const price = s.price !== null ? vendor!.format(s.price) : "No market price";
				return `[${s.set}](${s.url})${rarity}: ${price}`;
			})
			.join("\n")
	);
	const output: Eris.EmbedOptions = {
		color: embed,
		fields: [],
		title: prices.card,
		url: dbsource + encodeURIComponent(prices.card)
	};
	const embedFields = [];
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	let length = output.title!.length;
	let fields: {
		name: string;
		value: string;
	}[] = [];
	const EMBED_TOTAL_CAP = 6000;
	for (const profile of priceProfiles) {
		const field = {
			name: `${vendor.name} Prices`,
			value: profile
		};
		const newLength = length + field.name.length + field.value.length;
		if (newLength > EMBED_TOTAL_CAP) {
			embedFields.push(fields);
			fields = [field];
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			length = output.title!.length + field.name.length + field.value.length;
		} else {
			fields.push(field);
			length = newLength;
		}
	}
	embedFields.push(fields);
	for (const field of embedFields) {
		output.fields = field;
		await msg.channel.createMessage({ embed: output });
	}
}
