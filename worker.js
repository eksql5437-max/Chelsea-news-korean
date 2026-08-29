export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/news") {
      try {
        const rssUrl = "https://feeds.bbci.co.uk/sport/football/rss.xml";

        const response = await fetch(rssUrl);

        if (!response.ok) {
          throw new Error(`RSS request failed: ${response.status}`);
        }

        const xml = await response.text();

        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
          .slice(0, 30)
          .map(match => {
            const item = match[1];

            const getValue = (tag) => {
              const result = item.match(
                new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`)
              );

              return result
                ? result[1]
                    .replace(/<!\[CDATA\[/g, "")
                    .replace(/\]\]>/g, "")
                    .trim()
                : "";
            };

            return {
              title: getValue("title"),
              link: getValue("link"),
              description: getValue("description"),
              pubDate: getValue("pubDate")
            };
          })
          .filter(news =>
            news.title.toLowerCase().includes("chelsea") ||
            news.description.toLowerCase().includes("chelsea")
          );

        return Response.json({
          success: true,
          source: "BBC Sport",
          count: items.length,
          news: items
        });

      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message
          },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
