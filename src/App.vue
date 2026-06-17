<script setup>
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
</script>

<template>
    <div class="min-h-screen">
        <Header />
        <div class="min-h-screen pt-14">
            <RouterView />
        </div>
    </div>
</template>