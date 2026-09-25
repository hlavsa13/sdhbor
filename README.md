# SDH Bor u Sedlčan — redesign webu

Statické HTML stránky, připravené k nahrání do GitHub repozitáře (např. přes GitHub Pages).

## Soubory

- `index.html` — Úvod
- `historie.html` — Historie sboru a obce
- `clenove.html` — Seznam členů (s filtrem podle kategorie)
- `souteze.html` — Výsledky soutěží (s filtrem podle roku)
- `akce.html` — Akce a brigády

## Jak nahrát na GitHub Pages

1. Vytvoř nový repozitář na GitHubu (nebo použij existující).
2. Nahraj obsah této složky do kořene repozitáře (nebo do složky `/docs`).
3. V nastavení repozitáře (Settings → Pages) zapni GitHub Pages pro danou větev/složku.
4. Web pak poběží na `https://<uživatel>.github.io/<repozitář>/`.

## Poznámky

- Fonty (Oswald, Inter, JetBrains Mono) se načítají z Google Fonts přes `<link>` v hlavičce každé stránky — funguje bez dalšího nastavení.
- Filtry na stránkách Soutěže a Členové jsou čistý JavaScript bez závislostí — fungují i staticky, bez buildu.
- Fotografie sboru a mapa obce jsou zatím označené placeholdery (`[DOBOVÁ FOTOGRAFIE SBORU]`, `[MAPA / FOTO OBCE BOR]`) — je potřeba je nahradit skutečnými obrázky.

## Struktura obrázků

Každá detailní stránka soutěže nebo akce má vlastní složku `images/<název-stránky>/` (název odpovídá souboru HTML bez přípony, např. `images/zelezny-srot-2018/` pro `zelezny-srot-2018.html`). Obrázky úvodní stránky jsou ve složce `images/uvod/`.

Prázdné složky obsahují soubor `.gitkeep`, aby je GitHub zachoval. Po přidání fotek ho lze smazat.
