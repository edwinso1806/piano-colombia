import { model } from "@medusajs/framework/utils"

export const HeroContent = model.define("hero_content", {
  id: model.id().primaryKey(),
  title_part1: model.text().default("EL ARCHIVO DIGITAL DEL"),
  title_part2_highlight: model.text().default("PIANO COLOMBIANO"),
  description: model.text().default("Colección exclusiva de partituras urtext, transcripciones y obras contemporáneas con protección anticopia y regalías directas a los maestros autores."),
  button1_text: model.text().default("Explorar Catálogo"),
  button1_url: model.text().default("/tienda"),
  button2_text: model.text().default("Portal Compositores"),
  button2_url: model.text().default("/compositor/registro"),
  urtext_badge_text: model.text().default("EDICIÓN CRÍTICA & URTEXT COLOMBIANA"),
  featured_score_slug: model.text().default("score_1"),

  // Campos de la Partitura Destacada Administrable (Card Hero Derecha)
  featured_genre: model.text().nullable(),
  featured_title: model.text().nullable(),
  featured_author: model.text().nullable(),
  featured_tempo: model.text().nullable(),
  featured_ismn: model.text().nullable(),
  featured_audio_sample: model.text().nullable(),
  featured_audio_url: model.text().nullable(),
  featured_badge_text: model.text().nullable(),
  featured_link_url: model.text().nullable(),

  is_active: model.boolean().default(true),
})

