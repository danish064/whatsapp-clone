import { defineStore } from "pinia";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { db } from "@/firebase-init";
// import { collection, query, where, getDocs } from "firebase/firestore";
import {
  setDoc,
  getDoc,
  doc,
  getDocs,
  collection,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

axios.defaults.baseURL = "http://localhost:4001/";

export const useUserStore = defineStore("user", {
  state: () => ({
    uid: "",
    email: "",
    picture: "",
    firstName: "",
    lastName: "",
    chats: [],
    allUsers: [],
    userDataForChat: [],
    showFindFriends: false,
    currentChat: null,
    removeUsersFromFindFriends: [],
  }),
  actions: {
    async authenticateUser(email, password) {
      // console.log("Authenticating user");
      let loginStatus = false;
      const querySnapshot = await getDocs(
        query(collection(db, "users"), where("email", "==", email))
      );
      querySnapshot.forEach(async (doc) => {
        // console.log(doc.data());
        if (doc.data().password === password) {
          // console.log("User exists");
          this.uid = doc.data().uid;
          this.email = doc.data().email;
          this.picture = doc.data().picture;
          this.firstName = doc.data().firstName;
          this.lastName = doc.data().lastName;
          // console.log("login successful");
          loginStatus = true;
          await this.getAllUsers();
        } else {
          // console.log("User does not exist");
          // console.log("Invalid credentials");
          loginStatus = false;
        }
      });
      return loginStatus;
    },
    async getAllUsers() {
      const querySnapshot = await getDocs(collection(db, "users"));
      let results = [];
      querySnapshot.forEach((doc) => {
        results.push(doc.data());
      });

      if (results.length) {
        this.allUsers = [];
        results.forEach((res) => {
          this.allUsers.push(res);
        });
      }
    },
    async checkIfUserExists(email) {
      // const docRef = doc(db, "users", email);
      // const docSnap = await getDoc(docRef);
      // // console.log(docSnap);
      // return docSnap.exists();

      const querySnapshot = await getDocs(
        query(collection(db, "users"), where("email", "==", email))
      );
      if (querySnapshot.empty) {
        // console.log("User does not exist");
        return false;
      }
      // console.log("User exists");
      return true;
      console.log(querySnapshot[0].data());
      // querySnapshot.forEach((doc) => {
      //   console.log(doc.data());
      //   if (doc.data().email === email) {
      //     console.log("User exists");
      //     return true;
      //   } else {
      //     console.log("User does not exist");
      //     return false;
      //   }
      // });
    },

    async saveUserDetails(userData) {
      // console.log(userData);
      // if ("data" in userData) {
      let newUserData = {
        uid: "",
        email: "",
        picture: "",
        firstName: "",
        lastName: "",
        password: "",
        lastSeen: new Date(),
      };
      // Save details of normal user
      newUserData.uid = uuid();
      newUserData.email = userData.email;
      newUserData.picture = userData.picture;
      newUserData.firstName = userData.firstName;
      newUserData.lastName = userData.lastName;
      newUserData.password = userData.password;
      try {
        await setDoc(doc(db, "users", newUserData.uid), newUserData);
        return true;
      } catch (error) {
        console.log(error);
      }
    },

    async getChatById(uid) {
      // This function gets chat in real time
      const chatDoc = doc(db, "chat", uid);
      const onNextSnapshotCallback = (doc) => {
        let res = [];
        res.push(doc.data());
        this.currentChat = res;
      };
      const unsub = onSnapshot(chatDoc, onNextSnapshotCallback);
      //   return unsub;
    },
    getAllChatsByUser() {
      const q = query(collection(db, "chat"));

      onSnapshot(q, (querySnapshot) => {
        let chatArray = [];
        querySnapshot.forEach((doc) => {
          let data = {
            id: doc.id,
            uid1: doc.data().uid1,
            uid2: doc.data().uid2,
            user1HasViewed: doc.data().user1HasViewed,
            user2HasViewed: doc.data().user2HasViewed,
            messages: doc.data().messages,
          };

          if (doc.data().uid1 === this.uid) chatArray.push(data);
          if (doc.data().uid2 === this.uid) chatArray.push(data);

          this.removeUsersFromFindFriends = [];

          chatArray.forEach((chat) => {
            if (this.uid === chat.uid1) {
              this.allUsers.forEach((user) => {
                if (user.uid == chat.uid2) {
                  chat.user = user;
                  this.removeUsersFromFindFriends.push(user.uid);
                }
              });
            }

            if (this.uid === chat.uid2) {
              this.allUsers.forEach((user) => {
                if (user.uid == chat.uid1) {
                  chat.user = user;
                  this.removeUsersFromFindFriends.push(user.uid);
                }
              });
            }
          });

          this.chats = [];
          chatArray.forEach((chat) => {
            this.chats.push(chat);
          });
        });
      });
    },

    async sendMessage(data) {
      try {
        if (data.chatId) {
          await updateDoc(doc(db, `chat/${data.chatId}`), {
            user1HasViewed: false,
            user2HasViewed: false,
            messages: arrayUnion({
              uid: this.uid,
              message: data.message,
              createdAt: Date.now(),
            }),
          });
        } else {
          let id = uuid();
          await setDoc(doc(db, `chat/${id}`), {
            uid1: this.uid,
            uid2: data.uid2,
            user1HasViewed: false,
            user2HasViewed: false,

            messages: [
              {
                uid: this.uid,
                message: data.message,
                createdAt: Date.now(),
              },
            ],
          });

          this.userDataForChat[0].id = id;
          this.showFindFriends = false;
        }
      } catch (error) {
        console.log(error);
      }
    },

    async hasReadMessage(data) {
      try {
        await updateDoc(
          doc(db, `chat/${data.id}`),
          {
            user1HasViewed: data.user1HasViewed,
            user2HasViewed: data.user2HasViewed,
          },
          { merge: true }
        );
      } catch (error) {
        console.log(error);
      }
    },

    logout() {
      this.uid = "";
      this.email = "";
      this.picture = "";
      this.firstName = "";
      this.lastName = "";
      this.allUsers = [];
      this.chats = [];
      this.userDataForChat = [];
      this.removeUsersFromFindFriends = [];
      this.showFindFriends = false;
      this.currentChat = false;
    },
  },
  persist: true,
});
