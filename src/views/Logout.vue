<script setup>

import {useAuthStore} from "@/stores/auth.store.js";

const {logoutUser} = useAuthStore();

logoutUser();
</script>

<template>

</template>

<style scoped>

</style>