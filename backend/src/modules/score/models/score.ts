import { model } from "@medusajs/framework/utils"

export const DifficultyLevel = {
  PRINCIPIANTE: "PRINCIPIANTE",
  INTERMEDIO: "INTERMEDIO",
  AVANZADO: "AVANZADO",
} as const

export const ScoreStatus = {
  DRAFT: "DRAFT",
  IN_REVIEW: "IN_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const

export const GenreType = {
  BAMBUCO: "BAMBUCO",
  PASILLO: "PASILLO",
  DANZA: "DANZA",
  GUABINA: "GUABINA",
  JOROPO: "JOROPO",
  CLASICO: "CLASICO",
  CONTEMPORANEO: "CONTEMPORANEO",
  OTRO: "OTRO",
} as const

export const Score = model.define("score", {
  id: model.id().primaryKey(),
  title: model.text(),
  slug: model.text().unique(),
  composer_id: model.text(),
  genre: model.enum(Object.values(GenreType)).default(GenreType.PASILLO),
  difficulty: model.enum(Object.values(DifficultyLevel)).default(DifficultyLevel.INTERMEDIO),
  description_es: model.text().nullable(),
  description_en: model.text().nullable(),
  pages_count: model.number().default(1),
  duration_approx: model.text().nullable(), // ej: "3:45"
  year_composition: model.number().nullable(),
  tonality: model.text().nullable(), // ej: "Re Mayor"
  price_cop: model.number().default(0), // en pesos COP
  price_usd: model.number().default(0), // en centavos USD
  status: model.enum(Object.values(ScoreStatus)).default(ScoreStatus.IN_REVIEW),
  rejection_notes: model.text().nullable(),
  original_pdf_url: model.text().nullable(), // Archivo maestro privado
  preview_pdf_url: model.text().nullable(), // Archivo con opacidad y marca de agua
  audio_sample_url: model.text().nullable(), // Audio MP3 demo
  is_featured: model.boolean().default(false),
  product_id: model.text().nullable(), // Enlace con Product de Medusa
})
