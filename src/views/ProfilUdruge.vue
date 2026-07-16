<script setup>
import api from '@/api/axios.js';
import { ref, onMounted, computed, h } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const profil = ref(null);
const zadaci = ref([]);
const odabranZadatak = ref(null);
const prijavljeniVolonteri = ref([]);
const error = ref('');
const uspjeh = ref('');
const uredi = ref(false);
const urediZadatak = ref(false);

const trenutniUser = JSON.parse(localStorage.getItem('user') || '{}');
const jeVlastiti = computed(() => profil.value?.user_id === trenutniUser.id);

const forma = ref({
    name: '',
    description: '',
    location: '',
    website: '',
    phone: '',
    logo_image: '',
    founded_year: ''
})

const formaZadatak = ref({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    start_time: '',
    max_volunteers: '',
    is_urgent: false
})

onMounted(async() => {
    await dohvatiProfil();
    await dohvatiZadatke();
})

const dohvatiZadatke = async() => {
    try {
        const response = await api.get(`/udruga/profil/${route.params.id}/zadaci`);
        zadaci.value = response.data;
    } catch (err) {
        console.error(err);
    }
}
const dohvatiProfil = async() => {
    try {
        const response = await api.get(`/udruga/profil/${route.params.id}`);
        profil.value = response.data;
        forma.value = {
            name: profil.value.name || '',
            description: profil.value.description || '',
            location: profil.value.location || '',
            website: profil.value.website || '',
            phone: profil.value.phone || '',
            logo_image: profil.value.logo_image || '',
            founded_year: profil.value.founded_year || ''
        }
    } catch (err) {
        console.error(err);
    }
}
const spremiPromjene = async() => {
    try {
        await api.put('/udruga/profil', forma.value);
        uspjeh.value = 'Profil uspješno ažuriran';
        uredi.value = false;
        await dohvatiProfil();
    } catch (err) {
        error.value = err.response?.data?.message || 'Greška pri ažuriranju profila';
    }
}
const otvoriZadatak = async(id) => {
    try {
        const response = await api.get(`/udruga/zadatak/${id}`);
        odabranZadatak.value = response.data;
        formaZadatak.value = {
            title: odabranZadatak.value.title || '',
            description: odabranZadatak.value.description || '',
            location: odabranZadatak.value.location || '',
            start_date: odabranZadatak.value.start_date?.split('T')[0] || '',
            end_date: odabranZadatak.value.end_date?.split('T')[0] || '',
            start_time: odabranZadatak.value.start_time || '',
            max_volunteers: odabranZadatak.value.max_volunteers || '',
            is_urgent: odabranZadatak.value.is_urgent || false
        }
        const prijavljeniResponse = await api.get(`/udruga/zadatak/${id}/prijavljeni`);
        prijavljeniVolonteri.value = prijavljeniResponse.data;
    } catch (err) {
        console.error(err);
    }
}
const zatvoriZadatak = () => {
    odabranZadatak.value = null;
    prijavljeniVolonteri.value = [];
    urediZadatak.value = false;
}
const spremiZadatak = async() => {
    try {
        await api.put(`/zadaci/zadatak/${odabranZadatak.value.id}`, formaZadatak.value);
        uspjeh.value = 'Zadatak uspješno ažuriran';
        urediZadatak.value = false;
        await dohvatiZadatke();
        await otvoriZadatak(odabranZadatak.value.id); 
    } catch (err) {
        error.value = err.response?.data?.message || 'Greška pri ažuriranju zadatka';
    }
}
const obrisiZadatak = async(id) => {
    try {
        await api.delete(`/zadaci/zadatak/${id}`);
        await dohvatiZadatke();
    } catch (err) {
        console.error(err);
    }
}
const potvrdiVolontera = async(id) => {
    try {
        await api.patch(`/prijave/${id}`, { status: 'potvrden' });
        await otvoriZadatak(odabranZadatak.value.id);
    } catch (err) {
        console.error(err);
    }
}
const odbijVolontera = async(id) => {
    try {
        await api.patch(`/prijave/${id}`, { status: 'odbijen' });
        await otvoriZadatak(odabranZadatak.value.id);
    } catch (err) {
        console.error(err);
    }
}
</script>
<template>
    <div>
        <div class="min-h-screen bg-gray-50 px-8 py-10">
            <div v-if="profil" class="max-w-6xl mx-auto flex gap-6">
                <div class="w-64 shrink-0">
                    <div class="bg-white rounded-3xl shadow p-6 flex flex-col items-center text-center">
                        <div class="w-45 h-45">
                            <img v-if="profil.logo_image" :src="profil.logo_image" class="w-full h-full object-cover rounded-full" />
                        </div>
                        <h5 class="text-lg font-bold text-blue-950 mt-3">{{ profil.name }}</h5>
                        <div class="w-full border-t border-gray-100 pt-4 flex flex-col gap-2 text-sm space-y-1">
                            <hr class="border-gray-300">
                            <p v-if="profil.location" class="italic"><span class="font-medium">Lokacija:</span> {{ profil.location }}</p>
                            <p v-if="profil.phone" class="italic"><span class="font-medium">Phone:</span> {{ profil.phone }}</p>
                            <p v-if="profil.website" class="italic"><span class="font-medium">Website:</span> {{ profil.website }}</p>
                            <p v-if="profil.founded_year" class="italic text-gray-500"><span class="font-medium text-gray-700">📅</span> Osnovana {{ profil.founded_year }}.</p>
                            <hr class="border-gray-200">
                        </div>
                        <p v-if="profil.description" class="mt-4 text-sm w-full">{{ profil.description }}</p> 
                        <button v-if="jeVlastiti" @click="uredi = !uredi" class="mt-5 w-50 bg-blue-950 text-white py-2 rounded-3xl text-sm hover:bg-blue-900 transition">
                            {{ uredi ? 'Odustani' : 'Uredi profil' }}
                        </button> 
                    </div>
                </div>
                <div class="flex-1 space-y-3">
                    <div v-if="uredi && jeVlastiti" class="bg-white roundedn-3xl p-4">
                        <h3 class="font-semibold text-lg text-blue-950">Uredi profil</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Naziv</label>
                                <input v-model="forma.name" type="text" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Lokacija</label>
                                <input v-model="forma.location" type="text" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Website</label>
                                <input v-model="forma.website" type="text" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Telefon</label>
                                <input v-model="forma.phone" type="text" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Opis</label>
                                <textarea v-model="forma.description" rows="3" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"></textarea>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">URL logotipa</label>
                                <input v-model="forma.logo_image" type="text" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <button @click="spremiPromjene" class="w-45 bg-blue-950 text-white py-2 rounded-3xl font-semibold hover:bg-blue-900 transition">
                                Spremi promjene
                            </button>
                        </div>
                    </div>
                    <h2 class="font-semibold text-xl text-blue-950">Zadaci udruge</h2>
                    <div v-if="zadaci.length === 0" class="text-gray-400 text-sm">
                        Još nema objavljenih zadataka.
                    </div>
                    <div class="flex flex-col gap-3">
                        <div v-for="zadatak in zadaci" :key="zadatak.id" class="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition"
                            @click="otvoriZadatak(zadatak.id)">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-xs font-semibold px-2 py-1 rounded-full"
                                        :class="zadatak.status === 'aktivan' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                                        {{ zadatak.status }}
                                    </span>
                                    <span v-if="zadatak.is_urgent" class="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-600">Hitno</span>
                                </div>
                                <p class="font-semibold text-blue-950">{{ zadatak.title }}</p>
                                <p class="text-xs text-gray-500 mt-1"> {{ zadatak.location }}, {{ new Date(zadatak.start_date).toLocaleDateString('hr-HR') }}</p>
                            </div>
                            <button v-if="jeVlastiti" @click.stop="obrisiZadatak(zadatak.id)"
                                class="text-red-400 hover:text-red-600 text-lg transition">
                                🗑️
                            </button>
                        </div>
                        <div v-if="odabranZadatak" class="fixed inset-0 z-50 flex items-center justify-center">
                            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="zatvoriZadatak"></div>
                            <div class="relative z-10 bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                                <button @click="zatvoriZadatak" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
                                <h2 class="text-2xl font-bold text-blue-950 mb-6">Uredi zadatak</h2>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="col-span-2">
                                        <label class="block text-sm font-medium mb-1">Naziv</label>
                                        <input v-model="formaZadatak.title" class="w-full border border-gray-200 rounded-xl px-3 py-2" />
                                    </div>
                                    <div class="col-span-2">
                                        <label class="block text-sm font-medium mb-1">Opis</label>
                                        <textarea v-model="formaZadatak.description" rows="4" class="w-full border border-gray-200 rounded-xl px-3 py-2"></textarea>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-1">Lokacija</label>
                                        <input v-model="formaZadatak.location" class="w-full border border-gray-200 rounded-xl px-3 py-2" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-1">Maks. volontera</label>
                                        <input type="number" v-model="formaZadatak.max_volunteers" class="w-full border border-gray-200 rounded-xl px-3 py-2" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-1">Početak</label>
                                        <input type="date" v-model="formaZadatak.start_date" class="w-full border border-gray-200 rounded-xl px-3 py-2" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-1">Kraj</label>
                                        <input type="date" v-model="formaZadatak.end_date" class="w-full border border-gray-200 rounded-xl px-3 py-2" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-1">Vrijeme</label>
                                        <input type="time" v-model="formaZadatak.start_time" class="w-full border border-gray-200 rounded-xl px-3 py-2" />
                                    </div>
                                    <div class="flex items-center mt-7">
                                        <label class="flex items-center gap-2">
                                        <input type="checkbox" v-model="formaZadatak.is_urgent" />
                                            Hitan zadatak
                                        </label>
                                    </div>
                                </div>
                                <div class="mt-8">
                                    <h3 class="text-lg font-semibold text-blue-950 mb-3">Prijavljeni volonteri</h3>
                                    <div v-if="prijavljeniVolonteri.length === 0" class="text-gray-400 text-sm">
                                        Nema prijavljenih volontera.
                                    </div>
                                    <div v-for="volonter in prijavljeniVolonteri" :key="volonter.id" class="border border-gray-300 rounded-xl p-4 mb-3 flex justify-between items-center">
                                        <div>
                                            <p class="font-semibold">{{ volonter.name }} {{ volonter.surname }}</p>
                                            <p class="text-sm text-gray-500">{{ volonter.email }}</p>
                                            <span class="text-xs px-2 py-1 rounded-full"
                                                :class="volonter.status === 'potvrden' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                                                {{ volonter.status }}
                                            </span>
                                        </div>
                                        <div class="flex gap-1">
                                            <button v-if="volonter.status !== 'potvrden'" @click.stop="potvrdiVolontera(volonter.prijava_id)"
                                                class="bg-green-700 hover:bg-green-500 text-white px-2 py-1 rounded-xl">
                                                Prihvati
                                            </button>
                                            <button v-if="volonter.status !== 'odbijen'" @click.stop="odbijVolontera(volonter.prijava_id)"
                                                class="bg-red-800 text-white px-2 py-1 rounded-xl hover:bg-red-600">
                                                Odbij
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-end gap-3 mt-8">
                                    <button @click="zatvoriZadatak" class="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100">
                                        Odustani
                                    </button>
                                    <button @click="spremiZadatak" class="px-5 py-2 rounded-xl bg-blue-950 text-white hover:bg-blue-900">
                                        Spremi promjene
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-48 shrink-0">
                    <div class="bg-white p-5 rounded-3xl shadow-md">
                        <h3 class="text-lg font-semibold mb-4 text-center text-blue-950">Statistike</h3>
                        <div class="bg-gray-100 rounded-2xl p-4 text-center mb-3">
                            <p class="text-3xl font-bold text-blue-950">{{ zadaci.length }}</p>
                            <p class="text-xs text-gray-600">ukupno zadataka</p>
                        </div>
                        <div class="bg-gray-100 rounded-2xl p-4 text-center">
                            <p class="text-3xl font-bold text-blue-950">
                                {{ zadaci.filter(z => z.status === 'aktivan').length }}
                            </p>
                            <p class="text-xs text-gray-600">aktivnih zadataka</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>