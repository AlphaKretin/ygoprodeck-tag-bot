import { source } from "../config.json";
import { cleanString } from "./util";
import fetch from "node-fetch";

export let tagMap: { [tag: string]: string } = {};
export let fullTagNames: string[] = [];

export async function updateTagMap(): Promise<void> {
	const rawResponse = await fetch(source);
	const rawContent = await rawResponse.text();
	const halves = rawContent.split("Links:");
	fullTagNames = halves[0].split(/\r\n|\r|\n/).filter(v => v !== "");
	const tags = fullTagNames.map(cleanString);
	const links = halves[1].split(/\r\n|\r|\n/).filter(v => v !== "");
	tagMap = {};
	for (let i = 0; i < Math.min(tags.length, links.length); i++) {
		tagMap[tags[i]] = links[i];
	}
}
