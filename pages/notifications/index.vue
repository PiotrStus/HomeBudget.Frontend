<template>
	<div @click="notificationsStore.loadNotifications()">
		<h1>Notifications</h1>
	</div>
</template>

<script setup>

const notificationsStore = useNotificationsStore();

</script>