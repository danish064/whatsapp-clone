<template>
  <div :class="isActive ? 'bg-gray-200' : ''">
    <div class="flex w-full px-4 py-3 items-center cursor-pointer">
      <img class="rounded-full mr-4 w-12" :src="chat?.user?.picture || ''" />

      <div class="w-full">
        <div class="flex justify-between items-center">
          <div class="text-[15px] text-gray-600">
            {{ chat.user.firstName }}
          </div>
          <div class="text-[12px] text-gray-600">
            {{ lastCreatedAt(chat) }}
          </div>
        </div>

        <div class="flex items-center">
          <CheckAllIcon
            v-if="chat.messages[chat.messages.length - 1].uid === uid"
            :size="18"
            :fillColor="tickColor(chat)"
            class="mr-1"
          />
          <div
            class="text-[15px] w-full text-gray-500 flex items-center justify-between"
          >
            {{ lastChatMessage(chat) }}...
          </div>
        </div>
      </div>
    </div>

    <div class="border-b w-[calc(100%-80px)] float-right"></div>
  </div>
</template>

<script setup>
import CheckAllIcon from "vue-material-design-icons/CheckAll.vue";
import { toRefs, computed } from "vue";
import moment from "moment";
import { useUserStore } from "../store/user-store";
import { storeToRefs } from "pinia";
const userStore = useUserStore();
const { uid, userDataForChat } = storeToRefs(userStore);

const props = defineProps({ chat: Object });
const { chat } = toRefs(props);

const isActive = computed(() => {
  if (userDataForChat.value.length) {
    if (userDataForChat.value[0].uid1 === chat.value.user.uid) {
      return true;
    }
    if (userDataForChat.value[0].uid2 === chat.value.user.uid) {
      return true;
    }
  }
  return false;
});

const tickColor = (chat) => {
  let color = "";
  // #7DF9FF - READ
  // #B5B5B5 - UNREAD

  // If the user is the sender
  // if (chat.uid1 === uid.value) {
  //   if (chat.user2HasViewed) color = "#7DF9FF";
  //   else color = "#B5B5B5";
  // }
  // // If the user is the receiver
  // if (chat.uid2 === uid.value) {
  //   if (chat.user1HasViewed) color = "#7DF9FF";
  //   else color = "#B5B5B5";
  // }
  // return color;

  if (chat.messages.length) {
    // If the user is the sender
    if (chat.messages[chat.messages.length - 1].uid === uid.value) {
      if (chat.user2HasViewed) {
        color = "#7DF9FF";
      } else {
        color = "#B5B5B5";
      }
    }
    // If the user is the receiver
    else {
      if (chat.user1HasViewed) {
        color = "#7DF9FF";
      } else {
        color = "#B5B5B5";
      }
    }
  }
};

const lastChatMessage = (chat) => {
  return chat.messages[chat.messages.length - 1].message.substring(0, 20);
};

const lastCreatedAt = (chat) => {
  if (chat.messages.length) {
    return moment(chat.messages[chat.messages.length - 1].createdAt).format(
      "MMM D YY | HH:MM A"
    );
  }
};
</script>
