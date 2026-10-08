import { model } from "@medusajs/framework/utils"

export const CustomerDownload = model.define("customer_download", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  customer_id: model.text(),
  score_id: model.text(),
  score_title: model.text(),
  composer_name: model.text(),
  download_token: model.text().unique(),
  download_count: model.number().default(0),
  max_downloads: model.number().default(5),
  watermark_text: model.text().nullable(),
  watermarked_file_url: model.text().nullable(),
  wompi_transaction_id: model.text().nullable(),
  buyer_name: model.text(),
  buyer_email: model.text(),
  buyer_tax_id: model.text().nullable(),
  language: model.text().default("es"),
  expires_at: model.dateTime().nullable(),
})
