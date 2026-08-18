import type { Config } from "@netlify/functions";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { fixtures } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method === "GET") {
    const allFixtures = await db.select().from(fixtures).orderBy(asc(fixtures.matchDate));
    return Response.json(allFixtures);
  }

  if (req.method === "POST") {
    const body = await req.json();
    const competition = typeof body.competition === "string" ? body.competition.trim() : "";
    const homeTeam = typeof body.homeTeam === "string" ? body.homeTeam.trim() : "";
    const awayTeam = typeof body.awayTeam === "string" ? body.awayTeam.trim() : "";
    const matchDate = typeof body.matchDate === "string" ? new Date(body.matchDate) : null;

    if (!competition || !homeTeam || !awayTeam || !matchDate || Number.isNaN(matchDate.getTime())) {
      return Response.json(
        { error: "competition, homeTeam, awayTeam and matchDate are required" },
        { status: 400 },
      );
    }

    const [created] = await db
      .insert(fixtures)
      .values({ competition, homeTeam, awayTeam, matchDate })
      .returning();

    return Response.json(created, { status: 201 });
  }

  if (req.method === "DELETE") {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!Number.isInteger(id)) {
      return Response.json({ error: "Valid id is required" }, { status: 400 });
    }
    await db.delete(fixtures).where(eq(fixtures.id, id));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/fixtures",
};
