import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { MiaTtsBody } from "@workspace/api-zod";

const router: IRouter = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const hits = new Map<string, number[]>();

function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    req.log.warn({ ip: key }, "Mia TTS rate limit exceeded");
    res.setHeader("Retry-After", "60");
    res.status(429).json({ error: "Too many requests. Please slow down and try again shortly." });
    return;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
    }
  }
  next();
}

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const TTS_MODEL = "eleven_turbo_v2_5";

router.post("/mia/tts", rateLimit, async (req, res): Promise<void> => {
  const parsed = MiaTtsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Voice is not configured." });
    return;
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: parsed.data.text,
          model_id: TTS_MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
        }),
      },
    );

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      req.log.error({ status: upstream.status, detail }, "ElevenLabs TTS failed");
      res.status(502).json({ error: "Voice generation failed." });
      return;
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    req.log.error({ err }, "Mia TTS request errored");
    res.status(502).json({ error: "Voice generation failed." });
  }
});

router.get("/mia/voices", async (req, res): Promise<void> => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Voice is not configured." });
    return;
  }
  try {
    const upstream = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": apiKey },
    });
    const json = (await upstream.json()) as { voices?: { voice_id: string; name: string; category: string }[] };
    res.json(
      (json.voices ?? []).map((v) => ({ id: v.voice_id, name: v.name, category: v.category })),
    );
  } catch (err) {
    req.log.error({ err }, "Mia voices listing errored");
    res.status(502).json({ error: "Could not list voices." });
  }
});

export default router;
