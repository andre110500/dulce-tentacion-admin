# Panel de Admin - Dulce Tentación

## Funciones serverless

### `runBuild` — Rebuild del sitio Gatsby en Netlify

**Ubicación:** `src/functions/runBuild.tsx`

**Qué hace:** Hace POST a un build hook de Netlify para iniciar un rebuild automático del sitio de producción (Gatsby).

**Cuándo se ejecuta:** Siempre que un producto, sabor o descuento se crea, edita o elimina con éxito a través del Dialog (`tryToModifyDbWithAuth` → `runBuild()`). Se ejecuta sin `await` (fire-and-forget), el usuario no espera el rebuild.

**Múltiples cambios seguidos:** Si hacés varios cambios uno después del otro, cada uno dispara un build en Netlify. Netlify deduplica builds cercanos, así que no causa problemas — solo ejecuta el último build pendiente.

**Cuándo NO se ejecuta:**
- Si la API devuelve un error (403, validación, etc.)
- Si no hay JWT o el token es inválido
- Si falla la red

---

### `upload-menu` — Subida de imágenes a Cloudinary

**Ubicación:** `netlify/functions/upload-menu.js` (producción) / `vite.config.ts` middleware (desarrollo)

**Qué hace:** Recibe una imagen WebP en base64 y la sube a Cloudinary con `public_id: menu-${id}`, sobrescribiendo la anterior.

**Cuándo se ejecuta (automático):** Cuando el usuario edita/crea/elimina un item, el `callback` re-fetch de `tryToModifyDbWithAuth` actualiza `dbItemsArr` → `useLayoutEffect` en `MenuSection` detecta el cambio → compara el array anterior con el actual para identificar qué tipo de entidad cambió → sube **solo los menús afectados** a Cloudinary.

**Filtrado por tipo de entidad:**

| Tipo de entidad cambiada | Menús que se re-suben |
|--------------------------|----------------------|
| `ice-cream`, `add-on` | `ice-cream-menu` |
| `frozen-treat` | `frozen-treats-menu` |
| `drink`, `cigarette` | `drinks-cigarettes-menu` |
| `flavour` (sin campo `type`) | `flavours-menu-1`, `flavours-menu-2` |
| `discount` | `ice-cream-menu` |
| Tipo desconocido | No sube nada |

**Ejemplo:** Si editás un sabor en `#/sabores`, solo se re-suben `flavours-menu-1` y `flavours-menu-2`. Si editás un producto helado en `#/`, solo se re-suben `ice-cream-menu`.

**Cuándo se ejecuta (manual):** El botón "SUBIR MENÚ" en `MenuUploadSection` ejecuta `handleManualMenuUpload()` → `uploadMenus()` (sube solo los menús de esa sección, no los de otras páginas).

**Cuándo NO se ejecuta:**
- En el primer render de la página
- Si `dbItemsArr` está undefined (fetch pendiente)
- Si no se detectaron cambios en los datos
- En páginas "Otros" y "Descuentos" que usan `<Section>` en vez de `<MenuSection>`

---

### Resumen del flujo

```
Dialog submit/delete
  └─ tryToModifyDbWithAuth()
       ├─ [API call con JWT]
       │    ├─ éxito (200)
       │    │    ├─ callback(): re-fetch → setDbItemsArr()
       │    │    │    └─ MenuSection useLayoutEffect
       │    │    │         ├─ detecta tipos afectados (compara old vs new)
       │    │    │         ├─ filtra resolvedMenuIds por tipo
       │    │    │         └─ generateAndUploadMenu(ids filtrados) → Cloudinary  [AUTOMÁTICO]
       │    │    └─ runBuild()  [FIRE-AND-FORGET → Netlify rebuild]
       │    └─ error: NO runBuild, NO re-upload de menú
       └─ [error de red]: NO runBuild
```

## Variable de entorno (Cloudinary)

En desarrollo, las variables `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` son opcionales en `.env`. Si no existen, el middleware de Vite retorna un error 500 con mensaje descriptivo en vez de crashear el servidor de desarrollo.
