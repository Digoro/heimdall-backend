-- Catalog test data (PostgreSQL + PostGIS)
-- 실행: psql -d <DB> -f scripts/seed-catalog.sql
-- 여러 번 실행해도 중복 insert 되지 않음 (collectionId / itemId unique)

INSERT INTO "TB_CATALOG_COLLECTION"
    ("id", "collectionId", "type", "stacVersion", "title", "description", "license", "extent", "summaries")
VALUES (
    gen_random_uuid(), 'cosmos', 'Collection', '1.0.0',
    'COSMOS SAR Satellite', 'COSMOS SAR satellite imagery collection', 'proprietary',
    '{"spatial":{"bbox":[[124.0,33.0,132.0,39.0]]},"temporal":{"interval":[["2026-04-22T00:00:00Z",null]]}}'::jsonb,
    '{"platform":["stripmap","scansar","spotlight_single"],"sar:product_type":["SLC","GEC","GEO"]}'::jsonb
)
ON CONFLICT ("collectionId") DO NOTHING;

-- 10개 아이템: 2026-04-23 ~ 2026-05-02, 한반도 일대
WITH src AS (
    SELECT
        i,
        (ARRAY['SM','SM','SS','SM','SS','SM','SM','SS','SM','SM'])[i]             AS mode_code,
        (ARRAY['stripmap','stripmap','spotlight_single','stripmap','spotlight_single',
               'stripmap','stripmap','spotlight_single','stripmap','stripmap'])[i] AS instrument_mode,
        (ARRAY['SLC','GEC','GEO','SLC','GEC','GEO','SLC','GEC','GEO','SLC'])[i]   AS product_type,
        (ARRAY['VV','VV','HH','VV','HH','VV','HH','VV','HH','VV'])[i]             AS pol,
        (ARRAY['ascending','descending'])[1 + (i % 2)]                            AS orbit_state,
        (ARRAY['right','right','left','right','right','left','right','right','left','right'])[i] AS obs_dir,
        (ARRAY[126.9, 127.4, 129.0, 126.5, 128.6, 127.1, 126.7, 129.3, 127.9, 128.2])[i] AS lon,
        (ARRAY[37.4,  36.3,  35.1,  35.8,  35.9,  37.8,  34.8,  36.0,  37.2,  36.6])[i]  AS lat,
        (ARRAY[28.5, 33.2, 41.7, 25.9, 38.4, 30.1, 44.0, 27.3, 35.6, 31.8])[i]     AS inc_angle,
        timestamptz '2026-04-22 10:00:00+00' + (i || ' days')::interval            AS dt
    FROM generate_series(1, 10) AS i
)
INSERT INTO "TB_CATALOG_ITEM"
    ("id", "itemId", "type", "stacVersion", "collection", "geometry", "bbox", "properties", "assets")
SELECT
    gen_random_uuid(),
    'COSMOS_' || to_char(dt, 'YYYYMMDD') || to_char(i, 'FM00') || '_' || mode_code || '_' || product_type || '_' || pol || '_'
        || to_char(dt, 'YYYYMMDD"T"HH24MISS') || '_' || to_char(dt + interval '25 seconds', 'YYYYMMDD"T"HH24MISS'),
    'Feature',
    '1.0.0',
    'cosmos',
    ST_MakeEnvelope(lon, lat, lon + 0.2, lat + 0.2, 4326),
    ARRAY[lon, lat, lon + 0.2, lat + 0.2]::float8[],
    jsonb_build_object(
        'title',               'COSMOS ' || product_type || ' ' || to_char(dt, 'YYYY-MM-DD'),
        'mission',             'COSMOS',
        'platform',            'COSMOS-' || (1 + i % 2),
        'datetime',            to_char(dt AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'start_datetime',      to_char(dt AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'end_datetime',        to_char((dt + interval '25 seconds') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'instruments',         jsonb_build_array('sar'),
        'sar:product_type',    product_type,
        'sar:instrument_mode', instrument_mode,
        'sar:observation_direction', obs_dir,
        'sar:polarizations',   jsonb_build_array(pol),
        'sar:center_frequency', 9.65,
        'sar:pixel_spacing_range',   CASE WHEN mode_code = 'SS' THEN 0.5 ELSE 1.0 END,
        'sar:pixel_spacing_azimuth', CASE WHEN mode_code = 'SS' THEN 0.5 ELSE 1.0 END,
        'sar:looks_range',     1,
        'sar:looks_azimuth',   1,
        'view:incidence_angle', inc_angle,
        'sat:orbit_state',     orbit_state,
        'cosmos:prf',          3500 + i * 10,
        'cosmos:heading',      190.0 - i,
        'cosmos:center_latitude',  lat + 0.1,
        'cosmos:center_longitude', lon + 0.1
    ),
    jsonb_build_object(
        'thumbnail', jsonb_build_object('type', 'image/png', 'roles', jsonb_build_array('thumbnail'),
                                        'href', 'https://example.com/thumbnails/cosmos_' || i || '.png'),
        'data',      jsonb_build_object('type', 'application/octet-stream', 'roles', jsonb_build_array('data')),
        'metadata',  jsonb_build_object('type', 'application/xml', 'roles', jsonb_build_array('metadata'))
    )
FROM src
ON CONFLICT ("itemId") DO NOTHING;
