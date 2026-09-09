import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260905174715 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "score" drop constraint if exists "score_slug_unique";`);
    this.addSql(`create table if not exists "score" ("id" text not null, "title" text not null, "slug" text not null, "composer_id" text not null, "genre" text check ("genre" in ('BAMBUCO', 'PASILLO', 'DANZA', 'GUABINA', 'JOROPO', 'CLASICO', 'CONTEMPORANEO', 'OTRO')) not null default 'PASILLO', "difficulty" text check ("difficulty" in ('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO')) not null default 'INTERMEDIO', "description_es" text null, "description_en" text null, "pages_count" integer not null default 1, "duration_approx" text null, "year_composition" integer null, "tonality" text null, "price_cop" integer not null default 0, "price_usd" integer not null default 0, "status" text check ("status" in ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED')) not null default 'IN_REVIEW', "rejection_notes" text null, "original_pdf_url" text null, "preview_pdf_url" text null, "audio_sample_url" text null, "is_featured" boolean not null default false, "product_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "score_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_score_slug_unique" ON "score" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_score_deleted_at" ON "score" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "score" cascade;`);
  }

}
