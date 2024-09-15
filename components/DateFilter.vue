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
						/>
					</v-list-item>
					<!-- <v-list-item class="d-flex align-center">
						<v-btn variant="flat" icon>
							<v-icon>mdi-filter-plus</v-icon>
						</v-btn>
					</v-list-item> -->
				</v-list>
			</v-menu>
		</v-btn>
	</div>
</template>



<script setup>

const localDateFilter = defineModel("dateFilter");

</script>