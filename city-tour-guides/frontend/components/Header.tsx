'use client'

import { MapPin, Users, Map } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">City Explorer</h1>
              <p className="text-sm text-gray-600">Guides & Hand-drawn Maps</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Tour Guides
            </Link>
            <Link
              href="/maps"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors flex items-center space-x-1"
            >
              <Map className="w-4 h-4" />
              <span>Hand-drawn Maps</span>
            </Link>
            <Link
              href="#"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Custom Maps
            </Link>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Sign Up
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
