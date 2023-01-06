<template>
  <div id="FindFriends" class="pt-[100px] overflow-auto fixed h-[100vh] w-full">
    <div class="px-5 text-gray-400">Find new friend</div>
    <div v-for="user in usersComputed" :key="user">
      <div
        v-if="hideMe(user)"
        @click="createNewChat(user)"
        class="flex w-full p-4 items-center cursor-pointer"
      >
        <img class="rounded-full mr-4 w-12" :src="user.picture || ''" />

        <div class="w-full">
          <div class="flex justify-between items-center">
            <div class="text-[15px] text-gray-600">
              {{ user.firstName }} {{ user.lastName }}
            </div>
          </div>
          <div class="flex items-center">
            <div class="text-[15px] text-gray-500">Hi, I'm using WhatsApp!</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useUserStore } from '@/store/user-store';
import { storeToRefs } from 'pinia';
const userStore = useUserStore();
const { uid, userDataForChat, allUsers, removeUsersFromFindFriends } =
  storeToRefs(userStore);
let users = ref([]);

const hideMe = (user) => {
  if (user.uid === uid.value) {
    return false;
  }
  return true;
};

const createNewChat = (user) => {
  userDataForChat.value = [];
  userDataForChat.value.push({
    id: '',
    uid1: uid.value,
    uid2: user.uid,
    firstName: user.firstName,
    picture: user.picture,
  });
};

const usersComputed = computed(() => {
  allUsers.value.forEach((user) => users.value.push(user));
  removeUsersFromFindFriends.value.forEach((remove) => {
    let index = users.value.findIndex((user) => user.uid === remove);
    users.value.splice(index, 1);
  });
  return users.value;
});
</script>

<style lang="scss" scoped></style>
