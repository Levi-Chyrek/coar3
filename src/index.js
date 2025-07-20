export default {
  async fetch(request) {
    const url = new URL(request.url);
    const iid = url.searchParams.get("iid");
    if (!iid) return new Response("Missing 'iid'", { status: 400 });

    const xmlUrl = `https://www.chabad.org/multimedia/mediaplayer/flash_media_player_content.xml.asp?what=get&aid=&iid=${encodeURIComponent(iid)}`;

    const xmlRes = await fetch(xmlUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.chabad.org/",
        "Accept": "*/*"
      }
    });

    const xmlText = await xmlRes.text();
    const match = xmlText.match(/https:\/\/http-vod-cdn\.chabad\.org\/api\/utils\/file\/\d+\.mp3\?[^"'<>]+/);
    const mp3Url = match?.[0];
    if (!mp3Url) return new Response("MP3 not found", { status: 404 });

    const mp3Res = await fetch(mp3Url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.chabad.org/"
      }
    });

    const mp3Data = await mp3Res.arrayBuffer();

    return new Response(mp3Data, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename="${iid}.mp3"`,
        "Accept-Ranges": "bytes",
        "Content-Length": mp3Data.byteLength,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  }
};
