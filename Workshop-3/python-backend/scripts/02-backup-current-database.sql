-- ============================================================
-- EVENT PLATFORM - CURRENT DATABASE BACKUP
-- ============================================================
-- This script contains the complete database structure and data
-- as of the current state.
--
-- Execute:
--   psql -U postgres -d eventplatform -f 02-backup-current-database.sql
-- ============================================================

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: notificationtype; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notificationtype AS ENUM (
    'email',
    'sms',
    'push'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded'
);


--
-- Name: ticketstatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ticketstatus AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CANCELLED'
);


--
-- Name: userstatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.userstatus AS ENUM (
    'active',
    'inactive',
    'suspended'
);


--
-- Name: usertype; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.usertype AS ENUM (
    'admin',
    'organizer',
    'buyer'
);


--
-- Name: update_payments_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_payments_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;

END;

$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    admin_id integer,
    action character varying(100) NOT NULL,
    entity character varying(50),
    details text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(200),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    date timestamp without time zone NOT NULL,
    description text,
    end_date timestamp without time zone,
    category character varying(50),
    category_id integer,
    capacity integer,
    event_status character varying(20) DEFAULT 'draft'::character varying,
    age_restriction character varying(20),
    max_tickets_per_purchase integer DEFAULT 10,
    media character varying(500),
    organizer_id integer,
    location_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: location_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.location_zones (
    id integer NOT NULL,
    location_id integer NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    description character varying(400),
    benefits character varying(400),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: location_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.location_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: location_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.location_zones_id_seq OWNED BY public.location_zones.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    address character varying(200) NOT NULL,
    capacity integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type character varying(50) NOT NULL,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    title character varying(200) NOT NULL,
    related_entity_type character varying(50),
    related_entity_id integer,
    data jsonb,
    read_at timestamp without time zone
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number character varying(50) NOT NULL,
    purchase_date timestamp without time zone NOT NULL,
    expiration_date timestamp without time zone,
    status character varying(20) DEFAULT 'pending'::character varying,
    total_amount numeric(10,2),
    buyer_id integer,
    event_id integer,
    ticket_type_id integer,
    quantity integer,
    refund_reason character varying(500),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50),
    transaction_id character varying(100),
    payment_date timestamp without time zone,
    payment_status character varying(20),
    retry_count integer DEFAULT 0,
    payment_gateway character varying(50),
    order_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    payment_provider character varying(100),
    completed_at timestamp without time zone,
    authorization_code character varying(50),
    payer_name character varying(200),
    payer_email character varying(255),
    payer_document character varying(50),
    payment_details jsonb,
    error_code character varying(50),
    error_message text,
    currency character varying(3) DEFAULT 'COP'::character varying NOT NULL
);


--
-- Name: TABLE payments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.payments IS 'Tabla de pagos procesados para Ã³rdenes de tickets';


--
-- Name: COLUMN payments.payment_method; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.payment_method IS 'MÃ©todo de pago usado: credit_card, debit_card, pse, paypal, nequi, daviplata, google_pay, cash_payment';


--
-- Name: COLUMN payments.transaction_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.transaction_id IS 'ID Ãºnico de transacciÃ³n generado por el sistema';


--
-- Name: COLUMN payments.payment_provider; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.payment_provider IS 'Proveedor especÃ­fico: visa, mastercard, amex, nombre del banco, etc.';


--
-- Name: COLUMN payments.authorization_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.authorization_code IS 'CÃ³digo de autorizaciÃ³n del procesador de pagos';


--
-- Name: COLUMN payments.payment_details; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.payment_details IS 'Detalles adicionales del pago en formato JSON';


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    event_id integer,
    user_id integer,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: ticket_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    description character varying(500),
    benefits character varying(500),
    event_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: ticket_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ticket_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ticket_types_id_seq OWNED BY public.ticket_types.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    ticket_type_id integer,
    qr_code character varying(200),
    seat_number character varying(50),
    status public.ticketstatus DEFAULT 'PENDING'::public.ticketstatus NOT NULL,
    order_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone_number character varying(20),
    user_type public.usertype NOT NULL,
    status public.userstatus DEFAULT 'active'::public.userstatus,
    last_login timestamp without time zone,
    organization_name character varying(150),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: location_zones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_zones ALTER COLUMN id SET DEFAULT nextval('public.location_zones_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: ticket_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_types ALTER COLUMN id SET DEFAULT nextval('public.ticket_types_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, admin_id, action, entity, details, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description, created_at, updated_at) FROM stdin;
