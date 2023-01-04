<template>
  <div class="w-full">
    <div class="bg-teal-600 z-[-1] w-full h-[225px] fixed top-0"></div>
    <div
      class="bg-[#191919] z-[-1] w-full h-[calc(100vh-225px)] fixed bottom-0"
    ></div>

    <div class="max-w-xl mx-auto">
      <div class="mt-10 flex items-center w-full">
        <img width="40" src="whatsapp-logo.png" alt="" />
        <div class="font-semibold text-gray-100 ml-6">WHATSAPP WEB</div>
      </div>

      <div class="bg-white rounded-md z-10 px-20 pt-10 pb-10 m-6 mt-10">
        <div>
          <Signup v-if="showSignup"/>
          <Login v-else @login="login" />
          <div class="pt-2">
            <div v-if="showSignup">
              Already have an account?
              <span @click="showSignup = false">Login</span>
            </div>
            <div v-else>
              Dont have an account?
              <span @click="showSignup = true">Signup</span>
            </div>
          </div>
          <div class="text-gray-700 font-light pb-2 pt-4 my-2 text-center">
            or continue with google
          </div>
        </div>
        <div class="w-full flex justify-center bg-[#191919] p-3 rounded-md">
          <GoogleLogin :callback="callback" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Login from '@/components/Login.vue';
import Signup from '@/components/Signup.vue';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
const userStore = useUserStore();
const router = useRouter();
let showSignup = ref(false);

const login = (email, password) => {
  console.log(email, password);
};

const callback = async (response) => {
  // console.log(response);
  await userStore.getUserDetailsFromGoogle(response);
  setTimeout(() => {
    router.push('/');
  }, 200);
};
</script>

<style lang="scss" scoped></style>
