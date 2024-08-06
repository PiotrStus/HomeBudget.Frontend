import { defineStore } from "pinia";

export const useYearBudgetsStore = defineStore({

	id: "yearBudgets-store",

	state: () => {
		return {
		loading: false,
		yearBudgets: [],
		currentYearBudgetId: null,
		currentYearBudget: null
	};
	},
	actions: {
		loadYearBudgets() {
			this.loading = true;
			useWebApiFetch('/Budget/GetAllYearBudgets')
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
		},
		setCurrentYearBudget() {
			console.log('Current Year Budget ID:', this.currentYearBudgetId);
			this.yearBudgets.forEach(budget => {
			  console.log('Budget ID:', budget.id, 'Type:', typeof budget.id);
			});
			console.log(this.yearBudgets)
			const budget = this.yearBudgets.find(b => b.id === Number(this.currentYearBudgetId));
			console.log("test")
			console.log(budget)
			this.currentYearBudget = budget ? budget : null;
		}
	}
});