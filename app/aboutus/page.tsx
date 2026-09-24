import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/header';
import Footer from '@/app/footer';
import { Clock, Calendar, HeartHandshake } from 'lucide-react';

export const metadata = {
  title: 'About Us | Kunddan Home Foods',
  description: 'The story of Kunddan Home Foods started with two women (Vadina & Mardhalu) dedicated to cooking fresh homemade food with love and care.',
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#231E1A]">
      <Header />

      <main className="flex-1 w-full">
        {/* ========================================================================= */}
        {/* ROW 1: OUR ORIGIN STORY & FOUNDATION (Same sizing & grid as homescreen) */}
        {/* ========================================================================= */}
        <section className="app-container pt-8 md:pt-14 pb-14 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Column: Story Narrative & Core Information */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                {/* Eyebrow */}
                <div className="text-eyebrow">
                  OUR STORY &amp; HERITAGE
                </div>

                {/* Main Headline */}
                <h1 className="text-page-title">
                  Born from Family, Cooked with Pure Freshness
                </h1>

                {/* Tagline / Lead */}
                <p className="text-body-lead max-w-lg">
                  The story of Kunddan Home Foods started with 2 Women (Vadina and Mardhalu relationship) who used to help in making foods in family gatherings and functions.
                </p>

                {/* Story Paragraphs */}
                <p className="text-body-regular">
                  They truly enjoy cooking food with uncompromising freshness. Over the years, they tried so many foods from outside, but nothing ever gave the true satisfaction and wholesome purity of freshly prepared homemade food. That passion and realization inspired them to start Kunddan Home Foods.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/products"
                    className="btn-primary shadow-xs inline-flex items-center justify-center"
                  >
                    Explore Our Foods
                  </Link>
                  <Link
                    href="/contactus"
                    className="btn-outline inline-flex items-center justify-center"
                  >
                    Contact us
                  </Link>
                </div>

                {/* Story Image Card - Mobile Only */}
                <div className="block lg:hidden pt-4">
                  <div className="card-curator-container min-h-[380px] sm:min-h-[440px]">
                    <Image
                      src="/ourstory1.png"
                      alt="Vadina and Mardhalu preparing homemade fresh South Indian foods"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      priority
                    />
                    <div className="card-curator-overlay" />
                    <div className="card-curator-content space-y-2.5 !p-6">
                      <p className="text-eyebrow-light text-xs">
                        VADINA &amp; MARDHALU
                      </p>
                      <h2 className="text-curator-title !text-xl sm:!text-2xl">
                        A bond built over traditional recipes and honest taste.
                      </h2>
                      <p className="text-xs sm:text-sm leading-relaxed text-[#C8BFB5]">
                        Bringing you genuine home-cooked recipes, made fresh every single day just like in our own family kitchen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Mini Cards - Working Hours, Schedule & Promise */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 lg:pt-0">
                <div className="card-feature flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[#963A1F] mb-1.5">
                      <Clock className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">HOURS</span>
                    </div>
                    <h3 className="card-feature-title">10:00 AM – 7:30 PM</h3>
                  </div>
                  <p className="card-feature-desc mt-2">
                    Available throughout the day for orders and deliveries
                  </p>
                </div>

                <div className="card-feature flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[#963A1F] mb-1.5">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">SCHEDULE</span>
                    </div>
                    <h3 className="card-feature-title">365 Days Working</h3>
                  </div>
                  <p className="card-feature-desc mt-2">
                    No weekly holidays — always ready to serve fresh meals
                  </p>
                </div>

                <div className="card-feature flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[#963A1F] mb-1.5">
                      <HeartHandshake className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">PROMISE</span>
                    </div>
                    <h3 className="card-feature-title">Love &amp; Care</h3>
                  </div>
                  <p className="card-feature-desc mt-2">
                    Every batch prepared fresh with heartfelt devotion
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Story Visual Showcase Card - Desktop Only */}
            <div className="hidden lg:block lg:col-span-6">
              <div className="card-curator-container h-full min-h-[460px] lg:min-h-[540px]">
                <Image
                  src="/ourstory1.png"
                  alt="Vadina and Mardhalu preparing homemade fresh South Indian foods"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  priority
                />
                <div className="card-curator-overlay" />
                <div className="card-curator-content space-y-3">
                  <p className="text-eyebrow-light">
                    VADINA &amp; MARDHALU KITCHEN
                  </p>
                  <h2 className="text-curator-title">
                    A bond built over traditional recipes and honest taste.
                  </h2>
                  <p className="text-sm md:text-base leading-relaxed text-[#C8BFB5] max-w-xl">
                    What began as joyful cooking for family functions is now a dedication to bring pure, unadulterated homemade goodness to your dining table.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ROW 2: FRESH PREPARATION SHOWCASE (Same sizing & grid as homescreen) */}
        {/* ========================================================================= */}
        <section className="app-container py-12 md:py-20 border-t border-[#E8E0D2]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Showcase Image */}
            <div className="lg:col-span-6">
              <div className="card-showcase-image aspect-[4/3] relative w-full overflow-hidden bg-[#1E1A17]">
                <Image
                  src="/ourstory2.png"
                  alt="Fresh homemade South Indian foods and spice powders"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Right Column: Mission, Freshness Promise & Trust */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-eyebrow">
                OUR PROMISE TO YOU
              </div>

              <h2 className="text-section-title">
                We Prepare And Deliver Very Fresh Food With Love and Care.
              </h2>

              <p className="text-body-regular">
                At Kunddan Home Foods, we believe that food is not just nourishment—it is emotion, memory, and health. We never prepare large commercial inventories in advance. Instead, our spice powders, pickles, and homemade snacks are created in small, deliberate batches with hand-picked spices and authentic preparation techniques.
              </p>

              <blockquote className="pt-2 border-l-2 border-[#963A1F] pl-4">
                <p className="text-quote-highlight">
                  &ldquo;When you eat food made with pure ingredients and genuine passion, you taste the difference in every bite. That is our promise to you and your family.&rdquo;
                </p>
              </blockquote>

              <div className="pt-4 border-t border-[#F0E9DD] flex flex-wrap items-center gap-6 text-sm text-[#6B5E54]">
                <div>
                  <span className="font-semibold text-[#231E1A]">Working Hours:</span> 10:00 AM – 7:30 PM
                </div>
                <div>
                  <span className="font-semibold text-[#231E1A]">Availability:</span> 365 Days Working
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
