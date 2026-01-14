--
-- PostgreSQL database dump
--

\restrict QGcnot8eSs9EpvsknNHOFgbnIb0Mp5BIYpko3digDnAf8YxzHvKw2fL7WeWJYZq

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.tipos_entregables DROP CONSTRAINT IF EXISTS tipos_entregables_disciplina_id_fkey;
ALTER TABLE IF EXISTS ONLY public.plot_plans DROP CONSTRAINT IF EXISTS plot_plans_proyecto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.paquetes DROP CONSTRAINT IF EXISTS paquetes_cwp_id_fkey;
ALTER TABLE IF EXISTS ONLY public.items DROP CONSTRAINT IF EXISTS items_tipo_entregable_id_fkey;
ALTER TABLE IF EXISTS ONLY public.items DROP CONSTRAINT IF EXISTS items_source_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.items DROP CONSTRAINT IF EXISTS items_paquete_id_fkey;
ALTER TABLE IF EXISTS ONLY public.disciplinas DROP CONSTRAINT IF EXISTS disciplinas_proyecto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cwp DROP CONSTRAINT IF EXISTS cwp_disciplina_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cwp DROP CONSTRAINT IF EXISTS cwp_cwa_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cwp_columnas_metadata DROP CONSTRAINT IF EXISTS cwp_columnas_metadata_proyecto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cwa DROP CONSTRAINT IF EXISTS cwa_plot_plan_id_fkey;
DROP INDEX IF EXISTS public.ix_tipos_entregables_id;
DROP INDEX IF EXISTS public.ix_proyectos_nombre;
DROP INDEX IF EXISTS public.ix_proyectos_id;
DROP INDEX IF EXISTS public.ix_plot_plans_id;
DROP INDEX IF EXISTS public.ix_paquetes_id;
DROP INDEX IF EXISTS public.ix_paquetes_codigo;
DROP INDEX IF EXISTS public.ix_items_id;
DROP INDEX IF EXISTS public.ix_disciplinas_id;
DROP INDEX IF EXISTS public.ix_cwp_id;
DROP INDEX IF EXISTS public.ix_cwp_columnas_metadata_id;
DROP INDEX IF EXISTS public.ix_cwp_codigo;
DROP INDEX IF EXISTS public.ix_cwa_id;
DROP INDEX IF EXISTS public.ix_cwa_codigo;
ALTER TABLE IF EXISTS ONLY public.tipos_entregables DROP CONSTRAINT IF EXISTS tipos_entregables_pkey;
ALTER TABLE IF EXISTS ONLY public.proyectos DROP CONSTRAINT IF EXISTS proyectos_pkey;
ALTER TABLE IF EXISTS ONLY public.plot_plans DROP CONSTRAINT IF EXISTS plot_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.paquetes DROP CONSTRAINT IF EXISTS paquetes_pkey;
ALTER TABLE IF EXISTS ONLY public.items DROP CONSTRAINT IF EXISTS items_pkey;
ALTER TABLE IF EXISTS ONLY public.disciplinas DROP CONSTRAINT IF EXISTS disciplinas_pkey;
ALTER TABLE IF EXISTS ONLY public.cwp DROP CONSTRAINT IF EXISTS cwp_pkey;
ALTER TABLE IF EXISTS ONLY public.cwp_columnas_metadata DROP CONSTRAINT IF EXISTS cwp_columnas_metadata_pkey;
ALTER TABLE IF EXISTS ONLY public.cwa DROP CONSTRAINT IF EXISTS cwa_pkey;
ALTER TABLE IF EXISTS ONLY public.cwp DROP CONSTRAINT IF EXISTS _cwp_codigo_cwa_uc;
ALTER TABLE IF EXISTS ONLY public.cwa DROP CONSTRAINT IF EXISTS _cwa_codigo_plot_uc;
ALTER TABLE IF EXISTS public.tipos_entregables ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.proyectos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.plot_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.paquetes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.disciplinas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cwp_columnas_metadata ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cwp ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cwa ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.tipos_entregables_id_seq;
DROP TABLE IF EXISTS public.tipos_entregables;
DROP SEQUENCE IF EXISTS public.proyectos_id_seq;
DROP TABLE IF EXISTS public.proyectos;
DROP SEQUENCE IF EXISTS public.plot_plans_id_seq;
DROP TABLE IF EXISTS public.plot_plans;
DROP SEQUENCE IF EXISTS public.paquetes_id_seq;
DROP TABLE IF EXISTS public.paquetes;
DROP SEQUENCE IF EXISTS public.items_id_seq;
DROP TABLE IF EXISTS public.items;
DROP SEQUENCE IF EXISTS public.disciplinas_id_seq;
DROP TABLE IF EXISTS public.disciplinas;
DROP SEQUENCE IF EXISTS public.cwp_id_seq;
DROP SEQUENCE IF EXISTS public.cwp_columnas_metadata_id_seq;
DROP TABLE IF EXISTS public.cwp_columnas_metadata;
DROP TABLE IF EXISTS public.cwp;
DROP SEQUENCE IF EXISTS public.cwa_id_seq;
DROP TABLE IF EXISTS public.cwa;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cwa; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cwa (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    codigo character varying(20),
    descripcion text,
    es_transversal boolean,
    prioridad integer,
    plot_plan_id integer,
    shape_type character varying(15),
    shape_data json
);


ALTER TABLE public.cwa OWNER TO admin;

--
-- Name: cwa_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.cwa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cwa_id_seq OWNER TO admin;

--
-- Name: cwa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.cwa_id_seq OWNED BY public.cwa.id;


--
-- Name: cwp; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cwp (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    codigo character varying(50),
    descripcion text,
    cwa_id integer,
    disciplina_id integer,
    secuencia integer,
    duracion_dias integer,
    fecha_inicio_prevista date,
    fecha_fin_prevista date,
    porcentaje_completitud double precision,
    estado character varying(20),
    restricciones_levantadas boolean,
    restricciones_json json,
    metadata_json json
);


ALTER TABLE public.cwp OWNER TO admin;

--
-- Name: cwp_columnas_metadata; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cwp_columnas_metadata (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    tipo_dato character varying,
    opciones_json json,
    proyecto_id integer,
    orden integer
);


ALTER TABLE public.cwp_columnas_metadata OWNER TO admin;

--
-- Name: cwp_columnas_metadata_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.cwp_columnas_metadata_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cwp_columnas_metadata_id_seq OWNER TO admin;

--
-- Name: cwp_columnas_metadata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.cwp_columnas_metadata_id_seq OWNED BY public.cwp_columnas_metadata.id;


--
-- Name: cwp_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.cwp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cwp_id_seq OWNER TO admin;

--
-- Name: cwp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.cwp_id_seq OWNED BY public.cwp.id;


--
-- Name: disciplinas; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.disciplinas (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    codigo character varying(10) NOT NULL,
    descripcion text,
    proyecto_id integer
);


ALTER TABLE public.disciplinas OWNER TO admin;

--
-- Name: disciplinas_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.disciplinas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.disciplinas_id_seq OWNER TO admin;

--
-- Name: disciplinas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.disciplinas_id_seq OWNED BY public.disciplinas.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.items (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    descripcion text,
    tipo_entregable_id integer,
    paquete_id integer,
    source_item_id integer,
    version integer,
    estado character varying(20),
    porcentaje_completitud double precision,
    archivo_url character varying,
    es_entregable_cliente boolean,
    requiere_aprobacion boolean,
    metadata_json json,
    fecha_creacion timestamp without time zone,
    fecha_actualizacion timestamp without time zone
);


ALTER TABLE public.items OWNER TO admin;

--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.items_id_seq OWNER TO admin;

--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: paquetes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.paquetes (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    codigo character varying(100),
    descripcion text,
    tipo character varying(10) NOT NULL,
    responsable character varying(20) NOT NULL,
    cwp_id integer,
    forecast_inicio date,
    forecast_fin date,
    fecha_inicio_prevista date,
    fecha_fin_prevista date,
    porcentaje_completitud double precision,
    estado character varying(20),
    metadata_json json,
    fecha_creacion timestamp without time zone,
    fecha_actualizacion timestamp without time zone
);


ALTER TABLE public.paquetes OWNER TO admin;

--
-- Name: paquetes_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.paquetes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.paquetes_id_seq OWNER TO admin;

--
-- Name: paquetes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.paquetes_id_seq OWNED BY public.paquetes.id;


--
-- Name: plot_plans; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.plot_plans (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    descripcion text,
    image_url character varying,
    proyecto_id integer
);


ALTER TABLE public.plot_plans OWNER TO admin;

--
-- Name: plot_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.plot_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.plot_plans_id_seq OWNER TO admin;

--
-- Name: plot_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.plot_plans_id_seq OWNED BY public.plot_plans.id;


--
-- Name: proyectos; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.proyectos (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    descripcion text,
    fecha_inicio date,
    fecha_fin date
);


ALTER TABLE public.proyectos OWNER TO admin;

--
-- Name: proyectos_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.proyectos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proyectos_id_seq OWNER TO admin;

--
-- Name: proyectos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.proyectos_id_seq OWNED BY public.proyectos.id;


--
-- Name: tipos_entregables; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.tipos_entregables (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    codigo character varying(10) NOT NULL,
    categoria_awp character varying(10) NOT NULL,
    descripcion text,
    disciplina_id integer,
    es_generico boolean
);


ALTER TABLE public.tipos_entregables OWNER TO admin;

--
-- Name: tipos_entregables_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.tipos_entregables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tipos_entregables_id_seq OWNER TO admin;

--
-- Name: tipos_entregables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.tipos_entregables_id_seq OWNED BY public.tipos_entregables.id;


--
-- Name: cwa id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwa ALTER COLUMN id SET DEFAULT nextval('public.cwa_id_seq'::regclass);


--
-- Name: cwp id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwp ALTER COLUMN id SET DEFAULT nextval('public.cwp_id_seq'::regclass);


--
-- Name: cwp_columnas_metadata id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwp_columnas_metadata ALTER COLUMN id SET DEFAULT nextval('public.cwp_columnas_metadata_id_seq'::regclass);


