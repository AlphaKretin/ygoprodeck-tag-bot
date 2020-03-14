import * as Eris from "eris";
import { dbsource, embed, priceSource } from "../config.json";
import fetch from "node-fetch";

interface SetInfo {
    price: number;
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

export async function price(msg: Eris.Message): Promise<void> {
	const card = "Odd-Eyes Pendulum Dragon";
	const vendor = "coolstuffinc";
	const url = priceSource + "?cardone=" + encodeURIComponent(card) + "&vendor=" + vendor;
	const response = await fetch(url);
	const prices: APIPrice = await response.json();
	const priceProfiles = messageCapSlice(prices.set_info.map(s => {
		const rarity = s.rarity ? ` (${s.rarity})` : (s.rarity_short ? " " + s.rarity_short : "");
		return `[${s.set}](${s.url})${rarity}: $${s.price.toFixed(2)}`;
	}).join("\n"));
	const output: Eris.EmbedOptions = {
		color: embed,
		fields: [],
		title: prices.card,
		url: dbsource + encodeURIComponent(prices.card)	
	};
	for (const profile of priceProfiles) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		output.fields!.push({
			name: vendor + " Prices",
			value: profile
		});
	}
	await msg.channel.createMessage({ embed: output });
}