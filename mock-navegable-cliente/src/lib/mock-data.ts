export interface Score {
  id: string;
  title: string;
  slug?: string;
  composer: string;
  composerId: string;
  level: "Principiante" | "Intermedio" | "Avanzado" | "Virtuoso";
  category: "Piano Solo" | "Piano a 4 Manos" | "Piano y Orquesta" | "Música de Cámara" | "Piezas Pedagógicas" | "Piano y Electrónica";
  tags: string[];
  priceCOP: number;
  priceUSD: number;
  previewPages: string[];
  description: string;
  mediaUrl?: string;
  isFeatured?: boolean;
}

export interface Composer {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  photoUrl: string;
  shortBio: string;
  fullBio: string;
  scoreCount: number;
  isFeatured?: boolean;
}

export const MOCK_COMPOSERS: Composer[] = [
  {
    id: "comp_1",
    name: "Adolfo Mejía",
    slug: "adolfo-mejia",
    country: "Colombia",
    city: "Cartagena",
    photoUrl: "/images/composers/adolfo-mejia.jpg",
    shortBio: "Uno de los mas importantes compositores colombianos del siglo XX, pionero del nacionalismo musical.",
    fullBio: "Adolfo Mejía Navarro (1905-1973) fue un compositor y pedagogo colombiano. Su obra pianística combina elementos del folclor caribeño con técnicas de composición europea del impresionismo.",
    scoreCount: 12,
    isFeatured: true,
  },
  {
    id: "comp_2",
    name: "Luis A. Calvo",
    slug: "luis-a-calvo",
    country: "Colombia",
    city: "Gambita",
    photoUrl: "/images/composers/luis-a-calvo.jpg",
    shortBio: "Maestro del intermezzo y del pasillo estilizado para piano.",
    fullBio: "Luis A. Calvo (1882-1945) es una figura cumbre de la música romántica colombiana, famoso por sus célebres Intermezzos e líricas piezas de salón.",
    scoreCount: 24,
    isFeatured: true,
  },
  {
    id: "comp_3",
    name: "Pedro Morales Pino",
    slug: "pedro-morales-pino",
    country: "Colombia",
    city: "Cartago",
    photoUrl: "/images/composers/pedro-morales-pino.jpg",
    shortBio: "Fundador y sistematizador de la música andina colombiana de salón.",
    fullBio: "Pedro Morales Pino (1863-1926) transformó la música tradicional andina en repertorio de concierto, escribiendo pasillos, bambucos y gavotas.",
    scoreCount: 18,
    isFeatured: true,
  }
];

export const MOCK_SCORES: Score[] = [
  {
    id: "score_1",
    slug: "score_1",
    title: "Bambuco en Re Mayor",
    composer: "Adolfo Mejía",
    composerId: "comp_1",
    level: "Avanzado",
    category: "Piano Solo",
    tags: ["Bambuco", "Nacionalismo", "Concierto"],
    priceCOP: 45000,
    priceUSD: 12,
    previewPages: [
      "/images/previews/bambuco-page-1.jpg",
      "/images/previews/bambuco-page-2.jpg"
    ],
    description: "Partitura original en edición crítica. Incluye marcaciones de pedal y digitación recomendada.",
    isFeatured: true,
  },
  {
    id: "score_2",
    slug: "score_2",
    title: "Lejano Azul — Intermezzo No. 1",
    composer: "Luis A. Calvo",
    composerId: "comp_2",
    level: "Intermedio",
    category: "Piano Solo",
    tags: ["Intermezzo", "Romántico", "Pieza de Salón"],
    priceCOP: 35000,
    priceUSD: 9,
    previewPages: [
      "/images/previews/intermezzo-page-1.jpg"
    ],
    description: "Una de las joyas del repertorio pianístico colombiano, llena de lirismo y emotividad.",
    isFeatured: true,
  },
  {
    id: "score_3",
    slug: "score_3",
    title: "Joyas Colombianas — 6 Piezas Pedagógicas",
    composer: "Pedro Morales Pino",
    composerId: "comp_3",
    level: "Principiante",
    category: "Piezas Pedagógicas",
    tags: ["Pasillo", "Pedagógico", "Iniciación"],
    priceCOP: 50000,
    priceUSD: 14,
    previewPages: [
      "/images/previews/pedagogico-page-1.jpg"
    ],
    description: "Colección progresiva ideal para estudiantes que se inician en la rítmica andina colombiana.",
    isFeatured: true,
  }
];


export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: "Actualidad" | "Pedagogía" | "Historia" | "Reseñas";
  author: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  coverImage?: string;
}

export const MOCK_POSTS: BlogPost[] = [
  {
    id: "post_1",
    title: "El Bambuco en el Piano: Rítmica y Articulación para Concierto",
    slug: "el-bambuco-en-el-piano-ritmica-y-articulacion",
    category: "Pedagogía",
    author: "Edwin A. Soto",
    date: "1 de Septiembre, 2026",
    readTime: "5 min de lectura",
    excerpt: "Analizamos la polirritmia de 3/4 y 6/8 en la literatura pianística de Adolfo Mejía y su correcta ejecución en pedal de resonancia.",
    content: "El bambuco pianístico colombiano representa uno de los retos de articulación y métrica más fascinantes del nacionalismo musical americano. A diferencia de las formas europeas occidentales, el juego hemíola entre el 3/4 y el 6/8 exige una independencia digital depurada...",
  },
  {
    id: "post_2",
    title: "Luis A. Calvo y el Intermezzo Romántico en Colombia",
    slug: "luis-a-calvo-y-el-intermezzo-romantico",
    category: "Historia",
    author: "Daniel E. Ríos",
    date: "28 de Agosto, 2026",
    readTime: "7 min de lectura",
    excerpt: "Una mirada histórica a la producción pianística del maestro de Gámbita y la importancia de la conservación digital de sus manuscritos.",
    content: "Luis A. Calvo compuso sus piezas líricas de salón en un contexto histórico lleno de matices. Sus emblemáticos Intermezzos combinan la elegancia romántica del siglo XIX con una sensibilidad popular inconfundible...",
  },
  {
    id: "post_3",
    title: "Nuevas Ediciones Críticas Revisadas en Piano Colombia",
    slug: "nuevas-ediciones-criticas-revisadas-piano-colombia",
    category: "Actualidad",
    author: "Equipo Piano Colombia",
    date: "20 de Agosto, 2026",
    readTime: "4 min de lectura",
    excerpt: "Presentamos nuestro estándar de edición digital con marcaciones de pedal, digitación académica y licencias impresas protegidas.",
    content: "En Piano Colombia asumimos el compromiso de publicar partituras digitales con los más altos estándares editoriales internacionales...",
  }
];

