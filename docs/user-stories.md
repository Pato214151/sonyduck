# Historias de Usuario - SonYDuck

## Formato de Historia
```
COMO [usuario]
QUIERO [acción]
PARA [beneficio]
```

### Criterios de Aceptación
- Condiciones que DEBEN cumplirse para considerar la historia completa
- Verificables mediante tests o revisión

---

## 🔐 Autenticación

### US-001: Registro de Usuario
```
COMO visitante
QUIERO crear una cuenta con mi email y contraseña
PARA poder acceder a la plataforma y personalizar mi experiencia

CRITERIOS DE ACEPTACIÓN:
✓ Veo un formulario de registro con campos: nombre, email, contraseña, confirmar contraseña
✓ El campo email valida formato válido
✓ La contraseña requiere mínimo 8 caracteres, 1 número y 1 mayúscula
✓ Veo mensajes de error inline cuando los campos no cumplen los requisitos
✓ Al registrarme exitosamente, soy redirigido automáticamente a la página principal
✓ Mi contraseña está hasheada en la base de datos (nunca se almacena en texto plano)
✓ Si el email ya existe, veo el mensaje "Este email ya está registrado"
```

### US-002: Iniciar Sesión
```
COMO usuario registrado
QUIERO iniciar sesión con mi email y contraseña
PARA acceder a mi cuenta y biblioteca personal

CRITERIOS DE ACEPTACIÓN:
✓ Veo un formulario de login con campos: email y contraseña
✓ Tengo la opción de "Recordarme" para mantener la sesión
✓ Al iniciar sesión correctamente, soy redirigido a la página principal (Home)
✓ Si las credenciales son incorrectas, veo "Email o contraseña incorrectos"
✓ Si no estoy registrado, veo un enlace a la página de registro
✓ El sistema me da un token de acceso válido (JWT)
```

### US-003: Cerrar Sesión
```
COMO usuario logueado
QUIERO cerrar sesión
PARA desconectarme de mi cuenta en el dispositivo actual

CRITERIOS DE ACEPTACIÓN:
✓ Al hacer clic en mi avatar, veo la opción "Cerrar sesión"
✓ Al cerrar sesión, soy redirigido a la página de login
✓ El token es eliminado del almacenamiento local
✓ No puedo acceder a páginas protegidas sin volver a iniciar sesión
```

### US-004: Persistencia de Sesión
```
COMO usuario que marcó "Recordarme"
QUIERO que mi sesión persista al cerrar el navegador
PARA no tener que iniciar sesión cada vez que visite la app

CRITERIOS DE ACEPTACIÓN:
✓ Al cerrar y reopen el navegador, permanezco logueado
✓ El refresh token es válido por 7 días
✓ Puedo usar la app normalmente sin interrupciones
```

---

## 🎵 Reproducción de Música

### US-010: Reproducir una Canción
```
COMO usuario
QUIERO hacer clic en el botón de play de una canción
PARA escucharla inmediatamente

CRITERIOS DE ACEPTACIÓN:
✓ Al hacer clic en play, la canción comienza a sonar inmediatamente
✓ El reproductor (player bar) muestra la información de la canción actual
✓ El botón de la canción cambia de play a pause
✓ La barra de progreso comienza a avanzar
✓ La animación de sonido/ondas aparece en el reproductor
```

### US-011: Pausar Reproducción
```
COMO usuario
QUIERO pausar la canción que está sonando
PARA poder detener la música temporalmente

CRITERIOS DE ACEPTACIÓN:
✓ Al hacer clic en pause, la música se detiene inmediatamente
✓ El botón pause cambia a play en el reproductor
✓ La barra de progreso se detiene
✓ Puedo resume la reproducción haciendo clic en play
```

