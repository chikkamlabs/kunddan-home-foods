import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#FAF6F0] border-t border-[#E8E0D2] mt-auto">
      <div className="app-container pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-[#E8E0D2]">
          {/* Brand Info */}
          <div className="md:col-span-5 pr-0 md:pr-8">
            <Link href="/" className="inline-block">
              <h3 className="font-brand-display text-2xl font-bold text-[#963A1F]">
                Kunddan Home Foods
              </h3>
            </Link>
            <p className="text-body-regular mt-4 max-w-sm">
              Freshly prepared regional favorites for everyday meals, gifting, and pantry restocks.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Explore Column */}
            <div>
              <p className="footer-nav-title">EXPLORE</p>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="footer-nav-link">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/aboutus" className="footer-nav-link">
                    About us
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="footer-nav-link">
                    Shop all
                  </Link>
                </li>
                <li>
                  <Link href="#account" className="footer-nav-link">
                    My account
                  </Link>
                </li>
                <li>
                  <Link href="/trackyourorder" className="footer-nav-link">
                    Track order
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <p className="footer-nav-title">SUPPORT</p>
              <ul className="space-y-3">
                <li>
                  <Link href="#cart" className="footer-nav-link">
                    Cart
                  </Link>
                </li>
                <li>
                  <Link href="#checkout" className="footer-nav-link">
                    Checkout
                  </Link>
                </li>
                <li>
                  <Link href="/contactus" className="footer-nav-link">
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Details Column */}
            <div className="col-span-2 sm:col-span-1">
              <p className="footer-nav-title">DETAILS</p>
              <ul className="space-y-3">
                <li>
                  <Link href="#shipping" className="footer-nav-link">
                    Shipping policy
                  </Link>
                </li>
                <li>
                  <Link href="#privacy" className="footer-nav-link">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="#terms" className="footer-nav-link">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Contact & Legal Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B5E54]">
          <div>
            <a
              href="mailto:kunddanhomefoods1@gmail.com"
              className="hover:text-[#963A1F] transition-colors"
            >
              kunddanhomefoods1@gmail.com
            </a>
          </div>
          <div>
            <a
              href="https://wa.me/919030949797"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#963A1F] transition-colors font-medium"
            >
              WhatsApp: +91 90309 49797
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
