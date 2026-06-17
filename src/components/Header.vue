<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const isLoggedIn = computed(() => !!localStorage.getItem('token'))

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
    <nav class="fixed top-0 left-0 right-0 z-50 bg-blue-950 text-white px-6 py-5 flex justify-between items-center">
    <router-link to="/" class="text-xl font-bold text-white">VoluNet</router-link>

    <div class="flex gap-4 items-center">
      <template v-if="!isLoggedIn">
        <router-link to="/login" class="hover:text-white">Login</router-link>
      </template>

      <template v-else>
        <router-link to="/moj-profil" class="hover:text-white">Profil</router-link>
        <button @click="logout" class="hover:text-gray-300">Logout</button>
      </template>
    </div>
  </nav>
</template>