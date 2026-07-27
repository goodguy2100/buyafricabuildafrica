
CREATE TABLE public.news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  body text NOT NULL,
  topic text,
  source_url text,
  source_name text,
  hero_image_url text,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.news_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_articles TO authenticated;
GRANT ALL ON public.news_articles TO service_role;

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published news"
  ON public.news_articles FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can read all news"
  ON public.news_articles FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert news"
  ON public.news_articles FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update news"
  ON public.news_articles FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete news"
  ON public.news_articles FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_news_articles_published ON public.news_articles (published, published_at DESC);

INSERT INTO public.news_articles (slug, title, summary, body, topic, source_name) VALUES
(
  'rural-to-urban-migration-2026',
  'Africa''s Rural-to-Urban Migration Is Rewriting the Job Market',
  'Millions of young Africans are leaving rural areas for cities in search of better work — but many arrive without the technical skills the modern economy demands.',
  E'Across the continent, the pace of rural-to-urban migration has accelerated sharply in the past decade. The UN projects that by 2050, nearly 60% of Africans will live in cities.\n\nFor the built environment, this shift is a double-edged sword. Cities need masons, electricians, plumbers, welders and tilers at unprecedented scale — yet arrivals from rural areas often lack formal certification or on-site experience. The result: construction sites hire informally, wages stay depressed, and quality suffers.\n\nBABA''s position is that Africa cannot build itself out of this shortage without deliberately investing in artisan training, apprenticeships and pathways to certification. Recognising skilled tradespeople — and giving them the tools, PPE and dignity of a formal trade — is a public good, not a private favour.\n\nThe upcoming BABA Excellence Awards will spotlight artisans, young professionals and businesses closing this gap, and the Corporate Strategy Summit in January will bring policy-makers into the same room as the industry actually hiring these workers.',
  'Jobs & Migration',
  'BABA Editorial'
),
(
  'skilled-artisans-shortage-nairobi',
  'Nairobi''s Skilled Artisan Shortage Slows Housing Delivery',
  'Developers in Nairobi report project delays of up to 40% because certified artisans — particularly gypsum installers, tilers and electricians — are booked months in advance.',
  E'Kenya''s Affordable Housing Programme has ambitious targets, but delivery on the ground is bottlenecked by a shortage of skilled tradespeople.\n\nProject managers we spoke with say the biggest gaps are in electrical wiring to code, gypsum ceiling installation, and finish carpentry. Untrained subcontractors take on the work, and rework costs eat into already thin margins.\n\nBABA''s directory and role-based membership containers exist specifically to solve this: a mason, tiler or electrician can be found, vetted and hired in one place, and the platform tracks their trade and experience level. As the network grows, developers will be able to filter for certified tradespeople in their county.\n\nThe long-term fix is training. Partnerships with TVETs, on-site apprenticeships, and BABA''s Youth categories at the Excellence Awards are all pointed in the same direction.',
  'Artisans',
  'BABA Editorial'
),
(
  'sustainable-construction-africa',
  'Sustainable Construction Isn''t a Luxury — It''s a Cost Strategy',
  'Green building practices are still framed as premium in most of Africa. That framing is starting to break down as energy and water costs rise.',
  E'Solar-ready roofs, rainwater harvesting, passive cooling, and locally-sourced materials used to be sold as environmental virtue. Increasingly, they''re being sold as cost control.\n\nDevelopers who choose stabilised earth blocks over imported cement blends are locking in cheaper input costs. Buildings designed for cross-ventilation cut long-run air-conditioning bills. Rainwater harvesting reduces reliance on trucked water in drought-prone counties.\n\nBABA''s Sustainability pillar exists to move these practices from niche to normal. The Green Building Project of the Year and Climate Innovation Award at the Excellence Awards will highlight teams already delivering these outcomes at scale.\n\nAs more African cities adopt green building codes, the professionals and artisans who can execute against them will command the highest fees. The competitive advantage is real — and available now.',
  'Sustainability',
  'BABA Editorial'
);
