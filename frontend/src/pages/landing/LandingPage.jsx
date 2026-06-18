import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sprout,
  Truck,
  BarChart3,
  Warehouse,
  Shield,
  Users,
  Leaf,
  Star,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingFooter from '../../components/landing/LandingFooter';
import LandingImage from '../../components/landing/LandingImage';

const HERO_IMG = '/images/hero.jpg';           // Green plants / crops growing
const SERVICES_IMG = '/images/services.jpg';   // Farmer harvesting crops
const ABOUT_IMG_1 = '/images/farm.jpg';        // Aerial farmland
const ABOUT_IMG_2 = '/images/vegetables.jpg';  // Fresh vegetables
const ABOUT_IMG_3 = '/images/berries.jpg';     // Fresh strawberries
const TESTIMONIAL_IMG = '/images/testimonial.jpg'; // Farmer with fresh harvest

const services = [
  {
    icon: Sprout,
    title: 'Fresh Produce',
    description: 'Farm-to-market agricultural products sourced from trusted local farmers.',
    image: '/images/vegetables.jpg',
    tag: 'Organic',
  },
  {
    icon: Warehouse,
    title: 'Smart Inventory',
    description: 'Real-time stock tracking with low-stock alerts and movement history.',
    image: '/images/farm.jpg',
    tag: 'ERP',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'End-to-end delivery management with driver assignment and live tracking.',
    image: '/images/delivery.jpg',
    tag: 'Logistics',
  },
];

const categories = [
  { name: 'Fruits', image: '/images/fruits.jpg', count: '120+ items' },
  { name: 'Vegetables', image: '/images/vegetables.jpg', count: '200+ items' },
  { name: 'Grains', image: '/images/grains.jpg', count: '85+ items' },
  { name: 'Seeds', image: '/images/seeds.jpg', count: '60+ items' },
  { name: 'Fertilizers', image: '/images/fertilizers.jpg', count: '45+ items' },
  { name: 'Livestock Feed', image: '/images/livestock.jpg', count: '30+ items' },
];

const features = [
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Sales reports, revenue charts, and supplier performance metrics.',
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'JWT authentication with role-based access for every user type.',
  },
  {
    icon: Users,
    title: 'Multi-Role Access',
    description: 'Dedicated dashboards for admins, suppliers, farmers, and customers.',
  },
];

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Organic Farm Owner',
    text: 'Agri Supply transformed how we manage our harvest sales. The inventory tracking and order system saved us countless hours every week.',
    rating: 5,
  },
  {
    name: 'James Okonkwo',
    role: 'Supply Chain Manager',
    text: 'The delivery management and real-time notifications keep our entire team aligned. Best agricultural ERP platform we have used.',
    rating: 5,
  },
];