### US-012: Avanzar a Siguiente Canción
```
COMO usuario
QUIERO pasar a la siguiente canción
PARA continuar escuchando sin intervención manual

CRITERIOS DE ACEPTACIÓN:
✓ Al hacer clic en "Next", la canción actual se detiene y comienza la siguiente
✓ La cola de reproducción avanza al siguiente índice
✓ El reproductor se actualiza con la nueva canción
✓ Si es la última canción de la cola, el botón "Next" está deshabilitado
```

### US-013: Volver a Canción Anterior
```
COMO usuario
QUIERO volver a la canción anterior
PARA re-escuchar una canción o continuar en orden

CRITERIOS DE ACEPTACIÓN:
✓ Al hacer clic en "Previous", suena la canción anterior
✓ Si la canción actual lleva más de 3 segundos, vuelvo a empezar la misma canción
✓ La cola de reproducción retrocede al índice anterior
```

### US-014: Barra de Progreso
```
COMO usuario
QUIERO ver y manipular la barra de progreso
PARA saber cuánto tiempo ha pasado y poder buscar en la canción

CRITERIOS DE ACEPTACIÓN:
✓ Veo una barra de progreso que avanza en tiempo real
✓ Al pasar el mouse sobre la barra, veo el timestamp (minutos:segundos)
✓ Puedo hacer clic en cualquier punto de la barra para ir a ese momento
✓ El formato de tiempo es MM:SS
```

### US-015: Control de Volumen
```
COMO usuario
QUIERO ajustar el volumen de reproducción
PARA escuchar la música más alta o más baja

CRITERIOS DE ACEPTACIÓN:
✓ Veo un control de volumen con slider
✓ Puedo arrastrar el slider para ajustar el volumen de 0% a 100%
✓ Hay un icono que cambia según el nivel (mute, low, medium, high)
✓ Puedo hacer clic en el icono para silenciar/activar sonido
```

### US-016: Modo Aleatorio (Shuffle)
```
COMO usuario
QUIERO activar el modo aleatorio
PARA escuchar mis canciones en orden diferente

CRITERIOS DE ACEPTACIÓN:
✓ Al hacer clic en shuffle, se activa el modo aleatorio
✓ El botón shuffle se ilumina en verde cuando está activo
✓ Las canciones se reproducen en orden aleatorio (no se repiten hasta pasar todas)
✓ Al desactivarlo, vuelve al orden original o continúa desde la canción actual
```

### US-017: Modo Repetición
```
COMO usuario
QUIERO elegir el modo de repetición
PARA repetir la lista actual o una canción

CRITERIOS DE ACEPTACIÓN:
✓ Al hacer clic repetidamente en repeat, ciclo entre: Off → Repetir Todo → Repetir Una
✓ El icono muestra el estado actual visualmente
✓ En "Repetir Una", la misma canción se repite infinitamente
✓ En "Repetir Todo", al terminar la lista vuelve al inicio
```

### US-018: Atajos de Teclado
```
COMO usuario experimentado
QUIERO usar atajos de teclado para controlar la música
PARA una experiencia más rápida sin usar el mouse

CRITERIOS DE ACEPTACIÓN:
✓ Space = Play/Pause
✓ Flecha Izquierda = Canción anterior
✓ Flecha Derecha = Siguiente canción
✓ Flecha Arriba = Subir volumen
✓ Flecha Abajo = Bajar volumen
✓ M = Silenciar/Activar sonido
✓ Los atajos funcionan incluso sin focus en elementos específicos
```

---

## 📚 Biblioteca y Contenido

### US-020: Explorar Página Principal (Home)
```
COMO usuario
QUIERO ver la página de inicio con contenido personalizado
PARA descubrir música y acceder rápidamente a lo que me gusta

CRITERIOS DE ACEPTACIÓN:
✓ Veo secciones: "Buenas tardes", "Reproducido recientemente", "Hecho para ti", "Tus playlists"
✓ Cada sección muestra cards de contenido relacionado
✓ Las cards muestran imagen, título y subtítulo
✓ Al hacer hover en una card, aparece un botón de reproducción
✓ Las secciones se pueden hacer scroll horizontalmente
```

