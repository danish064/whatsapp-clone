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
  where
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
    async getUserDetailsFromGoogle(data) {
      try {
        let res = await axios.post("api/google-login", {
          token: data.credential,
        });
        // console.log(res);
        let userExists = await this.checkIfGoogleUserExists(res.data.sub);
        // if(!userExists) console.log("User does not exist");
        console.log("User", userExists ? "exists" : "Does not exists")
        if (!userExists) await this.saveUserDetails(res, true);

        await this.getAllUsers();

        this.uid = res.data.sub;
        this.email = res.data.email;
        this.picture = res.data.picture;
        this.firstName = res.data.given_name;
        this.lastName = res.data.family_name;
      } catch (error) {
        console.log(error);
      }
    },
    async authenticateUser(email, password) {
      console.log("Authenticating user");
      let loginStatus = false;
      const querySnapshot = await getDocs(query(collection(db, "users"), where("email", "==", email)));
      querySnapshot.forEach(async (doc) => {
        // console.log(doc.data());
        if (doc.data().password === password) {
          // console.log("User exists");
          this.uid = doc.data().uid;
          this.email = doc.data().email;
          this.picture = doc.data().picture;
          this.firstName = doc.data().firstName;
          this.lastName = doc.data().lastName;
          console.log("login successful");
          loginStatus = true;
          await this.getAllUsers();
        } else {
          // console.log("User does not exist");
          console.log("Invalid credentials");
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

    async checkIfGoogleUserExists(uid) {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    },
    async checkIfNormalUserExists(email) {
      // const docRef = doc(db, "users", email);
      // const docSnap = await getDoc(docRef);
      // // console.log(docSnap);
      // return docSnap.exists();

      const querySnapshot = await getDocs(query(collection(db, "users"), where("email", "==", email)));
      if (querySnapshot.empty) {
        // console.log("User does not exist");
        return false;
      };
      // console.log("User exists");
      return true;
      console.log(querySnapshot[0].data())
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

    async saveUserDetails(userData, isGoogleUser) {
      console.log(userData);
      // if ("data" in userData) {
      if (isGoogleUser) {
        console.log("Creating google user!");
        try {
          await setDoc(doc(db, "users", userData.data.sub), {
            uid: userData.data.sub,
            email: userData.data.email,
            picture: userData.data.picture,
            firstName: userData.data.given_name,
            lastName: userData.data.family_name ? userData.data.family_name : "",
            isGoogleUser: true,
            password: "",
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        // Save details of normal user
        // console.log("Data does not exist in res");
        console.log("Creating normal user!");
        const newUid = uuid();
        try {
          await setDoc(doc(db, "users", newUid), {
            uid: newUid,
            email: userData.email,
            picture: "/user-profile-default.png",
            firstName: userData.firstName,
            lastName: userData.lastName,
            isGoogleUser: false,
            password: userData.password,
          });
        } catch (error) {
          console.log(error);
        }
      }
    },

    async getChatById(uid) {
      onSnapshot(doc(db, "chat", uid), (doc) => {
        let res = [];
        res.push(doc.data());
        this.currentChat = res;
      });
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
      await updateDoc(
        doc(db, `chat/${data.id}`),
        {
          [data.key1]: data.val1,
          [data.key2]: data.val2,
        },
        { merge: true }
      );
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
