import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260908213525 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "composer" add column if not exists "commission_percentage" integer null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "composer" drop column if exists "commission_percentage";`);
  }

}
