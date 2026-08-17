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

const trenutniUser = JSON.parse(localStorage.getItem('user') || '{}');

const filtriraniChatovi = computed(() => {
    return razgovori.value.filter(razgovor => razgovor.email.toLowerCase().includes(search.value.toLowerCase()));
})

const dohvatiRazgovore = async() => {
    try {
        const response = await api.get('/chat/conversations');
        razgovori.value = response.data;
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
    try {
        const response = await api.post('/chat/message', {
            conversation_id: trenutniChat.value,
            content: novaPoruka.value
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
onMounted(async() => {
    await dohvatiRazgovore();
})
</script>
<template>
    <div class="flex h-[calc(100vh-90px)] bg-gray-50 overflow-hidden">
        <div class="w-77.5 bg-white border-r border-gray-100 flex flex-col shrink-0">
            <div class="px-5 pt-5 pb-4 border-b border-gray-100">
                <h1 class="text-xl font-semibold text-blue-950 mb-4">Razgovori</h1>
                <div class="relative">
                    <input v-model="search" type="text" placeholder="Pretraži razgovore..."
                    class="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-3 py-2.5 text-sm 
                        text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20
                        focus:border-blue-900 transition"> 
                </div>
            </div>
            <div class="flex-1 overflow-y-auto">
               <div v-for="razgovor in filtriraniChatovi" @click="otvoriChat(razgovor.id)"
                    class="flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-gray-100 transition hover:bg-gray-50"
                    :class="{ 'bg-gray-50 border-l-3 border-blue-900': trenutniChat === razgovor.id }">
                    <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-semibold shrink-0">
                        {{ razgovor.email?.charAt(0).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                        <p class="font-medium text-gray-800 truncate">
                            {{ razgovor.email }}
                        </p>
                        <p class="text-xs text-gray-400 mt-0.5">Razgovor</p>
                    </div>
                </div> 
                <div v-if="filtriraniChatovi.length === 0" class="px-5 py-8 text-center text-sm text-gray-400">
                    Nema razgovora
                </div>
            </div>
        </div>
        <div class="flex-1 h-full min-h-0">
            <div v-if="trenutniChat" class="h-full flex flex-col min-h-0 pt-2">
                <div class="border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
                    <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-950 flex items-center justify-center font-semibold">
                        {{ razgovori.find(r => r.id === trenutniChat)?.email?.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                        <h2 class="font-semibold text-lg text-blue-950">
                            {{ razgovori.find(r => r.id === trenutniChat)?.email }}
                        </h2>
                        <p class="text-xs text-gray-400">Razgovor</p>
                    </div>
                </div>
                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-3">
                    <div v-for="poruka in poruke" :key="poruka.id" 
                        class="flex" 
                        :class="poruka.sender_id === trenutniUser.id ? 'justify-end' : 'justify-start'">
                        <div class="max-w-[65%] px-3 py-2 rounded-2xl" 
                            :class="poruka.sender_id === trenutniUser.id 
                                ? 'bg-blue-950 text-white rounded-br-md' 
                                : 'bg-white border-gray-200 text-gray-800 rounded-bl-md'">
                            {{ poruka.content }}
                        </div>
                    </div>
                    <div v-if="poruke.length === 0" class="h-full flex items-center justify-center text-gray-400">
                        <div class="text-center">
                            <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl">
                                💬
                            </div>
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
                        <button @click="posaljiPoruku" class="bg-blue-950 text-white px-3 rounded-xl hover:bg-blue-950 transition">
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
                    <p class="text-sm mt-1"> Odaberi razgovor s lijeve strane kako bi vidjela poruke.</p>
                </div>
            </div>
        </div> 
    </div>
</template>