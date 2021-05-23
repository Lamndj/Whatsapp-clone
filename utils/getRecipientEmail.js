const getRecipientEmail = (users, loggedInUser) =>
  users?.filter((val) => val !== loggedInUser?.email)[0];

export default getRecipientEmail;
