import Image from 'next/image';
import Link from 'next/link';

export default function HomeScreen() {
  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* ROW 1: HERO & CURATOR SHOWCASE */}
      {/* ========================================================================= */}
      <section className="app-container pt-8 md:pt-14 pb-14 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Hero Narrative & Features */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Eyebrow */}
              <div className="text-eyebrow">
                AUTHENTIC HOMEMADE GOODNESS
              </div>

              {/* Main Headline */}
              <h1 className="text-page-title">
                The Taste of Home, Delivered
              </h1>

              {/* Tagline */}
              <p className="text-body-lead max-w-lg">
                Kunddan Home Foods brings familiar flavours to your table.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="btn-primary shadow-xs inline-flex items-center justify-center"
                >
                  Explore Items
                </Link>
                <Link
                  href="#contact"
                  className="btn-outline inline-flex items-center justify-center"
                >
                  Contact us
                </Link>
              </div>

              {/* Curator's Note Card - Mobile Only (Displayed directly after Action Buttons) */}
              <div className="block lg:hidden pt-4">
                <div className="card-curator-container min-h-[380px] sm:min-h-[440px]">
                  <Image
                    src="/home1.png"
                    alt="Traditional Indian spice powders and spoons"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    priority
                  />
                  <div className="card-curator-overlay" />
                  <div className="card-curator-content space-y-2.5 !p-6">
                    <p className="text-eyebrow-light text-xs">
                      CURATOR&apos;S NOTE
                    </p>
                    <h2 className="text-curator-title !text-xl sm:!text-2xl">
                      Food that feels familiar from the very first bite.
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#C8BFB5]">
                      We bring together flavours inspired by home kitchens, family recipes, and the kind
                      of meals people return to again and again.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Mini Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 lg:pt-0">
              <div className="card-feature">
                <h3 className="card-feature-title">Small-Batch Made</h3>
                <p className="card-feature-desc">
                  Prepared in limited batches for freshness and care
                </p>
              </div>

              <div className="card-feature">
                <h3 className="card-feature-title">Rooted in Tradition</h3>
                <p className="card-feature-desc">
                  Recipes inspired by familiar family flavours
                </p>
              </div>

              <div className="card-feature">
                <h3 className="card-feature-title">Made to Be Shared</h3>
                <p className="card-feature-desc">
                  Food that feels right at every table
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Curator's Note Card - Desktop Only */}
          <div className="hidden lg:block lg:col-span-6">
            <div className="card-curator-container h-full min-h-[460px] lg:min-h-[540px]">
              <Image
                src="/home1.png"
                alt="Traditional Indian spice powders and spoons"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                priority
              />
              <div className="card-curator-overlay" />
              <div className="card-curator-content space-y-3">
                <p className="text-eyebrow-light">
                  CURATOR&apos;S NOTE
                </p>
                <h2 className="text-curator-title">
                  Food that feels familiar from the very first bite.
                </h2>
                <p className="text-sm md:text-base leading-relaxed text-[#C8BFB5] max-w-xl">
                  We bring together flavours inspired by home kitchens, family recipes, and the kind
                  of meals people return to again and again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ROW 2: FROM OUR HOME KITCHEN SHOWCASE */}
      {/* ========================================================================= */}
      <section id="story" className="app-container py-12 md:py-20 border-t border-[#E8E0D2]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Home Foods Spread Visual */}
          <div className="lg:col-span-6">
            <div className="card-showcase-image aspect-[4/3] relative w-full overflow-hidden bg-[#1E1A17]">
              <Image
                src="/home2.png"
                alt="Homemade South Indian foods, podulu, vadiyalu, and fresh dishes in traditional bowls"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Right Column: Tradition & Story Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-eyebrow">
              FROM OUR HOME KITCHEN
            </div>

            <h2 className="text-section-title">
              Made with the patience, care, and flavour of home.
            </h2>

            <p className="text-body-regular">
              Kunddan Home Foods brings together the comfort of familiar recipes and the convenience
              of modern ordering, so your favourite podulu and vadiyalu reach your table with the
              warmth they deserve.
            </p>

            <blockquote className="pt-2 border-l-2 border-[#963A1F] pl-4">
              <p className="text-quote-highlight">
                &ldquo;We make food the old-fashioned way, with honest ingredients, slow batches,
                and the kind of care you can taste in every spoonful.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
}
