/**
 * Helper to ensure any server response, alert, toast, or error message
 * is guaranteed to be presented in English when isEn is active,
 * even if a cached, fallback, or legacy Spanish string was received.
 */
export function localizeAuthMessage(msg: string | null | undefined, isEn: boolean): string {
  if (!msg) return "";
  if (!isEn) return msg;
  const trimmed = msg.trim();
  const lower = trimmed.toLowerCase();

  // 1. Envíos de código OTP exitosos
  if (
    lower.includes("código otp de 6 dígitos enviado exitosamente") ||
    lower.includes("hemos enviado un código de 6 dígitos") ||
    lower.includes("código de 6 dígitos enviado") ||
    lower.includes("código enviado a") ||
    lower.includes("codigo otp de 6 digitos enviado exitosamente")
  ) {
    const emailMatch = trimmed.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const emailStr = emailMatch ? ` to ${emailMatch[1]}` : "";
    return `6-digit OTP code successfully sent${emailStr}! (Please also check your Spam folder).`;
  }
  if (
    lower.includes("nuevo código de recuperación enviado") ||
    lower.includes("nuevo código generado y enviado") ||
    lower.includes("nuevo código enviado") ||
    lower.includes("nuevo codigo enviado")
  ) {
    const emailMatch = trimmed.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const emailStr = emailMatch ? ` to ${emailMatch[1]}` : "";
    return `New verification code sent${emailStr}.`;
  }

  // 2. Validaciones de correo
  if (
    lower.includes("correo electrónico válido") ||
    lower.includes("correo valido") ||
    lower.includes("proporciona un correo") ||
    lower.includes("por favor ingresa un correo electrónico válido")
  ) {
    return "Please enter a valid email address.";
  }

  // 3. Validaciones de contraseña
  if (lower.includes("contraseñas no coinciden") || lower.includes("contrasenas no coinciden")) {
    return "Passwords do not match. Please verify both fields.";
  }
  if (lower.includes("al menos 6 caracteres") || lower.includes("mínimo 6 caracteres") || lower.includes("minimo 6 caracteres")) {
    return "Password must be at least 6 characters long for security.";
  }

  // 4. Validaciones de código OTP
  if (
    lower.includes("código completo de 6 dígitos") ||
    lower.includes("código de 6 dígitos completo") ||
    lower.includes("código de 6 dígitos numéricos") ||
    lower.includes("codigo completo de 6 digitos")
  ) {
    return "Please enter the complete 6-digit numeric verification code.";
  }
  if (
    lower.includes("código otp ingresado es incorrecto") ||
    lower.includes("código incorrecto o expirado") ||
    lower.includes("inválido o expirado") ||
    lower.includes("código de verificación inválido") ||
    lower.includes("código otp incorrecto") ||
    lower.includes("codigo otp ingresado es incorrecto") ||
    lower.includes("codigo incorrecto o expirado")
  ) {
    if (lower.includes("te quedan")) {
      const matchAttempts = trimmed.match(/(\d+)\s+intento/);
      const left = matchAttempts ? matchAttempts[1] : "";
      return `Incorrect OTP code. You have ${left} attempt(s) remaining before being revoked for security.`;
    }
    return "The OTP code entered is incorrect or has expired. Please request a new one.";
  }
  if (lower.includes("límite de 5 intentos") || lower.includes("superado el límite de 5") || lower.includes("limite de 5 intentos")) {
    return "You have exceeded the limit of 5 failed attempts. The OTP code has been revoked for security.";
  }
  if (lower.includes("alerta de seguridad")) {
    return "Security Alert: Invalid or expired OTP request for this email address.";
  }

  // 5. Éxito de autenticación y activación
  if (
    lower.includes("contraseña actualizada con éxito") ||
    lower.includes("contraseña establecida exitosamente") ||
    lower.includes("cuenta ha sido activada") ||
    lower.includes("contrasena actualizada con exito")
  ) {
    return "Password successfully set! You can now log in.";
  }
  if (lower.includes("autenticación exitosa") || lower.includes("inicio de sesión exitoso") || lower.includes("autenticacion exitosa")) {
    return "Authentication successful! Redirecting...";
  }
  if (
    lower.includes("correo verificado y cuenta creada con éxito") ||
    lower.includes("cuenta verificada y creada exitosamente") ||
    lower.includes("correo verificado y cuenta creada con exito")
  ) {
    return "Email verified and account created successfully! Redirecting...";
  }

  // 6. Errores de credenciales y cuenta
  if (lower.includes("correo o contraseña incorrectos") || lower.includes("credenciales incorrectas") || lower.includes("correo o contrasena incorrectos")) {
    return "Incorrect email or password. Please check your credentials.";
  }
  if (lower.includes("cuenta suspendida") || lower.includes("cuenta inactiva")) {
    return "Account inactive or suspended. Please contact technical support.";
  }
  if (lower.includes("ya existe una cuenta registrada con este correo") || lower.includes("ya existe una cuenta")) {
    return "An account is already registered with this email address.";
  }
  if (lower.includes("no se pudo conectar con el servidor")) {
    return "Could not connect to the authentication server. Please try again.";
  }
  if (lower.includes("error al solicitar el código de recuperación") || lower.includes("error al solicitar el codigo")) {
    return "Error requesting password reset code.";
  }
  if (lower.includes("error al restablecer la contraseña") || lower.includes("error al restablecer contraseña") || lower.includes("error al restablecer contrasena")) {
    return "Error resetting password. Please check your code and try again.";
  }
  if (lower.includes("error al reenviar el código") || lower.includes("error al reenviar el codigo")) {
    return "Error resending code.";
  }

  // 7. Google OAuth
  if (lower.includes("servicio de autenticación de google aún está cargando")) {
    return "Google authentication service is still loading. Please try again in a moment.";
  }
  if (lower.includes("error al autenticar con google")) {
    return "Error authenticating with Google.";
  }
  if (lower.includes("error al sincronizar tu cuenta de google")) {
    return "Error synchronizing your Google account with Piano Colombia.";
  }
  if (lower.includes("error al abrir la ventana de google")) {
    return "Error opening Google Sign-In window.";
  }
  if (lower.includes("tu cuenta de google fue vinculada y creada con éxito")) {
    return "Welcome! Your Google account was linked and created successfully.";
  }
  if (lower.includes("inicio de sesión con google exitoso")) {
    return "Welcome back! Successfully signed in with Google.";
  }

  // 8. Registro de Compositor
  if (lower.includes("ya existe un perfil de compositor con este correo")) {
    return "A composer profile is already registered with this email address.";
  }
  if (lower.includes("ya existe un compositor registrado con este número de documento")) {
    return "A composer is already registered with this identification document number.";
  }
  if (lower.includes("solicitud enviada exitosamente") || lower.includes("solicitud enviada con éxito")) {
    return "Application submitted successfully! Your profile is pending editorial review.";
  }

  // 9. Pagos y Checkout
  if (lower.includes("pago aprobado con éxito") || lower.includes("pago aprobado")) {
    return "Payment approved! Your official Urtext score is ready.";
  }
  if (lower.includes("transacción rechazada") || lower.includes("declinada por la entidad bancaria") || lower.includes("transaccion rechazada")) {
    return "Transaction declined by the issuing bank.";
  }
  if (lower.includes("cifrando tarjeta con wompi tokenizer")) {
    return "Encrypting card with Wompi Tokenizer...";
  }
  if (lower.includes("tarjeta de prueba cargada")) {
    return "Test sandbox card loaded!";
  }
  if (lower.includes("has alcanzado el límite máximo de") || lower.includes("has alcanzado el limite maximo")) {
    return "You have reached the maximum limit of downloads permitted for this digital license.";
  }
  if (lower.includes("error al procesar la descarga")) {
    return "Error processing download.";
  }
  if (lower.includes("error al generar tu partitura")) {
    return "Error generating your legally stamped score. Please try again.";
  }
  if (lower.includes("partitura descargada con éxito") || lower.includes("partitura descargada con exito")) {
    return "Sheet music downloaded successfully!";
  }

  return msg;
}

