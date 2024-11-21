import { TwilioProvider } from "./TwilioContext";

export default function MainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TwilioProvider>{children}</TwilioProvider>;
}