<template>
	<v-btn icon variant="flat">
		<v-badge
			v-if="notificationsLength > 0"
			:content="notificationsLength"
			color="red"
		>
			<v-icon>mdi-bell</v-icon>
		</v-badge>
		<v-icon v-else>mdi-bell-outline</v-icon>
	</v-btn>
	<v-menu
		activator="parent"
		location="bottom end"
		transition="scale-transition"
	>
		<v-list
			rounded="lg"
			style="max-height: 200px; max-width: 300px; overflow-y: auto"
		>
			<v-list-item v-if="notificationsLength === 0">
				<v-list-item-title style="white-space: normal; text-align: center"
					>Brak nowych powiadomień</v-list-item-title
				>
			</v-list-item>
			<v-list-item
				v-for="notification in notificationsStore.notifications"
				:key="notification.id"
				@click="handleNotificationClick(notification)"
				class="py-2 px-0"
			>
				<VCard >
					<v-card-title>Przekroczono limit</v-card-title>
					<v-card-subtitle>Data: {{ dayjs(notification.date).format("DD.MM.YYYY HH:mm") }}</v-card-subtitle>
					<v-card-text class="text-truncate">
						{{ getNotificationTitle(notification) }}
					</v-card-text>
				</VCard>
			</v-list-item>
		</v-list>
	</v-menu>
	<NotificationDialog
		v-model:show="showDialog"
		:notification="selectedNotification"
		@notificationClosed="handleNotificationClosed"
	/>
</template>

<script setup>
const dayjs = useDayjs();
import getNotificationTitle from "~/utils/notifications";
const showDialog = ref(false);
const selectedNotification = ref(null);
const notificationsStore = useNotificationsStore();

const handleNotificationClick = (notification) => {
	selectedNotification.value = notification;
	showDialog.value = true;
};

const handleNotificationClosed = () => {
	notificationsStore.confirmNotification(selectedNotification.value.id);
};

const notificationsLength = computed(() => {
	return notificationsStore.notifications?.length || 0;
});
</script>