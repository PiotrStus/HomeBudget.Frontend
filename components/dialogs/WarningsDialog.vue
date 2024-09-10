<!-- template to html komponentu -->
<template>
	<VDialog v-model="show" width="400" scroll-strategy="none">
		<VCard class="py-4">

		</VCard>
	</VDialog>
</template>




<script setup>

const show = defineModel("show");

</script>
