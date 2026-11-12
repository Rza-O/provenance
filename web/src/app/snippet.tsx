// ts_headline wraps each match in «…», so after splitting, odd indexes are the matches.
// Plain parts stay strings: React escapes them, so crawled text can never inject HTML.
export function Snippet({ text }: { text: string }) {
	const parts = text.split(/«|»/);
	return (
		<p className="mt-1 text-sm text-gray-700">
			{parts.map((part, i) =>
				i % 2 === 1 ? (
					<mark key={i} className="bg-yellow-200">
						{part}
					</mark>
				) : (
					part
				),
			)}
		</p>
	);
}
