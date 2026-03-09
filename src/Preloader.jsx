import { useState, useEffect } from "react";

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = 100 / steps;
    const interval = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= 100) {
        setProgress(100);
        clearInterval(timer);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => onComplete?.(), 600);
        }, 400);
      } else {
        setProgress(current);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(135deg, var(--navy) 0%, #1a4a6b 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.6s var(--ease)",
      }}
    >
      {/* Animated Background Orbs */}
      <div
        className="glow-orb"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)",
          top: "20%",
          left: "10%",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(26,74,107,0.2) 0%, transparent 70%)",
          bottom: "10%",
          right: "15%",
          animationDelay: "2s",
        }}
      />

      {/* Logo/Brand */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "4.5rem",
            fontWeight: 400,
            color: "#fff",
            letterSpacing: "0.05em",
            marginBottom: 12,
            animation: "fadeUpBig 0.8s var(--ease) forwards",
          }}
        >
          Veloura
        </h1>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--gold-lt)",
            animation: "fadeUp 0.8s var(--ease) 0.2s both",
          }}
        >
          Luxury Hotels
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: 280,
          height: 2,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          animation: "fadeUp 0.8s var(--ease) 0.4s both",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--gold), var(--gold-lt))",
            transition: "width 0.1s linear",
            boxShadow: "0 0 20px rgba(201,168,76,0.6)",
          }}
        />
      </div>

      {/* Progress Percentage */}
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.7rem",
          color: "rgba(255,255,255,0.5)",
          marginTop: 16,
          letterSpacing: "0.15em",
          animation: "fadeUp 0.8s var(--ease) 0.5s both",
        }}
      >
        {Math.round(progress)}%
      </div>

      {/* Decorative Elements */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          border: "1px solid rgba(201,168,76,0.08)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
        className="spin-ring"
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
        className="spin-ring-rev"
      />
    </div>
  );
}
