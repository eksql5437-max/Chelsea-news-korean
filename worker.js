export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/news") {
      try {
        const rssUrl = "https://feeds.bbci.co.uk/sport/football/rss.xml";

        const response = await fetch(rssUrl, {
          headers: {
            "User-Agent": "Chelsea-News-Korean/1.0"
          }
        });

        if (!response.ok) {
          throw new Error(`RSS request failed: ${response.status}`);
        }

        const xml = await response.text();

        const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

        const news = matches
          .map((match) => {
            const item = match[1];

            const getValue = (tag) => {
              const regex = new RegExp(
                `<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
                "i"
              );

              const result = item.match(regex);

              if (!result) {
                return "";
              }

              return result[1]
                .replace(/<!\[CDATA\[/gi, "")
                .replace(/\]\]>/gi, "")
                .replace(/<[^>]+>/g, "")
                .trim();
            };

            return {
              title: getValue("title"),
              link: getValue("link"),
              description: getValue("description"),
              pubDate: getValue("pubDate")
            };
          })
          .filter((item) => {
            const text = `${item.title} ${item.description}`.toLowerCase();

            return (
              text.includes("chelsea") ||
              text.includes("chelsea fc")
            );
          });

        return Response.json({
          success: true,
          source: "BBC Sport",
          fetched: matches.length,
          count: news.length,
          news
        });

      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message
          },
          {
            status: 500
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
