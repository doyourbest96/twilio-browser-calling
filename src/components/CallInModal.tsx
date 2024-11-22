/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";

interface CallInModalProps {
  connection: any;
  onAccept: () => void;
  onReject: () => void;
}

const CallInModal: FC<CallInModalProps> = ({
  connection,
  onAccept,
  onReject,
}) => {
  return (
    connection ? (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-[300px] bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="p-4 text-center border-b">
          <h4 className="text-lg font-medium">{connection.parameters.From}</h4>
        </div>

        {/* Body */}
        <div className="h-[300px]">{/* Add call animation/content here */}</div>

        {/* Footer */}
        <div className="p-4 flex justify-center gap-4 border-t">
          <button
            onClick={onAccept}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 text-green-500 rotate-[135deg]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>

          <button
            onClick={onReject}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 text-red-500 rotate-[225deg]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>): (<></>)
  );
};

export default CallInModal;