--
-- Name: disciplinas id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.disciplinas ALTER COLUMN id SET DEFAULT nextval('public.disciplinas_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: paquetes id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.paquetes ALTER COLUMN id SET DEFAULT nextval('public.paquetes_id_seq'::regclass);


--
-- Name: plot_plans id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.plot_plans ALTER COLUMN id SET DEFAULT nextval('public.plot_plans_id_seq'::regclass);


--
-- Name: proyectos id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.proyectos ALTER COLUMN id SET DEFAULT nextval('public.proyectos_id_seq'::regclass);


--
-- Name: tipos_entregables id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tipos_entregables ALTER COLUMN id SET DEFAULT nextval('public.tipos_entregables_id_seq'::regclass);


--
-- Data for Name: cwa; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.cwa (id, nombre, codigo, descripcion, es_transversal, prioridad, plot_plan_id, shape_type, shape_data) FROM stdin;
17	Sistema de almacenamiento y transferencia de aguas despojadas	300-01		f	9	1	rect	{"x": 698.9109602479506, "y": 304.5881406027162, "width": 32.268023870966886, "height": 36.20314873327999, "color": "#E84393"}
20	Unidad PSW Existente U-307	037-01		f	21	1	rect	{"x": 698.3614994313958, "y": 361.58330065487286, "width": 81.56161140403515, "height": 66.02606637469518, "color": "#6C3483"}
22	Sistema de Drenajes Cerrados u-038	038-02		f	11	1	rect	{"x": 667.7497638359556, "y": 354.0353431707873, "width": 19.71969771002307, "height": 36.039447539007824, "color": "#F1C40F"}
9	Desmantelamiento de unidad de tratamientos U-005	005-01		f	1	1	multi	[{"x": 585.7264396203508, "y": 353.4392615848889, "width": 50.111454046639324, "height": 47.72595094334639, "color": "#9B59B6", "type": "rect"}]
12	Sub-estación 2.1 / 3.0	002-03		f	16	1	rect	{"x": 314.9058927000879, "y": 314.73521081124255, "width": 41.12576956904138, "height": 90.47669305189089, "color": "#9B59B6"}
26	Enclouser 2 _ 15-ENC-02 (Sub estación para instalar bombas de U-149)	146-01		f	15	1	rect	{"x": 860.1160949868073, "y": 331.263852242744, "width": 47.000879507475815, "height": 19.975373790677224, "color": "#2E86C1"}
23	Piperack U-137 - Interconexiones	137-01		f	19	1	multi	[{"points": [806.5712882796216, 286.88421917588585, 824.6463844797179, 286.88421917588585, 824.6463844797179, 380.50394821228156, 780.1538399871735, 380.50394821228156, 780.1538399871735, 367.5269560686227, 810.7424643257978, 367.5269560686227, 810.7424643257978, 304.49585137085137, 806.5712882796216, 304.49585137085137], "color": "#922B21", "type": "polygon"}]
14	Piperack Sur #1 - Interconexiones	149-01		f	7	1	rect	{"x": 344.93277006842646, "y": 428.4182355967078, "width": 412.9183813443072, "height": 21.189986282578843, "color": "#F1C40F"}
13	SIH02	002-04		f	18	1	rect	{"x": 233.23642463923906, "y": 135.38470324185732, "width": 44.87931202970779, "height": 27.879572624515447, "color": "#E74C3C"}
24	Interconexiones electricas y de Instrumentación	139-01		f	12	1	polygon	{"points": [280.5350418270585, 141.88646660443524, 280.5350418270585, 129.13666205054096, 727.7226311803129, 129.13666205054096, 779.1940643793674, 177.30259036525263, 833.4987874792874, 177.30259036525263, 833.4987874792874, 387.4382580127692, 781.0829243132778, 387.4382580127692, 781.0829243132778, 380.3550332606058, 824.9989177766913, 380.3550332606058, 824.9989177766913, 187.69132000175907, 779.666279362845, 187.69132000175907, 727.2504161968353, 141.88646660443524], "color": "#2ECC71"}
32	General 002-00	002-00		t	100	1	multi	[{"x": 518.7032360802277, "y": 489.2034653916493, "radius": 21.18953211736717, "color": "#2ECC71", "type": "diamond"}]
30	General 038-00	038-00		t	100	1	multi	[{"x": 454.075025483805, "y": 491.9431089888133, "radius": 21.18953211736717, "color": "#922B21", "type": "diamond"}]
11	Sistema de mezcla de agua despojada y condensado	002-02		f	14	1	multi	[{"x": 167.29870129870136, "y": 348.85714285714283, "width": 58.62337662337663, "height": 57.66233766233768, "color": "#1E8449", "type": "rect"}]
18	Sistema de Quimicos	300-02		f	13	1	rect	{"x": 741.8890806846398, "y": 305.0288750676571, "width": 40.13827359559309, "height": 43.91599346341354, "color": "#E74C3C"}
10	Bombas de aguas agrias 19-GZ-P-12050 C/D	002-01		f	2	1	rect	{"x": 36.42568161829375, "y": 355.9393139841688, "width": 32.90061565523307, "height": 21.150395778364157, "color": "#E67E22"}
21	Planta de despojo de Agua Agrias Fenólicas U-038	038-01		f	20	1	multi	[{"x": 666.8592699815763, "y": 354.3937806037559, "width": -97.8366483767719, "height": 39.13527977354397, "color": "#E67E22", "type": "rect"}]
34	Piperack Norte #3 - Interconexiones	149-06		f	6	1	multi	[{"x": 731.4901194484528, "y": 305.4227793811127, "width": 9.732744107744224, "height": 56.542608625941966, "color": "#2ECC71", "type": "rect"}]
16	Tanque de Aguas Fenolicas AR-TK-2302	149-03		f	3	1	rect	{"x": 1196.1723834652594, "y": 146.19788918205805, "width": 139.82761653474063, "height": 112.80211081794195, "color": "#8E44AD"}
35	Valvula - carga U-121	121-01		f	17	4	multi	[{"x": 1153.7774239806065, "y": 473.50766973943655, "radius": 11.219730765591262, "color": "#E67E22", "type": "circle"}]
29	General 149-04	149-04		t	100	1	multi	[{"x": 594.9857141612513, "y": 489.59942735821096, "radius": 21.18953211736717, "color": "#F39C12", "type": "diamond"}]
31	General 300-04	300-04		t	100	1	multi	[{"x": 663.8518402066196, "y": 488.6897640300577, "radius": 21.18953211736717, "color": "#6C3483", "type": "diamond"}]
19	Piperack U-300	300-03		f	10	1	multi	[{"x": 694.412999037999, "y": 286.88421917588585, "width": 111.23136123136135, "height": 17.611632194965523, "color": "#F39C12", "type": "rect"}]
15	Piperack Norte #1 - Interconexiones	149-02		f	4	1	multi	[{"points": [599.3658008658009, 353.04834054834055, 599.3658008658009, 286.976911976912, 693.4675324675325, 286.976911976912, 693.4675324675325, 305.66378066378064, 619.387445887446, 305.66378066378064, 619.387445887446, 352.3809523809524], "color": "#3498DB", "type": "polygon"}]
37	Lime Area/Tailings	CWA-001		f	0	6	multi	[{"x": 60.6317254174397, "y": 88.33024118738405, "width": 60.16697588126159, "height": 107.53246753246754, "color": "#E67E22", "type": "rect"}]
42	Yellowcake / Dynasand 	CWA-06		f	0	6	multi	[{"x": 390.10473437549945, "y": 490.5442286776851, "width": 74.67581029097528, "height": 72.00949038120513, "color": "#3498DB", "type": "rect"}]
38	Counter Current Decantation (CCD)	CWA-02		f	0	6	multi	[{"x": 69.59276437847866, "y": 302.11502782931353, "width": 326.4378478664193, "height": 57.606679035250465, "color": "#2ECC71", "type": "rect"}]
41	Ammonia Handling System	CWA-05		f	0	6	multi	[{"x": 18.813543599257887, "y": 442.7179962894249, "width": 89.61038961038965, "height": 107.74582560296841, "color": "#BDC3C7", "type": "rect"}]
39	Leaching	CWA-03		f	0	6	multi	[{"x": 391.1233766233767, "y": 237.89424860853433, "width": 67.20779220779218, "height": 117.34693877551018, "color": "#34495E", "type": "rect"}]
44	General	CWA-00		f	0	6	\N	null
40	Old Boiler Plant (New Crystallizer) / Old Acid Plant	CWA-04		f	0	6	multi	[{"x": 520.7874023847061, "y": 209.94664661788164, "width": 88.0107764143637, "height": 179.5792229259684, "color": "#9B59B6", "type": "rect"}]
43	Calciner	CWA-06 		f	0	6	multi	[{"x": 464.7805446664747, "y": 464.7630531091055, "width": 160.01959348066134, "height": 62.23042378622665, "color": "#F1C40F", "type": "rect"}]
33	Piperack Norte #2 - Interconexiones	149-05		f	5	1	multi	[{"x": 687.461038961039, "y": 306.34970739137407, "width": 10.196208112874842, "height": 115.4025372775373, "color": "#2ECC71", "type": "rect"}]
36	Piperack Sur #2 - Interconexiones	149-07		f	8	1	multi	[{"points": [859.8559606031572, 337.68289668310985, 832.5115862243302, 337.68289668310985, 832.5115862243302, 412.30155631964, 868.1983121085623, 443.35404200689163, 1346.9565957242962, 443.35404200689163, 1346.9565957242962, 229.69440168117498, 1335.8334603837563, 229.69440168117498, 1335.8334603837563, 432.23076355175675, 868.1983121085623, 432.23076355175675, 841.3174017022576, 405.81297722081126, 841.3174017022576, 346.025355524461, 859.3924966306348, 346.025355524461], "color": "#E74C3C", "type": "polygon"}]
\.


--
-- Data for Name: cwp; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.cwp (id, nombre, codigo, descripcion, cwa_id, disciplina_id, secuencia, duracion_dias, fecha_inicio_prevista, fecha_fin_prevista, porcentaje_completitud, estado, restricciones_levantadas, restricciones_json, metadata_json) FROM stdin;
38	Tuberia - Preparada	CWP-149-03-MET-0001		16	6	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
205	Desmantelamiento I&C /Reubicación (de requerirse)	CWP-005-01-INS-0001		9	1	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"REVISADO": "YES", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n"}
52	Tuberias - Tie-ins de interconexión	CWP-149-01-MET-0002		14	6	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
147	General Civil 038-00	CWP-038-00-CIV-0001		30	4	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "N/A", "Rest. Ejecuci\\u00f3n": "Pre-Parada"}
148	General Mecánico 038-00	CWP-038-00-MEC-0001		30	5	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "N/A", "Rest. Ejecuci\\u00f3n": "Pre-Parada"}
146	General Instrumentación y Control 038-00	CWP-038-00-INS-0001		30	1	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "Rest. Tipo Trabajo": "N/A"}
47	Electrico - Bandeja, cableado, iluminación, puesta a tierra 	CWP-149-02-ELE-0001		15	2	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
46	Tuberia - Parada	CWP-149-02-MET-0002		15	6	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
17	Mecánica Equipos - Desmantelamiento	CWP-002-01-MEC-0001		10	5	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
7	Civil Demolición	CWP-002-01-CIV-0001		10	4	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
8	Civil nueva cimentación, drenajes y soportes	CWP-002-01-CIV-0002		10	4	6	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
22	Instrumentación - Nuevo	CWP-002-01-INS-0002		10	1	11	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
3	Civil - Soporteria	CWP-002-03-CIV-0002		12	4	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "N/A", "EWP Scope": "EWP HATCH Scope"}
34	Civil - Demolición	CWP-149-03-CIV-0001		16	4	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
19	Electrica - desmantelamiento	CWP-002-01-ELE-0001		10	2	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
5	Tuberias, cableado y conexionado	CWP-002-03-ELE-0002		12	2	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope"}
59	Tuberia - Preparada	CWP-300-01-MET-0001		17	6	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
49	Demoliciones ConcretoRack	CWP-149-01-CIV-0001		14	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "NOTAS": "", "REVISADO": "YES"}
53	Electrica Bandejas /cableado / puesta a tierra	CWP-149-01-ELE-0001		14	2	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
54	Obras I&C Cableado / Instrumentos / Válvulas	CWP-149-01-INS-0001		14	1	6	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
40	Obras Electricas Preparada	CWP-149-03-ELE-0001		16	2	8	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
37	Mecánica Equipos - Nuevos	CWP-149-03-MEC-0002		16	5	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
44	Civil - Nuevas Estructuras	CWP-149-02-CIV-0002		15	4	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
36	Mecánica Equipos - Desmantelamiento (preparada)	CWP-149-03-MEC-0001		16	5	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
60	Tuberia - Parada	CWP-300-01-MET-0002		17	6	6	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
207	 Montaje y Conexionado Tuberias Nuevas	CWP-038-02-MET-0002		22	6	9	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
192	Instalación de Tuberias Nuevas	CWP-002-01-MET-0003		10	6	10	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n"}
145	General Procesos 038-00	CWP-038-00-PRO-0001		30	7	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "Rest. Tipo Trabajo": "N/A", "REVISADO": "YES"}
75	Soportes	CWP-139-01-CIV-0001		24	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "No HATCH EWP Scope", "REVISADO": "YES"}
73	I&C Cableado / Instrumentos /Válvulas	CWP-038-02-INS-0001		22	1	7	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
69	Obras Electricas Bandejas / Cableado / Iluminación / Puesta a Tierra	CWP-038-02-ELE-0001		22	2	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
86	Instalación motor, puesta a tierra	CWP-300-02-ELE-0001		18	2	7	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
64	Tuberias - Tuberia nuevas montaje	CWP-300-03-MET-0001		19	6	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
100	Civil - Demolición y mamposteria en SE	CWP-002-04-CIV-0001		13	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
94	Electrica - Conexionado de cableado y canalizaciones	CWP-146-01-ELE-0002		26	2	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
103	Conexionado, configuración y pruebas (Ej MAC)	CWP-002-04-INS-0002		13	1	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
23	Demoliciones Concreto/Metalico Estructura	CWP-005-01-CIV-0001		9	4	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "NOTAS": "D", "REVISADO": "YES"}
93	Electrica - Instalación de Equipos Electricos /Retrofit SE/Pruebas	CWP-146-01-ELE-0001		26	2	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
67	I&C Cableado / Instrumentos /Válvulas	CWP-300-03-INS-0001		19	1	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
43	Civil - Reforzamiento	CWP-149-02-CIV-0001		15	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
66	Electrica Bandejas /cableado / Iluminación /puesta a tierra	CWP-300-03-ELE-0001		19	2	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
105	Civil - Estructuras-piperack/Soportes de tuberia-bandeja	CWP-137-01-CIV-0001		23	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"EWP Scope": "No HATCH EWP Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
111	Electrica - Malla de puesta a tierra	CWP-038-01-ELE-0001		21	2	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
152	General Procesos 002-00	CWP-002-00-PRO-0001		32	7	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "N/A"}
112	Tuberia - Instalación tuberias enterradas - Drenajes	CWP-038-01-MET-0001		21	6	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
203	 Obras Electricas Instalación de Equipos Electricos /Retrofit SE/Pruebas	CWP-002-03-ELE-0003		12	2	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n"}
89	Soportes	CWP-002-02-CIV-0001		11	4	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
61	Instalación motor,  puesta a tierra, conexionado	CWP-300-01-ELE-0001		17	2	7	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
108	I&C - cableado/conduit, instalacion de instrumentos y válvulas	CWP-137-01-INS-0001		23	1	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "REVISADO": "YES"}
172	Tuberia - Parada	CWP-149-05-MET-0001		33	6	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Parada", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n"}
107	Tuberias - Parada (conexiones)	CWP-137-01-MET-0002		23	6	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Parada", "REVISADO": "YES"}
208	Montaje de Equipos Nuevos	CWP-002-02-MEC-0002		11	5	4	\N	\N	\N	0	NO_INICIADO	f	\N	{}
114	Civil - Adecuación final del terreno, area de mantenimiento/acceso	CWP-038-01-CIV-0003		21	4	9	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
151	General Electrica 038-00	CWP-038-00-ELE-0001		30	2	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "Rest. Tipo Trabajo": "N/A"}
48	I&C - Bandeja / cableado /Instrumentos / Valvulas	CWP-149-02-INS-0001		15	1	6	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
123	Tuberias - Parada (conexiones)	CWP-037-01-MET-0002		20	6	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
9	Tuberias desmantelamiento	CWP-002-01-MET-0001		10	6	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
120	SCI  - Fire and Gas y sistema contra incendio	CWP-038-01-CIN-0001		21	3	11	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
50	Civil - Cimentaciones/estructuras-piperack/Soportes de tuberia-bandeja	CWP-149-01-CIV-0002		14	4	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
167	Desmantelamiento SCI (reubicar monitor)	CWP-038-02-INS-0002		22	1	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Reubicaci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "REVISADO": "YES"}
18	Mecánica Equipos nuevas bombas	CWP-002-01-MEC-0002		10	5	7	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
45	Tuberia - Preparada (Montaje, steam tracing)	CWP-149-02-MET-0001		15	6	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
176	 Revamp Bombas centrifugas 149-AR-P-2310 A/B	CWP-149-03-MEC-0003		16	5	6	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
29	Desmantelamiento de equipos (11)	CWP-005-01-MEC-0001		9	5	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
10	Tuberias nuevas	CWP-002-01-MET-0002		10	6	8	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
175	Tuberia - PreParada	CWP-149-06-INS-0001		34	1	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "No HATCH EWP Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n"}
71	Tuberias - Tuberia nuevas montaje	CWP-038-02-MET-0001		22	6	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
76	Electrica - Bandejas/Conduit/Cables (Pre-parada)	CWP-139-01-ELE-0001		24	2	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
39	Instalación Tubería Parada	CWP-149-03-MET-0002		16	6	7	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
25	Desmantelamiento de líneas	CWP-005-01-MET-0001		9	6	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
117	Mecánica Equipos - Montaje de modulos/equipos	CWP-038-01-MEC-0001		21	5	6	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
118	Obras Electricas	CWP-038-01-ELE-0002		21	2	7	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope"}
21	Instrumentación - desmantelamiento	CWP-002-01-INS-0001		10	1	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
51	Tuberias - Tuberia nuevas montaje	CWP-149-01-MET-0001		14	6	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
55	Civil - reforzamiento	CWP-300-01-CIV-0001		17	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
56	Civil - Cimentaciones, drenajes	CWP-300-01-CIV-0002		17	4	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
57	Revamp del Recipiente BATCH DRUM AR-D-302C	CWP-300-01-MEC-0001		17	5	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
204	Tie-ins Conexión Tuberias Nuevas 	CWP-121-01-MET-0002		35	6	3	\N	\N	\N	0	NO_INICIADO	f	\N	{}
121	Civil - Cimentaciones, estructuras y soportes	CWP-037-01-CIV-0001		20	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
161	General Mecánica 149-04	CWP-149-04-MEC-0001		29	5	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"NOTAS": "d", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "N/A"}
30	Desmantelamiento electrico (cables/motores)/Reubicación (de requerirse)	CWP-005-01-ELE-0001		9	2	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
126	Civil - Cimentación/Estructura/Drenajes/Soportes	CWP-149-03-CIV-0002		16	4	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
162	General Procesos 300-04	CWP-300-04-PRO-0001		31	7	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "N/A"}
194	Montaje de Bombas Nuevas	CWP-300-01-MEC-0002		17	5	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
63	Civil - Cimentaciones/estructuras-piperack/Soportes de tuberia-bandeja	CWP-300-03-CIV-0001		19	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
74	Sistema contra incendios/f&G	CWP-038-02-CIN-0001		22	3	8	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
82	Mecánica Equipos - Desmantelamiento	CWP-300-02-MEC-0001		18	5	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
109	Electrica Bandejas /cableado / Iluminación /puesta a tierra	CWP-137-01-ELE-0001		23	2	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "REVISADO": "YES"}
163	General Inst y Control 300-04	CWP-300-04-INS-0001		31	1	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "N/A", "EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada"}
164	General Tubería 300-04	CWP-300-04-MET-0001		31	6	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "N/A", "EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada"}
165	General Electrica 300-04	CWP-300-04-ELE-0001		31	2	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "N/A", "EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada"}
173	Tuberia - PreParada	CWP-149-05-MET-0002		33	6	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n"}
155	General Eléctrico 002-00	CWP-002-00-ELE-0001		32	2	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "N/A", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope"}
154	General Tubería 002-00	CWP-002-00-MET-0001		32	6	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "N/A", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope"}
42	Obras I&C Pre parada	CWP-149-03-INS-0001		16	1	10	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
81	Obras Civiles - Demoliciones	CWP-300-02-CIV-0001		18	4	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
83	Montaje de Bombas Nuevas 300-AR-P-308 C/D 300-AR-P-309 C/D	CWP-300-02-MEC-0002		18	5	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
199	Desmantelamiento Equipos	CWP-002-02-MEC-0001		11	5	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "REVISADO": "YES"}
88	Tuberias	CWP-002-02-MET-0001		11	6	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
102	Instalación/Montaje de Equipos/Bandejas-conduit/Cableado a 0 metros /Pruebas (Contrato Marco)	CWP-002-04-INS-0001		13	1	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
106	Tuberias - Preparada	CWP-137-01-MET-0001		23	6	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "REVISADO": "YES"}
159	General Electrica 149-04	CWP-149-04-ELE-0001		29	2	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "N/A", "REVISADO": "YES"}
153	General Inst y Control 002-00	CWP-002-00-INS-0001		32	1	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "N/A", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope"}
158	General Tubería 149-04	CWP-149-04-MET-0001		29	6	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "N/A", "REVISADO": "YES"}
156	General Procesos 149-04	CWP-149-04-PRO-0001		29	7	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "N/A", "REVISADO": "YES"}
157	General Inst y Control 149-04	CWP-149-04-INS-0001		29	1	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "N/A", "REVISADO": "YES"}
174	Tuberia - Parada	CWP-149-06-MET-0001		34	6	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n"}
62	Instalación Instrumentos - cuadros de control	CWP-300-01-INS-0001		17	1	8	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
65	Tuberias - Tie-ins de interconexión	CWP-300-03-MET-0002		19	6	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
166	General Tubería 038-00	CWP-038-00-MET-0001		30	6	0	\N	\N	\N	0	NO_INICIADO	f	\N	{"EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "Rest. Tipo Trabajo": "N/A"}
196	Obras Civiles - Cimentaciones	CWP-300-02-CIV-0002		18	4	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
197	Montaje de Tuberias	CWP-300-02-MET-0001		18	6	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
198	Montaje de Bombas Nuevas	CWP-300-02-MEC-0003		18	5	6	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
95	I&C - Instalación/Montaje de Equipos/Bandejas-conduit/Cableado a 0 metros /Pruebas (Contrato Marco)	CWP-146-01-INS-0001		26	1	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
184	Soportes y estructuras	CWP-121-01-CIV-0001		35	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
185	Tuberias nuevas - tie-ins	CWP-121-01-MET-0001		35	6	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada"}
186	I&C - Cables /Aire de instrumentos/Válvula de control e instrumentos	CWP-121-01-INS-0001		35	1	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada"}
183	Estructural-Civil	CWP-149-07-CIV-0001		36	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n"}
181	Electrico	CWP-149-07-ELE-0001		36	2	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n"}
182	Instrumentación	CWP-149-07-INS-0001		36	1	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n"}
26	Reubicación de Lineas (5)	CWP-005-01-MET-0002		9	6	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
70	Mecánica Equipos - Montaje de Recipiente y bombas nuevas	CWP-038-02-MEC-0001		22	5	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
189	hola	CWP-CWA-001-P-0001		37	19	0	\N	\N	\N	0	NO_INICIADO	f	\N	{}
206	Obras I&C Instalación Instrumentos	CWP-300-02-INS-0001		18	1	8	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
104	Conexionado electrico	CWP-002-04-ELE-0001		13	2	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
110	Civil - Adecuación del terreno, Pilotaje, Cimentaciones, drenajes (todos)	CWP-038-01-CIV-0001		21	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
200	Obras Electricas	CWP-002-02-ELE-0001		11	2	6	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
122	Tuberias - Preparada	CWP-037-01-MET-0001		20	6	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope"}
201	Obras I&C	CWP-002-02-INS-0001		11	1	7	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "REVISADO": "YES"}
2	Civil - Demolición y mamposteria en SE	CWP-002-03-CIV-0001		12	4	1	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Desmantelamiento/Demolici\\u00f3n", "Rest. Ejecuci\\u00f3n": "N/A", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
113	Civil - Estructuras-piperack/Soportes de tuberia-bandeja	CWP-038-01-CIV-0002		21	4	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
4	Electrica - Instalación de Equipos Electricos /Retrofit SE/Pruebas	CWP-002-03-ELE-0001		12	2	3	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope"}
101	Civil - Soporteria	CWP-002-04-CIV-0002		13	4	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Pre-Parada", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
115	Civil - Plataformas y escaleras - Ergonomía	CWP-038-01-CIV-0004		21	4	10	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
116	Tuberia - Instalación y montaje de tuberias nueva	CWP-038-01-MET-0002		21	6	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
124	Electrica - Canalizaciones y puesta a tierra	CWP-037-01-ELE-0001		20	2	4	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
191	Reubicación de Líneas (5)	CWP-005-01-MET-0003		9	6	7	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
125	I&C - cableado/conduit, instalacion de instrumentos y válvulas	CWP-037-01-INS-0001		20	1	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
20	Electrica - nuevo /puesta a tierra /Cableado desde la bomba hasta la sub estación	CWP-002-01-ELE-0002		10	2	9	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
41	Obras Electricas Parada	CWP-149-03-ELE-0002		16	2	9	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
193	 Tie-ins de Interconexión	CWP-149-01-MET-0003		14	6	7	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
68	Civil - Cimentaciones/estructuras-piperack/Soportes de tuberia-bandeja	CWP-038-02-CIV-0001		22	4	2	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope", "REVISADO": "YES"}
202	Tie-in´s Conexión Tuberias Nuevas	CWP-002-02-MET-0002		11	6	5	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Ejecuci\\u00f3n": "Parada", "EWP Scope": "EWP HATCH Scope", "Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "REVISADO": "YES"}
119	Obras I&C	CWP-038-01-INS-0001		21	1	8	\N	\N	\N	0	NO_INICIADO	f	\N	{"Rest. Tipo Trabajo": "Instalaci\\u00f3n/Construcci\\u00f3n", "Rest. Ejecuci\\u00f3n": "Pre-Parada", "EWP Scope": "EWP HATCH Scope"}
\.


--
-- Data for Name: cwp_columnas_metadata; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.cwp_columnas_metadata (id, nombre, tipo_dato, opciones_json, proyecto_id, orden) FROM stdin;
1	Rest. Ejecución	SELECCION	["N/A", "Parada", "Pre-Parada"]	1	0
3	EWP Scope	SELECCION	["No HATCH EWP Scope", "EWP HATCH Scope"]	1	0
2	Rest. Tipo Trabajo	SELECCION	["N/A", "Reubicaci\\u00f3n", "Desmantelamiento/Demolici\\u00f3n", "Instalaci\\u00f3n/Construcci\\u00f3n"]	1	0
6	CWP Number	TEXTO	[]	3	0
7	REVISADO	SELECCION	["YES"]	1	0
\.


