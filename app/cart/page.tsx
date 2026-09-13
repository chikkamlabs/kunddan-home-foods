import Header from '@/app/header';
import Footer from '@/app/footer';
import CartComponent from '@/app/cart';

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#231E1A]">
      <Header />
      <main className="flex-1">
        <CartComponent />
      </main>
      <Footer />
    </div>
  );
}
