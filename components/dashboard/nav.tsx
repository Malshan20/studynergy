"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Zap, Menu, X, LogOut, User as UserIcon, Home, Gamepad2, Trophy, Medal, Settings } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { UpgradeButton } from "./upgrade-button"

interface DashboardNavProps {
  user: User
}

export function DashboardNav({ user }: DashboardNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center"
            >
              <Zap className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="text-xl font-bold hidden sm:block">Studynergy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/study-materials"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Study Materials
            </Link>
            <Link
              href="/game"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Gamepad2 className="w-4 h-4" />
              Game Mode
            </Link>
            <Link
              href="/game/achievements"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4" />
              Achievements
            </Link>
            <Link
              href="/game/leaderboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Medal className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <UpgradeButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 px-3">
                  <UserIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm truncate max-w-[150px]">
                    {user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden bg-background/95 backdrop-blur-lg border-b border-border/50"
          >
            <nav className="flex flex-col p-4 gap-2">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-medium rounded-lg hover:bg-secondary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/study-materials"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-medium rounded-lg hover:bg-secondary transition-colors"
              >
                Study Materials
              </Link>
              
              <div className="border-t border-border/50 my-2 pt-2">
                <p className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Game Mode</p>
              </div>
              
              <Link
                href="/game"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-medium rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4 text-primary" />
                Game Modes
              </Link>
              <Link
                href="/game/achievements"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-medium rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                Achievements
              </Link>
              <Link
                href="/game/leaderboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-medium rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <Medal className="w-4 h-4 text-slate-400" />
                Leaderboard
              </Link>

              <div className="border-t border-border/50 my-2 pt-2">
                <p className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">Account</p>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-medium rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                Settings
              </Link>
              <div className="border-t border-border/50 my-2 pt-2">
                <div className="px-4 py-2 text-sm text-muted-foreground truncate">
                  {user.email}
                </div>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 text-base font-medium rounded-lg hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
