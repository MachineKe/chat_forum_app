import React, { useState } from "react";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import { useAuth } from "../hooks/useAuth";
import useChatPage from "../hooks/useChatPage";
import ContactList from "../components/common/ContactList";

const Chat = () => {
  // Get logged-in user from auth hook
  const { user: loggedInUser } = useAuth ? useAuth() : { user: null };

  // Use chat page hook for all chat data and actions
  const {
    users,
    chatListUsers,
    selectedUserId,
    setSelectedUserId,
    addUser,
    messages,
    sendMessage,
    input,
    setInput,
    messagesEndRef,
    loading,
  } = useChatPage(loggedInUser);

  const [showContactList, setShowContactList] = useState(false);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Handler for new message icon click
  const handleNewMessage = () => setShowContactList(true);


  return (
    <>
      <div className="bg-gray-50 flex flex-col w-full h-full">
        <div className="container mx-auto px-4 flex-1 flex items-center justify-center">
          <div className="flex flex-1 gap-6 overflow-hidden h-[90vh]">
            <div className="flex-shrink-0 w-80">
              <ChatList
                users={chatListUsers.filter(u => u.lastMessage)}
                selectedUserId={selectedUserId}
                onSelectUser={setSelectedUserId}
                onNewMessage={handleNewMessage}
                loading={loading}
              />
            </div>
            <div className="flex-[2] min-w-0 flex flex-col">
              <ChatWindow
                user={selectedUser}
                loggedInUser={loggedInUser}
                messages={messages}
                onSendMessage={sendMessage}
                input={input}
                setInput={setInput}
                messagesEndRef={messagesEndRef}
                loading={loading}
                onAttach={() => {}}
                onRecord={() => {}}
                onVideoCall={() => {}}
              />
            </div>
          </div>
          <ContactList
            show={showContactList}
            onClose={() => setShowContactList(false)}
            onSelect={userObj => {
              if (!users.some(u => u.id === userObj.id)) {
                addUser(userObj);
              }
              setSelectedUserId(userObj.id);
            }}
            selectedId={selectedUserId}
            loggedInUser={loggedInUser}
          />
        </div>
      </div>
    </>
  );
};

export default Chat;
