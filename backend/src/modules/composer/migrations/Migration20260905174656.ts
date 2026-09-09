import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260905174656 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "composer_bank_account" drop constraint if exists "composer_bank_account_composer_id_unique";`);
    this.addSql(`alter table if exists "composer" drop constraint if exists "composer_slug_unique";`);
    this.addSql(`create table if not exists "composer" ("id" text not null, "first_name" text not null, "last_name" text not null, "artistic_name" text null, "slug" text not null, "bio_es" text null, "bio_en" text null, "region" text null, "era" text null, "photo_url" text null, "status" text check ("status" in ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED')) not null default 'PENDING_APPROVAL', "rejection_reason" text null, "user_id" text null, "email" text not null, "phone" text null, "is_featured" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "composer_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_composer_slug_unique" ON "composer" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_composer_deleted_at" ON "composer" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "composer_bank_account" ("id" text not null, "account_type" text check ("account_type" in ('AHORROS', 'CORRIENTE', 'NEQUI', 'DAVIPLATA')) not null default 'AHORROS', "bank_code" text null, "bank_name" text not null, "account_number" text not null, "holder_name" text not null, "document_type" text not null default 'CC', "document_number" text not null, "composer_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "composer_bank_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_composer_bank_account_composer_id_unique" ON "composer_bank_account" ("composer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_composer_bank_account_deleted_at" ON "composer_bank_account" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "composer_bank_account" add constraint "composer_bank_account_composer_id_foreign" foreign key ("composer_id") references "composer" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "composer_bank_account" drop constraint if exists "composer_bank_account_composer_id_foreign";`);

    this.addSql(`drop table if exists "composer" cascade;`);

    this.addSql(`drop table if exists "composer_bank_account" cascade;`);
  }

}
