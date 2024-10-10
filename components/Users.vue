<template>
    <v-data-table 
        :loading="props.loading" 
        :items="props.items" 
        :headers="props.headers" 
        items-per-page-text="Liczba wierszy na stronę"
        :items-per-page-options="[10, 20, 50]" 
        page-text="{0}-{1} z {2}" 
        no-data-text="Brak kategorii. Dodaj nową." 
        loading-text="Wczytywanie">
        <template v-slot:item.name="{ value }">
            {{value}}
        </template>
        <template v-slot:item.action="{ item, value }">
            <div>
                <VBtn icon="mdi-delete" title="Usuń" variant="flat" :loading="item.deleting" @click="deleteCategory(item)"></VBtn>
            </div>
        </template>
    </v-data-table>
    <ConfirmDialog ref="confirmDialog"/>
</template>


<script setup>
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage} = useWebApiResponseParser();
const confirmDialog = ref(null);

const deleteCategory = (category) => {
    confirmDialog.value.show({
        title: "Potwierdź usunięcie",
        text: "Czy na pewno chcesz usunać kategorię?",
        confirmBtnText: 'Usuń',
        confirmBtnColor: 'error'
    }).then((confirm) => {
        if (confirm){
            category.deleting = true;
            useWebApiFetch('/Category/DeleteCategory', {
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
                    removeCategory(category);
                }
            })
            .finally(() => {
                category.deleting = false;
            });
        }
    })
}

const emit = defineEmits(['remove-category']);
const removeCategory = (category) => {
  emit('remove-category', category);
};

const props = defineProps({
    loading: Boolean,
    items: Array,
    headers: Array
});
</script>