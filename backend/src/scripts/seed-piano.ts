import { ExecArgs } from "@medusajs/framework/types"
import { COMPOSER_MODULE } from "../modules/composer"
import { SCORE_MODULE } from "../modules/score"
import { CMS_MODULE } from "../modules/cms"

export default async function seedPianoData({ container }: ExecArgs) {
  const composerService = container.resolve(COMPOSER_MODULE)
  const scoreService = container.resolve(SCORE_MODULE)
  const cmsService = container.resolve(CMS_MODULE)

  console.log("🎹 [SEED] Iniciando carga de datos colombianos en PostgreSQL...")

  // 1. Seed CMS Hero
  const existingHeros = await cmsService.listHeroContents({})
  if (existingHeros.length === 0) {
    await cmsService.createHeroContents({
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
    })
    console.log("✅ CMS Hero content inicializado.")
  }

  // 2. Seed Composers
  const composersData = [
    {
      first_name: "Adolfo",
      last_name: "Mejía",
      artistic_name: "Adolfo Mejía Navarro",
      slug: "adolfo-mejia",
      bio_es: "Adolfo Mejía Navarro (1905-1973) fue un compositor y pedagogo colombiano. Su obra pianística combina elementos del folclor caribeño con técnicas de composición europea del impresionismo.",
      bio_en: "Adolfo Mejía Navarro (1905-1973) was a major Colombian composer whose piano works blend Caribbean folklore with French impressionist techniques.",
      region: "Cartagena, Bolívar",
      era: "Siglo XX (Nacionalismo)",
      photo_url: "/images/composers/adolfo-mejia.jpg",
      email: "adolfomejia@patrimonio.gov.co",
      status: "APPROVED",
      is_featured: true,
      bank_account: {
        account_type: "AHORROS",
        bank_name: "Bancolombia",
        account_number: "245-890123-44",
        holder_name: "Herederos Adolfo Mejía",
        document_type: "NIT",
        document_number: "800.123.456-1",
      }
    },
    {
      first_name: "Luis A.",
      last_name: "Calvo",
      artistic_name: "Luis Antonio Calvo",
      slug: "luis-a-calvo",
      bio_es: "Luis A. Calvo (1882-1945) es una figura cumbre de la música romántica colombiana, famoso por sus célebres Intermezzos e líricas piezas de salón.",
      bio_en: "Luis A. Calvo (1882-1945) was a leading romantic composer, known for his lyrical intermezzos and salón piano pieces.",
      region: "Gámbita, Santander",
      era: "Romanticismo Tardío",
      photo_url: "/images/composers/luis-a-calvo.jpg",
      email: "luisacalvo@patrimonio.gov.co",
      status: "APPROVED",
      is_featured: true,
      bank_account: {
        account_type: "CORRIENTE",
        bank_name: "Banco de Bogotá",
        account_number: "012-456789-01",
        holder_name: "Legado Luis A. Calvo",
        document_type: "NIT",
        document_number: "890.987.654-2",
      }
    },
    {
      first_name: "Pedro",
      last_name: "Morales Pino",
      artistic_name: "Pedro Morales Pino",
      slug: "pedro-morales-pino",
      bio_es: "Pedro Morales Pino (1863-1926) transformó la música tradicional andina en repertorio de concierto, escribiendo pasillos, bambucos y gavotas.",
      bio_en: "Pedro Morales Pino (1863-1926) formalized Colombian Andean traditions into classical salon concert repertoire.",
      region: "Cartago, Valle del Cauca",
      era: "Siglo XIX - XX",
      photo_url: "/images/composers/pedro-morales-pino.jpg",
      email: "moralespino@patrimonio.gov.co",
      status: "APPROVED",
      is_featured: true,
      bank_account: {
        account_type: "AHORROS",
        bank_name: "Davivienda",
        account_number: "450-112233-88",
        holder_name: "Sociedad Morales Pino",
        document_type: "NIT",
        document_number: "900.555.333-7",
      }
    }
  ]

  for (const cData of composersData) {
    const existing = await composerService.listComposers({ slug: cData.slug })
    if (existing.length === 0) {
      const { bank_account, ...compFields } = cData
      const composer = await composerService.createComposers(compFields as any)
      if (bank_account) {
        await composerService.createComposerBankAccounts({
          ...bank_account,
          account_type: bank_account.account_type as any,
          composer: composer.id,
        } as any)
      }
      console.log(`✅ Compositor creado: ${composer.first_name} ${composer.last_name}`)

      // 3. Seed Scores for this composer
      if (cData.slug === "adolfo-mejia") {
        await scoreService.createScores({
          title: "Pasillo Colombiano No. 1 en Mi Menor",
          slug: "pasillo-colombiano-no-1",
          composer_id: composer.id,
          genre: "PASILLO",
          difficulty: "INTERMEDIO",
          description_es: "Obra maestra del nacionalismo impresionista colombiano con síncopas características andinas.",
          description_en: "A benchmark work of Colombian musical impressionism with distinct syncopated rhythms.",
          pages_count: 4,
          duration_approx: "3:30",
          year_composition: 1938,
          tonality: "Mi Menor",
          price_cop: 35000,
          price_usd: 850,
          status: "APPROVED",
          is_featured: true,
          preview_pdf_url: "/pdf/previews/mejia-pasillo-1.pdf",
          original_pdf_url: "/pdf/master/mejia-pasillo-1-master.pdf",
        })
      } else if (cData.slug === "luis-a-calvo") {
        await scoreService.createScores({
          title: "Intermezzo No. 1 - Lejano Azul",
          slug: "intermezzo-no-1-lejano-azul",
          composer_id: composer.id,
          genre: "CLASICO",
          difficulty: "AVANZADO",
          description_es: "La cumbre del lirismo romántico para piano en Colombia.",
          description_en: "The pinnacle of Colombian romantic piano literature.",
          pages_count: 6,
          duration_approx: "4:45",
          year_composition: 1915,
          tonality: "Si Bemol Mayor",
          price_cop: 45000,
          price_usd: 1100,
          status: "APPROVED",
          is_featured: true,
          preview_pdf_url: "/pdf/previews/calvo-lejano-azul.pdf",
          original_pdf_url: "/pdf/master/calvo-lejano-azul-master.pdf",
        })
      } else if (cData.slug === "pedro-morales-pino") {
        await scoreService.createScores({
          title: "Bambuco en Re Mayor 'El Fusagasugueño'",
          slug: "bambuco-el-fusagasugueno",
          composer_id: composer.id,
          genre: "BAMBUCO",
          difficulty: "INTERMEDIO",
          description_es: "Tradicional bambuco de salón con refinada polirritmia de 6/8 contra 3/4.",
          description_en: "A refined salon bambuco featuring traditional 6/8 vs 3/4 polyrhythms.",
          pages_count: 5,
          duration_approx: "3:15",
          year_composition: 1898,
          tonality: "Re Mayor",
          price_cop: 38000,
          price_usd: 900,
          status: "APPROVED",
          is_featured: true,
          preview_pdf_url: "/pdf/previews/morales-bambuco.pdf",
          original_pdf_url: "/pdf/master/morales-bambuco-master.pdf",
        })
      }
    }
  }

  console.log("🎹 [SEED] Carga de datos completada exitosamente!")
}
