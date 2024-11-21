'use client'
import { useState, useEffect } from "react";

export default function CallOutModal() {
  const [time, setTime] = useState({ minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        const newSeconds = prev.seconds + 1;
        if (newSeconds === 60) {
          return { minutes: prev.minutes + 1, seconds: 0 };
        }
        return { ...prev, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="call-duration">
      {formatTime(time.minutes)}:{formatTime(time.seconds)}
    </div>
  );
}
