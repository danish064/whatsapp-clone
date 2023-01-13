<template>
  <div class="flex">
    <div id="Header" class="fixed w-[420px] z-10">
      <div
        class="bg-[#F0F0F0] w-full flex justify-between items-center px-3 py-3"
      >
        <img
          class="rounded-full ml-1 w-10 h-10"
          :src="userStore.picture || ''"
          alt=""
        />
        <div>{{ userStore.firstName }} {{ userStore?.lastName }}</div>
        <div class="flex items-center justify-center">
          <!-- fillColor="#515151" -->
          <AccountGroupIcon
            :fillColor="userStore.showFindFriends ? '#59900' : '#515151'"
            @click="userStore.showFindFriends = !userStore.showFindFriends"
            class="mr-6"
          />
          <DotsVerticalIcon
            @click="logout"
            fillColor="#515151"
            class="cursor-pointer"
          />
        </div>
      </div>
      <div id="Search" class="bg-white w-full px-2 border-b shadow-sm">
        <div
          class="px-1 m-2 bg-[#F0F0F0] flex items-center justify-center rounded-md"
        >
          <MagnifyIcon fillColor="#515151" :size="18" class="ml-2" />
          <!-- @click="showFindFriends = !showFindFriends" -->
          <input
            class="ml-5 apperance-none w-full bg-[#F0F0F0] py-1.5 px-2.5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder:text-sm placeholder:text-gray-500"
            autocomplete="off"
            type="text"
            placeholder="Start a new chat"
          />
        </div>
      </div>
    </div>
    <div v-if="showFindFriends">
      <FindFriends class="pt-28" />
    </div>
    <div v-else>
      <UserChats class="mt-[100px]" />
    </div>

    <div v-if="userDataForChat.length">
      <CurrentChat />
    </div>
    <div v-else>
      <div
        class="ml-[420px] fixed w-[calc(100vw-420px)] h-[100vh] bg-gray-100 text-center"
      >
        <div class="grid h-screen place-items-center">
          <div>
            <div class="w-full flex items-center justify-center">
              <chaticon />
            </div>
            <div class="text-[32px] text-gray-500 font-light mt-10">
              Buzz Chat
            </div>
            <div class="text-[14px] text-gray-600 mt-2">
              <div>
                It's very lonley here... start a chat maybe??
              </div>
              <div>
                <!-- Send and receive messages with other people online. -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import UserChats from '@/components/UserChats.vue';
import CurrentChat from '@/components/CurrentChat.vue';
import FindFriends from '@/components/FindFriends.vue';
import chaticon from '@/icons/chaticon.vue';

import AccountGroupIcon from 'vue-material-design-icons/AccountGroup.vue';
import DotsVerticalIcon from 'vue-material-design-icons/DotsVertical.vue';
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue';
import { ref, onMounted } from 'vue';

import { useUserStore } from '@/store/user-store';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
const router = useRouter();
const userStore = useUserStore();
const { showFindFriends, userDataForChat } = storeToRefs(userStore);

onMounted(async () => {
  try {
    userStore.getAllUsers();
    await userStore.getAllChatsByUser();
  } catch (error) {
    console.log(error);
  }
});

const logout = () => {
  let res = confirm('Are you sute you want to logout?');
  if (res) {
    userStore.logout();
    router.push('/login');
  }
};
</script>

<style lang="scss" scoped></style>