--
-- Data for Name: disciplinas; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.disciplinas (id, nombre, codigo, descripcion, proyecto_id) FROM stdin;
1	Instrumentacion	INS	\N	1
2	Electrica	ELE	\N	1
3	Sistema Contra Incendios	CIN	\N	1
5	Mecánica	MEC	\N	1
4	Civil	CIV	\N	1
6	Tuberias	MET	\N	1
7	Procesos	PRO	\N	1
8	Gestion	GES	\N	1
9	Multidoscipline	X	\N	3
10	Site Development	A	\N	3
11	Concrete	C	\N	3
12	Civil Works	D	\N	3
13	Earthworks	E	\N	3
14	Architectural	F	\N	3
15	Control & Instrumentation	J	\N	3
16	Electrical	L	\N	3
17	Mechanical	M	\N	3
18	Mobile Equipment	O	\N	3
19	Piping	P	\N	3
20	Refractory & Insulation, Fire Proofing	Q	\N	3
21	Cable Ladder, Tray & Conduit	R	\N	3
22	Structural Steel	S	\N	3
23	Preliminaries & Specific Temp. Works	U	\N	3
24	Wire & Cable	W	\N	3
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.items (id, nombre, descripcion, tipo_entregable_id, paquete_id, source_item_id, version, estado, porcentaje_completitud, archivo_url, es_entregable_cliente, requiere_aprobacion, metadata_json, fecha_creacion, fecha_actualizacion) FROM stdin;
117	Act cantidades de obra desmantelamiento	\N	\N	119	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 02:06:10.642241	2025-11-27 02:06:10.642245
118	Doc de CWP y EWP	\N	\N	119	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 02:06:10.643151	2025-11-27 02:06:10.643154
119	Act cantidades de obra desmantelamiento	\N	\N	117	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 02:07:41.556608	2025-11-27 02:07:41.556611
207	Elaborar Bases y Criterios de diseño Civil-Estructural	\N	\N	139	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:27:06.42989	2025-11-27 19:27:06.429892
563	Documento alcance EWP-002-01-INS-0001	\N	\N	7	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:24:36.004042	2025-12-18 13:24:36.004047
568	Diagramas de Cajas de Conexionado	\N	\N	13	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:25:35.154254	2025-12-18 13:25:35.154258
576	Documento alcance CWP-002-01-INS-0002	\N	\N	13	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:25:35.175538	2025-12-18 13:25:35.175539
793	Cantidades de obra	\N	\N	209	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:59:04.198311	2025-12-18 18:59:04.198313
378	Actualizar datasheet bomba P-2310 C (Bomba/motor/sellos)	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.262249	2025-11-27 21:37:17.262251
381	Elaborar MR canister	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.276863	2025-11-27 21:37:17.276865
385	Actualizar cantidades de obra equipos mecánicos	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.284181	2025-11-27 21:37:17.284182
1089	Realizar Verificación hidráulica de tuberías	\N	\N	168	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:02:12.895842	2025-12-19 16:02:12.895845
1093	Elaborar Documento alcance CWP-038-01-INS-0002	\N	\N	168	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:02:12.912101	2025-12-19 16:02:12.912102
1097	Documento alcance CWP-038-02-ELE-0001	\N	\N	48	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:03:23.229806	2025-12-19 16:03:23.229808
1098	Modelo 3D	\N	\N	224	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:12:44.335221	2025-12-19 16:12:44.335226
446	Elaborar planos de desmantelamiento, cartillas	\N	\N	16	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:23:15.012695	2025-12-18 12:23:15.012704
449	Actualizar cantidades obra	\N	\N	14	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:23:54.23359	2025-12-18 12:23:54.233593
1109	Documento alcance CWP-146-01-ELE-0001	\N	\N	80	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:16:42.988902	2025-12-19 16:16:42.988903
1113	Documento alcance EWP-038-02-MET-0002	\N	\N	225	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:36:01.049559	2025-12-19 16:36:01.049561
459	Documento alcance EWP-005-01-MEC-0001	\N	\N	15	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:25:46.104404	2025-12-18 12:25:46.104405
475	Modelo 3D	\N	\N	47	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:13:19.887073	2025-12-18 13:13:19.887074
480	Planos de detalle bombas	\N	\N	49	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:14:33.567164	2025-12-18 13:14:33.567165
499	Diagramas de lazo	\N	\N	52	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:06.513009	2025-12-18 13:16:06.513014
505	Planimetría de Ubicación de Instrumentos	\N	\N	52	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:06.530144	2025-12-18 13:16:06.530145
1116	Cantidades de obra de Instalación de I&C	\N	\N	29	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:43:15.353429	2025-12-19 16:43:15.353431
1119	Planimetría de Rutas de bandejas, Conduit y cables	\N	\N	29	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:43:15.364394	2025-12-19 16:43:15.364398
1126	Actualizar PFD	\N	\N	141	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:08.751645	2025-12-19 16:47:08.751648
1132	Actualizar reporte de Sostenibilidad, huella de carbono y huella de agua	\N	\N	141	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:08.767757	2025-12-19 16:47:08.767759
1136	Elaborar Modelo 3D	\N	\N	167	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:04.612045	2025-12-19 16:48:04.612049
1139	Actualizar Key-Plan	\N	\N	167	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:04.621716	2025-12-19 16:48:04.621719
1145	Elaborar Listado de Elementos Especiales	\N	\N	167	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:04.636717	2025-12-19 16:48:04.636719
1148	Actualizar Diagramas Esquemáticos de Control y Protección	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.273512	2025-12-19 16:48:42.273515
1156	Actualizar MR para Extensión Tablero SW Cracking existente en SE 2.1.	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.294642	2025-12-19 16:48:42.294643
1161	Actualizar de Memorias de Cálculo de cables y canalizaciones	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.304395	2025-12-19 16:48:42.304396
1164	Realizar Estudio de Coordinación de Arc Flash	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.312108	2025-12-19 16:48:42.312108
1168	P&IDs (LOE)	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.933676	2025-12-19 16:49:30.933679
1175	Elaborar Matriz Causa-Efecto (PCS, SIS)	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.957187	2025-12-19 16:49:30.957188
1180	Elaborar Hoja de Datos Válvulas de Control y Autorreguladas	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.968086	2025-12-19 16:49:30.968087
1184	Elaborar Requisición de Materiales Válvulas de Control y Autorreguladas	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.973212	2025-12-19 16:49:30.973213
1186	Elaborar Cantidades de obra de Instalación de I&C (transversales)	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.977351	2025-12-19 16:49:30.977351
1190	Elaborar Reporte Definición de Interface U-038 con otras Unidades	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.982164	2025-12-19 16:49:30.982164
564	Listado Desmantelamiento de Instrumentos	\N	\N	7	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:24:36.004944	2025-12-18 13:24:36.004947
205	Elaborar Planos de Notas y Estándares Estructurales	\N	\N	139	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:27:06.427975	2025-11-27 19:27:06.427977
214	Actualizar hidráulica con información de ID de equipos	\N	\N	150	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:27.235136	2025-11-27 19:55:27.235138
215	Actualizar listado de Señales	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.749601	2025-11-27 19:55:49.749606
222	Elaborar Hoja de Datos Instrumentos	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.772717	2025-11-27 19:55:49.772718
227	Elaborar Especificación Técnica Ampliación Sistema de Control (PCS)	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.789064	2025-11-27 19:55:49.789065
230	Actualizar Plot-Plan	\N	\N	153	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:56:08.874255	2025-11-27 19:56:08.874258
234	Elaborar de planos de ruteo de potencia	\N	\N	152	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:56:29.709267	2025-11-27 19:56:29.70927
567	Modelo 3D	\N	\N	13	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:25:35.15214	2025-12-18 13:25:35.152144
573	Listado de materiales MTO	\N	\N	13	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:25:35.173738	2025-12-18 13:25:35.17374
376	Actualizar datasheet bomba 149-XX-P2312B	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.260991	2025-11-27 21:37:17.260993
805	MTO	\N	\N	210	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:31.114272	2025-12-18 19:03:31.114273
808	Documento alcance EWP-300-02-ELE-0001	\N	\N	73	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:59.778899	2025-12-18 19:03:59.778902
1090	Elaborar Documento alcance EWP-038-01-INS-0002	\N	\N	168	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:02:12.896303	2025-12-19 16:02:12.896305
1095	Planimetría	\N	\N	48	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:03:23.225215	2025-12-19 16:03:23.225219
1100	Planimetría de Ubicación de Instrumentos	\N	\N	224	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:12:44.33656	2025-12-19 16:12:44.336562
1104	Diagramas de lazo	\N	\N	224	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:12:44.350788	2025-12-19 16:12:44.350789
565	Documento alcance CWP-002-01-INS-0001	\N	\N	7	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:24:36.005567	2025-12-18 13:24:36.005569
204	Elaborar Reporte estudio detección de enterrados - Complementario	\N	\N	139	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:27:06.426613	2025-11-27 19:27:06.426619
569	Diagramas de Conexionado (PCS)	\N	\N	13	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:25:35.156294	2025-12-18 13:25:35.156296
1169	Elaborar Reporte de Niveles de Integridad (SIL) (Cálculos)	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.935066	2025-12-19 16:49:30.935068
216	Elaborar Listado Bandejas y Cables	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.750319	2025-11-27 19:55:49.750322
218	Actualizar listado de Instrumentos	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.759327	2025-11-27 19:55:49.759329
221	Actualizar base de Datos de Alarmas y Eventos	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.772279	2025-11-27 19:55:49.77228
226	Elaborar Requisición de Materiales Instrumentos	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.788785	2025-11-27 19:55:49.788785
229	Elaborar Modelo 3D	\N	\N	153	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:56:08.873719	2025-11-27 19:56:08.873722
572	Planimetría de Ubicación de Instrumentos	\N	\N	13	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:25:35.166981	2025-12-18 13:25:35.166982
575	Documento alcance EWP-002-01-INS-0002	\N	\N	13	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:25:35.175017	2025-12-18 13:25:35.175018
824	Modelo 3D	\N	\N	75	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:08:43.576373	2025-12-18 19:08:43.576378
374	Actualizar datasheet canister	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.259487	2025-11-27 21:37:17.259493
380	Elaborar Planos de detalle bombas	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.276101	2025-11-27 21:37:17.276103
828	Calc de flexibilidad	\N	\N	75	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:08:43.58852	2025-12-18 19:08:43.588521
448	Elaborar planos de desmantelamiento, cartillas	\N	\N	14	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:23:54.228867	2025-12-18 12:23:54.228877
833	Documento alcance CWP-002-02-MET-0001	\N	\N	75	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:08:43.605674	2025-12-18 19:08:43.605675
842	Modelo 3D	\N	\N	76	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:11:13.573872	2025-12-18 19:11:13.573873
455	Documento alcance CWP-005-01-MEC-0001	\N	\N	15	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:25:46.102293	2025-12-18 12:25:46.102297
461	Cantidades obra	\N	\N	17	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:26:25.502444	2025-12-18 12:26:37.20014
463	ET para traslado provisional redes	\N	\N	20	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:28:49.976967	2025-12-18 12:28:49.97697
466	Key-plan con tuberías reubicadas	\N	\N	20	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:28:49.987089	2025-12-18 12:28:49.987091
473	Planos sistemas de drenaje y enterrados	\N	\N	47	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:13:19.885791	2025-12-18 13:13:19.885792
477	Especificación tk drenaje superficial	\N	\N	49	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:14:33.563016	2025-12-18 13:14:33.563019
485	Modelo 3D	\N	\N	49	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:14:33.586655	2025-12-18 13:14:33.586656
488	Planos Arreglos Generales de Tubería (Plantas y Elevaciones)	\N	\N	50	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:15:07.151588	2025-12-18 13:15:07.15159
490	Listado de Válvulas Manuales	\N	\N	50	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:15:07.162162	2025-12-18 13:15:07.162165
492	MTO	\N	\N	50	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:15:07.173655	2025-12-18 13:15:07.173657
502	Cantidades de obra de Instalación de I&C	\N	\N	52	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:06.515014	2025-12-18 13:16:06.515016
506	Planimetría de Rutas de bandejas, Conduit y cables	\N	\N	52	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:06.532921	2025-12-18 13:16:06.532923
513	Diagramas de Cajas de Conexionado F&G	\N	\N	53	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:31.939039	2025-12-18 13:16:31.93904
846	Actualización de plano de malla existente para la conexión de las nuevas bombas	\N	\N	213	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:12:23.793701	2025-12-18 19:12:23.793704
859	Documento alcance EWP-002-02-INS-0001	\N	\N	214	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:13:31.931482	2025-12-18 19:13:31.931483
861	Cantidades de obra	\N	\N	215	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:14:28.140852	2025-12-18 19:14:28.14086
869	Cantidades de obra	\N	\N	82	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:21:37.565621	2025-12-18 19:21:37.565628
879	Planimetría	\N	\N	216	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:24:56.466355	2025-12-18 19:24:56.466357
882	Documento alcance EWP-002-03-CIV-0002	\N	\N	217	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:25:36.010912	2025-12-18 19:25:36.010916
890	Diagramas Esquemáticos Típicos de Control y Protección	\N	\N	92	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:26:54.337632	2025-12-18 19:26:54.337636
893	Documento alcance CWP-002-03-MEC-0002	\N	\N	92	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:26:54.349352	2025-12-18 19:26:54.349353
896	Documento alcance CWP-002-03-ELE-0003	\N	\N	218	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:31:59.719407	2025-12-18 19:31:59.719409
906	Documento alcance CWP-121-01-MET-0001	\N	\N	188	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:36.936639	2025-12-18 19:33:36.936641
912	Documento alcance CWP-121-01-MET-0002	\N	\N	219	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:34:58.846234	2025-12-18 19:34:58.846237
1091	Elaborar planos de desmantelamiento, cartillas	\N	\N	168	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:02:12.897847	2025-12-19 16:02:12.897849
1096	Documento alcance EWP-038-02-ELE-0001	\N	\N	48	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:03:23.228966	2025-12-19 16:03:23.228969
1099	Planimetría de Rutas de bandejas, Conduit y cables	\N	\N	224	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:12:44.335998	2025-12-19 16:12:44.336
1106	Estudio de Arc Flash	\N	\N	80	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:16:42.986394	2025-12-19 16:16:42.986396
1112	Documento alcance CWP-038-02-MET-0002	\N	\N	225	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:36:01.049015	2025-12-19 16:36:01.049018
1121	Documento alcance EWP-149-03-INS-0001	\N	\N	29	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:43:15.370107	2025-12-19 16:43:15.370108
1123	Diagramas de lazo	\N	\N	29	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:43:15.375831	2025-12-19 16:43:15.375832
1127	Actualizar estudio hidráulico relacionado con ISBL Vendor	\N	\N	141	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:08.752189	2025-12-19 16:47:08.752191
1129	Actualizar diagramas de procesos con información vendor	\N	\N	141	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:08.76529	2025-12-19 16:47:08.765292
1134	Actualizar Modelo 3D	\N	\N	138	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:39.643517	2025-12-19 16:47:39.64352
1144	Elaborar Listado de Tie-Ins	\N	\N	167	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:04.636304	2025-12-19 16:48:04.636305
1146	Elaborar de planos de ruteo de iluminación	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.27035	2025-12-19 16:48:42.270355
1165	Elaborar de MR para nuevo Tablero de Iluminación.	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.317807	2025-12-19 16:48:42.317808
201	Actulizar Bases y Criterios de Diseño de I&C	\N	\N	110	\N	1	VINCULADO	0	\N	f	t	\N	2025-11-27 18:22:11.790987	2025-12-19 16:49:17.67501
1176	Elaborar Listado de Instrumentos	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.958432	2025-12-19 16:49:30.958433
1181	Elaborar Requisición de Materiales Transmisores de Flujo	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.968373	2025-12-19 16:49:30.968374
1182	Elaborar Requisición de Materiales Indicadores de Presión, temp y nivel	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.972454	2025-12-19 16:49:30.972455
1189	Elaborar Términos de Referencia para Contrato MAC	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.981643	2025-12-19 16:49:30.981644
208	Elaborar Reporte estudio de Topografía - Complementario	\N	\N	139	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:27:06.431657	2025-11-27 19:27:06.431659
566	P&IDs de Desmantelamiento	\N	\N	7	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:24:36.007359	2025-12-18 13:24:36.007361
822	Documento alcance CWP-300-02-MEC-0002	\N	\N	211	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:06:04.333082	2025-12-18 19:06:04.333083
830	Especificación Técnica para Montaje de Tubería	\N	\N	75	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:08:43.60438	2025-12-18 19:08:43.604382
377	Actualizar MR bombas	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.261521	2025-11-27 21:37:17.261523
835	Cantidades de obra desmantelamiento	\N	\N	212	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:09:49.148725	2025-12-18 19:09:49.14873
839	Documento alcance EWP-002-02-MEC-0001	\N	\N	212	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:09:49.160993	2025-12-18 19:09:49.160995
447	Actualizar cantidades obra	\N	\N	16	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:23:15.013523	2025-12-18 12:23:15.013525
840	Documento alcance CWP-002-02-CIV-0001	\N	\N	76	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:11:13.572379	2025-12-18 19:11:13.572386
849	Actualización Planimetría de la nueva Clasificación del área	\N	\N	213	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:12:23.795332	2025-12-18 19:12:23.795333
456	Planos de desmantelamiento, cartillas	\N	\N	15	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:25:46.102841	2025-12-18 12:25:46.102844
474	Memorías de cálculo sistemas de drenaje	\N	\N	47	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:13:19.886589	2025-12-18 13:13:19.886591
478	Listado de eq mecánicos (MEL)	\N	\N	49	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:14:33.565507	2025-12-18 13:14:33.56551
484	Documento alcance CWP-038-02-MEC-0001	\N	\N	49	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:14:33.586192	2025-12-18 13:14:33.586193
494	Documento alcance EWP-038-02-MET-0001	\N	\N	50	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:15:07.175005	2025-12-18 13:15:07.175006
501	Documento alcance EWP-038-02-INS-0001	\N	\N	52	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:06.514254	2025-12-18 13:16:06.514256
511	Diagramas de lazo F&G	\N	\N	53	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:31.926511	2025-12-18 13:16:31.926513
853	Diagramas de Conexionado (PCS)	\N	\N	214	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:13:31.888933	2025-12-18 19:13:31.888935
856	Planimetría de Ubicación de Instrumentos	\N	\N	214	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:13:31.901576	2025-12-18 19:13:31.901576
862	Documento alcance EWP-002-02-MET-0002	\N	\N	215	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:14:28.147743	2025-12-18 19:14:28.147749
871	Documento alcance EWP-146-01-ELE-0002	\N	\N	82	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:21:37.572424	2025-12-18 19:21:37.572426
875	Documento alcance EWP-146-01-INS-0001	\N	\N	81	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:21:58.081389	2025-12-18 19:21:58.081391
878	Documento alcance EWP-002-03-CIV-0001	\N	\N	216	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:24:56.465577	2025-12-18 19:24:56.46558
881	Cantidades de obra	\N	\N	217	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:25:36.00245	2025-12-18 19:25:36.002454
888	Documento alcance CWP-002-03-ELE-0001	\N	\N	90	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:26:03.526332	2025-12-18 19:26:03.526333
895	Cantidades de obra	\N	\N	218	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:31:59.718823	2025-12-18 19:31:59.718827
900	Documento alcance EWP-121-01-CIV-0001	\N	\N	187	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:17.938821	2025-12-18 19:33:17.938824
903	Cantidades de obra	\N	\N	188	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:36.934554	2025-12-18 19:33:36.934559
907	Planimetría	\N	\N	191	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:57.843449	2025-12-18 19:33:57.843455
910	Documento alcance EWP-121-01-INS-0001	\N	\N	191	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:57.85365	2025-12-18 19:33:57.853651
913	Planimetría	\N	\N	219	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:34:58.84676	2025-12-18 19:34:58.846762
1092	Elaborar key-plan con tuberías reubicadas	\N	\N	168	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:02:12.907576	2025-12-19 16:02:12.907579
203	Realizar Informe de flexibilidad transversal	\N	\N	50	\N	1	VINCULADO	0	\N	f	t	\N	2025-11-27 18:25:02.495674	2025-12-19 16:47:55.411172
570	Diagramas de lazo	\N	\N	13	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:25:35.15792	2025-12-18 13:25:35.157922
571	Planimetría de Rutas de bandejas, Conduit y cables	\N	\N	13	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:25:35.166076	2025-12-18 13:25:35.166079
574	Cantidades de obra de Instalación de I&C	\N	\N	13	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:25:35.174585	2025-12-18 13:25:35.174586
206	Elaborar Cantidades de obra - Civil y Estructural	\N	\N	139	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:27:06.428973	2025-11-27 19:27:06.428975
210	Elaborar Reporte estudios de Patología cimentaciones tanques 302C y 037-D303	\N	\N	139	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:27:06.44287	2025-11-27 19:27:06.442871
217	Elaborar Control loop narrative	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.758173	2025-11-27 19:55:49.758177
224	Elaborar Requisición Materiales Ampliación Sistema de Control (PCS)	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.787536	2025-11-27 19:55:49.787536
232	Elaborar Especificación Técnica para Montaje de Tubería	\N	\N	153	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:56:08.875444	2025-11-27 19:56:08.875445
233	Elaborar Típicos de Construcción y Montaje	\N	\N	152	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:56:29.705148	2025-11-27 19:56:29.705152
379	Actualizar datasheet bomba P-2310 A/B (Bomba/sellos)	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.270977	2025-11-27 21:37:17.27098
383	Actualizar listado de equipos mecánicos (MEL)	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.281812	2025-11-27 21:37:17.281813
821	Cantidades de obra	\N	\N	211	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:06:04.332464	2025-12-18 19:06:04.332466
825	Isométricos tuberías	\N	\N	75	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:08:43.58067	2025-12-18 19:08:43.580676
826	Listado de Válvulas Manuales	\N	\N	75	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:08:43.587141	2025-12-18 19:08:43.587144
832	Cantidades de Obra (sumario)	\N	\N	75	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:08:43.605356	2025-12-18 19:08:43.605357
838	P&IDs de Desmantelamiento	\N	\N	212	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:09:49.160386	2025-12-18 19:09:49.160389
844	Cimentaciones bombas	\N	\N	76	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:11:13.575422	2025-12-18 19:11:13.575424
845	Validación de las nuevas condiciones de proceso y Clasificación del área	\N	\N	213	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:12:23.782639	2025-12-18 19:12:23.782645
457	ET desmantelamiento (Colaborativo)	\N	\N	15	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:25:46.103317	2025-12-18 12:25:46.103319
464	Cantidades obra	\N	\N	20	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:28:49.977762	2025-12-18 12:28:49.977763
471	Documento alcance EWP-038-02-CIV-0001	\N	\N	47	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:13:19.884391	2025-12-18 13:13:19.884396
476	MR bombas	\N	\N	49	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:14:33.562272	2025-12-18 13:14:33.56228
482	Documento alcance EWP-038-02-MEC-0001	\N	\N	49	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:14:33.584874	2025-12-18 13:14:33.584876
487	Isométricos tuberías	\N	\N	50	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:15:07.150701	2025-12-18 13:15:07.150703
489	Cantidades de Obra (sumario)	\N	\N	50	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:15:07.159793	2025-12-18 13:15:07.159796
493	Documento alcance CWP-038-02-MET-0001	\N	\N	50	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:15:07.174024	2025-12-18 13:15:07.174025
503	Modelo 3D	\N	\N	52	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:06.51878	2025-12-18 13:16:06.518782
507	Documento alcance CWP-038-02-INS-0001	\N	\N	52	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:06.534362	2025-12-18 13:16:06.534363
509	Listado de materiales F&G	\N	\N	53	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:31.925429	2025-12-18 13:16:31.925431
514	Documento alcance CWP-038-02-CIN-0001	\N	\N	53	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:31.94177	2025-12-18 13:16:31.941772
850	Documento alcance CWP-002-02-ELE-0001	\N	\N	213	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:12:23.796453	2025-12-18 19:12:23.796457
854	Planimetría de Rutas de bandejas, Conduit y cables	\N	\N	214	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:13:31.898178	2025-12-18 19:13:31.898181
860	Documento alcance CWP-002-02-INS-0001	\N	\N	214	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:13:31.931916	2025-12-18 19:13:31.931918
863	Planimetría	\N	\N	215	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:14:28.148684	2025-12-18 19:14:28.148686
870	Planimetría	\N	\N	82	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:21:37.567785	2025-12-18 19:21:37.567788
874	Cantidades de obra	\N	\N	81	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:21:58.080847	2025-12-18 19:21:58.080849
880	Documento alcance CWP-002-03-CIV-0001	\N	\N	216	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:24:56.466764	2025-12-18 19:24:56.466765
884	Documento alcance CWP-002-03-CIV-0002	\N	\N	217	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:25:36.012278	2025-12-18 19:25:36.01228
885	Documento alcance EWP-002-03-ELE-0001	\N	\N	90	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:26:03.523744	2025-12-18 19:26:03.523752
889	Actualización de Diagramas Unifilares CCM existente 03-STAPC-0-01 SE #3	\N	\N	92	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:26:54.335559	2025-12-18 19:26:54.335565
892	Documento alcance EWP-002-03-MEC-0002	\N	\N	92	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:26:54.348155	2025-12-18 19:26:54.348156
901	Planimetría	\N	\N	187	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:17.939606	2025-12-18 19:33:17.93961
905	Documento alcance EWP-121-01-MET-0001	\N	\N	188	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:36.936	2025-12-18 19:33:36.936001
911	Cantidades de obra	\N	\N	219	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:34:58.839938	2025-12-18 19:34:58.839946
1103	Diagramas de Cajas de Conexionado	\N	\N	224	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:12:44.347598	2025-12-19 16:12:44.347601
1107	Estudio de Coordinación de Protecciones	\N	\N	80	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:16:42.987668	2025-12-19 16:16:42.98767
1114	Cantidades de obra	\N	\N	225	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:36:01.05005	2025-12-19 16:36:01.050064
1122	Documento alcance CWP-149-03-INS-0001	\N	\N	29	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:43:15.373636	2025-12-19 16:43:15.373637
1128	Actualizar listados de procesos con información vendor	\N	\N	141	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:08.756899	2025-12-19 16:47:08.756901
1133	Elaborar TOR montaje SWS Modularizada	\N	\N	138	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:39.638724	2025-12-19 16:47:39.638731
131	Listado Cables U-300	\N	\N	116	\N	1	VINCULADO	0	\N	f	t	\N	2025-11-27 02:27:10.665253	2025-11-27 16:17:11.982801
1150	Elaborar de Cantidades de obra de Instalación Eléctrica	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.274996	2025-12-19 16:48:42.274997
1159	Realizar Estudio de Flujo de carga y Corto circuito	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.303446	2025-12-19 16:48:42.303447
1163	Realizar Estudio de Coordinación de protecciones	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.309107	2025-12-19 16:48:42.309108
1166	Elaborar de Hojas de Datos para nuevo Tablero de Iluminación	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.318028	2025-12-19 16:48:42.318029
1171	Elaborar SRS	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.936199	2025-12-19 16:49:30.936201
1173	Elaborar Hoja de Datos Transmisores de Flujo	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.956084	2025-12-19 16:49:30.956086
1178	Elaborar Base de Datos de Alarmas y Eventos	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.964047	2025-12-19 16:49:30.964048
1183	Elaborar Especificación Técnica Sistema de Control (PCS, SIS)	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.972831	2025-12-19 16:49:30.972831
1185	Realizar Revisión de Información Paquete	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.977102	2025-12-19 16:49:30.977102
577	Cantidades de obra	\N	\N	201	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:26:54.12189	2025-12-18 14:26:54.121897
209	Elaborar Reporte estudio de nubes de puntos - Complementario	\N	\N	139	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:27:06.442348	2025-11-27 19:27:06.442351
213	Actualizar P&IDs y PFD del área	\N	\N	150	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:27.234464	2025-11-27 19:55:27.234468
219	Elaborar Cantidades de obra de Instalación de I&C	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.761243	2025-11-27 19:55:49.761245
225	Elaborar HMI Schematics	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.788472	2025-11-27 19:55:49.788473
228	Actualizar Key-Plan	\N	\N	153	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:56:08.872341	2025-11-27 19:56:08.872348
235	Actualizar Cantidades de obra de Instalación Eléctrica	\N	\N	152	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:56:29.710307	2025-11-27 19:56:29.710309
587	Cantidades obra	\N	\N	28	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:40:13.573684	2025-12-18 14:40:13.573687
590	Cimentación y estructura bombas, caseta, dique	\N	\N	115	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:40:52.83363	2025-12-18 14:40:52.833634
594	Documento alcance CWP-149-03-CIV-0002	\N	\N	115	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:40:52.840106	2025-12-18 14:40:52.840108
596	Documento alcance EWP-149-03-MEC-0001	\N	\N	22	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:41:38.147462	2025-12-18 14:41:38.147464
458	Cantidades obra	\N	\N	15	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:25:46.10394	2025-12-18 12:25:46.103941
460	Planos de desmantelamiento, cartillas	\N	\N	17	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:26:25.502035	2025-12-18 12:26:43.669083
462	Verificación hidráulica de tuberías re-ruteadas	\N	\N	20	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:28:49.971572	2025-12-18 12:28:49.97158
465	Isométricos	\N	\N	20	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 12:28:49.98275	2025-12-18 12:28:49.982754
472	Documento alcance CWP-038-02-CIV-0001	\N	\N	47	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:13:19.885189	2025-12-18 13:13:19.885191
479	Datasheet bombas	\N	\N	49	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:14:33.566314	2025-12-18 13:14:33.566317
483	Cantidades de obra eq mecánicos	\N	\N	49	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:14:33.585455	2025-12-18 13:14:33.585457
486	Modelo 3D	\N	\N	50	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:15:07.149976	2025-12-18 13:15:07.149981
500	Listado de materiales	\N	\N	52	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:06.513738	2025-12-18 13:16:06.51374
510	Cantidades de obra F&G	\N	\N	53	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:31.925958	2025-12-18 13:16:31.92596
515	Documento alcance EWP-038-02-CIN-0002	\N	\N	53	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:31.942241	2025-12-18 13:16:31.942243
606	Especificación Técnica para Montaje de Tubería	\N	\N	25	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:42:35.216114	2025-12-18 14:42:35.216115
610	Documento alcance CWP-149-03-MET-0001	\N	\N	25	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:42:35.233982	2025-12-18 14:42:35.233984
615	Validación de las nuevas condiciones de proceso y Clasificación del área	\N	\N	114	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:44:32.670756	2025-12-18 14:44:32.670757
629	Planimetría	\N	\N	177	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:53:45.385166	2025-12-18 14:53:45.385173
634	Planimetría	\N	\N	27	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:55:24.234801	2025-12-18 14:55:24.234804
823	Planimetría	\N	\N	211	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:06:04.333529	2025-12-18 19:06:04.33353
831	MTO	\N	\N	75	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:08:43.605029	2025-12-18 19:08:43.60503
837	Documento alcance CWP-002-02-MEC-0001	\N	\N	212	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:09:49.159337	2025-12-18 19:09:49.15934
841	Documento alcance EWP-002-02-CIV-0001	\N	\N	76	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:11:13.573055	2025-12-18 19:11:13.573057
847	Documento alcance EWP-002-02-ELE-0001	\N	\N	213	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:12:23.794228	2025-12-18 19:12:23.79423
851	Modelo 3D	\N	\N	214	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:13:31.881453	2025-12-18 19:13:31.881459
858	Cantidades de obra de Instalación de I&C	\N	\N	214	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:13:31.931054	2025-12-18 19:13:31.931056
876	Documento alcance CWP-146-01-INS-0001	\N	\N	81	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:21:58.081908	2025-12-18 19:21:58.081909
887	Planimetría	\N	\N	90	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:26:03.525774	2025-12-18 19:26:03.525776
897	Planimetría	\N	\N	218	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:31:59.719893	2025-12-18 19:31:59.719894
902	Documento alcance CWP-121-01-CIV-0001	\N	\N	187	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:17.94194	2025-12-18 19:33:17.941942
904	Planimetría	\N	\N	188	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:36.935179	2025-12-18 19:33:36.935181
908	Cantidades de obra	\N	\N	191	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:57.844272	2025-12-18 19:33:57.844275
582	Documento alcance CWP-002-01-MET-0003	\N	\N	202	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:37:51.860956	2025-12-19 14:59:13.793527
1110	MR para Revamp de Gavetas en CCM 15-MCC-0-03B existente en SE 15-ENC-0-02	\N	\N	80	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:16:42.997698	2025-12-19 16:16:42.997701
220	Actualizar Matriz Causa-Efecto (PCS)	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.76984	2025-11-27 19:55:49.769841
223	Elaborar Diagramas de Conexionado (PCS)	\N	\N	151	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:55:49.786651	2025-11-27 19:55:49.786652
231	Elaborar Cantidades de obra	\N	\N	153	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:56:08.874754	2025-11-27 19:56:08.874756
236	Definir filosofía de control en válvulas de mezcla de aguas, bombas y actualización de P&ID U-002	\N	\N	148	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:57:28.89622	2025-11-27 19:57:28.896226
584	Planimetría	\N	\N	202	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:37:51.862038	2025-12-18 14:37:51.86204
481	Plano tanque enterrado	\N	\N	49	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:14:33.578609	2025-12-18 13:14:33.578612
595	Planos desmantelamiento bombas 2310 A/B, 2312 B, canister y para el transformador de distribución BT a reubicar	\N	\N	22	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:41:38.145605	2025-12-18 14:41:38.14561
820	Documento alcance EWP-300-02-MEC-0002	\N	\N	211	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:06:04.331794	2025-12-18 19:06:04.331799
827	Planos Arreglos Generales de Tubería (Plantas y Elevaciones)	\N	\N	75	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:08:43.587858	2025-12-18 19:08:43.58786
834	Documento alcance EWP-002-02-MET-0001	\N	\N	75	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:08:43.60626	2025-12-18 19:08:43.606261
836	Listado Desmantelamiento de Instrumentos	\N	\N	212	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:09:49.158652	2025-12-18 19:09:49.158655
843	Memoria de cálculo - Cimentación Bomba	\N	\N	76	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:11:13.574396	2025-12-18 19:11:13.574398
848	Actualización planos de iluminación existentes	\N	\N	213	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:12:23.794696	2025-12-18 19:12:23.794697
852	Diagramas de Cajas de Conexionado	\N	\N	214	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:13:31.888228	2025-12-18 19:13:31.888234
855	Diagramas de lazo	\N	\N	214	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:13:31.900577	2025-12-18 19:13:31.90058
857	Listado de materiales MTO	\N	\N	214	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:13:31.917836	2025-12-18 19:13:31.917837
864	Documento alcance CWP-002-02-MET-0002	\N	\N	215	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:14:28.149468	2025-12-18 19:14:28.149471
872	Documento alcance CWP-146-01-ELE-0002	\N	\N	82	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:21:37.574448	2025-12-18 19:21:37.57445
873	Planimetría	\N	\N	81	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:21:58.080149	2025-12-18 19:21:58.080154
877	Cantidades de obra	\N	\N	216	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:24:56.456828	2025-12-18 19:24:56.456833
883	Planimetría	\N	\N	217	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:25:36.011463	2025-12-18 19:25:36.011468
886	Cantidades de obra	\N	\N	90	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:26:03.525147	2025-12-18 19:26:03.52515
891	Hojas de Datos para Gavetas de CCM existente 03-STAPC-0-01 SE #3	\N	\N	92	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:26:54.345971	2025-12-18 19:26:54.345975
898	Documento alcance EWP-002-03-ELE-0003	\N	\N	218	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:31:59.720368	2025-12-18 19:31:59.720369
899	Cantidades de obra	\N	\N	187	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:17.934051	2025-12-18 19:33:17.934056
909	Documento alcance CWP-121-01-INS-0001	\N	\N	191	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:33:57.853129	2025-12-18 19:33:57.853133
914	Documento alcance EWP-121-01-MET-0002	\N	\N	219	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:34:58.847479	2025-12-18 19:34:58.847481
578	Documento alcance EWP-005-01-MET-0003	\N	\N	201	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:26:54.132232	2025-12-19 14:50:09.462811
1131	Actualizar balance servicios industriales y UFD para sistemas intervenidos	\N	\N	141	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:08.767362	2025-12-19 16:47:08.767364
1138	Elaborar Especificación Técnica para Montaje de Tubería	\N	\N	167	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:04.61335	2025-12-19 16:48:04.613352
1140	Elaborar planimetría	\N	\N	167	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:04.622198	2025-12-19 16:48:04.6222
1141	Elaborar Listado de Válvulas Manuales	\N	\N	167	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:04.630445	2025-12-19 16:48:04.630447
1147	Elaborar Típicos de Construcción y Montaje	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.272028	2025-12-19 16:48:42.272031
1151	Actualizar MR para nuevo CCM en SE #2.1.	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.28711	2025-12-19 16:48:42.287113
1154	Actualizar de Hojas de Datos para Extensión Tablero SW Cracking existente en SE 2.1	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.292292	2025-12-19 16:48:42.292293
1158	Actualizar Listado de Cableado	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.301483	2025-12-19 16:48:42.301483
1167	Elaborar Plan de Mantenimiento de Seguridad Funcional	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.931838	2025-12-19 16:49:30.931844
1174	Elaborar Control loop narrative	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.956551	2025-12-19 16:49:30.956552
1179	Elaborar Hoja de Datos Instrumentos de Presión, Temperatura, Nivel	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.967804	2025-12-19 16:49:30.967804
1187	Elaborar HMI Schematics	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.977603	2025-12-19 16:49:30.977604
1188	Elaborar Requisición de Materiales Sistema de Control (PCS, SIS)	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.980678	2025-12-19 16:49:30.980679
579	Planimetría	\N	\N	201	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:26:54.1329	2025-12-18 14:26:54.132902
581	Cantidades de obra	\N	\N	202	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:37:51.851191	2025-12-18 14:37:51.851196
586	Planos de demolición	\N	\N	28	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:40:13.571406	2025-12-18 14:40:13.571408
589	Memorias de cálculo diseños - Area 149-TK2302 - Caseta de bombas	\N	\N	115	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:40:52.824604	2025-12-18 14:40:52.824609
592	Modelo 3D	\N	\N	115	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:40:52.835931	2025-12-18 14:40:52.835933
491	Listado de Tie-Ins	\N	\N	50	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:15:07.168784	2025-12-18 13:15:07.168786
598	Documento alcance CWP-149-03-MEC-0001	\N	\N	22	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:41:38.149774	2025-12-18 14:41:38.149776
604	Cálculos tuberías (Aislamiento, SCH, material, corrosión etc.)	\N	\N	25	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:42:35.214242	2025-12-18 14:42:35.214244
609	Documento alcance EWP-149-03-MET-0001	\N	\N	25	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:42:35.232396	2025-12-18 14:42:35.232397
613	Planimetría puesta a tierra y conexión a malla existente	\N	\N	114	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:44:32.669536	2025-12-18 14:44:32.669538
626	Planimetría	\N	\N	26	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:48:13.966506	2025-12-18 14:48:13.966508
631	Cantidades de obra	\N	\N	177	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:53:45.386503	2025-12-18 14:53:45.386504
1142	Actualizar Plot-Plan	\N	\N	167	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:04.63315	2025-12-19 16:48:04.633152
244	Revisar arreglo bombas y canister	\N	\N	156	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:59:19.719214	2025-11-27 19:59:19.719219
249	Actualizar Layout Cuartos de Control U-149	\N	\N	155	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:00:10.848889	2025-11-27 20:00:10.84889
252	Elaborar Cálculo (validación) de Instrumentos existentes	\N	\N	155	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:00:10.909486	2025-11-27 20:00:10.909491
253	Actualizar Key-Plan	\N	\N	158	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:02:43.785859	2025-11-27 20:02:43.785865
259	Realizar Actualización hidráulica de canistes con información vendor	\N	\N	157	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:06.470075	2025-11-27 20:03:06.470077
262	Elaborar de planos de ruteo de iluminación	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:26.463405	2025-11-27 20:03:26.463412
265	Realizar Actualización de Diagramas Unifilares	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:26.475921	2025-11-27 20:03:26.475924
270	Realizar Estudio de Coordinación de Protecciones	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:26.490087	2025-11-27 20:03:26.490088
274	Elaborar Base de Datos de Alarmas y Eventos	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.596234	2025-11-27 20:04:07.596238
280	Elaborar Requisición de Materiales Instrumentos	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.638984	2025-11-27 20:04:07.638987
287	Actualizar P&IDs del área	\N	\N	163	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:06:40.879801	2025-11-27 20:06:40.879806
297	Elaborar Especificación Técnica para Montaje de Tubería	\N	\N	165	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:18.333116	2025-11-27 20:07:18.333118
504	Diagramas de Cajas de Conexionado	\N	\N	52	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:06.527765	2025-12-18 13:16:06.527768
508	Diagramas Layout de Cajas y Paneles F&G	\N	\N	53	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:31.924743	2025-12-18 13:16:31.924748
512	Planimetría de Ubicación de Instrumentos F&G	\N	\N	53	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:16:31.937515	2025-12-18 13:16:31.937518
585	Documento alcance CWP-149-03-CIV-0001	\N	\N	28	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:40:13.570658	2025-12-18 14:40:13.570662
591	Documento alcance EWP-149-03-CIV-0002	\N	\N	115	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:40:52.834809	2025-12-18 14:40:52.834811
597	Especificaciones Técnicas	\N	\N	22	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:41:38.148724	2025-12-18 14:41:38.148726
605	Planos Arreglos Generales de Tubería (Plantas y Elevaciones)	\N	\N	25	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:42:35.214973	2025-12-18 14:42:35.214975
614	Documento alcance EWP-149-03-ELE-0001	\N	\N	114	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:44:32.67026	2025-12-18 14:44:32.670261
625	Documento alcance CWP-149-03-MET-0002	\N	\N	26	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:48:13.964932	2025-12-18 14:48:13.964937
632	Documento alcance EWP-149-03-MEC-0003	\N	\N	177	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:53:45.387557	2025-12-18 14:53:45.387579
633	Documento alcance CWP-149-03-ELE-0002	\N	\N	27	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:55:24.233613	2025-12-18 14:55:24.233618
829	MR de tuberías, accesorios, válvulas y elementos especiales	\N	\N	75	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:08:43.595665	2025-12-18 19:08:43.595667
580	Documento alcance CWP-005-01-MET-0003	\N	\N	201	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:26:54.134587	2025-12-19 14:50:14.578563
1153	Elaborar de planos de ruteo de potencia	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.289823	2025-12-19 16:48:42.289825
1160	Realizar Análisis de Riego Eléctrico	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.304066	2025-12-19 16:48:42.304067
1162	Realizar Estudio de Armónicos - en caso de requerirse con la inclusión de la nueva unidad U-038	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.307844	2025-12-19 16:48:42.307844
1170	Elaborar Listado de Señales	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.935688	2025-12-19 16:49:30.93569
1177	Elaborar Reporte de Verificación SIL (Compliance with IEC61511)	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.960457	2025-12-19 16:49:30.960458
245	Revisar bombas, canister y Actualizar P&ID U-149	\N	\N	154	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 19:59:47.831512	2025-11-27 19:59:47.831518
248	Actualizar listado Instrumentos U-149	\N	\N	155	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:00:10.848428	2025-11-27 20:00:10.84843
255	Elaborar Especificación Técnica para Montaje de Tubería	\N	\N	158	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:02:43.787919	2025-11-27 20:02:43.787921
260	Elaborar balance de servicios industriales para sistemas intervenidos	\N	\N	157	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:06.47089	2025-11-27 20:03:06.470891
267	Elaborar Típicos de Construcción y Montaje	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:26.480978	2025-11-27 20:03:26.480979
268	Realizar Estudio de Flujo de Carga y Corto Circuito	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:26.487781	2025-11-27 20:03:26.487783
273	Realizar Estudio de Arc Flash	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:43.021189	2025-11-27 20:03:43.021195
278	Elaborar Listado de Instrumentos	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.599942	2025-11-27 20:04:07.599944
284	Elaborar HMI Schematics	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.642976	2025-11-27 20:04:07.642977
288	Actualizar listado líneas de proceso	\N	\N	163	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:06:40.881057	2025-11-27 20:06:40.881059
296	Actualizar Plot-Plan	\N	\N	165	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:18.332492	2025-11-27 20:07:18.332494
304	Elaborar de MR y Data sheet de Tablero de Iluminación para el nuevo sistema requerido	\N	\N	166	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:34.745182	2025-11-27 20:07:34.745183
588	Documento alcance EWP-149-03-CIV-0001	\N	\N	28	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:40:13.574243	2025-12-18 14:40:13.574245
520	Modelo 3D	\N	\N	9	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:19:18.368394	2025-12-18 13:19:18.368402
525	Planos desmantelamiento	\N	\N	4	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:19:55.74268	2025-12-18 13:19:55.742686
535	MTO	\N	\N	11	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:11.489919	2025-12-18 13:21:11.48992
540	Especificaciones Técnicas	\N	\N	5	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:57.237947	2025-12-18 13:21:57.237952
546	Modelo 3D	\N	\N	10	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:22:56.270689	2025-12-18 13:22:56.270693
549	Planos de detalle bomba	\N	\N	10	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:22:56.279057	2025-12-18 13:22:56.279059
556	Documento alcance EWP-002-01-ELE-0001	\N	\N	6	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:23:19.338266	2025-12-18 13:23:19.338267
593	Planimetría de cimentaciones y sistemas enterrados	\N	\N	115	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:40:52.83756	2025-12-18 14:40:52.837562
599	Cantidades de obra desmantelamiento	\N	\N	22	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:41:38.151651	2025-12-18 14:41:38.151654
601	P&IDs de Desmantelamiento	\N	\N	22	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:41:38.162527	2025-12-18 14:41:38.162529
602	Calc de flexibilidad	\N	\N	25	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:42:35.211236	2025-12-18 14:42:35.211241
612	Documento alcance CWP-149-03-ELE-0001	\N	\N	114	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:44:32.669023	2025-12-18 14:44:32.669024
628	Cantidades de obra	\N	\N	26	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:48:13.96784	2025-12-18 14:48:13.967842
635	Cantidades de obra	\N	\N	27	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:55:24.235414	2025-12-18 14:55:24.235417
894	MR para Revamp de Gavetas en CCM existente 03-STAPC-0-01 SE #3	\N	\N	92	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:26:54.357979	2025-12-18 19:26:54.357981
516	cantidades obra de demolición	\N	\N	8	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:18:34.91557	2025-12-19 14:53:10.384662
583	Documento alcance EWP-002-01-MET-0003	\N	\N	202	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:37:51.861545	2025-12-19 14:59:18.600747
1172	Elaborar Listado Bandejas y Cables	\N	\N	142	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:49:30.947937	2025-12-19 16:49:30.94794
246	Actualizar listado Señales U-149	\N	\N	155	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:00:10.847134	2025-11-27 20:00:10.847139
254	Actualizar Plot-Plan	\N	\N	158	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:02:43.786553	2025-11-27 20:02:43.786556
257	Realizar Actualización hidráulica de aguas agrias con información vendor de bombas	\N	\N	157	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:06.464179	2025-11-27 20:03:06.464184
263	Actualizar de Cantidades de obra de Instalación Eléctrica	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:26.473105	2025-11-27 20:03:26.473107
271	Elaborar Hojas de Datos para Gavetas de CCM 15-MCC-0-03B existente en SE 15-ENC-0-02	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:26.491575	2025-11-27 20:03:26.491576
276	Elaborar Matriz Causa-Efecto (PCS)	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.59759	2025-11-27 20:04:07.597593
283	Elaborar Hoja de Datos Instrumentos	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.642595	2025-11-27 20:04:07.642596
290	Actualizar listado de Tie-in's	\N	\N	163	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:06:40.88397	2025-11-27 20:06:40.883972
291	Actualizar listado de efluentes	\N	\N	163	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:06:40.892267	2025-11-27 20:06:40.89227
293	Elaborar MR de Instrumentos	\N	\N	164	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:02.211484	2025-11-27 20:07:02.211486
299	Elaborar Listado de tie-Tie-in's consolidado OSBL	\N	\N	165	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:18.334221	2025-11-27 20:07:18.334222
303	Elaborar Diseño de Sistema de Iluminación	\N	\N	166	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:34.744867	2025-11-27 20:07:34.744869
600	Listado Desmantelamiento de Instrumentos	\N	\N	22	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:41:38.162064	2025-12-18 14:41:38.162066
603	MR de tuberías, accesorios, válvulas y elementos especiales	\N	\N	25	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:42:35.213691	2025-12-18 14:42:35.213694
608	Isométricos tuberías	\N	\N	25	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:42:35.231454	2025-12-18 14:42:35.231455
517	Planos de demolición	\N	\N	8	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:18:34.916771	2025-12-18 13:18:34.916774
527	Documento alcance EWP-002-01-MET-0001	\N	\N	4	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:19:55.753239	2025-12-18 13:19:55.753242
532	Listado de Válvulas Manuales	\N	\N	11	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:11.477387	2025-12-18 13:21:11.477389
538	Documento alcance CWP-002-01-MET-0002	\N	\N	11	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:11.492264	2025-12-18 13:21:11.492265
539	Documento alcance EWP-002-01-MET-0002	\N	\N	11	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:11.497312	2025-12-18 13:21:11.497313
611	Planimetría con la nueva clasificación de áreas	\N	\N	114	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:44:32.668358	2025-12-18 14:44:32.668365
627	Documento alcance EWP-149-03-MET-0002	\N	\N	26	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:48:13.967334	2025-12-18 14:48:13.967336
630	Documento alcance CWP-149-03-MEC-0003	\N	\N	177	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:53:45.385881	2025-12-18 14:53:45.385883
636	Documento alcance EWP-149-03-ELE-0002	\N	\N	27	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:55:24.236182	2025-12-18 14:55:24.236184
915	Cantidades de obra	\N	\N	220	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:36:49.809553	2025-12-18 19:36:49.809559
925	Cantidades de obra	\N	\N	95	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:32.937104	2025-12-18 19:37:32.937106
933	Documento alcance EWP-002-04-ELE-0001	\N	\N	96	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:38:14.123894	2025-12-18 19:38:14.123898
936	Documento alcance EWP-137-01-CIV-0001	\N	\N	222	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:39:51.298144	2025-12-18 19:39:51.298147
943	Cantidades de obra	\N	\N	101	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:31.858233	2025-12-18 19:40:31.858241
948	Planimetría	\N	\N	102	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:52.149184	2025-12-18 19:40:52.149186
951	Documento alcance CWP-137-01-MET-0002	\N	\N	100	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:41:29.259543	2025-12-18 19:41:29.259548
960	Cantidades de obra	\N	\N	103	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:44:22.69225	2025-12-18 19:44:22.692251
966	Documento alcance EWP-038-01-MET-0001	\N	\N	105	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:44:44.507686	2025-12-18 19:44:44.507687
967	Documento alcance EWP-038-01-CIV-0002	\N	\N	106	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:03.057673	2025-12-18 19:45:03.057678
972	Cantidades de obra	\N	\N	111	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:26.445524	2025-12-18 19:45:26.445526
976	Documento alcance CWP-038-01-CIV-0004	\N	\N	112	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:45.654082	2025-12-18 19:45:45.654086
979	Cantidades de obra	\N	\N	107	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:03.174959	2025-12-18 19:46:03.174967
983	Especificaciones Técnicas	\N	\N	108	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:25.577206	2025-12-18 19:46:25.577209
988	Documento alcance CWP-038-01-ELE-0002	\N	\N	109	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:43.508297	2025-12-18 19:46:43.508302
997	Planimetría	\N	\N	113	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:47:22.900931	2025-12-18 19:47:22.900934
1001	Planimetría	\N	\N	104	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:49:40.624437	2025-12-18 19:49:40.624439
1005	Planimetría	\N	\N	116	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:54:26.912884	2025-12-18 19:54:26.912885
1011	Documento alcance EWP-037-01-MET-0001	\N	\N	117	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:54:42.242369	2025-12-18 19:54:42.24237
1022	Documento alcance CWP-037-01-INS-0001	\N	\N	120	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:56:08.512837	2025-12-18 19:56:08.512839
521	Documento alcance CWP-002-01-CIV-0002	\N	\N	9	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:19:18.369186	2025-12-19 14:54:46.597086
1191	Actualizar datasheet Válvulas de control	\N	\N	226	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:54:17.348434	2025-12-19 16:54:17.348439
247	Actualizar Matriz Causa Efecto PCS U-149	\N	\N	155	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:00:10.847856	2025-11-27 20:00:10.847859
256	Elaborar Modelo 3D	\N	\N	158	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:02:43.788974	2025-11-27 20:02:43.788976
266	Elaborar de planos de ruteo de potencia	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:26.477822	2025-11-27 20:03:26.477823
277	Elaborar Listado de Señales	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.599279	2025-11-27 20:04:07.599281
282	Realizar Requisición de Materiales Ampliación Sistema de Control (PCS)	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.64211	2025-11-27 20:04:07.642111
289	Elaborar balance de servicios industriales para sistemas intervenidos en U002, U300 y U146	\N	\N	163	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:06:40.881596	2025-11-27 20:06:40.881598
298	Elaborar Hojas de datos válvulas	\N	\N	165	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:18.333674	2025-11-27 20:07:18.333676
301	Elaborar cantidades de obra - tubería	\N	\N	165	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:18.347798	2025-11-27 20:07:18.347799
607	Modelo 3D	\N	\N	25	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:42:35.227559	2025-12-18 14:42:35.227563
916	Documento alcance EWP-002-04-CIV-0001	\N	\N	220	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:36:49.822518	2025-12-18 19:36:49.822522
518	Documento alcance EWP-002-01-CIV-0001	\N	\N	8	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:18:34.923047	2025-12-18 13:18:34.923051
522	Memoria de cálculo - Cimentación Bomba	\N	\N	9	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:19:18.369848	2025-12-18 13:19:18.36985
526	Cantidades de obra desmantelamiento	\N	\N	4	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:19:55.751719	2025-12-18 13:19:55.751724
530	Isométricos tuberías	\N	\N	11	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:11.473365	2025-12-18 13:21:11.473368
534	Especificación Técnica para Montaje de Tubería	\N	\N	11	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:11.486781	2025-12-18 13:21:11.486783
542	Documento alcance CWP-002-01-MEC-0001	\N	\N	5	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:57.242271	2025-12-18 13:21:57.242273
547	Datasheet bombas P-12050 A/B (Bomba/motor/sellos)	\N	\N	10	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:22:56.271312	2025-12-18 13:22:56.271314
555	Documento alcance CWP-002-01-ELE-0001	\N	\N	6	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:23:19.337503	2025-12-18 13:23:19.337505
921	Documento alcance CWP-002-04-CIV-0002	\N	\N	221	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:16.202452	2025-12-18 19:37:16.202454
926	Documento alcance CWP-002-04-INS-0001	\N	\N	95	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:32.937554	2025-12-18 19:37:32.937555
932	Documento alcance CWP-002-04-ELE-0001	\N	\N	96	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:38:14.123	2025-12-18 19:38:14.123004
941	Documento alcance CWP-137-01-MET-0001	\N	\N	99	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:12.640037	2025-12-18 19:40:12.640039
944	Planimetría	\N	\N	101	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:31.859244	2025-12-18 19:40:31.859247
946	Documento alcance EWP-137-01-INS-0001	\N	\N	101	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:31.867287	2025-12-18 19:40:31.86729
947	Cantidades de obra	\N	\N	102	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:52.143667	2025-12-18 19:40:52.143673
959	Planimetría	\N	\N	103	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:44:22.691513	2025-12-18 19:44:22.691515
968	Planimetría	\N	\N	106	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:03.059079	2025-12-18 19:45:03.059081
973	Documento alcance EWP-038-01-CIV-0003	\N	\N	111	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:26.453973	2025-12-18 19:45:26.453976
980	Planimetría	\N	\N	107	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:03.175655	2025-12-18 19:46:03.175657
985	Documento alcance EWP-038-01-MEC-0001	\N	\N	108	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:25.58176	2025-12-18 19:46:25.581763
989	Cantidades de obra	\N	\N	109	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:43.509	2025-12-18 19:46:43.509003
994	Planimetría	\N	\N	110	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:47:01.196241	2025-12-18 19:47:01.196243
996	Cantidades de obra	\N	\N	113	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:47:22.900086	2025-12-18 19:47:22.900094
999	Documento alcance CWP-038-01-CIN-0002	\N	\N	113	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:47:22.910046	2025-12-18 19:47:22.910047
1000	Cantidades de obra	\N	\N	104	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:49:40.618305	2025-12-18 19:49:40.618311
1007	Documento alcance EWP-037-01-CIV-0001	\N	\N	116	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:54:26.913958	2025-12-18 19:54:26.91396
1010	Documento alcance CWP-037-01-MET-0001	\N	\N	117	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:54:42.241898	2025-12-18 19:54:42.241899
1012	Planimetría	\N	\N	119	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:55:01.502771	2025-12-18 19:55:01.502779
1192	Actualizar listado de equipos mecánicos (MEL)	\N	\N	226	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:54:17.353893	2025-12-19 16:54:17.353895
1197	Elaborar Documento alcance CWP-002-02-MEC-0002	\N	\N	226	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:54:17.370779	2025-12-19 16:54:17.37078
250	Actualizar arquitectura de Control U-149	\N	\N	155	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:00:10.849323	2025-11-27 20:00:10.849324
258	Elaborar Diseño drenaje nueva bomba P-2310	\N	\N	157	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:06.466432	2025-11-27 20:03:06.466437
261	Realizar Actualización diagramas P&IDs y PFD's	\N	\N	157	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:06.47326	2025-11-27 20:03:06.473261
264	Actualizar Diagramas Esquemáticos de Control y Protección	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:26.473988	2025-11-27 20:03:26.473992
272	Elaborar MR para Revamp de Gavetas en CCM 15-MCC-0-03B existente en SE 15-ENC-0-02	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:26.492406	2025-11-27 20:03:26.492406
643	Documento alcance EWP-149-02-CIV-0001	\N	\N	30	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:57:44.656883	2025-12-18 14:57:44.656885
519	Documento alcance CWP-002-01-CIV-0001	\N	\N	8	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:18:34.924784	2025-12-18 13:18:34.924788
524	Cimentaciones bombas	\N	\N	9	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:19:18.374471	2025-12-18 13:19:18.374475
531	MR de tuberías, accesorios, válvulas y elementos especiales	\N	\N	11	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:11.47589	2025-12-18 13:21:11.475892
537	 Cantidades de Obra (sumario)	\N	\N	11	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:11.491654	2025-12-18 13:21:11.491655
544	Cantidades de obra desmantelamiento	\N	\N	5	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:57.244798	2025-12-18 13:21:57.2448
548	Listado de equipos mecánicos (MEL)	\N	\N	10	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:22:56.278278	2025-12-18 13:22:56.278281
554	Cantidades de obra desmantelamiento	\N	\N	6	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:23:19.336909	2025-12-18 13:23:19.336911
649	Cantidades de obra	\N	\N	32	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:58:54.546968	2025-12-18 14:58:54.546976
653	Documento alcance CWP-149-02-ELE-0001	\N	\N	34	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:59:27.077283	2025-12-18 14:59:27.077287
663	Documento alcance CWP-149-02-MET-0002	\N	\N	33	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:00:38.760527	2025-12-18 15:00:38.76053
670	Planimetría	\N	\N	204	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:38:19.989347	2025-12-18 15:38:19.989349
677	Documento alcance CWP-149-01-MET-0002	\N	\N	39	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:39:30.091782	2025-12-18 15:39:30.091787
681	Cantidades de obra	\N	\N	40	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:39:57.213529	2025-12-18 15:39:57.213535
683	Documento alcance CWP-149-01-ELE-0001	\N	\N	40	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:39:57.220417	2025-12-18 15:39:57.220421
686	Cantidades de obra	\N	\N	205	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:41:20.474557	2025-12-18 15:41:20.474559
694	Documento alcance CWP-300-01-CIV-0001	\N	\N	192	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:59:23.554468	2025-12-18 15:59:23.55447
701	Documento alcance CWP-300-01-CIV-0002	\N	\N	193	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:59:57.370319	2025-12-18 15:59:57.370321
707	Modelo 3D	\N	\N	207	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:06:53.854037	2025-12-18 16:06:53.85404
714	Listado de Válvulas Manuales	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.281987	2025-12-18 16:07:43.281989
717	MTO	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.295503	2025-12-18 16:07:43.295507
721	Especificación Técnica para Montaje de Tubería	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.305225	2025-12-18 16:07:43.305226
723	Documento alcance CWP-300-01-MET-0001	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.309978	2025-12-18 16:07:43.309979
727	Planimetría puesta a tierra y conexión a malla existente	\N	\N	197	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:12.385597	2025-12-18 16:08:12.385599
917	Documento alcance CWP-002-04-CIV-0001	\N	\N	220	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:36:49.823049	2025-12-18 19:36:49.823051
919	Cantidades de obra	\N	\N	221	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:16.193854	2025-12-18 19:37:16.193859
923	Documento alcance EWP-002-04-INS-0001	\N	\N	95	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:32.93581	2025-12-18 19:37:32.935815
930	Documento alcance EWP-002-04-INS-0002	\N	\N	97	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:51.934262	2025-12-18 19:37:51.934264
931	Cantidades de obra	\N	\N	96	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:38:14.112384	2025-12-18 19:38:14.112389
937	Documento alcance CWP-137-01-CIV-0001	\N	\N	222	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:39:51.299823	2025-12-18 19:39:51.299825
940	Documento alcance EWP-137-01-MET-0001	\N	\N	99	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:12.639499	2025-12-18 19:40:12.639501
950	Documento alcance EWP-137-01-ELE-0001	\N	\N	102	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:52.152734	2025-12-18 19:40:52.152736
953	Cantidades de obra	\N	\N	100	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:41:29.262325	2025-12-18 19:41:29.262328
962	Documento alcance CWP-038-01-CIV-0001	\N	\N	103	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:44:22.695699	2025-12-18 19:44:22.6957
965	Cantidades de obra	\N	\N	105	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:44:44.507179	2025-12-18 19:44:44.507181
978	Documento alcance EWP-038-01-CIV-0004	\N	\N	112	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:45.656476	2025-12-18 19:45:45.656478
991	Documento alcance EWP-038-01-ELE-0002	\N	\N	109	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:43.510615	2025-12-18 19:46:43.510617
993	Cantidades de obra	\N	\N	110	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:47:01.195664	2025-12-18 19:47:01.195666
998	Documento alcance EWP-038-01-CIN-0002	\N	\N	113	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:47:22.909445	2025-12-18 19:47:22.909451
1003	Documento alcance EWP-038-01-ELE-0001	\N	\N	104	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:49:40.629095	2025-12-18 19:49:40.629099
1004	Cantidades de obra	\N	\N	116	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:54:26.912195	2025-12-18 19:54:26.912204
1008	Cantidades de obra	\N	\N	117	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:54:42.240757	2025-12-18 19:54:42.240762
1013	Cantidades de obra	\N	\N	119	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:55:01.503493	2025-12-18 19:55:01.503495
1015	Documento alcance CWP-037-01-ELE-0001	\N	\N	119	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:55:01.509465	2025-12-18 19:55:01.509467
1020	Cantidades de obra	\N	\N	120	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:56:08.511031	2025-12-18 19:56:08.511036
1193	Elaborar Planos de detalle Válvulas de control	\N	\N	226	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:54:17.354402	2025-12-19 16:54:17.354404
251	Actualizar Layout Rutas principales de Bandejas U-149	\N	\N	155	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:00:10.85804	2025-11-27 20:00:10.858042
528	Documento alcance CWP-002-01-MET-0001	\N	\N	4	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:19:55.755593	2025-12-18 13:19:55.755596
529	Modelo 3D	\N	\N	11	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:11.466249	2025-12-18 13:21:11.466256
533	Planos Arreglos Generales de Tubería (Plantas y Elevaciones)	\N	\N	11	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:11.481665	2025-12-18 13:21:11.481667
543	Documento alcance EWP-002-01-MEC-0001	\N	\N	5	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:57.243845	2025-12-18 13:21:57.243847
551	Documento alcance EWP-002-01-MEC-0002	\N	\N	10	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:22:56.293336	2025-12-18 13:22:56.293337
652	Documento alcance CWP-149-02-MET-0001	\N	\N	32	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:58:54.553677	2025-12-18 14:58:54.553679
655	Planimetría	\N	\N	34	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:59:27.078537	2025-12-18 14:59:27.078538
658	Cantidades de obra	\N	\N	35	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:59:49.717493	2025-12-18 14:59:49.717495
665	Planimetría	\N	\N	203	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:36:59.517523	2025-12-18 15:36:59.517528
671	Documento alcance EWP-149-01-CIV-0002	\N	\N	204	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:38:19.989942	2025-12-18 15:38:19.989943
674	Cantidades de obra	\N	\N	38	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:38:54.736762	2025-12-18 15:38:54.736764
680	Documento alcance EWP-149-01-MET-0002	\N	\N	39	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:39:30.093951	2025-12-18 15:39:30.093953
692	Planimetría	\N	\N	206	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:45:29.20817	2025-12-18 15:45:29.208173
695	Planimetría	\N	\N	192	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:59:23.555036	2025-12-18 15:59:23.555038
697	Modelo 3D	\N	\N	193	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:59:57.365254	2025-12-18 15:59:57.365259
704	Cantidades de obra	\N	\N	194	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:00:25.548476	2025-12-18 16:00:25.548478
710	listado de equipos mecánicos (MEL) - Incl. químicos	\N	\N	207	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:06:53.858888	2025-12-18 16:06:53.85889
711	Documento alcance EWP-300-01-MEC-0002	\N	\N	207	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:06:53.869049	2025-12-18 16:06:53.869053
713	Cálculos tuberías (Aislamiento, SCH, material, corrosión etc.)	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.281292	2025-12-18 16:07:43.281297
729	Actualización Planimetría de Clasificación de áreas existente (incl. químicos)	\N	\N	197	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:12.387887	2025-12-18 16:08:12.387889
918	Planimetría	\N	\N	220	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:36:49.823542	2025-12-18 19:36:49.823543
927	Planimetría	\N	\N	97	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:51.924539	2025-12-18 19:37:51.924544
938	Planimetría	\N	\N	222	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:39:51.300608	2025-12-18 19:39:51.30061
939	Cantidades de obra	\N	\N	99	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:12.634746	2025-12-18 19:40:12.634749
945	Documento alcance CWP-137-01-INS-0001	\N	\N	101	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:31.864903	2025-12-18 19:40:31.864908
952	Documento alcance EWP-137-01-MET-0002	\N	\N	100	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:41:29.261278	2025-12-18 19:41:29.261282
964	Documento alcance CWP-038-01-MET-0001	\N	\N	105	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:44:44.506638	2025-12-18 19:44:44.50664
970	Cantidades de obra	\N	\N	106	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:03.060203	2025-12-18 19:45:03.060204
971	Planimetría	\N	\N	111	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:26.444899	2025-12-18 19:45:26.444906
974	Documento alcance CWP-038-01-CIV-0003	\N	\N	111	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:26.454777	2025-12-18 19:45:26.454779
975	Cantidades de obra	\N	\N	112	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:45.648168	2025-12-18 19:45:45.648172
982	Documento alcance EWP-038-01-MET-0002	\N	\N	107	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:03.177333	2025-12-18 19:46:03.177334
984	Cantidades de obra	\N	\N	108	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:25.578517	2025-12-18 19:46:25.578519
987	Documento alcance CWP-038-01-MEC-0001	\N	\N	108	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:25.585113	2025-12-18 19:46:25.585115
990	Planimetría	\N	\N	109	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:43.509823	2025-12-18 19:46:43.509825
995	Documento alcance EWP-038-01-INS-0001	\N	\N	110	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:47:01.197014	2025-12-18 19:47:01.197015
1006	Documento alcance CWP-037-01-CIV-0001	\N	\N	116	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:54:26.913399	2025-12-18 19:54:26.913401
1009	Planimetría	\N	\N	117	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:54:42.241372	2025-12-18 19:54:42.241374
1014	Documento alcance EWP-037-01-ELE-0001	\N	\N	119	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:55:01.508482	2025-12-18 19:55:01.508484
1023	Documento alcance EWP-037-01-INS-0001	\N	\N	120	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:56:08.513717	2025-12-18 19:56:08.513718
523	Documento alcance EWP-002-01-CIV-0002	\N	\N	9	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:19:18.370447	2025-12-19 14:54:51.610349
1194	Actualizar cantidades de obra equipos mecánicos	\N	\N	226	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:54:17.35521	2025-12-19 16:54:17.355211
1198	Elaborar Documento alcance EWP-002-02-MEC-0002	\N	\N	226	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:54:17.371182	2025-12-19 16:54:17.371183
269	Elaborar Diseño de Sistema de Iluminación	\N	\N	159	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:03:26.488712	2025-11-27 20:03:26.488713
275	Elaborar Listado Bandejas y Cables	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.596907	2025-11-27 20:04:07.596909
281	Elaborar Diagramas de Conexionado (PCS)	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.641227	2025-11-27 20:04:07.641228
286	Elaborar Hidráulica para conexión de analizador de H2S para medición de aguas despojadas de U-038	\N	\N	163	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:06:40.875444	2025-11-27 20:06:40.875449
536	Calc de flexibilidad	\N	\N	11	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:11.490644	2025-12-18 13:21:11.490645
541	Plano de desmantelamiento bombas	\N	\N	5	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:21:57.241706	2025-12-18 13:21:57.241709
545	MR bomba P-12050	\N	\N	10	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:22:56.269928	2025-12-18 13:22:56.269933
552	Documento alcance CWP-002-01-MEC-0002	\N	\N	10	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:22:56.293703	2025-12-18 13:22:56.293703
553	Plano de desmantelamiento	\N	\N	6	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:23:19.336356	2025-12-18 13:23:19.336361
642	Planimetría	\N	\N	30	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:57:44.656187	2025-12-18 14:57:44.65619
645	Cantidades de obra	\N	\N	31	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:58:29.351367	2025-12-18 14:58:29.351373
648	Documento alcance CWP-149-02-CIV-0002	\N	\N	31	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:58:29.360704	2025-12-18 14:58:29.360705
650	Documento alcance EWP-149-02-MET-0001	\N	\N	32	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:58:54.547649	2025-12-18 14:58:54.547651
660	Documento alcance EWP-149-02-INS-0001	\N	\N	35	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:59:49.720184	2025-12-18 14:59:49.720185
664	Documento alcance EWP-149-02-MET-0002	\N	\N	33	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:00:38.761319	2025-12-18 15:00:38.761321
667	Documento alcance CWP-149-01-CIV-0001	\N	\N	203	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:36:59.518688	2025-12-18 15:36:59.518689
669	Cantidades de obra	\N	\N	204	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:38:19.987932	2025-12-18 15:38:19.987937
673	Documento alcance EWP-149-01-MET-0001	\N	\N	38	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:38:54.73581	2025-12-18 15:38:54.735815
682	Planimetría	\N	\N	40	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:39:57.214276	2025-12-18 15:39:57.214279
687	Documento alcance CWP-149-01-INS-0001	\N	\N	205	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:41:20.475474	2025-12-18 15:41:20.475476
700	Documento alcance EWP-300-01-CIV-0002	\N	\N	193	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:59:57.369212	2025-12-18 15:59:57.369213
705	Documento alcance EWP-300-01-MEC-0001	\N	\N	194	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:00:25.550518	2025-12-18 16:00:25.55052
706	datasheet bombas 300-AR-P A/B (Bomba/motor/sellos)	\N	\N	207	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:06:53.851678	2025-12-18 16:06:53.851684
715	Cálculos de flexibilidad	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.282922	2025-12-18 16:07:43.282924
716	Cantidades de Obra (sumario)	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.289879	2025-12-18 16:07:43.289883
719	Planos Arreglos Generales de Tubería (Plantas y Elevaciones)	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.303528	2025-12-18 16:07:43.30353
724	Documento alcance EWP-300-01-MET-0001	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.322496	2025-12-18 16:07:43.322497
728	Documento alcance EWP-300-01-ELE-0001	\N	\N	197	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:12.386879	2025-12-18 16:08:12.386882
920	Planimetría	\N	\N	221	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:16.20159	2025-12-18 19:37:16.201595
922	Documento alcance EWP-002-04-CIV-0002	\N	\N	221	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:16.208353	2025-12-18 19:37:16.208356
924	Planimetría	\N	\N	95	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:32.93641	2025-12-18 19:37:32.936412
928	Cantidades de obra	\N	\N	97	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:51.925301	2025-12-18 19:37:51.925305
929	Documento alcance CWP-002-04-INS-0002	\N	\N	97	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:37:51.932828	2025-12-18 19:37:51.932831
934	Planimetría	\N	\N	96	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:38:14.124377	2025-12-18 19:38:14.124378
935	Cantidades de obra	\N	\N	222	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:39:51.290436	2025-12-18 19:39:51.290445
942	Planimetría	\N	\N	99	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:12.641707	2025-12-18 19:40:12.641708
949	Documento alcance CWP-137-01-ELE-0001	\N	\N	102	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:40:52.150651	2025-12-18 19:40:52.150652
954	Planimetría	\N	\N	100	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:41:29.262965	2025-12-18 19:41:29.262967
961	Documento alcance EWP-038-01-CIV-0001	\N	\N	103	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:44:22.695077	2025-12-18 19:44:22.695078
963	Planimetría	\N	\N	105	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:44:44.505965	2025-12-18 19:44:44.505972
969	Documento alcance CWP-038-01-CIV-0002	\N	\N	106	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:03.059669	2025-12-18 19:45:03.059671
977	Planimetría	\N	\N	112	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:45:45.654551	2025-12-18 19:45:45.654553
981	Documento alcance CWP-038-01-MET-0002	\N	\N	107	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:03.176267	2025-12-18 19:46:03.176269
986	Planimetría	\N	\N	108	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:46:25.583391	2025-12-18 19:46:25.583393
992	Documento alcance CWP-038-01-INS-0001	\N	\N	110	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:47:01.194969	2025-12-18 19:47:01.194978
1002	Documento alcance CWP-038-01-ELE-0001	\N	\N	104	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:49:40.626072	2025-12-18 19:49:40.626075
1021	Planimetría	\N	\N	120	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:56:08.51208	2025-12-18 19:56:08.512084
690	Documento alcance EWP-149-02-MET-0003	\N	\N	206	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:45:29.207057	2025-12-19 15:55:51.564111
1195	Actualizar MR Válvulas de control	\N	\N	226	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:54:17.356905	2025-12-19 16:54:17.35691
279	Elaborar Control loop narrative	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.60902	2025-11-27 20:04:07.609023
550	Cantidades de obra equipos mecánicos	\N	\N	10	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 13:22:56.288111	2025-12-18 13:22:56.288113
644	Documento alcance CWP-149-02-CIV-0001	\N	\N	30	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:57:44.659336	2025-12-18 14:57:44.659338
647	Documento alcance EWP-149-02-CIV-0002	\N	\N	31	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:58:29.360224	2025-12-18 14:58:29.360227
656	Documento alcance EWP-149-02-ELE-0001	\N	\N	34	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:59:27.07962	2025-12-18 14:59:27.079621
659	Documento alcance CWP-149-02-INS-0001	\N	\N	35	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:59:49.719676	2025-12-18 14:59:49.719678
661	Cantidades de obra	\N	\N	33	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:00:38.752624	2025-12-18 15:00:38.752629
666	Documento alcance EWP-149-01-CIV-0001	\N	\N	203	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:36:59.518162	2025-12-18 15:36:59.518164
672	Documento alcance CWP-149-01-CIV-0002	\N	\N	204	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:38:19.990725	2025-12-18 15:38:19.990727
676	Planimetría	\N	\N	38	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:38:54.739731	2025-12-18 15:38:54.739733
679	Planimetría	\N	\N	39	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:39:30.093231	2025-12-18 15:39:30.093234
684	Documento alcance EWP-149-01-ELE-0001	\N	\N	40	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:39:57.22088	2025-12-18 15:39:57.220882
685	Planimetría	\N	\N	205	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:41:20.473851	2025-12-18 15:41:20.473856
689	Cantidades de obra	\N	\N	206	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:45:29.206421	2025-12-18 15:45:29.206426
696	Documento alcance EWP-300-01-CIV-0001	\N	\N	192	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:59:23.555612	2025-12-18 15:59:23.555614
698	Memorias de Cálculo Cimentaciones Bombas	\N	\N	193	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:59:57.36655	2025-12-18 15:59:57.366553
703	Documento alcance CWP-300-01-MEC-0001	\N	\N	194	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:00:25.547979	2025-12-18 16:00:25.547982
708	Documento alcance CWP-300-01-MEC-0002	\N	\N	207	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:06:53.856455	2025-12-18 16:06:53.856458
725	Validación de las nuevas condiciones de proceso y Clasificación del área (incl. químicos)	\N	\N	197	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:12.373581	2025-12-18 16:08:12.373587
730	Actualización de plano de iluminación existente	\N	\N	197	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:12.389258	2025-12-18 16:08:12.389259
1030	Documento alcance CWP-037-01-MET-0002	\N	\N	118	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:57:33.989085	2025-12-18 19:57:33.989086
1040	Actualizar listado Señales U-002	\N	\N	149	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 20:00:29.105971	2025-12-18 20:00:29.105973
1196	Elaborar Modelo 3D	\N	\N	226	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:54:17.365959	2025-12-19 16:54:17.365964
285	Elaborar Especificación Técnica Ampliación Sistema de Control (PCS)	\N	\N	160	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:04:07.648837	2025-11-27 20:04:07.648838
641	Cantidades de obra	\N	\N	30	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:57:44.653872	2025-12-18 14:57:44.653879
646	Planimetría	\N	\N	31	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:58:29.355054	2025-12-18 14:58:29.355057
651	Planimetría	\N	\N	32	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:58:54.548864	2025-12-18 14:58:54.548866
654	Cantidades de obra	\N	\N	34	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:59:27.07803	2025-12-18 14:59:27.078033
657	Planimetría	\N	\N	35	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 14:59:49.716853	2025-12-18 14:59:49.716862
662	Planimetría	\N	\N	33	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:00:38.757015	2025-12-18 15:00:38.757019
668	Cantidades de obra	\N	\N	203	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:36:59.519451	2025-12-18 15:36:59.519452
675	Documento alcance CWP-149-01-MET-0001	\N	\N	38	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:38:54.739129	2025-12-18 15:38:54.739132
678	Cantidades de obra	\N	\N	39	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:39:30.092415	2025-12-18 15:39:30.092417
688	Documento alcance EWP-149-01-INS-0001	\N	\N	205	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:41:20.476484	2025-12-18 15:41:20.476486
693	Cantidades de obra	\N	\N	192	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:59:23.553699	2025-12-18 15:59:23.553704
699	Cimentaciones Bombas	\N	\N	193	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:59:57.368523	2025-12-18 15:59:57.368525
702	Planimetría	\N	\N	194	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:00:25.546931	2025-12-18 16:00:25.546937
709	MR bombas 300-AR-P A/B	\N	\N	207	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:06:53.857654	2025-12-18 16:06:53.857656
720	Modelo 3D	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.304815	2025-12-18 16:07:43.304816
726	Documento alcance CWP-300-01-ELE-0001	\N	\N	197	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:12.384181	2025-12-18 16:08:12.384185
1031	Planimetría	\N	\N	118	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:57:33.989533	2025-12-18 19:57:33.989535
1042	Actualizar Narrativa de control	\N	\N	149	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 20:00:29.108102	2025-12-18 20:00:29.108104
1050	Elaborar Documento alcance EWP-005-01-MET-0001	\N	\N	14	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:43:49.842505	2025-12-19 14:43:49.842507
1053	Elaborar Documento alcance EWP-005-01-ELE-0001	\N	\N	17	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:45:49.655672	2025-12-19 14:45:49.655677
1056	Documento alcance EWP-005-01-INS-0001	\N	\N	223	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:46:55.493842	2025-12-19 14:46:55.493845
1059	Actualización planos de Sistema Puesta a Tierra	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.38366	2025-12-19 14:57:38.383668
1071	Documento alcance CWP-149-03-MEC-0002	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 15:47:51.85027	2025-12-19 15:47:51.850275
691	Documento alcance CWP-149-01-MET-0003	\N	\N	206	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 15:45:29.207617	2025-12-19 15:55:56.807815
292	Elaborar Matriz de caracterización de fluidos para clasificación de áreas	\N	\N	163	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:06:40.892907	2025-11-27 20:06:40.892908
294	Elaborar Hojas de datos de Instrumentos	\N	\N	164	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:02.211959	2025-11-27 20:07:02.21196
295	Elaborar Modelado 3D	\N	\N	165	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:18.331644	2025-11-27 20:07:18.331648
302	Elaborar isométricos	\N	\N	165	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:18.348254	2025-11-27 20:07:18.348255
305	Elaborar Descripción General del Alcance de Obra Eléctrica	\N	\N	166	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:34.74548	2025-11-27 20:07:34.745481
712	Cantidades de obra equipos mecánicos - Incl. químicos	\N	\N	207	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:06:53.870675	2025-12-18 16:06:53.870676
1028	Documento alcance EWP-037-01-MET-0002	\N	\N	118	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:57:33.987823	2025-12-18 19:57:33.987826
1039	Actualizar listado Instrumentos U-002	\N	\N	149	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 20:00:29.104042	2025-12-18 20:00:29.104048
1047	Elaborar Documento alcance EWP-005-01-CIV-0001	\N	\N	16	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:43:26.045585	2025-12-19 14:43:26.04559
1058	Documento alcance CWP-005-01-INS-0001	\N	\N	223	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:46:55.497157	2025-12-19 14:46:55.49716
1060	Actualización planos de iluminación existentes	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.384336	2025-12-19 14:57:38.384338
1066	MR de Equipos Eléctricos (S/E-03)	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.401095	2025-12-19 14:57:38.401097
300	Actualizar Key-Plan	\N	\N	165	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:18.344963	2025-11-27 20:07:18.344966
306	Actualizar de Cantidades de obra de Instalación Eléctrica	\N	\N	166	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:07:34.745784	2025-11-27 20:07:34.745785
718	MR de tuberías, accesorios, válvulas y elementos especiales	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.302659	2025-12-18 16:07:43.302662
722	Isométricos tuberías	\N	\N	195	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:07:43.309505	2025-12-18 16:07:43.309506
1029	Cantidades de obra	\N	\N	118	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:57:33.988225	2025-12-18 19:57:33.988226
1041	Actualizar arquitectura PCS U-002	\N	\N	149	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 20:00:29.106843	2025-12-18 20:00:29.106845
1051	Elaborar Documento alcance CWP-005-01-MET-0002	\N	\N	20	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:44:55.015191	2025-12-19 14:44:55.015195
1054	Elaborar Documento alcance CWP-005-01-ELE-0001	\N	\N	17	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:45:49.656346	2025-12-19 14:45:49.656348
1057	Planos de desmantelamiento, cartillas	\N	\N	223	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:46:55.494293	2025-12-19 14:46:55.494294
1063	Flujo de Potencia y Corto Circuito	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.38742	2025-12-19 14:57:38.387422
1067	Documento alcance CWP-002-01-ELE-0002	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.405567	2025-12-19 14:57:38.405568
307	Elaborar Layout Rutas principales de Bandejas U-300	\N	\N	161	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:08:25.769438	2025-11-27 20:08:25.769442
731	Cantidades de obra de Instalación (incl. químicos)	\N	\N	198	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:52.307555	2025-12-18 16:08:52.307562
737	Diagramas de lazo	\N	\N	198	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:52.327198	2025-12-18 16:08:52.3272
742	Planimetría	\N	\N	196	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:09:30.082936	2025-12-18 16:09:30.082939
747	Memorias de calculo - Rack soporte tubería U-038 (Norte y Nuevo Sur-Oriente)	\N	\N	42	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:33.080106	2025-12-18 18:34:33.080108
352	Elaborar Planimetría puesta a tierra y conexión a malla existente	\N	\N	73	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:07:27.684735	2025-11-27 21:07:27.68474
753	Documento alcance EWP-300-03-MET-0001	\N	\N	43	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:54.152447	2025-12-18 18:34:54.152448
756	Documento alcance CWP-300-03-ELE-0001	\N	\N	45	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:35:37.86843	2025-12-18 18:35:37.868434
763	Documento alcance EWP-300-03-ELE-0001	\N	\N	45	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:35:37.882321	2025-12-18 18:35:37.882322
766	Documento alcance EWP-300-03-INS-0001	\N	\N	46	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:36:00.178933	2025-12-18 18:36:00.178934
771	Documento alcance EWP-300-03-MET-0002	\N	\N	44	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:36:25.910339	2025-12-18 18:36:25.910342
776	Documento alcance EWP-139-01-ELE-0001	\N	\N	63	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:52:48.740769	2025-12-18 18:52:48.740775
786	Planimetría	\N	\N	67	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:55:53.529972	2025-12-18 18:55:53.529973
792	Modelo 3D	\N	\N	209	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:59:04.18919	2025-12-18 18:59:04.189191
797	Documento alcance CWP-300-02-MEC-0002	\N	\N	71	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:01:51.553413	2025-12-18 19:01:51.553415
799	MR de tuberías, accesorios, válvulas y elementos especiales	\N	\N	210	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:31.098097	2025-12-18 19:03:31.098101
801	Listado de Válvulas Manuales	\N	\N	210	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:31.106975	2025-12-18 19:03:31.106977
807	Documento alcance CWP-300-02-MET-0001	\N	\N	210	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:31.117878	2025-12-18 19:03:31.117879
308	Elaborar Listado Cables U-300	\N	\N	161	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:08:25.77009	2025-11-27 20:08:25.770093
309	Revisar Arquitectura Actual PCS U-300	\N	\N	162	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:08:49.038032	2025-11-27 20:08:49.038037
314	Elaborar Layout Rutas principales de Bandejas U-038	\N	\N	146	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:16:23.752678	2025-11-27 20:16:23.752683
732	Modelo 3D	\N	\N	198	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:52.310695	2025-12-18 16:08:52.310698
739	Documento alcance EWP-300-01-INS-0001	\N	\N	198	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:52.331937	2025-12-18 16:08:52.331938
741	Documento alcance EWP-300-01-MET-0002	\N	\N	196	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:09:30.082043	2025-12-18 16:09:30.082045
745	Diagnóstico estructural de Racks existentes	\N	\N	42	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:33.078946	2025-12-18 18:34:33.078949
1043	Elaborar Layout Rutas principales de Bandejas U-002	\N	\N	149	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 20:00:29.1089	2025-12-18 20:00:29.108902
1045	Elaborar Cálculos para Validación de Instrumentos	\N	\N	149	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 20:00:29.121257	2025-12-18 20:00:29.121258
1048	Elaborar Documento alcance CWP-005-01-CIV-0001	\N	\N	16	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:43:26.046211	2025-12-19 14:43:26.046213
1049	Elaborar Documento alcance CWP-005-01-MET-0001	\N	\N	14	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:43:49.841917	2025-12-19 14:43:49.841922
1052	Elaborar Documento alcance EWP-005-01-MET-0002	\N	\N	20	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:44:55.015878	2025-12-19 14:44:55.015881
1062	Planos de ruteo de potencia	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.386889	2025-12-19 14:57:38.38689
1069	Actualización de plano de malla existente para la conexión de las nuevas bombas	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.407076	2025-12-19 14:57:38.407077
310	Revisar Matriz Causa Efecto Actual PCS U-300	\N	\N	162	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:08:49.038728	2025-11-27 20:08:49.038731
312	Actualizar Plano Cuarto de Control SIH02	\N	\N	140	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:15:58.688485	2025-11-27 20:15:58.688488
733	Planimetría de Ubicación de Instrumentos	\N	\N	198	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:52.312338	2025-12-18 16:08:52.31234
738	Documento alcance CWP-300-01-INS-0001	\N	\N	198	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:52.331019	2025-12-18 16:08:52.331021
740	Documento alcance CWP-300-01-MET-0002	\N	\N	196	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:09:30.08011	2025-12-18 16:09:30.080115
748	Cimentaciones Rack soporte de tubería U-038	\N	\N	42	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:33.084884	2025-12-18 18:34:33.084886
751	Documento alcance EWP-300-03-CIV-0001	\N	\N	42	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:33.10021	2025-12-18 18:34:33.100211
754	Cantidades de obra	\N	\N	43	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:54.15268	2025-12-18 18:34:54.152681
760	Cantidades de obra	\N	\N	45	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:35:37.872026	2025-12-18 18:35:37.872027
764	Cantidades de obra	\N	\N	46	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:36:00.177713	2025-12-18 18:36:00.177721
770	Documento alcance CWP-300-03-MET-0002	\N	\N	44	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:36:25.909039	2025-12-18 18:36:25.909044
775	Planimetría	\N	\N	208	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:51:58.556848	2025-12-18 18:52:05.32386
777	Planimetría	\N	\N	63	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:52:48.741468	2025-12-18 18:52:48.74147
783	Documento alcance EWP-300-02-CIV-0001	\N	\N	70	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:55:15.353829	2025-12-18 18:55:15.353831
790	Cimentaciones bombas	\N	\N	209	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:59:04.188201	2025-12-18 18:59:04.188204
803	Isométricos tuberías	\N	\N	210	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:31.108068	2025-12-18 19:03:31.108069
804	Documento alcance EWP-300-02-MET-0001	\N	\N	210	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:31.113193	2025-12-18 19:03:31.113194
809	Documento alcance CWP-300-02-ELE-0001	\N	\N	73	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:59.77977	2025-12-18 19:03:59.779772
1044	Actualizar Matriz Causa Efecto PCS U-002	\N	\N	149	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 20:00:29.119957	2025-12-18 20:00:29.119961
1046	Actualizar Layout Cuartos de Control SIH02	\N	\N	149	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 20:01:30.952461	2025-12-18 20:01:30.952466
1055	Cantidades obra	\N	\N	223	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:46:55.49317	2025-12-19 14:46:55.493173
1061	Actualización plano Unifilar	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.384937	2025-12-19 14:57:38.384939
1064	Documento alcance EWP-002-01-ELE-0002	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.400123	2025-12-19 14:57:38.400126
1068	Cantidades de obra de Instalación Eléctrica	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.406205	2025-12-19 14:57:38.406206
1070	Hojas de Datos de Equipos Eléctricos (S/E-03)	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.411265	2025-12-19 14:57:38.411266
311	Elaborar P&IDs LOE	\N	\N	140	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:15:58.687887	2025-11-27 20:15:58.687893
734	Diagramas de Cajas de Conexionado	\N	\N	198	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:52.31419	2025-12-18 16:08:52.314192
746	Modelo 3D	\N	\N	42	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:33.079557	2025-12-18 18:34:33.07956
752	Planimetría	\N	\N	43	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:54.152188	2025-12-18 18:34:54.15219
767	Planimetría	\N	\N	46	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:36:00.179429	2025-12-18 18:36:00.179431
768	Cantidades de obra	\N	\N	44	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:36:25.900558	2025-12-18 18:36:25.900566
773	Cantidades de obra	\N	\N	208	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:51:58.553887	2025-12-18 18:52:13.105385
779	Cantidades de obra	\N	\N	63	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:52:48.742506	2025-12-18 18:52:48.742508
782	Planimetría	\N	\N	70	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:55:15.352811	2025-12-18 18:55:15.352813
787	Cantidades de obra	\N	\N	67	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:55:53.530765	2025-12-18 18:55:53.530767
789	Memoria de calculo	\N	\N	209	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:59:04.185915	2025-12-18 18:59:04.185919
796	Documento alcance EWP-300-02-MEC-0002	\N	\N	71	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:01:51.55281	2025-12-18 19:01:51.552814
800	Modelo 3D	\N	\N	210	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:31.098864	2025-12-18 19:03:31.098866
802	Planos Arreglos Generales de Tubería (Plantas y Elevaciones)	\N	\N	210	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:31.107666	2025-12-18 19:03:31.107667
806	Cantidades de Obra (sumario)	\N	\N	210	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:31.1146	2025-12-18 19:03:31.114601
811	Cantidades de obra	\N	\N	73	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:59.781588	2025-12-18 19:03:59.781589
1065	Actualización Planimetría de la nueva Clasificación del área	\N	\N	12	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 14:57:38.400603	2025-12-19 14:57:38.400604
1072	Documento alcance EWP-149-03-MEC-0002	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 15:47:51.850909	2025-12-19 15:47:51.850911
313	Definir Ruteo SIH02	\N	\N	140	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 20:15:58.689012	2025-11-27 20:15:58.689014
735	Listado de materiales (incl. químicos)	\N	\N	198	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:52.314673	2025-12-18 16:08:52.314675
743	Cantidades de obra	\N	\N	196	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:09:30.083447	2025-12-18 16:09:30.083449
744	Planimetría de cimentaciones y sistemas enterrados	\N	\N	42	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:33.078164	2025-12-18 18:34:33.078172
750	Documento alcance CWP-300-03-CIV-0001	\N	\N	42	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:33.09943	2025-12-18 18:34:33.099431
762	Planimetría	\N	\N	45	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:35:37.881968	2025-12-18 18:35:37.881969
769	Planimetría	\N	\N	44	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:36:25.904567	2025-12-18 18:36:25.904571
774	Documento alcance CWP-139-01-CIV-0001	\N	\N	208	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:51:58.554782	2025-12-18 18:52:18.575472
778	Documento alcance CWP-139-02-ELE-0001	\N	\N	63	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:52:48.742033	2025-12-18 18:52:48.742035
781	Documento alcance CWP-300-02-CIV-0001	\N	\N	70	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:55:15.351937	2025-12-18 18:55:15.351939
785	Documento alcance EWP-300-02-MEC-0001	\N	\N	67	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:55:53.529418	2025-12-18 18:55:53.529421
791	Documento alcance CWP-300-02-CIV-0002	\N	\N	209	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:59:04.18871	2025-12-18 18:59:04.188711
795	Modelo 3D	\N	\N	71	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:01:51.546639	2025-12-18 19:01:51.546645
810	Planimetría	\N	\N	73	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:59.780339	2025-12-18 19:03:59.78034
736	Planimetría de Rutas de bandejas, Conduit y cables	\N	\N	198	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 16:08:52.325303	2025-12-18 16:08:52.325306
749	Estructura Rack soporte de tubería U-038	\N	\N	42	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:33.096295	2025-12-18 18:34:33.096296
755	Documento alcance CWP-300-03-MET-0001	\N	\N	43	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:34:54.152891	2025-12-18 18:34:54.152892
765	Documento alcance CWP-300-03-INS-0001	\N	\N	46	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:36:00.178368	2025-12-18 18:36:00.17837
772	Documento alcance EWP-139-01-CIV-0001	\N	\N	208	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:51:58.553243	2025-12-18 18:52:29.340107
780	Cantidades de obra	\N	\N	70	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:55:15.34566	2025-12-18 18:55:15.345667
784	Documento alcance CWP-300-02-MEC-000	\N	\N	67	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:55:53.528743	2025-12-18 18:55:53.528748
788	Diagnóstico estructural cimentaciones bombas	\N	\N	209	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:59:04.181813	2025-12-18 18:59:04.181818
794	Documento alcance EWP-300-02-CIV-0002	\N	\N	209	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 18:59:04.202684	2025-12-18 18:59:04.202686
798	Datasheet nuevas bombas	\N	\N	71	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:01:51.553918	2025-12-18 19:01:51.553919
812	Planimetría puesta a tierra y conexión a malla existente	\N	\N	73	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-18 19:03:59.782317	2025-12-18 19:03:59.782319
1087	Elaborar planos de desmantelamiento, cartillas	\N	\N	168	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:02:12.893325	2025-12-19 16:02:12.89333
1102	Documento alcance CWP-300-02-INS-0001	\N	\N	224	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:12:44.337595	2025-12-19 16:12:44.337597
1111	Planimetría	\N	\N	225	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:36:01.046112	2025-12-19 16:36:01.046117
1117	Modelado 3D	\N	\N	29	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:43:15.354117	2025-12-19 16:43:15.354119
1118	Listado de materiales	\N	\N	29	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:43:15.361929	2025-12-19 16:43:15.361932
1124	Diseño línea Gases a Gases TEA	\N	\N	141	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:08.747332	2025-12-19 16:47:08.747335
1130	Actualizar diagramas de procesos con información vendor	\N	\N	141	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:08.766949	2025-12-19 16:47:08.76695
1088	Actualizar cantidades obra	\N	\N	168	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:02:12.895015	2025-12-19 16:02:12.895018
1094	Cantidades de obra	\N	\N	48	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:03:23.218168	2025-12-19 16:03:23.218172
1101	Documento alcance EWP-300-02-INS-0001	\N	\N	224	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:12:44.337117	2025-12-19 16:12:44.337118
1105	Hojas de Datos para Gavetas de CCM 15-MCC-0-03B existente en SE 15-ENC-0-02	\N	\N	80	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:16:42.978729	2025-12-19 16:16:42.978734
375	Elaborar TOR bombas P-2310 A/B	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.260222	2025-11-27 21:37:17.260224
382	Elaborar Modelo 3D	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.277383	2025-11-27 21:37:17.277384
384	Elaborar Planos de detalle canister	\N	\N	24	\N	1	NO_INICIADO	0	\N	f	t	null	2025-11-27 21:37:17.282861	2025-11-27 21:37:17.282862
1108	Documento alcance EWP-146-01-ELE-0001	\N	\N	80	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:16:42.98826	2025-12-19 16:16:42.988262
1115	Diagramas de Cajas de Conexionado	\N	\N	29	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:43:15.352781	2025-12-19 16:43:15.352788
1120	Planimetría de Ubicación de Instrumentos	\N	\N	29	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:43:15.365784	2025-12-19 16:43:15.365786
1125	Actualizar P&ID	\N	\N	141	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:08.748709	2025-12-19 16:47:08.748711
1135	Elaborar Planos SWS modularizada plantas y elevaciones	\N	\N	138	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:47:39.643969	2025-12-19 16:47:39.643971
1137	Elaborar cálculos de flexibilidad	\N	\N	167	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:04.612657	2025-12-19 16:48:04.612658
1143	Elaborar Cantidades de obra - Tubería	\N	\N	167	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:04.635889	2025-12-19 16:48:04.635889
1149	Actualizar de Diagramas Unifilares	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.274314	2025-12-19 16:48:42.274315
1152	Actualizar de Hojas de Datos para nuevo CCM en SE #2.1	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.287577	2025-12-19 16:48:42.287578
1155	Actualizar de Criterios de diseño	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.293709	2025-12-19 16:48:42.29371
1157	Actualizar Análisis y Resumen de Cargas Eléctricas	\N	\N	147	\N	1	NO_INICIADO	0	\N	f	t	null	2025-12-19 16:48:42.299389	2025-12-19 16:48:42.29939
\.


