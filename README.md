# Gerador de Molduras

Webapp estático, sem dependências, para montar uma foto de perfil ou Story com moldura e textos personalizáveis.

## Recursos
- upload de imagem local;
- arrastar para reposicionar;
- zoom;
- formatos 1080×1080 e 1080×1920;
- exportação PNG;
- Web Share API / copiar link;
- PWA simples;
- processamento 100% no navegador.

## Publicar na Vercel
1. Importe este repositório na Vercel.
2. Framework Preset: `Other`.
3. Build Command: deixe vazio.
4. Output Directory: deixe vazio.
5. Deploy.

## Personalização
As cores ficam em `styles.css` e no objeto `palette` de `app.js`. Os três textos da moldura são editáveis na própria interface.
