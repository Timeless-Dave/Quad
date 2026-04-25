import { Navbar } from "@/components/refar/navbar";
import { ChatClient } from "@/components/quad/chat-client";

export default function AssistantPage() {
  return (
    <div className="theme-dark flex h-dvh flex-col bg-[hsl(0_0%_2%)] text-white">
      <Navbar />
      <ChatClient />
    </div>
  );
}
