"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', icon: '📊', label: 'Dashboard' },
    { href: '/admin/orders', icon: '📋', label: 'Orders' },
    { href: '/admin/cleaners', icon: '👥', label: 'Cleaners' },
    { href: '/admin/customers', icon: '👤', label: 'Customers' },
    { href: '/admin/services', icon: '✨', label: 'Services' },
    { href: '/admin/reviews', icon: '⭐', label: 'Reviews' },
    { href: '/admin/promo-codes', icon: '🏷️', label: 'Promo Codes' },
    { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6 overflow-x-auto">
            <Link href="/admin">
              <h2 className="text-xl font-bold whitespace-nowrap text-slate-900">Admin</h2>
            </Link>
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${pathname === item.href
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center">
            <Link
              href="/admin/settings"
              className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
