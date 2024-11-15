import { defineStore } from "pinia";
import _ from 'lodash';

export const useYearBudgetsStore = defineStore({

	id: "yearBudgets-store",

	state: () => {
		return {
		loading: false,
		loaded: false,
		yearBudgets: []
	};
	},
	actions: {
		 loadYearBudgets(force = false) {
			this.loading = true;
			if (!force && this.loaded) {

				return Promise.resolve().finally(() => {
					this.loading = false;
				});
			}
			return useWebApiFetch('/Budget/GetBudgets')
				.then(({ data, error }) => {
					if (data.value) {
						const copiedYearBudgets = _.cloneDeep(data.value.yearBudgets);
						const sortedYearBudgets = copiedYearBudgets.sort((a, b) => a.year - b.year);
						this.yearBudgets = sortedYearBudgets;
						this.loaded = true;
					} else if (error.value) {
						this.yearBudgets = [];
						this.loaded = false;
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