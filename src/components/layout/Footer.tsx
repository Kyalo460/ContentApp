import Link from 'next/link'
import { Video, Heart, Users, MessageCircle, Camera, Film, Code, Mail } from 'lucide-react'

const COPYRIGHT_YEAR = new Date().getFullYear()

export function Footer() {

  const footerLinks = {
    product: [
      { href: '/gallery', label: 'Gallery' },
      { href: '/live', label: 'Live Streams' },
      { href: '/upload', label: 'Upload' },
      { href: '/pricing', label: 'Pricing' },
    ],
    company: [
      { href: '/about', label: 'About' },
      { href: '/blog', label: 'Blog' },
      { href: '/careers', label: 'Careers' },
      { href: '/contact', label: 'Contact' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/cookies', label: 'Cookie Policy' },
      { href: '/guidelines', label: 'Community Guidelines' },
    ],
    resources: [
      { href: '/help', label: 'Help Center' },
      { href: '/api', label: 'API Docs' },
      { href: '/status', label: 'Status' },
      { href: '/changelog', label: 'Changelog' },
    ],
  }

  const socialLinks = [
    { href: 'https://twitter.com', icon: MessageCircle, label: 'Twitter' },
    { href: 'https://instagram.com', icon: Camera, label: 'Instagram' },
    { href: 'https://youtube.com', icon: Film, label: 'YouTube' },
    { href: 'https://github.com', icon: Code, label: 'GitHub' },
    { href: 'mailto:hello@contentapp.com', icon: Mail, label: 'Email' },
  ]

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6" aria-label="ContentApp Home">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Video className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                ContentApp
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              Share your art, videos, and live streams with your followers. Built for creators who want a beautiful, simple platform.
            </p>
            <div className="flex items-center gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            © {COPYRIGHT_YEAR} ContentApp. All rights reserved.
          </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
                Made with love for creators
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Join our community
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}