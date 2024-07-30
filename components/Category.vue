<template>
    <v-data-table 
        :loading="loading" 
        :items="items" 
        :headers="headers" 
        items-per-page-text="Liczba wierszy na stronę"
        :items-per-page-options="[10, 20, 50]" 
        page-text="{0}-{1} z {2}" 
        no-data-text="Brak kategorii. Dodaj nową." 
        loading-text="Wczytywanie">

        <template v-slot:item.name="{ value }">
            {{value}}
        </template>

        <template v-slot:item.action="{ item }">
            <div>
                <VBtn icon="mdi-delete" title="Usuń" variant="flat"></VBtn>
                <VBtn icon="mdi-pencil" title="Edytuj" variant="flat"></VBtn>
            </div>
        </template>
    </v-data-table>
</template>


<script setup>

const props = defineProps({
    loading: Boolean,
    items: Array,
    headers: Array
});
</script>