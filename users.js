// users.js
const users = [
  { userId: "1", username: "HMohamed", rails: 4, offset: 2 },
  { userId: "2", username: "Tanmay", rails: 4, offset: 2 },
  { userId: "3", username: "Hassan", rails: 4, offset: 2 },
  { userId: "4", username: "Fawzy", rails: 4, offset: 2 },
  { userId: "5", username: "Areeb", rails: 4, offset: 2 },
  { userId: "6", username: "Michael", rails: 4, offset: 2 },
  { userId: "7", username: "SMohamed", rails: 4, offset: 2 },
];

// Function to get a user's cipher settings
function getUserCipher(userId) {
  const user = users.find(u => u.userId === userId);
  return user ? { rails: user.rails, offset: user.offset } : { rails: 3, offset: 1 };
}

// Function to let a user update their cipher choice
function setUserCipher(userId, rails, offset) {
  const user = users.find(u => u.userId === userId);
  if (user) {
    user.rails = rails;
    user.offset = offset;
  }
}

module.exports = { users, getUserCipher, setUserCipher };