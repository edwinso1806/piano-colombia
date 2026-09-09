import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260905174757 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "payout_batch" drop constraint if exists "payout_batch_batch_number_unique";`);
    this.addSql(`create table if not exists "payout_batch" ("id" text not null, "batch_number" text not null, "period_start" timestamptz not null, "period_end" timestamptz not null, "status" text check ("status" in ('DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED')) not null default 'DRAFT', "total_gross_cop" integer not null default 0, "total_commission_pc_cop" integer not null default 0, "total_net_composers_cop" integer not null default 0, "wompi_batch_id" text null, "executed_at" timestamptz null, "executed_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payout_batch_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payout_batch_batch_number_unique" ON "payout_batch" ("batch_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payout_batch_deleted_at" ON "payout_batch" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "payout_item" ("id" text not null, "composer_id" text not null, "composer_name" text not null, "bank_name" text not null, "account_type" text not null, "account_number" text not null, "document_number" text not null, "amount_gross_cop" integer not null default 0, "commission_pc_cop" integer not null default 0, "amount_net_cop" integer not null default 0, "wompi_transfer_id" text null, "status" text check ("status" in ('PENDING', 'PROCESSING', 'TRANSFERRED', 'FAILED')) not null default 'PENDING', "error_message" text null, "batch_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payout_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payout_item_batch_id" ON "payout_item" ("batch_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payout_item_deleted_at" ON "payout_item" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "payout_item" add constraint "payout_item_batch_id_foreign" foreign key ("batch_id") references "payout_batch" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "payout_item" drop constraint if exists "payout_item_batch_id_foreign";`);

    this.addSql(`drop table if exists "payout_batch" cascade;`);

    this.addSql(`drop table if exists "payout_item" cascade;`);
  }

}
