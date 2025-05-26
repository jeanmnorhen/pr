"use client";

import { useState, useEffect, FormEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addMessage, subscribeToMessages, type Message } from '@/lib/firebase/realtime-db';
import { useAuth } from '@/hooks/use-auth';
import { MessageSquareText, Send, Loader2, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function RealtimeDBExamplePage() {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMessages((fetchedMessages) => {
      setMessages(fetchedMessages);
      setIsLoading(false);
    }, 50); // Fetch last 50 messages

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      toast({ title: "Error", description: "Message cannot be empty.", variant: "destructive" });
      return;
    }
    
    setIsSending(true);
    try {
      await addMessage(newMessage, user);
      setNewMessage('');
      toast({ title: "Success", description: "Message sent!" });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <MessageSquareText className="h-7 w-7 text-primary" />
            Realtime Chat
          </CardTitle>
          <CardDescription>
            Send and receive messages in realtime using Firebase Realtime Database.
            {!authLoading && !user && (
              <p className="text-sm text-amber-600 mt-1">
                <Link href="/login" className="underline hover:text-accent">Sign in</Link> to send messages with your name.
              </p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-muted/20 mb-6" ref={scrollAreaRef}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No messages yet. Be the first to send one!</p>
            ) : (
              <ul className="space-y-4">
                {messages.map((msg) => (
                  <li key={msg.id} className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-lg shadow-md max-w-[75%] ${msg.userId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                      <p className="text-sm break-words">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {msg.userId === user?.uid ? null : <UserCircle size={14} className="text-muted-foreground" />}
                      <p className="text-xs text-muted-foreground">
                        {msg.userName || 'Guest'} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={user ? "Type your message..." : "Sign in to chat"}
              disabled={isSending || authLoading }
              className="flex-grow"
            />
            <Button type="submit" disabled={isSending || authLoading } className="bg-primary hover:bg-primary/90">
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Note: This is a basic example. For a production app, implement robust authentication and security rules for your database.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
