import fetch from "node-fetch";
import fuse from "fuse.js";
import { Message, MessageContent } from "eris";
import { messageCapSlice } from "./util";
import { apisource, embed, picsource, picext, dbsource, langs } from "../config.json";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const emotes: { [key: string]: string } = require("../emotes.json"); // required so as to not infer type

const fuseOptions: fuse.FuseOptions<APICard> = {
	shouldSort: true,
	threshold: 0.6,
	location: 0,
	distance: 100,
	maxPatternLength: 32,
	minMatchCharLength: 1,
	keys: ["name"]
};

let allCards: { [lang: string]: APICard[] } = {};
export let cardFuzzy: { [lang: string]: fuse<APICard, typeof fuseOptions> } = {};

export async function updateCardNames(): Promise<void> {
	const rawResponse = await fetch(apisource);
	allCards.en = (await rawResponse.json()).data;
	cardFuzzy.en = new fuse<APICard, typeof fuseOptions>(allCards.en, fuseOptions);
	for (const lang of langs) {
		const langResponse = await fetch(apisource + "&language=" + lang);
		allCards[lang] = (await langResponse.json()).data;
		cardFuzzy[lang] = new fuse<APICard, typeof fuseOptions>(allCards[lang], fuseOptions);
	}
}

interface APICardSet {
	set_name: string;
	set_code: string;
	set_rarity: string;
	set_price: string;
}

interface APICardBanlist {
	ban_tcg?: string;
	ban_ocg?: string;
	ban_goat?: string;
}

interface APICardImage {
	id: string;
	image_url: string;
	image_url_small: string;
}

interface APICardPrices {
	cardmarket_price: string;
	tcgplayer_price: string;
	ebay_price: string;
	amazon_price: string;
}

interface APICardMisc {
	beta_name?: string;
	views: number;
	viewsweek: number;
	upvotes: number;
	downvotes: number;
	formats?: string[];
	treated_as?: string;
	tcg_date: string;
	ocg_date: string;
}

interface APICard {
	id: string;
	name: string;
	type: string;
	desc: string;
	atk?: string;
	def?: string;
	level?: string;
	linkval?: string;
	linkmarkers?: string[];
	race: string;
	attribute?: string;
	scale?: string;
	archetype?: string;
	card_sets: APICardSet[];
	banlist_info?: APICardBanlist;
	card_images: APICardImage[];
	card_prices: [APICardPrices];
	misc_info: [APICardMisc];
}

function generateCardStats(card: APICard): string {
	let stats = "";
	if (card.archetype) {
		stats += `**Archetype**: ${card.archetype}`;
	}
	stats += "\n";
	const type = `**Type**: ${card.type} **Race**: ${card.race}`;
	stats += type;
	if (card.race in emotes) {
		stats += ` ${emotes[card.race]}`;
	}
	if (card.attribute) {
		stats += ` **Attribute**: ${card.attribute}`;
		if (card.attribute in emotes) {
			stats += ` ${emotes[card.attribute]}`;
		}
	}
	stats += "\n";
	if (card.level) {
		let levelName = "Level";
		if (card.type.toLowerCase().includes("xyz")) {
			levelName = "Rank";
		}
		stats += `**${levelName}**: ${card.level}`;
	}
	if (card.linkval) {
		stats += `**Link Rating**: ${card.linkval}`;
	}
	if (card.atk) {
		stats += ` **ATK**: ${card.atk}`;
	}
	if (card.def) {
		stats += ` **DEF**: ${card.def}`;
	}
	if (card.linkmarkers) {
		stats += ` **Link Markers**: ${card.linkmarkers.join(", ")}`;
	}
	if (card.scale) {
		stats += ` **Pendulum Scale**: ${card.scale}`;
	}
	stats += "\n";
	return stats;
}

// cr: https://blog.abelotech.com/posts/number-currency-formatting-javascript/
function formatNumber(num: number): string {
	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function parseCardInfo(card: APICard, lang: string): MessageContent {
	const stats = generateCardStats(card);
	let footer = `${card.id} Views: ${formatNumber(card.misc_info[0].views)}`;
	if (card.misc_info[0].formats) {
		footer += ` Formats: ${card.misc_info[0].formats.join(", ")}`;
	}
	const outEmbed: MessageContent = {
		embed: {
			color: embed,
			description: stats,
			fields: [],
			footer: { text: footer },
			thumbnail: { url: picsource + card.id + picext },
			title: card.name,
			url: dbsource + encodeURIComponent(card.name) + (lang === "en" ? "" : "&language=" + lang)
		}
	};
	if (outEmbed.embed && outEmbed.embed.fields) {
		const descs = messageCapSlice(card.desc);
		outEmbed.embed.fields.push({
			name: "Card Text",
			value: descs[0].length > 0 ? descs[0] : "[no card text]"
		});
		for (let i = 1; i < descs.length; i++) {
			outEmbed.embed.fields.push({
				name: "Continued",
				value: descs[i]
			});
		}

		const priceCM = `Cardmarket: €${card.card_prices[0].cardmarket_price}`;
		const priceTP = `TCGPlayer: $${card.card_prices[0].tcgplayer_price}`;
		const priceEB = `eBay: $${card.card_prices[0].ebay_price}`;
		const priceAZ = `Amazon: $${card.card_prices[0].amazon_price}`;

		outEmbed.embed.fields.push({
			name: "Prices",
			value: `${priceCM} | ${priceTP}\n${priceEB} | ${priceAZ}`,
			inline: true
		});

		if (card.banlist_info) {
			const banlistInfos = [];
			if (card.banlist_info.ban_ocg) {
				banlistInfos.push(`${card.banlist_info.ban_ocg} (OCG)`);
			}
			if (card.banlist_info.ban_tcg) {
				banlistInfos.push(`${card.banlist_info.ban_tcg} (TCG)`);
			}
			if (card.banlist_info.ban_goat) {
				banlistInfos.push(`${card.banlist_info.ban_goat} (Goat)`);
			}
			outEmbed.embed.fields.push({
				name: "Banlist Info",
				value: banlistInfos.join("\n"),
				inline: true
			});
		}
	}
	return outEmbed;
}

export async function searchCard(query: string, msg: Message, lang?: string): Promise<void> {
	lang = lang || "en";
	const fuzzyResult = cardFuzzy[lang].search(query);
	if (fuzzyResult.length > 0) {
		const card = "name" in fuzzyResult[0] ? fuzzyResult[0] : fuzzyResult[0].item;
		await msg.channel.createMessage(parseCardInfo(card, lang));
		return;
	}
	await msg.addReaction("❌");
}
