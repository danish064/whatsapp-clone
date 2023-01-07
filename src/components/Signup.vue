<template>
  <div>
    <div class="text-center text-4xl text-gray-700 font-light pb-10">
      Signup
    </div>
    <div class="text-gray-700 font-light pb-2 pt-4">Name</div>
    <div class="flex">
      <input
        v-model="firstName"
        type="text"
        class="w-40 border border-gray-300 rounded-md p-3 mr-auto"
        placeholder="First Name"
      />
      <input
        v-model="lastName"
        type="text"
        class="w-40 border border-gray-300 rounded-md p-3"
        placeholder="Last Name"
      />
    </div>
    <div class="text-gray-700 font-light pb-2 pt-4">Email</div>
    <input
      v-model="email"
      type="text"
      class="w-full border border-gray-300 rounded-md p-3"
      placeholder="Enter your email"
    />
    <div class="text-gray-700 font-light pb-2 pt-4">Password</div>
    <input
      v-model="password"
      type="password"
      class="w-full border border-gray-300 rounded-md p-3"
      placeholder="Enter your password"
    />
    <div class="text-gray-700 font-light pb-2 pt-4">Confirm Password</div>
    <input
      v-model="confirmPassword"
      type="password"
      class="w-full border border-gray-300 rounded-md p-3"
      placeholder="Enter your password"
    />

    <button
      @click="signup"
      class="w-full bg-[#25D366] text-white rounded-md p-3 mt-4"
    >
      Signup
    </button>
  </div>
</template>
<script setup>
import { useUserStore } from "@/store/user-store";
import { useRouter } from "vue-router";
import { ref } from "vue";

const emit = defineEmits(["signup"]);
const userStore = useUserStore();
const router = useRouter();
let email = ref("");
let password = ref("");
let firstName = ref("");
let lastName = ref("");
let confirmPassword = ref("");

const emailPattren = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
// const emailPattren = /[a-zA-Z]+@gmail\.[a-zA-Z]+/;
const verifyEmail = () => {
  return emailPattren.test(email.value);
};
const verifyPassword = () => {
  return password.value.length > 6;
};
const signup = async () => {
  if (
    email.value === "" ||
    password.value === "" ||
    firstName.value === "" ||
    lastName.value === "" ||
    confirmPassword.value === ""
  ) {
    alert("Please fill all the fields");
    return;
  }
  if (password.value !== confirmPassword.value) {
    alert("Passwords don't match");
    return;
  }
  if (verifyEmail()) {
    if (await userStore.checkIfNormalUserExists(email.value)) {
      alert("User already exists");
      return;
    } else {
      let userCreated = false;
      userCreated = await userStore.saveUserDetails(
        {
          email: email.value,
          password: password.value,
          firstName: firstName.value,
          lastName: lastName.value,
        },
        false
      );
      if (userCreated) {
        alert("Signup successful");
        router.push("/login");
      } else {
        alert("Signup failed");
      }
    }
  } else {
    alert("Please enter a valid email");
    return;
  }
};
</script>