export const BLOG_CATEGORY_TRANSLATIONS: Record<string, string> = {
  "pedagogía": "Pedagogy",
  "pedagogia": "Pedagogy",
  "historia": "History",
  "actualidad": "News & Updates",
  "reseñas": "Reviews",
  "resenas": "Reviews",
  "todos": "All",
  "todas": "All",
  "análisis": "Analysis",
  "analisis": "Analysis",
  "partituras": "Sheet Music",
  "concierto": "Concerts",
  "compositores": "Composers",
  "editorial": "Editorial",
  "archivo": "Archives",
};

export function translateBlogCategory(category: string | null | undefined, isEn: boolean): string {
  if (!category) return "";
  if (!isEn) return category;
  const key = category.trim().toLowerCase();
  return BLOG_CATEGORY_TRANSLATIONS[key] || category;
}

export function formatReadTime(readTime: string | null | undefined, isEn: boolean): string {
  if (!readTime) return isEn ? "5 min read" : "5 min de lectura";
  const numMatch = readTime.match(/(\d+)/);
  const minutes = numMatch ? numMatch[1] : "5";
  if (isEn) {
    return `${minutes} min read`;
  }
  return `${minutes} min de lectura`;
}

/**
 * Intelligent helper for the Admin CMS editor to translate blog posts from Spanish to English.
 */
