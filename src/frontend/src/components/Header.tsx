import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut, Sun, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userName?: string;
}

const navLinks = [
  { id: "dashboard", label: "Dashboard" },
  { id: "fleet", label: "Fleet" },
  { id: "photos", label: "Photos" },
  { id: "reports", label: "Reports" },
];

export default function Header({
  activeSection,
  onSectionChange,
  userName,
}: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Sun
                className="w-5 h-5 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-heading font-bold text-sm text-foreground leading-tight tracking-tight">
                MADHAV SOLAR ENERGY
              </div>
              <div className="text-xs text-muted-foreground">
                AMRELI, GUJARAT
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                data-ocid={`nav.${link.id}.link`}
                onClick={() => onSectionChange(link.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === link.id
                    ? "text-primary border-b-2 border-primary rounded-none"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* User / Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {userName || "Field Agent"}
                </span>
              </div>
            )}
            <Button
              data-ocid="header.auth.button"
              onClick={handleAuth}
              disabled={loginStatus === "logging-in"}
              variant={isAuthenticated ? "outline" : "default"}
              size="sm"
              className={
                isAuthenticated
                  ? ""
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }
            >
              {loginStatus === "logging-in" ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : isAuthenticated ? (
                <span className="flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              data-ocid={`nav.mobile.${link.id}.link`}
              onClick={() => onSectionChange(link.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeSection === link.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground bg-accent/50"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
