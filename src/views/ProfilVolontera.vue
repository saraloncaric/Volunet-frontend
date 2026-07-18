<script setup>
import api from '@/api/axios.js';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const profil = ref(null);
const povijest = ref([]);
const recenzije = ref([]);
const error = ref('');
const uspjeh = ref('');
const razina = ref(false);
const uredi = ref(false);
const recenzijaUspjeh = ref('');
const recenzijaError = ref('');
const zavrseniZadaci = ref([]);

let trenutniUser = {};
try {
    trenutniUser = JSON.parse(localStorage.getItem('user') || '{}');
} catch(e) {
    console.error(e);
}
const jeVlastiti = computed(() => profil.value?.user_id === trenutniUser.id);
const jeUdruga = computed(() => trenutniUser.role === 'udruga');
const jeAdmin = computed(() => trenutniUser.role === 'admin');

const forma = ref({
    name: '',
    surname: '',
    bio: '',
    location: '',
    phone: '',
    profile_image: ''
});
const recenzijaForma = ref({
    rating: '',
    task_id: '',
    comment: ''
})

onMounted(async() => {
    await dohvatiProfil();
    if (profil.value) {
        await dohvatiPovijest();
        await dohvatiRecenzije();
        if(jeUdruga.value) {
            await dohvatiZavrseneZadatke();
        }
    }
})

