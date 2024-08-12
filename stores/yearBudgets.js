import { defineStore } from "pinia";
import _ from 'lodash';

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
			return useWebApiFetch('/Budget/GetBudgets')
				.then(({ data, error }) => {
					if (data.value) {
						const copiedYearBudgets = _.cloneDeep(data.value.yearBudgets);
						const sortedYearBudgets = copiedYearBudgets.sort((a, b) => a.year - b.year);
						this.yearBudgets = sortedYearBudgets;
						console.log(this.yearBudgets)
					} else if (error.value) {
						this.yearBudgets = [];
					}
				})
				.finally(() => {
					this.loading = false;
				})
		},
		removeYearBudget(budgetToRemove) {
			this.yearBudgets = this.yearBudgets.filter(budget => budget !== budgetToRemove);
		},
	}
});