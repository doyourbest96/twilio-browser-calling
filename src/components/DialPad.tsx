"use client";
import { useState } from "react";
import { BackspaceIcon, PhoneIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface DialPadProps {
  handleCall: (phoneNumber: string) => void;
  onClose: () => void;
}

export default function DialPad({ handleCall, onClose }: DialPadProps) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleNumberClick = (num: string) => {
    setPhoneNumber((prev) => prev + num);
  };

  const handleDelete = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Enter the number</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <input
          type="text"
          value={phoneNumber}
          readOnly
          className="w-full text-2xl p-4 text-center mb-4 bg-gray-100 border rounded-lg font-mono"
        />

        <div className="grid grid-cols-3 gap-6 mb-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
            (num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="rounded-full bg-gray-100 hover:bg-gray-200 shadow-md text-2xl font-semibold transition-colors"
              >
                {num}
              </button>
            )
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleCall(phoneNumber)}
            className="flex-1 py-3 px-4 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
          >
            <PhoneIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => handleNumberClick("+")}
            className="flex-1 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-2xl font-semibold"
          >
            +
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-3 px-4 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <BackspaceIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
