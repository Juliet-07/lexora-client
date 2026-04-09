import { PortalLayout } from "@/components/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Search } from "lucide-react";
import { useState } from "react";

const conversations = [
  { id: 1, name: "Sarah K.", role: "Tax Advisor", lastMsg: "Your documents are ready", time: "2h", unread: true, avatar: "SK" },
  { id: 2, name: "Admin", role: "System", lastMsg: "Compliance deadline reminder", time: "5h", unread: false, avatar: "AD" },
  { id: 3, name: "Finance Dept.", role: "Billing", lastMsg: "Invoice #1041 processed", time: "1d", unread: false, avatar: "FD" },
  { id: 4, name: "James M.", role: "Account Manager", lastMsg: "Welcome aboard!", time: "3d", unread: false, avatar: "JM" },
];

const chatMessages = [
  { id: 1, from: "Sarah K.", self: false, text: "Hi John, I've finished reviewing your tax filing documents.", time: "10:30 AM" },
  { id: 2, from: "Sarah K.", self: false, text: "Everything looks good. I've uploaded the draft for your review. Please check the Documents section.", time: "10:31 AM" },
  { id: 3, from: "You", self: true, text: "Great, thanks Sarah! I'll take a look shortly.", time: "10:45 AM" },
  { id: 4, from: "Sarah K.", self: false, text: "Also, I'll need you to sign the engagement letter before we can proceed to the next phase.", time: "11:02 AM" },
  { id: 5, from: "You", self: true, text: "Sure, I'll sign it today.", time: "11:15 AM" },
  { id: 6, from: "Sarah K.", self: false, text: "Your tax filing documents are ready for final review. Let me know if you have questions!", time: "2:00 PM" },
];

export default function Messages() {
  const [activeChat, setActiveChat] = useState(1);
  const [message, setMessage] = useState("");

  return (
    <PortalLayout title="Messages" subtitle="Chat with your team">
      <Card className="animate-fade-in h-[calc(100vh-10rem)]">
        <CardContent className="p-0 h-full flex">
          {/* Conversations list */}
          <div className="w-72 border-r flex flex-col shrink-0 hidden md:flex">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-9 h-9 text-xs" />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setActiveChat(conv.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b ${
                    activeChat === conv.id ? "bg-accent" : "hover:bg-accent/30"
                  }`}
                >
                  <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary-foreground">{conv.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{conv.name}</p>
                      <span className="text-[10px] text-muted-foreground">{conv.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMsg}</p>
                  </div>
                  {conv.unread && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-4 border-b flex items-center gap-3">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">SK</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Sarah K.</p>
                <p className="text-[10px] text-success">Online</p>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.self ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] ${msg.self ? "order-last" : ""}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm ${
                        msg.self
                          ? "gradient-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p className={`text-[10px] text-muted-foreground mt-1 ${msg.self ? "text-right" : ""}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon" className="gradient-primary text-primary-foreground shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
