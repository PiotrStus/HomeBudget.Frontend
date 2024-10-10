<template>
    <v-data-table 
        :loading="props.loading" 
        :items="props.items" 
        :headers="props.headers" 
        items-per-page-text="Liczba wierszy na stronę"
        :items-per-page-options="[10, 20, 50]" 
        page-text="{0}-{1} z {2}" 
        no-data-text="Brak użytkowników. Dodaj nowego." 
        loading-text="Wczytywanie">
        <template v-slot:item.name="{ value }">
            {{value}}
        </template>
        <template v-slot:item.action="{ item, value }">
            <div>
                <VBtn icon="mdi-delete" title="Usuń" variant="flat" :loading="item.deleting" @click="deleteUser(item)"></VBtn>
            </div>
        </template>
    </v-data-table>
    <ConfirmDialog ref="confirmDialog"/>
</template>


<script setup>
const globalMessageStore = useGlobalMessageStore();
const { getErrorMessage} = useWebApiResponseParser();
const confirmDialog = ref(null);

const deleteUser = (user) => {
    confirmDialog.value.show({
        title: "Potwierdź usunięcie",
        text: "Czy na pewno chcesz usunać użytkownika?",
        confirmBtnText: 'Usuń',
        confirmBtnColor: 'error'
    }).then((confirm) => {
        if (confirm){
            user.deleting = true;
            useWebApiFetch('/Account/DeleteUser', {
                method: 'POST',
                body: {id : user.id},
                watch: false,
                onResponseError: ({ response }) => {
                    let message = getErrorMessage(response, {})
                    globalMessageStore.showErrorMessage(message);
                }
            })
            .then((response) => {
                if (response.data.value) {
                    globalMessageStore.showSuccessMessage("Użytkownik został usunięty");
                    removeUser();
                }
            })
            .finally(() => {
                user.deleting = false;
            });
        }
    })
}

const emit = defineEmits(['user-removed']);
const removeUser = () => {
  emit('user-removed');
};

const props = defineProps({
    loading: Boolean,
    items: Array,
    headers: Array
});
</script>