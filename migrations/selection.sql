--
-- TOC entry 223 (class 1259 OID 76017408)
-- Name: selection; Type: TABLE; Schema: public; Owner: doadmin
--

CREATE TABLE IF NOT EXISTS public.selection (
    _id integer NOT NULL,
    geotype character varying(20),
    geoids character varying(20)[],
    hash character varying(40),
    CONSTRAINT selection__type_check CHECK (((geotype)::text = ANY (ARRAY[('blocks'::character varying)::text, ('tracts'::character varying)::text, ('ntas'::character varying)::text, ('cdtas'::character varying)::text, ('districts'::character varying)::text, ('boroughs'::character varying)::text, ('cities'::character varying)::text]))),
    CONSTRAINT selection_geoids_check CHECK (((array_length(geoids, 1) >= 1) AND (array_length(geoids, 1) <= 12)))
);


ALTER TABLE public.selection OWNER TO doadmin;

--
-- TOC entry 222 (class 1259 OID 76017406)
-- Name: selection__id_seq; Type: SEQUENCE; Schema: public; Owner: doadmin
--

CREATE SEQUENCE public.selection__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.selection__id_seq OWNER TO doadmin;

--
-- TOC entry 4871 (class 0 OID 0)
-- Dependencies: 222
-- Name: selection__id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: doadmin
--

ALTER SEQUENCE public.selection__id_seq OWNED BY public.selection._id;

--
-- TOC entry 4718 (class 2604 OID 76017411)
-- Name: selection _id; Type: DEFAULT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.selection ALTER COLUMN _id SET DEFAULT nextval('public.selection__id_seq'::regclass);

--
-- TOC entry 4727 (class 2606 OID 76017418)
-- Name: selection selection_pkey; Type: CONSTRAINT; Schema: public; Owner: doadmin
--

ALTER TABLE ONLY public.selection
    ADD CONSTRAINT selection_pkey PRIMARY KEY (_id);