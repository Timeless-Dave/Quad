import { Navbar } from "@/components/campus/navbar";
import { ChatClient } from "@/components/quad/chat-client";

export const dynamic = "force-dynamic";

export default function AssistantPage() {
  return (
    <div className="theme-dark flex h-dvh flex-col bg-[hsl(0_0%_2%)] text-white">
      <Navbar />
      <ChatClient />
    </div>
  );
}
