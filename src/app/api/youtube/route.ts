import { NextResponse } from "next/server";

export const revalidate = 3600; // cache for 1 hour

const CHANNEL_ID = "UCpleUSO_wvzLM5EI1NLpjqQ";

export async function GET() {
  try {
    const rssRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
      { next: { revalidate: 3600 } }
    );
    const xml = await rssRes.text();

    // Parse entries from XML
    const entries: { id: string; title: string; published: string }[] = [];
    const entryRegex =
      /<entry>[\s\S]*?<yt:videoId>(.*?)<\/yt:videoId>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<published>(.*?)<\/published>[\s\S]*?<\/entry>/g;

    let match;
    while ((match = entryRegex.exec(xml)) !== null && entries.length < 5) {
      const date = new Date(match[3]);
      entries.push({
        id: match[1],
        title: match[2],
        published: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }).toLowerCase(),
      });
    }

    return NextResponse.json(entries);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