const dohvatiProfil = async() => {
    try {
        if (!route.params.id) {
            error.value = "Nedostaje ID volontera";
            return;
        }

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
        console.error("Greška:", err);
    }
}
const dohvatiPovijest = async() => {
    try {
        const response = await api.get(`/volonter/profil/${route.params.id}/povijest`);
        povijest.value = response.data;
    } catch (err) {
        console.error(err);
    }
} 
const dohvatiRecenzije = async() => {
    try {
        if (!profil.value?.id) {
            return;
        }
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
const dodajRecenziju = async() => {
    recenzijaUspjeh.value = ''
    recenzijaError.value = ''
    try {
        await api.post(`/recenzije/nova/${profil.value.id}`, recenzijaForma.value)
        recenzijaUspjeh.value = 'Recenzija uspješno dodana!'
        recenzijaForma.value = { rating: '', task_id: '', comment: '' }
        await dohvatiRecenzije()
    } catch (err) {
        recenzijaError.value = err.response?.data?.message || 'Greška pri dodavanju recenzije'
    }
}
const dohvatiZavrseneZadatke = async() => {
    try {
        const response = await api.get(`/recenzije/zavrseni/${profil.value.id}`);
        zavrseniZadaci.value = response.data;
    } catch (err) {
        console.error(err);
    }
}
const obrisiRecenziju = async(id) => {
    try {
        await api.delete(`/recenzije/delete/${id}`);
        await dohvatiRecenzije();
    } catch (err) {
        console.error(err);
    }
}
</script>
<template>
    <div class="min-h-screen bg-gray-50 px-8 py-10">
        <div v-if="profil" class="max-w-6xl mx-auto flex gap-6">
            <div class="w-64 shrink-0">
                <div class="bg-white rounded-3xl shadow p-6 flex flex-col items-center text-center">
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
                        class="mt-5 w-50 bg-blue-950 text-white py-2 rounded-3xl text-sm hover:bg-blue-900 transition">
                        {{ uredi ? 'Odustani' : 'Uredi profil' }}
                    </button>                  
                </div>
            </div>
            <div class="flex-1 space-y-3">
                <div v-if="uredi && jeVlastiti" class="bg-white roundedn-3xl p-4">
                    <h3 class="font-semibold text-lg text-blue-950">Uredi profil</h3>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ime</label>
                            <input v-model="forma.name" type="text" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"/>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Prezime</label>
                            <input v-model="forma.surname" type="text" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"/>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Lokacija</label>
                            <input v-model="forma.location" type="text" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"/>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Broj telefona</label>
                            <input v-model="forma.phone" type="text" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"/>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">O meni</label>
                            <textarea v-model="forma.bio" rows="3" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">URL slike profila</label>
                            <input v-model="forma.profile_image" type="text" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button @click="spremiProfil" class="w-45 bg-blue-950 text-white py-2 rounded-3xl font-semibold hover:bg-blue-900 transition">
                            Spremi promjene
                        </button>
                    </div>
                </div>
                <h2 class="font-semibold text-xl text-blue-950">Povijest volontiranja</h2>
                <div v-if="povijest.length === 0" class="text-gray-400 text-sm">
                    Još nema završenih zadataka
                </div>
                <div class="flex flex-col gap-3">
                    <div v-for="zadatak in povijest" :key="zadatak.id" class="border border-gray-200 rounded-xl p-4 flex justify-between items-center space-y-3">
                        <div>
                            <p class="font-semibold text-blue-950 text-base">{{ zadatak.title }}</p>
                            <p class="text-xs text-gray-500 mt-1">{{ new Date(zadatak.start_date).toLocaleDateString('hr-HR') }}, {{ zadatak.location }}</p>
                        </div>
                        <p class="text-xs font-semibold px-3 py-1 rounded-full"
                            :class="zadatak.category_name ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'">
                        {{ zadatak.name || 'Ostalo' }}
                        </p>
                    </div>
                </div>
                <div>
                    <h2 class="font-semibold text-xl text-blue-950">Ocjene i komentari</h2>
                    <div v-if="recenzije.length === 0" class="text-sm text-gray-400">
                        Još nema ocjena ni komentara
                    </div>
                    <div class="flex flex-col gap-3">
                        <div v-for="recenzija in recenzije" :key="recenzija.id" class="border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                            <div class="flex gap-3 items-center">
                                <p class="font-semibold text-blue-950 text-base">{{ recenzija.organization_name }}</p>
                                <div class="flex gap-1">
                                    <span v-for="i in 5" :key="i" class="text-sm" :class="i <= recenzija.rating ? 'text-amber-400' : 'text-gray-200'">★</span>
                                </div>
                                <button v-if="jeAdmin" @click.stop="obrisiRecenziju(recenzija.id)" 
                                    class="ml-auto text-red-400 hover:text-red-600 text-lg transition">
                                    🗑️
                                </button>
                            </div>
                            <p class="text-sm">{{ recenzija.task_title }}</p>
                            <p class="text-xs text-gray-500 italic">"{{ recenzija.comment }}"</p>
                        </div>
                    </div>
                    <div v-if="jeUdruga" class="mt-4 bg-gray-50 rounded-2xl p-4">
                        <h3 class="font-semibold text-blue-950 mb-3">Dodaj recenziju</h3>
                        <div class="mb-3">
                            <label class="block text-xs font-medium text-gray-700 mb-1">Ocjena (1-5)</label>
                            <input v-model="recenzijaForma.rating" type="number" min="1" max="5"
                                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950" />
                        </div>
                        <div class="mb-3">
                            <label class="block text-xs font-medium text-gray-700 mb-1">Zadatak</label>
                            <select v-model="recenzijaForma.task_id"
                                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950">
                                <option value="">Odaberi zadatak</option>
                                <option v-for="zadatak in zavrseniZadaci" :key="zadatak.id" :value="zadatak.id">{{ zadatak.title }}</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="block text-xs font-medium text-gray-700 mb-1">Komentar</label>
                            <textarea v-model="recenzijaForma.comment" rows="3"
                                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"></textarea>
                        </div>
                        <p v-if="recenzijaUspjeh" class="text-green-600 text-xs mb-2">{{ recenzijaUspjeh }}</p>
                        <p v-if="recenzijaError" class="text-red-500 text-xs mb-2">{{ recenzijaError }}</p>
                        <button @click="dodajRecenziju"
                            class="w-full bg-blue-950 text-white py-2 rounded-xl text-sm hover:bg-blue-900 transition">
                            Dodaj recenziju
                        </button>
                    </div>
                </div>
            </div>
            <div class="w-48 shrink-0">
                <div class="bg-white p-5 rounded-3xl shadow-md w-full max-w-sm">
                    <h3 class="text-xl font-semibold text-blue-950">Razina volontera</h3>
                    <div class="text-center mb-4">
                        <button @click="razina = !razina" class="underline text-xs hover:font-bold">Kako funkcionira?</button>
                    </div>
                    <div v-if="razina" class="border border-blue-100 rounded-2xl p-3 mb-4 text-xs text-center space-y-0.5 text-gray-600">
                        <p class="text-blue-950">Razine volontiranja se određuju prema broju sati volontiranja.</p>
                        <p><strong>Beginner</strong> - <10h </p>
                        <p><strong>Helper</strong> - <50h </p>
                        <p><strong>Hero</strong> - <200h </p>
                        <p><strong>Legend</strong> - 200h+</p>
                    </div>
                    <div class="bg-gray-100 rounded-3xl p-4 text-center mb-4">
                        <p class="text-3xl font-bold">{{ povijest.length }}</p>
                        <p class="text-sm text-gray-600">zadataka završeno</p>
                    </div>
                    <div class="bg-gray-100 rounded-3xl p-4 text-center mb-4">
                        <p class="text-3xl font-bold">{{ profil.total_hours }}</p>
                        <p class="text-sm text-gray-600">sati volontiranja</p>
                    </div>
                    <div v-if="recenzije.length > 0" class="bg-gray-100 rounded-3xl p-4 text-center">
                        <p class="text-3xl font-bold">
                            {{ (recenzije.reduce((sum, r) => sum + r.rating, 0) / recenzije.length).toFixed(1) }}
                        </p>
                        <p class="text-sm text-gray-600">prosječna ocjena</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>