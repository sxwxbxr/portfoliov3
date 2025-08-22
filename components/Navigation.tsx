"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut, User } from "lucide-react"
import { navLinks } from "../src/config"
import { ThemeToggle } from "./ThemeToggle"
import { useAuth } from "./AuthProvider"
import { Button } from "./ui/button"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, isAuthenticated, isAdmin } = useAuth()

  const filteredNavLinks = navLinks.filter((link) => {
    if (link.href === "/hub" && !isAuthenticated) return false
    if (link.href === "/admin" && !isAdmin) return false
    if (link.href === "/login" && isAuthenticated) return false
    return true
  })

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
          >
            SW
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-all duration-200 hover:text-primary hover:scale-105 ${
                  pathname === link.href ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{user?.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button className="p-2 hover:bg-muted rounded-md transition-colors" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-4">
              {filteredNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-primary ${
                    pathname === link.href ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                    <User className="w-4 w-4" />
                    <span>{user?.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
