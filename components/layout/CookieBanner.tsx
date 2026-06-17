'use client';

import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('cookie-consent', 'essential');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md text-gray-900 p-4 z-50 border-t border-green-200 shadow-[0_-4px_30px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm mb-1 font-semibold text-gray-900">🍪 This site uses cookies</p>
          <p className="text-xs text-gray-600">
            We use <strong className="text-gray-800">essential cookies</strong> for authentication and booking functionality.
            Optional cookies help us analyze site usage. Read our{" "}
            <a href="/privacy" className="text-green-600 hover:underline font-semibold">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/cookies" className="text-green-600 hover:underline font-semibold">
              Cookie Policy
            </a>.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleEssentialOnly}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 whitespace-nowrap"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-5 py-2 text-sm font-bold rounded-lg whitespace-nowrap text-white bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-600/20"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