1	Music	Live music concerts, festivals, and musical performances	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
2	Theater	Theatrical plays, musicals, and stage productions	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
3	Sports	Professional and amateur sporting events	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
4	Conferences	Business, technology, and academic conferences	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
5	Comedy	Stand-up comedy shows and comedy festivals	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
6	Dance	Dance performances and dance festivals	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
7	Art	Art exhibitions, galleries, and cultural events	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
8	Food & Drink	Food festivals, wine tastings, and culinary events	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
9	Technology	Tech meetups, hackathons, and innovation events	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
10	Education	Workshops, seminars, and educational events	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
11	Music-1739b8	Experimental music sessions	2025-11-30 00:53:43.021432	2025-11-30 00:53:43.021443
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, name, date, description, end_date, category, category_id, capacity, event_status, age_restriction, max_tickets_per_purchase, media, organizer_id, location_id, created_at, updated_at) FROM stdin;
1	Bogota Music Festival 2024	2025-12-15 18:00:00	Annual music festival featuring top national and international artists. Multiple stages with diverse genres including rock, pop, electronic, and Latin music.	2025-12-15 23:00:00	Music	1	14000	published	18+	6	\N	\N	2	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
2	Jazz Night at Teatro Colon	2025-12-16 20:00:00	Intimate jazz concert featuring renowned local and international jazz musicians in the historic Teatro Colon.	2025-12-16 22:30:00	Music	1	900	published	All ages	4	\N	\N	3	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
5	Hamlet - Shakespeare Classic	2025-12-19 19:00:00	Renowned production of Shakespeare's masterpiece performed by the National Theater Company. Modern interpretation with traditional elements.	2025-12-19 21:30:00	Theater	2	900	published	12+	4	\N	\N	3	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
6	Contemporary Theater Night - Urban Voices	2025-12-20 20:00:00	Modern theater production exploring urban life in Bogota. Original script with innovative staging and multimedia elements.	2025-12-20 22:00:00	Theater	2	1500	published	14+	6	\N	\N	12	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
9	Colombia vs Argentina - Friendly Match	2025-12-23 20:00:00	International friendly soccer match between Colombia and Argentina national teams. Don't miss this exciting encounter!	2025-12-23 22:00:00	Sports	3	36000	published	All ages	10	\N	\N	1	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
12	Cycling Race - Bogota Circuit	2025-12-26 08:00:00	Professional cycling race through Bogota's main streets. Multiple viewing points and grandstand access available.	2025-12-26 16:00:00	Sports	3	8000	published	All ages	4	\N	\N	10	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
13	Tech Innovation Summit 2024	2025-12-27 09:00:00	Leading technology conference featuring keynote speakers, workshops, and networking opportunities. Topics include AI, blockchain, cloud computing, and startup ecosystem.	2025-12-27 18:00:00	Conferences	4	5000	published	18+	5	\N	\N	6	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
16	Academic Research Symposium	2025-12-30 08:00:00	International academic conference presenting cutting-edge research across multiple disciplines. Paper presentations and panel discussions.	2025-12-30 18:00:00	Conferences	4	800	published	18+	4	\N	\N	7	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
17	Stand-Up Comedy Night	2025-12-31 20:30:00	Evening of laughter with top Colombian comedians. Fresh material and audience interaction guaranteed.	2025-12-31 22:30:00	Comedy	5	1500	published	18+	6	\N	\N	12	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
18	Comedy Festival - Bogota Laughs	2026-01-01 19:00:00	Multi-act comedy festival featuring local and international comedians. Multiple shows throughout the evening.	2026-01-01 23:00:00	Comedy	5	2000	published	18+	8	\N	\N	4	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
19	Contemporary Dance Performance	2026-01-02 20:00:00	Stunning contemporary dance performance by the National Dance Company. Innovative choreography and powerful storytelling.	2026-01-02 21:30:00	Dance	6	2000	published	All ages	6	\N	\N	4	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
20	Folk Dance Festival	2026-01-03 19:00:00	Celebration of Colombian folk dance traditions. Colorful costumes, traditional music, and authentic performances.	2026-01-03 21:00:00	Dance	6	1500	published	All ages	6	\N	\N	12	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
21	Modern Art Exhibition Opening	2026-01-04 18:00:00	Exclusive opening of a major modern art exhibition featuring works by renowned Colombian and international artists.	2026-01-04 21:00:00	Art	7	600	published	All ages	4	\N	\N	8	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
22	Street Art Tour & Workshop	2026-01-05 14:00:00	Guided tour of Bogota's best street art followed by a hands-on workshop with local artists.	2026-01-05 17:00:00	Art	7	30	published	12+	2	\N	\N	\N	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
23	Bogota Food Festival	2026-01-06 12:00:00	Culinary festival featuring the best restaurants in Bogota. Food tastings, cooking demonstrations, and live music.	2026-01-06 20:00:00	Food & Drink	8	5000	published	All ages	6	\N	\N	9	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
24	Wine Tasting Experience	2026-01-07 19:00:00	Exclusive wine tasting event with sommelier-led sessions. Sample wines from Colombia and around the world.	2026-01-07 22:00:00	Food & Drink	8	100	published	21+	2	\N	\N	14	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
25	AI & Machine Learning Workshop	2026-01-08 09:00:00	Hands-on workshop on artificial intelligence and machine learning. Practical exercises and real-world applications.	2026-01-08 17:00:00	Technology	9	200	published	18+	3	\N	\N	13	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
26	Startup Pitch Night	2026-01-09 18:00:00	Evening of startup pitches and networking. Watch innovative startups present their ideas to investors and mentors.	2026-01-09 21:00:00	Technology	9	500	published	18+	4	\N	\N	14	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
27	Professional Development Seminar	2026-01-10 09:00:00	Full-day seminar on professional skills development. Topics include leadership, communication, and career growth.	2026-01-10 16:00:00	Education	10	300	published	18+	4	\N	\N	13	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
28	Language Learning Workshop	2026-01-11 10:00:00	Interactive workshop on effective language learning techniques. Suitable for all levels and languages.	2026-01-11 14:00:00	Education	10	150	published	16+	3	\N	\N	7	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
31	Test Event	2025-12-15 00:58:00	Test event used by automated checks	2025-12-15 04:58:00	Music-1739b8	11	150	published	\N	10	\N	1	15	2025-11-30 00:53:43.095268	2025-11-30 00:53:43.095278
3	Electronic Music Showcase	2025-12-17 22:00:00	Night-long electronic music event with top DJs from Colombia and around the world. Multiple stages and immersive light shows.	2025-12-18 04:00:00	Music	1	14000	published	18+	4	\N	\N	2	2025-11-29 09:03:50.751159	2025-12-07 23:35:54.893655
10	Bogota Marathon 2024	2025-12-24 06:00:00	Annual marathon through the streets of Bogota. Multiple race categories: full marathon, half marathon, and 10K. Spectator tickets available.	2025-12-24 12:00:00	Sports	3	50000	published	All ages	8	\N	\N	9	2025-11-29 09:03:50.751159	2025-12-08 03:05:11.794916
8	Comedy Play: City Life	2025-12-22 20:00:00	Light-hearted comedy about modern life in Bogota. Perfect for a fun night out with friends and family.	2025-12-22 21:45:00	Theater	2	900	published	All ages	6	\N	\N	3	2025-11-29 09:03:50.751159	2025-12-08 03:10:20.823083
4	Classical Symphony Concert	2025-12-18 19:30:00	Orchestral performance featuring works by Beethoven, Mozart, and contemporary Colombian composers.	2025-12-18 21:30:00	Music	1	2000	published	All ages	6	\N	\N	4	2025-11-29 09:03:50.751159	2025-12-08 03:13:58.289678
7	Musical: The Phantom of the Opera	2025-12-21 19:30:00	Full-scale musical production of the classic Andrew Lloyd Webber musical. International cast with stunning sets and costumes.	2025-12-21 22:30:00	Theater	2	2000	published	All ages	8	\N	\N	4	2025-11-29 09:03:50.751159	2025-12-08 03:17:32.445737
11	Basketball Championship Final	2025-12-25 19:00:00	Championship final of the national basketball league. High-intensity game with the best teams competing for the title.	2025-12-25 21:30:00	Sports	3	12000	published	All ages	6	\N	\N	11	2025-11-29 09:03:50.751159	2025-12-08 03:20:49.042792
14	Business Leadership Forum	2025-12-28 08:30:00	Annual business conference with industry leaders discussing strategy, innovation, and market trends. Networking lunch included.	2025-12-28 17:00:00	Conferences	4	1000	published	18+	4	\N	\N	13	2025-11-29 09:03:50.751159	2025-12-08 03:23:31.712445
15	Digital Marketing Conference	2025-12-29 09:00:00	Comprehensive conference on digital marketing strategies, social media, SEO, and content marketing. Practical workshops included.	2025-12-29 17:30:00	Conferences	4	3000	published	18+	6	\N	\N	14	2025-11-29 09:03:50.751159	2025-12-08 03:24:27.9805
32	Bogotá Rock Fest 2025	2026-06-19 11:00:00	A large-scale rock music festival featuring national and international bands performing live in a high-energy environment.	2026-06-19 22:00:00	Music	1	13500	published	14+	10	\N	3	2	2025-12-08 03:30:00.203096	2025-12-08 03:35:07.185225
33	Bogotá Salsa Night Festival	2025-12-27 10:00:00	A vibrant night festival celebrating salsa music with live orchestras and dance shows.	2025-12-28 03:00:00	Dance	6	4500	published	14+	10	\N	3	14	2025-12-08 04:01:24.181817	2025-12-08 04:02:37.137247
\.


