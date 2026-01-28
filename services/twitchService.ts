import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../types';
import { getRandomColor } from '../constants';

export const useTwitchChat = (channel: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Use a ref for the channel to access it inside the effect cleanup/re-run logic if needed
  // but strictly we just need to restart effect if channel changes.
  
  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev.slice(-49), msg]); // Keep last 50 messages
  }, []);

  useEffect(() => {
    if (!channel) return;

    const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
    wsRef.current = ws;

    ws.onopen = () => {
      // Login anonymously
      ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
      ws.send('PASS SCHMOOPIIE');
      ws.send(`NICK justinfan${Math.floor(Math.random() * 100000)}`);
      ws.send(`JOIN #${channel.toLowerCase()}`);
      setIsConnected(true);
      addMessage({
        id: 'system-connected',
        username: 'System',
        message: `Подключено к чату: ${channel}`,
        color: '#00FF00'
      });
    };

    ws.onmessage = (event) => {
      const data = event.data as string;
      const lines = data.split('\r\n');

      lines.forEach((line) => {
        if (!line) return;

        // Keep connection alive
        if (line.startsWith('PING')) {
          ws.send('PONG :tmi.twitch.tv');
          return;
        }

        // Parse PRIVMSG
        if (line.includes('PRIVMSG')) {
          const parts = line.split('PRIVMSG');
          const metaPart = parts[0];
          const messagePart = parts[1];
          
          if (!messagePart) return;

          // Extract username
          // format: :username!username@username.tmi.twitch.tv ...
          const userMatch = metaPart.match(/:(\w+)![^ ]+/);
          const username = userMatch ? userMatch[1] : 'Unknown';

          // Extract channel and message
          // format: #channel :message content here
          const msgContentMatch = messagePart.match(/#\w+\s+:(.*)/);
          const messageText = msgContentMatch ? msgContentMatch[1] : '';

          // Extract color from tags if available (simplified parsing)
          const colorMatch = metaPart.match(/color=(#[0-9A-Fa-f]{6});/);
          const color = colorMatch ? colorMatch[1] : getRandomColor();

          addMessage({
            id: crypto.randomUUID(),
            username,
            message: messageText,
            color
          });
        }
      });
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [channel, addMessage]);

  const clearMessages = () => setMessages([]);

  return { messages, isConnected, clearMessages };
};