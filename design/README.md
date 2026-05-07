# Design

Drop the Stitch AI export here. Expected layout:

```
design/
├── index.html             # Stitch's main HTML
├── assets/                # CSS, fonts, images Stitch references
└── screens/               # Per-screen HTML files (if Stitch splits them)
    ├── hoje.html
    ├── ficha-praia.html
    ├── explorar.html
    ├── favoritas.html
    └── perfil.html
```

When applying a design to the React app, the order that maximises user impact:

1. `PaginaHoje.tsx`           ← `screens/hoje.html`
2. `FichaPraia.tsx`           ← `screens/ficha-praia.html`
3. `PaginaExplorar.tsx`       ← `screens/explorar.html`
4. `PaginaFavoritas.tsx`      ← `screens/favoritas.html`
5. `PaginaPerfil.tsx`         ← `screens/perfil.html`

Translation rules (see CLAUDE.md → Design):
- Keep Tailwind classes that Stitch produced.
- Otherwise inline styles in the dark-theme palette: `#0F1923` bg, `#132A3A` cards, `#1A6FB5` accent, text `#E8EDF2`, secondary text `#7A8A9E`, borders `#1A3D52`.
- Replace static placeholder content with the existing data hooks (`usePraiaComMeteo`, `useFotos`, `usePontosInteresse`, `useFavoritas`, `usePerfil`, `useAuth`).

The contents of this folder (other than this README) are git-ignored.
