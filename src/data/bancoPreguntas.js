/**
 * Banco de preguntas semilla de ¡Dale Que Aprendes!
 *
 * Cada pregunta tiene la forma:
 *   { id, grado, materia, tema, tipo, enunciado, explicacion, puntos, dificultad, ...datos }
 *
 * Datos según el tipo:
 *   - multiple : opciones: string[], correcta: número (índice de la opción correcta)
 *   - boolean  : correcta: true | false
 *   - emparejar: pares: [{ izq, der }]
 *   - ordenar  : secuencia: string[]  (en el orden correcto)
 *   - corta    : respuestas: string[] (respuestas aceptadas)
 *
 * Los profesores pueden usar estas preguntas o crear las suyas.
 */

export const BANCO = [
  /* ================= MATEMÁTICAS · PRIMARIA ================= */
  {
    id: 'p-mat-01', grado: '1', materia: 'Matemáticas', tema: 'Suma y resta sin llevar', tipo: 'multiple', dificultad: 1,
    enunciado: '¿Cuánto es 3 + 4?',
    opciones: ['6', '7', '8', '9'], correcta: 1,
    explicacion: 'Si a 3 le agregas 4, obtienes 7. Puedes contarlo con los dedos: 4, 5, 6, 7.',
  },
  {
    id: 'p-mat-02', grado: '1', materia: 'Matemáticas', tema: 'Conteo y secuencias', tipo: 'ordenar', dificultad: 1,
    enunciado: 'Ordena los números de menor a mayor.',
    secuencia: ['2', '3', '5', '8'],
    explicacion: 'De menor a mayor van creciendo: 2, 3, 5 y 8.',
  },
  {
    id: 'p-mat-03', grado: '2', materia: 'Matemáticas', tema: 'Tablas del 2 al 5', tipo: 'multiple', dificultad: 1,
    enunciado: '¿Cuánto es 4 × 3?',
    opciones: ['7', '12', '9', '16'], correcta: 1,
    explicacion: '4 × 3 significa sumar 4 tres veces: 4 + 4 + 4 = 12.',
  },
  {
    id: 'p-mat-04', grado: '2', materia: 'Matemáticas', tema: 'Números hasta 999', tipo: 'boolean', dificultad: 1,
    enunciado: 'El número 407 se lee "cuatrocientos siete".',
    correcta: true,
    explicacion: '407 tiene 4 centenas, 0 decenas y 7 unidades: cuatrocientos siete.',
  },
  {
    id: 'p-mat-05', grado: '3', materia: 'Matemáticas', tema: 'Tablas de multiplicar', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuánto es 6 × 7?',
    opciones: ['36', '42', '48', '54'], correcta: 1,
    explicacion: '6 × 7 = 42. Truco: 6 × 7 es como 7 + 7 + 7 + 7 + 7 + 7.',
  },
  {
    id: 'p-mat-06', grado: '3', materia: 'Matemáticas', tema: 'Fracciones básicas', tipo: 'multiple', dificultad: 2,
    enunciado: 'Una pizza se parte en 4 partes iguales y tomas 1. ¿Qué fracción tomaste?',
    opciones: ['1/2', '1/3', '1/4', '4/1'], correcta: 2,
    explicacion: 'El denominador (4) indica en cuántas partes se partió y el numerador (1) cuántas tomaste: 1/4.',
  },
  {
    id: 'p-mat-07', grado: '4', materia: 'Matemáticas', tema: 'Área', tipo: 'multiple', dificultad: 2,
    enunciado: 'Un rectángulo mide 5 cm de largo y 3 cm de ancho. ¿Cuál es su área?',
    opciones: ['8 cm²', '15 cm²', '16 cm²', '30 cm²'], correcta: 1,
    explicacion: 'El área del rectángulo es base × altura: 5 × 3 = 15 cm².',
  },
  {
    id: 'p-mat-08', grado: '4', materia: 'Matemáticas', tema: 'Fracciones', tipo: 'emparejar', dificultad: 2,
    enunciado: 'Une cada fracción con su número decimal.',
    pares: [
      { izq: '1/2', der: '0,5' },
      { izq: '1/4', der: '0,25' },
      { izq: '3/4', der: '0,75' },
    ],
    explicacion: 'Una fracción también se puede escribir como decimal dividiendo el numerador entre el denominador.',
  },
  {
    id: 'p-mat-09', grado: '4', materia: 'Matemáticas', tema: 'Multiplicación por dos cifras', tipo: 'corta', dificultad: 2,
    enunciado: '¿Cuánto es 23 × 4?',
    respuestas: ['92'],
    explicacion: '23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92.',
  },
  {
    id: 'p-mat-10', grado: '5', materia: 'Matemáticas', tema: 'Porcentajes', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuánto es el 25% de 200?',
    opciones: ['25', '50', '75', '100'], correcta: 1,
    explicacion: 'El 25% es la cuarta parte. 200 ÷ 4 = 50.',
  },
  {
    id: 'p-mat-11', grado: '5', materia: 'Matemáticas', tema: 'Números decimales', tipo: 'ordenar', dificultad: 2,
    enunciado: 'Ordena los decimales de menor a mayor.',
    secuencia: ['0,1', '0,25', '0,5', '0,75'],
    explicacion: 'Compara cifra por cifra: 0,10 < 0,25 < 0,50 < 0,75.',
  },
  {
    id: 'p-mat-12', grado: '5', materia: 'Matemáticas', tema: 'Estadística básica', tipo: 'multiple', dificultad: 2,
    enunciado: 'En los datos 3, 5, 5, 7, ¿cuál es la moda?',
    opciones: ['3', '5', '7', '6'], correcta: 1,
    explicacion: 'La moda es el dato que más se repite. El 5 aparece dos veces.',
  },

  /* ================= MATEMÁTICAS · SECUNDARIA ================= */
  {
    id: 'p-mat-13', grado: '6', materia: 'Matemáticas', tema: 'Números enteros', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuánto es (−3) + 5?',
    opciones: ['−8', '−2', '2', '8'], correcta: 2,
    explicacion: 'Partiendo de −3 avanzas 5 pasos hacia la derecha en la recta numérica y llegas a 2.',
  },
  {
    id: 'p-mat-14', grado: '6', materia: 'Matemáticas', tema: 'Potencias y raíces', tipo: 'corta', dificultad: 2,
    enunciado: '¿Cuánto es 2⁵?',
    respuestas: ['32'],
    explicacion: '2⁵ = 2 × 2 × 2 × 2 × 2 = 32.',
  },
  {
    id: 'p-mat-15', grado: '6', materia: 'Matemáticas', tema: 'Múltiplos y divisores', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuál es el máximo común divisor (MCD) de 12 y 18?',
    opciones: ['2', '3', '6', '36'], correcta: 2,
    explicacion: 'Los divisores comunes de 12 y 18 son 1, 2, 3 y 6. El mayor es 6.',
  },
  {
    id: 'p-mat-16', grado: '7', materia: 'Matemáticas', tema: 'Ecuaciones de primer grado', tipo: 'corta', dificultad: 2,
    enunciado: 'Si x + 7 = 12, ¿cuánto vale x?',
    respuestas: ['5', 'x=5', 'x = 5'],
    explicacion: 'Restamos 7 a ambos lados: x = 12 − 7 = 5.',
  },
  {
    id: 'p-mat-17', grado: '7', materia: 'Matemáticas', tema: 'Números racionales', tipo: 'boolean', dificultad: 2,
    enunciado: 'La fracción 1/2 es mayor que 2/3.',
    correcta: false,
    explicacion: 'Comparamos: 1/2 = 0,5 y 2/3 ≈ 0,66. Entonces 1/2 es menor que 2/3.',
  },
  {
    id: 'p-mat-18', grado: '7', materia: 'Matemáticas', tema: 'Proporciones', tipo: 'multiple', dificultad: 3,
    enunciado: 'Si 4 obreros hacen una obra en 6 días, ¿en cuántos días la harán 8 obreros (al mismo ritmo)?',
    opciones: ['3 días', '6 días', '12 días', '24 días'], correcta: 0,
    explicacion: 'Al duplicar los obreros, el tiempo se reduce a la mitad: 6 ÷ 2 = 3 días (proporción inversa).',
  },
  {
    id: 'p-mat-19', grado: '8', materia: 'Matemáticas', tema: 'Polinomios', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Cuál es el resultado de (x + 2)(x + 3)?',
    opciones: ['x² + 5x + 6', 'x² + 6x + 5', 'x² + 5', 'x² + 6'], correcta: 0,
    explicacion: 'Aplicando la propiedad distributiva: x·x + 3x + 2x + 6 = x² + 5x + 6.',
  },
  {
    id: 'p-mat-20', grado: '8', materia: 'Matemáticas', tema: 'Factorización', tipo: 'corta', dificultad: 3,
    enunciado: 'Factoriza la diferencia de cuadrados x² − 9.',
    respuestas: ['(x-3)(x+3)', '(x+3)(x-3)'],
    explicacion: 'La diferencia de cuadrados a² − b² = (a − b)(a + b). Aquí x² − 3² = (x − 3)(x + 3).',
  },
  {
    id: 'p-mat-21', grado: '8', materia: 'Matemáticas', tema: 'Función lineal', tipo: 'multiple', dificultad: 3,
    enunciado: 'En la función y = 3x + 2, ¿cuál es la pendiente?',
    opciones: ['2', '3', '5', 'x'], correcta: 1,
    explicacion: 'En y = mx + b, m es la pendiente. Aquí m = 3 y b = 2 (el punto de corte con el eje y).',
  },
  {
    id: 'p-mat-22', grado: '9', materia: 'Matemáticas', tema: 'Sistemas de ecuaciones', tipo: 'multiple', dificultad: 3,
    enunciado: 'Si x + y = 10 y x − y = 4, ¿cuánto valen x e y?',
    opciones: ['x = 7, y = 3', 'x = 5, y = 5', 'x = 6, y = 4', 'x = 8, y = 2'], correcta: 0,
    explicacion: 'Sumando las dos ecuaciones: 2x = 14 → x = 7. Luego y = 10 − 7 = 3.',
  },
  {
    id: 'p-mat-23', grado: '9', materia: 'Matemáticas', tema: 'Función cuadrática', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Cuáles son las raíces de x² − 5x + 6 = 0?',
    opciones: ['1 y 6', '2 y 3', '−2 y −3', '0 y 5'], correcta: 1,
    explicacion: 'Buscamos dos números que multiplicados den 6 y sumados den 5: 2 y 3. (x − 2)(x − 3) = 0.',
  },
  {
    id: 'p-mat-24', grado: '9', materia: 'Matemáticas', tema: 'Trigonometría básica', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Cuál es el valor de sen(30°)?',
    opciones: ['1/2', '√3/2', '1', '0'], correcta: 0,
    explicacion: 'sen(30°) = 1/2 es un valor notable que conviene memorizar junto con cos(30°) = √3/2.',
  },
  {
    id: 'p-mat-25', grado: '10', materia: 'Matemáticas', tema: 'Funciones', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Cuál es el dominio de la función f(x) = 1/x?',
    opciones: ['Todos los reales', 'Todos los reales excepto 0', 'Solo los positivos', 'Solo los enteros'], correcta: 1,
    explicacion: 'No se puede dividir entre cero, así que x = 0 queda excluido del dominio.',
  },
  {
    id: 'p-mat-26', grado: '10', materia: 'Matemáticas', tema: 'Geometría analítica', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Cuál es la distancia entre los puntos (0,0) y (3,4)?',
    opciones: ['3', '4', '5', '7'], correcta: 2,
    explicacion: 'd = √(3² + 4²) = √(9 + 16) = √25 = 5. Es el famoso triángulo 3-4-5.',
  },
  {
    id: 'p-mat-27', grado: '10', materia: 'Matemáticas', tema: 'Probabilidad', tipo: 'multiple', dificultad: 2,
    enunciado: 'Al lanzar una moneda, ¿cuál es la probabilidad de obtener cara?',
    opciones: ['0', '1/2', '1', '1/4'], correcta: 1,
    explicacion: 'Hay 2 resultados posibles y ambos son igualmente probables: 1 caso favorable de 2 = 1/2.',
  },
  {
    id: 'p-mat-28', grado: '11', materia: 'Matemáticas', tema: 'Cálculo: límites y derivadas', tipo: 'multiple', dificultad: 4,
    enunciado: '¿Cuál es la derivada de f(x) = x²?',
    opciones: ['x', '2x', 'x²/2', '2'], correcta: 1,
    explicacion: 'Usando la regla de la potencia: d/dx (xⁿ) = n·xⁿ⁻¹. Entonces la derivada de x² es 2x.',
  },
  {
    id: 'p-mat-29', grado: '11', materia: 'Matemáticas', tema: 'Sucesiones y series', tipo: 'corta', dificultad: 2,
    enunciado: '¿Cuál es el siguiente término de la sucesión 2, 4, 8, 16, ...?',
    respuestas: ['32'],
    explicacion: 'Cada término es el doble del anterior: 16 × 2 = 32.',
  },
  {
    id: 'p-mat-30', grado: '11', materia: 'Matemáticas', tema: 'Funciones exponenciales y logarítmicas', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Cuánto es log₁₀(100)?',
    opciones: ['1', '2', '10', '100'], correcta: 1,
    explicacion: 'log₁₀(100) pregunta: ¿a qué potencia elevo 10 para obtener 100? 10² = 100, entonces es 2.',
  },

  /* ================= LENGUAJE · PRIMARIA ================= */
  {
    id: 'p-len-01', grado: '1', materia: 'Lenguaje', tema: 'Vocales y consonantes', tipo: 'multiple', dificultad: 1,
    enunciado: '¿Cuál de estas letras es una vocal?',
    opciones: ['m', 'a', 'p', 't'], correcta: 1,
    explicacion: 'Las vocales son a, e, i, o, u. La letra "a" es una vocal.',
  },
  {
    id: 'p-len-02', grado: '1', materia: 'Lenguaje', tema: 'Rimas y trabalenguas', tipo: 'emparejar', dificultad: 1,
    enunciado: 'Une las palabras que riman.',
    pares: [
      { izq: 'gato', der: 'pato' },
      { izq: 'luna', der: 'cuna' },
      { izq: 'sol', der: 'caracol' },
    ],
    explicacion: 'Dos palabras riman cuando terminan con sonidos parecidos.',
  },
  {
    id: 'p-len-03', grado: '2', materia: 'Lenguaje', tema: 'Uso de mayúsculas', tipo: 'boolean', dificultad: 1,
    enunciado: 'Los nombres propios, como "Colombia" o "Ana", se escriben con mayúscula inicial.',
    correcta: true,
    explicacion: 'Los nombres propios siempre llevan mayúscula inicial; los comunes van en minúscula.',
  },
  {
    id: 'p-len-04', grado: '2', materia: 'Lenguaje', tema: 'Sustantivos y adjetivos', tipo: 'multiple', dificultad: 2,
    enunciado: 'En la frase "perro grande", ¿cuál palabra es el adjetivo?',
    opciones: ['perro', 'grande', 'las dos', 'ninguna'], correcta: 1,
    explicacion: 'El adjetivo describe al sustantivo. "Grande" describe al perro.',
  },
  {
    id: 'p-len-05', grado: '3', materia: 'Lenguaje', tema: 'Mitos y leyendas', tipo: 'multiple', dificultad: 2,
    enunciado: 'La leyenda de El Dorado es una historia tradicional de…',
    opciones: ['Colombia', 'Egipto', 'Japón', 'Australia'], correcta: 0,
    explicacion: 'El Dorado es una de las leyendas más conocidas de Colombia, sobre una ciudad llena de oro.',
  },
  {
    id: 'p-len-06', grado: '3', materia: 'Lenguaje', tema: 'Uso de la coma', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuál oración está escrita correctamente?',
    opciones: ['Compré manzanas peras y uvas.', 'Compré manzanas, peras y uvas.', 'Compré, manzanas peras y uvas.', 'Compré manzanas peras, y uvas.'], correcta: 1,
    explicacion: 'La coma separa los elementos de una enumeración; antes de la "y" final no se escribe coma.',
  },
  {
    id: 'p-len-07', grado: '4', materia: 'Lenguaje', tema: 'Ortografía: uso de b y v', tipo: 'multiple', dificultad: 2,
    enunciado: 'Completa: "El niño ___ un sueño muy bonito".',
    opciones: ['tubo', 'tuvo', 'tubbo', 'tubó'], correcta: 1,
    explicacion: '"Tuvo" viene del verbo tener (tener → tuvo). "Tubo" es una pieza cilíndrica.',
  },
  {
    id: 'p-len-08', grado: '4', materia: 'Lenguaje', tema: 'La idea principal', tipo: 'multiple', dificultad: 3,
    enunciado: 'Lee: "El agua es esencial para la vida. Sin ella, las plantas no crecen y los animales no sobreviven." ¿Cuál es la idea principal?',
    opciones: ['Las plantas crecen.', 'El agua es esencial para la vida.', 'Los animales son importantes.', 'Las plantas necesitan sol.'], correcta: 1,
    explicacion: 'La idea principal es la frase que resume todo el texto: el agua es esencial para la vida.',
  },
  {
    id: 'p-len-09', grado: '5', materia: 'Lenguaje', tema: 'Acentuación', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Cuál de estas palabras es esdrújula?',
    opciones: ['canción', 'árbol', 'médico', 'corazón'], correcta: 2,
    explicacion: 'Las esdrújulas llevan la fuerza en la antepenúltima sílaba: MÉ-di-co. Y siempre llevan tilde.',
  },
  {
    id: 'p-len-10', grado: '5', materia: 'Lenguaje', tema: 'Sujeto y predicado', tipo: 'multiple', dificultad: 2,
    enunciado: 'En "María corre en el parque", ¿cuál es el sujeto?',
    opciones: ['corre', 'María', 'en el parque', 'el parque'], correcta: 1,
    explicacion: 'El sujeto es quien realiza la acción: María. El predicado es "corre en el parque".',
  },

  /* ================= LENGUAJE · SECUNDARIA ================= */
  {
    id: 'p-len-11', grado: '6', materia: 'Lenguaje', tema: 'Categorías gramaticales', tipo: 'multiple', dificultad: 2,
    enunciado: 'En "Corremos rápidamente", la palabra "rápidamente" es un…',
    opciones: ['sustantivo', 'adjetivo', 'adverbio', 'verbo'], correcta: 2,
    explicacion: '"Rápidamente" modifica al verbo e indica cómo se realiza la acción: es un adverbio de modo.',
  },
  {
    id: 'p-len-12', grado: '6', materia: 'Lenguaje', tema: 'Géneros literarios', tipo: 'emparejar', dificultad: 2,
    enunciado: 'Une cada género literario con un ejemplo.',
    pares: [
      { izq: 'Narrativo', der: 'Cuento' },
      { izq: 'Lírico', der: 'Poema' },
      { izq: 'Dramático', der: 'Obra de teatro' },
    ],
    explicacion: 'Los géneros literarios se clasifican según su forma: narrar, expresar sentimientos o representar.',
  },
  {
    id: 'p-len-13', grado: '7', materia: 'Lenguaje', tema: 'El verbo', tipo: 'multiple', dificultad: 2,
    enunciado: '¿En qué tiempo está el verbo "cantaré"?',
    opciones: ['presente', 'pasado', 'futuro', 'pretérito'], correcta: 2,
    explicacion: 'La terminación "-é" en "cantaré" indica futuro: la acción ocurrirá después.',
  },
  {
    id: 'p-len-14', grado: '7', materia: 'Lenguaje', tema: 'Textos argumentativos', tipo: 'boolean', dificultad: 2,
    enunciado: 'Un texto argumentativo busca convencer al lector usando razones y pruebas.',
    correcta: true,
    explicacion: 'La argumentación defiende una tesis con razones, datos o ejemplos para persuadir al lector.',
  },
  {
    id: 'p-len-15', grado: '8', materia: 'Lenguaje', tema: 'El teatro', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuál es un elemento esencial de una obra de teatro?',
    opciones: ['El narrador omnisciente', 'El diálogo entre personajes', 'Las estrofas', 'El índice'], correcta: 1,
    explicacion: 'En el teatro la historia se cuenta mediante diálogos y acciones de los personajes en escena.',
  },
  {
    id: 'p-len-16', grado: '8', materia: 'Lenguaje', tema: 'Oraciones compuestas', tipo: 'multiple', dificultad: 3,
    enunciado: '"Juan estudia y María trabaja" es una oración…',
    opciones: ['simple', 'compuesta coordinada', 'subordinada', 'unimembre'], correcta: 1,
    explicacion: 'Tiene dos proposiciones independientes unidas por "y": es compuesta coordinada.',
  },
  {
    id: 'p-len-17', grado: '9', materia: 'Lenguaje', tema: 'Literatura latinoamericana', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Quién escribió "Cien años de soledad"?',
    opciones: ['Gabriel García Márquez', 'Pablo Neruda', 'Jorge Luis Borges', 'Mario Vargas Llosa'], correcta: 0,
    explicacion: 'Gabriel García Márquez, Nobel colombiano, escribió "Cien años de soledad" en 1967.',
  },
  {
    id: 'p-len-18', grado: '9', materia: 'Lenguaje', tema: 'El ensayo', tipo: 'boolean', dificultad: 2,
    enunciado: 'El ensayo combina la opinión del autor con argumentos y reflexión.',
    correcta: true,
    explicacion: 'El ensayo es un texto libre donde el autor expone y defiende su punto de vista con argumentos.',
  },
  {
    id: 'p-len-19', grado: '10', materia: 'Lenguaje', tema: 'Literatura universal', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Quién escribió "Don Quijote de la Mancha"?',
    opciones: ['William Shakespeare', 'Miguel de Cervantes', 'Dante Alighieri', 'Homero'], correcta: 1,
    explicacion: 'Miguel de Cervantes publicó "Don Quijote de la Mancha" en 1605; es la obra cumbre del español.',
  },
  {
    id: 'p-len-20', grado: '10', materia: 'Lenguaje', tema: 'Análisis del discurso', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Cuál es la intención principal de un anuncio publicitario?',
    opciones: ['informar objetivamente', 'persuadir para comprar', 'narrar una historia', 'enseñar gramática'], correcta: 1,
    explicacion: 'La publicidad busca persuadir al público para que adopte una conducta o compre un producto.',
  },

  /* ================= CIENCIAS NATURALES · PRIMARIA ================= */
  {
    id: 'p-nat-01', grado: '1', materia: 'Ciencias Naturales', tema: 'Los cinco sentidos', tipo: 'emparejar', dificultad: 1,
    enunciado: 'Une cada órgano con el sentido que le corresponde.',
    pares: [
      { izq: 'Ojos', der: 'Ver' },
      { izq: 'Oídos', der: 'Oír' },
      { izq: 'Nariz', der: 'Oler' },
    ],
    explicacion: 'Cada órgano de los sentidos nos permite percibir el mundo: vista, oído, olfato, gusto y tacto.',
  },
  {
    id: 'p-nat-02', grado: '1', materia: 'Ciencias Naturales', tema: 'Partes del cuerpo', tipo: 'multiple', dificultad: 1,
    enunciado: '¿Qué órgano bombea la sangre por todo el cuerpo?',
    opciones: ['El cerebro', 'El corazón', 'El estómago', 'Los pulmones'], correcta: 1,
    explicacion: 'El corazón es un músculo que impulsa la sangre para llevar oxígeno y nutrientes al cuerpo.',
  },
  {
    id: 'p-nat-03', grado: '2', materia: 'Ciencias Naturales', tema: 'Ciclo de vida de las plantas', tipo: 'ordenar', dificultad: 2,
    enunciado: 'Ordena las etapas del ciclo de vida de una planta.',
    secuencia: ['Semilla', 'Plántula', 'Planta adulta', 'Flor y fruto'],
    explicacion: 'La semilla germina, crece como plántula, se desarrolla en planta adulta y produce flor y fruto.',
  },
  {
    id: 'p-nat-04', grado: '2', materia: 'Ciencias Naturales', tema: 'Estados del agua', tipo: 'multiple', dificultad: 1,
    enunciado: 'El hielo es agua en estado…',
    opciones: ['líquido', 'sólido', 'gaseoso', 'plasma'], correcta: 1,
    explicacion: 'A baja temperatura el agua se congela y pasa al estado sólido: el hielo.',
  },
  {
    id: 'p-nat-05', grado: '3', materia: 'Ciencias Naturales', tema: 'Cadena alimenticia', tipo: 'ordenar', dificultad: 2,
    enunciado: 'Ordena la cadena alimenticia, del productor al depredador.',
    secuencia: ['Planta', 'Conejo', 'Zorro', 'Águila'],
    explicacion: 'La energía empieza en las plantas (productores) y pasa a herbívoros y luego a carnívoros.',
  },
  {
    id: 'p-nat-06', grado: '3', materia: 'Ciencias Naturales', tema: 'Sistema digestivo', tipo: 'multiple', dificultad: 2,
    enunciado: '¿En qué órgano se absorben la mayoría de los nutrientes?',
    opciones: ['El estómago', 'El intestino delgado', 'El esófago', 'La boca'], correcta: 1,
    explicacion: 'En el intestino delgado ocurre la absorción de los nutrientes hacia la sangre.',
  },
  {
    id: 'p-nat-07', grado: '4', materia: 'Ciencias Naturales', tema: 'Fuerza y movimiento', tipo: 'boolean', dificultad: 1,
    enunciado: 'La gravedad es la fuerza que atrae los objetos hacia la Tierra.',
    correcta: true,
    explicacion: 'La gravedad atrae los cuerpos hacia el centro de la Tierra; por eso caen los objetos.',
  },
  {
    id: 'p-nat-08', grado: '4', materia: 'Ciencias Naturales', tema: 'Ecosistemas colombianos', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuál de estos ecosistemas colombianos tiene mayor biodiversidad?',
    opciones: ['El desierto de la Tatacoa', 'La selva amazónica', 'Los páramos', 'Las playas'], correcta: 1,
    explicacion: 'La selva amazónica es uno de los lugares con mayor biodiversidad del planeta.',
  },
  {
    id: 'p-nat-09', grado: '5', materia: 'Ciencias Naturales', tema: 'La célula', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuál es la unidad básica de todos los seres vivos?',
    opciones: ['El átomo', 'La célula', 'El tejido', 'El órgano'], correcta: 1,
    explicacion: 'La célula es la unidad estructural y funcional más pequeña de los seres vivos.',
  },
  {
    id: 'p-nat-10', grado: '5', materia: 'Ciencias Naturales', tema: 'La electricidad', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuál de los siguientes materiales conduce la electricidad?',
    opciones: ['La madera', 'El plástico', 'El cobre', 'El vidrio'], correcta: 2,
    explicacion: 'Los metales como el cobre son buenos conductores; la madera, el plástico y el vidrio son aislantes.',
  },

  /* ================= CIENCIAS NATURALES · SECUNDARIA ================= */
  {
    id: 'p-nat-11', grado: '6', materia: 'Ciencias Naturales', tema: 'La célula', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Qué organelo se encarga de producir la energía de la célula?',
    opciones: ['El núcleo', 'La mitocondria', 'El ribosoma', 'La vacuola'], correcta: 1,
    explicacion: 'La mitocondria realiza la respiración celular y produce energía (ATP). Es la "central energética".',
  },
  {
    id: 'p-nat-12', grado: '6', materia: 'Ciencias Naturales', tema: 'Reinos de la naturaleza', tipo: 'multiple', dificultad: 2,
    enunciado: 'Las bacterias pertenecen al reino…',
    opciones: ['Fungi', 'Mónera', 'Protista', 'Animal'], correcta: 1,
    explicacion: 'El reino Mónera agrupa a los organismos procariotas, como las bacterias.',
  },
  {
    id: 'p-nat-13', grado: '7', materia: 'Ciencias Naturales', tema: 'La fotosíntesis', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Qué gas liberan las plantas durante la fotosíntesis?',
    opciones: ['Dióxido de carbono', 'Oxígeno', 'Nitrógeno', 'Hidrógeno'], correcta: 1,
    explicacion: 'Las plantas toman CO₂ y liberan oxígeno (O₂), esencial para la vida en la Tierra.',
  },
  {
    id: 'p-nat-14', grado: '7', materia: 'Ciencias Naturales', tema: 'Reproducción humana', tipo: 'boolean', dificultad: 1,
    enunciado: 'El óvulo es la célula sexual femenina.',
    correcta: true,
    explicacion: 'El óvulo es el gameto femenino; el espermatozoide es el gameto masculino.',
  },
  {
    id: 'p-nat-15', grado: '8', materia: 'Ciencias Naturales', tema: 'Genética', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cómo se llaman las unidades que transmiten la herencia?',
    opciones: ['Las células', 'Los genes', 'Las proteínas', 'Las hormonas'], correcta: 1,
    explicacion: 'Los genes son segmentos de ADN que contienen la información hereditaria.',
  },
  {
    id: 'p-nat-16', grado: '8', materia: 'Ciencias Naturales', tema: 'Tabla periódica', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuál es el símbolo químico del oro?',
    opciones: ['Or', 'Au', 'Ag', 'Go'], correcta: 1,
    explicacion: 'El símbolo del oro es Au, del latín "aurum". Ag es la plata.',
  },
  {
    id: 'p-nat-17', grado: '8', materia: 'Ciencias Naturales', tema: 'Enlaces químicos', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Qué tipo de enlace forma el cloruro de sodio (NaCl)?',
    opciones: ['Covalente', 'Iónico', 'Metálico', 'Puente de hidrógeno'], correcta: 1,
    explicacion: 'El sodio cede un electrón al cloro, formando iones con cargas opuestas: enlace iónico.',
  },
  {
    id: 'p-nat-18', grado: '8', materia: 'Ciencias Naturales', tema: 'Leyes de Newton', tipo: 'multiple', dificultad: 3,
    enunciado: 'La ley que dice "a toda acción corresponde una reacción igual y opuesta" es la…',
    opciones: ['primera ley', 'segunda ley', 'tercera ley', 'ley de gravitación'], correcta: 2,
    explicacion: 'Es la tercera ley de Newton: las fuerzas siempre aparecen en pares de acción y reacción.',
  },
  {
    id: 'p-nat-19', grado: '9', materia: 'Ciencias Naturales', tema: 'ADN y herencia', tipo: 'emparejar', dificultad: 3,
    enunciado: 'Une cada base nitrogenada con su par complementario en el ADN.',
    pares: [
      { izq: 'Adenina', der: 'Timina' },
      { izq: 'Citosina', der: 'Guanina' },
      { izq: 'Timina', der: 'Adenina' },
    ],
    explicacion: 'En el ADN la adenina siempre se une con la timina, y la citosina con la guanina.',
  },
  {
    id: 'p-nat-20', grado: '9', materia: 'Ciencias Naturales', tema: 'Mol y estequiometría', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Cuál es la masa molar del agua (H₂O)?',
    opciones: ['16 g/mol', '18 g/mol', '20 g/mol', '2 g/mol'], correcta: 1,
    explicacion: 'H = 1 g/mol (×2 = 2) y O = 16 g/mol. Total: 2 + 16 = 18 g/mol.',
  },
  {
    id: 'p-nat-21', grado: '9', materia: 'Ciencias Naturales', tema: 'Cinemática', tipo: 'corta', dificultad: 3,
    enunciado: 'Un corredor recorre 100 m en 20 s. ¿Cuál es su velocidad? (escribe el valor; por ejemplo: 4 m/s)',
    respuestas: ['5 m/s', '5m/s', '5'],
    explicacion: 'Velocidad = distancia ÷ tiempo = 100 m ÷ 20 s = 5 m/s.',
  },
  {
    id: 'p-nat-22', grado: '9', materia: 'Ciencias Naturales', tema: 'Electricidad', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuál es la unidad de la resistencia eléctrica?',
    opciones: ['Voltio', 'Amperio', 'Ohmio', 'Vatio'], correcta: 2,
    explicacion: 'La resistencia se mide en ohmios (Ω). Voltio es tensión y amperio es corriente.',
  },
  {
    id: 'p-qui-01', grado: '10', materia: 'Química', tema: 'Estructura atómica', tipo: 'multiple', dificultad: 2,
    enunciado: 'El número atómico de un elemento indica la cantidad de…',
    opciones: ['neutrones', 'protones', 'electrones de valencia', 'isótopos'], correcta: 1,
    explicacion: 'El número atómico (Z) es el número de protones del núcleo y define al elemento.',
  },
  {
    id: 'p-qui-02', grado: '10', materia: 'Química', tema: 'Soluciones', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuál sustancia se conoce como el "disolvente universal"?',
    opciones: ['El alcohol', 'El agua', 'El aceite', 'El ácido clorhídrico'], correcta: 1,
    explicacion: 'El agua disuelve gran cantidad de sustancias, por eso se le llama disolvente universal.',
  },
  {
    id: 'p-qui-03', grado: '11', materia: 'Química', tema: 'Ácidos y bases', tipo: 'multiple', dificultad: 2,
    enunciado: 'Una sustancia con pH menor que 7 es…',
    opciones: ['ácida', 'básica', 'neutra', 'alcalina'], correcta: 0,
    explicacion: 'pH < 7 es ácido, pH = 7 es neutro y pH > 7 es básico o alcalino.',
  },
  {
    id: 'p-fis-01', grado: '10', materia: 'Física', tema: 'Leyes de Newton', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuál expresión corresponde a la segunda ley de Newton?',
    opciones: ['F = m·a', 'E = m·c²', 'V = I·R', 'F = m/a'], correcta: 0,
    explicacion: 'La fuerza neta es igual a la masa por la aceleración: F = m·a.',
  },
  {
    id: 'p-fis-02', grado: '11', materia: 'Física', tema: 'Ondas', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuál es la unidad de la frecuencia?',
    opciones: ['Metro', 'Segundo', 'Hercio', 'Newton'], correcta: 2,
    explicacion: 'La frecuencia se mide en hercios (Hz): cantidad de ciclos por segundo.',
  },
  {
    id: 'p-fis-03', grado: '11', materia: 'Física', tema: 'Termodinámica', tipo: 'multiple', dificultad: 3,
    enunciado: 'La primera ley de la termodinámica expresa la conservación de…',
    opciones: ['la masa', 'la energía', 'el volumen', 'la temperatura'], correcta: 1,
    explicacion: 'La energía no se crea ni se destruye, solo se transforma: principio de conservación de la energía.',
  },
  {
    id: 'p-bio-01', grado: '10', materia: 'Biología', tema: 'Evolución', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Quién propuso la teoría de la selección natural?',
    opciones: ['Gregor Mendel', 'Charles Darwin', 'Louis Pasteur', 'Robert Hooke'], correcta: 1,
    explicacion: 'Charles Darwin explicó la evolución mediante la selección natural en "El origen de las especies".',
  },
  {
    id: 'p-bio-02', grado: '11', materia: 'Biología', tema: 'Biotecnología', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Qué técnica permite modificar el ADN de un organismo?',
    opciones: ['La fotosíntesis', 'La ingeniería genética', 'La fermentación', 'La respiración'], correcta: 1,
    explicacion: 'La ingeniería genética manipula el ADN para modificar características de un organismo.',
  },

  /* ================= CIENCIAS SOCIALES · PRIMARIA ================= */
  {
    id: 'p-soc-01', grado: '1', materia: 'Ciencias Sociales', tema: 'Mi familia', tipo: 'multiple', dificultad: 1,
    enunciado: '¿Cuál es el grupo más cercano donde aprendemos a convivir?',
    opciones: ['La familia', 'El estadio', 'La tienda', 'El parque'], correcta: 0,
    explicacion: 'La familia es el primer grupo social donde aprendemos normas, valores y afecto.',
  },
  {
    id: 'p-soc-02', grado: '2', materia: 'Ciencias Sociales', tema: 'Símbolos patrios', tipo: 'multiple', dificultad: 1,
    enunciado: '¿Cuáles son los colores de la bandera de Colombia?',
    opciones: ['Verde, blanco y rojo', 'Amarillo, azul y rojo', 'Azul, blanco y rojo', 'Amarillo, verde y azul'], correcta: 1,
    explicacion: 'La bandera de Colombia tiene franjas amarilla, azul y roja.',
  },
  {
    id: 'p-soc-03', grado: '2', materia: 'Ciencias Sociales', tema: 'Puntos cardinales', tipo: 'multiple', dificultad: 1,
    enunciado: '¿Por dónde sale el sol?',
    opciones: ['Norte', 'Sur', 'Oriente', 'Occidente'], correcta: 2,
    explicacion: 'El sol sale por el oriente (este) y se oculta por el occidente (oeste).',
  },
  {
    id: 'p-soc-04', grado: '3', materia: 'Ciencias Sociales', tema: 'Regiones de Colombia', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cuántas regiones naturales tiene Colombia?',
    opciones: ['4', '5', '6', '8'], correcta: 2,
    explicacion: 'Colombia tiene 6 regiones naturales: Caribe, Pacífica, Andina, Orinoquía, Amazonía e Insular.',
  },
  {
    id: 'p-soc-05', grado: '3', materia: 'Ciencias Sociales', tema: 'Departamentos y capitales', tipo: 'emparejar', dificultad: 2,
    enunciado: 'Une cada departamento con su capital.',
    pares: [
      { izq: 'Antioquia', der: 'Medellín' },
      { izq: 'Valle del Cauca', der: 'Cali' },
      { izq: 'Atlántico', der: 'Barranquilla' },
    ],
    explicacion: 'Cada departamento de Colombia tiene una ciudad capital donde está su gobierno.',
  },
  {
    id: 'p-soc-06', grado: '4', materia: 'Ciencias Sociales', tema: 'Época precolombina', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Qué cultura precolombina construyó Ciudad Perdida (Teyuna) en la Sierra Nevada?',
    opciones: ['Los Muiscas', 'Los Tayronas', 'Los Quimbayas', 'Los Calimas'], correcta: 1,
    explicacion: 'Los Tayronas construyeron Ciudad Perdida, en la Sierra Nevada de Santa Marta.',
  },
  {
    id: 'p-soc-07', grado: '4', materia: 'Ciencias Sociales', tema: 'Derechos de los niños', tipo: 'boolean', dificultad: 1,
    enunciado: 'Todos los niños y niñas tienen derecho a la educación.',
    correcta: true,
    explicacion: 'La educación es un derecho fundamental de todos los niños y niñas.',
  },
  {
    id: 'p-soc-08', grado: '4', materia: 'Ciencias Sociales', tema: 'Regiones naturales', tipo: 'multiple', dificultad: 2,
    enunciado: 'La región de los Llanos Orientales se llama…',
    opciones: ['Andina', 'Orinoquía', 'Pacífica', 'Insular'], correcta: 1,
    explicacion: 'Los Llanos Orientales hacen parte de la región de la Orinoquía.',
  },
  {
    id: 'p-soc-09', grado: '5', materia: 'Ciencias Sociales', tema: 'Independencia de Colombia', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Qué se celebra el 20 de julio en Colombia?',
    opciones: ['La batalla de Boyacá', 'El grito de independencia', 'La Constitución de 1991', 'El día de la raza'], correcta: 1,
    explicacion: 'El 20 de julio de 1810 se dio el Grito de Independencia en Santa Fe (hoy Bogotá).',
  },
  {
    id: 'p-soc-10', grado: '5', materia: 'Ciencias Sociales', tema: 'Constitución de 1991', tipo: 'multiple', dificultad: 3,
    enunciado: 'Según la Constitución de 1991, Colombia es un Estado…',
    opciones: ['monárquico', 'social de derecho, unitario y descentralizado', 'federal', 'confederado'], correcta: 1,
    explicacion: 'El artículo 1 declara a Colombia como Estado social de derecho, unitario, descentralizado y con autonomía de sus entidades territoriales.',
  },

  /* ================= CIENCIAS SOCIALES · SECUNDARIA ================= */
  {
    id: 'p-soc-11', grado: '6', materia: 'Ciencias Sociales', tema: 'Mesopotamia y Egipto', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Qué civilización inventó la escritura cuneiforme?',
    opciones: ['Egipto', 'Mesopotamia', 'Grecia', 'China'], correcta: 1,
    explicacion: 'La escritura cuneiforme nació en Mesopotamia, sobre tablillas de arcilla.',
  },
  {
    id: 'p-soc-12', grado: '6', materia: 'Ciencias Sociales', tema: 'Grecia y Roma', tipo: 'multiple', dificultad: 2,
    enunciado: '¿En qué ciudad griega nació la democracia?',
    opciones: ['Esparta', 'Atenas', 'Roma', 'Corinto'], correcta: 1,
    explicacion: 'En Atenas, durante el siglo V a. C., los ciudadanos participaban en la toma de decisiones.',
  },
  {
    id: 'p-soc-13', grado: '7', materia: 'Ciencias Sociales', tema: 'Descubrimiento de América', tipo: 'multiple', dificultad: 2,
    enunciado: '¿En qué año llegó Cristóbal Colón a América?',
    opciones: ['1490', '1492', '1498', '1500'], correcta: 1,
    explicacion: 'El 12 de octubre de 1492 Colón llegó a América, cambiando la historia del mundo.',
  },
  {
    id: 'p-soc-14', grado: '7', materia: 'Ciencias Sociales', tema: 'La Colonia en América', tipo: 'boolean', dificultad: 3,
    enunciado: 'La mita era un sistema colonial en el que los indígenas debían trabajar para la Corona.',
    correcta: true,
    explicacion: 'La mita fue una forma de trabajo obligatorio indígena impuesta durante la Colonia.',
  },
  {
    id: 'p-soc-15', grado: '8', materia: 'Ciencias Sociales', tema: 'Revolución Industrial', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Qué invento impulsó la Revolución Industrial?',
    opciones: ['La máquina de vapor', 'El teléfono', 'La imprenta', 'El automóvil'], correcta: 0,
    explicacion: 'La máquina de vapor permitió mecanizar la producción y transformar la industria en el siglo XVIII.',
  },
  {
    id: 'p-soc-16', grado: '8', materia: 'Ciencias Sociales', tema: 'Las guerras mundiales', tipo: 'multiple', dificultad: 2,
    enunciado: '¿En qué año terminó la Segunda Guerra Mundial?',
    opciones: ['1918', '1939', '1945', '1950'], correcta: 2,
    explicacion: 'La Segunda Guerra Mundial terminó en 1945; la Primera había terminado en 1918.',
  },
  {
    id: 'p-soc-17', grado: '9', materia: 'Ciencias Sociales', tema: 'Constitución de 1991', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Qué mecanismo protege los derechos fundamentales de forma rápida en Colombia?',
    opciones: ['El referendo', 'La acción de tutela', 'El cabildo abierto', 'La consulta popular'], correcta: 1,
    explicacion: 'La acción de tutela (artículo 86) protege de inmediato los derechos fundamentales.',
  },
  {
    id: 'p-soc-18', grado: '9', materia: 'Ciencias Sociales', tema: 'El Frente Nacional', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Qué fue el Frente Nacional en Colombia?',
    opciones: ['Una guerra civil', 'Un acuerdo entre los partidos Liberal y Conservador', 'Una constitución', 'Un movimiento indígena'], correcta: 1,
    explicacion: 'Fue un acuerdo (1958-1974) para alternar el poder entre liberales y conservadores.',
  },
  {
    id: 'p-soc-19', grado: '10', materia: 'Ciencias Sociales', tema: 'La Guerra Fría', tipo: 'multiple', dificultad: 2,
    enunciado: 'La Guerra Fría enfrentó principalmente a…',
    opciones: ['Alemania y Francia', 'Estados Unidos y la Unión Soviética', 'China y Japón', 'Inglaterra y España'], correcta: 1,
    explicacion: 'Fue la tensión política y militar entre el bloque capitalista (EE. UU.) y el comunista (URSS).',
  },
  {
    id: 'p-soc-20', grado: '10', materia: 'Ciencias Sociales', tema: 'Economía y globalización', tipo: 'boolean', dificultad: 2,
    enunciado: 'La globalización reduce las barreras para el comercio y la comunicación entre países.',
    correcta: true,
    explicacion: 'La globalización interconecta economías, culturas y personas en todo el mundo.',
  },
  {
    id: 'p-soc-21', grado: '11', materia: 'Ciencias Sociales', tema: 'Derechos humanos', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Qué organización proclamó la Declaración Universal de los Derechos Humanos en 1948?',
    opciones: ['La ONU', 'La OEA', 'La Unión Europea', 'La OTAN'], correcta: 0,
    explicacion: 'La ONU aprobó la Declaración Universal de los Derechos Humanos el 10 de diciembre de 1948.',
  },
  {
    id: 'p-soc-22', grado: '11', materia: 'Ciencias Sociales', tema: 'Conflicto y paz', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Con qué grupo se firmó el Acuerdo de Paz de 2016 en Colombia?',
    opciones: ['ELN', 'FARC-EP', 'AUC', 'EPL'], correcta: 1,
    explicacion: 'El Acuerdo Final de 2016 se firmó entre el Gobierno colombiano y las FARC-EP.',
  },

  /* ================= INGLÉS · PRIMARIA ================= */
  {
    id: 'p-ing-01', grado: '1', materia: 'Inglés', tema: 'Colors (colores)', tipo: 'multiple', dificultad: 1,
    enunciado: '¿Qué significa "red" en español?',
    opciones: ['Azul', 'Rojo', 'Verde', 'Amarillo'], correcta: 1,
    explicacion: '"Red" significa rojo. "Blue" es azul y "green" es verde.',
  },
  {
    id: 'p-ing-02', grado: '1', materia: 'Inglés', tema: 'Numbers 1-10', tipo: 'emparejar', dificultad: 1,
    enunciado: 'Une el número en inglés con su cifra.',
    pares: [
      { izq: 'one', der: '1' },
      { izq: 'three', der: '3' },
      { izq: 'five', der: '5' },
    ],
    explicacion: 'En inglés: one (1), two (2), three (3), four (4), five (5).',
  },
  {
    id: 'p-ing-03', grado: '2', materia: 'Inglés', tema: 'The family', tipo: 'multiple', dificultad: 1,
    enunciado: '¿Qué significa "mother"?',
    opciones: ['Padre', 'Madre', 'Hermano', 'Abuelo'], correcta: 1,
    explicacion: '"Mother" es madre y "father" es padre.',
  },
  {
    id: 'p-ing-04', grado: '2', materia: 'Inglés', tema: 'Farm animals', tipo: 'multiple', dificultad: 1,
    enunciado: '¿Qué animal es "cow"?',
    opciones: ['Caballo', 'Vaca', 'Cerdo', 'Gallina'], correcta: 1,
    explicacion: '"Cow" es vaca, "horse" es caballo y "pig" es cerdo.',
  },
  {
    id: 'p-ing-05', grado: '3', materia: 'Inglés', tema: 'Days of the week', tipo: 'ordenar', dificultad: 2,
    enunciado: 'Ordena los días de la semana en inglés.',
    secuencia: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    explicacion: 'Los días en orden son Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.',
  },
  {
    id: 'p-ing-06', grado: '4', materia: 'Inglés', tema: 'Telling the time', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Qué hora es si dicen "It\'s half past three"?',
    opciones: ['3:00', '3:30', '2:30', '4:30'], correcta: 1,
    explicacion: '"Half past" significa "y media": 3:30.',
  },
  {
    id: 'p-ing-07', grado: '5', materia: 'Inglés', tema: 'Verb to be', tipo: 'multiple', dificultad: 2,
    enunciado: 'Completa: "She ___ a doctor".',
    opciones: ['am', 'is', 'are', 'be'], correcta: 1,
    explicacion: 'Con "she" usamos "is". El verbo to be es am (I), is (he/she/it), are (you/we/they).',
  },
  {
    id: 'p-ing-08', grado: '5', materia: 'Inglés', tema: 'Places in the city', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Qué significa "library"?',
    opciones: ['Librería', 'Biblioteca', 'Mercado', 'Hospital'], correcta: 1,
    explicacion: '"Library" es biblioteca. "Bookstore" es librería (donde se venden libros).',
  },

  /* ================= INGLÉS · SECUNDARIA ================= */
  {
    id: 'p-ing-09', grado: '6', materia: 'Inglés', tema: 'Present simple', tipo: 'multiple', dificultad: 2,
    enunciado: 'Completa: "He ___ soccer every day".',
    opciones: ['play', 'plays', 'playing', 'played'], correcta: 1,
    explicacion: 'En presente simple, con he/she/it se agrega "s": he plays.',
  },
  {
    id: 'p-ing-10', grado: '7', materia: 'Inglés', tema: 'Past simple', tipo: 'multiple', dificultad: 2,
    enunciado: 'Completa: "I ___ to the park yesterday".',
    opciones: ['go', 'goes', 'went', 'going'], correcta: 2,
    explicacion: 'El pasado de "go" es "went" (verbo irregular).',
  },
  {
    id: 'p-ing-11', grado: '7', materia: 'Inglés', tema: 'Modal verbs', tipo: 'multiple', dificultad: 3,
    enunciado: 'Para expresar obligación, completa: "You ___ study for the exam".',
    opciones: ['must', 'can', 'may', 'might'], correcta: 0,
    explicacion: '"Must" expresa obligación fuerte; "can" es habilidad y "may" es permiso.',
  },
  {
    id: 'p-ing-12', grado: '8', materia: 'Inglés', tema: 'Present perfect', tipo: 'multiple', dificultad: 3,
    enunciado: 'Completa: "I have ___ in Bogotá for ten years".',
    opciones: ['live', 'lived', 'living', 'lives'], correcta: 1,
    explicacion: 'El presente perfecto se forma con have/has + participio pasado: have lived.',
  },
  {
    id: 'p-ing-13', grado: '8', materia: 'Inglés', tema: 'Comparatives and superlatives', tipo: 'multiple', dificultad: 2,
    enunciado: 'Completa: "Everest is the ___ mountain in the world".',
    opciones: ['taller', 'tallest', 'tall', 'more tall'], correcta: 1,
    explicacion: 'El superlativo de "tall" es "the tallest" (el más alto).',
  },
  {
    id: 'p-ing-14', grado: '9', materia: 'Inglés', tema: 'Passive voice', tipo: 'multiple', dificultad: 3,
    enunciado: 'Completa: "The book ___ written by García Márquez".',
    opciones: ['is', 'was', 'were', 'are'], correcta: 1,
    explicacion: 'La voz pasiva usa be + participio. En pasado: was written.',
  },
  {
    id: 'p-ing-15', grado: '9', materia: 'Inglés', tema: 'Conditionals', tipo: 'multiple', dificultad: 3,
    enunciado: 'Completa: "If it rains, I ___ stay at home".',
    opciones: ['will', 'would', 'am', 'did'], correcta: 0,
    explicacion: 'En el primer condicional: If + presente simple, will + verbo.',
  },

  /* ================= FILOSOFÍA · 10° y 11° ================= */
  {
    id: 'p-fil-01', grado: '10', materia: 'Filosofía', tema: 'Origen de la filosofía', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Dónde y cuándo nace la filosofía occidental?',
    opciones: ['En Roma, siglo I d. C.', 'En Grecia, siglo VI a. C.', 'En Egipto, siglo X a. C.', 'En Francia, siglo XVIII'], correcta: 1,
    explicacion: 'La filosofía occidental nace en las colonias griegas de Jonia, en el siglo VI a. C., con los presocráticos.',
  },
  {
    id: 'p-fil-02', grado: '10', materia: 'Filosofía', tema: 'Filosofía antigua', tipo: 'multiple', dificultad: 2,
    enunciado: '¿Cómo se llama el método de preguntas con el que Sócrates hacía pensar a sus interlocutores?',
    opciones: ['Dialéctica hegeliana', 'Mayéutica', 'Método cartesiano', 'Silogismo'], correcta: 1,
    explicacion: 'La mayéutica es el arte de "dar a luz" las ideas mediante preguntas.',
  },
  {
    id: 'p-fil-03', grado: '10', materia: 'Filosofía', tema: 'Lógica', tipo: 'boolean', dificultad: 3,
    enunciado: 'En un silogismo válido, si las premisas son verdaderas, la conclusión es necesariamente verdadera.',
    correcta: true,
    explicacion: 'La validez lógica garantiza que de premisas verdaderas se sigue una conclusión verdadera.',
  },
  {
    id: 'p-fil-04', grado: '11', materia: 'Filosofía', tema: 'Filosofía moderna', tipo: 'multiple', dificultad: 2,
    enunciado: '¿A qué filósofo pertenece la frase "Pienso, luego existo"?',
    opciones: ['Platón', 'René Descartes', 'Immanuel Kant', 'Karl Marx'], correcta: 1,
    explicacion: 'Descartes la propuso en "El discurso del método" como certeza fundamental.',
  },
  {
    id: 'p-fil-05', grado: '11', materia: 'Filosofía', tema: 'Ética y política', tipo: 'multiple', dificultad: 3,
    enunciado: '¿Qué autor escribió "El príncipe", obra clásica sobre el poder político?',
    opciones: ['Aristóteles', 'Nicolás Maquiavelo', 'John Locke', 'Jean-Jacques Rousseau'], correcta: 1,
    explicacion: 'Maquiavelo analizó cómo se conquista y se conserva el poder en "El príncipe" (1513).',
  },
  {
    id: 'p-fil-06', grado: '11', materia: 'Filosofía', tema: 'Filosofía de la ciencia', tipo: 'ordenar', dificultad: 3,
    enunciado: 'Ordena los pasos del método científico.',
    secuencia: ['Observación', 'Hipótesis', 'Experimentación', 'Conclusión'],
    explicacion: 'El método científico parte de la observación, formula hipótesis, experimenta y concluye.',
  },
]

/** Filtra el banco por grado y, opcionalmente, materia y tema. */
export function filtrarBanco({ grado, materia, tema } = {}) {
  return BANCO.filter(
    (p) =>
      (!grado || String(p.grado) === String(grado)) &&
      (!materia || p.materia === materia) &&
      (!tema || p.tema === tema)
  )
}

/** Cantidad de preguntas por combinación grado + materia. */
export function resumenBanco() {
  const mapa = {}
  for (const p of BANCO) {
    const clave = `${p.grado}|${p.materia}`
    mapa[clave] = (mapa[clave] || 0) + 1
  }
  return mapa
}
