# CABRA — web de marca

Adaptación de la landing al sistema visual real de CABRA (cabra.design):
mismo estudio, misma tipografía y misma escala tipográfica, con una capa de
interacción propia.

## Sistema de marca

- **Paleta:** `#F0F0F0` fondo, `#2A2A2A` texto, `#1A1919` superficies oscuras,
  `#FFFFFF` y `#E7E7E7` superficies. **El color lo ponen las fotos**, no la UI.
- **Tipografía:** PP Neue Montreal (`Book 400`, `Medium 500`, `Bold 700`).
  Display en mayúsculas a 400, palabras clave a 700, micro-etiquetas
  mayúsculas con tracking.
- **Logo:** SVG exacto de cabra.design (el mismo wordmark de las dos imágenes),
  inline con `currentColor`, por lo que cambia de blanco a tinta sin duplicar
  archivos. El favicon usa la «C» del logo.
- **Botones:** pills outlined o blancas, texto en mayúsculas y flecha `→`.
- **Cursor:** en desktop, punto + anillo con `mix-blend-mode: difference`
  (se invierte según el fondo), crece en enlaces/botones y se achica al clic. En
  táctil y `prefers-reduced-motion` se queda el cursor nativo.
- **Header:** transparente sobre el hero y sobre la sección de servicios
  (texto blanco), claro al hacer scroll en el resto y oscuro sobre contacto/footer.
- **Hero:** pase automático de tres proyectos reales (PEPITU, Cafès Serra y
  Althaia) con crossfade lento, etiqueta de proyecto, tres segmentos clicables y
  pausa/reanudar. Se detiene al salir de pantalla o al ocultar la pestaña; con
  `prefers-reduced-motion` se queda en una imagen estática.
- **Estudio:** carrusel de clientes en tres filas, con máscaras de degradado a
  los lados y velocidades y direcciones distintas. Los logos son los reales de
  cabra.design/about, en negro y WebP.
- **Servicios:** cuatro imágenes de fondo a pantalla completa con overlay y
  crossfade entre servicios; lista de servicios a la izquierda (activo 100%,
  inactivos 50%); bloque editorial a la derecha sin tarjeta: una frase, los
  conceptos en una línea y un enlace al caso representativo. Sin miniaturas de
  casos para no repetir las imágenes de la parrilla. Barra inferior de 4 tramos
  clicables.
- **Footer:** Hablemos + CTA + dos columnas de enlaces (Subvención Kit Digital,
  Instagram, Privacidad / Estudio, Casos, Contacto) + wordmark CABRA a todo el
  ancho + fila inferior con copyright, ubicación, email y volver arriba.
- **Sin ruido:** se han eliminado etiquetas de sección numeradas, ticker,
  estrellas decorativas, contadores de servicio/caso, pills de disponibilidad,
  hints de scroll, años en tarjetas y microcopys de agencia. La estructura se
  apoya en los titulares, los tabs y los datos.
- **Contenido:** el sitio actual es monocromo y deja que las imágenes de los
  proyectos aporten el color; esta versión mantiene esa regla.

## Archivos

| Archivo | Qué contiene |
|---|---|
| `index.html` | Estructura, logo SVG inline y contenido |
| `styles.css` | Sistema visual, servicios, responsive y reduced motion |
| `app.js` | Pinning, crossfade de servicios, tabs, filtros, contadores, overlay, menú y header adaptativo |
| `assets/fonts/` | PP Neue Montreal (Book, Medium, Bold) |
| `assets/kit-digital-logos.webp` | Franja oficial del programa Kit Digital |
| `kit-digital.html` | Página de Subvención Kit Digital |
| `kit-digital.css` | Estilos propios de la página de Kit Digital |
| `kit-digital.js` | Header, menú, índice sticky, cursor y año |
| `assets/favicon.svg` | Favicon generado con la «C» del logo |
| `assets/*.webp` | Hero (3 pases), covers y galerías de los 6 proyectos reales |
| `assets/logos/` | 12 logos de clientes en negro y WebP para el carrusel del estudio |
| `assets/althaia.mp4` | Vídeo de Althaia para el hero y el detalle del caso |
| `prototype-v1.html` | El prototipo original, intacto |
| `css_variables.css`, `design_tokens.json`, `tailwind.css`, `DESIGN.md` | Tokens del primer encargo; **no los usa esta versión** |

