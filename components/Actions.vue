<template>
	<v-btn icon title="Więcej" variant="flat">
		<v-icon icon="mdi-dots-vertical" />
		<v-menu
			activator="parent"
			location="bottom end"
			transition="fab-transition"
		>
			<v-list rounded="lg">
				<v-list-item
					:loading="props.item.deleting"
					@click="handleDelete"
					title="Usuń"
				>
					<template v-slot:prepend>
						<v-icon icon="mdi-delete" />
					</template>
				</v-list-item>
				<v-list-item
					:disabled="props.item.deleting"
					:to="`/${props.path}/${props.item.id}`"
					title="Edytuj"
				>
					<template v-slot:prepend>
						<v-icon icon="mdi-pencil" />
					</template>
				</v-list-item>
			</v-list>
		</v-menu>
	</v-btn>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  path: {
	type: String,
	required: true
  }
});

const emit = defineEmits(['itemDeleted']);

const handleDelete = () => {
  emit('itemDeleted', props.item);
};

</script>