export function autoTranslateBlogDraft(es: { title: string; excerpt?: string | null; content?: string | null }): {
  title_en: string;
  excerpt_en: string;
  content_en: string;
} {
  const dictionary: [RegExp, string][] = [
    [/El Bambuco en el Piano: Rítmica y Articulación para Concierto/gi, "The Bambuco on the Piano: Rhythm and Articulation for Concert Performance"],
    [/Luis A\. Calvo y el Intermezzo Romántico en Colombia/gi, "Luis A. Calvo and the Romantic Intermezzo in Colombia"],
    [/Nuevas Ediciones Críticas Revisadas en Piano Colombia/gi, "New Revised Critical Editions at Piano Colombia"],
    [/min de lectura/gi, "min read"],
    [/partituras digitales/gi, "digital sheet music"],
    [/partituras/gi, "sheet music"],
    [/partitura/gi, "sheet music score"],
    [/compositores colombianos/gi, "Colombian composers"],
    [/compositor/gi, "composer"],
    [/compositores/gi, "composers"],
    [/edición crítica/gi, "critical edition"],
    [/ediciones críticas/gi, "critical editions"],
    [/pedal de resonancia/gi, "sustain pedal"],
    [/digitación/gi, "fingering"],
    [/digitaciones/gi, "fingerings"],
    [/literatura pianística/gi, "piano literature"],
    [/nacionalismo musical/gi, "musical nationalism"],
    [/manuscritos originales/gi, "original manuscripts"],
    [/patrimonio musical/gi, "musical heritage"],
    [/música colombiana/gi, "Colombian music"],
    [/piano/gi, "piano"],
    [/noticias/gi, "news"],
    [/investigación/gi, "research"],
    [/investigaciones/gi, "research"],
    [/análisis/gi, "analysis"],
    [/historia/gi, "history"],
    [/pedagogía/gi, "pedagogy"],
  ];

  let title_en = es.title || "";
  let excerpt_en = es.excerpt || "";
  let content_en = es.content || "";

  dictionary.forEach(([regex, replacement]) => {
    title_en = title_en.replace(regex, replacement);
    if (excerpt_en) excerpt_en = excerpt_en.replace(regex, replacement);
    if (content_en) content_en = content_en.replace(regex, replacement);
  });

  return {
    title_en: title_en.trim(),
    excerpt_en: excerpt_en.trim(),
    content_en: content_en.trim(),
  };
}
