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
                <VBtn icon="mdi-delete" title="Usuń" variant="flat" :loading="item.deleting" @click="deleteUrl(item)"></VBtn>
                <VBtn icon="mdi-pencil" title="Edytuj" variant="flat" :to="`/categories/${item.id}`"></VBtn>
            </div>
        </template>
    </v-data-table>
    <ConfirmDialog ref="confirmDialog"/>
</template>


<script setup>
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage} = useWebApiResponseParser();
const confirmDialog = ref(null);

const deleteUrl = (item) => {
    confirmDialog.value.show({
        title: "Potwierdź usunięcie",
        text: "Czy na pewno chcesz usunać kategorię?",
        confirmBtnText: 'Usuń',
        confirmBtnColor: 'error'
    }).then((confirm) => {
        if (confirm){
            item.deleting = true;
            useWebApiFetch('/Budget/DeleteCategory', {
                method: 'POST',
                body: {id : item.id},
                watch: false,
                onResponseError: ({ response }) => {
                    let message = getErrorMessage(response, {})
                    globalMessageStore.showErrorMessage(message);
                }
            })
            .then((response) => {
                if (response.data.value) {
                    globalMessageStore.showSuccessMessage("Kategoria została usunięta");
                    removeItem(item);
                }
            })
            .finally(() => {
                item.deleting = false;
            });
        }
    })
}

const emit = defineEmits(['remove-item']);
const removeItem = (item) => {
  emit('remove-item', item);
};

const props = defineProps({
    loading: Boolean,
    items: Array,
    headers: Array
});
</script>