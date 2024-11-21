"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Device as TwilioDevice, Connection } from "twilio-client";

interface TwilioContextType {
  device: TwilioDevice | null;
  twilioNumber: string;
  twilioLogs: string[];

  setTwilioNumber: (number: string) => void;
  addTwilioLog: (log: string) => void;
  setTwilioLogs: (logs: string[]) => void;
  handleCallOut: (number: string) => void;
  handleHangUp: () => void;
}

const TwilioContext = createContext<TwilioContextType | undefined>(undefined);

export function TwilioProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<TwilioDevice | null>(null);
  const [twilioNumber, setTwilioNumber] = useState<string>("");
  const [twilioLogs, setTwilioLogs] = useState<string[]>([]);

  const addTwilioLog = (log: string) => {
    setTwilioLogs((prevLogs) => [...prevLogs, log]);
  };

  const handleCallOut = (number: string) => {
    if (!device) return;
    device.connect({ number });
  };
  
  const handleHangUp = () => {
    if (!device) return;
    device.disconnectAll();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (twilioNumber === "") return;

    const initializeDevice = async () => {
      if (typeof window === "undefined") return;
      addTwilioLog("Checking audio devices...");

      try {
        // First check if audio input devices exist
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasAudioInput = devices.some(
          (device) => device.kind === "audioinput"
        );

        if (!hasAudioInput) {
          throw new Error("No audio input devices found");
        }

        addTwilioLog("Requesting Access Token...");
        const response = await fetch(
          `http://localhost:5000/token?identity=${twilioNumber}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const data = await response.json();

        addTwilioLog("Got a token.");
        console.log("Token: " + data.token);

        // Request microphone access
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const newDevice = new TwilioDevice(data.token, {
          codecPreferences: [Connection.Codec.PCMU, Connection.Codec.Opus],
          fakeLocalDTMF: true,
          enableRingingState: true,
          debug: true,
          allowIncomingWhileBusy: true,
          edge: ["ashburn", "dublin", "singapore"], // Add multiple edge locations
        });

        newDevice.on("ready", () => {
          addTwilioLog("Twilio.Device Ready!");
        });

        newDevice.on("error", (error) => {
          addTwilioLog("Twilio.Device Error: " + error.message);
        });

        newDevice.on("connect", () => {
          addTwilioLog("Successfully established call!");
        });

        newDevice.on("disconnect", () => {
          addTwilioLog("Call ended.");
        });

        setDevice(newDevice);
      } catch (err) {
        console.warn(err);
        addTwilioLog(
          err instanceof Error
            ? err.message
            : "Failed to initialize audio device"
        );
      }
    };

    initializeDevice();

    return () => {
      if (device) {
        device.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twilioNumber]);

  return (
    <TwilioContext.Provider
      value={{
        device,
        twilioNumber,
        twilioLogs,
        setTwilioNumber,
        addTwilioLog,
        setTwilioLogs,
        handleCallOut,
        handleHangUp,
      }}
    >
      {children}
    </TwilioContext.Provider>
  );
}

export function useTwilioContext() {
  const context = useContext(TwilioContext);
  if (context === undefined) {
    throw new Error("useTwilioContext must be used within a TwilioProvider");
  }
  return context;
}
