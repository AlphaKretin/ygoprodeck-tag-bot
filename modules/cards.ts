import fetch from "node-fetch";
import { Message, MessageContent } from "eris";
import { messageCapSlice } from "./util";
import { apisource } from "../config.json";

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
    card_prices: APICardPrices;
}

function generateCardStats(card: APICard): string {
	let stats = "";
	if (card.archetype) {
		stats += "**Archetype**: " + card.archetype;
	}
	stats += "\n";
	const type = "**Type**: " + card.type + " **Race**: " + card.race; 
	stats += type;
	if (card.attribute) {
		stats += " **Attribute**: " + card.attribute;
	}
	stats += "\n";
	if (card.level) {
		let levelName = "Level";
		if (card.type.toLowerCase().includes("xyz")) {
			levelName = "Rank";
		}
		stats += "**" + levelName + "**: " + card.level;
	}
	if (card.linkval) {
		stats += "**Link Rating**: " + card.linkval;
	}
	if (card.atk) {
		stats += " **ATK**: " + card.atk;
	}
	if (card.def) {
		stats += " **DEF**: " + card.def;
	}
	if (card.linkmarkers) {
		stats += " **Link Markers**: " + card.linkmarkers.join(", ");
	}
	if (card.scale) {
		stats += " **Pendulum Scale**: " + card.scale;
	}
	stats += "\n";
	return stats;
}

function parseCardInfo(card: APICard): MessageContent {
	const stats = generateCardStats(card);
	const outEmbed: MessageContent = {
		embed: {
			description: stats,
			fields: [],
			footer: { text: card.id },
			//thumbnail: { url: card.imageLink },
			title: card.name
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
		if (card.banlist_info) {
			const banlistInfos = [];
			if (card.banlist_info.ban_ocg) {
				banlistInfos.push(card.banlist_info.ban_ocg + " (OCG)");
			}
			if (card.banlist_info.ban_tcg) {
				banlistInfos.push(card.banlist_info.ban_ocg + " (TCG)");
			}
			if (card.banlist_info.ban_goat) {
				banlistInfos.push(card.banlist_info.ban_ocg + " (Goat)");
			}
			outEmbed.embed.fields.push({
				name: "Banlist Info",
				value: banlistInfos.join("\n"),
				inline: true
			});
		}

		let priceCM = "Cardmarket: €" + card.card_prices.cardmarket_price;
		let priceTP = "TCGPlayer: $" + card.card_prices.tcgplayer_price;
		let priceEB = "eBay: $" + card.card_prices.ebay_price;
		let priceAZ = "Amazon: $" + card.card_prices.amazon_price;

		priceCM = priceCM.padEnd(priceEB.length);
		priceTP = priceTP.padEnd(priceAZ.length);
		priceEB = priceEB.padEnd(priceCM.length);
		priceAZ = priceAZ.padEnd(priceTP.length);

		outEmbed.embed.fields.push({
			name: "Prices",
			value: priceCM + " " + priceTP + "\n" + priceEB + " " + priceAZ,
			inline: true,
		});
	}
	return outEmbed;
}

export async function searchCard(query: string, msg: Message): Promise<void> {
	try {
		const source = apisource.replace(/%s/, encodeURIComponent(query));
		const res = await fetch(source);
		if (res.ok) {
			const data = await res.json();
			await msg.channel.createMessage(parseCardInfo(data[0]));
		} else {
			await msg.addReaction("❌");
		}
	} catch (e) {
		console.error(e);
	}
}