<template>
<VCard>
        <v-toolbar color="transparent">
            <v-toolbar-title>
                Aktywni użytkownicy
            </v-toolbar-title>
            <template v-slot:append>
                <div class="mr-2">
                    <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="showDialog = true" >Dodaj</v-btn>
                </div>
            </template>
        </v-toolbar>
        <AddUserDialog v-model:show="showDialog" @userAdded="handleUserChanged"/>
        <v-card-text>
            <Users :loading="loading" :items="users" :headers="headers" @user-removed="handleUserChanged"/>
        </v-card-text>
    </VCard>
</template>



<script setup>
const showDialog = ref(false);
const loading = ref(false);
const users = ref([]);

const headers = ref([
    {title: 'Użytkownik', value: 'email', text: 'bold'},
    {title: '', value: 'action', align: 'end'}
]);

const loadUsers = async () => {
	loading.value = true;
	useWebApiFetch("/Account/GetUsers")
		.then(({ data, error }) => {
			if (data.value) {
                users.value = data.value.users;
			} else if (error.value) {
				users.value = [];
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

const handleUserChanged = () => {
    loadUsers();
};

onMounted(loadUsers)
</script>