import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CMS_MODULE } from "../../../../modules/cms"
import { SCORE_MODULE } from "../../../../modules/score"
import { COMPOSER_MODULE } from "../../../../modules/composer"
import { getCmsHomeStats } from "../../../../lib/cms-stats-service"
import { getCmsHomeCategories } from "../../../../lib/cms-categories-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cmsModuleService = req.scope.resolve(CMS_MODULE)
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)
    const stats = await getCmsHomeStats(req.scope)
    const categoriesData = await getCmsHomeCategories({ onlyActive: true })

    const heros = await cmsModuleService.listHeroContents({ is_active: true }, {
      take: 1,
    })

    const rawHero = heros && heros.length > 0 ? heros[0] : null

    const hero = {
      hero_title: rawHero?.title_part1 || rawHero?.hero_title || "La tradición del piano colombiano y latinoamericano en tus manos.",
      hero_subtitle: rawHero?.description || rawHero?.hero_subtitle || "Un proyecto cultural con enfoque musical riguroso en pro del rescate, edición filológica y difusión de obras patrimoniales y contemporáneas para teclado.",
      btn1_text: rawHero?.button1_text || rawHero?.btn1_text || "Explorar Partituras",
      btn1_url: rawHero?.button1_url || rawHero?.btn1_url || "/tienda",
      btn2_text: rawHero?.button2_text || rawHero?.btn2_text || "Conocer Compositores",
      btn2_url: rawHero?.button2_url || rawHero?.btn2_url || "/compositores",
      footer_notice: rawHero?.urtext_badge_text || rawHero?.footer_notice || "Edición revisada con digitaciones de concierto y notas históricas bilingües (ES/EN).",
      
      featured_genre: rawHero?.featured_genre || "PASILLO LÍRICO",
      featured_title: rawHero?.featured_title || "Malvaloca",
      featured_author: rawHero?.featured_author || "Luis A. Calvo (1882–1945) · Op. 12",
      featured_tempo: rawHero?.featured_tempo || "Andante cantabile ♩ = 68",
      featured_ismn: rawHero?.featured_ismn || "ISMN 979-0-901314-18-2",
      featured_audio_sample: rawHero?.featured_audio_sample || "Pasillo No. 1 — L. A. Calvo",
      featured_audio_url: rawHero?.featured_audio_url || "",
      featured_badge_text: rawHero?.featured_badge_text || "GRABADO URTEXT 100% Alta Resolución",
      featured_link_url: rawHero?.featured_link_url || "/partitura/malvaloca",
      is_active: true,
    }

    // Buscar partitura destacada si aplica por slug
    let featuredScore: any = null
    const slug = rawHero?.featured_score_slug || "malvaloca"
    if (slug) {
      const scores = await scoreModuleService.listScores({ slug }, { take: 1 })
      if (scores && scores.length > 0) {
        const score = scores[0]
        const composers = await composerModuleService.listComposers({ id: score.composer_id }, { take: 1 })
        featuredScore = {
          ...score,
          composer: composers && composers.length > 0 ? composers[0] : null,
        }
      }
    }

    return res.status(200).json({
      hero,
      featuredScore,
      stats,
      categories: categoriesData.categories,
      total_active_categories: categoriesData.active_categories_count,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching public hero content",
      error: error.message,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cmsModuleService = req.scope.resolve(CMS_MODULE)
    const body = req.body as any

    const mappedData = {
      title_part1: body.title_part1 || body.hero_title || "EL ARCHIVO DIGITAL DEL",
      title_part2_highlight: body.title_part2_highlight || "",
      description: body.description || body.hero_subtitle || "",
      button1_text: body.button1_text || body.btn1_text || "Explorar Catálogo",
      button1_url: body.button1_url || body.btn1_url || "/tienda",
      button2_text: body.button2_text || body.btn2_text || "Portal Compositores",
      button2_url: body.button2_url || body.btn2_url || "/compositores",
      urtext_badge_text: body.urtext_badge_text || body.footer_notice || "EDICIÓN CRÍTICA & URTEXT COLOMBIANA",
      featured_score_slug: body.featured_link_url?.replace("/partitura/", "") || "score_1",
      is_active: true,
    }

    const existing = await cmsModuleService.listHeroContents({})

    let hero
    if (existing.length > 0) {
      hero = await cmsModuleService.updateHeroContents({
        id: existing[0].id,
        ...mappedData,
      })
    } else {
      hero = await cmsModuleService.createHeroContents(mappedData)
    }

    return res.status(200).json({
      hero,
      message: "Configuración del Hero CMS actualizada en vivo.",
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error updating hero CMS content",
      error: error.message,
    })
  }
}
