import AdminPanel from "@/views/AdminPanel.vue";
import DetaljiZadatka from "@/views/DetaljiZadatka.vue";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import ProfilUdruge from "@/views/ProfilUdruge.vue";
import ProfilVolontera from "@/views/ProfilVolontera.vue";
import Register from "@/views/Register.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/register',
            name: 'register',
            component: Register
        },
        {
            path: '/volonter/:id',
            name: 'profilVolontera',
            component: ProfilVolontera
        },
        {
            path: '/udruga/:id',
            name: 'profilUdruge',
            component: ProfilUdruge
        },
        {
            path: '/zadatak/:id',
            name: 'detaljiZadatka',
            component: DetaljiZadatka
        },
        {
            path: '/admin',
            name: 'adminPanel',
            component: AdminPanel
        },
    ]
})
export default router;