<template>
	<VDialog v-model="localShow" width="400" scroll-strategy="none" @click:outside="handleCancel">
		<VCard class="py-4">
			<VCardTitle class="text-center">Dodaj kategorię</VCardTitle>
			<VForm @submit.prevent="submit" :disabled="loading">
				<VCardText>
					<v-text-field class="mb-4" variant="outlined" v-model="viewModel.name" label="Nazwa kategorii"></v-text-field>
					<v-select class="mb-4" variant="outlined" label="Typ kategorii" v-model="viewModel.categoryType" :items="categoryOptions" item-title="label" item-value="value"></v-select>
					<VAlert v-if="errorMsg" type="error" variant="tonal"> {{ errorMsg }}</VAlert>
				</VCardText>
				<VCardActions>
					<v-btn class="mx-auto" color="primary" type="button" variant="elevated" @click="handleCancel">Anuluj</v-btn>
					<v-btn class="mx-auto" color="primary" type="submit" variant="elevated">Ok</v-btn>
				</VCardActions>
			</VForm>
		</VCard>
	</VDialog>


</template>


<style lang="scss" scoped>

</style>


<script setup>


const props = defineProps({
  show: Boolean,
  fetchData: Function
});



const emit = defineEmits(['update:show']);


//const localShow = ref(props.show);

//watch(() => props.show, (newShow) => {
//  localShow.value = newShow;
//  console.log("localShow.value:" + localShow.value);
//});

//watch(localShow, (newLocalShow) => {
//  emit('update:show', newLocalShow);
//});

const localShow = computed({
  get: () => props.show,
  set: (newState) => emit('update:show', newState) 
});


const viewModel = ref({
	name: '',
	categoryType: ''
});

const handleCancel = () => {
    viewModel.value.name = '';
    viewModel.value.categoryType = '';
	localShow.value = false;
	errorMsg.value = "";
	//emit('update:show', false);
};

const submit = () => {
	console.log(viewModel.value);
	addNewCategory();
};

const errorMsg = ref("");
const loading = ref(false);

const addNewCategory = () => {
	loading.value = true;
	errorMsg.value = "";

	useWebApiFetch('/Budget/CreateCategory', {
		method: 'POST',
		body: {...viewModel.value},
		onResponseError: ({response}) => {
			errorMsg.value = "Błąd dodawania nowej kategorii";
		}
	})
	.then((response) => {
		if (response.data.value) {
			props.fetchData();
			handleCancel();
		}
	})
	.finally(() => {
		loading.value = false;
	});
};

const categoryOptions = [
  { label: 'Przychody', value: 'Income' },
  { label: 'Wydatki', value: 'Expense' },
];

</script>