### US-021: Ver Detalle de Álbum
```
COMO usuario
QUIERO hacer clic en un álbum para ver sus canciones
PARA explorar todo el contenido del álbum

CRITERIOS DE ACEPTACIÓN:
✓ Veo la portada grande del álbum en la parte superior
✓ Muestra: nombre del álbum, artista (clickeable), año de lanzamiento, número de canciones, duración total
✓ Veo la lista de canciones numerada con título y duración
✓ Puedo reproducir el álbum completo con el botón de play
✓ Puedo hacer shuffle del álbum
✓ Al hacer clic en el nombre del artista, voy a su página
```

### US-022: Ver Detalle de Artista
```
COMO usuario
QUIERO ver la página de un artista
PARA conocer más sobre el artista y su música

CRITERIOS DE ACEPTACIÓN:
✓ Veo la foto del artista (circular) y su nombre
✓ Veo contador de oyentes mensuales (fantasy)
✓ Veo sus canciones más populares (top 5)
✓ Veo su discografía (álbumes en grid)
✓ Puedo seguir/dejar de seguir al artista (futuro)
```

### US-023: Explorar Playlists
```
COMO usuario
QUIERO ver todas mis playlists en la biblioteca
PARA acceder rápidamente a mis listas de reproducción

CRITERIOS DE ACEPTACIÓN:
✓ Veo todas las playlists que he creado
✓ Cada playlist muestra: portada, nombre, número de canciones
✓ Puedo ordenar las playlists (recientes, alfabético)
✓ Al hacer clic en una playlist, voy a su página de detalle
```

### US-024: Ver Detalle de Playlist
```
COMO usuario
QUIERO ver el contenido de una playlist
PARA ver qué canciones contiene y reproducirla

CRITERIOS DE ACEPTACIÓN:
✓ Veo el header de la playlist: portada, nombre, propietario, canciones, duración
✓ Tengo botones de Play y Shuffle
✓ Veo la lista de canciones con: número, portada, título, artista, álbum, duración
✓ Puedo ordenar las canciones
✓ Si es mi playlist, puedo editarla y eliminar canciones
```

---

## ➕ Gestión de Playlists

### US-030: Crear Playlist
```
COMO usuario
QUIERO crear una nueva playlist
PARA organizar mis canciones favoritas

CRITERIOS DE ACEPTACIÓN:
✓ Veo un botón "Crear playlist" en la sidebar
✓ Al hacer clic, se abre un modal con campo para nombre
✓ El nombre es obligatorio (mínimo 1 carácter)
✓ Al crear, la playlist aparece inmediatamente en mi sidebar
✓ Soy redirigido a la página de la nueva playlist
```

### US-031: Editar Playlist
```
COMO usuario (propietario)
QUIERO editar los detalles de mi playlist
PARA personalizar su nombre, descripción o portada

CRITERIOS DE ACEPTACIÓN:
✓ Tengo acceso al botón de editar en la página de la playlist
✓ Puedo cambiar el nombre de la playlist
✓ Puedo agregar/editar la descripción
✓ Puedo cambiar la imagen de portada
✓ Los cambios se guardan inmediatamente
```

### US-032: Eliminar Playlist
```
COMO usuario (propietario)
QUIERO eliminar una playlist
PARA remover playlists que ya no necesito

CRITERIOS DE ACEPTACIÓN:
✓ Tengo acceso al botón de eliminar/editar en la playlist
✓ Al intentar eliminar, aparece confirmación
✓ Al confirmar, la playlist es eliminada
✓ Desaparece de mi sidebar y biblioteca
✓ No puedo acceder a ella por URL
```

### US-033: Agregar Canción a Playlist
```
COMO usuario
QUIERO agregar una canción a una playlist
PARA guardar canciones para escucharlas después

CRITERIOS DE ACEPTACIÓN:
✓ Al hacer clic en "..." o hover en una canción, veo opción "Agregar a playlist"
✓ Se abre un modal con lista de mis playlists
✓ Puedo seleccionar una o crear una nueva
✓ Veo confirmación "Canción agregada a [nombre playlist]"
✓ La playlist se actualiza con la nueva canción
```

