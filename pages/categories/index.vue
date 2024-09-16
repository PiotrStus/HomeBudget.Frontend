<template>
    <VCard>
        <v-toolbar color="transparent">
            <v-toolbar-title>
                Kategorie
            </v-toolbar-title>
            <template v-slot:append>
                <div class="mr-2">
                    <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="showDialog = true" >Dodaj</v-btn>
                </div>
            </template>
        </v-toolbar>
        <AddCategoryDialog v-model:show="showDialog" @categoryAdded="updateItems"/>
        <v-tabs v-model="tab" color="primary">
            <v-tab value="income">Przychody</v-tab>
            <v-tab value="expense">Wydatki</v-tab>
        </v-tabs>
        <v-card-text>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="income">
                    <Categories :loading="categoriesStore.loading" :items="categoriesStore.incomeCategories" :headers="headers" @remove-category="removeCategory"/>
                </v-tabs-window-item>
                <v-tabs-window-item value="expense">
                    <Categories :loading="categoriesStore.loading" :items="categoriesStore.expenseCategories" :headers="headers" @remove-category="removeCategory"/>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
    </VCard>
</template>


<script setup>

const categoriesStore = useCategoriesStore();

const tab = ref('income');

const headers = ref([
    {title: 'Nazwa kategorii', value: 'name', text: 'bold'},
    {title: '', value: 'action', align: 'end'}

]);






const showDialog = ref(false);


const removeCategory = (categoryToRemove) => {
    categoriesStore.removeCategory(categoryToRemove);
};

const updateItems = () => {
    categoriesStore.loadCategories();
};

onMounted(updateItems);

</script>
