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

-- 500개 아이템 (i = 11..510): 2026-04-22 ~ 2026-10-18, 한반도 위주(80%) + 인근 해역/외곽(20%)
-- itemId 는 i 로만 결정되므로(날짜/모드/제품/편파 모두 i 의 함수) 재실행해도 중복 insert 되지 않음.
-- 위치/크기/회전각/입사각은 random() 사용. 처음 insert 될 때만 반영됨.
--   영역: 모드와 무관하게 폭 0.30~0.45도, 가로세로비 0.9~1.1(썸네일 원본이 거의 정사각형), 회전 ±12도
--   썸네일: Capella open data 샘플 이미지. 해당 S3 버킷이 Access-Control-Allow-Origin: * 를 응답하므로 별도 CORS 처리 불필요.
SELECT setseed(0.42);

WITH base AS MATERIALIZED (
    SELECT
        i,
        (ARRAY['SM','SM','SM','SM','SS','SS','SS','SC','SC','SM'])[1 + i % 10]   AS mode_code,
        (ARRAY['SLC','GEC','GEO'])[1 + (i / 3) % 3]                              AS product_type,
        (ARRAY['VV','HH'])[1 + (i / 5) % 2]                                      AS pol,
        (ARRAY['ascending','descending'])[1 + (i / 2) % 2]                       AS orbit_state,
        (ARRAY['right','left'])[1 + (i / 4) % 2]                                 AS obs_dir,
        timestamptz '2026-04-22 00:00:00+00'
            + ((i * 37) % 180 || ' days')::interval
            + ((i * 13) % 24 || ' hours')::interval
            + ((i * 29) % 60 || ' minutes')::interval                            AS dt,
        random() AS r_region, random() AS r_lon, random() AS r_lat,
        random() AS r_w, random() AS r_aspect, random() AS r_rot, random() AS r_inc
    FROM generate_series(11, 510) AS i
),
shape AS MATERIALIZED (
    SELECT
        b.*,
        CASE WHEN r_region < 0.8 THEN 125.5 + r_lon * 4.0 ELSE 124.0 + r_lon * 7.5 END AS clon,
        CASE WHEN r_region < 0.8 THEN  34.2 + r_lat * 4.2 ELSE  33.0 + r_lat * 5.8 END AS clat,
        0.30 + r_w * 0.15                     AS w,
        0.9 + r_aspect * 0.2                  AS aspect,
        -12 + r_rot * 24                      AS rot_deg,
        round((20 + r_inc * 30)::numeric, 1)  AS inc_angle
    FROM base b
),
geo AS MATERIALIZED (
    SELECT
        s.*,
        ST_Rotate(
            ST_MakeEnvelope(clon - w / 2, clat - w * aspect / 2, clon + w / 2, clat + w * aspect / 2, 4326),
            radians(rot_deg),
            ST_SetSRID(ST_MakePoint(clon, clat), 4326)
        ) AS geom
    FROM shape s
)
INSERT INTO "TB_CATALOG_ITEM"
    ("id", "itemId", "type", "stacVersion", "collection", "geometry", "bbox", "properties", "assets")
SELECT
    gen_random_uuid(),
    'COSMOS_' || to_char(dt, 'YYYYMMDD') || lpad(i::text, 3, '0') || '_' || mode_code || '_' || product_type || '_' || pol || '_'
        || to_char(dt, 'YYYYMMDD"T"HH24MISS') || '_' || to_char(dt + interval '25 seconds', 'YYYYMMDD"T"HH24MISS'),
    'Feature',
    '1.0.0',
    'cosmos',
    geom,
    ARRAY[ST_XMin(geom), ST_YMin(geom), ST_XMax(geom), ST_YMax(geom)]::float8[],
    jsonb_build_object(
        'title',               'COSMOS ' || product_type || ' ' || to_char(dt, 'YYYY-MM-DD'),
        'mission',             'COSMOS',
        'platform',            'COSMOS-' || (1 + i % 2),
        'datetime',            to_char(dt AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'start_datetime',      to_char(dt AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'end_datetime',        to_char((dt + interval '25 seconds') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'instruments',         jsonb_build_array('sar'),
        'sar:product_type',    product_type,
        'sar:instrument_mode', CASE mode_code WHEN 'SS' THEN 'spotlight_single' WHEN 'SC' THEN 'scansar' ELSE 'stripmap' END,
        'sar:observation_direction', obs_dir,
        'sar:polarizations',   jsonb_build_array(pol),
        'sar:center_frequency', 9.65,
        'sar:pixel_spacing_range',   CASE mode_code WHEN 'SS' THEN 0.5 WHEN 'SC' THEN 3.0 ELSE 1.0 END,
        'sar:pixel_spacing_azimuth', CASE mode_code WHEN 'SS' THEN 0.5 WHEN 'SC' THEN 3.0 ELSE 1.0 END,
        'sar:looks_range',     1,
        'sar:looks_azimuth',   1,
        'view:incidence_angle', inc_angle,
        'sat:orbit_state',     orbit_state,
        'cosmos:prf',          3500 + (i % 50) * 10,
        'cosmos:heading',      round(mod((CASE orbit_state WHEN 'ascending' THEN 350.0 ELSE 190.0 END + rot_deg + 360)::numeric, 360), 1),
        'cosmos:center_latitude',  round(clat::numeric, 4),
        'cosmos:center_longitude', round(clon::numeric, 4)
    ),
    jsonb_build_object(
        'thumbnail', jsonb_build_object('type', 'image/png', 'roles', jsonb_build_array('thumbnail'),
                                        'href', 'https://capella-open-data.s3.amazonaws.com/data/2025/7/7/CAPELLA_C17_SP_GEO_HH_20250707232105_20250707232140/CAPELLA_C17_SP_GEO_HH_20250707232105_20250707232140_thumb.png'),
        'data',      jsonb_build_object('type', 'application/octet-stream', 'roles', jsonb_build_array('data')),
        'metadata',  jsonb_build_object('type', 'application/xml', 'roles', jsonb_build_array('metadata'))
    )
FROM geo
ON CONFLICT ("itemId") DO NOTHING;
