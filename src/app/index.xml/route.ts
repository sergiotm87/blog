// Legacy feed URL from the old Hugo blog (/blog/index.xml). Serves the same feed as /rss.xml.
export const dynamic = "force-static";

export { GET } from "../rss.xml/route";