function WaveDivider({ flip = false, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full ${flip ? 'rotate-180' : ''}`}
        preserveAspectRatio="none"
      >
        <path
          d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
          className="fill-primary-50 dark:fill-gray-900"
        />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you! We will get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    toast.success('Subscribed successfully!');
    setNewsletterEmail('');
  };

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-gray-900">
      <LandingNavbar />

      {/* Hero */}
      <section id="home" className="relative overflow-hidden bg-primary-900 dark:bg-gray-950">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-800/60 px-4 py-1.5 text-sm font-medium text-primary-200 ring-1 ring-primary-700">
              <Leaf className="h-4 w-4 text-primary-400" />
              Smart Agriculture Platform
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Grow Agriculture for Your{' '}
              <span className="text-primary-400">Platform</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-primary-100/90">
              Streamline your agricultural supply chain with inventory management, order
              tracking, and analytics — all in one modern ERP platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-primary-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-400 hover:shadow-primary-400/40"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-full border-2 border-primary-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:border-primary-400 hover:bg-primary-800/50"
              >
                Browse Products
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="landing-image-blob overflow-hidden shadow-2xl shadow-primary-900/50">
              <LandingImage
                src={HERO_IMG}
                alt="Young green plants growing in an agricultural field"
                className="h-full min-h-[400px] w-full object-cover lg:min-h-[560px]"
                priority
              />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-800 lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
                  <Sprout className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">500+</p>
                  <p className="text-xs text-gray-500">Products Listed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <WaveDivider />
      </section>

      {/* Services */}
      <section id="services" className="bg-primary-50 py-20 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="landing-image-soft overflow-hidden shadow-xl">
              <LandingImage
                src={SERVICES_IMG}
                alt="Farmer harvesting fresh crops in the field"
                className="h-[480px] w-full object-cover"
              />
            </div>

            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">
                Our Services
              </span>
              <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Complete Supply Chain Solutions
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                From farm to customer, manage every step of your agricultural business with
                powerful tools built for modern agriculture.
              </p>

              <div className="mt-10 grid gap-5 sm:grid-cols-3">
                {services.map((service) => (
                  <div
                    key={service.title}
                    className="group landing-card overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-32 overflow-hidden">
                      <LandingImage
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-primary-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                        {service.tag}
                      </span>
                    </div>
                    <div className="p-4">
                      <service.icon className="mb-2 h-5 w-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {service.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        {service.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories / Products */}
      <section id="products" className="bg-white py-20 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Product Categories
            </span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Explore Our Agricultural Catalog
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              Browse six major categories of fresh produce, grains, seeds, and supplies —
              all managed through our integrated platform.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="group landing-card overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden">
                  <LandingImage
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                    <p className="text-sm text-primary-200">{cat.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-500"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About / Info */}
      <section id="about" className="bg-primary-50 py-20 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Why Agri Supply
            </span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Built for Modern Agriculture
            </h2>
          </div>

          <div className="mt-14 grid items-center gap-8 lg:grid-cols-12">
            <div className="grid gap-4 lg:col-span-3">
              <div className="landing-image-pill h-48 overflow-hidden shadow-lg">
                <LandingImage src={ABOUT_IMG_1} alt="Aerial view of green farmland" className="h-full w-full object-cover" />
              </div>
              <div className="landing-image-pill h-48 overflow-hidden shadow-lg">
                <LandingImage src={ABOUT_IMG_2} alt="Fresh harvested vegetables" className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-5">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-gray-800"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="landing-image-tall overflow-hidden shadow-xl">
                <LandingImage
                  src={ABOUT_IMG_3}
                  alt="Fresh strawberries harvest"
                  className="h-[520px] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials + Newsletter */}
      <section id="testimonials" className="bg-white py-20 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">
                Testimonials
              </span>
              <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Trusted by Farmers & Suppliers
              </h2>

              <div className="mt-10 space-y-8">
                {testimonials.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-3xl border border-gray-100 bg-primary-50/50 p-6 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="mb-3 flex gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary-500 text-primary-500" />
                      ))}
                    </div>
                    <p className="text-gray-600 italic dark:text-gray-300">&ldquo;{t.text}&rdquo;</p>
                    <footer className="mt-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-sm text-primary-600">{t.role}</p>
                    </footer>
                  </blockquote>
                ))}
              </div>

              <div id="contact" className="mt-12">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Get in Touch
                </h3>
                <form onSubmit={handleContactSubmit} className="mt-4 space-y-3">
                  <input
                    required
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="input-field rounded-full"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Your email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="input-field rounded-full"
                  />
                  <textarea
                    placeholder="Your message"
                    rows={3}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="input-field rounded-2xl"
                  />
                  <button type="submit" className="btn-primary w-full rounded-full py-3">
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            <div className="relative">
              <div className="landing-image-testimonial overflow-hidden shadow-2xl">
                <LandingImage
                  src={TESTIMONIAL_IMG}
                  alt="Farmer holding fresh produce in the field"
                  className="h-[600px] w-full object-cover"
                />
              </div>

              <div className="mt-8 rounded-3xl bg-primary-900 p-8 dark:bg-primary-950">
                <h3 className="text-xl font-bold text-white">Join Our Newsletter</h3>
                <p className="mt-2 text-sm text-primary-200">
                  Stay updated with the latest products, farming tips, and platform features.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="mt-6 flex gap-2">
                  <input
                    required
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="input-field flex-1 rounded-full border-primary-700 bg-primary-800/50 text-white placeholder-primary-400"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-primary-500 px-6 py-2.5 font-semibold text-white transition hover:bg-primary-400"
                  >
                    Subscribe
                  </button>
                </form>
                <ul className="mt-6 space-y-2">
                  {['Weekly product updates', 'Supply chain insights', 'Exclusive offers'].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-primary-100">
                        <CheckCircle2 className="h-4 w-4 text-primary-400" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary-800 py-16 dark:bg-primary-950">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="mt-4 text-primary-200">
            Join thousands of farmers, suppliers, and customers on the Agri Supply platform.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-primary-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-400"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="rounded-full border-2 border-primary-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
