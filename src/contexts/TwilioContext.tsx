/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";

interface TwilioContextType {
  device: any; // Replace with a specific type if available
  incomingConnection: any;
  outgoingConnection: any;
  twilioNumber: string;
  twilioLogs: string[];
  callStatus: string;
  isRecording: boolean;
  callDuration: number;
  captionText: string;

  setTwilioNumber: (number: string) => void;
  addTwilioLog: (log: string) => void;
  setTwilioLogs: (logs: string[]) => void;
  handleCallOut: (number: string) => void;
  handleHangUp: () => void;
  handleAcceptCall: () => void;
  handleRejectCall: () => void;
}

const TwilioContext = createContext<TwilioContextType | undefined>(undefined);

export function TwilioProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<any>(null); // Replace with a specific type if available
  const [callStatus, setCallStatus] = useState("init"); // init, ringing, connected, disconnected
  const [incomingConnection, setIncomingConnection] = useState<any>(null);
  const [outgoingConnection, setOutgoingConnection] = useState<any>(null);
  const [twilioNumber, setTwilioNumber] = useState<string>("");
  const [twilioLogs, setTwilioLogs] = useState<string[]>([]);
  const [captionText, setCaptionText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const callStartTime = useRef<number | null>(null);
  const callDurationInterval = useRef<NodeJS.Timeout | null>(null);
  const recorder = useRef<any>(null);

  // Function to add logs to the Twilio logs
  const addTwilioLog = (log: string) => {
    setTwilioLogs((prevLogs) => [...prevLogs, log]);
  };

  // Handles making an outgoing call
  const handleCallOut = (number: string) => {
    if (!device || callStatus !== "ready") return;

    addTwilioLog(`Calling ${number}...`);

    const newConn = device.connect({ To: number });

    newConn.on("ringing", () => {
      setCallStatus("outgoing");
      addTwilioLog("Ringing...");
    });

    newConn.on("connect", () => {
      setCallStatus("connected");
      addTwilioLog("Connected!");
      startRecording();
    });

    newConn.on("disconnect", () => {
      setCallStatus("ready");
      addTwilioLog("Disconnected.");
      setOutgoingConnection(null);
      stopRecording();
    });

    setOutgoingConnection(newConn);
    setCallStatus("outgoing");
  };

  // Handles hanging up the call
  const handleHangUp = () => {
    if (outgoingConnection) {
      outgoingConnection.disconnect();
    } else {
      incomingConnection?.disconnect();
    }
    setCallStatus("ready");
    stopRecording();
  };

  // Accepts an incoming call
  const handleAcceptCall = () => {
    if (incomingConnection) {
      incomingConnection.accept();
      setCallStatus("connected");
      addTwilioLog("Call Accepted!");
      startRecording();
    }
  };

  // Rejects an incoming call
  const handleRejectCall = () => {
    if (outgoingConnection) {
      outgoingConnection.disconnect();
    } else {
      incomingConnection?.disconnect();
    }
    addTwilioLog("Rejected call ...");
    setCallStatus("ready");
    stopRecording();
  };

  // Starts recording the call
  const startRecording = async () => {
    const connection = outgoingConnection || incomingConnection;

    if (!connection) return;

    try {
      const recording = await connection.record({
        timeLimit: 3600,
        trim: "trim-silence",
      });

      recording.on("transcription", (transcription: any) => {
        setCaptionText(transcription);
      });

      recorder.current = recording; // Store the recorder instance
      setIsRecording(true);
      addTwilioLog("Recording started...");
    } catch (error) {
      console.error("Recording error:", error);
      addTwilioLog(
        `Recording error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Stops recording the call
  const stopRecording = () => {
    if (recorder.current) {
      recorder.current.stop();
      setIsRecording(false);
      addTwilioLog("Recording stopped.");

      // Access the recording URL and other properties
      const recordingUrl = recorder.current.url;
      const recordingDuration = recorder.current.duration;
      addTwilioLog(`Recording URL: ${recordingUrl}`);
      addTwilioLog(`Recording Duration: ${recordingDuration}`);
      console.log("Caption Text:", captionText); // Example: Store in your database
    }
  };

  // Effect to track call duration
  useEffect(() => {
    if (callStatus === "connected") {
      if (callStartTime.current === null) {
        callStartTime.current = Date.now();
      }
      if (!callDurationInterval.current) {
        callDurationInterval.current = setInterval(() => {
          setCallDuration(
            Math.floor((Date.now() - (callStartTime.current as number)) / 1000)
          );
        }, 1000);
      }
    } else if (callStatus !== "connected" && callStartTime.current !== null) {
      clearInterval(callDurationInterval.current!);
      callStartTime.current = null;
      setCallDuration(0);
    }

    return () => {
      if (callDurationInterval.current) {
        clearInterval(callDurationInterval.current);
      }
    };
  }, [callStatus]);

  // Effect to initialize the Twilio device
  useEffect(() => {
    if (typeof window === "undefined" || twilioNumber === "") return;

    const initializeDevice = async () => {
      addTwilioLog("Checking audio devices...");

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasAudioInput = devices.some(
          (device) => device.kind === "audioinput"
        );

        if (!hasAudioInput) {
          throw new Error("No audio input devices found");
        }

        addTwilioLog("Requesting Access Token...");
        const response = await fetch(
          `https://central-lioness-hopefully.ngrok-free.app/token?identity=${twilioNumber}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch access token");
        }

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

        const { Device, Connection } = await import("twilio-client");
        const newDevice = new Device(data.token, {
          codecPreferences: [Connection.Codec.PCMU, Connection.Codec.Opus],
          fakeLocalDTMF: true,
          enableRingingState: true,
          debug: true,
          allowIncomingWhileBusy: true,
          edge: ["ashburn", "dublin", "singapore"],
        });

        newDevice.on("ready", () => {
          setCallStatus("ready");
          addTwilioLog("Twilio.Device Ready!");
        });

        newDevice.on("error", (error) => {
          addTwilioLog("Twilio.Device Error: " + error.message);
        });

        newDevice.on("connect", () => {
          setCallStatus("connected");
          addTwilioLog("Successfully established call!");
          startRecording();
        });

        newDevice.on("incoming", (conn) => {
          console.log("Incoming connection: ", conn);
          setCallStatus("incoming");
          setIncomingConnection(conn);
          addTwilioLog("Incoming connection from " + conn.parameters.From);
        });

        newDevice.on("disconnect", () => {
          setCallStatus("ready");
          addTwilioLog("Call ended.");
        });

        setDevice(newDevice);
      } catch (error) {
        console.warn(error);
        addTwilioLog(
          error instanceof Error
            ? error.message
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

  // Return the context provider
  return (
    <TwilioContext.Provider
      value={{
        device,
        incomingConnection,
        outgoingConnection,
        twilioNumber,
        twilioLogs,
        callStatus,
        isRecording,
        callDuration,
        captionText,
        setTwilioNumber,
        addTwilioLog,
        setTwilioLogs,
        handleCallOut,
        handleHangUp,
        handleAcceptCall,
        handleRejectCall,
      }}
    >
      {children}
    </TwilioContext.Provider>
  );
}

// Custom hook to use Twilio context
export function useTwilioContext() {
  const context = useContext(TwilioContext);
  if (context === undefined) {
    throw new Error("useTwilioContext must be used within a TwilioProvider");
  }
  return context;
}
