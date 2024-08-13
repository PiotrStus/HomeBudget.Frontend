<template>
	<VCard>
		<v-toolbar color="transparent">
			<template v-slot:prepend>
				<v-btn icon="mdi-chevron-left" to="/budgets"></v-btn>
			</template>
			<v-toolbar-title>
				Edycja budżetu miesięcznego
			</v-toolbar-title>
		</v-toolbar>
		<VSkeletonLoader v-if="loading" type="paragraph, actions"></VSkeletonLoader>
		<VForm v-else @submit.prevent="submit" :disabled="saving">
			<VCardText>
				<VTextField :rules="[ruleRequired, ruleMaxLen(50)]" v-model="viewModel.year" variant="outlined" label="Nazwa kategorii">
				</VTextField>
				<!-- <v-select v-model="viewModel.categoryType" :rules="[ruleRequired]" variant="outlined" label="Typ kategorii" :items=categoryOptions item-title="title" item-value="value" ></v-select> -->
			</VCardText>
			<VCardText class ="text-right">
				<VBtn prepend-icon="mdi-content-save" variant="flat" color="primary" 
					type="submit" :loading="saving" :disabled="loading">
					Zapisz
				</VBtn>
			</VCardText>
		</VForm>
	</VCard>
</template>



<script setup>
const loading = ref(false);
const saving = ref(false);
const router = useRouter();
const {ruleRequired, ruleMaxLen} = useFormValidationRules();


const viewModel = ref({
	year: '',
	month: '',
	plannedAmount: false
})

const submit = async (ev) => {
	const {valid} = await ev;
	if (valid) {
		console.log('test submit');
		//save();
	}
}

</script>