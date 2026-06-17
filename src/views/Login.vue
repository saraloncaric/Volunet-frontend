<script setup>
import api from '@/api/axios.js';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');

const login = async() => {
    error.value = '';
    try {
        const response = await api.post('/auth/login',
            { 
                email: email.value,
                password: password.value
            }
        );
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.push('/');
    } catch (err) {
        error.value = 'err.response?.data?.message' || 'Greška pri prijavi';
    }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
      
      <h2 class="text-2xl font-bold text-blue-950 mb-1 text-center">Dobrodošli nazad</h2>
      <p class="text-gray-400 text-sm mb-8 text-center">Prijavite se na svoj račun</p>

      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input v-model="email" type="email" placeholder="vas@email.com"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
      </div>

      <div class="mb-8">
        <label class="block text-sm font-medium text-gray-700 mb-1">Lozinka</label>
        <input v-model="password" type="password" placeholder="••••••••"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
      </div>

      <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

      <button @click="login" class="w-full bg-blue-950 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition" >
        Prijava
      </button>

      <p class="text-center text-sm text-gray-400 mt-6">
        Nemate račun? 
        <router-link to="/register" class="text-blue-950 font-semibold hover:underline">Registrirajte se</router-link>
      </p>
    </div>
  </div>
</template>