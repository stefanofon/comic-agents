export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "NO_KEY" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const payload = {
      model: body.model || "claude-sonnet-4-20250514",
      max_tokens: body.max_tokens || 1000,
      messages: body.messages || [],
    };

    if (body.system && body.system.length > 0) {
      payload.system = body.system;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({ error_detail: data, sent_payload: { model: payload.model, max_tokens: payload.max_tokens, has_system: !!payload.system, msg_count: payload.messages.length } });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "CATCH: " + error.message });
  }
}
