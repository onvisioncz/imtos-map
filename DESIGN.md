# DESIGN.md — IMTOS mapa

## Typografie
- Jediná rodina: Inter (next/font/google, subsets latin + latin-ext), tabular-nums pro telefony a PSČ.
- Škála (rem, poměr ~1.2): 10.5 / 11.5 / 12.5 / 13.5 / 15 / 17. Hierarchie váhou (450–700), ne barvou.
- Uppercase labely: 10–11px, weight 650–700, tracking 0.12–0.16em.

## Barvy (restrained + datová paleta)
Tmavý sidebar, teplé neutrály tónované k červené značky:
- --bg-sidebar: #181614, --bg-header: #211E1B, --bg-hover: #26221F
- --hairline: #2E2A26, --hairline-soft: #262220
- --text-hi: #F2EFEC, --text-mid: #A8A19A, --text-low: #6E6862
- Akcent (jen akce/identita značky): #D41029

Datová paleta obchodníků (harmonizovaná, vyrovnaná světlost):
- Procházka #E14B4B · Dobrovolný #E0762F · Tošenovjan #8A63E8
- David #3E7BE0 · Kolář #2E9E63 · Kaizer #D29A2B · Žilinka #2BA3BD

Mapa (světlý povrch): panely bílá #FFFFFF, text #1C1917 / #78716C, hairline #E7E5E4.

## Komponenty
- Sidebar: řádky bez rámečků (hover = pozadí + 150ms), hairline oddělovače sekcí.
- Žádné side-stripe bordery, žádné emoji ikony (jen inline SVG 1.5px stroke).
- Legenda a panel na mapě: bílé, radius 12–14, vrstvený stín, Inter.
- Avatary: neutrální 1px ring; barva obchodníka jako 8px tečka, ne rámeček fotky.

## Motion
- 150–250ms, ease-out. Pulz loga je brandový prvek (požadavek klienta), zůstává.
- Mapové přechody (highlight/focus) delší (0.9–1.4s) — záměr, plynulost na mapě.
