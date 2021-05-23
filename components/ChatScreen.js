import { useState, useRef } from "react";
import { useRouter } from "next/router";

import { db, auth } from "../firebase";
import firebase from "firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

import styled from "styled-components";
import { Avatar, IconButton } from "@material-ui/core";
import getRecipientEmail from "../utils/getRecipientEmail";
import Message from "./Message";

import MoreVertIcon from "@material-ui/icons/MoreVert";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";

import TimeAgo from "timeago-react";

function ChatScreen({ chat, messages }) {
  const [userMessage, setUserMessage] = useState("");

  const [user] = useAuthState(auth);
  const router = useRouter();

  const myRef = useRef(null);

  const handleUserMessageChange = (e) => {
    setUserMessage(e.target.value);
  };

  const [messagesSnapshot] = useCollection(
    db
      .collection("chats")
      .doc(router.query.id)
      .collection("messages")
      .orderBy("timestamp", "asc")
  );

  const [recipientSnapshot] = useCollection(
    db
      .collection("users")
      .where("email", "==", getRecipientEmail(chat.users, user))
  );

  const showMesssages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((msg) => (
        <Message
          user={msg.data().user}
          message={{
            ...msg.data(),
            timestamp: msg.data().timestamp?.toDate().getTime(),
          }}
          key={msg.id}
        />
      ));
    } else {
      return messages.map((msg) => {
        return <Message user={msg.user} message={msg} key={msg.id} />;
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!userMessage || userMessage === "") {
      alert("Please type something...");
    } else {
      // add message to message collection
      db.collection("chats").doc(router.query.id).collection("messages").add({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        message: userMessage,
        user: user.email,
        photoURL: user.photoURL,
      });

      // update lastseen to current time
      db.collection("users").doc(user.uid).set(
        {
          lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setUserMessage("");
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    myRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const recipientData = recipientSnapshot?.docs?.[0]?.data();
  const recipientEmail = getRecipientEmail(chat.users, user);
  const recipientLastSeen = recipientData?.lastSeen?.toDate();

  return (
    <Container>
      <Header>
        {recipientData ? (
          <Avatar src={recipientData?.photoURL} />
        ) : (
          <Avatar>{recipientEmail[0]}</Avatar>
        )}
        <HeaderInformation>
          <h3>{recipientEmail}</h3>
          {recipientSnapshot ? (
            <p>
              Last Active:{" "}
              {recipientData?.lastSeen?.toDate() ? (
                <TimeAgo datetime={recipientLastSeen} />
              ) : (
                "Unavailable"
              )}
            </p>
          ) : (
            <p>Loading Last Seen...</p>
          )}
        </HeaderInformation>

        <HeaderIcons>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
          <IconButton>
            <AttachFileIcon />
          </IconButton>
        </HeaderIcons>
      </Header>

      <MessagesContainer>
        {showMesssages()}
        <EndOfMessage ref={myRef} />
      </MessagesContainer>

      <InputContainer onSubmit={handleFormSubmit}>
        <IconButton>
          <InsertEmoticonIcon />
        </IconButton>
        <UserChatInput onChange={handleUserMessageChange} value={userMessage} />
        <IconButton>
          <MicIcon />
        </IconButton>
      </InputContainer>
    </Container>
  );
}

export default ChatScreen;

const Container = styled.div``;

const Header = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  padding: 12px;
  height: 80px;
  align-items: center;
  border-bottom: 1px solid whitesmoke;
  border-left: 1px solid whitesmoke;
`;

const HeaderInformation = styled.div`
  margin-left: 15px;
  flex-grow: 1;

  > h3 {
    margin: 0 0 3px 0;
  }
  > p {
    font-size: 14px;
    color: grey;
    margin: 0;
  }
`;

const HeaderIcons = styled.div``;

const EndOfMessage = styled.div`
  margin-bottom: 50px;
`;

const MessagesContainer = styled.div`
  padding: 30px;
  height: calc(100vh - 160px);
  background-color: #e5ded8;
  overflow-y: auto;
  ::-webkit-scrollbar{
        display:none
    }
    --ms-overflow-style:none // IE and edge
    scrollbar-width: none; //firefox
`;

const InputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
  border-left: 1px solid whitesmoke;
  height: 80px;
`;

const UserChatInput = styled.input`
  flex: 1;
  padding: 20px;
  outline: none;
  border: none;
  border-radius: 10px;
  background: whitesmoke;
  margin: 0 16px;
`;
