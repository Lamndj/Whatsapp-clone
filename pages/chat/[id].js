import styled from "styled-components";
import Head from "next/head";

import Sidebar from "../../components/Sidebar";
import ChatScreen from "../../components/ChatScreen";
import { db, auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import getRecipientEmail from "../../utils/getRecipientEmail";

function UserChat(props) {
  const chat = JSON.parse(props.chat);
  const messages = JSON.parse(props.messages);

  const [user] = useAuthState(auth);

  return (
    <Container>
      <Head>
        <title>Chat with {getRecipientEmail(chat.users, user)}</title>
      </Head>
      <Sidebar />

      <ChatContainer>
        <ChatScreen chat={chat} messages={messages}></ChatScreen>
      </ChatContainer>
    </Container>
  );
}

export default UserChat;

export async function getServerSideProps(context) {
  const chatRef = db.collection("chats").doc(context.query.id);

  // GET CHAT RECORD AGAINST CHAT ID
  const chatRes = await chatRef.get();
  const chat = {
    id: chatRes.id,
    ...chatRes.data(),
  };

  // GET ALL MESSAGES FOR THE CHAT ID
  const messagesRes = await chatRef
    .collection("messages")
    .orderBy("timestamp", "asc")
    .get();
  const messages = messagesRes.docs
    .map((val) => ({
      id: val.id,
      ...val.data(),
    }))
    .map((message) => ({
      ...message,
      timestamp: message.timestamp.toDate().getTime(),
    }));

  // Return the data
  return {
    props: {
      chat: JSON.stringify(chat),
      messages: JSON.stringify(messages),
    },
  };
}

const Container = styled.div`
  display: flex;
`;

const ChatContainer = styled.div`
    flex:1;
    overflow: scroll;
    height: 100vh;
    ::-webkit-scrollbar{
        display:none
    }
    --ms-overflow-style:none // IE and edge
    scrollbar-width: none; //firefox
`;
