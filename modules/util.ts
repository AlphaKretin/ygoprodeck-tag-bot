// strip non alpha-numeric characters so that someone searching for "Battlin' Boxer" and "battlingboxer" gets the same result
export function cleanString(s: string): string {
	return s.toLowerCase().replace(/[\W_]+/g, "");
}

export function messageCapSlice(outString: string): string[] {
	const outStrings: string[] = [];
	const MESSAGE_CAP = 2000;
	while (outString.length > MESSAGE_CAP) {
		let index = outString.slice(0, MESSAGE_CAP).lastIndexOf("\n");
		if (index === -1 || index >= MESSAGE_CAP) {
			index = outString.slice(0, MESSAGE_CAP).lastIndexOf(",");
			if (index === -1 || index >= MESSAGE_CAP) {
				index = outString.slice(0, MESSAGE_CAP).lastIndexOf(" ");
				if (index === -1 || index >= MESSAGE_CAP) {
					index = MESSAGE_CAP - 1;
				}
			}
		}
		outStrings.push(outString.slice(0, index + 1));
		outString = outString.slice(index + 1);
	}
	outStrings.push(outString);
	return outStrings;
}

export function errhand(e: unknown): void {
	console.error(e);
}
