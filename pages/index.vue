<template>
    <VCard
    >

    <v-card-title class="text-center">
        Dodaj nowy budżet roczny
    </v-card-title>
    <v-img
      height="300px"
      :src="homeImg"
      cover
    ></v-img>
    <VCardActions>

    <v-btn
        color="primary"
        variant="elevated"
        class="mx-auto"
        :to="`/budgets`"
        type="submit"
      >Dodaj</v-btn>
    </VCardActions>
    </VCard>
</template>



<script setup>
import homeImg from 'public/assets/home-budget.jpg'
import { VBtn } from 'vuetify/components';
</script>