export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    await fetch("https://script.google.com/macros/s/AKfycbwZ9rHRwkSCcxB0ZqT5sw8BHk1-6MHdhIirPIaBX8r8ioZnvJAnbhsDXyJ0X3kmpig1/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email }),
    });
    return res.status(200).json({ result: "ok" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