### US-034: Eliminar Canción de Playlist
```
COMO usuario (propietario de playlist)
QUIERO eliminar una canción de mi playlist
PARA mantener mis playlists actualizadas

CRITERIOS DE ACEPTACIÓN:
✓ En la página de mi playlist, veo opción de eliminar en cada canción
✓ Al eliminar, la canción desaparece de la lista
✓ El contador de canciones se actualiza
✓ La canción no se elimina del sistema, solo de la playlist
```

---

## ❤️ Sistema de Favoritos

### US-040: Dar Like a una Canción
```
COMO usuario
QUIERO dar like a una canción
PARA guardarla en mi biblioteca de canciones favoritas

CRITERIOS DE ACEPTACIÓN:
✓ Al hacer clic en el icono de corazón (vacío), la canción recibe like
✓ El icono cambia a corazón lleno y se ilumina en verde
✓ La canción aparece en mi playlist "Me gusta"
✓ Veo un toast de confirmación "Agregado a Tus Me gusta"
```

### US-041: Quitar Like a una Canción
```
COMO usuario
QUIERO quitar el like de una canción
PARA remover canciones de mis favoritos

CRITERIOS DE ACEPTACIÓN:
✓ Al hacer clic en el corazón lleno, se quita el like
✓ El icono vuelve a corazón vacío
✓ La canción desaparece de "Me gusta"
✓ El like se sincroniza instantáneamente
```

### US-042: Ver Playlist "Me gusta"
```
COMO usuario
QUIERO ver todas mis canciones con like
PARA acceder rápidamente a mi biblioteca de favoritos

CRITERIOS DE ACEPTACIÓN:
✓ Veo una playlist especial "Me gusta" en mi sidebar
✓ Tiene un icono de corazón verde distintivo
✓ Al hacer clic, veo todas las canciones con like
✓ Puedo reproducir toda la lista
✓ El número de canciones se actualiza en tiempo real
```

---

## 🔍 Sistema de Búsqueda

### US-050: Buscar por Texto
```
COMO usuario
QUIERO buscar canciones, artistas o álbumes por texto
PARA encontrar rápidamente lo que busco

CRITERIOS DE ACEPTACIÓN:
✓ Tengo un campo de búsqueda en la barra superior
✓ La búsqueda tiene debounce de 300ms
✓ Los resultados se muestran por categorías (Songs, Artists, Albums, Playlists)
✓ Puedo hacer clic en cualquier resultado para ir a su detalle
✓ La búsqueda es case-insensitive
```

### US-051: Filtrar Resultados por Tipo
```
COMO usuario
QUIERO filtrar los resultados de búsqueda por tipo
PARA encontrar más rápido lo que necesito

CRITERIOS DE ACEPTACIÓN:
✓ Veo tabs: All, Songs, Artists, Albums, Playlists
✓ Al seleccionar una pestaña, solo se muestran resultados de ese tipo
✓ La pestaña activa está destacada visualmente
```

### US-052: Búsqueda Sin Resultados
```
COMO usuario
QUIERO ver un mensaje apropiado cuando no hay resultados
PARA saber que la búsqueda no encontró nada

CRITERIOS DE ACEPTACIÓN:
✓ Si no hay resultados, veo: "No se encontraron resultados para '[query]'"
✓ Veo sugerencias: "Intenta buscar el nombre de un artista o canción"
✓ Se muestra una ilustración o icono apropiado
```

---

## 👤 Perfil de Usuario

### US-060: Ver Mi Perfil
```
COMO usuario
QUIERO ver mi perfil con mi información
PARA verificar y gestionar mis datos

CRITERIOS DE ACEPTACIÓN:
✓ Veo mi avatar, nombre y email
✓ Veo estadísticas: playlists creadas, canciones con like
✓ Veo la lista de mis playlists
✓ Tengo acceso a editar mi perfil
```

