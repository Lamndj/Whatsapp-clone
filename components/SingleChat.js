import { useRouter } from "next/router";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../firebase";

import styled from "styled-components";
import { Avatar } from "@material-ui/core";

import getRecipientEmail from "../utils/getRecipientEmail";

function SingleChat({ id, users }) {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const recipientEmail = getRecipientEmail(users, user);

  const recipientUserRef = db
    .collection("users")
    .where("email", "==", recipientEmail);

  const [recipientSnapshot] = useCollection(recipientUserRef);

  const recipient = recipientSnapshot?.docs?.[0]?.data();

  const handleChatClick = () => {
    router.push(`/chat/${id}`);
  };

  return (
    <Container id={id} onClick={handleChatClick}>
      {recipient ? (
        recipient.photoURL ? (
          <UserAvatar src={recipient.photoURL} />
        ) : (
          <UserAvatar>{recipient.email[0]}</UserAvatar>
        )
      ) : (
        <UserAvatar>{recipientEmail[0]}</UserAvatar>
      )}
      <p>{recipientEmail}</p>
    </Container>
  );
}

export default SingleChat;

const Container = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  word-break: break-word;

  :hover {
    background-color: #e9eaeb;
  }
`;

const UserAvatar = styled(Avatar)`
  margin: 5px;
  margin-right: 15px;
`;
