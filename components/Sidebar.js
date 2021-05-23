import { Avatar, Button, IconButton } from "@material-ui/core";
import styled from "styled-components";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SearchIcon from "@material-ui/icons/Search";

import * as EmailValidator from "email-validator";

import SingleChat from "./SingleChat";

// Firebase
import { auth, db } from "../firebase";

function Sidebar() {
  const [user] = useAuthState(auth);
  const userChatRef = db
    .collection("chats")
    .where("users", "array-contains", user?.email);
  const [chatsSnapshot] = useCollection(userChatRef);

  const handleCreateChat = () => {
    const input = prompt("Please enter the email address for the user.");

    if (!input) return;

    if (
      EmailValidator.validate(input) &&
      input !== user.email &&
      !chatAlreadyExists(input)
    ) {
      // Add email/chat to db
      db.collection("chats").add({
        users: [user.email, input],
      });
    }
  };

  const chatAlreadyExists = (recEmail) =>
    !!chatsSnapshot?.docs.find(
      (val) => val.data().users.find((user) => user === recEmail)?.length > 0
    );

  return (
    <Container>
      {/* Header */}
      <Header>
        <UserAvatar onClick={() => auth.signOut()} src={user?.photoURL} />

        <IconsContainer>
          <IconButton>
            <ChatIcon />
          </IconButton>

          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </IconsContainer>
      </Header>

      {/* Search bar */}
      <Search>
        <SearchIcon />
        <SearchInput placeholder="Search in chats" />
      </Search>

      {/* Create new chat */}
      <SidebarButton onClick={handleCreateChat}>Start a new chat</SidebarButton>

      {/* list of chats */}
      <ChatListContainer>
        {(chatsSnapshot?.docs || []).map((chat, index) => {
          const data = chat?.data();
          return (
            <>
              <SingleChat
                key={chat?.id}
                id={chat?.id}
                users={data?.users}
              ></SingleChat>
            </>
          );
        })}
      </ChatListContainer>
    </Container>
  );
}

export default Sidebar;

const Container = styled.div`
  /* width: 25%; */
  /* border-right: 1px solid whitesmoke; */
  flex:0.45;
  min-width: 300px;
  max-width:350px;
  overflow-y: auto;
  height: 100vh;
  ::-webkit-scrollbar{
        display:none
    }
    --ms-overflow-style:none // IE and edge
    scrollbar-width: none; //firefox
`;

const Search = styled.div`
  display: flex;
  align-items: center;
  gap: 10;
  padding: 15px;
  border-radius: 2px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
`;

const SidebarButton = styled(Button)`
  width: 100%;
  &&& {
    border-top: 1px solid whitesmoke;
    border-bottom: 1px solid whitesmoke;
  }
`;

const Header = styled.div`
  display: flex;
  gap: 10;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  height: 80px;
  padding: 15px;
  border-bottom: 1px solid whitesmoke;
`;

const UserAvatar = styled(Avatar)`
  cursor: pointer;
  transition: opacity 100ms ease;
  :hover {
    opacity: 0.8;
  }
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 10;
`;

const ChatListContainer = styled.div``;
