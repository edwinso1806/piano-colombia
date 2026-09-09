import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260905183605 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "customer_account" drop constraint if exists "customer_account_email_unique";`);
    this.addSql(`create table if not exists "customer_account" ("id" text not null, "email" text not null, "first_name" text not null, "last_name" text not null, "password_hash" text not null, "salt" text not null, "phone" text null, "tax_id" text null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_account_email_unique" ON "customer_account" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_account_deleted_at" ON "customer_account" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customer_account" cascade;`);
  }

}
