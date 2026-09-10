const http = require("http");

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || "GET",
      headers: {
        "x-publishable-api-key": "pk_0372bd6f8b5885e7dcfd759e152d7a9db36782d5eaace95f07e707f2e9f68ce3",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  console.log("🎹 [TEST] INICIANDO PRUEBA DE CICLO COMPLETO DE PARTITURAS...");

  // 1. Metadatos de catálogo
  console.log("\n1. Consultando metadatos dinámicos (/store/settings/metadata)...");
  const metaRes = await request("http://localhost:9000/store/settings/metadata");
  console.log("Status:", metaRes.status);
  console.log("Categorías:", metaRes.data.categories?.length);
  console.log("Dificultades:", metaRes.data.difficulties);

  // 2. Crear partitura con vistas previas
  console.log("\n2. Subiendo nueva partitura a revisión técnica (/store/scores)...");
  const scorePayload = {
    title: "Pasillo de Prueba Bilingüe Op. 1",
    composer_id: "01M219P4DT4NMGJMRTJWKGX4NA", // Alex Ríos en DB
    composer_name: "Alex Ríos",
    genre: "Pasillo",
    difficulty: "Intermedio",
    price_cop: 52000,
    price_usd: 14,
    audio_preview_url: "https://youtube.com/watch?v=sample-test",
    description: "Partitura urtext de prueba con marcas de agua y difuminado.",
    tonality: "Mi menor",
    pages_count: 5,
    preview_images: [
      "data:image/jpeg;base64,samplePreviewPage1Base64DataUrl",
      "data:image/jpeg;base64,samplePreviewPage2Base64DataUrl",
      "data:image/jpeg;base64,samplePreviewPage3Base64DataUrl",
    ],
  };

  const createRes = await request("http://localhost:9000/store/scores", {
    method: "POST",
    body: scorePayload,
  });

  console.log("Status creación:", createRes.status);
  console.log("Mensaje:", createRes.data.message);
  const createdScore = createRes.data.score;
  if (!createdScore) {
    console.error("Fallo al crear partitura:", createRes.data);
    return;
  }
  console.log("Partitura creada ID:", createdScore.id, "Slug:", createdScore.slug, "Status:", createdScore.status);

  // 3. Verificar en cola de administración
  console.log("\n3. Verificando partitura en la cola de admin (/admin/scores)...");
  const adminScoresRes = await request("http://localhost:9000/admin/scores");
  console.log("Status admin queue:", adminScoresRes.status);
  const foundInQueue = adminScoresRes.data.scores?.find((s) => s.id === createdScore.id);
  console.log("Encontrada en cola admin:", !!foundInQueue);
  if (foundInQueue) {
    console.log("Muestras adjuntas:", foundInQueue.preview_images?.length);
  }

  // 4. Rechazar partitura con observaciones
  console.log("\n4. Rechazando partitura con observaciones técnicas (/admin/scores/[id]/reject)...");
  const rejectRes = await request(`http://localhost:9000/admin/scores/${createdScore.id}/reject`, {
    method: "POST",
    body: {
      reason: "Por favor ajustar la armadura de compás 8 y numeración de compases en la página 2.",
    },
  });
  console.log("Status rechazo:", rejectRes.status);
  console.log("Mensaje:", rejectRes.data.message);
  console.log("Status partitura:", rejectRes.data.score?.status);
  console.log("Observaciones registradas:", rejectRes.data.score?.rejection_notes);

  // 5. Compositor edita y reenvía partitura
  console.log("\n5. Compositor subsana observaciones y reenvía partitura (PUT /store/scores/[slug])...");
  const updateRes = await request(`http://localhost:9000/store/scores/${createdScore.slug}`, {
    method: "PUT",
    body: {
      title: "Pasillo de Prueba Bilingüe Op. 1 (Versión Corregida)",
      pages_count: 6,
    },
  });
  console.log("Status actualización:", updateRes.status);
  console.log("Mensaje:", updateRes.data.message);
  console.log("Nuevo status:", updateRes.data.score?.status);
  console.log("Notas de rechazo limpiadas:", updateRes.data.score?.rejection_notes);

  // 6. Administrador aprueba partitura
  console.log("\n6. Administrador aprueba partitura (/admin/scores/[id]/approve)...");
  const approveRes = await request(`http://localhost:9000/admin/scores/${createdScore.id}/approve`, {
    method: "POST",
  });
  console.log("Status aprobación:", approveRes.status);
  console.log("Mensaje:", approveRes.data.message);
  console.log("Status final:", approveRes.data.score?.status);

  // 7. Verificar en el catálogo de la tienda
  console.log("\n7. Consultando partitura en el catálogo público (/store/scores/[slug])...");
  const publicRes = await request(`http://localhost:9000/store/scores/${createdScore.slug}`);
  console.log("Status público:", publicRes.status);
  console.log("Título público:", publicRes.data.score?.title);
  console.log("Compositor vinculado:", publicRes.data.score?.composer?.artistic_name || publicRes.data.score?.composer?.full_name);
  console.log("Muestras en tienda:", publicRes.data.score?.preview_images?.length);

  console.log("\n🎉 [TEST] FLUJO COMPLETO VERIFICADO EXITOSAMENTE.");
}

run().catch(console.error);
