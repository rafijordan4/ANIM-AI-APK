// Vercel serverless function: Tavily research proxy for ANIM AI.
// Configure TAVILY_API_KEY in Vercel Environment Variables.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.TAVILY_API_KEY;
  if (!key) return res.status(503).json({ error: "TAVILY_API_KEY belum diatur di Vercel Environment Variables." });
  const prompt = String(req.body?.prompt || "").trim().slice(0, 900);
  const style = String(req.body?.style || "").trim().slice(0, 140);
  if (!prompt) return res.status(400).json({ error: "Prompt cerita wajib diisi." });

  const query = `2D animation character design, silhouette readability, expressive poses, color palette, storyboard staging, camera composition and lighting for ${prompt}. Visual style: ${style}`;
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({ query, search_depth: "advanced", topic: "general", max_results: 5, include_answer: true, include_raw_content: false }),
      signal: AbortSignal.timeout(20000)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Tavily HTTP ${response.status}: ${data.detail || data.message || "request failed"}`);
    const results = (Array.isArray(data.results) ? data.results : []).slice(0, 5).map(item => ({
      title: String(item.title || "Sumber referensi").slice(0, 180),
      url: String(item.url || ""),
      content: String(item.content || "").slice(0, 850)
    }));
    return res.status(200).json({ answer: String(data.answer || "").slice(0, 1400), results, images: [], notice: "Riset dipakai untuk prinsip desain; jangan menyalin karakter atau karya yang ditemukan." });
  } catch (error) {
    return res.status(502).json({ error: error.message || "Research provider failed." });
  }
}
