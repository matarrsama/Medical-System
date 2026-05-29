import { type FC, useState } from "react";

interface ScreenFrameProps {
  screenId: string;
  title?: string;
}

const loadingStyles = `
@keyframes ci-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}
@keyframes ci-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ci-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

const ScreenFrame: FC<ScreenFrameProps> = ({ screenId, title }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: "#f6fafe",
      }}
    >
      <style>{loadingStyles}</style>

      {/* Loading overlay */}
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f6fafe",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #001e41 0%, #17335a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "ci-pulse 1.4s ease-in-out infinite",
              boxShadow: "0 4px 20px rgba(0, 30, 65, 0.15)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                color: "#ffffff",
                fontSize: "24px",
                fontVariationSettings: "'FILL' 1",
              }}
            >
              shield_health
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              animation: "ci-fade-in 0.4s ease-out",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid #dfe3e7",
                borderTopColor: "#001e41",
                borderRadius: "50%",
                animation: "ci-spin 0.7s linear infinite",
              }}
            />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                color: "#737780",
                fontWeight: 500,
                letterSpacing: "0.03em",
              }}
            >
              Loading {title || screenId}...
            </span>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        key={screenId}
        src={`/screens/${screenId}.html`}
        title={title || screenId}
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        loading="eager"
      />
    </div>
  );
};

export default ScreenFrame;
