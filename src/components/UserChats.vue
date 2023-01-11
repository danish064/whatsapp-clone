<template>
  <div class="pt-1 overflow-auto">
    <div class="flex justify-between items-center px-5 py-2">
      <div class="text-gray-400">Chats</div>
      <span
        @click="
          () => {
            userStore.userDataForChat = [];
            userStore.currentChat = [];
          }
        "
        class="text-slate-400 hover:text-slate-700 cursor-pointer"
        >X</span
      >
    </div>
    <div v-for="chat in chats" :key="chat" @click="openChat(chat)">
      <MessageRowComponent :chat="chat" />
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user-store';
import MessageRowComponent from '@/components/MessageRowComponent.vue';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
const userStore = useUserStore();
const { chats, userDataForChat, uid } = storeToRefs(userStore);

onMounted(async () => {
  if (userDataForChat.value.length) {
    await userStore.getChatById(userDataForChat.value[0].id);
  }
});

const openChat = async (chat) => {
  if (userDataForChat.value.id == chat.id) return;

  userDataForChat.value = [];
  userDataForChat.value.push({
    id: chat.id,
    uid1: chat.uid1,
    uid2: chat.uid2,
    firstName: chat.user.firstName,
    picture: chat.user.picture,
  });
  try {
    await userStore.getChatById(chat.id);
    let data = {
      id: chat.id,
      user1HasViewed: false,
      user2HasViewed: false,
    };
    if (chat.uid1 === uid.value) {
      data.user1HasViewed = true;
      data.user2HasViewed = false;
    } else if (chat.uid2 === uid.value) {
      data.user1HasViewed = false;
      data.user2HasViewed = true;
    }
    await userStore.hasReadMessage(data);
  } catch (error) {
    console.log(error);
  }
};
</script>

<style lang="scss" scoped></style>
