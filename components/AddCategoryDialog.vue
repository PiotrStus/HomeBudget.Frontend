<template>
	<VDialog v-model="localShow" width="400" scroll-strategy="none">
		<VCard class="py-4">
			<VCardTitle class="text-center">Dodaj kategorię</VCardTitle>
			<VForm @submit.prevent="submit">
				<VCardText>
					<v-text-field class="mb-4" variant="outlined" v-model="viewModel.categoryName" label="Nazwa kategorii"></v-text-field>
					<v-select class="mb-4" variant="outlined" label="Typ kategorii" v-model="viewModel.categoryType" :items="['Przychody', 'Wydatki']"></v-select>
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
  show: Boolean
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
	categoryName: '',
	categoryType: ''
});

const handleCancel = () => {
    viewModel.value.categoryName = '';
    viewModel.value.categoryType = '';
	localShow.value = false;
	//emit('update:show', false);
};

const submit = () => {
	console.log(viewModel.value);
	handleCancel();
};



</script>