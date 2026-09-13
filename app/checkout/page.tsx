import Header from '@/app/header';
import Footer from '@/app/footer';
import CheckoutComponent from '@/app/checkout';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#231E1A]">
      <Header />
      <main className="flex-1">
        <CheckoutComponent />
      </main>
      <Footer />
    </div>
  );
}
