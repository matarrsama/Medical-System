import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SCREEN_ROUTES, type ScreenRoute } from "./routes";
import ScreenFrame from "./components/ScreenFrame";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { doc, getDoc, onSnapshot, collection } from "firebase/firestore";

interface AuthUser {
  uid: string;
  email: string | null;
  role: string;
}

function getUserRole(): string | null {
  try {
    const raw = localStorage.getItem("clinicalUser") || sessionStorage.getItem("clinicalUser");
    if (raw) return JSON.parse(raw).role;
  } catch {}
  return null;
}

function getDefaultPath(role: string): string {
  if (role === "admin") return "/admin/users";
  if (role === "ict" || role === "hospital_administrator") return "/ict-support";
  return "/my-tickets";
}

function canAccess(routeRole: string, userRole: string | null): boolean {
  if (routeRole === "Entry") return true;
  if (!userRole) return false;
  if (userRole === "admin") return true;
  if (userRole === "ict" || userRole === "hospital_administrator") {
    return routeRole === "ICT Officer" || routeRole === "Shared" || routeRole === "End User" || routeRole === "Admin";
  }
  if (["doctor", "nurse", "staff"].includes(userRole)) {
    return routeRole === "End User" || routeRole === "Shared";
  }
  return false;
}

function RouteGuard({ route, userRole }: { route: ScreenRoute; userRole: string | null }) {
  if (!canAccess(route.role, userRole)) {
    const redirectPath = userRole ? getDefaultPath(userRole) : "/signin";
    return <Navigate to={redirectPath} replace />;
  }
  if (route.role === "Entry" && userRole) {
    return <Navigate to={getDefaultPath(userRole)} replace />;
  }
  return <ScreenFrame screenId={route.id} title={route.title} />;
}

function AppContent() {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role = "staff";
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            role = userDoc.data().user_role || "staff";
          }
        } catch {}
        setAuthUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role,
        });
        try {
          localStorage.setItem("clinicalUser", JSON.stringify({ uid: firebaseUser.uid, email: firebaseUser.email, role }));
          sessionStorage.setItem("clinicalUser", JSON.stringify({ uid: firebaseUser.uid, email: firebaseUser.email, role }));
        } catch {}
      } else {
        setAuthUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubAppSettings = onSnapshot(doc(db, "appSettings", "current"), (snap) => {
      if (snap.exists()) {
        try { localStorage.setItem("ci_app_settings", JSON.stringify(snap.data())); } catch {}
      }
    });
    const unsubKbArticles = onSnapshot(collection(db, "kbArticles"), (snap) => {
      const articles: Record<string, unknown>[] = [];
      snap.forEach((d) => articles.push({ id: d.id, ...d.data() }));
      try { localStorage.setItem("ci_kb_articles", JSON.stringify(articles)); } catch {}
    });
    const unsubUserTypes = onSnapshot(collection(db, "user_types"), (snap) => {
      const types: Record<string, unknown> = {};
      snap.forEach((d) => { types[d.id] = d.data(); });
      try { localStorage.setItem("ci_user_types", JSON.stringify(types)); } catch {}
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const users: Record<string, unknown>[] = [];
      snap.forEach((d) => users.push({ uid: d.id, ...d.data() }));
      try { localStorage.setItem("ci_provisioned_users", JSON.stringify(users)); } catch {}
    });
    return () => {
      unsubAppSettings();
      unsubKbArticles();
      unsubUserTypes();
      unsubUsers();
    };
  }, []);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'navigate') {
        navigate(event.data.path);
      } else if (event.data.type === 'signout') {
        await firebaseSignOut(auth);
        localStorage.removeItem('clinicalUser');
        sessionStorage.removeItem('clinicalUser');
        navigate('/signin');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  useEffect(() => {
    const handleStorage = () => setTick((t) => t + 1);
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const fallbackRole = getUserRole();
  const userRole = authUser?.role || fallbackRole;

  if (authLoading && !fallbackRole) {
    return (
      <div style={{ width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6fafe" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: "3px solid #dfe3e7", borderTopColor: "#001e41", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#43474f" }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", background: "#f6fafe" }}>
      <main style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          {SCREEN_ROUTES.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<RouteGuard route={route} userRole={userRole} />}
            />
          ))}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
