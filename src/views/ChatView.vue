<script setup>
import api from '@/api/axios.js';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const razgovori = ref([]);
const trenutniChat = ref(null);
const poruke = ref([]);
const novaPoruka = ref('');
const search = ref('');
const izbornik = ref(null);
const potvrdaBrisanja = ref(null);
const korisnici = ref([]);

const trenutniUser = JSON.parse(localStorage.getItem('user') || '{}');

const dohvatiRazgovore = async() => {
    try {
        const response = await api.get('/chat/conversations');
        razgovori.value = response.data;
    } catch (err) {
        console.error(err);
    }
}
const otvoriRazgovorSKorisnikom = async(user_id) => {
    try {
        const postojeciChat = razgovori.value.find(razgovor => razgovor.user_id === Number(user_id));
        if (postojeciChat) {
            await otvoriChat(postojeciChat.id);
            search.value = '';
            korisnici.value = [];
            return;
        }
        const response = await api.post('/chat/conversation', { user2_id: Number(user_id) });
        await dohvatiRazgovore();
        await otvoriChat(response.data.razgovor?.id || response.data.id);
        search.value = '';
        korisnici.value = [];
    } catch (err) {
        console.error(err);
    }
}
const otvoriChat = async(conversation_id) => {
    try {
        trenutniChat.value = conversation_id;
        const response = await api.get(`/chat/messages/${conversation_id}`);
        poruke.value = response.data;
        await oznaciProcitano(conversation_id);
    } catch (err) {
        console.error(err);
    }
}
const posaljiPoruku = async() => {
    if (!novaPoruka.value.trim()) {
        return;
    }
    try {
        await api.post('/chat/message', {
            conversation_id: trenutniChat.value,
            content: novaPoruka.value.trim()
        });
        novaPoruka.value = '';
        await otvoriChat(trenutniChat.value);
    } catch (err) {
        console.error(err);
    }
}
const oznaciProcitano = async(conversation_id) => {
    try {
        await api.post('/chat/readat', {
            conversation_id: conversation_id
        });
    } catch (err) {
        console.error(err);
    }
}
const searchKorisnika = async() => {
    try {
        const response = await api.get('/chat/search', {
            params: { query: search.value }
        });
        korisnici.value = response.data;
    } catch (err) {
        console.error(err);
    }
}
const readatVrijeme = (read_at) => {
    if(!read_at) {
        return;
    }
    const datum = new Date(read_at);
    return `Pročitano u ${datum.toLocaleTimeString('hr-HR', {
        hour: '2-digit',
        minute: '2-digit'
    })}`;
}
const obrisiRazgovor = async(id) => {
    try {
        await api.delete(`/chat/delete/${id}`);
        if(trenutniChat.value === id) {
            trenutniChat.value = null;
            poruke.value = [];
        }
        izbornik.value = null;
        potvrdaBrisanja.value = null;
        await dohvatiRazgovore();
    } catch(err) {
        console.error(err);
    }
    
}
const obrisiPoruku = async(id) => {
    try {
        await api.delete(`/chat/deletemessage/${id}`);
        izbornik.value = null;
        potvrdaBrisanja.value = null;
        await otvoriChat(trenutniChat.value);
    } catch (err) {
        console.error(err);
    }
}
const prikaziPotvrdu = async(tip, id) => {
    potvrdaBrisanja.value = { 
        tip: tip, 
        id: id 
    };
    izbornik.value = null;
}
const potvrda = async() => {
    if(!potvrdaBrisanja.value) {
        return;
    }
    const tip = potvrdaBrisanja.value.tip;
    const id = potvrdaBrisanja.value.id;
    potvrdaBrisanja.value = null;
    if (tip === 'razgovor') {
        await obrisiRazgovor(id);
    }
    if (tip === 'poruka') {
        await obrisiPoruku(id);
    }
}
onMounted(async() => {
    await dohvatiRazgovore();
    if (route.query.user_id) {
        await otvoriRazgovorSKorisnikom(route.query.user_id);
    }
})
</script>
<template>
    <div class="flex h-[calc(100vh-90px)] bg-gray-50 overflow-hidden">
        <div class="w-77 bg-white border-r border-gray-100 flex flex-col shrink-0">
            <div class="px-5 pt-5 pb-4 border-b border-gray-100">
                <h1 class="text-xl font-semibold text-blue-950 mb-4">Razgovori</h1>
                <div class="relative">
                    <input v-model="search" @input="searchKorisnika" type="text" placeholder="Pretraži razgovore..."
                    class="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-3 py-2.5 text-sm 
                        text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20
                        focus:border-blue-900 transition"> 
                     <div v-if="korisnici.length > 0" class="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
                        <div v-for="korisnik in korisnici" :key="korisnik.id"
                            @click="otvoriRazgovorSKorisnikom(korisnik.id)"
                            class="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                            <p class="font-medium text-gray-800">
                                {{ korisnik.name }}
                            </p>
                            <p class="text-xs text-gray-400">
                                {{ korisnik.role === 'volonter' ? 'Volonter' : 'Udruga' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto">
               <div v-for="razgovor in razgovori" @click="otvoriChat(razgovor.id)"
                    class="flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-100 transition hover:bg-gray-50"
                    :class="{ 'bg-gray-50 border-l-3 border-blue-900': trenutniChat === razgovor.id }">
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between">
                            <p class="font-medium font-sans text-gray-800 truncate">
                                {{ razgovor.name }}
                            </p>
                            <div class="relative shrink-0">
                                <button @click.stop="izbornik = izbornik === `razgovor-${razgovor.id}` ? null : `razgovor-${razgovor.id}`"
                                    class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                                    ⋮
                                </button>
                                <div v-if="izbornik === `razgovor-${razgovor.id}`"
                                    class="absolute right-0 top-9 z-20 w-28 bg-white border border-gray-200 rounded-xl shadow-lg py-1"
                                    @click.stop>
                                    <button @click="prikaziPotvrdu('razgovor', razgovor.id)"
                                        class="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition">
                                        Obriši
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p class="text-xs text-gray-400 mt-0.5">Razgovor</p>
                    </div>
                </div> 
                <div v-if="razgovori.length === 0" class="px-5 py-8 text-center text-sm text-gray-400">
                    Nema razgovora
                </div>
            </div>
        </div>
        <div class="flex-1 h-full min-h-0">
            <div v-if="trenutniChat" class="h-full flex flex-col min-h-0 pt-2">
                <div class="border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
                    <div>
                        <h2 class="font-semibold font-sans text-lg text-blue-950">
                            {{ razgovori.find(r => r.id === trenutniChat)?.name }}
                        </h2>
                        <p class="text-xs text-gray-400">Razgovor</p>
                    </div>
                </div>
                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-3">
                    <div v-for="poruka in poruke" :key="poruka.id" class="flex items-center relative" 
                        :class="poruka.sender_id === trenutniUser.id ? 'justify-end' : 'justify-start'">
                        <div v-if="poruka.sender_id === trenutniUser.id" class="relative mr-2">
                            <button 
                                @click.stop="izbornik = izbornik === `poruka-${poruka.id}` ? null : `poruka-${poruka.id}`"
                                class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                                ⋮
                            </button>
                            <div v-if="izbornik === `poruka-${poruka.id}`"@click.stop
                                class="absolute right-0 top-8 z-20 w-28 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                                <button 
                                    @click="prikaziPotvrdu('poruka', poruka.id)"
                                    class="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition">
                                    Obriši
                                </button>
                            </div>
                        </div>
                        <div class="flex flex-col min-w-0 max-w-[70%]" :class="poruka.sender_id === trenutniUser.id ? 'items-end' : 'items-start'">
                            <div class="w-fit max-w-full px-3 py-2 rounded-2xl" 
                                :class="poruka.sender_id === trenutniUser.id 
                                    ? 'bg-blue-950 text-white rounded-br-md' 
                                    : 'bg-white border-gray-200 text-gray-800 rounded-bl-md'">
                                {{ poruka.content }}
                            </div>
                            <p v-if="poruka.sender_id === trenutniUser.id && poruka.read_at" 
                                class="text-xs text-gray-400 mt-1">
                                {{ readatVrijeme(poruka.read_at) }}
                            </p>
                        </div>
                    </div>
                    <div v-if="poruke.length === 0" class="h-full flex items-center justify-center text-gray-400">
                        <div class="text-center">
                        <p class="text-sm">
                                Nema poruka u ovom razgovoru
                            </p>
                        </div>
                    </div>
                </div>
                <div class="bg-white border-t border-gray-100 p-1.5 shrink-0">
                    <div class="flex gap-2">
                        <input v-model="novaPoruka" @keyup.enter="posaljiPoruku" type="text" placeholder="Napišite poruku..."
                            class="flex-1 border border-gray-300 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-900">
                        <button @click="posaljiPoruku" :disabled="!novaPoruka.trim()" 
                            class="bg-blue-950 text-white px-3 rounded-xl hover:bg-blue-950 transition disabled:opacity-40 disabled:cursor-not-allowed">
                            ▷
                        </button>
                    </div>
                </div>
            </div>
            <div v-else class="h-full flex items-center justify-center bg-gray-50">
                <div class="text-center">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-900 text-2xl">
                        💬
                    </div>
                    <h2 class="text-lg font-medium text-gray-500">Odaberi razgovor</h2>
                    <p class="text-sm mt-1">Odaberi razgovor kako bi prikazali poruke.</p>
                </div>
            </div>
        </div> 
        <div v-if="potvrdaBrisanja" @click="potvrdaBrisanja = null"
            class="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl shadow-xl w-80 p-5" @click.stop>
                <h3 class="font-semibold text-blue-950 text-lg text-center">Potvrda brisanja</h3>
                <p class="text-sm text-gray-500 mt-2 text-center">
                    {{ potvrdaBrisanja.tip === 'razgovor' 
                        ? 'Jeste li sigurni da želite obrisati ovaj razgovor?'
                        : 'Jeste li sigurni da želite obrisati ovu poruku?' }}
                </p>
                <div class="flex gap-2 mt-5 justify-center">
                    <button @click="potvrdaBrisanja = null" 
                        class="px-4 py-2 justify-center rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition">
                        Odustani
                    </button>
                    <button @click="potvrda" 
                        class="px-4 py-2 rounded-xl text-sm bg-red-500 text-white hover:bg-red-600 transition">
                        Obriši
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>