### US-061: Editar Mi Perfil
```
COMO usuario
QUIERO editar mi nombre y avatar
PARA personalizar mi identidad en la plataforma

CRITERIOS DE ACEPTACIÓN:
✓ Puedo cambiar mi nombre
✓ Puedo cambiar mi avatar (subir imagen)
✓ Los cambios se guardan inmediatamente
✓ El cambio de avatar se refleja en toda la app
```

---

## 🎨 UI/UX y Estados

### US-070: Estados de Carga
```
COMO usuario
QUIERO ver indicadores de carga
PARA saber que el sistema está trabajando

CRITERIOS DE ACEPTACIÓN:
✓ Al cargar contenido, veo skeleton loaders
✓ Los skeletons tienen el mismo tamaño que el contenido real
✓ No se muestran datos vacíos o incorrectos durante la carga
```

### US-071: Estados Vacíos
```
COMO usuario
QUIERO ver mensajes informativos cuando no hay contenido
PARA entender por qué está vacío y qué hacer

CRITERIOS DE ACEPTACIÓN:
✓ Playlist vacía: "Esta playlist está vacía. ¡Agrega canciones!"
✓ Biblioteca vacía: "Crea tu primera playlist para empezar"
✓ Cada mensaje tiene un llamado a la acción claro
```

### US-072: Manejo de Errores
```
COMO usuario
QUIERO ver mensajes de error claros
PARA entender qué salió mal y cómo solucionarlo

CRITERIOS DE ACEPTACIÓN:
✓ Error de red: "No se pudo conectar. Verifica tu conexión. [Reintentar]"
✓ Error de servidor: "Algo salió mal. Intenta más tarde."
✓ Error 404: "Esta página no existe. [Ir al inicio]"
✓ Los errores aparecen en toast o modales, no en páginas rotas
```

---

## 📱 Responsive Design

### US-080: Adaptación Mobile
```
COMO usuario en dispositivo móvil
QUIERO que la interfaz se adapte a mi pantalla
PARA usar la app cómodamente en mi teléfono

CRITERIOS DE ACEPTACIÓN:
✓ En pantallas < 768px, la sidebar se oculta
✓ Tengo navegación inferior con: Home, Search, Library, Profile
✓ El reproductor se mantiene en la parte inferior
✓ Los cards se muestran en grid de 2 columnas
✓ Los textos y botones son táctilmente accesibles (mínimo 44px)
```

### US-081: Sidebar Colapsable en Tablet
```
COMO usuario en tablet
QUIERO poder colapsar la sidebar
PARA tener más espacio para el contenido

CRITERIOS DE ACEPTACIÓN:
✓ En pantallas 768-1200px, la sidebar puede colapsar a 72px
✓ Solo se muestran iconos cuando está colapsada
✓ Puedo expandirla haciendo hover o clic
```

---

## 📊 Criterios de Priorización

| Código | Historia | Prioridad | Estimación |
|--------|----------|-----------|------------|
| US-001 | Registro de Usuario | MUST | M |
| US-002 | Iniciar Sesión | MUST | S |
| US-010 | Reproducir Canción | MUST | M |
| US-011 | Pausar Reproducción | MUST | S |
| US-012 | Siguiente Canción | MUST | S |
| US-013 | Canción Anterior | MUST | S |
| US-014 | Barra de Progreso | SHOULD | M |
| US-015 | Control de Volumen | MUST | S |
| US-020 | Home Page | MUST | L |
| US-021 | Ver Álbum | MUST | M |
| US-022 | Ver Artista | SHOULD | M |
| US-030 | Crear Playlist | MUST | S |
| US-040 | Dar Like | MUST | S |
| US-050 | Buscar | SHOULD | L |
| US-070 | Loading States | MUST | M |
| US-072 | Error Handling | MUST | M |

---

*Historias de usuario: 2026-07-09*
*Total: 25 historias*
