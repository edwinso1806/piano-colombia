import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260912151022 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "hero_content" add column if not exists "featured_genre" text null, add column if not exists "featured_title" text null, add column if not exists "featured_author" text null, add column if not exists "featured_tempo" text null, add column if not exists "featured_ismn" text null, add column if not exists "featured_audio_sample" text null, add column if not exists "featured_audio_url" text null, add column if not exists "featured_badge_text" text null, add column if not exists "featured_link_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "hero_content" drop column if exists "featured_genre", drop column if exists "featured_title", drop column if exists "featured_author", drop column if exists "featured_tempo", drop column if exists "featured_ismn", drop column if exists "featured_audio_sample", drop column if exists "featured_audio_url", drop column if exists "featured_badge_text", drop column if exists "featured_link_url";`);
  }

}
