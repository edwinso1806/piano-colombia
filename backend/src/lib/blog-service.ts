import { Client } from "pg"

export interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  author: string
  published_at: string
  read_time: string
  cover_image: string | null
  excerpt: string | null
  content: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  created_at: string
}

function getPgClient() {
  return new Client({
    connectionString:
      process.env.DATABASE_URL || "postgres://postgres:Alex%242020@localhost:5432/piano_colombia_db",
  })
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// ----------------------------------------------------------------------
// 1. Categorías del Blog
// ----------------------------------------------------------------------

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const client = getPgClient()
  try {
    await client.connect()
    const res = await client.query(`
      SELECT id, name, slug, created_at 
      FROM blog_category 
      ORDER BY name ASC;
    `)
    return res.rows
  } finally {
    await client.end()
  }
}

export async function createBlogCategory(name: string): Promise<BlogCategory> {
  const client = getPgClient()
  try {
    await client.connect()
    const cleanName = name.trim()
    const slug = slugify(cleanName)
    const id = `cat_${slug}_${Date.now().toString().slice(-4)}`

    const res = await client.query(`
      INSERT INTO blog_category (id, name, slug)
      VALUES ($1, $2, $3)
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, slug, created_at;
    `, [id, cleanName, slug])

    return res.rows[0]
  } finally {
    await client.end()
  }
}

export async function deleteBlogCategory(id: string): Promise<boolean> {
  const client = getPgClient()
  try {
    await client.connect()
    const res = await client.query(`DELETE FROM blog_category WHERE id = $1;`, [id])
    return (res.rowCount ?? 0) > 0
  } finally {
    await client.end()
  }
}

// ----------------------------------------------------------------------
// 2. Artículos para Tienda / Público
// ----------------------------------------------------------------------

export async function getActiveStoreBlogPosts(filters?: {
  category?: string
  limit?: number
}): Promise<{ posts: BlogPost[]; count: number }> {
  const client = getPgClient()
  try {
    await client.connect()
    let query = `
      SELECT id, title, slug, category, author, published_at, read_time, cover_image, excerpt, content, is_active, created_at, updated_at
      FROM blog_post
      WHERE is_active = true
    `
    const params: any[] = []

    if (filters?.category && filters.category !== "all" && filters.category !== "Todos") {
      params.push(filters.category)
      query += ` AND LOWER(category) = LOWER($${params.length})`
    }

    query += ` ORDER BY published_at DESC, created_at DESC`

    if (filters?.limit && filters.limit > 0) {
      params.push(filters.limit)
      query += ` LIMIT $${params.length}`
    }

    const res = await client.query(query, params)
    return {
      posts: res.rows,
      count: res.rows.length,
    }
  } finally {
    await client.end()
  }
}

export async function getBlogPostBySlug(slug: string, requireActive = true): Promise<BlogPost | null> {
  const client = getPgClient()
  try {
    await client.connect()
    let query = `
      SELECT id, title, slug, category, author, published_at, read_time, cover_image, excerpt, content, is_active, created_at, updated_at
      FROM blog_post
      WHERE slug = $1
    `
    const params: any[] = [slug]

    if (requireActive) {
      query += ` AND is_active = true`
    }

    query += ` LIMIT 1;`
    const res = await client.query(query, params)
    return res.rows[0] || null
  } finally {
    await client.end()
  }
}

// ----------------------------------------------------------------------
// 3. Artículos para Gestión Administrativa (CMS)
// ----------------------------------------------------------------------

export async function getAllAdminBlogPosts(): Promise<{ posts: BlogPost[]; total: number; categories: BlogCategory[] }> {
  const client = getPgClient()
  try {
    await client.connect()
    const postsRes = await client.query(`
      SELECT id, title, slug, category, author, published_at, read_time, cover_image, excerpt, content, is_active, created_at, updated_at
      FROM blog_post
      ORDER BY published_at DESC, created_at DESC;
    `)

    const catsRes = await client.query(`
      SELECT id, name, slug, created_at FROM blog_category ORDER BY name ASC;
    `)

    return {
      posts: postsRes.rows,
      total: postsRes.rows.length,
      categories: catsRes.rows,
    }
  } finally {
    await client.end()
  }
}

