<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import api from '@/api/axios.js';

const router = useRouter();
const ime = ref('');
const prezime = ref('');
const email = ref('');
const password = ref('');
const potvrdaLozinke = ref('');
const role = ref('');
const naziv = ref('');
const error = ref('');

const registracija = async() => {
    error.value = '';
    if(password.value !== potvrdaLozinke.value) {
        error.value = 'Lozinke se ne podudaraju'
        return;
    }
    if(password.value.length < 6) {
        error.value = 'Lozinka mora imati najmanje 6 znakova';
        return;
    }
    try {
        const payload = {
            email: email.value,
            password: password.value,
            role: role.value
        }
        if(role.value === 'volonter') {
            payload.ime = ime.value;
            payload.prezime = prezime.value;
        } else if(role.value === 'udruga') {
            payload.naziv = naziv.value;
        }
        const response = await api.post('/auth/registracija', payload);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.push('/');
    } catch (err) {
        error.value = err.response?.data?.poruka || 'Greška pri registraciji';
    }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-10">
    <div class="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">

      <h2 class="text-2xl font-bold text-blue-950 mb-1 text-center">Kreirajte račun</h2>
      <p class="text-gray-400 text-sm mb-8 text-center">Pridružite se Volunet zajednici</p>

      <div class="flex gap-3 mb-6">
        <button @click="role = 'volonter'" :class="role === 'volonter' ? 'bg-blue-950 text-white' : 'bg-gray-100 text-gray-600'"
          class="flex-1 py-2 rounded-xl text-sm font-semibold transition">
          Volonter
        </button>
        <button @click="role = 'udruga'" :class="role === 'udruga' ? 'bg-blue-950 text-white' : 'bg-gray-100 text-gray-600'"
          class="flex-1 py-2 rounded-xl text-sm font-semibold transition">
          Udruga
        </button>
      </div>

      <template v-if="role === 'volonter'">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Ime</label>
          <input v-model="ime" type="text" placeholder="Vaše ime"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Prezime</label>
          <input v-model="prezime" type="text" placeholder="Vaše prezime"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
        </div>
      </template>

      <template v-if="role === 'udruga'">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Naziv udruge</label>
          <input v-model="naziv" type="text" placeholder="Naziv vaše udruge"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
        </div>
      </template>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input v-model="email" type="email" placeholder="vas@email.com"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Lozinka</label>
        <input v-model="password" type="password" placeholder="••••••••"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Potvrda lozinke</label>
        <input v-model="potvrdaLozinke" type="password" placeholder="••••••••"
          class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
      </div>

      <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

      <button @click="registracija" class="w-full bg-blue-950 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition">
        Registracija
      </button>

      <p class="text-center text-sm text-gray-400 mt-6">
        Već imate račun?
        <router-link to="/login" class="text-blue-950 font-semibold hover:underline">Prijavite se</router-link>
      </p>
    </div>
  </div>
</template>