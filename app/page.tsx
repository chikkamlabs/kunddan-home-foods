import Header from './header';
import HomeScreen from './homescreen/page';
import FeaturedProducts from './featuredproducts';
import CategoriesSection from './categoriesSection';
import Footer from './footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#231E1A]">
      <Header />
      <main className="flex-1">
        <HomeScreen />
        <FeaturedProducts />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
}