--
-- Data for Name: location_zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.location_zones (id, location_id, name, price, quantity, description, benefits, created_at, updated_at) FROM stdin;
1	1	VIP Section	150000.00	500	Premium seating with best views	Access to VIP lounge, complimentary drinks, priority parking	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
2	1	Premium Seating	80000.00	2000	Comfortable seats with great visibility	Cushioned seats, better view angles	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
3	1	General Admission	35000.00	30000	Standard stadium seating	Access to all stadium facilities	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
4	1	Student Section	20000.00	5000	Affordable seating for students	Student ID required, same access as general	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
5	2	VIP Floor	200000.00	300	Exclusive floor access near stage	Early entry, meet & greet opportunity, VIP bar access	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
6	2	Premium Seating	120000.00	1500	Best seats in the house	Comfortable seats, great acoustics	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
7	2	Standard Seating	60000.00	10000	Regular arena seating	Good view and sound quality	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
8	2	Upper Level	35000.00	2200	Affordable upper level seats	Full event access	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
9	3	Orchestra Section	120000.00	400	Best seats in the orchestra	Premium viewing experience, close to stage	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
10	3	Balcony	80000.00	300	Elevated seating with great views	Good visibility, classic theater experience	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
11	3	Gallery	50000.00	200	Upper level seating	Affordable option with full show access	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
12	4	VIP Box	180000.00	100	Private box seating	Private box, complimentary refreshments, best acoustics	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
13	4	Orchestra	100000.00	800	Main floor seating	Excellent view and sound	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
14	4	Mezzanine	70000.00	600	Elevated middle section	Good balance of view and price	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
15	4	Balcony	45000.00	500	Upper level seating	Budget-friendly option	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.locations (id, name, address, capacity, created_at, updated_at) FROM stdin;
1	El Campin Stadium	Diagonal 61C #26-36, Bogota, Colombia	36000	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
2	Movistar Arena Bogota	Calle 63 #59A-45, Bogota, Colombia	14000	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
3	Teatro Colon	Calle 10 #5-32, Bogota, Colombia	900	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
4	Teatro Mayor Julio Mario Santo Domingo	Calle 170 #67-51, Bogota, Colombia	2000	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
5	Auditorio Leon de Greiff	Carrera 30 #45-03, Bogota, Colombia	2500	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
6	Centro de Convenciones Gonzalo Jimenez de Quesada	Calle 26 #57-41, Bogota, Colombia	5000	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
7	Biblioteca Luis Angel Arango	Calle 11 #4-14, Bogota, Colombia	800	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
8	Museo Nacional de Colombia	Carrera 7 #28-66, Bogota, Colombia	600	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
9	Parque Simon Bolivar	Calle 63 #68-95, Bogota, Colombia	50000	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
10	Centro de Alto Rendimiento	Calle 63 #47-36, Bogota, Colombia	8000	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
11	Coliseo El Salitre	Carrera 60 #63-27, Bogota, Colombia	12000	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
12	Teatro Jorge Eliecer Gaitan	Carrera 7 #22-47, Bogota, Colombia	1500	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
13	Auditorio Fundadores Universidad EAN	Calle 79 #11-45, Bogota, Colombia	1000	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
14	Centro de Eventos La Macarena	Carrera 4 #26A-50, Bogota, Colombia	3000	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
15	Center-83e2	100 Main Street	500	2025-11-30 00:53:43.053965	2025-11-30 00:53:43.053972
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, message, is_read, created_at, updated_at, title, related_entity_type, related_entity_id, data, read_at) FROM stdin;
10	5	payment_success	Payment Successful! Your payment of $436000.00 COP for order #30 has been processed successfully. Your tickets are confirmed!	f	2025-12-07 21:50:04.59735	2025-12-07 21:50:04.59735	Payment Successful	\N	\N	\N	\N
11	5	payment_success	Payment Successful! Your payment of $432000.00 COP for order #31 has been processed successfully. Your tickets are confirmed!	f	2025-12-07 21:53:55.732576	2025-12-07 21:53:55.732576	Payment Successful	\N	\N	\N	\N
12	5	payment_success	Payment Successful! Your payment of $530000.00 COP for order #32 has been processed successfully. Your tickets are confirmed!	f	2025-12-07 22:54:04.028536	2025-12-07 22:54:04.028536	Payment Successful	\N	\N	\N	\N
13	5	payment_success	Payment Successful! Your payment of $140000.00 COP for order #33 has been processed successfully. Your tickets are confirmed!	f	2025-12-07 22:56:40.49881	2025-12-07 22:56:40.49881	Payment Successful	\N	\N	\N	\N
14	6	payment_success	Payment Successful! Your payment of $120000.00 COP for order #34 has been processed successfully. Your tickets are confirmed!	f	2025-12-08 04:14:35.726812	2025-12-08 04:14:35.726812	Payment Successful	\N	\N	\N	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, purchase_date, expiration_date, status, total_amount, buyer_id, event_id, ticket_type_id, quantity, refund_reason, created_at, updated_at) FROM stdin;
1	ORD-20251129-E77832	2025-11-29 14:44:39.910123	2025-11-29 14:44:39.968954	REFUND_REQUESTED	0.00	11	29	35	1	a	2025-11-29 14:44:39.91126	2025-11-29 14:45:17.793401
2	ORD-20251129-4F57D5	2025-11-29 14:47:24.398937	2025-11-29 14:47:24.449044	confirmed	1000000.00	11	30	36	1	\N	2025-11-29 14:47:24.399327	2025-11-29 14:47:24.449331
3	ORD-20251129-1377E1	2025-11-29 15:11:12.74012	2025-11-29 15:11:12.797482	confirmed	1000000.00	11	30	36	1	\N	2025-11-29 15:11:12.74414	2025-11-29 15:11:12.798682
4	ORD-20251129-84A5BB	2025-11-29 15:24:10.013274	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 15:24:10.013689	2025-11-29 15:24:10.013692
5	ORD-20251129-F3BDC8	2025-11-29 15:25:23.397147	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 15:25:23.39745	2025-11-29 15:25:23.397453
6	ORD-20251129-E5BCF0	2025-11-29 15:25:54.167003	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 15:25:54.167354	2025-11-29 15:25:54.167358
7	ORD-20251129-60ED77	2025-11-29 15:32:17.705395	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 15:32:17.70577	2025-11-29 15:32:17.705773
8	ORD-20251129-9B2AB2	2025-11-29 15:35:15.657313	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 15:35:15.660472	2025-11-29 15:35:15.660478
9	ORD-20251129-0BA5D2	2025-11-29 15:40:46.719186	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 15:40:46.719627	2025-11-29 15:40:46.719631
10	ORD-20251129-DC098D	2025-11-29 15:42:10.795633	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 15:42:10.798336	2025-11-29 15:42:10.798341
11	ORD-20251129-832EC7	2025-11-29 15:48:12.072232	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 15:48:12.073881	2025-11-29 15:48:12.073886
12	ORD-20251129-376A9E	2025-11-29 15:52:14.648693	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 15:52:14.649128	2025-11-29 15:52:14.649132
13	ORD-20251129-C1F560	2025-11-29 15:56:15.424622	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 15:56:15.424996	2025-11-29 15:56:15.425
14	ORD-20251129-4C33CC	2025-11-29 15:57:50.801709	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 15:57:50.803776	2025-11-29 15:57:50.80378
15	ORD-20251129-0CBCFE	2025-11-29 16:02:42.627688	2025-11-29 16:02:53.440227	confirmed	1000000.00	11	30	36	1	\N	2025-11-29 16:02:42.631607	2025-11-29 16:02:53.455946
16	ORD-20251129-C1D310	2025-11-29 16:03:27.166796	2025-11-29 16:06:01.225149	confirmed	1000000.00	11	30	36	1	\N	2025-11-29 16:03:27.167375	2025-11-29 16:06:01.241202
17	ORD-20251129-AD92B1	2025-11-29 16:07:57.753438	2025-11-29 16:08:23.296979	confirmed	1000000.00	11	30	36	1	\N	2025-11-29 16:07:57.755429	2025-11-29 16:08:23.307093
18	ORD-20251129-583CFD	2025-11-29 16:08:35.30057	2025-11-29 16:08:42.431939	confirmed	1000000.00	11	30	36	1	\N	2025-11-29 16:08:35.301471	2025-11-29 16:08:42.444805
22	ORD-20251129-66DEC8	2025-11-29 16:09:25.21546	\N	CANCELLED	1000000.00	11	30	36	1	\N	2025-11-29 16:09:25.215806	2025-11-29 16:30:50.137535
21	ORD-20251129-7217B8	2025-11-29 16:09:10.432519	\N	CANCELLED	1000000.00	11	30	36	1	\N	2025-11-29 16:09:10.432918	2025-11-29 16:30:55.436566
23	ORD-20251129-5D955D	2025-11-29 16:31:48.008648	2025-11-29 16:31:57.53524	confirmed	1000000.00	11	30	36	1	\N	2025-11-29 16:31:48.010015	2025-11-29 16:31:57.539724
24	ORD-20251129-279129	2025-11-29 16:32:49.687891	\N	pending	1000000.00	11	30	36	1	\N	2025-11-29 16:32:49.688287	2025-11-29 16:32:49.68829
25	ORD-20251129-F83805	2025-11-29 16:35:39.893395	2025-11-29 16:35:44.747465	REFUNDED	1000000.00	11	30	36	1	solicitud	2025-11-29 16:35:39.895457	2025-11-29 18:22:42.698083
26	ORD-20251129-734E21	2025-11-29 16:51:50.836473	2025-11-29 16:51:55.078404	CONFIRMED	1000000.00	11	30	36	1	\N	2025-11-29 16:51:50.840867	2025-11-29 18:23:09.301268
27	ORD-20251129-67D838	2025-11-29 19:16:58.040796	2025-11-29 19:17:17.006507	confirmed	4000000.00	11	30	36	4	\N	2025-11-29 19:16:58.042575	2025-11-29 19:17:17.016962
19	ORD-20251129-25AD1C	2025-11-29 16:08:47.481721	2025-11-29 16:08:52.551554	REFUNDED	1000000.00	11	30	36	1	solicitud	2025-11-29 16:08:47.48228	2025-11-29 19:18:17.447306
20	ORD-20251129-CF236E	2025-11-29 16:08:56.610583	2025-11-29 16:09:05.944235	REFUNDED	1000000.00	11	30	36	1	solicitud	2025-11-29 16:08:56.610945	2025-11-29 19:18:21.231025
28	ORD-20251207-BA422D	2025-12-07 21:45:00.89404	2025-12-07 21:45:23.737261	confirmed	280000.00	5	2	5	2	\N	2025-12-07 21:45:00.895552	2025-12-07 21:45:23.743231
29	ORD-20251207-207B25	2025-12-07 21:48:50.408072	\N	pending	98000.00	5	6	18	2	\N	2025-12-07 21:48:50.412083	2025-12-07 21:48:50.412083
30	ORD-20251207-A598F6	2025-12-07 21:49:29.563643	2025-12-07 21:50:04.567091	confirmed	436000.00	5	6	15	2	\N	2025-12-07 21:49:29.564641	2025-12-07 21:50:04.583183
31	ORD-20251207-743376	2025-12-07 21:53:31.894245	2025-12-07 21:53:55.715573	confirmed	432000.00	5	9	8	2	\N	2025-12-07 21:53:31.894245	2025-12-07 21:53:55.720568
32	ORD-20251207-9A63D9	2025-12-07 22:53:39.413845	2025-12-07 22:54:04.011881	confirmed	530000.00	5	1	1	2	\N	2025-12-07 22:53:39.413845	2025-12-07 22:54:04.015879
33	ORD-20251207-3CD4C2	2025-12-07 22:56:26.7713	2025-12-07 22:56:40.483759	confirmed	140000.00	5	5	12	1	\N	2025-12-07 22:56:26.772306	2025-12-07 22:56:40.488822
34	ORD-20251208-464C4D	2025-12-08 04:14:07.650912	2025-12-08 04:14:35.638322	confirmed	120000.00	6	33	59	2	\N	2025-12-08 04:14:07.653888	2025-12-08 04:14:35.70598
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, amount, payment_method, transaction_id, payment_date, payment_status, retry_count, payment_gateway, order_id, created_at, updated_at, payment_provider, completed_at, authorization_code, payer_name, payer_email, payer_document, payment_details, error_code, error_message, currency) FROM stdin;
1	1000000.00	nequi	TXN-20251129110253-B7QW7B4C	2025-11-29 16:02:53.405086	completed	0	simulated	15	2025-11-29 16:02:53.406459	2025-11-29 16:02:53.406463	nequi	2025-11-29 16:02:53.405089	F76Z13	\N	\N	\N	{"email": null, "wallet_type": "nequi", "phone_number": "3245769318"}	\N	\N	COP
2	1000000.00	debit_card	TXN-20251129110345-A3XE4RU4	2025-11-29 16:03:45.310252	failed	0	simulated	16	2025-11-29 16:03:45.310906	2025-11-29 16:03:45.310912	visa	\N	\N	CARLOS ABELLA	\N	\N	{"card_brand": "visa", "card_holder": "CARLOS ABELLA", "installments": 1, "card_last_four": "1111"}	bank_error	Error en el banco	COP
3	1000000.00	credit_card	TXN-20251129110601-BI55UXQS	2025-11-29 16:06:01.214619	completed	0	simulated	16	2025-11-29 16:06:01.217007	2025-11-29 16:06:01.217012	visa	2025-11-29 16:06:01.214623	IV8CFP	CARLOS ABELLA	\N	\N	{"card_brand": "visa", "card_holder": "CARLOS ABELLA", "installments": 1, "card_last_four": "1111"}	\N	\N	COP
4	1000000.00	pse	TXN-20251129110823-BZJUOXDK	2025-11-29 16:08:23.25295	completed	0	simulated	17	2025-11-29 16:08:23.261336	2025-11-29 16:08:23.261342	Bancolombia	2025-11-29 16:08:23.252994	IJH74Z	carlos abella	200127cara@gmail.com	1000288619	{"bank_code": "1007", "bank_name": "Bancolombia", "person_type": "natural", "document_type": "CC", "document_number": "1000288619"}	\N	\N	COP
5	1000000.00	paypal	TXN-20251129110842-PV6M6BSR	2025-11-29 16:08:42.42187	completed	0	simulated	18	2025-11-29 16:08:42.423653	2025-11-29 16:08:42.42366	paypal	2025-11-29 16:08:42.421876	5JSI59	\N	200127cara@gmail.com	\N	{"email": "200127cara@gmail.com", "wallet_type": "paypal", "phone_number": null}	\N	\N	COP
6	1000000.00	daviplata	TXN-20251129110852-GVLZ919E	2025-11-29 16:08:52.542017	completed	0	simulated	19	2025-11-29 16:08:52.543067	2025-11-29 16:08:52.543072	daviplata	2025-11-29 16:08:52.542026	KQ8XU5	\N	\N	\N	{"email": null, "wallet_type": "daviplata", "phone_number": "2312314141"}	\N	\N	COP
7	1000000.00	google_pay	TXN-20251129110905-49H550PZ	2025-11-29 16:09:05.940156	completed	0	simulated	20	2025-11-29 16:09:05.940547	2025-11-29 16:09:05.940551	google_pay	2025-11-29 16:09:05.94016	2LZN6V	\N	200127cara@gmail.com	\N	{"email": "200127cara@gmail.com", "wallet_type": "google_pay", "phone_number": null}	\N	\N	COP
8	1000000.00	nequi	TXN-20251129113157-KC3V5EUQ	2025-11-29 16:31:57.520741	completed	0	simulated	23	2025-11-29 16:31:57.522776	2025-11-29 16:31:57.522782	nequi	2025-11-29 16:31:57.520745	WZNWNV	\N	\N	\N	{"email": null, "wallet_type": "nequi", "phone_number": "3123123213"}	\N	\N	COP
9	1000000.00	nequi	TXN-20251129113256-9PNOY54X	2025-11-29 16:32:56.24707	failed	0	simulated	24	2025-11-29 16:32:56.248	2025-11-29 16:32:56.24801	nequi	\N	\N	\N	\N	\N	{"email": null, "wallet_type": "nequi", "phone_number": "3124124214"}	card_blocked	Tarjeta bloqueada	COP
10	1000000.00	nequi	TXN-20251129113544-0S488Y7O	2025-11-29 16:35:44.735104	completed	0	simulated	25	2025-11-29 16:35:44.736493	2025-11-29 16:35:44.736675	nequi	2025-11-29 16:35:44.735108	MQA3O4	\N	\N	\N	{"email": null, "wallet_type": "nequi", "phone_number": "3121412412"}	\N	\N	COP
11	1000000.00	nequi	TXN-20251129115155-BT06B1QD	2025-11-29 16:51:55.064557	completed	0	simulated	26	2025-11-29 16:51:55.066155	2025-11-29 16:51:55.06616	nequi	2025-11-29 16:51:55.064561	A3WD8U	\N	\N	\N	{"email": null, "wallet_type": "nequi", "phone_number": "3124124124"}	\N	\N	COP
12	4000000.00	credit_card	TXN-20251129141716-W6WMP1CV	2025-11-29 19:17:16.995614	completed	0	simulated	27	2025-11-29 19:17:16.996878	2025-11-29 19:17:16.996881	visa	2025-11-29 19:17:16.995619	32GM7X	CARLOS ABELLA	\N	\N	{"card_brand": "visa", "card_holder": "CARLOS ABELLA", "installments": 3, "card_last_four": "1111"}	\N	\N	COP
13	280000.00	nequi	TXN-20251207164523-BZ2IBXUL	2025-12-07 21:45:23.719282	completed	0	simulated	28	2025-12-07 21:45:23.720272	2025-12-07 21:45:23.720272	nequi	2025-12-07 21:45:23.719282	JYNB2E	\N	\N	\N	{"email": null, "wallet_type": "nequi", "phone_number": "3017242439"}	\N	\N	COP
14	436000.00	pse	TXN-20251207165004-2KBT9FO4	2025-12-07 21:50:04.549086	completed	0	simulated	30	2025-12-07 21:50:04.552089	2025-12-07 21:50:04.552089	DaviPlata	2025-12-07 21:50:04.549086	21DS5E	Leidy morales	lmmoraless09@gmail.com	1013649392	{"bank_code": "1551", "bank_name": "DaviPlata", "person_type": "natural", "document_type": "CC", "document_number": "1013649392"}	\N	\N	COP
15	432000.00	pse	TXN-20251207165355-MKZKE1DC	2025-12-07 21:53:55.706045	completed	0	simulated	31	2025-12-07 21:53:55.707043	2025-12-07 21:53:55.707043	DaviPlata	2025-12-07 21:53:55.706045	7ZITZ9	leidy morales	lmmoraless09@gmail.com	101364	{"bank_code": "1551", "bank_name": "DaviPlata", "person_type": "natural", "document_type": "CC", "document_number": "101364"}	\N	\N	COP
16	530000.00	pse	TXN-20251207175403-4596P536	2025-12-07 22:54:03.999867	completed	0	simulated	32	2025-12-07 22:54:04.000868	2025-12-07 22:54:04.000868	DaviPlata	2025-12-07 22:54:03.999867	P24TNW	andres gomez	lmmoraless09@gmail.com	10136493	{"bank_code": "1551", "bank_name": "DaviPlata", "person_type": "natural", "document_type": "CC", "document_number": "10136493"}	\N	\N	COP
17	140000.00	nequi	TXN-20251207175640-YEYHTSVC	2025-12-07 22:56:40.476858	completed	0	simulated	33	2025-12-07 22:56:40.477848	2025-12-07 22:56:40.477848	nequi	2025-12-07 22:56:40.476858	2NYIEY	\N	\N	\N	{"email": null, "wallet_type": "nequi", "phone_number": "3017242438"}	\N	\N	COP
18	120000.00	pse	TXN-20251207231435-QN3LATE2	2025-12-08 04:14:35.620689	completed	0	simulated	34	2025-12-08 04:14:35.623792	2025-12-08 04:14:35.623792	DaviPlata	2025-12-08 04:14:35.620689	GZANMZ	laura rodriguez	lmmoraless09@gmail.com	131313	{"bank_code": "1551", "bank_name": "DaviPlata", "person_type": "natural", "document_type": "CC", "document_number": "131313"}	\N	\N	COP
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, event_id, user_id, rating, comment, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ticket_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_types (id, name, price, quantity, description, benefits, event_id, created_at, updated_at) FROM stdin;
35	General Admission	0.00	50	\N	\N	29	2025-11-29 14:36:40.761275	2025-11-29 14:36:40.76128
37	General Admission	75000.00	150	Test event used by automated checks		31	2025-11-30 00:53:43.111462	2025-11-30 00:53:43.11147
1	VIP Floor Access	265000.00	300	Exclusive floor access near the stage	Early entry, meet & greet opportunity, VIP bar access	1	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
2	Premium Seating	150000.00	1500	Best seats in the arena	Comfortable seats, great acoustics	1	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
3	Standard Seating	70000.00	10000	Regular arena seating	Good view and sound quality	1	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
4	Upper Level	41000.00	2200	Affordable upper level seats	Full event access	1	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
5	Orchestra Section	140000.00	400	Best seats in the orchestra	Premium viewing experience, close to stage	2	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
6	Balcony	93000.00	300	Elevated seating with great views	Good visibility, classic theater experience	2	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
7	Gallery	58000.00	200	Upper level seating	Affordable option with full show access	2	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
8	VIP Section	216000.00	500	Premium seating with best views	Access to VIP lounge, complimentary drinks, priority parking	9	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
9	Premium Seating	106000.00	2000	Comfortable seats with great visibility	Cushioned seats, better view angles	9	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
10	General Admission	43000.00	30000	Standard stadium seating	Access to all stadium facilities	9	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
11	Student Section	24000.00	5000	Affordable seating for students	Student ID required, same access as general	9	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
12	Orchestra Section	140000.00	400	Best seats in the orchestra	Premium viewing experience, close to stage	5	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
13	Balcony	88000.00	300	Elevated seating with great views	Good visibility, classic theater experience	5	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
14	Gallery	56000.00	200	Upper level seating	Affordable option with full show access	5	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
15	VIP Box	218000.00	100	Private box seating	Private box, complimentary refreshments, best acoustics	6	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
16	Orchestra	117000.00	800	Main floor seating	Excellent view and sound	6	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
17	Mezzanine	78000.00	600	Elevated middle section	Good balance of view and price	6	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
18	Balcony	49000.00	500	Upper level seating	Budget-friendly option	6	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
19	VIP Pass	314000.00	200	Full access with premium benefits	VIP lounge access, networking dinner, priority seating	13	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
20	Full Conference Pass	182000.00	3000	Access to all sessions and workshops	All sessions, lunch included, networking events	13	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
21	Day Pass	93000.00	1500	Single day access	Access to all sessions for one day, lunch included	13	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
22	Student Pass	44000.00	300	Discounted student access	Student ID required, full conference access	13	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
23	VIP Seating	121000.00	150	Best seats in the house	Premium seating, meet & greet after show	17	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
24	Standard Seating	70000.00	1000	Regular theater seating	Good view and sound	17	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
25	General Admission	39000.00	350	Affordable seating	Full show access	17	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
36	General Admission	1124000.00	50	\N	\N	30	2025-11-29 14:46:51.700608	2025-11-29 14:46:51.700614
26	VIP Box	218000.00	100	Private box seating	Private box, complimentary refreshments, best acoustics	19	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
27	Orchestra	117000.00	800	Main floor seating	Excellent view and sound	19	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
28	Mezzanine	78000.00	600	Elevated middle section	Good balance of view and price	19	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
29	Balcony	51000.00	500	Upper level seating	Budget-friendly option	19	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
30	VIP Access	150000.00	500	Premium festival access	VIP area, priority food tastings, complimentary drinks	23	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
31	General Admission	58000.00	4000	Full festival access	Access to all food vendors and activities	23	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
32	Early Bird	39000.00	500	Discounted early entry	Early entry, same access as general	23	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
33	Full Workshop Pass	242000.00	150	Complete workshop access	All sessions, materials included, certificate	25	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
34	Student Pass	112000.00	50	Discounted student access	Student ID required, full workshop access	25	2025-11-29 09:03:50.751159	2025-11-29 09:03:50.751159
38	General Admission	50000.00	14000	\N	\N	3	2025-12-07 23:35:54.897674	2025-12-07 23:35:54.897674
39	General Admission	260000.00	50000	\N	\N	10	2025-12-08 03:05:11.802408	2025-12-08 03:05:11.802408
40	General Admission	45000.00	600	Standard seating with clear visibility of the stage. Ideal for guests looking for an affordable and comfortable viewing experience.	Open seating within the general section	8	2025-12-08 03:10:20.829079	2025-12-08 03:10:20.829079
41	Premium Seating	75000.00	200	Enhanced seating located closer to the stage, providing a more immersive experience of the comedy show.	Reserved premium seats	8	2025-12-08 03:10:20.829079	2025-12-08 03:10:20.829079
42	VIP Experience	120000.00	100	Exclusive seating with the best stage view, designed for guests who want a special night out with added comfort.	Front-row or central VIP seating. Early priority entry	8	2025-12-08 03:10:20.829079	2025-12-08 03:10:20.829079
43	General Seating	60000.00	1500	Standard seating with balanced acoustics and clear visibility of the orchestra. Ideal for guests seeking an enjoyable classical music experience at an accessible price.	Access to the main concert hall. Open seating within the general section. Standard entry time	4	2025-12-08 03:13:58.291678	2025-12-08 03:13:58.291678
44	Premium Orchestra Seats	120000.00	500	Premium front and center seating offering superior acoustics and an immersive view of the performers. Perfect for classical music enthusiasts who want a richer and more intimate experience.	Reserved premium-category seats. Priority entry to the hall. Complimentary program booklet. Exclusive access to the lounge area during intermission	4	2025-12-08 03:13:58.291678	2025-12-08 03:13:58.291678
45	General Admission	85000.00	1500	Standard seating with good visibility of the stage and full access to the musical experience. Perfect for guests looking to enjoy the production at an affordable price.	Access to the main auditorium. Open seating within the general section	7	2025-12-08 03:17:32.447745	2025-12-08 03:17:32.447745
46	Premium Orchestra Seats	16000.00	400	Superior seats located closer to the stage, offering enhanced acoustics and a more immersive view of the cast, costumes, and set design.	Reserved premium seating. Priority entry line	7	2025-12-08 03:17:32.447745	2025-12-08 03:17:32.447745
47	VIP Experience	250000.00	100	Exclusive front-row and center-stage seating providing the most immersive and cinematic experience of the musical. Ideal for fans and guests seeking a luxury night at the theater.	Best seats in the venue. Early access to the theater	7	2025-12-08 03:17:32.447745	2025-12-08 03:17:32.447745
48	General Admission	55000.00	7000	Standard seating located around the upper and mid-level sections of the arena. A great choice for fans who want to enjoy the excitement of the championship game at an accessible price.	Access to all general seating areas	11	2025-12-08 03:20:49.044725	2025-12-08 03:20:49.044725
49	Premium Sideline Seats	120000.00	4000	Premium seats located along the sides of the court, offering a closer and clearer view of the action. Ideal for fans seeking a more immersive game experience.	Reserved premium seats. Priority entry line	11	2025-12-08 03:20:49.044725	2025-12-08 03:20:49.044725
50	Courtside VIP Experience	280000.00	1000	Exclusive courtside seats that bring you as close as possible to the players and the action. The ultimate experience for basketball fans who want a front-row and high-energy atmosphere.	Courtside seating with direct proximity to the game. Early VIP entry.Complimentary snack & drink. Access to VIP lounge. Limited-edition championship souvenir	11	2025-12-08 03:20:49.044725	2025-12-08 03:20:49.044725
51	General Admission	65000.00	1000	Annual business conference with industry leaders discussing strategy, innovation, and market trends. Networking lunch included.	\N	14	2025-12-08 03:23:31.714959	2025-12-08 03:23:31.714959
52	General Admission	20000.00	3000	Comprehensive conference on digital marketing strategies, social media, SEO, and content marketing. Practical workshops included.	\N	15	2025-12-08 03:24:27.982494	2025-12-08 03:24:27.982494
54	General Area	70000.00	10000	Basic access to standing zones near the stage.	festival screens, food court access.	32	2025-12-08 03:35:07.195963	2025-12-08 03:35:07.195963
55	Front Stage Premium	160000.00	3000	Reserved area close to the stage with improved visibility.	dedicated entrance, premium restrooms.	32	2025-12-08 03:35:07.195963	2025-12-08 03:35:07.195963
56	Backstage VIP	320000.00	500	Exclusive zone with access to artist interaction areas.	VIP lounge, two drinks, limited-edition lanyard.	32	2025-12-08 03:35:07.195963	2025-12-08 03:35:07.195963
59	Dance Floor Access	60000.00	3000	Open dance floor area.	access to bars.	33	2025-12-08 04:02:37.139243	2025-12-08 04:02:37.139243
60	Stage View Premium	135000.00	1500	Raised view zone.	fast-track entrance.	33	2025-12-08 04:02:37.139243	2025-12-08 04:02:37.139243
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tickets (id, ticket_type_id, qr_code, seat_number, status, order_id, created_at, updated_at) FROM stdin;
1	35	c74d59d94bdd4af6b048b290b468b108	\N	CANCELLED	1	2025-11-29 14:44:39.91748	2025-11-29 14:45:17.794368
2	36	3bf6486b78fe41a1961ef624902ab120	\N	CONFIRMED	2	2025-11-29 14:47:24.400597	2025-11-29 14:47:24.450174
3	36	c62b99c2589e4ba4b092920872b16ee3	\N	CONFIRMED	3	2025-11-29 15:11:12.749156	2025-11-29 15:11:12.800318
4	36	6c4e9e34059b4588947028b917d9c92f	\N	PENDING	4	2025-11-29 15:24:10.015234	2025-11-29 15:24:10.015238
5	36	b69473a7d4f2491cade425b25bab727b	\N	PENDING	5	2025-11-29 15:25:23.399152	2025-11-29 15:25:23.399157
6	36	8f1970803f9246ae87494aeedbb513d9	\N	PENDING	6	2025-11-29 15:25:54.168476	2025-11-29 15:25:54.168481
7	36	c9924cd9ad1847d48e4112e32460e4cb	\N	PENDING	7	2025-11-29 15:32:17.70684	2025-11-29 15:32:17.706844
8	36	eaebf535d8f44377be263083f4cb30b2	\N	PENDING	8	2025-11-29 15:35:15.663361	2025-11-29 15:35:15.663376
9	36	6f340f836d594605a63d6bd7e2c571c6	\N	PENDING	9	2025-11-29 15:40:46.721823	2025-11-29 15:40:46.721827
10	36	7430e9216e4c4ff6a1c1d13b9932bd39	\N	PENDING	10	2025-11-29 15:42:10.801221	2025-11-29 15:42:10.801225
11	36	cf29654a00704199803d330dc2231320	\N	PENDING	11	2025-11-29 15:48:12.07686	2025-11-29 15:48:12.076867
12	36	698ebbc6ff8f4a07849fe3f5ddf31219	\N	PENDING	12	2025-11-29 15:52:14.650855	2025-11-29 15:52:14.65086
13	36	9472af1eba25408fbe174135953a4150	\N	PENDING	13	2025-11-29 15:56:15.426208	2025-11-29 15:56:15.426214
14	36	9712ed2e93734c01b69365733cc72f2f	\N	PENDING	14	2025-11-29 15:57:50.806633	2025-11-29 15:57:50.806638
15	36	e9c47250f84743ada8e8f0cdb600d79a	\N	CONFIRMED	15	2025-11-29 16:02:42.634776	2025-11-29 16:02:53.457728
16	36	9bc651f1eb24436482029a0915f74931	\N	CONFIRMED	16	2025-11-29 16:03:27.169539	2025-11-29 16:06:01.242948
17	36	6a7715f7b48841fd89a96f2553a65913	\N	CONFIRMED	17	2025-11-29 16:07:57.75824	2025-11-29 16:08:23.309699
18	36	6e614732a11347dc811bf57a7bdfe2cf	\N	CONFIRMED	18	2025-11-29 16:08:35.304446	2025-11-29 16:08:42.44587
22	36	1d892beedc4944278ab6f7e3c51c4ca9	\N	CANCELLED	22	2025-11-29 16:09:25.216698	2025-11-29 16:30:50.140387
21	36	9fafafa10feb4f4d96194a0b21c4577d	\N	CANCELLED	21	2025-11-29 16:09:10.434237	2025-11-29 16:30:55.43734
20	36	f6b02945101e420e9792c354298be153	\N	CANCELLED	20	2025-11-29 16:08:56.613036	2025-11-29 16:31:07.837345
19	36	650ce849cc074ce280ed5267a7f619f3	\N	CANCELLED	19	2025-11-29 16:08:47.484136	2025-11-29 16:31:28.918409
23	36	808a71c6045646c9bbd86aec8ce4a94a	\N	CONFIRMED	23	2025-11-29 16:31:48.013819	2025-11-29 16:31:57.541026
24	36	6d5d204bf80246ebbbcaeeffd07c2555	\N	PENDING	24	2025-11-29 16:32:49.68966	2025-11-29 16:32:49.689665
25	36	47bbd81e90474705a0a547e3355dbc8a	\N	CANCELLED	25	2025-11-29 16:35:39.89834	2025-11-29 16:55:44.419169
26	36	4ccbf9e43f674f179204ebfc947fc64b	\N	CONFIRMED	26	2025-11-29 16:51:50.845945	2025-11-29 18:23:09.304398
27	36	2124d31d399a41dc8d7c06b24dd838b1	\N	CONFIRMED	27	2025-11-29 19:16:58.049369	2025-11-29 19:17:17.019598
28	36	d076fda2d1f6449bb5824955cee3155d	\N	CONFIRMED	27	2025-11-29 19:16:58.049386	2025-11-29 19:17:17.019603
29	36	e0be49b58fa74717ba987fa214625320	\N	CONFIRMED	27	2025-11-29 19:16:58.049388	2025-11-29 19:17:17.019605
30	36	7ec73a791e8841f092d12b01c5d6c2dc	\N	CONFIRMED	27	2025-11-29 19:16:58.049391	2025-11-29 19:17:17.019607
31	5	4bb225a62b4b4417a7bfefe7df8fce51	\N	CONFIRMED	28	2025-12-07 21:45:00.901563	2025-12-07 21:45:23.745155
32	5	1d71e872ae2e47d5a3474a83b32ec218	\N	CONFIRMED	28	2025-12-07 21:45:00.901563	2025-12-07 21:45:23.745155
33	18	727fa64fef9b423da33e49636314ab0e	\N	PENDING	29	2025-12-07 21:48:50.417986	2025-12-07 21:48:50.417986
34	18	a3a7acc7851e4a3298203e65afa516f1	\N	PENDING	29	2025-12-07 21:48:50.417986	2025-12-07 21:48:50.417986
35	15	e8849ecab1464ff2b18e7cb1f1202b69	\N	CONFIRMED	30	2025-12-07 21:49:29.56671	2025-12-07 21:50:04.587192
36	15	71320fa2d22f478bbd0a97b834397ba2	\N	CONFIRMED	30	2025-12-07 21:49:29.56671	2025-12-07 21:50:04.587192
37	8	af4ecfa960ec407bb5e4b05faf4cdbbb	\N	CONFIRMED	31	2025-12-07 21:53:31.897345	2025-12-07 21:53:55.72157
38	8	cca9e07bebb2466c91521abf8b026c22	\N	CONFIRMED	31	2025-12-07 21:53:31.897345	2025-12-07 21:53:55.72157
39	1	66b6a1476a6f42e4b4e47b89471c1e92	\N	CONFIRMED	32	2025-12-07 22:53:39.41684	2025-12-07 22:54:04.016879
40	1	2d64a3888f2a4bd7a30fa29ee54b98fb	\N	CONFIRMED	32	2025-12-07 22:53:39.41684	2025-12-07 22:54:04.016879
41	12	50a396292ba94730a72b7f6da46f696a	\N	CONFIRMED	33	2025-12-07 22:56:26.775405	2025-12-07 22:56:40.490852
42	59	918aa2ffcceb459785a0ede1799f2568	\N	CONFIRMED	34	2025-12-08 04:14:07.661863	2025-12-08 04:14:35.708983
43	59	23031176a4264288b6b11eceff590ee3	\N	CONFIRMED	34	2025-12-08 04:14:07.661863	2025-12-08 04:14:35.708983
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, phone_number, user_type, status, last_login, organization_name, created_at, updated_at) FROM stdin;
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 11, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 33, true);


