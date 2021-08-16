--
-- PostgreSQL database dump
--

-- Dumped from database version 12.7 (Ubuntu 12.7-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 12.7 (Ubuntu 12.7-0ubuntu0.20.04.1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.books (
    id integer NOT NULL,
    title text,
    author text,
    sinopse text,
    price integer,
    image text,
    stock integer
);


--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;


--
-- Name: books id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.books VALUES (1, 'A Favela Reinventa A Cidade
', 'Flávia Oliveira', 'A favela venceu. A frase curta contém a relevância, a beleza, a complexidade deste livro. Algumas obras tornam-se importantes por apresentarem velhos temas sob novas perspectivas; outras nascem definitivas. A favela reinventa a cidade integra o segundo grupo. É leitura essencial para quem deseja (ou precisa) entender a gênese da solução habitacional forjada — e, teimosamente, aperfeiçoada ao longo de mais de século — por uma população submetida ora à desatenção, ora ao desprezo do Estado. É obrigatória por trazer ideias frescas para tirar o Rio de Janeiro do fosso em que se meteu, em consequência de políticas de segurança fracassadas e da histórica, nas palavras dos autores, distinção territorial de direitos, que privilegia moradores de uma área em detrimento de outras.', 6000, 'https://s3.amazonaws.com/img.iluria.com/product/895927/158976C/450xN.jpg', 200);


--
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.books_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

