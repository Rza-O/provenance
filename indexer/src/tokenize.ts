export function tokenize(text: string): string[] {
	return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).map(stem);
}

function stem(word: string): string {
	if (word.length <= 3) return word;
	if (word.endsWith("sses")) return word.slice(0, -2); // caresses → caress
	if (word.endsWith("ies")) return word.slice(0, -2); // ponies → poni
	if (word.endsWith("ss")) return word; // caress → caress (identity rule)
	if (word.endsWith("s")) return word.slice(0, -1); // cats → cat
	return word;
}
