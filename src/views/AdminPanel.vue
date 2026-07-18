<script setup>
import api from '@/api/axios.js';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const korisnici = ref([]);
const error = ref('');

onMounted(async() => {
    await dohvatiKorisnike();
});

const dohvatiKorisnike = async() => {
    try {
        const response = await api.get('/users/all');
        korisnici.value = response.data;
    } catch (err) {
        console.error(err);
    }
}
const otvoriProfil = (korisnik) => {
    if(korisnik.role === 'volonter') {
        router.push(`/volonter/${korisnik.volunteer_profile_id}`);
    } else if(korisnik.role === 'udruga') {
        router.push(`/udruga/${korisnik.organization_profile_id}`);
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 px-8 py-10">
        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-2xl shadow p-6">
                <h3 class="text-lg font-semibold text-blue-950 mb-4">Svi korisnici</h3>
                <div class="flex flex-col gap-3">
                    <div v-for="korisnik in korisnici" :key="korisnik.id" @click="otvoriProfil(korisnik)"
                        class="border border-gray-100 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition">
                        <div>
                            <p class="font-semibold text-blue-950">{{ korisnik.email }}</p>
                            <p class="text-xs text-gray-400 mt-1">{{ korisnik.role }} · Registriran: {{ new Date(korisnik.created_at).toLocaleDateString('hr-HR') }}</p>
                        </div>
                        <p class="font-semibold text-blue-950">
                            {{ korisnik.role === 'volonter' ? korisnik.ime + ' ' + korisnik.prezime : korisnik.naziv }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>