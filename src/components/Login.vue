<template>
  <div>
    <div class="text-center text-4xl text-gray-700 font-light pb-10">Login</div>
    <div class="text-gray-700 font-light pb-2">Email</div>
    <input
      v-model="email"
      type="text"
      class="w-full border border-gray-300 rounded-md p-3"
      placeholder="Enter your email"
      :class="{ 'border-red-500': !isEmailValid }"
    />
    <div class="text-gray-700 font-light pb-2 pt-4">Password</div>
    <input
      v-model="password"
      type="password"
      class="w-full border border-gray-300 rounded-md p-3"
      placeholder="Enter your password"
      :class="{ 'border-red-500': !isPasswordValid }"
    />
    <button
      @click="login"
      class="w-full bg-[#25D366] text-white rounded-md p-3 mt-4"
    >
      Login
    </button>
  </div>
</template>
<script setup>
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const emit = defineEmits(['login']);
const userStore = useUserStore();
const router = useRouter();
let email = ref('');
let password = ref('');

let isEmailValid = ref(true);
let isPasswordValid = ref(true);

const emailPattren = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
// const emailPattren = /[a-zA-Z]+@gmail\.[a-zA-Z]+/;
const verifyEmail = () => {
  return emailPattren.test(email.value);
};
const verifyPassword = () => {
  return password.value.length > 6;
};
const login = async () => {
  isEmailValid.value = true;
  isPasswordValid.value = true;
  // console.log('login');
  if (email.value === '' || password.value === '') {
    alert('Please enter email and password');
    return;
  }
  isEmailValid.value = await userStore.checkIfNormalUserExists(email.value);
  if (isEmailValid.value) {
    isPasswordValid.value = await userStore.authenticateUser(
      email.value,
      password.value
    );
    if (isPasswordValid.value) {
      setTimeout(() => {
        router.push('/');
      }, 200);
    } else {
      alert('Invalid password');
    }
  } else {
    alert('User does not exist, Please register');
  }
};
</script>
