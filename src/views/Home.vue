<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api/axios.js';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const zadaci = ref([]);
const kategorije = ref([]);
const category_id = ref('');
const location = ref('');
const start_date = ref('');
const zadatak = ref(null);
const odabranZadatak = ref(null);
const boxUspjeh = ref('');
const boxError = ref('');
const formaError = ref('');
const formaUspjeh = ref('');
const prijavljeniVolonteri = ref([]);
const jePrijavljen = ref(false)

const trenutniUser = JSON.parse(localStorage.getItem('user') || '{}');
const jeUdruga = computed(() => trenutniUser.role === 'udruga');

const noviZadatakForma = ref({
  title: '',
  category_id: '',
  description: '',
  location: '',
  start_date: '',
  end_date: '',
  start_time: '',
  max_volunteers: '',
  is_urgent: false
});

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
const otvoriBox = async(id) => {
    boxUspjeh.value = '';
    boxError.value = '';
    prijavljeniVolonteri.value = [];
    try {
        const response = await api.get(`/zadaci/zadatak/${id}`);
        odabranZadatak.value = response.data;
        if(jeUdruga.value) {
            const prijavljeniResponse = await api.get(`/udruga/zadatak/${id}/prijavljeni`);
            prijavljeniVolonteri.value = prijavljeniResponse.data;
        }
        if(!jeUdruga.value && localStorage.getItem('token')) {
          try {
              const response = await api.get(`/zadacivolonteri/provjera/${id}`)
              jePrijavljen.value = response.data.prijavljen;
          } catch {
              jePrijavljen.value = false
          }
      }
    } catch (err) {
        console.error(err);
    }
}
const zatvoriBox = () => {
    odabranZadatak.value = null;
    boxUspjeh.value = '';
    boxError.value = '';
}
const prijaviSe = async() => {
    try {
      await api.post(`/zadacivolonteri/prijava/${odabranZadatak.value.id}`);

      const prijavljeniResponse = await api.get(`/udruga/zadatak/${odabranZadatak.value.id}`);
      prijavljeniVolonteri.value = prijavljeniResponse.data;

      if (!jeUdruga.value && localStorage.getItem('token')) {
        try {
          const response = await api.get(`/zadacivolonteri/provjera/${id}`);
          jePrijavljen.value = response.data.prijavljen;
        } catch {
            jePrijavljen.value = false;
          }
      }
    } catch (err) {
        boxError.value = err.response?.data?.message || 'Greška pri prijavi na zadatak';
    }
}
const dodajZadatak = async() => {
  formaError.value = '';
  formaUspjeh.value = '';
  try {
    await api.post('/zadaci/novi', noviZadatakForma.value);
    formaUspjeh.value = 'Uspješno dodan novi zadatak';
    noviZadatakForma.value = {
      title: '',
      category_id: '',
      description: '',
      location: '',
      start_date: '',
      end_date: '',
      start_time: '',
      max_volunteers: '',
      is_urgent: false
    };
    await dohvatiZadatke();
  } catch (err) {
    formaError.value = err.response?.data?.message || 'Greška pri dodavanju zadatka';
  }
}
const otvoriProfil = (id) => {
  router.push(`/volonter/${id}`);
}
const otvoriUdrugu = (id) => {
  router.push(`/udruga/${id}`);
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

      <div v-if="jeUdruga" class="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 class="text-lg font-bold text-blue-950 mb-5">Dodaj novi zadatak</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Naziv zadatka</label>
            <input v-model="noviZadatakForma.title" type="text" 
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategorije</label>
            <select v-model="noviZadatakForma.category_id" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" >
              <option value="">Odaberi kategoriju</option>
              <option v-for="kat in kategorije" :key="kat.id" :value="kat.id">{{ kat.name }}</option>
            </select>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Opis</label>
          <textarea v-model="noviZadatakForma.description" rows="3" 
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Lokacija</label>
            <input v-model="noviZadatakForma.location" type="text" 
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Maksimalno volontera</label>
            <input v-model="noviZadatakForma.max_volunteers" type="number" 
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"/>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Datum početka</label>
            <input v-model="noviZadatakForma.start_date" type="date"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Datum završetka</label>
            <input v-model="noviZadatakForma.end_date" type="date"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Vrijeme početka</label>
            <input v-model="noviZadatakForma.start_time" type="time" 
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
          </div>
        </div>
        <div class="flex items-center gap-3 mb-5">
          <input v-model="noviZadatakForma.is_urgent" type="checkbox" id="urgent" class="w-4 h-4" />
          <label for="urgent" class="text-sm text-gray-700">Hitan zadatak</label>
        </div>

        <p v-if="formaUspjeh" class="text-green-600 text-sm mb-3">{{ formaUspjeh }}</p>
        <p v-if="formaError" class="text-red-500 text-sm mb-3">{{ formaError }}</p>

        <button @click="dodajZadatak" class="w-full bg-blue-950 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition">
          Dodaj zadatak
        </button>
    </div>

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
            <span @click="otvoriUdrugu(zadatak.organization_user_id)" class="border border-amber-300 bg-amber-50 rounded-xl px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer hover:underline">
              {{ zadatak.organization_name }}
            </span>
            <button @click="otvoriBox(zadatak.id)" class="bg-blue-950 text-white text-sm px-5 py-2 rounded-xl hover:bg-blue-900 transition">
              Detalji
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="odabranZadatak" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="zatvoriBox"></div>
      <div class="relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg mx-4 z-10">
        <button @click="zatvoriBox" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
        <div class="flex justify-between items-start mb-3">
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                {{ odabranZadatak.category_name || 'Ostalo' }}
            </span>
            <span v-if="odabranZadatak.is_urgent"
                class="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600">
                Hitno
            </span>
        </div>

        <h2 class="text-2xl font-bold text-blue-950 mb-2">{{ odabranZadatak.title }}</h2>
        <p class="text-gray-500 text-sm mb-5">{{ odabranZadatak.description }}</p>

        <div class="flex flex-col gap-2 text-sm text-gray-500 mb-5">
            <span>📍 {{ odabranZadatak.location }}</span>
            <span>📅 {{ new Date(odabranZadatak.start_date).toLocaleDateString('hr-HR') }} - {{ new Date(odabranZadatak.end_date).toLocaleDateString('hr-HR') }}</span>
            <span v-if="odabranZadatak.start_time">🕐 {{ odabranZadatak.start_time }}</span>
            <span v-if="odabranZadatak.max_volunteers">👥 Maksimalno volontera: {{ odabranZadatak.max_volunteers }}</span>  
              <span v-if="odabranZadatak.max_volunteers">Preostalo mjesta: {{ odabranZadatak.max_volunteers - odabranZadatak.applications_count }}</span>
            <span>🏢 {{ odabranZadatak.organization_name }}</span>
        </div>

        <p v-if="boxUspjeh" class="text-green-600 text-sm mb-3">{{ boxUspjeh }}</p>
        <p v-if="boxError" class="text-red-500 text-sm mb-3">{{ boxError }}</p>

        <div v-if="jeUdruga">
          <h4 class="font-semibold text-blue-950 mb-3">Prijavljeni volonteri</h4>
          <div v-if="prijavljeniVolonteri.length === 0" class="text-gray-400 text-sm">
            Nema prijavljenih volontera
          </div>
          <div v-for="volonter in prijavljeniVolonteri" :key="volonter.email" @click="otvoriProfil(volonter.id)" 
            class="border border-gray-100 rounded-xl p-3 mb-2 cursor-pointer hover:bg-gray-50">
            <p class="font-semibold text-sm text-blue-950">{{ volonter.name }} {{ volonter.surname }}</p>
            <p class="text-xs text-gray-400">{{ volonter.email }}</p>
            <span class="text-xs px-2 py-1 rounded-full" 
              :class="volonter.status === 'potvrden' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
              {{ volonter.status }}
            </span>>
          </div>
        </div>
        <button v-if="jePrijavljen && !jeUdruga" disabled class="w-full bg-green-500 text-white py-3 rounded-xl font-semibold cursor-not-allowed">
            Prijavljen
        </button>
        <button v-else-if="!jeUdruga" @click="prijaviSe" class="w-full bg-blue-950 text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition">
            Prijavi se
        </button>
    </div>
  </div>
</template>