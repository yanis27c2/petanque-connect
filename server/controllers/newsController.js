import https from 'https';
import http from 'http';

// ── In-memory cache ──────────────────────────────────
let cachedArticles = null;
let cacheTimestamp = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// ── Fallback articles (always available) ─────────────
const FALLBACK_ARTICLES = [
    {
        title: "Championnats de France 2026 : les dates officielles dévoilées",
        source: "Fédération Française de Pétanque",
        date: "2026-02-12",
        summary: "La FFPJP a annoncé le calendrier officiel des championnats de France 2026. Les triplettes se dérouleront à Marseille du 10 au 14 juillet, suivies des doublettes à Lyon fin août.",
        url: "https://www.ffpjp.org",
        category: "compétition"
    },
    {
        title: "Mondial La Marseillaise 2026 : inscriptions ouvertes",
        source: "La Provence",
        date: "2026-02-10",
        summary: "Le plus grand concours de pétanque au monde ouvre ses inscriptions pour l'édition 2026. Plus de 12 000 triplettes attendues sur les terrains du Parc Borély.",
        url: "https://www.laprovence.com",
        category: "événement"
    },
    {
        title: "Technique : maîtriser le tir au fer en 5 étapes",
        source: "Pétanque Magazine",
        date: "2026-02-08",
        summary: "Le tir au fer est l'une des techniques les plus spectaculaires. Découvrez les conseils de champions pour améliorer votre précision et votre puissance de tir.",
        url: "https://www.petanque-magazine.fr",
        category: "technique"
    },
    {
        title: "Nouvelle gamme de boules Obut : la MC 820 dévoilée",
        source: "Obut",
        date: "2026-02-05",
        summary: "Le fabricant stéphanois Obut présente sa nouvelle boule haut de gamme MC 820, conçue en collaboration avec des champions du monde. Une boule qui promet une prise en main inédite.",
        url: "https://www.obut.com",
        category: "matériel"
    },
    {
        title: "La pétanque aux JO 2028 : où en est le dossier ?",
        source: "L'Équipe",
        date: "2026-02-01",
        summary: "Après des années de candidature, la pétanque pourrait enfin intégrer le programme olympique. Le CIO étudie actuellement le dossier pour les Jeux de Los Angeles 2028.",
        url: "https://www.lequipe.fr",
        category: "international"
    }
];

// ── Helper: fetch URL content ────────────────────────
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        const req = lib.get(url, { timeout: 8000 }, (res) => {
            // Follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchUrl(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
}

// ── Parse RSS/XML feed ───────────────────────────────
function parseRSSItems(xml, source, maxItems = 5) {
    const articles = [];
    // Simple XML regex parser — works for standard RSS <item> blocks
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && articles.length < maxItems) {
        const itemXml = match[1];
        const title = extractTag(itemXml, 'title');
        const link = extractTag(itemXml, 'link');
        const pubDate = extractTag(itemXml, 'pubDate');
        const description = extractTag(itemXml, 'description');

        if (title) {
            articles.push({
                title: cleanHtml(title),
                source,
                date: pubDate ? new Date(pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                summary: cleanHtml(description || '').substring(0, 200),
                url: link || '#',
                category: 'actualité'
            });
        }
    }
    return articles;
}

function extractTag(xml, tag) {
    // Handle both regular content and CDATA
    const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
    const regularRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
    const cdataMatch = xml.match(cdataRegex);
    if (cdataMatch) return cdataMatch[1].trim();
    const regularMatch = xml.match(regularRegex);
    return regularMatch ? regularMatch[1].trim() : '';
}

function cleanHtml(text) {
    return text
        .replace(/<[^>]+>/g, '')        // Remove HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')           // Collapse whitespace
        .trim();
}

// ── RSS feed sources ─────────────────────────────────
const RSS_SOURCES = [
    {
        name: 'Boulistenaute',
        url: 'https://www.boulistenaute.com/feed/',
    },
    {
        name: 'France Bleu',
        url: 'https://www.francebleu.fr/rss/infos.xml',
        filterKeywords: ['pétanque', 'boules', 'bouliste', 'cochonnet']
    }
];

// ── Main fetch function ──────────────────────────────
async function fetchArticlesFromSources() {
    const allArticles = [];

    for (const source of RSS_SOURCES) {
        try {
            const xml = await fetchUrl(source.url);
            let items = parseRSSItems(xml, source.name, 10);

            // Filter by keywords if needed
            if (source.filterKeywords) {
                items = items.filter(article => {
                    const text = `${article.title} ${article.summary}`.toLowerCase();
                    return source.filterKeywords.some(kw => text.includes(kw));
                });
            }

            allArticles.push(...items);
        } catch (err) {
            console.warn(`[News] Failed to fetch ${source.name}: ${err.message}`);
        }
    }

    // Sort by date descending, take top 5
    allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    return allArticles.slice(0, 5);
}

// ── Controller ───────────────────────────────────────
export const getNews = async (req, res) => {
    try {
        const now = Date.now();

        // Return cached if still valid
        if (cachedArticles && (now - cacheTimestamp) < CACHE_TTL) {
            return res.json(cachedArticles);
        }

        // Fetch fresh articles
        let articles = await fetchArticlesFromSources();

        // If no articles from RSS, use fallback
        if (articles.length === 0) {
            console.log('[News] No RSS articles found, using fallback');
            articles = FALLBACK_ARTICLES;
        }

        // Update cache
        cachedArticles = articles;
        cacheTimestamp = now;

        res.json(articles);
    } catch (err) {
        console.error('[News] Error:', err.message);

        // Return fallback on any error
        res.json(FALLBACK_ARTICLES);
    }
};