--
-- Data for Name: paquetes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.paquetes (id, nombre, codigo, descripcion, tipo, responsable, cwp_id, forecast_inicio, forecast_fin, fecha_inicio_prevista, fecha_fin_prevista, porcentaje_completitud, estado, metadata_json, fecha_creacion, fecha_actualizacion) FROM stdin;
187	Soportes y estructuras	EWP-121-01-CIV-0001	\N	EWP	Firma	184	2025-12-05	2025-12-05	\N	\N	0	NO_INICIADO	null	2025-12-05 15:12:35.525209	2025-12-05 15:12:35.525215
191	I&C - Cables /Aire de instrumentos/Válvula de control e instrumentos	EWP-121-01-INS-0001	\N	EWP	Firma	186	2025-12-05	2025-12-05	\N	\N	0	NO_INICIADO	null	2025-12-05 15:13:40.996337	2025-12-05 15:13:40.996347
196	Tuberia - Parada	EWP-300-01-MET-0002	\N	EWP	Firma	60	2025-12-05	2025-12-05	\N	\N	0	NO_INICIADO	null	2025-12-05 15:28:57.891849	2025-12-05 15:28:57.891855
29	Obras I&C Pre parada	EWP-149-03-INS-0001	\N	EWP	Firma	42	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:59:05.926513	2025-12-18 14:46:09.490689
26	Instalación Tubería Parada	EWP-149-03-MET-0002	\N	EWP	Firma	39	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:58:54.30101	2025-12-18 14:47:57.3605
212	Desmantelamiento Equipos	EWP-002-02-MEC-0001	\N	EWP	Firma	199	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:09:27.601084	2025-12-18 19:09:27.601091
219	Tie-ins Conexión Tuberias Nuevas 	EWP-121-01-MET-0002	\N	EWP	Firma	204	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:34:44.424739	2025-12-18 19:34:44.424747
220	Civil - Demolición y mamposteria en SE	EWP-002-04-CIV-0001	\N	EWP	Firma	100	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:36:31.181276	2025-12-18 19:36:31.181283
221	Civil - Soporteria	EWP-002-04-CIV-0002	\N	EWP	Firma	101	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:37:02.558684	2025-12-18 19:37:02.55869
5	Mecánica Equipos - Desmantelamiento	EWP-002-01-MEC-0001	\N	EWP	Firma	17	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 12:45:30.616912	2025-11-26 18:35:00.011289
14	Desmantelamiento de líneas	EWP-005-01-MET-0001	\N	EWP	Firma	25	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:49:21.870128	2025-11-26 18:33:42.437099
15	Desmantelamiento de equipos (11)	EWP-005-01-MEC-0001	\N	EWP	Firma	29	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:49:32.042291	2025-11-26 18:33:46.844608
16	Demoliciones Concreto/Metalico Estructura	EWP-005-01-CIV-0001	\N	EWP	Firma	23	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:49:41.307481	2025-11-26 18:33:50.616961
17	Desmantelamiento electrico (cables/motores)/Reubicación (de requerirse)	EWP-005-01-ELE-0001	\N	EWP	Firma	30	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:49:47.824174	2025-11-26 18:33:55.153156
20	Reubicación de Lineas (5)	EWP-005-01-MET-0002	\N	EWP	Firma	26	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:50:09.085298	2025-11-26 18:34:06.753502
6	Electrica - desmantelamiento	EWP-002-01-ELE-0001	\N	EWP	Firma	19	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 12:45:36.351522	2025-11-26 18:35:01.839275
7	Instrumentación - desmantelamiento	EWP-002-01-INS-0001	\N	EWP	Firma	21	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 12:45:41.129345	2025-11-26 18:35:03.33897
8	Civil Demolición	EWP-002-01-CIV-0001	\N	EWP	Firma	7	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 12:45:44.452531	2025-11-26 18:35:04.715323
9	Civil nueva cimentación, drenajes y soportes	EWP-002-01-CIV-0002	\N	EWP	Firma	8	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 12:45:49.545083	2025-11-26 18:35:08.315462
10	Mecánica Equipos nuevas bombas	EWP-002-01-MEC-0002	\N	EWP	Firma	18	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 12:46:10.372816	2025-11-26 18:35:11.028192
12	Electrica - nuevo /puesta a tierra /Cableado desde la bomba hasta la sub estación	EWP-002-01-ELE-0002	\N	EWP	Firma	20	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 12:46:19.898098	2025-11-26 18:35:15.314434
11	Tuberias nuevas	EWP-002-01-MET-0002	\N	EWP	Firma	10	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 12:46:14.9354	2025-11-26 18:35:13.685361
13	Instrumentación - Nuevo	EWP-002-01-INS-0002	\N	EWP	Firma	22	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 12:46:24.551362	2025-11-26 18:35:16.723172
44	Tuberias - Tie-ins de interconexión	EWP-300-03-MET-0002	\N	EWP	Firma	65	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:18:35.034989	2025-11-26 18:59:11.874753
4	Tuberias desmantelamiento	EWP-002-01-MET-0001	\N	EWP	Firma	9	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 12:45:25.160982	2025-11-26 18:34:57.732971
22	Mecánica Equipos - Desmantelamiento (preparada)	EWP-149-03-MEC-0001	\N	EWP	Firma	36	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:58:38.054156	2025-11-26 18:36:04.294667
28	Civil - Demolición	EWP-149-03-CIV-0002	\N	EWP	Firma	34	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:59:02.132515	2025-11-26 18:36:09.431359
24	Mecánica Equipos - Nuevos	EWP-149-03-MEC-0002	\N	EWP	Firma	37	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:58:45.573889	2025-11-26 18:36:15.163821
25	Tuberia - Preparada	EWP-149-03-MET-0001	\N	EWP	Firma	38	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:58:50.063111	2025-11-26 18:36:18.580382
27	Electrico - Parada	EWP-149-03-ELE-0001	\N	EWP	Firma	41	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 15:58:58.372691	2025-11-26 18:36:25.562204
30	Civil - Reforzamiento	EWP-149-02-CIV-0001	\N	EWP	Firma	43	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:05:06.619413	2025-11-26 18:37:21.136628
31	Civil - Nuevas Estructuras	EWP-149-02-CIV-0002	\N	EWP	Firma	44	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:05:13.809498	2025-11-26 18:37:24.133641
32	Tuberia - Preparada (Montaje, steam tracing)	EWP-149-02-MET-0001	\N	EWP	Firma	45	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:05:17.461148	2025-11-26 18:37:26.727504
33	Tuberia - Parada	EWP-149-02-MET-0002	\N	EWP	Firma	46	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:05:21.050254	2025-11-26 18:37:31.649727
34	Electrico - Bandeja, cableado, iluminación, puesta a tierra	EWP-149-02-ELE-0001	\N	EWP	Firma	47	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:05:26.56207	2025-11-26 18:37:34.523896
35	I&C - Bandeja / cableado /Instrumentos / Valvulas	EWP-149-02-INS-0001	\N	EWP	Firma	48	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:05:30.49779	2025-11-26 18:37:37.282608
38	Tuberias - Tuberia nuevas montaje	EWP-149-01-MET-0001	\N	EWP	Firma	51	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:12:38.248706	2025-11-26 18:39:00.808617
39	Tuberias - Tie-ins de interconexión	EWP-149-01-MET-0002	\N	EWP	Firma	52	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:12:42.826575	2025-11-26 18:39:03.737458
40	Electrica Bandejas /cableado / puesta a tierra	EWP-149-01-ELE-0001	\N	EWP	Firma	53	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:12:47.458094	2025-11-26 18:39:06.169706
45	Electrica Bandejas /cableado / Iluminación /puesta a tierra	EWP-300-03-ELE-0001	\N	EWP	Firma	66	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:18:39.585329	2025-11-26 18:59:13.177335
46	I&C Cableado / Instrumentos /Válvulas	EWP-300-03-INS-0001	\N	EWP	Firma	67	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:18:45.333286	2025-11-26 18:59:14.431141
47	Civil - Cimentaciones/estructuras-piperack/Soportes de tuberia-bandeja	EWP-038-02-CIV-0001	\N	EWP	Firma	68	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:20:19.145676	2025-11-26 19:00:26.624417
43	Tuberias - Tuberia nuevas montaje	EWP-300-03-MET-0001	\N	EWP	Firma	64	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:18:31.123407	2025-11-26 18:59:10.091403
49	Mecánica Equipos - Montaje de Recipiente y bombas nuevas	EWP-038-02-MEC-0001	\N	EWP	Firma	70	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:20:29.237641	2025-11-26 19:00:32.76542
50	Tuberias - Tuberia nuevas montaje	EWP-038-02-MET-0001	\N	EWP	Firma	71	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:20:33.151531	2025-11-26 19:00:37.399451
188	Tuberias nuevas - tie-ins	EWP-121-01-MET-0001	\N	EWP	Firma	185	2025-12-05	2025-12-05	\N	\N	0	NO_INICIADO	null	2025-12-05 15:12:41.74985	2025-12-05 15:12:41.74986
192	Civil - reforzamiento	EWP-300-01-CIV-0001	\N	EWP	Firma	55	2025-12-05	2025-12-05	\N	\N	0	NO_INICIADO	null	2025-12-05 15:28:34.481191	2025-12-05 15:28:34.481197
197	Instalación motor, puesta a tierra, conexionado	EWP-300-01-ELE-0001	\N	EWP	Firma	61	2025-12-05	2025-12-05	\N	\N	0	NO_INICIADO	null	2025-12-05 15:29:02.850691	2025-12-05 15:29:02.850698
216	Civil - Demolición y mamposteria en SE	EWP-002-03-CIV-0001	\N	EWP	Firma	2	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:24:38.182846	2025-12-18 19:24:38.182853
217	Civil - Soporteria	EWP-002-03-CIV-0002	\N	EWP	Firma	3	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:25:19.813413	2025-12-18 19:25:19.81342
52	I&C Cableado / Instrumentos /Válvulas	EWP-038-02-INS-0001	\N	EWP	Firma	73	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:20:43.001578	2025-11-26 19:00:42.963054
193	Civil - Cimentaciones, drenajes	EWP-300-01-CIV-0002	\N	EWP	Firma	56	2025-12-05	2025-12-05	\N	\N	0	NO_INICIADO	null	2025-12-05 15:28:41.187282	2025-12-05 15:28:41.187289
198	Instalación Instrumentos - cuadros de contro	EWP-300-01-INS-0001	\N	EWP	Firma	62	2025-12-05	2025-12-05	\N	\N	0	NO_INICIADO	null	2025-12-05 15:29:07.649954	2025-12-05 15:29:07.649962
218	 Obras Electricas Instalación de Equipos Electricos /Retrofit SE/Pruebas	EWP-002-03-ELE-0003	\N	EWP	Firma	203	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:28:04.205737	2025-12-18 19:28:04.205744
199	hhgjhlg	PWP-CWA-001-P-0001	\N	PWP	Firma	189	2025-12-15	2025-12-15	\N	\N	0	NO_INICIADO	null	2025-12-15 20:12:34.763126	2025-12-15 20:12:34.763132
194	Revamp del Recipiente BATCH DRUM AR-D-302C	EWP-300-01-MEC-0001	\N	EWP	Firma	57	2025-12-05	2025-12-05	\N	\N	0	NO_INICIADO	null	2025-12-05 15:28:47.257965	2025-12-18 16:02:17.317735
70	Obras Civiles - Demoliciones	EWP-300-02-CIV-0001	\N	EWP	Firma	81	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:45:04.686947	2025-12-18 19:00:12.006494
223	Desmantelamiento I&C /Reubicación (de requerirse)	EWP-005-01-INS-0001	\N	EWP	Firma	205	2025-12-19	2025-12-19	\N	\N	0	NO_INICIADO	null	2025-12-19 14:46:36.662944	2025-12-19 14:46:36.662951
90	Electrica - Instalación de Equipos Electricos /Retrofit SE/Pruebas	EWP-002-03-ELE-0001	\N	EWP	Firma	4	\N	\N	\N	\N	0	NO_INICIADO	null	2025-11-26 16:57:12.545378	2025-11-26 16:57:12.545382
92	Tuberias, cableado y conexionado	EWP-002-03-ELE-0002	\N	EWP	Firma	5	\N	\N	\N	\N	0	NO_INICIADO	null	2025-11-26 16:57:20.260622	2025-11-26 16:57:20.260628
99	Tuberias - Preparada	EWP-137-01-MET-0001	\N	EWP	Firma	106	\N	\N	\N	\N	0	NO_INICIADO	null	2025-11-26 17:09:03.340304	2025-11-26 17:09:03.340311
100	Tuberias - Parada (conexiones)	EWP-137-01-MET-0002	\N	EWP	Firma	107	\N	\N	\N	\N	0	NO_INICIADO	null	2025-11-26 17:09:07.306073	2025-11-26 17:09:07.306079
101	I&C - cableado/conduit, instalacion de instrumentos y válvulas	EWP-137-01-INS-0001	\N	EWP	Firma	108	\N	\N	\N	\N	0	NO_INICIADO	null	2025-11-26 17:09:11.701438	2025-11-26 17:09:11.701445
102	Electrica Bandejas /cableado / Iluminación /puesta a tierra	EWP-137-01-ELE-0001	\N	EWP	Firma	109	\N	\N	\N	\N	0	NO_INICIADO	null	2025-11-26 17:09:16.106516	2025-11-26 17:09:16.106522
53	Sistema contra incendios/f&G	EWP-038-02-CIN-0001	\N	EWP	Firma	74	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:20:55.334011	2025-11-26 19:00:45.390972
63	Electrica - Bandejas/Conduit/Cables (Pre-parada)	EWP-139-01-ELE-0001	\N	EWP	Firma	76	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:32:12.490954	2025-11-26 19:01:16.273443
67	Mecánica Equipos - Desmantelamiento	EWP-300-02-MEC-0001	\N	EWP	Firma	82	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:44:52.73286	2025-11-26 19:54:27.875976
73	Instalación motor, puesta a tierra	EWP-300-02-ELE-0001	\N	EWP	Firma	86	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:45:15.971998	2025-11-26 19:56:23.737136
75	Tuberias	EWP-002-02-MET-0001	\N	EWP	Firma	88	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:48:05.209347	2025-11-26 19:56:46.277174
76	Soportes	EWP-002-02-CIV-0001	\N	EWP	Firma	89	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:48:09.141114	2025-11-26 19:56:48.886868
80	Electrica - Instalación de Equipos Electricos /Retrofit SE/Pruebas	EWP-146-01-ELE-0001	\N	EWP	Firma	93	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:51:09.862268	2025-11-26 20:04:44.509781
81	Electrica - Conexionado de cableado y canalizaciones	EWP-146-01-ELE-0002	\N	EWP	Firma	94	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:51:14.427096	2025-11-26 20:04:47.920762
95	Instalación/Montaje de Equipos/Bandejas-conduit/Cableado a 0 metros /Pruebas (Contrato Marco)	EWP-002-04-INS-0001	\N	EWP	Firma	102	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:06:06.907479	2025-11-26 20:27:28.006692
96	Conexionado electrico	EWP-002-04-ELE-0001	\N	EWP	Firma	104	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:06:12.412395	2025-11-26 20:27:31.360796
97	Conexionado, configuración y pruebas (Ej MAC	EWP-002-04-INS-0002	\N	EWP	Firma	103	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:06:16.438218	2025-11-26 20:27:34.778993
103	Civil - Adecuación del terreno, Pilotaje, Cimentaciones, drenajes (todos)	EWP-038-01-CIV-0001	\N	EWP	Firma	110	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:51:40.497991	2025-11-26 20:31:06.974501
104	Electrica - Malla de puesta a tierra	EWP-038-01-ELE-0001	\N	EWP	Firma	111	\N	\N	\N	\N	0	NO_INICIADO	null	2025-11-26 17:51:51.850966	2025-11-26 17:51:51.850973
195	Tuberia - Preparada	EWP-300-01-MET-0001	\N	EWP	Firma	59	2025-12-05	2025-12-05	\N	\N	0	NO_INICIADO	null	2025-12-05 15:28:52.482105	2025-12-05 15:28:52.482112
200	hghgg	EWP-CWA-001-P-0001	\N	EWP	Firma	189	2025-12-15	2025-12-15	\N	\N	0	NO_INICIADO	null	2025-12-15 20:14:29.393119	2025-12-15 20:14:29.393125
109	Obras Electricas	EWP-038-01-ELE-0002	\N	EWP	Firma	118	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:52:17.114973	2025-12-18 19:51:16.663568
48	Obras Electricas Bandejas / Cableado / Iluminación / Puesta a Tierra	EWP-038-02-ELE-0001	\N	EWP	Firma	69	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:20:23.302577	2025-12-19 16:05:23.453601
201	Reubicación de Líneas (5)	EWP-005-01-MET-0003	\N	EWP	Firma	191	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 14:26:21.413922	2025-12-18 14:26:21.413932
105	Tuberia - Instalación tuberias enterradas - Drenajes	EWP-038-01-MET-0001	\N	EWP	Firma	112	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:51:55.755142	2025-11-26 20:31:11.309531
202	Instalación de Tuberías Nuevas	EWP-002-01-MET-0003	\N	EWP	Firma	192	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 14:37:29.417059	2025-12-18 14:37:29.417065
208	Obras Civiles Soportes	EWP-139-01-CIV-0001	\N	EWP	Firma	75	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 18:51:41.226292	2025-12-18 18:51:41.226301
209	Obras Civiles - Cimentaciones	EWP-300-02-CIV-0002	\N	EWP	Firma	196	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 18:58:42.413118	2025-12-18 18:58:42.413124
210	Montaje de Tuberias	EWP-300-02-MET-0001	\N	EWP	Firma	197	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:02:53.967224	2025-12-18 19:02:53.96723
211	Montaje de Bombas Nuevas	EWP-300-02-MEC-0003	\N	EWP	Firma	198	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:05:39.358296	2025-12-18 19:05:39.358302
110	Obras I&C	EWP-038-01-INS-0001	\N	EWP	Firma	119	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:52:21.588535	2025-12-18 19:51:48.943911
224	Obras I&C Instalación Instrumentos	EWP-300-02-INS-0001	\N	EWP	Firma	206	2025-12-19	2025-12-19	\N	\N	0	NO_INICIADO	null	2025-12-19 16:12:18.734366	2025-12-19 16:12:18.734372
203	Demoliciones ConcretoRack	EWP-149-01-CIV-0001	\N	EWP	Firma	49	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 15:36:21.485454	2025-12-18 15:36:21.485461
106	Civil - Estructuras-piperack/Soportes de tuberia-bandeja	EWP-038-01-CIV-0002	\N	EWP	Firma	113	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:52:00.914029	2025-11-26 20:31:15.319082
225	 Montaje y Conexionado Tuberias Nuevas	EWP-038-02-MET-0002	\N	EWP	Firma	207	2025-12-19	2025-12-19	\N	\N	0	NO_INICIADO	null	2025-12-19 16:35:39.590366	2025-12-19 16:35:39.590372
111	Civil - Adecuación final del terreno, area de mantenimiento/acceso	EWP-038-01-CIV-0003	\N	EWP	Firma	114	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:52:25.806604	2025-11-26 20:31:34.101033
204	Cimentaciones / Estructuras-Piperack / Soportes de Tuberia-Bandeja	EWP-149-01-CIV-0002	\N	EWP	Firma	50	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 15:37:37.005691	2025-12-18 15:37:37.005698
107	Tuberia - Instalación y montaje de tuberias nueva	EWP-038-01-MET-0002	\N	EWP	Firma	116	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:52:05.802524	2025-11-26 20:31:19.466883
214	Obras I&C	EWP-002-02-INS-0001	\N	EWP	Firma	201	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:12:56.072664	2025-12-18 19:12:56.072673
215	Tie-in´s Conexión Tuberias Nuevas	EWP-002-02-MET-0002	\N	EWP	Firma	202	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:14:08.503206	2025-12-18 19:14:08.503212
222	Civil - Estructuras-piperack/Soportes de tuberia-bandeja	EWP-137-01-CIV-0001	\N	EWP	Firma	105	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:39:34.557591	2025-12-18 19:39:34.557597
226	Montaje de Equipos Nuevos	EWP-002-02-MEC-0002	\N	EWP	Firma	208	2025-12-19	2025-12-19	\N	\N	0	NO_INICIADO	null	2025-12-19 16:54:06.906415	2025-12-19 16:54:06.906424
114	Obras Electricas Preparada	EWP-149-03-ELE-0002	\N	EWP	Firma	40	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 18:09:38.898084	2025-12-18 14:43:58.12413
115	Civil - Cimentación/Estructura/Drenajes/Soportes	EWP-149-03-CIV-0002	\N	EWP	Firma	126	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 18:14:32.983791	2025-11-26 18:36:12.1465
205	Obras I&C Cableado / Instrumentos / Válvulas	EWP-149-01-INS-0001	\N	EWP	Firma	54	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 15:40:52.524524	2025-12-18 15:40:52.52453
207	Montaje de Bombas Nuevas	EWP-300-01-MEC-0002	\N	EWP	Firma	194	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 16:06:19.778777	2025-12-18 16:06:19.778782
71	Montaje de Bombas Nuevas 300-AR-P-308 C/D 300-AR-P-309 C/D	EWP-300-02-MEC-0002	\N	EWP	Firma	83	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:45:08.218984	2025-12-18 19:01:34.770283
213	Obras Electricas	EWP-002-02-ELE-0001	\N	EWP	Firma	200	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 19:12:02.906206	2025-12-18 19:12:02.906212
42	Civil - Cimentaciones/estructuras-piperack/Soportes de tuberia-bandeja	EWP-300-03-CIV-0001	\N	EWP	Firma	63	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:18:27.03912	2025-11-26 18:59:00.135224
82	I&C - Instalación/Montaje de Equipos/Bandejas-conduit/Cableado a 0 metros /Pruebas (Contrato Marco)	EWP-146-01-INS-0001	\N	EWP	Firma	95	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 16:51:18.433795	2025-11-26 20:04:50.496443
116	Civil - Cimentaciones, estructuras y soportes	EWP-037-01-CIV-0001	\N	EWP	Firma	121	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 18:32:01.811541	2025-11-26 20:29:55.086999
117	Tuberias - Preparada	EWP-037-01-MET-0001	\N	EWP	Firma	122	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 18:32:06.368464	2025-11-26 20:29:58.565841
118	Tuberias - Parada (conexiones)	EWP-037-01-MET-0002	\N	EWP	Firma	123	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 18:32:10.276501	2025-11-26 20:30:02.45241
119	Electrica - Canalizaciones y puesta a tierra	EWP-037-01-ELE-0001	\N	EWP	Firma	124	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 18:32:15.414836	2025-11-26 20:30:06.170567
120	I&C - cableado/conduit, instalacion de instrumentos y válvulas	EWP-037-01-INS-0001	\N	EWP	Firma	125	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 18:32:19.85658	2025-11-26 20:30:10.115387
108	Mecánica Equipos - Montaje de modulos/equipos	EWP-038-01-MEC-0001	\N	EWP	Firma	117	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:52:10.559564	2025-11-26 20:31:22.537755
112	Civil - Plataformas y escaleras - Ergonomía	EWP-038-01-CIV-0004	\N	EWP	Firma	115	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:52:29.827211	2025-11-26 20:31:37.131341
113	SCI - Fire and Gas y sistema contra incendio	EWP-038-01-CIN-0001	\N	EWP	Firma	120	2025-11-26	2025-11-26	\N	\N	0	NO_INICIADO	null	2025-11-26 17:52:34.430111	2025-11-26 20:31:40.199893
159	General Ing Detalle Electrica 149-04	EWP-149-04-ELE-0001	\N	EWP	Firma	159	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:51:21.608948	2025-11-27 16:51:21.608957
139	General Ing Detalle Civil 038-00	EWP-038-00-CIV-0001	\N	EWP	Firma	147	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:26:32.42741	2025-11-27 16:26:32.427417
138	General Ing Detalle Mecánica 038-00	EWP-038-00-MEC-0001	\N	EWP	Firma	148	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:26:06.405277	2025-11-27 16:26:40.648546
141	General Ing Detalle Procesos 038-00	EWP-038-00-PRO-0001	\N	EWP	Firma	145	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:27:26.987938	2025-11-27 16:27:26.987941
140	Cierre brechas Inst y Control 038-00	EWP-038-00-INS-0001	\N	EWP	Firma	146	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:27:12.648202	2025-11-27 16:34:22.71277
142	General Ing Detalle Inst y Control 038-00	EWP-038-00-INS-0002	\N	EWP	Firma	146	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:27:55.206485	2025-11-27 16:34:39.701297
147	General Ing Detalle Electrica 038-00	EWP-038-00-ELE-0002	\N	EWP	Firma	151	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:32:56.890278	2025-11-27 16:34:49.70175
146	Cierre de Brechas Electrica 038-00	EWP-038-00-ELE-0001	\N	EWP	Firma	151	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:32:43.030424	2025-11-27 16:35:20.982716
148	Cierre de Brechas Procesos 002-00	EWP-002-00-PRO-0001	\N	EWP	Firma	152	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:41:36.186287	2025-11-27 16:41:36.186295
149	Cierre de Brechas Inst y Control 002-00	EWP-002-00-INS-0001	\N	EWP	Firma	153	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:41:55.30438	2025-11-27 16:41:55.304386
150	General Ing Detalle Procesos 038-00	EWP-002-00-PRO-0002	\N	EWP	Firma	152	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:42:23.213234	2025-11-27 16:42:23.213241
151	General Ing Detalle Inst y Control 002-00	EWP-002-00-INS-0002	\N	EWP	Firma	153	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:42:48.490396	2025-11-27 16:42:48.490403
152	General Ing Detalle Electrica 002-00	EWP-002-00-ELE-0001	\N	EWP	Firma	155	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:43:23.351144	2025-11-27 16:43:50.282254
153	General Ing Detalle Tuberia 002-00	EWP-002-00-MET-0001	\N	EWP	Firma	154	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:43:58.206457	2025-11-27 16:43:58.206462
154	Cierre de Brechas Procesos 149-04	EWP-149-04-PRO-0001	\N	EWP	Firma	156	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:48:47.788963	2025-11-27 16:48:47.788969
155	Cierre de Brechas Inst y Control 149-04	EWP-149-04-INS-0001	\N	EWP	Firma	157	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:49:04.494474	2025-11-27 16:49:04.494482
156	Cierre de Brechas Mecánica 149-04	EWP-149-04-MEC-0001	\N	EWP	Firma	161	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:49:46.510914	2025-11-27 16:49:46.510921
157	General Ing Detalle Procesos 149-04	EWP-149-04-PRO-0002	\N	EWP	Firma	156	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:50:30.906146	2025-11-27 16:50:30.906155
158	General Ing Detalle Tuberia 002-00	EWP-149-04-MET-0001	\N	EWP	Firma	158	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:50:56.154381	2025-11-27 16:50:56.154403
160	General Ing Detalle Inst y Control 149-04	EWP-149-04-INS-0002	\N	EWP	Firma	157	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:51:32.801657	2025-11-27 16:51:32.801665
161	Cierre de Brechas Electrica 300-04	EWP-300-04-ELE-0001	\N	EWP	Firma	165	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:57:09.935971	2025-11-27 16:57:09.935978
162	Cierre brechas Inst y Control 300-04	EWP-300-04-INS-0001	\N	EWP	Firma	163	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:57:21.92567	2025-11-27 16:57:21.925676
163	General Ing Detalle Procesos 300-04	EWP-300-04-PRO-0001	\N	EWP	Firma	162	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:58:53.260157	2025-11-27 16:58:53.260163
164	General Ing Detalle Inst y Control 300-04	EWP-300-04-INS-0002	\N	EWP	Firma	163	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:59:04.092305	2025-11-27 16:59:04.092312
165	General Ing Detalle Tubería 300-04	EWP-300-04-MET-0001	\N	EWP	Firma	164	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:59:16.720173	2025-11-27 16:59:16.72018
166	General Ing Detalle Electrica 149-04	EWP-300-04-ELE-0002	\N	EWP	Firma	165	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 16:59:38.663464	2025-11-27 16:59:38.66347
167	General Ing Detalle Tubería 038-00	EWP-038-00-MET-0001	\N	EWP	Firma	166	2025-11-27	2025-11-27	\N	\N	0	NO_INICIADO	null	2025-11-27 18:15:12.790383	2025-11-27 18:15:26.903958
168	Desmantelamiento SCI (reubicar monitor)	EWP-038-02-INS-0002	\N	EWP	Firma	167	2025-12-02	2025-12-02	\N	\N	0	NO_INICIADO	null	2025-12-02 13:29:11.259197	2025-12-02 13:29:11.259203
177	 Revamp Bombas centrifugas 149-AR-P-2310 A/B	EWP-149-03-MEC-0003	\N	EWP	Firma	176	2025-12-02	2025-12-02	\N	\N	0	NO_INICIADO	null	2025-12-02 14:38:46.793396	2025-12-18 14:53:32.12033
173	Tuberia - Parada	EWP-149-05-MET-0001	\N	EWP	Firma	172	2025-12-02	2025-12-02	\N	\N	0	NO_INICIADO	null	2025-12-02 14:28:11.002482	2025-12-02 14:28:11.002488
174	Tuberia - PreParada	EWP-149-05-MET-0002	\N	EWP	Firma	173	2025-12-02	2025-12-02	\N	\N	0	NO_INICIADO	null	2025-12-02 14:28:18.967258	2025-12-02 14:28:18.967264
175	Tuberia - Parada	EWP-149-06-MET-0001	\N	EWP	Firma	174	2025-12-02	2025-12-02	\N	\N	0	NO_INICIADO	null	2025-12-02 14:28:29.960794	2025-12-02 14:28:29.960801
176	Tuberia - PreParada	EWP-149-06-INS-0001	\N	EWP	Firma	175	2025-12-02	2025-12-02	\N	\N	0	NO_INICIADO	null	2025-12-02 14:28:35.098578	2025-12-02 14:28:35.098588
182	Electrico	EWP-149-07-ELE-0001	\N	EWP	Firma	181	2025-12-02	2025-12-02	\N	\N	0	NO_INICIADO	null	2025-12-02 20:27:59.49988	2025-12-02 20:27:59.499886
183	Instrumentación	EWP-149-07-INS-0001	\N	EWP	Firma	182	2025-12-02	2025-12-02	\N	\N	0	NO_INICIADO	null	2025-12-02 20:28:07.902348	2025-12-02 20:28:07.902358
184	Estructural-Civil	EWP-149-07-CIV-0001	\N	EWP	Firma	183	2025-12-02	2025-12-02	\N	\N	0	NO_INICIADO	null	2025-12-02 20:28:16.465239	2025-12-02 20:28:16.465245
206	 Tie-ins de Interconexión	EWP-149-01-MET-0003	\N	EWP	Firma	193	2025-12-18	2025-12-18	\N	\N	0	NO_INICIADO	null	2025-12-18 15:43:16.784637	2025-12-18 15:43:16.784644
\.


--
-- Data for Name: plot_plans; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.plot_plans (id, nombre, descripcion, image_url, proyecto_id) FROM stdin;
1	Plot_Plant_01	\N	/uploads/20251126_013951_Picture1.png	1
2	PLOT PLANT	\N	/uploads/20251127_011812_images.jpg	2
3	awf	\N	/uploads/20251127_011819_Edificio_Juanes.jpg	2
4	Plot_Plant_02	\N	/uploads/20251202_151726_PLOT_PLANT_2.png	1
5	Key Lake (EMBARK Project) 	\N	/uploads/20251215_191440_Layout.png	3
6	EMBARK Project Layout	\N	/uploads/20251215_193040_Layout1.png	3
\.


--
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.proyectos (id, nombre, descripcion, fecha_inicio, fecha_fin) FROM stdin;
1	Aguas Agrias - AWP		\N	\N
2	PROYECTO TEST		\N	\N
3	EMBARK		\N	\N
\.


--
-- Data for Name: tipos_entregables; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.tipos_entregables (id, nombre, codigo, categoria_awp, descripcion, disciplina_id, es_generico) FROM stdin;
\.


--
-- Name: cwa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.cwa_id_seq', 44, true);


--
-- Name: cwp_columnas_metadata_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.cwp_columnas_metadata_id_seq', 7, true);


--
-- Name: cwp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.cwp_id_seq', 208, true);


--
-- Name: disciplinas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.disciplinas_id_seq', 24, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.items_id_seq', 1198, true);


