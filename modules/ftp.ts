import PromiseFtp from "promise-ftp";
import fetch from "node-fetch";
import * as Eris from "eris";
import { ftpUrl, ftpPort, ftpUser, ftpPass } from "../auth.json";
import { deckSource } from "../config.json";
const ftp = new PromiseFtp();

export async function uploadDeck(att: Eris.Attachment): Promise<string> {
	// verification of filename & size handled in main
	const deck = await (await fetch(att.url)).buffer();
	await ftp.connect({
		host: ftpUrl,
		port: ftpPort,
		user: ftpUser,
		password: ftpPass
	});
	const filename = `${att.filename.split(".")[0] + Math.floor(Date.now() / 1000)}.ydk`; // time stamp in seconds for unique file names
	await ftp.put(deck, filename);
	await ftp.end();
	return deckSource + filename;
}
