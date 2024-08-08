import { defineStore } from "pinia";

export const useYearBudgetsStore = defineStore({

	id: "yearBudgets-store",

	state: () => {
		return {
		loading: false,
		yearBudgets: []
	};
	},
	actions: {
		loadYearBudgets() {
			this.loading = true;
			useWebApiFetch('/Budget/GetBudgets')
				.then(({ data, error}) => {
					if (data.value) {
						this.yearBudgets = data.value.yearBudgets;
					} else if (error.value) {
						this.yearBudgets = [];
					}
				})
				.finally(() => {
					this.loading = false;
				})
		}
	}
});