--
-- Name: paquetes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.paquetes_id_seq', 226, true);


--
-- Name: plot_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.plot_plans_id_seq', 6, true);


--
-- Name: proyectos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.proyectos_id_seq', 3, true);


--
-- Name: tipos_entregables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.tipos_entregables_id_seq', 1, false);


--
-- Name: cwa _cwa_codigo_plot_uc; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwa
    ADD CONSTRAINT _cwa_codigo_plot_uc UNIQUE (codigo, plot_plan_id);


--
-- Name: cwp _cwp_codigo_cwa_uc; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwp
    ADD CONSTRAINT _cwp_codigo_cwa_uc UNIQUE (codigo, cwa_id);


--
-- Name: cwa cwa_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwa
    ADD CONSTRAINT cwa_pkey PRIMARY KEY (id);


--
-- Name: cwp_columnas_metadata cwp_columnas_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwp_columnas_metadata
    ADD CONSTRAINT cwp_columnas_metadata_pkey PRIMARY KEY (id);


--
-- Name: cwp cwp_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwp
    ADD CONSTRAINT cwp_pkey PRIMARY KEY (id);


--
-- Name: disciplinas disciplinas_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.disciplinas
    ADD CONSTRAINT disciplinas_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: paquetes paquetes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.paquetes
    ADD CONSTRAINT paquetes_pkey PRIMARY KEY (id);


