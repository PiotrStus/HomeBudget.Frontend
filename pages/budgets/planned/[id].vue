<template>
<VCard class="pa-2 mt-4">
		<v-toolbar color="transparent">
            <template v-slot:prepend>
				<v-btn icon="mdi-chevron-left" to="/budgets"></v-btn>
			</template>
			<v-toolbar-title>Planowane kwoty per kategoria</v-toolbar-title>
			<v-btn class="ml-2" color="primary" variant="flat" prepend-icon="mdi-plus" @click="showDialog = true">
			Przypisz
			</v-btn>
		</v-toolbar>
		<AddPlannedDialog v-model:show="showDialog" @plannedCategoriesAdded="updateItems" :items="categoriesToUse"/>
		<v-data-table 
        :loading="loading" 
        :items="plannedCategories" 
        :headers="headers" 
        items-per-page-text="Liczba wierszy na stronę"
        :items-per-page-options="[10, 20, 50]" 
        page-text="{0}-{1} z {2}" 
        no-data-text="Brak planowanych kategorii. Dodaj nową." 
        loading-text="Wczytywanie">
        <template v-slot:item="{ item }">
            
            <tr>
				<td style="width: 50px">   
                    <v-icon :class="[item.categoryType === 'Expense' ? 'icon-red' : 'icon-green', 'icon-large']">
                        {{ item.categoryType === 'Expense' ? 'mdi-arrow-bottom-left-bold-outline' : 'mdi-arrow-top-right-bold-outline' }}
                    </v-icon>
                </td>
                <td>{{ item.name }}</td>
                <td>{{ item.amount }}</td>
                <td>
					<div class="text-right">
                    	<v-btn  icon="mdi-delete" title="Usuń" variant="flat" :loading="item.deleting" @click="deletePlannedCategory(item)"></v-btn>
                    	<v-btn  icon="mdi-pencil" title="Edytuj" variant="flat" :to="{ path: `/budgets/planned/category/${item.id}`, query: {plannedId: route.params.id }}"></v-btn>
					</div>
				</td>
            </tr>
        </template>
    </v-data-table>
	</VCard>
	<ConfirmDialog ref="confirmDialog"/>
</template>

<script setup>


const loading = ref(false);
const plannedCategories = ref([]);
const route = useRoute();
const showDialog = ref(false);
const categoriesStore = useCategoriesStore();
const confirmDialog = ref(null);
const globalMessageStore = useGlobalMessageStore();

const categoriesToUse = computed(() => {
    const plannedPairs = plannedCategories.value.map(cat => ({
        name:cat.name,
        categoryType: cat.categoryType,
        
    }));
    return categoriesStore.categories.filter(cat => {
        return !plannedPairs.some(plannedCat => 
            plannedCat.name === cat.name && 
            plannedCat.categoryType === cat.categoryType
        );
});
});


const headers = ref([
	{title: 'Typ', value: 'categoryType'},
    {title: 'Nazwa kategorii', value: 'name'},
	{title: 'Planowana kwota', value: 'amount'},
    {title: '', value: 'action', align: 'end'}

]);

const updateItems = () => {
    loadPlannedCategories();
};

const deletePlannedCategory = (category) => {
    confirmDialog.value.show({
        title: "Potwierdź usunięcie",
        text: "Czy na pewno chcesz usunać kategorię?",
        confirmBtnText: 'Usuń',
        confirmBtnColor: 'error'
    }).then((confirm) => {
        if (confirm){
            category.deleting = true;
            useWebApiFetch('/PlannedCategory/DeletePlannedCategory', {
                method: 'POST',
                body: {id : category.id},
                watch: false,
                onResponseError: ({ response }) => {
                    let message = getErrorMessage(response, {})
                    globalMessageStore.showErrorMessage(message);
                }
            })
            .then((response) => {
                if (response.data.value) {
                    globalMessageStore.showSuccessMessage("Kategoria została usunięta");
                    //removeCategory(category);
					loadPlannedCategories();
                }
            })
            .finally(() => {
                category.deleting = false;
            });
        }
    })
}

const loadPlannedCategories = async () => {
			loading.value = true;
			useWebApiFetch('/PlannedCategory/GetAllPlannedCategories', {
                query: { monthId: route.params.id }
                }
            )				
			.then(({ data, error }) => {
				if (data.value) {
					plannedCategories.value = data.value.plannedCategories;
                    plannedCategories.value.sort((a, b) => {
                    if (a.categoryType === 'Income' && b.categoryType === 'Expense') return -1;
                    if (a.categoryType === 'Expense' && b.categoryType === 'Income') return 1;
                    return 0;
                    });
				} else if (error.value) {
					plannedCategories.value = [];
				}
			})
			.finally(() => {
				loading.value = false;
			})
		}



onMounted(async () => {
    loadPlannedCategories();
});

</script>


<style scoped>

.icon-large {
  font-size: 26px; 
}

.icon-green {
  color: green;
}
.icon-red {
  color: red;
}

</style>