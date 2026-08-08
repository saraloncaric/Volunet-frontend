<script setup>
import api from '@/api/axios.js';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const razgovori = ref([]);
const trenutniChat = ref(null);
const poruke = ref([]);
const novaPoruka = ref('');

const trenutniUser = JSON.parse(localStorage.getItem('user') || '{}');

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
<template></template>