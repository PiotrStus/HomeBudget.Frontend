import { defineStore } from "pinia";

export const useNotificationsStore = defineStore({
	id: "notifications-store",

	state: () => {
		return {
			notifications: [],
			lastNotification: null,
			isNewNotification: false,
			newNotifications: [],
			isFirstLoad: true,
		};
	},

	actions: {
		loadNotifications() {
			useWebApiFetch("/User/GetUserNotifications")
				.then(({ data, error }) => {
					if (data.value) {
						console.log(data.value);
						this.notifications = data.value.notifications;
						console.log(this.notifications);
						this.updateLastNotification();
					} else if (error.value) {
						console.log("Brak powiadomień");
					}
				})
				.finally(() => {
					console.log(this.lastNotification);
					console.log(this.isNewNotification);
					console.log(this.newNotifications);
				});
		},

		updateLastNotification() {
			if (this.notifications.length > 0) {
				this.notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

				const newestNotification = this.notifications[0];
				this.newNotifications = [];

				if (
					!this.lastNotification ||
					new Date(newestNotification.date) >
						new Date(this.lastNotification.date)
				) {
					this.isNewNotification = true;

					for (const notification of this.notifications) {
						if (
							!this.lastNotification ||
							new Date(notification.date) > new Date(this.lastNotification.date)
						) {
							this.newNotifications.push(notification);
						}
					}

					this.lastNotification = newestNotification;
				} else {
					this.isNewNotification = false;
				}
			} else {
				this.lastNotification = null;
				this.isNewNotification = false;
				this.newNotifications = [];
			}
		},
	},
});