export async function createBlogPost(data: {
  title: string
  slug?: string
  category: string
  author: string
  published_at?: string
  read_time?: string
  cover_image?: string | null
  excerpt?: string | null
  content: string
  is_active?: boolean
}): Promise<BlogPost> {
  const client = getPgClient()
  try {
    await client.connect()

    const title = data.title.trim()
    let slug = data.slug ? slugify(data.slug) : slugify(title)
    if (!slug) slug = `articulo-${Date.now()}`

    // Asegurar unicidad de slug
    const existing = await client.query(`SELECT id FROM blog_post WHERE slug = $1;`, [slug])
    if (existing.rows.length > 0) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`
    }

    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const category = data.category?.trim() || "Actualidad"
    const author = data.author?.trim() || "Equipo Piano Colombia"
    const published_at = data.published_at ? new Date(data.published_at) : new Date()
    
    // Calcular tiempo de lectura estimado si no se provee
    let read_time = data.read_time?.trim()
    if (!read_time) {
      const words = (data.content || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).length
      const minutes = Math.max(1, Math.ceil(words / 200))
      read_time = `${minutes} min de lectura`
    }

    const cover_image = data.cover_image?.trim() || null
    const excerpt = data.excerpt?.trim() || null
    const content = data.content || ""
    const is_active = data.is_active !== undefined ? Boolean(data.is_active) : true

    const res = await client.query(`
      INSERT INTO blog_post (
        id, title, slug, category, author, published_at, read_time,
        cover_image, excerpt, content, is_active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *;
    `, [
      id, title, slug, category, author, published_at, read_time,
      cover_image, excerpt, content, is_active
    ])

    return res.rows[0]
  } finally {
    await client.end()
  }
}

export async function updateBlogPost(
  id: string,
  data: Partial<{
    title: string
    slug: string
    category: string
    author: string
    published_at: string
    read_time: string
    cover_image: string | null
    excerpt: string | null
    content: string
    is_active: boolean
  }>
): Promise<BlogPost | null> {
  const client = getPgClient()
  try {
    await client.connect()

    const currentRes = await client.query(`SELECT * FROM blog_post WHERE id = $1;`, [id])
    if (currentRes.rows.length === 0) return null
    const current = currentRes.rows[0]

    let title = data.title !== undefined ? data.title.trim() : current.title
    let slug = data.slug !== undefined ? slugify(data.slug) : current.slug
    let category = data.category !== undefined ? data.category.trim() : current.category
    let author = data.author !== undefined ? data.author.trim() : current.author
    let published_at = data.published_at !== undefined ? new Date(data.published_at) : current.published_at
    let read_time = data.read_time !== undefined ? data.read_time.trim() : current.read_time
    let cover_image = data.cover_image !== undefined ? data.cover_image : current.cover_image
    let excerpt = data.excerpt !== undefined ? data.excerpt : current.excerpt
    let content = data.content !== undefined ? data.content : current.content
    let is_active = data.is_active !== undefined ? Boolean(data.is_active) : current.is_active

    // Si cambió el slug, verificar que no colisione con otro
    if (slug !== current.slug) {
      const col = await client.query(`SELECT id FROM blog_post WHERE slug = $1 AND id != $2;`, [slug, id])
      if (col.rows.length > 0) {
        slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`
      }
    }

    const res = await client.query(`
      UPDATE blog_post
      SET 
        title = $1,
        slug = $2,
        category = $3,
        author = $4,
        published_at = $5,
        read_time = $6,
        cover_image = $7,
        excerpt = $8,
        content = $9,
        is_active = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING *;
    `, [
      title, slug, category, author, published_at, read_time,
      cover_image, excerpt, content, is_active, id
    ])

    return res.rows[0] || null
  } finally {
    await client.end()
  }
}

export async function toggleBlogPostStatus(id: string, is_active: boolean): Promise<BlogPost | null> {
  const client = getPgClient()
  try {
    await client.connect()
    const res = await client.query(`
      UPDATE blog_post
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `, [Boolean(is_active), id])
    return res.rows[0] || null
  } finally {
    await client.end()
  }
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const client = getPgClient()
  try {
    await client.connect()
    const res = await client.query(`DELETE FROM blog_post WHERE id = $1;`, [id])
    return (res.rowCount ?? 0) > 0
  } finally {
    await client.end()
  }
}
