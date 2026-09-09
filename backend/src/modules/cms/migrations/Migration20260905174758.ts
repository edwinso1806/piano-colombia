import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260905174758 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "hero_content" ("id" text not null, "title_part1" text not null default 'EL ARCHIVO DIGITAL DEL', "title_part2_highlight" text not null default 'PIANO COLOMBIANO', "description" text not null default 'Colección exclusiva de partituras urtext, transcripciones y obras contemporáneas con protección anticopia y regalías directas a los maestros autores.', "button1_text" text not null default 'Explorar Catálogo', "button1_url" text not null default '/tienda', "button2_text" text not null default 'Portal Compositores', "button2_url" text not null default '/compositor/registro', "urtext_badge_text" text not null default 'EDICIÓN CRÍTICA & URTEXT COLOMBIANA', "featured_score_slug" text not null default 'score_1', "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "hero_content_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_hero_content_deleted_at" ON "hero_content" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "hero_content" cascade;`);
  }

}
