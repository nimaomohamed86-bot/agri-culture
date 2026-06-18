import { Link } from 'react-router-dom';
import { Leaf, Mail, ArrowRight, Share2, Globe, MessageCircle, Rss } from 'lucide-react';

const footerLinks = {
  Company: [
    { label: 'About Us', href: '#about' },
    { label: 'Our Team', href: '#about' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  Services: [
    { label: 'Supply Chain', href: '#services' },
    { label: 'Inventory', href: '#services' },
    { label: 'Delivery', href: '#services' },
    { label: 'Analytics', href: '#services' },
  ],
  'Quick Links': [
    { label: 'Products', href: '#products' },
    { label: 'Register', href: '/register' },
    { label: 'Sign In', href: '/login' },
    { label: 'Contact', href: '#contact' },
  ],
};

const socialLinks = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: Share2, href: '#', label: 'Share' },
  { icon: MessageCircle, href: '#', label: 'Messages' },
  { icon: Rss, href: '#', label: 'Feed' },
];

export default function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-sm transition hover:text-primary-400"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm transition hover:text-primary-400">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-3xl bg-primary-800 p-6 lg:col-span-2 dark:bg-primary-900/40">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Contact Us</h4>
                <p className="text-xs text-primary-200">We&apos;re here to help</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-primary-100">
              Subscribe for updates on fresh products and supply chain insights.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex overflow-hidden rounded-full bg-white/10 ring-1 ring-primary-600/50"
            >
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-primary-300 outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center bg-primary-500 px-4 transition hover:bg-primary-400"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-5 w-5 text-white" />
              </button>
            </form>
            <a
              href="mailto:support@agrisupply.com"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary-200 hover:text-white"
            >
              <Mail className="h-4 w-4" />
              support@agrisupply.com
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Agri Supply. All rights reserved.
          </p>
          <div className="flex gap-3">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition hover:bg-primary-600 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
