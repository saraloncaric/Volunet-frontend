<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';

const zadaci = ref([]);
const kategorije = ref([]);
const category_id = ref('');
const location = ref('');
const start_date = ref('');

onMounted(async () => {
    await dohvatiZadatke();
    await dohvatiKategorije();
});

const dohvatiZadatke = async() => {
    try {
        const response = await api.get('/zadaci/all');
        zadaci.value = response.data;
    } catch (err) {
        console.error(err);
    }
}
const dohvatiKategorije = async() => {
    try {
        const response = await api.get('/zadaci/kategorije');
        kategorije.value = response.data;
    } catch (err) {
        console.error(err);
    }
}
const filtrirajZadatke = async() => {
    try {
        const response = await api.get('/zadaci/filter', {
            params: {
                category_id: category_id.value || undefined,
                location: location.value || undefined,
                start_date: start_date.value || undefined
            }
        });
        zadaci.value = response.data;
    } catch (err) {
        console.error(err);
    }
}
const resetFilter = () => {
    category_id.value = '';
    location.value = '';
    start_date.value = '';
    dohvatiZadatke();
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex gap-6 px-8 py-8">

    <div class="w-64 shrink-0">
      <div class="bg-white rounded-2xl shadow p-6 sticky top-20">
        <h3 class="font-bold text-blue-950 text-lg mb-5">Filter</h3>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Kategorija</label>
          <select v-model="category_id"
            class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950">
            <option value="">Sve kategorije</option>
            <option v-for="kat in kategorije" :key="kat.id" :value="kat.id">
              {{ kat.name }}
            </option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Lokacija</label>
          <input v-model="location" type="text" placeholder="npr. Zagreb"
            class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Datum od</label>
          <input v-model="start_date" type="date"
            class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
        </div>

        <button @click="filtrirajZadatke"
          class="w-full bg-blue-950 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-900 transition mb-2">
          Filtriraj
        </button>
        <button @click="resetFilter"
          class="w-full bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
          Ukloni filter
        </button>
      </div>
    </div>

    <div class="flex-1">
      <h2 class="text-2xl font-bold text-blue-950 mb-6">Dostupni zadaci</h2>

      <div v-if="zadaci.length === 0" class="text-gray-400 text-sm">
        Nema dostupnih zadataka.
      </div>

      <div class="flex flex-col gap-4">
        <div v-for="zadatak in zadaci" :key="zadatak.id"
          class="bg-white rounded-2xl shadow p-6 hover:shadow-md transition">

          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold px-3 py-1 rounded-full"
              :class="zadatak.category_name ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'">
              {{ zadatak.category_name || 'Ostalo' }}
            </span>
            <span v-if="zadatak.is_urgent"
              class="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600">
              Hitno
            </span>
          </div>

          <h3 class="text-lg font-bold text-blue-950 mb-1">{{ zadatak.title }}</h3>
          <p class="text-gray-500 text-sm mb-4 line-clamp-2">{{ zadatak.description }}</p>

          <div class="flex items-center gap-4 text-xs text-gray-400 mb-4">
            <span>📍 {{ zadatak.location }}</span>
            <span>📅 {{ new Date(zadatak.start_date).toLocaleDateString('hr-HR') }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">{{ zadatak.organization_name }}</span>
            <router-link :to="`/zadatak/${zadatak.id}`"
              class="bg-blue-950 text-white text-sm px-5 py-2 rounded-xl hover:bg-blue-900 transition">
              Detalji
            </router-link>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>