--
-- Name: location_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.location_zones_id_seq', 15, true);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.locations_id_seq', 15, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 14, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 34, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_id_seq', 18, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: ticket_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_types_id_seq', 60, true);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tickets_id_seq', 43, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: location_zones location_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_zones
    ADD CONSTRAINT location_zones_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: ticket_types ticket_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_types
    ADD CONSTRAINT ticket_types_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_qr_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_qr_code_key UNIQUE (qr_code);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_audit_logs_admin_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_admin_id ON public.audit_logs USING btree (admin_id);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: idx_events_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_category_id ON public.events USING btree (category_id);


--
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_date ON public.events USING btree (date);


--
-- Name: idx_events_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_location_id ON public.events USING btree (location_id);


--
-- Name: idx_events_organizer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_organizer_id ON public.events USING btree (organizer_id);


--
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_status ON public.events USING btree (event_status);


--
-- Name: idx_location_zones_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_zones_location_id ON public.location_zones USING btree (location_id);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_related_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_related_entity ON public.notifications USING btree (related_entity_type, related_entity_id);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_orders_buyer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_buyer_id ON public.orders USING btree (buyer_id);


--
-- Name: idx_orders_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_event_id ON public.orders USING btree (event_id);


--
-- Name: idx_orders_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_payments_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_date ON public.payments USING btree (payment_date);


--
-- Name: idx_payments_method; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_method ON public.payments USING btree (payment_method);


--
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- Name: idx_payments_payer_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_payer_email ON public.payments USING btree (payer_email);


--
-- Name: idx_payments_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_provider ON public.payments USING btree (payment_provider);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (payment_status);


--
-- Name: idx_payments_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_transaction_id ON public.payments USING btree (transaction_id);


--
-- Name: idx_reviews_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_event_id ON public.reviews USING btree (event_id);


--
-- Name: idx_reviews_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);


--
-- Name: idx_ticket_types_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_types_event_id ON public.ticket_types USING btree (event_id);


--
-- Name: idx_tickets_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_order_id ON public.tickets USING btree (order_id);


--
-- Name: idx_tickets_qr_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_qr_code ON public.tickets USING btree (qr_code);


--
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);


--
-- Name: idx_tickets_ticket_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_ticket_type_id ON public.tickets USING btree (ticket_type_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: idx_users_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_user_type ON public.users USING btree (user_type);


--
-- Name: payments trg_update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_payments_updated_at();


--
-- Name: audit_logs audit_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: events events_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: location_zones location_zones_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_zones
    ADD CONSTRAINT location_zones_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: reviews reviews_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--


