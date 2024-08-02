<template>
    <VCard>
        <v-toolbar color="transparent">
            <v-toolbar-title>
                Kategorie
            </v-toolbar-title>
            <template v-slot:append>
                <div class="ml-2">
                    <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="showDialog = true" >Dodaj</v-btn>
                </div>
            </template>
        </v-toolbar>

        <AddCategoryDialog v-model:show="showDialog" @update-items="updateItems"/>
        <v-tabs v-model="tab" bg-color="primary">
            <v-tab value="income">Przychody</v-tab>
            <v-tab value="expense">Wydatki</v-tab>
        </v-tabs>
        <v-card-text>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="income">
                    <Categories :loading="loading" :items="filteredIncomeItems" :headers="headers" @remove-item="handleRemoveItem"/>
                </v-tabs-window-item>
                <v-tabs-window-item value="expense">
                    <Categories :loading="loading" :items="filteredExpenseItems" :headers="headers" @remove-item="handleRemoveItem"/>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
    </VCard>
</template>


<script setup>
import Categories from '~/components/Categories.vue';


const filteredIncomeItems = computed(() => {
    return items.value.filter(item => item.categoryType === 'Income');
});

const filteredExpenseItems = computed(() => {
    return items.value.filter(item => item.categoryType === 'Expense');
});


const tab = ref('income');
const loading = ref(false);
const items = ref([]);

const headers = ref([
    {title: 'Nazwa kategorii', value: 'name'},
    {title: '', value: 'action', align: 'end'}

]);

const loadData = () => {

    loading.value = true;

    useWebApiFetch('/Budget/GetAllCategories')
        .then(({ data, error}) => {
            if (data.value) {
                items.value = data.value.categories;
                console.log(items.value);
            } else if (error.value) {
                items.value = [];
            }
        })
        .finally(() => {
            loading.value = false;
        })
};




onMounted(() => {
    loadData();
});

const showDialog = ref(false);


const handleRemoveItem = (itemToRemove) => {
  items.value = items.value.filter(item => item !== itemToRemove);
};

const updateItems = () => {
  loadData()
};

</script>