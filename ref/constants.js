import { css } from 'lit';

export const font_family = css`Assistant-SemiBold, Helvetica, sans-serif`

export const device = screen.width <= 480 ? "m" : "d"

export const PAGESIZE = screen.width <= 480 ? 300 : 500

const conditionTags = [
  { "value": "all", "label": "הכל" },
  { "value": "new", "label": "חדש" },
  { "value": "used", "label": "יד שניה" }
]
  
const formatAllTags = [
  { "value": "all", "label": "הכל" },
  { "value": "cd", "label": "CD" },
  { "value": "lp", "label": "LP" },
  { "value": "12", "label": "12\"" },
  { "value": "10", "label": "10\"" },
  { "value": "7", "label": "7\"" },
  { "value": "cassette", "label": "Cassette" }
]

const formatCdTags = [
  { "value": "cd", "label": "CD" }
]
const formatVinylTags = [
  { "value": "all", "label": "הכל" },
  { "value": "lp", "label": "LP" },
  { "value": "12", "label": "12\"" },
  { "value": "10", "label": "10\"" },
  { "value": "7", "label": "7\"" },
  { "value": "cassette", "label": "Cassette" }
]
  
const genreTags = [
  { "value": "all", "label": "הכל" },
  { "value": "israeli", "label": "ישראלי" },
  { "value": "rock-pop", "label": "Rock/Pop" },
  { "value": "alternative-rock", "label": "Alternative Rock" },
  { "value": "newwave-postpunk-gothic", "label": "New Wave/Post Punk/Gothic" },
  { "value": "jazz-blues", "label": "Jazz/Blues" },
  { "value": "soul-funk", "label": "Soul/Funk" },
  { "value": "electronic", "label": "Electronic" },
  { "value": "trance", "label": "Trance" },
  { "value": "experimental-industrial-noise", "label": "Experimental/Industrial/Noise" },
  { "value": "hip-hop", "label": "Hip Hop" },
  { "value": "reggae-dub", "label": "Reggae/Dub" },
  { "value": "hardcore-punk", "label": "Hardcore/Punk" },
  { "value": "metal", "label": "Metal" },
  { "value": "doom-sludge-stoner", "label": "Doom/Sludge/Stoner" },
  { "value": "prog-psychedelic", "label": "Prog/Psychedelic" },
  { "value": "folk-country", "label": "Folk/Country" },
  { "value": "world", "label": "World" },
  { "value": "classical", "label": "Classical" },
  { "value": "soundtracks", "label": "Soundtracks" },
]

const specialTags = [
  { "value": "all", "label": "הכל" },
  { "value": "newinsite", "label": "חדש באתר" },
  { "value": "preorder", "label": "הזמנות מוקדמות" },
  { "value": "recommended", "label": "המלצות" },
  { "value": "classics", "label": "קלאסיקות" },
  { "value": "cheap", "label": "מחירי רצפה" }, 
  { "value": "rare", "label": "נדירים" }
]

const sortTags = [
  { "value": "new",      "label": "חדש באתר" },
  { "value": "pricelow", "label": "מחיר - מהנמוך לגבוה" },
  { "value": "pricehi",  "label": "מחיר - מהגבוה לנמוך" },
  { "value": "name",     "label": "שם" }
]

export const tags = {
  "condition": {
    "title": "מצב",
    "list": conditionTags
  },
  "formatall": {
    "title": "פורמט",
    "list": formatAllTags
  },
  "formatcd": {
    "title": "פורמט",
    "list": formatCdTags
  },
  "formatvinyl": {
    "title": "פורמט",
    "list": formatVinylTags
  },
  "genre": {
    "title": "ז׳אנר",
    "list": genreTags
  },
  "special": {
    "title": "קטגוריות מיוחדות",
    "list": specialTags
  },
  "sort": {
    "title": "מיון לפי",
    "list": sortTags
  },
}

export const buttonRoles = css`
[role="button"] {
    display: inline-block;
    position: relative;
    border-radius: 4px;
    color: #fff;
    background-color: #000;
}   

[role="button"]:hover {
    border-color: #888;
    background-color: #888;
    cursor: default;
}

[role="button"]:focus {
    outline: none;
}

[role="button"]:focus::before {
    position: absolute;
    top: calc(-1px - 2px - 2px);
    right: calc(-1px - 2px - 2px);
    bottom: calc(-1px - 2px - 2px);
    left: calc(-1px - 2px - 2px);
    border: 2px solid #000;
    border-radius: calc(4px + 2px + 2px);
    content: "";
}

[role="button"]:active {
    background-color: #888;
}

[role="button"][aria-pressed] {
    background-color: #888;
}

[role="button"][aria-pressed]:hover {
    border-color: #888;
    background-color: #888;
}

[role="button"][aria-pressed="true"] {
    background-color: #888;
}

[role="button"][aria-pressed="true"]:hover {
    background-color:#888;
}
`