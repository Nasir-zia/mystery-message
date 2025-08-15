// app/api/suggest-messages/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful assistant. Always return exactly three questions separated by '||'." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || "Groq API error");
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";
    const finalReply = reply.includes("||")
      ? reply
      : "What's your favorite movie?||Do you have any pets?||What's your dream job?";

    return NextResponse.json({ message: finalReply });
  } catch (err: any) {
    console.error("Error in /api/suggest-messages:", err);
    return NextResponse.json({ message: "What's your favorite movie?||Do you have any pets?||What's your dream job?" }, { status: 500 });
  }
}
