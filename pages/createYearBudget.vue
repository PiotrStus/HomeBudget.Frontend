<template>
<VCard>
        <v-card-title class="text-center">
            Dostępne budżety roczne
        </v-card-title>
        <v-timeline direction="horizontal">
            <v-timeline-item v-for="yearBudget in yearBudgetsStore.yearBudgets" :key="yearBudget">
                <div>
                    <div class="text-h6">
                        {{yearBudget.year}}
                    </div>
                </div>
            </v-timeline-item>
        </v-timeline>
  
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
      >Dodaj nowy budżet roczny</v-btn>
    </VCardActions>
    </VCard>
</template>



<script setup>

import homeImg from 'public/assets/home-budget.jpg'
import { VBtn } from 'vuetify/components';

const yearBudgetsStore = useYearBudgetsStore();


onMounted(
    () => {yearBudgetsStore.loadYearBudgets()}
);



</script>