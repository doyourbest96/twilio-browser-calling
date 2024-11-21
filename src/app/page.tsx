"use client";
import { useState } from "react";
import { PhoneIcon } from "@heroicons/react/24/solid";

import DialPad from "@/components/DialPad";
import CallInModal from "@/components/CallInModal";
import CallOutModal from "@/components/CallOutModal";

import { useTwilioContext } from "@/contexts/TwilioContext";

export default function Home() {
  const [showDialPad, setShowDialPad] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const { twilioLogs, setTwilioNumber, handleCallOut } = useTwilioContext();

  const handleCall = (phoneNumber: string) => {
    setShowDialPad(false);
    setIsCallActive(true);
    handleCallOut(phoneNumber);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div>
        <input
          type="text"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button onClick={() => setTwilioNumber(phoneNumber)}>Set Number</button>
      </div>
      <div>
        <div className="flex flex-col gap-2 items-center">
          <p>Device Log</p>
          <div className="mt-4 min-w-96 h-32 overflow-y-auto bg-gray-100 rounded-lg p-2">
            {twilioLogs.map((log, index) => (
              <p key={index} className="text-sm text-gray-600">
                &gt; {log}
              </p>
            ))}
          </div>
          <button
            onClick={() => setShowDialPad(true)}
            className="flex-1 py-2 px-6 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
          >
            <PhoneIcon className="h-4 w-4" />
          </button>
        </div>

        {showDialPad && (
          <DialPad
            handleCall={handleCall}
            onClose={() => setShowDialPad(false)}
          />
        )}

        {isCallActive && (
          <div className="call-modal">
            <CallOutModal />
            <button onClick={() => setIsCallActive(false)}>End Call</button>
          </div>
        )}
        {incomingCall && (
          <CallInModal
            callerNumber="123-456-7890"
            onAccept={() => {
              setIncomingCall(false);
              setIsCallActive(true);
            }}
            onReject={() => setIncomingCall(false)}
          />
        )}
      </div>
    </div>
  );
}
