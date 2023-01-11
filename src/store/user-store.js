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
    async getUserDetailsFromGoogle(data) {
      try {
        let res = await axios.post("api/google-login", {
          token: data.credential,
        });
        // console.log(res);
        let userExists = await this.checkIfGoogleUserExists(res.data.sub);
        // if(!userExists) console.log("User does not exist");
        // console.log("User", userExists ? "exists" : "Does not exists")
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
      let loginStatus = false;
      const querySnapshot = await getDocs(
        query(collection(db, "users"), where("email", "==", email))
      );
      querySnapshot.forEach(async (doc) => {
        if (doc.data().password === password) {
          this.uid = doc.data().uid;
          this.email = doc.data().email;
          this.picture = doc.data().picture;
          this.firstName = doc.data().firstName;
          this.lastName = doc.data().lastName;
          loginStatus = true;
          await this.getAllUsers();
        } else {
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

      const querySnapshot = await getDocs(
        query(collection(db, "users"), where("email", "==", email))
      );
      if (querySnapshot.empty) {
        return false;
      }
      return true;
    },

    async saveUserDetails(userData, isGoogleUser) {
      // console.log(userData);
      // if ("data" in userData) {
      let newUserData = {
        uid: "",
        email: "",
        picture: "/user-profile-default.png",
        firstName: "",
        lastName: "",
        isGoogleUser: false,
        password: "",
        lastSeen: new Date(),
      };
      if (isGoogleUser) {
        // console.log("Creating google user!");
        newUserData.uid = userData.data.sub;
        newUserData.email = userData.data.email;
        newUserData.picture = userData.data.picture;
        newUserData.firstName = userData.data.given_name;
        newUserData.lastName = userData.data.family_name
          ? userData.data.family_name
          : "";
        newUserData.isGoogleUser = true;
        password = "";
      } else {
        // Save details of normal user
        newUserData.uid = uuid();
        newUserData.email = userData.email;
        newUserData.picture = userData.picture;
        newUserData.firstName = userData.firstName;
        newUserData.lastName = userData.lastName;
        newUserData.isGoogleUser = false;
        newUserData.password = userData.password;
      }
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

      // Get all chats
      onSnapshot(q, (querySnapshot) => {
        // this.chats = [];
        querySnapshot.forEach((doc) => {

          if (doc.data().uid1 === this.uid || doc.data().uid2 === this.uid) {
            this.chats.push({ id: doc.id, ...doc.data() });
            this.allUsers.forEach((user) => {
              if (user.uid !== this.uid) {
                if (doc.data().uid1 == user.uid) {
                  this.chats[this.chats.length - 1].user = user;
                  this.removeUsersFromFindFriends.push(user.uid);
                } else if (doc.data().uid2 == user.uid) {
                  this.chats[this.chats.length - 1].user = user;
                  this.removeUsersFromFindFriends.push(user.uid);
                }
              }
            });
          }

          // this.removeUsersFromFindFriends = [];
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
