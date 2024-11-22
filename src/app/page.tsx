"use client";
// import { useState } from "react";
// import { PhoneIcon } from "@heroicons/react/24/solid";

// import DialPad from "@/components/DialPad";
// import CallInModal from "@/components/CallInModal";
// import CallOutModal from "@/components/CallOutModal";

// import { useTwilioContext } from "@/contexts/TwilioContext";

// export default function Home() {
//   const [showDialPad, setShowDialPad] = useState(false);
//   const [isCallActive, setIsCallActive] = useState(false);
//   const [phoneNumber, setPhoneNumber] = useState("");

//   const {
//     incomingConnection,
//     twilioLogs,
//     setTwilioNumber,
//     handleCallOut,
//     handleHangUp,
//     handleAcceptCall,
//     handleRejectCall,
//   } = useTwilioContext();

//   const handleCall = (phoneNumber: string) => {
//     setShowDialPad(false);
//     setIsCallActive(true);
//     handleCallOut(phoneNumber);
//   };

//   return (

//     // <div className="flex flex-col justify-center items-center h-screen">
//     //   <div>
//     //     <input
//     //       type="text"
//     //       placeholder="Enter phone number"
//     //       value={phoneNumber}
//     //       onChange={(e) => setPhoneNumber(e.target.value)}
//     //     />
//     //     <button onClick={() => setTwilioNumber(phoneNumber)}>Set Number</button>
//     //   </div>
//     //   <div>
//     //     <div className="flex flex-col gap-2 items-center">
//     //       <p>Device Log</p>
//     //       <div className="mt-4 min-w-96 h-32 overflow-y-auto bg-gray-100 rounded-lg p-2">
//     //         {twilioLogs.map((log, index) => (
//     //           <p key={index} className="text-sm text-gray-600">
//     //             &gt; {log}
//     //           </p>
//     //         ))}
//     //       </div>
//     //       <button
//     //         onClick={() => setShowDialPad(true)}
//     //         className="flex-1 py-2 px-6 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
//     //       >
//     //         <PhoneIcon className="h-4 w-4" />
//     //       </button>
//     //     </div>

//     //     {showDialPad && (
//     //       <DialPad
//     //         handleCall={handleCall}
//     //         onClose={() => setShowDialPad(false)}
//     //       />
//     //     )}

//     //     {isCallActive && (
//     //       <div className="call-modal">
//     //         <CallOutModal />
//     //         <button
//     //           onClick={() => {
//     //             setIsCallActive(false);
//     //             handleHangUp();
//     //           }}
//     //         >
//     //           End Call
//     //         </button>
//     //       </div>
//     //     )}

//     //     <CallInModal
//     //       connection={incomingConnection}
//     //       onAccept={handleAcceptCall}
//     //       onReject={handleRejectCall}
//     //     />
//     //   </div>
//     // </div>
//   );
// }

import { useState } from "react";

import { useTwilioContext } from "@/contexts/TwilioContext";

import { formatTime } from "@/utils/formatTime";

export default function Home() {
  const [numberToCall, setNumberToCall] = useState("");

  const {
    device,
    twilioNumber,
    twilioLogs,
    callStatus,
    isRecording,
    callDuration,
    captionText,
    setTwilioNumber,
    handleCallOut,
    handleAcceptCall,
    handleHangUp,
  } = useTwilioContext();
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Twilio Call App</h1>

        <input
          type="tel"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          value={twilioNumber}
          onChange={(e) => setTwilioNumber(e.target.value)}
          placeholder="Enter your number"
        />

        <input
          type="tel"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          value={numberToCall}
          onChange={(e) => setNumberToCall(e.target.value)}
          placeholder="Enter number to call"
        />

        <div className="flex justify-center space-x-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            onClick={() => handleCallOut(numberToCall)}
            disabled={!device || callStatus !== "ready"}
          >
            Call
          </button>
          {callStatus === "incoming" && (
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleAcceptCall}
            >
              Accept
            </button>
          )}
          {(callStatus === "incoming" ||
            callStatus === "outgoing" ||
            callStatus === "connected") && (
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleHangUp}
            >
              Hang Up
            </button>
          )}
        </div>

        <div className="mt-6">
          <p className="text-lg font-semibold">Call Status: {callStatus}</p>
          {callStatus === "connected" && (
            <p className="text-gray-600">
              Call Duration: {formatTime(callDuration)}
            </p>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Logs</h2>
          <ul className="list-disc list-inside">
            {twilioLogs.map((log, index) => (
              <li key={index} className="text-gray-700">
                {log}
              </li>
            ))}
          </ul>
        </div>

        {isRecording && <p className="mt-4 text-green-600">Recording...</p>}
        {captionText && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Captions</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{captionText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
