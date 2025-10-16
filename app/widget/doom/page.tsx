"use client";

import { useEffect, useRef, useState } from "react";
import { DosPlayer } from "js-dos";

export default function DoomWidget() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let player: any = null;

    const initDoom = async () => {
      if (!rootRef.current) return;

      try {
        // Initialize js-dos player
        player = await DosPlayer(rootRef.current, {
          // Use FreeDoom WAD from public directory
          // js-dos will automatically fetch and mount the bundle
          url: "/doom/freedoom1.wad",
        }).run("DOOM");

        console.log("DOOM initialized successfully");
      } catch (err) {
        console.error("Failed to initialize DOOM:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize DOOM");
      }
    };

    initDoom();

    return () => {
      if (player) {
        try {
          player.stop();
        } catch (err) {
          console.error("Error stopping DOOM:", err);
        }
      }
    };
  }, []);

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
    <div
      ref={rootRef}
      style={{
        width: "100%",
        height: "100vh",
        background: "black",
        overflow: "hidden"
      }}
    />
  );
}
