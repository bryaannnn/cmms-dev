// src/components/ChatRoom.tsx
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, QueryDocumentSnapshot, DocumentData, Timestamp } from "firebase/firestore";
import { firestore, auth } from "./firebase";

interface ChatRoomProps {
  chatId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const messageQuery = query(collection(firestore, "Chats", chatId, "messages"), where("timestamp", ">=", Timestamp.now()));
      const messageSnapshot = await getDocs(messageQuery);
      setMessages(messageSnapshot.docs);
    };

    fetchMessages();
  }, [chatId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;

    const user = auth.currentUser;
    if (!user) {
      console.error("No user is signed in.");
      return;
    }

    await addDoc(collection(firestore, "Chats", chatId, "messages"), {
      senderId: user.uid,
      content: message,
      timestamp: Timestamp.now()
    });

    setMessage("");
  };

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.data().senderId === auth.currentUser?.uid ? "sent" : "received"}`}>
            {msg.data().content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;