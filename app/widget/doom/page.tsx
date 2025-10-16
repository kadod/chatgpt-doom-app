"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Dos: any;
  }
}

export default function DoomWidget() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !rootRef.current || !window.Dos) return;

    let instance: any = null;

    const initDoom = async () => {
      try {
        // Initialize js-dos using global Dos function
        const ci = await window.Dos(rootRef.current!);
        instance = ci;

        // Run DOOM with FreeDoom WAD
        await ci.main(["-c", "mount c .", "-c", "c:", "-c", "doom -iwad FREEDOOM1.WAD"]);

        setLoading(false);
        console.log("DOOM initialized successfully");
      } catch (err) {
        console.error("Failed to initialize DOOM:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize DOOM");
        setLoading(false);
      }
    };

    initDoom();

    return () => {
      if (instance) {
        try {
          instance.exit();
        } catch (err) {
          console.error("Error stopping DOOM:", err);
        }
      }
    };
  }, [scriptLoaded]);

  if (error) {
    return (
      <div style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "black",
        color: "red",
        fontFamily: "monospace",
        padding: "20px",
        textAlign: "center"
      }}>
        <div>
          <h2>Error Loading DOOM</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="/js-dos.js"
        onLoad={() => setScriptLoaded(true)}
        onError={(e) => {
          console.error("Failed to load js-dos script:", e);
          setError("Failed to load DOOM engine");
        }}
      />
      <link rel="stylesheet" href="/js-dos.css" />

      {loading && (
        <div style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "black",
          color: "white",
          fontFamily: "monospace"
        }}>
          <div>Loading DOOM...</div>
        </div>
      )}

      <div
        ref={rootRef}
        style={{
          width: "100%",
          height: "100vh",
          background: "black",
          overflow: "hidden",
          display: loading ? "none" : "block"
        }}
      />
    </>
  );
}
