import { useState, type FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SCREEN_ROUTES } from "../routes";

const ROLE_ICONS: Record<string, string> = {
  "Entry": "login",
  "End User": "person",
  "ICT Officer": "support_agent",
  "Admin": "admin_panel_settings",
  "Shared": "hub",
};

const ROLE_COLORS: Record<string, string> = {
  "Entry": "#adc7f7",
  "End User": "#89d3d4",
  "ICT Officer": "#ffb68f",
  "Admin": "#c3c6d1",
  "Shared": "#d6e3ff",
};

function getInitialUser(): { email: string; role: string } | null {
  const storedUser = localStorage.getItem('clinicalUser') || sessionStorage.getItem('clinicalUser');
  if (!storedUser) return null;
  try {
    const userData = JSON.parse(storedUser);
    if (Date.now() - userData.timestamp < 24 * 60 * 60 * 1000) {
      return userData;
    }
    localStorage.removeItem('clinicalUser');
    sessionStorage.removeItem('clinicalUser');
  } catch {
    // Ignore parse errors
  }
  return null;
}

const NavOverlay: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(getInitialUser);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('clinicalUser');
    sessionStorage.removeItem('clinicalUser');
    setUser(null);
    navigate('/signin');
  };

  const roles = [...new Set(SCREEN_ROUTES.map((r) => r.role))];
  
  // Filter routes based on user authentication
  const availableRoutes = user 
    ? SCREEN_ROUTES.filter(route => route.role !== "Entry")
    : SCREEN_ROUTES.filter(route => route.role === "Entry");

  // Hide navigation on signin/signup pages
  const isEntryPage = location.pathname === "/signin" || location.pathname === "/signup";
  if (isEntryPage) {
    return null;
  }

  return (
    <>
      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: isOpen ? "260px" : "52px",
          zIndex: 9999,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "rgba(0, 20, 50, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(173, 199, 247, 0.15)",
          boxShadow: "4px 0 24px rgba(0,0,20,0.4)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Collapse menu" : "Expand menu"}
          style={{
            width: "52px",
            height: "52px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#adc7f7",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(173,199,247,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
            {isOpen ? "menu_open" : "menu"}
          </span>
        </button>

        {/* Logo / Header */}
        <div
          style={{
            padding: "0 16px 16px 16px",
            opacity: isOpen ? 1 : 0,
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
            overflow: "hidden",
            borderBottom: "1px solid rgba(173,199,247,0.1)",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span className="material-symbols-outlined" style={{ color: "#adc7f7", fontSize: "20px" }}>
              shield_health
            </span>
            <span
              style={{
                fontFamily: "Manrope, sans-serif",
                fontWeight: 800,
                fontSize: "13px",
                color: "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Clinical Intelligence
            </span>
          </div>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "9px",
              color: "rgba(173,199,247,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              margin: 0,
            }}
          >
            ICT Support Portal
          </p>
        </div>

        {/* User Info (when logged in) */}
        {user && isOpen && (
          <div
            style={{
              padding: "8px 16px",
              marginBottom: "8px",
              borderBottom: "1px solid rgba(173,199,247,0.1)",
              opacity: isOpen ? 1 : 0,
              transition: "opacity 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="material-symbols-outlined" style={{ color: ROLE_COLORS[user.role] || "#adc7f7", fontSize: "16px" }}>
                {ROLE_ICONS[user.role] || "person"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    color: "#ffffff",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email}
                </p>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "8px",
                    color: "rgba(173,199,247,0.6)",
                    margin: 0,
                    textTransform: "uppercase",
                  }}
                >
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 8px",
                background: "rgba(186, 26, 26, 0.1)",
                border: "1px solid rgba(186, 26, 26, 0.2)",
                borderRadius: "4px",
                color: "#ff6b6b",
                fontFamily: "Inter, sans-serif",
                fontSize: "9px",
                cursor: "pointer",
                transition: "all 0.2s",
                marginTop: "4px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(186, 26, 26, 0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(186, 26, 26, 0.1)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
                logout
              </span>
              Logout
            </button>
          </div>
        )}

        {/* Scrollable Nav List */}
        <div
          className="no-scrollbar"
          style={{
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "4px 8px",
          }}
        >
          {roles.map((role) => {
            const roleRoutes = availableRoutes.filter((r) => r.role === role);
            if (roleRoutes.length === 0) return null;
            
            return (
              <div key={role} style={{ marginBottom: "16px" }}>
                {/* Role Group Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    marginBottom: "4px",
                    opacity: isOpen ? 1 : 0,
                    transition: "opacity 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "12px", color: ROLE_COLORS[role] || "#adc7f7" }}>
                    {ROLE_ICONS[role] || "circle"}
                  </span>
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "rgba(173,199,247,0.45)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {role}
                  </span>
                </div>

                {/* Role Items */}
                {roleRoutes.map((route) => {
                  const isActive = location.pathname === route.path;
                  return (
                    <Link
                      key={route.path}
                      to={route.path}
                      title={!isOpen ? route.title : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: isOpen ? "8px 12px" : "8px 0",
                        justifyContent: isOpen ? "flex-start" : "center",
                        borderRadius: "8px",
                        textDecoration: "none",
                        marginBottom: "2px",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(0,30,65,0.9), rgba(23,51,90,0.8))"
                          : "transparent",
                        border: isActive ? "1px solid rgba(173,199,247,0.25)" : "1px solid transparent",
                        transition: "all 0.15s ease",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = "rgba(173,199,247,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {/* Active indicator dot */}
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: isActive ? "#adc7f7" : "rgba(173,199,247,0.25)",
                          transition: "all 0.15s",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                          opacity: isOpen ? 1 : 0,
                          transition: "opacity 0.15s",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {route.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom Version Tag */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(173,199,247,0.08)",
            opacity: isOpen ? 0.4 : 0,
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "9px",
              color: "#adc7f7",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            v1.0.0 · Prototype
          </p>
        </div>
      </div>
    </>
  );
};

export default NavOverlay;
