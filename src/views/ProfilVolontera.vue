<script setup>
import api from '@/api/axios.js';
import { ref, onMounted, computed, h } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const profil = ref(null);
const povijest = ref([]);
const recenzije = ref([]);
const error = ref('');
const uspjeh = ref('');
const razina = ref(false);
const uredi = ref(false);

const trenutniUser = JSON.parse(localStorage.getItem('user') || '{}');
const jeVlastiti = computed(() => profil.value?.user_id === trenutniUser.id);

const forma = ref({
    name: '',
    surname: '',
    bio: '',
    location: '',
    phone: '',
    profile_image: ''
});

onMounted(async() => {
    await dohvatiProfil();
    await dohvatiPovijest();
    await dohvatiRecenzije();
})

const dohvatiProfil = async() => {
    try {
        const response = await api.get(`/volonter/profil/${route.params.id}`);
        profil.value = response.data;
        forma.value = {
            name: profil.value.name || '',
            surname: profil.value.surname || '',
            bio: profil.value.bio || '',
            location: profil.value.location || '',
            phone: profil.value.phone || '',
            profile_image: profil.value.profile_image || ''
        }
    } catch (err) {
        console.error(err);
    }
}
const dohvatiPovijest = async() => {
    try {
        const response = await api.get('/volonter/profil/povijest');
        povijest.value = response.data;
    } catch (err) {
        console.error(err);
    }
} 
const dohvatiRecenzije = async() => {
    try {
        const response = await api.get(`/recenzije/all/${profil.value.id}`);
        recenzije.value = response.data;
    } catch (err) {
        console.error(err);
    }
}
const spremiProfil = async() => {
    try {
        await api.put('/volonter/profil', forma.value);
        uspjeh.value = 'Profil uspješno ažuriran';
        uredi.value = false;
        await dohvatiProfil();
    } catch (err) {
        error.value = err.response?.data?.message || 'Greška pri ažuriranju profila';
    }
}
</script>
<template>
    <div class="min-h-screen bg-gray-50 px-8 py-10">
        <div v-if="profil" class="max-w-6xl mx-auto flex gap-6">
            <div class="w-64 shrink-0">
                <div class="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
                    <div class="w-45 h-45">
                        <img v-if="profil.profile_image" :src="profil.profile_image" class="w-full h-full object-cover rounded-full" />
                    </div>
                    <h5 class="text-lg font-bold text-blue-950 mt-3">{{ profil.name }} {{ profil.surname }}</h5>
                    <span class="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 mt-2">{{ profil.badge_level }}</span>
                    <div class="w-full border-t border-gray-100 pt-4 flex flex-col gap-2 text-sm space-y-1">
                        <hr class="border-gray-300">
                        <p v-if="profil.location" class="italic"><span class="font-medium">Lokacija:</span> {{ profil.location }}</p>
                        <p v-if="profil.phone" class="italic"><span class="font-medium">Phone:</span> {{ profil.phone }}</p>
                        <hr class="border-gray-300">
                    </div>
                    <p v-if="profil.bio" class="mt-4 text-sm w-full">{{ profil.bio }}</p>  
                    <button v-if="jeVlastiti" @click="uredi = !uredi"
                        class="mt-5 w-full bg-blue-950 text-white py-2 rounded-xl text-sm hover:bg-blue-900 transition">
                        {{ uredi ? 'Odustani' : 'Uredi profil' }}
                    </button>                  
                </div>
            </div>
            <div class="flex-1"></div>
            <div class="w-48 shrink-0"></div>
        </div>
    </div>
</template>