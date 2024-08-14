<template>
<VCard class="pa-2 mt-4">
		<v-toolbar color="transparent">
            <template v-slot:prepend>
				<v-btn icon="mdi-chevron-left" to="/budgets"></v-btn>
			</template>
			<v-toolbar-title>Planowane kwoty per kategoria</v-toolbar-title>
			<v-btn class="ml-2" color="primary" variant="flat" prepend-icon="mdi-plus" @click="showDialog = true">
			Dodaj
			</v-btn>
		</v-toolbar>
		<AddMonthlyBudgetDialog v-model:show="showDialog" @update-categories="updateItems"/>
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
				<td style="width: 50px">{{ getCategoryTitle(item.categoryType).charAt(0) }}</td>
                <td>{{ item.category }}</td>
                <td>{{ item.amount }}</td>
                <td>
					<div class="text-right">
                    	<v-btn  icon="mdi-delete" title="Usuń" variant="flat" :loading="item.deleting" @click="deleteCategory(item)"></v-btn>
                    	<v-btn  icon="mdi-pencil" title="Edytuj" variant="flat" :to="`/categories/planned/${item.id}`"></v-btn>
					</div>
				</td>
            </tr>
        </template>
    </v-data-table>
	</VCard>
</template>

<script setup>
const loading = ref(false);
const plannedCategories = ref([]);
const globalMessageStore = useGlobalMessageStore();
const route = useRoute();
const showDialog = ref(false);

const getCategoryTitle = (categoryType) => {
  const category = categoryOptions.find(option => option.value === categoryType);
  return category ? category.title : 'Unknown';
};

const headers = ref([
	{title: 'Typ', value: 'categoryType'},
    {title: 'Nazwa kategorii', value: 'category'},
	{title: 'Planowana kwota', value: 'amount'},
    {title: '', value: 'action', align: 'end'}

]);

const loadPlannedCategories = async () => {
			loading.value = true;
			useWebApiFetch('/Category/GetPlannedCategories', {
                query: { monthId: route.params.id }
                }
            )				
			.then(({ data, error }) => {
				if (data.value) {
					plannedCategories.value = data.value.plannedCategories;
					//globalMessageStore.showSuccessMessage('Budżet został wybrany');
				} else if (error.value) {
					plannedCategories.value = [];
				}
			})
			.finally(() => {
				loading.value = false;
			})
		}


        
onMounted(loadPlannedCategories)

</script>