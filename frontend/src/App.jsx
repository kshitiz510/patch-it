import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import VideoRecorderWithLiveLocation from "./components/VideoRecorderWithLiveLocation.jsx";
export default function App() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <VideoRecorderWithLiveLocation></VideoRecorderWithLiveLocation>
    </header>
  );
}