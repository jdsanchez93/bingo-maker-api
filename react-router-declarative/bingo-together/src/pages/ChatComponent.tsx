import { useEffect, useRef, useState, useCallback } from 'react';

const WEBSOCKET_URL = 'wss://zw52zaff49.execute-api.us-east-1.amazonaws.com/production/';

export default function ChatComponent() {
    const socketRef = useRef<WebSocket | null>(null);
    const attemptRef = useRef(0);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [showReconnect, setShowReconnect] = useState(false);
    const isConnecting = useRef(false);

    const connect = useCallback(() => {
        if (
            isConnecting.current ||
            (socketRef.current && socketRef.current.readyState < 2)
        ) {
            console.log('WebSocket already connecting or open.');
            return;
        }
        isConnecting.current = true;

        const socket = new WebSocket(WEBSOCKET_URL);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket connected');
            isConnecting.current = false;
            attemptRef.current = 0;
            setShowReconnect(false);
        };

        socket.onmessage = (event) => {
            console.log('Received:', event.data);
            setMessages((prev) => [...prev, event.data]);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = (event) => {
            console.log('WebSocket disconnected', event);
            isConnecting.current = false;
            socketRef.current = null;
            attemptRef.current += 1;
            if (attemptRef.current <= 5) {
                const delay = Math.min(5000 * 2 ** attemptRef.current, 30000);
                reconnectTimeoutRef.current = setTimeout(connect, delay);
            } else {
                console.warn('Max reconnection attempts reached.');
                setShowReconnect(true);
            }
        };
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }

            isConnecting.current = false;
        };
    }, [connect]);

    const sendMessage = () => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: 'sendmessage', message: input }));
            setInput('');
        } else {
            console.error('WebSocket is not open. Unable to send message.', socketRef.current);
        }
    };

    return (
        <div>
            <h3>Chat</h3>
            <div>
                {messages.map((msg, idx) => (
                    <div key={idx}>{msg}</div>
                ))}
                {showReconnect && (
                    <button onClick={connect}>Reconnect</button>
                )}
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message"
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}