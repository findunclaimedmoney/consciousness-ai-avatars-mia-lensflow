import { useState, useEffect } from "react";

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const sceneKeys = Object.keys(durations);
    const durationValues = Object.values(durations);
    const totalScenes = durationValues.length;
    
    // Attempt to start recording if the global hook exists
    if (typeof window !== "undefined" && (window as any).startRecording) {
      (window as any).startRecording();
    }

    let timeout: NodeJS.Timeout;
    let hasStopped = false;

    const playScene = (index: number) => {
      setCurrentScene(index);
      
      timeout = setTimeout(() => {
        const nextIndex = index + 1;
        if (nextIndex >= totalScenes) {
          if (!hasStopped && typeof window !== "undefined" && (window as any).stopRecording) {
            (window as any).stopRecording();
            hasStopped = true;
          }
          playScene(0); // Loop
        } else {
          playScene(nextIndex);
        }
      }, durationValues[index] || 3000);
    };

    playScene(0);

    return () => clearTimeout(timeout);
  }, [JSON.stringify(durations)]);

  return { currentScene };
}
