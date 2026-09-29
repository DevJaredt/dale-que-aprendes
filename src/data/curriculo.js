/**
 * Currículo base para Colombia.
 * Organizado por grado → materia → temas.
 * Referencia general: Derechos Básicos de Aprendizaje (DBA) y
 * Estándares Básicos de Competencias del Ministerio de Educación Nacional (MEN).
 *
 * Es una guía editable: los profesores pueden agregar sus propios temas.
 */

export const GRADOS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']

export const CURRICULO = {
  '1': {
    'Matemáticas': ['Conteo y secuencias', 'Números del 1 al 100', 'Suma y resta sin llevar', 'Figuras geométricas', 'Largo y corto'],
    'Lenguaje': ['Vocales y consonantes', 'Lectura de palabras', 'Comprensión de cuentos', 'Rimas y trabalenguas', 'Escritura de mi nombre'],
    'Ciencias Naturales': ['Los cinco sentidos', 'Partes del cuerpo', 'Animales y plantas', 'El agua y el aire', 'Cuidado del entorno'],
    'Ciencias Sociales': ['Mi familia', 'Mi colegio', 'La casa y el barrio', 'Normas de convivencia', 'Medios de transporte'],
    'Inglés': ['Colors (colores)', 'Numbers 1-10', 'Animals (animales)', 'Greetings (saludos)', 'My family'],
  },
  '2': {
    'Matemáticas': ['Números hasta 999', 'Suma y resta con llevadas', 'Tablas del 2 al 5', 'Figuras y sólidos', 'Unidades de medida'],
    'Lenguaje': ['Sustantivos y adjetivos', 'Cuentos y fábulas', 'Uso de mayúsculas', 'Descripción de imágenes', 'Poemas cortos'],
    'Ciencias Naturales': ['Los seres vivos', 'Ciclo de vida de las plantas', 'Partes de la planta', 'Alimentos y nutrición', 'Estados del agua'],
    'Ciencias Sociales': ['Paisajes y regiones', 'Puntos cardinales', 'Oficios y profesiones', 'Símbolos patrios', 'Normas y deberes'],
    'Inglés': ['Parts of the body', 'The family', 'Numbers 11-20', 'Farm animals', 'Classroom instructions'],
  },
  '3': {
    'Matemáticas': ['La multiplicación', 'Tablas de multiplicar', 'División sencilla', 'Perímetro', 'Fracciones básicas'],
    'Lenguaje': ['Género y número', 'El párrafo', 'Mitos y leyendas', 'Uso de la coma', 'Comprensión lectora'],
    'Ciencias Naturales': ['Los ecosistemas', 'Cadena alimenticia', 'La materia y sus estados', 'Sistema digestivo', 'La energía y la luz'],
    'Ciencias Sociales': ['Regiones de Colombia', 'Departamentos y capitales', 'La población', 'Recursos naturales', 'Gobierno escolar'],
    'Inglés': ['Days of the week', 'My house', 'Clothes (ropa)', 'Food (comidas)', 'Numbers 20-50'],
  },
  '4': {
    'Matemáticas': ['Números hasta 9.999', 'Fracciones', 'Decimales', 'Área', 'Multiplicación por dos cifras'],
    'Lenguaje': ['El verbo y sus tiempos', 'Textos informativos', 'Mito y leyenda colombianos', 'Ortografía: uso de b y v', 'La idea principal'],
    'Ciencias Naturales': ['Sistema circulatorio', 'Ecosistemas colombianos', 'Fuerza y movimiento', 'Mezclas y sustancias', 'Adaptación de los seres vivos'],
    'Ciencias Sociales': ['Poblamiento de América', 'Época precolombina', 'Relieve colombiano', 'Regiones naturales', 'Derechos de los niños'],
    'Inglés': ['Months of the year', 'Telling the time', 'Jobs and occupations', 'Wild animals', 'Prepositions of place'],
  },
  '5': {
    'Matemáticas': ['Números decimales', 'Porcentajes', 'Fracciones equivalentes', 'Volumen', 'Estadística básica'],
    'Lenguaje': ['El texto narrativo', 'El cuento', 'Sujeto y predicado', 'Acentuación', 'Medios de comunicación'],
    'Ciencias Naturales': ['Sistema respiratorio', 'La célula', 'Ecosistemas y biodiversidad', 'La electricidad', 'Cambio climático'],
    'Ciencias Sociales': ['Independencia de Colombia', 'El siglo XIX', 'Constitución de 1991', 'Economía básica', 'Regiones y cultura'],
    'Inglés': ['Verb to be', 'Ordinal numbers', 'The weather', 'Places in the city', 'Daily routines'],
  },
  '6': {
    'Matemáticas': ['Números enteros', 'Potencias y raíces', 'Múltiplos y divisores', 'Fracciones', 'Ecuaciones básicas'],
    'Lenguaje': ['Géneros literarios', 'El texto narrativo', 'Categorías gramaticales', 'Comprensión inferencial', 'Uso de la tilde'],
    'Ciencias Naturales': ['La célula', 'Reinos de la naturaleza', 'Sistemas del cuerpo humano', 'La materia', 'Ecosistemas'],
    'Ciencias Sociales': ['Las civilizaciones antiguas', 'Mesopotamia y Egipto', 'Grecia y Roma', 'La Edad Media', 'Geografía de Colombia'],
    'Inglés': ['Present simple', 'Countries and nationalities', 'Daily routines', 'Adjectives', 'Family and friends'],
  },
  '7': {
    'Matemáticas': ['Números racionales', 'Proporciones', 'Ecuaciones de primer grado', 'Ángulos y polígonos', 'Gráficas estadísticas'],
    'Lenguaje': ['La novela', 'El mito y la leyenda', 'El verbo', 'Conectores', 'Textos argumentativos'],
    'Ciencias Naturales': ['Reproducción humana', 'Sistema endocrino', 'La fotosíntesis', 'Fuerza y energía', 'Reacciones químicas básicas'],
    'Ciencias Sociales': ['La Edad Moderna', 'Descubrimiento de América', 'La Conquista', 'La Colonia en América', 'Organización del Estado'],
    'Inglés': ['Past simple', 'Irregular verbs', 'Food and drinks', 'The city', 'Modal verbs'],
  },
  '8': {
    'Matemáticas': ['Números reales', 'Polinomios', 'Factorización', 'Ecuaciones', 'Función lineal'],
    'Lenguaje': ['El teatro', 'La poesía', 'La argumentación', 'Oraciones compuestas', 'Análisis literario'],
    'Ciencias Naturales': ['Genética', 'Sistema nervioso', 'Tabla periódica', 'Enlaces químicos', 'Leyes de Newton'],
    'Ciencias Sociales': ['Independencia de América', 'Revolución Industrial', 'Las guerras mundiales', 'El siglo XX en Colombia', 'Geografía económica'],
    'Inglés': ['Present perfect', 'Future tenses', 'Comparatives and superlatives', 'Health', 'The environment'],
  },
  '9': {
    'Matemáticas': ['Sistemas de ecuaciones', 'Función cuadrática', 'Trigonometría básica', 'Estadística', 'Probabilidad'],
    'Lenguaje': ['Literatura latinoamericana', 'El ensayo', 'Textos argumentativos', 'Medios y publicidad', 'Citas y referencias'],
    'Ciencias Naturales': ['ADN y herencia', 'Sistema inmunológico', 'Mol y estequiometría', 'Cinemática', 'Electricidad'],
    'Ciencias Sociales': ['Colombia en el siglo XX', 'La Violencia', 'El Frente Nacional', 'Constitución de 1991', 'Conflictos contemporáneos'],
    'Inglés': ['Passive voice', 'Conditionals', 'Reported speech', 'Technology', 'Travel'],
  },
  '10': {
    'Matemáticas': ['Funciones', 'Trigonometría', 'Geometría analítica', 'Estadística', 'Probabilidad'],
    'Lenguaje': ['Literatura universal', 'El ensayo argumentativo', 'Análisis del discurso', 'Textos académicos', 'Cine y literatura'],
    'Química': ['Estructura atómica', 'Tabla periódica', 'Enlaces químicos', 'Estequiometría', 'Soluciones'],
    'Física': ['Cinemática', 'Leyes de Newton', 'Trabajo y energía', 'Movimiento circular', 'Hidrostática'],
    'Biología': ['La célula', 'Genética', 'Evolución', 'Ecología', 'Sistemas del cuerpo humano'],
    'Ciencias Sociales': ['Historia del siglo XX', 'La Guerra Fría', 'Geografía política', 'Economía y globalización', 'La Constitución'],
    'Inglés': ['Perfect tenses', 'Conditionals', 'Academic writing', 'Debate', 'Global issues'],
    'Filosofía': ['Origen de la filosofía', 'Filosofía antigua', 'Lógica', 'Ética', 'Epistemología'],
  },
  '11': {
    'Matemáticas': ['Cálculo: límites y derivadas', 'Funciones exponenciales y logarítmicas', 'Estadística inferencial', 'Probabilidad', 'Sucesiones y series'],
    'Lenguaje': ['Literatura contemporánea', 'Argumentación y debate', 'Producción textual', 'Medios de comunicación', 'Lenguaje y sociedad'],
    'Química': ['Química orgánica', 'Reacciones químicas', 'Ácidos y bases', 'Electroquímica', 'Química ambiental'],
    'Física': ['Ondas', 'Termodinámica', 'Electromagnetismo', 'Óptica', 'Física moderna'],
    'Biología': ['Genética molecular', 'Biotecnología', 'Ecología y ambiente', 'Evolución', 'Salud y enfermedad'],
    'Ciencias Sociales': ['Colombia contemporánea', 'Globalización', 'Derechos humanos', 'Conflicto y paz', 'Economía'],
    'Inglés': ['Academic texts', 'Debate and argumentation', 'Writing an essay', 'Science and technology', 'Culture'],
    'Filosofía': ['Filosofía moderna', 'Filosofía contemporánea', 'Ética y política', 'Filosofía de la ciencia', 'Antropología filosófica'],
  },
}

/** Materias disponibles para un grado. */
export function materiasDe(grado) {
  return Object.keys(CURRICULO[String(grado)] || {})
}

/** Temas disponibles para un grado y materia. */
export function temasDe(grado, materia) {
  return CURRICULO[String(grado)]?.[materia] || []
}

/** 'Primaria' (1°-5°) o 'Secundaria' (6°-11°). */
export function nivelDe(grado) {
  const g = Number(grado)
  if (!g) return ''
  return g <= 5 ? 'Primaria' : 'Secundaria'
}
