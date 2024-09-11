<template>
	<v-btn variant="flat" style="padding: 0; margin: 0">
		Kategoria
		<v-icon icon="mdi-filter-outline" />
		<v-menu
			activator="parent"
			location="bottom end"
			transition="fab-transition"
			:close-on-content-click="false"
		>
			<v-list>
				<v-list-item class="d-flex align-center">
					<v-autocomplete
						label="Szukaj"
						:items="props.categories"
						item-title="name"
						item-value="id"
						v-model="categoryFilter"
						class="mt-4"
						variant="outlined"
						:style="{ minWidth: '200px' }"
						:clearable="true"
						@click:clear="() => clearFilter('categoryFilter')"
					/>
				</v-list-item>
			</v-list>
		</v-menu>
	</v-btn>
</template>



<script setup>
const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
});

const categoryFilter = defineModel('categoryFilter');

const clearFilter = (filterName) => {
  if (filterName === 'categoryFilter') {
    categoryFilter.value = null;
  }
};


</script>
