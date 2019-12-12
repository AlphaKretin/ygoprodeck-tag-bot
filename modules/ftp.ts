import Client from "ssh2-sftp-client";
import fetch from "node-fetch";
import * as Eris from "eris";
import { ftpUrl, ftpPort, ftpUser, ftpPass } from "../auth.json";
import { deckSource } from "../config.json";
const sftp = new Client();

export async function uploadDeck(att: Eris.Attachment): Promise<string> {
	// verification of filename & size handled in main
	const deck = await (await fetch(att.url)).buffer();
	await sftp.connect({
		host: ftpUrl,
		port: ftpPort,
		username: ftpUser,
		password: ftpPass
	});
	const filename = att.filename.split(".")[0] + Math.floor(Date.now() / 1000) + ".ydk"; // time stamp in seconds for unique file names
	await sftp.put(deck, filename);
	await sftp.end();
	return deckSource + filename;
}