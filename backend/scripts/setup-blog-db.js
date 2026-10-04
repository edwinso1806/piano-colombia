const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db"
});

async function main() {
  await client.connect();
  console.log('📦 Conectado a PostgreSQL para configurar Blog & Bitácora...');

  // 1. Tabla de Categorías de Blog
  await client.query(`
    CREATE TABLE IF NOT EXISTS blog_category (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('✅ Tabla blog_category lista.');

  // 2. Tabla de Artículos de Blog
  await client.query(`
    CREATE TABLE IF NOT EXISTS blog_post (
      id VARCHAR(100) PRIMARY KEY,
      title TEXT NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL,
      author VARCHAR(200) NOT NULL,
      published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      read_time VARCHAR(50) DEFAULT '5 min de lectura',
      cover_image TEXT,
      excerpt TEXT,
      content TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('✅ Tabla blog_post lista.');

  // 3. Insertar categorías iniciales si no existen
  const defaultCategories = [
    { id: "cat_pedagogia", name: "Pedagogía", slug: "pedagogia" },
    { id: "cat_historia", name: "Historia", slug: "historia" },
    { id: "cat_actualidad", name: "Actualidad", slug: "actualidad" },
    { id: "cat_resenas", name: "Reseñas", slug: "resenas" },
  ];

  for (const cat of defaultCategories) {
    await client.query(`
      INSERT INTO blog_category (id, name, slug)
      VALUES ($1, $2, $3)
      ON CONFLICT (name) DO NOTHING;
    `, [cat.id, cat.name, cat.slug]);
  }
  console.log('✅ Categorías predeterminadas verificadas.');

  // 4. Sembrar los 3 artículos iniciales (que estaban quemados) si la tabla está vacía
  const countRes = await client.query(`SELECT COUNT(*) FROM blog_post;`);
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    const initialPosts = [
      {
        id: "post_1",
        title: "El Bambuco en el Piano: Rítmica y Articulación para Concierto",
        slug: "el-bambuco-en-el-piano-ritmica-y-articulacion",
        category: "Pedagogía",
        author: "Edwin A. Soto",
        published_at: new Date("2026-09-01T10:00:00Z"),
        read_time: "5 min de lectura",
        cover_image: "/images/mockups/piano_hero_banner_1788483832800.jpg",
        excerpt: "Analizamos la polirritmia de 3/4 y 6/8 en la literatura pianística de Adolfo Mejía y su correcta ejecución en pedal de resonancia.",
        content: `
<h2>La herencia rítmica del bambuco en la literatura pianística</h2>
<p>El bambuco pianístico colombiano representa uno de los retos de articulación y métrica más fascinantes del nacionalismo musical americano. A diferencia de las formas europeas occidentales, el juego hemíola entre el 3/4 y el 6/8 exige una independencia digital depurada en ambas manos.</p>
<blockquote>"Interpretar bambuco al piano no consiste simplemente en acentuar el segundo pulso, sino en entender la síncopa como la respiración natural del tiple y la bandola trasladada a los martinetes del teclado."</blockquote>
<h3>Articulación y pedal de resonancia</h3>
<p>El uso del pedal debe ser sincopado y rítmico. Un exceso de resonancia empastaría el fraseo brillante de la mano derecha, mientras que un pedal seco restaría la calidez folclórica que caracteriza la melodía.</p>
<p>En las ediciones críticas de Piano Colombia incluimos digitaciones exactas y marcas analíticas de pedal para que pianistas y pedagogos aborden estas obras con rigor filológico.</p>
        `.trim(),
        is_active: true,
      },
      {
        id: "post_2",
        title: "Luis A. Calvo y el Intermezzo Romántico en Colombia",
        slug: "luis-a-calvo-y-el-intermezzo-romantico",
        category: "Historia",
        author: "Daniel E. Ríos",
        published_at: new Date("2026-08-28T14:30:00Z"),
        read_time: "7 min de lectura",
        cover_image: "/images/mockups/ui_warm_wood_ivory_1788483960287.jpg",
        excerpt: "Una mirada histórica a la producción pianística del maestro de Gámbita y la importancia de la conservación digital de sus manuscritos.",
        content: `
<h2>El lirismo íntimo en la obra de Luis A. Calvo</h2>
<p>Luis A. Calvo compuso sus piezas líricas de salón en un contexto histórico lleno de matices y aislamiento en Agua de Dios. Sus emblemáticos Intermezzos combinan la elegancia romántica del siglo XIX con una sensibilidad popular inconfundible.</p>
<blockquote>"Cada compás de Calvo respira melancolía andina, tejida con un dominio contrapuntístico que evoca a Chopin y Schumann, pero con raíces profundamente colombianas."</blockquote>
<h3>Conservación de manuscritos originales</h3>
<p>Muchos de los manuscritos originales sufrieron deterioro físico a lo largo de las décadas. Mediante nuestro proyecto editorial, rescatamos los autógrafos originales conservados en archivos históricos y los transcribimos a formato digital Urtext con máxima fidelidad.</p>
        `.trim(),
        is_active: true,
      },
      {
        id: "post_3",
        title: "Nuevas Ediciones Críticas Revisadas en Piano Colombia",
        slug: "nuevas-ediciones-criticas-revisadas-piano-colombia",
        category: "Actualidad",
        author: "Equipo Piano Colombia",
        published_at: new Date("2026-08-20T09:00:00Z"),
        read_time: "4 min de lectura",
        cover_image: "/images/mockups/ui_glassmorphic_light_1788483926244.jpg",
        excerpt: "Presentamos nuestro estándar de edición digital con marcaciones de pedal, digitación académica y licencias impresas protegidas.",
        content: `
<h2>El estándar editorial Urtext de Piano Colombia</h2>
<p>En Piano Colombia asumimos el compromiso de publicar partituras digitales con los más altos estándares editoriales internacionales. Cada obra pasa por un riguroso proceso de cotejo de fuentes, revisión de armonía histórica y grabado tipográfico a 1200 DPI.</p>
<h3>Características principales de las ediciones</h3>
<ul>
  <li>Grabado vectorial de alta nitidez apto para lectura en tabletas o impresión profesional.</li>
  <li>Digitaciones y comentarios de concierto redactados por reconocidos pianistas colombianos.</li>
  <li>Marcas de agua personalizadas para proteger la autenticidad de la compra y la trazabilidad de la copia.</li>
</ul>
        `.trim(),
        is_active: true,
      },
    ];

    for (const post of initialPosts) {
      await client.query(`
        INSERT INTO blog_post (id, title, slug, category, author, published_at, read_time, cover_image, excerpt, content, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (slug) DO NOTHING;
      `, [
        post.id,
        post.title,
        post.slug,
        post.category,
        post.author,
        post.published_at,
        post.read_time,
        post.cover_image,
        post.excerpt,
        post.content,
        post.is_active,
      ]);
    }
    console.log('✅ 3 artículos iniciales sembrados exitosamente.');
  }

  await client.end();
  console.log('🎉 Migración y preparación de base de datos finalizada.');
}

main().catch((err) => {
  console.error('❌ Error en setup-blog-db:', err);
  process.exit(1);
});
