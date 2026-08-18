import type { Config } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { news } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method === "GET") {
    const allNews = await db.select().from(news).orderBy(desc(news.createdAt));
    return Response.json(allNews);
  }

  if (req.method === "POST") {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const [created] = await db
      .insert(news)
      .values({
        title,
        category: typeof body.category === "string" && body.category.trim() ? body.category.trim() : "News",
        excerpt: typeof body.excerpt === "string" ? body.excerpt.trim() : "",
        author: typeof body.author === "string" && body.author.trim() ? body.author.trim() : "FootballZone Staff",
      })
      .returning();

    return Response.json(created, { status: 201 });
  }

  if (req.method === "DELETE") {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!Number.isInteger(id)) {
      return Response.json({ error: "Valid id is required" }, { status: 400 });
    }
    await db.delete(news).where(eq(news.id, id));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/news",
};
