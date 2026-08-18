CREATE TABLE "fixtures" (
	"id" serial PRIMARY KEY,
	"competition" text NOT NULL,
	"home_team" text NOT NULL,
	"away_team" text NOT NULL,
	"match_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"category" text DEFAULT 'News' NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"author" text DEFAULT 'FootballZone Staff' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
