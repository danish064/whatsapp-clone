<template>
    <div 
        id="Messages" 
        class="pt-1 z-0 overflow-auto fixed h-[calc(100vh-100px)] w-[420px]"
    >
        <div v-for="chat in chats" :key="chat">
        <div @click="openChat(chat)">
            <MessageRowComponent :chat="chat"/>
        </div>
        </div>
    </div>
</template>

<script setup>
import { useUserStore } from '@/store/user-store'
import MessageRowComponent from '@/components/MessageRowComponent.vue';
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue';
const userStore = useUserStore()
const { chats, userDataForChat, uid } = storeToRefs(userStore)

onMounted(async () => {
    if (userDataForChat.value.length) {
        await userStore.getChatById(userDataForChat.value[0].id)
    }
})

const openChat = async (chat) => {
    userDataForChat.value = []
    userDataForChat.value.push({
        id: chat.id,
        uid1: chat.uid1,
        uid2: chat.uid2,
        firstName: chat.user.firstName,
        picture: chat.user.picture,
    })
    try {
        await userStore.getChatById(chat.id)
        let data = {
            id: chat.id,
            key1: 'user1HasViewed', val1: false, 
            key2: 'user2HasViewed', val2: false, 
        }
        if (chat.uid1 === uid.value) {
            data.val1 = true
            data.val2 = true
        } else if (chat.uid2 === uid.value) {
            data.val1 = true
            data.val2 = true
        }
        await userStore.hasReadMessage(data)
    } catch (error) {
        console.log(error)
    }
}
</script>

<style lang="scss" scoped>

</style>