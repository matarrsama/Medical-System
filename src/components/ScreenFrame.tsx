import { type FC, useEffect, useRef, useState } from "react";

interface ScreenFrameProps {
  screenId: string;
  title?: string;
}

const loadingStyles = `
@keyframes ci-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

const ScreenFrame: FC<ScreenFrameProps> = ({ screenId, title }) => {
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoaded(false);
  }, [screenId]);

  useEffect(() => {
    if (loaded || !iframeRef.current) return;
    const timer = setTimeout(() => setLoaded(true), 3000);
    return () => clearTimeout(timer);
  }, [loaded, screenId]);

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

      {/* Loading overlay shown only on first load or slow navigation */}
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
            gap: "16px",
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
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={`/screens/${screenId}.html`}
        title={title || screenId}
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        loading="eager"
      />
    </div>
  );
};

export default ScreenFrame;