- **Kit Digital:** página propia en `kit-digital.html` con el contenido de la
  web anterior: importes, límites, servicios, ventajas y requisitos. El enlace
  del footer de la home ya apunta a ella.

## Ver en local

```bash
python3 -m http.server 8899
```

Abrir `http://127.0.0.1:8899/`.

## Dónde tocar el contenido

- **Casos:** las tarjetas `.case-card` llevan `data-title`, `data-sector`,
  `data-service`, `data-year`, `data-result` y `data-desc`; el overlay lee esos
  atributos. Los `.panel` destacados solo necesitan `data-case`. El detalle largo
  (reto, idea, resultado y galería) está en `CASE_DETAILS` dentro de `app.js`.
  Las galerías admiten imágenes y vídeos: un elemento con
  `{ type: 'video', src, poster }` se renderiza como `<video>` controlable. Si el
  caso define `video: { src, poster }`, ese vídeo se reproduce como fondo del
  hero del detalle (Althaia).
- **Clientes:** los logos del carrusel están en `.intro-clients`; cada fila es
  un `.logo-row` con dos `.logo-set` idénticos para el bucle. Para añadir una
  marca, duplicar su `.logo-item` en los dos sets de la fila.
- **Cifras:** `data-count` y `data-suffix` en `#cifras`.
- **Servicios:** textos y conceptos en `#panel-0` a `#panel-3`. Cada panel usa
  `.svc-copy` y un `.svc-link` con `data-case` que abre el caso en el overlay.
  Las imágenes de fondo son `.svc-bg--marcas`, `--web`, `--redes` y
  `--publicidad` dentro de `.services-bgs`; se cambian con `data-service` en
  `#servicios`. La barra inferior son cuatro `.svc-seg` clicables.
- **Imágenes:** hero 2400×1350 y casos 1600×1100. Sustituir manteniendo recorte.
- **Emails/redes:** `hola@cabra.design` y Navàs & Barcelona; las redes están
  como `#` a la espera de los enlaces definitivos.
- **Filtros:** los `<sup>` de `#filters` se calculan automáticamente desde las tarjetas; los filtros sin casos se ocultan.

## Notas de producción

- **Fuente:** los `.otf` de PP Neue Montreal vienen del zip facilitado por el
  estudio. Revisar la licencia antes de publicar. El sitio actual usa Founders
  Grotesk; se ha aplicado PP Neue Montreal por ser el archivo entregado. Si se
  quiere clavar Founders Grotesk, hace falta su archivo/licencia.
- **Logo:** el SVG se ha extraído del propio cabra.design, por lo que es el
  wordmark exacto. Las dos imágenes del logo son el mismo lockup en blanco y
  negro.
- **Contenido real:** los seis casos son proyectos reales extraídos de
  `cabra.design/projects/`: PEPITU, Cafès Serra, Sikkema, Althaia, Parc Sanitari
  SJD y Clínica Dental Basterretxea. Se han descargado sus fotos y el vídeo de
  Althaia, y se han adaptado al español los textos de sus páginas. No quedan
  casos de demostración en la web.
  Fuente: `cabra.design/projects/` y las fichas `/pepitu-manresa/`,
  `/cafes-serra/`, `/sikkema/`, `/althaia/`, `/parc-sanitari/` y
  `/paco-munoz-awards/`. Los logos de clientes vienen de `cabra.design/about/`.
- **Fotos:** las imágenes de los seis proyectos reales vienen de cabra.design y
  se han convertido a WebP; las fotos se recortan a 1600×1100 (salvo el cover
  vertical de Cafès Serra). La galería del detalle usa `object-fit: cover` para
  que cualquier imagen llene su marco sin bandas ni ajustes por caso.
- **Años:** los años de los proyectos reales se han tomado de las fechas de
  publicación de sus imágenes; conviene confirmarlos con el estudio.
- Revisado a 1440, 1024, 768 y 390 px, sin overflow, con `prefers-reduced-motion`
  y sin dependencias de JavaScript externas.

## Próximos pasos

- Añadir más proyectos reales de cabra.design al archivo.
- Añadir páginas de proyecto/estudio o integrar un CMS.
- Enlazar Instagram y el resto de redes reales.
- Formulario de contacto real o Cal.com.
- Decidir si se quiere una versión en inglés, como la web actual.
