<script setup>
import api from '@/api/axios.js';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const logiranUser = ref(false);
const user = ref(null);

const checkAuth = async() => {
  const token = localStorage.getItem('token');
  if(!token) {
    logiranUser.value = false;
    user.value = null;
    return;
  }
  try {
    const response = await api.get('/users/trenutniUser');
    user.value = response.data;
    logiranUser.value = true;
  } catch (error) {
    logout()
  }
}
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  logiranUser.value = false;
  user.value = null;
  router.push('/login');
}
onMounted(() => {
  checkAuth();
  window.addEventListener('login', checkAuth);
})
onBeforeUnmount(() => {
  window.removeEventListener('login', checkAuth);
})
router.afterEach(() => {
  checkAuth();
})
</script>

<template>
    <nav class="fixed top-0 left-0 right-0 z-50 bg-blue-950 text-white px-6 py-5 flex justify-between items-center">
      <RouterLink to="/" class="text-xl font-bold text-white">VoluNet</RouterLink>
      <div class="flex items-center">
        <div v-if="!logiranUser" class="flex items-center gap-4">
          <RouterLink to="/login" class="hover:text-gray-300">Login</RouterLink>
        </div>
        <div v-else-if="user?.role === 'volonter'" class="flex items-center gap-4">
          <RouterLink :to="{ name: 'profilVolontera', params: { id: user?.id } }" class="hover:text-gray-300">Profil</RouterLink>
          <button @click="logout" class="hover:text-gray-300">Logout</button>
        </div>

        <div v-else-if="user?.role === 'udruga'" class="flex items-center gap-4">
          <RouterLink :to="{ name: 'profilUdruge', params: { id: user?.id } }" class="hover:text-gray-300">Profil</RouterLink>
          <button @click="logout" class="hover:text-gray-300">Logout</button>
        </div>

        <div v-else-if="user?.role === 'admin'" class="flex items-center gap-4">
          <RouterLink to="/admin" class="hover:text-gray-300">Admin</RouterLink>
          <button @click="logout" class="hover:text-gray-300">Logout</button>
        </div>
      </div>
  </nav>
</template>