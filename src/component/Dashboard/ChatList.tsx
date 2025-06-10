import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { User } from "firebase/auth";
import { firestore } from "./firebase";

interface ChatListProps {
  user: User;
}

const ChatList: React.FC<ChatListProps> = ({ user }) => {
  const [chats, setChats] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      const chatQuery = query(collection(firestore, "Chats"), where("participants", "array-contains", user.uid));
      const chatSnapshot = await getDocs(chatQuery);
      setChats(chatSnapshot.docs);
    };

    fetchChats();
  }, [user]);

  return (
    <div className="chat-list">
      {chats.map((chat) => (
        <div key={chat.id}>{chat.data().participants.join(", ")}</div>
      ))}
    </div>
  );
};

export default ChatList;
