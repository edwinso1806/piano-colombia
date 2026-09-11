import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CMS_MODULE } from "../../../../modules/cms"
import { SCORE_MODULE } from "../../../../modules/score"
import { COMPOSER_MODULE } from "../../../../modules/composer"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cmsModuleService = req.scope.resolve(CMS_MODULE)
    const scoreModuleService = req.scope.resolve(SCORE_MODULE)
    const composerModuleService = req.scope.resolve(COMPOSER_MODULE)

    const heros = await cmsModuleService.listHeroContents({ is_active: true }, {
      take: 1,
    })

    const hero = heros && heros.length > 0 ? heros[0] : {
      title_part1: "EL ARCHIVO DIGITAL DEL",
      title_part2_highlight: "PIANO COLOMBIANO",
      description: "Colección exclusiva de partituras urtext, transcripciones y obras contemporáneas con protección anticopia y regalías directas a los maestros autores.",
      button1_text: "Explorar Catálogo",
      button1_url: "/tienda",
      button2_text: "Portal Compositores",
      button2_url: "/compositor/registro",
      urtext_badge_text: "EDICIÓN CRÍTICA & URTEXT COLOMBIANA",
      featured_score_slug: "pasillo-colombiano-no-1",
      is_active: true,
    }

    // Buscar partitura destacada
    let featuredScore: any = null
    if (hero.featured_score_slug) {
      const scores = await scoreModuleService.listScores({ slug: hero.featured_score_slug }, { take: 1 })
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
