import { defineStore } from 'pinia'
import axios from 'axios'
import { v4 as uuid } from 'uuid';
import { db } from '@/firebase-init'
import {
    setDoc,
    getDoc,
    doc,
    getDocs,
    collection,
    updateDoc,
    arrayUnion,
    onSnapshot,
    query
} from 'firebase/firestore';

axios.defaults.baseURL = 'http://localhost:4001/'

export const useUserStore = defineStore('user', {
    state: () => ({
        uid: '',
        email: '',
        picture: '',
        firstName: '',
        lastName: '',
        chats: [],
        allUsers: [],
        userDataForChat: [],
        showFindFriends: false,
        currentChat: null,
        removeUsersFromFindFriends: []
    }),
    actions: {
        async getUserDetailsFromGoogle(data) {
            try {
                let res = await axios.post('api/google-login', {
                    token: data.credential
                })
                console.log(res);
                let userExists = await this.checkIfUserExists(res.data.sub)
                if (!userExists) await this.saveUserDetails(res)

                await this.getAllUsers()

                this.uid = res.data.sub
                this.email = res.data.email
                this.picture = res.data.picture
                this.firstName = res.data.given_name
                this.lastName = res.data.family_name
            } catch (error) {
                console.log(error)
            }
        },

        async getAllUsers() {
            const querySnapshot = await getDocs(collection(db, "users"))
            let results = []
            querySnapshot.forEach(doc => { results.push(doc.data()) })

            if (results.length) {
                this.allUsers = []
                results.forEach(res => { this.allUsers.push(res) })
            }
        },

        async checkIfUserExists(uid) {
            const docRef = doc(db, "users", uid)
            const docSnap = await getDoc(docRef)
            return docSnap.exists()
        },

        async saveUserDetails(res) {
            try {
                await setDoc(doc(db, "users", res.data.sub), {
                    uid: res.data.sub,
                    email: res.data.email,
                    picture: res.data.picture,
                    firstName: res.data.given_name,
                    lastName: res.data.family_name,
                })
            } catch (error) {
                console.log(error)
            }
        },

        async getChatById(uid) {
            onSnapshot(doc(db, "chat", uid), (doc) => {
                let res = []
                res.push(doc.data())
                this.currentChat = res
            })
        },

        getAllChatsByUser() {
            const q = query(collection(db, "chat"))

            onSnapshot(q, (querySnapshot) => {
                let chatArray = []
                querySnapshot.forEach(doc => {
                    let data = {
                        id: doc.id,
                        uid1: doc.data().uid1,
                        uid2: doc.data().uid2,
                        user1HasViewed: doc.data().user1HasViewed,
                        user2HasViewed: doc.data().user2HasViewed,
                        messages: doc.data().messages
                    }

                    if (doc.data().uid1 === this.uid) chatArray.push(data)
                    if (doc.data().uid2 === this.uid) chatArray.push(data)

                    this.removeUsersFromFindFriends = []

                    chatArray.forEach(chat => {

                        if (this.uid === chat.uid1) {
                            this.allUsers.forEach(user => {
                                if (user.uid == chat.uid2) {
                                    chat.user = user
                                    this.removeUsersFromFindFriends.push(user.uid)
                                }
                            })
                        }

                        if (this.uid === chat.uid2) {
                            this.allUsers.forEach(user => {
                                if (user.uid == chat.uid1) {
                                    chat.user = user
                                    this.removeUsersFromFindFriends.push(user.uid)
                                }
                            })
                        }
                    })

                    this.chats = []
                    chatArray.forEach(chat => {
                        this.chats.push(chat)
                    })

                })
            })
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
                            createdAt: Date.now()
                        })
                    })
                } else {
                    let id = uuid()
                    await setDoc(doc(db, `chat/${id}`), {
                        uid1: this.uid,
                        uid2: data.uid2,
                        user1HasViewed: false,
                        user2HasViewed: false,

                        messages: [{
                            uid: this.uid,
                            message: data.message,
                            createdAt: Date.now()
                        }]

                    })

                    this.userDataForChat[0].id = id
                    this.showFindFriends = false
                }
            } catch (error) {
                console.log(error)
            }
        },

        async hasReadMessage(data) {
            await updateDoc(doc(db, `chat/${data.id}`), {
                [data.key1]: data.val1,
                [data.key2]: data.val2
            }, { merge: true })
        },

        logout() {
            this.uid = ''
            this.email = ''
            this.picture = ''
            this.firstName = ''
            this.lastName = ''
            this.allUsers = []
            this.chats = []
            this.userDataForChat = []
            this.removeUsersFromFindFriends = []
            this.showFindFriends = false
            this.currentChat = false
        }
    },
    persist: true
})