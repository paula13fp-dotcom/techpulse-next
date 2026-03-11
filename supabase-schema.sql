-- =============================================================
-- TechPulse — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================

-- 1. SOURCES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sources (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  base_url    TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. DEVICE CATEGORIES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_categories (
  id   SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

-- 3. PRODUCTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  canonical_name  TEXT NOT NULL UNIQUE,
  brand           TEXT,
  model_family    TEXT,
  category_id     INTEGER NOT NULL REFERENCES device_categories(id),
  aliases         JSONB DEFAULT '[]'::jsonb,
  release_date    TEXT,
  is_tracked      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand    ON products(brand);

-- 4. POSTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            SERIAL PRIMARY KEY,
  source_id     INTEGER NOT NULL REFERENCES sources(id),
  external_id   TEXT NOT NULL,
  content_type  TEXT NOT NULL,
  title         TEXT,
  body          TEXT,
  body_raw      TEXT,
  author        TEXT,
  url           TEXT,
  thumbnail_url TEXT,
  upvotes       INTEGER DEFAULT 0,
  downvotes     INTEGER DEFAULT 0,
  score         INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count    INTEGER DEFAULT 0,
  like_count    INTEGER DEFAULT 0,
  share_count   INTEGER DEFAULT 0,
  published_at  TIMESTAMPTZ NOT NULL,
  scraped_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ,
  content_hash  TEXT,
  UNIQUE(source_id, external_id)
);
CREATE INDEX IF NOT EXISTS idx_posts_source       ON posts(source_id);
CREATE INDEX IF NOT EXISTS idx_posts_published     ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_scraped       ON posts(scraped_at);
CREATE INDEX IF NOT EXISTS idx_posts_content_type  ON posts(content_type);
CREATE INDEX IF NOT EXISTS idx_posts_hash          ON posts(content_hash);

-- 5. POST ↔ PRODUCT MENTIONS ────────────────────────────────
CREATE TABLE IF NOT EXISTS post_product_mentions (
  id            SERIAL PRIMARY KEY,
  post_id       INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL REFERENCES products(id),
  mention_count INTEGER NOT NULL DEFAULT 1,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  extracted_by  TEXT NOT NULL DEFAULT 'regex',
  UNIQUE(post_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_mentions_post    ON post_product_mentions(post_id);
CREATE INDEX IF NOT EXISTS idx_mentions_product ON post_product_mentions(product_id);

-- 6. POST ↔ CATEGORIES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_categories (
  post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES device_categories(id),
  PRIMARY KEY (post_id, category_id)
);

-- 7. SENTIMENT RESULTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS sentiment_results (
  id              SERIAL PRIMARY KEY,
  post_id         INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  positive_score  REAL NOT NULL DEFAULT 0.0,
  neutral_score   REAL NOT NULL DEFAULT 0.0,
  negative_score  REAL NOT NULL DEFAULT 0.0,
  label           TEXT NOT NULL,
  confidence      REAL,
  product_id      INTEGER REFERENCES products(id),
  model_used      TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  analyzed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  batch_id        TEXT
);
CREATE INDEX IF NOT EXISTS idx_sentiment_post     ON sentiment_results(post_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_product  ON sentiment_results(product_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_label    ON sentiment_results(label);
CREATE INDEX IF NOT EXISTS idx_sentiment_analyzed ON sentiment_results(analyzed_at);

-- 8. TOPIC CLUSTERS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS topic_clusters (
  id            SERIAL PRIMARY KEY,
  label         TEXT NOT NULL,
  description   TEXT,
  post_count    INTEGER DEFAULT 0,
  category_id   INTEGER REFERENCES device_categories(id),
  product_id    INTEGER REFERENCES products(id),
  first_seen_at TIMESTAMPTZ NOT NULL,
  last_seen_at  TIMESTAMPTZ NOT NULL,
  is_trending   BOOLEAN DEFAULT FALSE,
  batch_id      TEXT
);

-- 9. CLUSTER ↔ POSTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cluster_posts (
  cluster_id INTEGER NOT NULL REFERENCES topic_clusters(id) ON DELETE CASCADE,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  relevance  REAL DEFAULT 1.0,
  PRIMARY KEY (cluster_id, post_id)
);

-- 10. DIGESTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS digests (
  id            SERIAL PRIMARY KEY,
  digest_type   TEXT NOT NULL,
  period_start  TIMESTAMPTZ NOT NULL,
  period_end    TIMESTAMPTZ NOT NULL,
  content       TEXT NOT NULL,
  model_used    TEXT NOT NULL,
  token_count   INTEGER,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category_id   INTEGER REFERENCES device_categories(id)
);
CREATE INDEX IF NOT EXISTS idx_digests_period ON digests(period_start);
CREATE INDEX IF NOT EXISTS idx_digests_type   ON digests(digest_type, period_start);

-- 11. ANALYSIS BATCHES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS analysis_batches (
  id            TEXT PRIMARY KEY,
  job_type      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  post_count    INTEGER DEFAULT 0,
  input_tokens  INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  error_message TEXT
);

-- 12. MARKET CACHE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_cache (
  id          SERIAL PRIMARY KEY,
  cache_type  TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general',
  data        JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cache_type, category)
);

-- =============================================================
-- RPC FUNCTIONS (called from Next.js via supabase.rpc())
-- =============================================================

-- Feed with source and sentiment join
CREATE OR REPLACE FUNCTION get_feed(
  p_source_name  TEXT    DEFAULT NULL,
  p_category_slug TEXT   DEFAULT NULL,
  p_search       TEXT    DEFAULT NULL,
  p_limit        INTEGER DEFAULT 30,
  p_offset       INTEGER DEFAULT 0
)
RETURNS TABLE (
  id             INTEGER,
  title          TEXT,
  body           TEXT,
  url            TEXT,
  author         TEXT,
  score          INTEGER,
  comment_count  INTEGER,
  view_count     INTEGER,
  published_at   TIMESTAMPTZ,
  source_name    TEXT,
  source_display TEXT,
  sentiment      TEXT,
  positive_score REAL,
  negative_score REAL
) LANGUAGE sql STABLE AS $$
  SELECT p.id, p.title, p.body, p.url, p.author,
         p.score, p.comment_count, p.view_count, p.published_at,
         s.name AS source_name, s.display_name AS source_display,
         sr.label AS sentiment, sr.positive_score, sr.negative_score
  FROM posts p
  JOIN sources s ON p.source_id = s.id
  LEFT JOIN sentiment_results sr ON sr.post_id = p.id
  WHERE (p_source_name  IS NULL OR s.name = p_source_name)
    AND (p_category_slug IS NULL OR EXISTS (
          SELECT 1 FROM post_categories pc
          JOIN device_categories dc ON pc.category_id = dc.id
          WHERE pc.post_id = p.id AND dc.slug = p_category_slug))
    AND (p_search IS NULL OR p.title ILIKE '%' || p_search || '%'
                          OR p.body  ILIKE '%' || p_search || '%')
  ORDER BY p.published_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

-- Trending topics
CREATE OR REPLACE FUNCTION get_trending_topics(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id            INTEGER,
  label         TEXT,
  description   TEXT,
  post_count    INTEGER,
  is_trending   BOOLEAN,
  last_seen_at  TIMESTAMPTZ,
  category_name TEXT,
  product_name  TEXT
) LANGUAGE sql STABLE AS $$
  SELECT tc.id, tc.label, tc.description, tc.post_count,
         tc.is_trending, tc.last_seen_at,
         dc.name AS category_name,
         pr.canonical_name AS product_name
  FROM topic_clusters tc
  LEFT JOIN device_categories dc ON tc.category_id = dc.id
  LEFT JOIN products pr ON tc.product_id = pr.id
  ORDER BY tc.is_trending DESC, tc.post_count DESC, tc.last_seen_at DESC
  LIMIT p_limit;
$$;

-- Product radar (mentions + sentiment averages)
CREATE OR REPLACE FUNCTION get_product_radar(p_category_slug TEXT DEFAULT NULL)
RETURNS TABLE (
  canonical_name TEXT,
  category       TEXT,
  mentions_7d    BIGINT,
  mentions_30d   BIGINT,
  avg_pos        NUMERIC,
  avg_neg        NUMERIC
) LANGUAGE sql STABLE AS $$
  SELECT pr.canonical_name,
         dc.name AS category,
         COUNT(*) FILTER (WHERE p.published_at >= NOW() - INTERVAL '7 days')  AS mentions_7d,
         COUNT(*) FILTER (WHERE p.published_at >= NOW() - INTERVAL '30 days') AS mentions_30d,
         ROUND(AVG(sr.positive_score) * 100, 1) AS avg_pos,
         ROUND(AVG(sr.negative_score) * 100, 1) AS avg_neg
  FROM products pr
  JOIN device_categories dc ON pr.category_id = dc.id
  JOIN post_product_mentions ppm ON ppm.product_id = pr.id
  JOIN posts p ON p.id = ppm.post_id
  LEFT JOIN sentiment_results sr ON sr.post_id = p.id
  WHERE pr.is_tracked = TRUE
    AND (p_category_slug IS NULL OR dc.slug = p_category_slug)
  GROUP BY pr.id, pr.canonical_name, dc.name
  HAVING COUNT(*) >= 3
  ORDER BY COUNT(*) FILTER (WHERE p.published_at >= NOW() - INTERVAL '7 days') DESC
  LIMIT 20;
$$;

-- Source stats
CREATE OR REPLACE FUNCTION get_source_stats()
RETURNS TABLE (
  display_name TEXT,
  post_count   BIGINT,
  last_scraped TIMESTAMPTZ
) LANGUAGE sql STABLE AS $$
  SELECT s.display_name,
         COUNT(p.id) AS post_count,
         MAX(p.scraped_at) AS last_scraped
  FROM sources s
  LEFT JOIN posts p ON p.source_id = s.id
  GROUP BY s.id, s.display_name
  ORDER BY post_count DESC;
$$;

-- Latest digest
CREATE OR REPLACE FUNCTION get_latest_digest(p_type TEXT DEFAULT 'daily')
RETURNS TABLE (
  id           INTEGER,
  digest_type  TEXT,
  period_start TIMESTAMPTZ,
  period_end   TIMESTAMPTZ,
  content      TEXT,
  generated_at TIMESTAMPTZ
) LANGUAGE sql STABLE AS $$
  SELECT id, digest_type, period_start, period_end, content, generated_at
  FROM digests
  WHERE digest_type = p_type
  ORDER BY generated_at DESC
  LIMIT 1;
$$;

-- =============================================================
-- ROW LEVEL SECURITY (public read, service_role write)
-- =============================================================
ALTER TABLE sources              ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_product_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_results    ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_clusters       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE digests              ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_batches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_cache         ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (anon key)
CREATE POLICY "public_read" ON sources              FOR SELECT USING (true);
CREATE POLICY "public_read" ON device_categories    FOR SELECT USING (true);
CREATE POLICY "public_read" ON products             FOR SELECT USING (true);
CREATE POLICY "public_read" ON posts                FOR SELECT USING (true);
CREATE POLICY "public_read" ON post_product_mentions FOR SELECT USING (true);
CREATE POLICY "public_read" ON post_categories      FOR SELECT USING (true);
CREATE POLICY "public_read" ON sentiment_results    FOR SELECT USING (true);
CREATE POLICY "public_read" ON topic_clusters       FOR SELECT USING (true);
CREATE POLICY "public_read" ON cluster_posts        FOR SELECT USING (true);
CREATE POLICY "public_read" ON digests              FOR SELECT USING (true);
CREATE POLICY "public_read" ON analysis_batches     FOR SELECT USING (true);
CREATE POLICY "public_read" ON market_cache         FOR SELECT USING (true);

-- =============================================================
-- SEED DATA
-- =============================================================
INSERT INTO sources (name, display_name, base_url) VALUES
  ('reddit',      'Reddit',        'https://www.reddit.com'),
  ('youtube',     'YouTube',       'https://www.youtube.com'),
  ('xda',         'XDA Forums',    'https://xdadevelopers.com'),
  ('gsmarena',    'GSMArena',      'https://www.gsmarena.com'),
  ('tiktok',      'TikTok',        'https://www.tiktok.com'),
  ('x',           'X (Twitter)',   'https://x.com'),
  ('xataka',      'Xataka',        'https://www.xataka.com'),
  ('xatakamovil', 'Xataka Movil',  'https://www.xatakamovil.com'),
  ('muycomputer', 'MuyComputer',   'https://www.muycomputer.com'),
  ('andro4all',   'Andro4all',     'https://andro4all.com'),
  ('hipertextual','Hipertextual',  'https://hipertextual.com'),
  ('applesfera',  'Applesfera',    'https://www.applesfera.com'),
  ('hardzone',    'Hardzone',      'https://hardzone.es'),
  ('tuexperto',   'TuExperto',     'https://www.tuexperto.com'),
  ('iphoneros',   'iPhoneros',     'https://iphoneros.com'),
  ('9to5mac',     '9to5Mac',       'https://9to5mac.com'),
  ('9to5google',  '9to5Google',    'https://9to5google.com'),
  ('macrumors',   'MacRumors',     'https://www.macrumors.com'),
  ('androidauthority','Android Authority','https://www.androidauthority.com'),
  ('wccftech',    'Wccftech',      'https://wccftech.com'),
  ('theverge',    'The Verge',     'https://www.theverge.com'),
  ('sammobile',   'SamMobile',     'https://www.sammobile.com'),
  ('androidpolice','Android Police','https://www.androidpolice.com'),
  ('phandroid',   'Phandroid',     'https://phandroid.com'),
  ('techradar',   'TechRadar',     'https://www.techradar.com')
ON CONFLICT (name) DO NOTHING;

INSERT INTO device_categories (slug, name) VALUES
  ('phones',       'Móviles'),
  ('smartwatches', 'Smartwatches'),
  ('tablets',      'Tablets')
ON CONFLICT (slug) DO NOTHING;
