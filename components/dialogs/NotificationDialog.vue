<!-- template to html komponentu -->
<template>
	<VDialog v-model="show" width="400" scroll-strategy="none" @click:outside="handleClose">
		<v-card class="py-4">
			<v-card-title class="d-flex align-center">
				<v-icon class="mr-2">mdi-bell</v-icon>
				<h3>Powiadomienie</h3>
			</v-card-title>
			<v-card-subtitle>
				Data: {{ dayjs(props.notification.date).format("DD.MM.YYYY HH:mm") }}
			</v-card-subtitle>
			<v-card-text class="pa-4">
				<p>{{ getNotificationDescription(props.notification) }}</p>
				<p>Kategoria: {{ props.notification.categoryName }}</p>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="handleClose" color="primary">Zamknij</v-btn>
			</v-card-actions>
		</v-card>
	</VDialog>
</template>




<script setup>
const dayjs = useDayjs();
const show = defineModel("show");

const emit = defineEmits(['notificationClosed']);

const props = defineProps({
    notification: Object
});

const handleClose = () => {
	show.value = false;
	console.log("close");
	emit('notificationClosed');
};

const getNotificationDescription = (notification) => {
			if (notification.content === 'CategoryLimitExceeded') {
				return `Przekroczono planowany limit`;
			} else {
				return notification.content;
			}
		}

</script>
