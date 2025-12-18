# Guia de Estilo – Types y Interfaces

## Ubicación

- Tipos solo en `src/types/...`
- Un archivo por tema

```
src/types/alertas.ts
src/types/eventos.ts
```

## Interfaces

- `PascalCase`
- Sin prefijo `I`
- Solo datos (sin lógica)
- `readonly` por defecto
- Sin `any`

## Sintaxis

```ts
export interface Nombre {
  readonly propiedad: tipo;
  opcional?: tipo;
}
```

## Reglas

- No definir interfaces en `api` ni `components`
