import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CMS_MODULE } from "../../../../modules/cms"
import { deleteFileFromR2 } from "../../../../lib/r2-storage"
import { getCmsHomeStats, saveCmsHomeStatsCards } from "../../../../lib/cms-stats-service"
import { getCmsHomeCategories, saveCmsHomeCategories } from "../../../../lib/cms-categories-service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {

  try {
    const cmsModuleService = req.scope.resolve(CMS_MODULE)
    const stats = await getCmsHomeStats(req.scope)
    const categoriesData = await getCmsHomeCategories({ onlyActive: false })

    const heros = await cmsModuleService.listHeroContents({ is_active: true }, {
      take: 1,
    })

    if (!heros || heros.length === 0) {
      return res.status(200).json({
        hero: {
          title_part1: "La tradición del piano colombiano y latinoamericano en tus manos.",
          hero_title: "La tradición del piano colombiano y latinoamericano en tus manos.",
          title_part2_highlight: "",
          description: "Un proyecto cultural con enfoque musical riguroso en pro del rescate, edición filológica y difusión de obras patrimoniales y contemporáneas para teclado.",
          hero_subtitle: "Un proyecto cultural con enfoque musical riguroso en pro del rescate, edición filológica y difusión de obras patrimoniales y contemporáneas para teclado.",
          button1_text: "Explorar Partituras",
          btn1_text: "Explorar Partituras",
          button1_url: "/tienda",
          btn1_url: "/tienda",
          button2_text: "Conocer Compositores",
          btn2_text: "Conocer Compositores",
          button2_url: "/compositores",
          btn2_url: "/compositores",
          urtext_badge_text: "Edición revisada con digitaciones de concierto y notas históricas bilingües (ES/EN).",
          footer_notice: "Edición revisada con digitaciones de concierto y notas históricas bilingües (ES/EN).",
          
          featured_genre: "PASILLO LÍRICO",
          featured_title: "Malvaloca",
          featured_author: "Luis A. Calvo (1882–1945) - Op. 12",
          featured_tempo: "Andante cantabile ♩ = 68",
          featured_ismn: "ISMN 979-0-901314-18-2",
          featured_audio_sample: "Pasillo No. 1 — L. A. Calvo",
          featured_audio_url: "",
          featured_badge_text: "GRABADO URTEXT 100% Alta Resolución",
          featured_link_url: "/partitura/malvaloca",
          is_active: true,
        },
        stats,
        categories: categoriesData.categories,
      })
    }

    const h = heros[0]
    return res.status(200).json({
      hero: {
        ...h,
        hero_title: h.hero_title || h.title_part1 || "",
        hero_subtitle: h.hero_subtitle || h.description || "",
        btn1_text: h.btn1_text || h.button1_text || "",
        btn1_url: h.btn1_url || h.button1_url || "",
        btn2_text: h.btn2_text || h.button2_text || "",
        btn2_url: h.btn2_url || h.button2_url || "",
        footer_notice: h.footer_notice || h.urtext_badge_text || "",
        featured_genre: h.featured_genre || "PASILLO LÍRICO",
        featured_title: h.featured_title || "Malvaloca",
        featured_author: h.featured_author || "Luis A. Calvo (1882–1945) - Op. 12",
        featured_tempo: h.featured_tempo || "Andante cantabile ♩ = 68",
        featured_ismn: h.featured_ismn || "ISMN 979-0-901314-18-2",
        featured_audio_sample: h.featured_audio_sample || "Pasillo No. 1 — L. A. Calvo",
        featured_audio_url: h.featured_audio_url || "",
        featured_badge_text: h.featured_badge_text || "GRABADO URTEXT 100% Alta Resolución",
        featured_link_url: h.featured_link_url || "/partitura/malvaloca",
      },
      stats,
      categories: categoriesData.categories,
    })

  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching hero CMS data",
      error: error.message,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cmsModuleService = req.scope.resolve(CMS_MODULE)
    const body = req.body as any

    // Guardar configuración de tarjetas de estadísticas si vienen en el payload
    if (body.stats_cards && Array.isArray(body.stats_cards)) {
      await saveCmsHomeStatsCards(body.stats_cards)
    }

    // Guardar categorías principales si vienen en el payload
    if (body.categories && Array.isArray(body.categories)) {
      await saveCmsHomeCategories(body.categories)
    }

    const existing = await cmsModuleService.listHeroContents({})
    const currentHero = existing.length > 0 ? existing[0] : null

    // Si viene una nueva URL de audio y existe una anterior diferente, eliminar la anterior de R2
    if (
      body.featured_audio_url !== undefined &&
      currentHero &&
      currentHero.featured_audio_url &&
      currentHero.featured_audio_url !== body.featured_audio_url
    ) {
      console.log(`🧹 Eliminando archivo de audio anterior en R2: ${currentHero.featured_audio_url}`)
      await deleteFileFromR2(currentHero.featured_audio_url)
    }

    const mappedData = {
      title_part1: body.title_part1 || body.hero_title || "La tradición del piano colombiano y latinoamericano en tus manos.",
      title_part2_highlight: body.title_part2_highlight || "",
      description: body.description || body.hero_subtitle || "Un proyecto cultural con enfoque musical riguroso...",
      button1_text: body.button1_text || body.btn1_text || "Explorar Partituras",
      button1_url: body.button1_url || body.btn1_url || "/tienda",
      button2_text: body.button2_text || body.btn2_text || "Conocer Compositores",
      button2_url: body.button2_url || body.btn2_url || "/compositores",
      urtext_badge_text: body.urtext_badge_text || body.footer_notice || "Edición revisada con digitaciones de concierto y notas históricas bilingües (ES/EN).",
      featured_score_slug: body.featured_link_url?.replace("/partitura/", "") || "malvaloca",

      featured_genre: body.featured_genre ?? "PASILLO LÍRICO",
      featured_title: body.featured_title ?? "Malvaloca",
      featured_author: body.featured_author ?? "Luis A. Calvo (1882–1945) - Op. 12",
      featured_tempo: body.featured_tempo ?? "Andante cantabile ♩ = 68",
      featured_ismn: body.featured_ismn ?? "ISMN 979-0-901314-18-2",
      featured_audio_sample: body.featured_audio_sample ?? "Pasillo No. 1 — L. A. Calvo",
      featured_audio_url: body.featured_audio_url !== undefined ? body.featured_audio_url : (currentHero?.featured_audio_url || ""),
      featured_badge_text: body.featured_badge_text ?? "GRABADO URTEXT 100% Alta Resolución",
      featured_link_url: body.featured_link_url ?? "/partitura/malvaloca",

      is_active: true,
    }

    let hero
    if (currentHero) {
      hero = await cmsModuleService.updateHeroContents({
        id: currentHero.id,
        ...mappedData,
      })
    } else {
      hero = await cmsModuleService.createHeroContents(mappedData)
    }

    const updatedStats = await getCmsHomeStats(req.scope)
    const updatedCategoriesData = await getCmsHomeCategories({ onlyActive: false })

    return res.status(200).json({
      hero: {
        ...hero,
        hero_title: hero.title_part1,
        hero_subtitle: hero.description,
        btn1_text: hero.button1_text,
        btn1_url: hero.button1_url,
        btn2_text: hero.button2_text,
        btn2_url: hero.button2_url,
        footer_notice: hero.urtext_badge_text,
      },
      stats: updatedStats,
      categories: updatedCategoriesData.categories,
      message: "Configuración del Hero CMS, Partitura Destacada, Tarjetas y Categorías actualizada en vivo en BD.",
    })
  } catch (error: any) {
    return res.status(500).json({
      message: "Error updating hero CMS content",
      error: error.message,
    })
  }
}
