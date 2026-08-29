export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/news") {
      return Response.json({
        success: true,
        message: "Chelsea News API is working",
        news: []
      });
    }

    return env.ASSETS.fetch(request);
  }
};
