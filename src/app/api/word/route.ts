import words from "an-array-of-english-words";

// Checked on the server so the 3 MB word list never ships to the browser,
// and so the game does not depend on a third-party dictionary being reachable.
const WORDS = new Set<string>(words);

export async function GET(request: Request) {
  const word = new URL(request.url).searchParams.get("w")?.toLowerCase() ?? "";

  return Response.json(
    { valid: /^[a-z]+$/.test(word) && WORDS.has(word) },
    { headers: { "Cache-Control": "public, max-age=86400, immutable" } },
  );
}