--
-- Name: plot_plans plot_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.plot_plans
    ADD CONSTRAINT plot_plans_pkey PRIMARY KEY (id);


--
-- Name: proyectos proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id);


--
-- Name: tipos_entregables tipos_entregables_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tipos_entregables
    ADD CONSTRAINT tipos_entregables_pkey PRIMARY KEY (id);


--
-- Name: ix_cwa_codigo; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_cwa_codigo ON public.cwa USING btree (codigo);


--
-- Name: ix_cwa_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_cwa_id ON public.cwa USING btree (id);


--
-- Name: ix_cwp_codigo; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_cwp_codigo ON public.cwp USING btree (codigo);


--
-- Name: ix_cwp_columnas_metadata_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_cwp_columnas_metadata_id ON public.cwp_columnas_metadata USING btree (id);


--
-- Name: ix_cwp_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_cwp_id ON public.cwp USING btree (id);


--
-- Name: ix_disciplinas_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_disciplinas_id ON public.disciplinas USING btree (id);


--
-- Name: ix_items_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_items_id ON public.items USING btree (id);


--
-- Name: ix_paquetes_codigo; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_paquetes_codigo ON public.paquetes USING btree (codigo);


--
-- Name: ix_paquetes_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_paquetes_id ON public.paquetes USING btree (id);


