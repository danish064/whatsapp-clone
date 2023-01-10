<template>
  <div v-if="!isSentMessage" class="flex w-[calc(100%-50px)]">
    <div class="inline-block bg-white p-2 rounded-md my-1">
      {{ message.message }}

      <span class="text-xs text-end pl-2 text-gray-400">
        {{
          new Date(message.createdAt).toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })
        }}
      </span>
    </div>
  </div>

  <div
    v-else
    class="flex justify-end space-x-1 w-[calc(100%-50px)] float-right"
  >
    <div class="inline-block bg-green-200 p-2 rounded-md my-1">
      {{ message.message }}

      <span class="text-xs pl-2 text-gray-400">
        {{
          new Date(message.createdAt).toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })
        }}
      </span>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({ message: Object, isSentMessage: Boolean });
</script>
