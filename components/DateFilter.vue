<template>
	<div>
		<v-btn variant="flat" style="padding: 0; margin: 0">
			Data
			<v-icon icon="mdi-filter-outline" />
			<v-menu
				activator="parent"
				location="bottom end"
				transition="fab-transition"
				:close-on-content-click="false"
			>
				<v-list class="d-flex">
					<v-list-item>
						<TextFieldDatePicker
							textFieldClass="mt-4"
							v-model="localDateFilter"
							variant="outlined"
							label="Data operacji"
							:textFieldStyle="{ minWidth: '300px' }"
							:date="props.date"
						/>
					</v-list-item>
				</v-list>
			</v-menu>
		</v-btn>
	</div>
</template>



<script setup>

const localDateFilter = defineModel("dateFilter");

const props = defineProps({
  "date": Object
});

</script>