--
-- Name: ix_plot_plans_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_plot_plans_id ON public.plot_plans USING btree (id);


--
-- Name: ix_proyectos_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_proyectos_id ON public.proyectos USING btree (id);


--
-- Name: ix_proyectos_nombre; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX ix_proyectos_nombre ON public.proyectos USING btree (nombre);


--
-- Name: ix_tipos_entregables_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_tipos_entregables_id ON public.tipos_entregables USING btree (id);


--
-- Name: cwa cwa_plot_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwa
    ADD CONSTRAINT cwa_plot_plan_id_fkey FOREIGN KEY (plot_plan_id) REFERENCES public.plot_plans(id);


--
-- Name: cwp_columnas_metadata cwp_columnas_metadata_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwp_columnas_metadata
    ADD CONSTRAINT cwp_columnas_metadata_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id);


--
-- Name: cwp cwp_cwa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwp
    ADD CONSTRAINT cwp_cwa_id_fkey FOREIGN KEY (cwa_id) REFERENCES public.cwa(id);


--
-- Name: cwp cwp_disciplina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cwp
    ADD CONSTRAINT cwp_disciplina_id_fkey FOREIGN KEY (disciplina_id) REFERENCES public.disciplinas(id);


--
-- Name: disciplinas disciplinas_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.disciplinas
    ADD CONSTRAINT disciplinas_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id);


--
-- Name: items items_paquete_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_paquete_id_fkey FOREIGN KEY (paquete_id) REFERENCES public.paquetes(id);


--
-- Name: items items_source_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_source_item_id_fkey FOREIGN KEY (source_item_id) REFERENCES public.items(id);


--
-- Name: items items_tipo_entregable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_tipo_entregable_id_fkey FOREIGN KEY (tipo_entregable_id) REFERENCES public.tipos_entregables(id);


--
-- Name: paquetes paquetes_cwp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.paquetes
    ADD CONSTRAINT paquetes_cwp_id_fkey FOREIGN KEY (cwp_id) REFERENCES public.cwp(id);


--
-- Name: plot_plans plot_plans_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.plot_plans
    ADD CONSTRAINT plot_plans_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id);


--
-- Name: tipos_entregables tipos_entregables_disciplina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tipos_entregables
    ADD CONSTRAINT tipos_entregables_disciplina_id_fkey FOREIGN KEY (disciplina_id) REFERENCES public.disciplinas(id);


--
-- PostgreSQL database dump complete
--

\unrestrict QGcnot8eSs9EpvsknNHOFgbnIb0Mp5BIYpko3digDnAf8YxzHvKw2fL7WeWJYZq

