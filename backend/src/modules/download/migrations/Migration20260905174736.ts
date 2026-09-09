import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260905174736 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "customer_download" drop constraint if exists "customer_download_download_token_unique";`);
    this.addSql(`create table if not exists "customer_download" ("id" text not null, "order_id" text not null, "customer_id" text not null, "score_id" text not null, "score_title" text not null, "composer_name" text not null, "download_token" text not null, "download_count" integer not null default 0, "max_downloads" integer not null default 5, "watermark_text" text null, "watermarked_file_url" text null, "wompi_transaction_id" text null, "buyer_name" text not null, "buyer_email" text not null, "buyer_tax_id" text null, "expires_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_download_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_download_download_token_unique" ON "customer_download" ("download_token") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_download_deleted_at" ON "customer_download" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customer_download" cascade;`);
  }

}
