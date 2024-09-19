import { defineStore } from "pinia";

export const useCategoriesStore = defineStore({

	id: "categories-store",

	state: () => {
		return {
		loading: false,
		loaded: false,
		categories: []
	};
	},
	
	getters: {
		incomeCategories: (state) => { return state.categories.filter(category => category.categoryType === 'Income');},
		expenseCategories: (state) => { return state.categories.filter(category => category.categoryType === "Expense");}
	},

	actions: {
		loadCategories(force = false) {
			this.loading = true;
			if (!force && this.loaded) {
				return Promise.resolve().finally(() => {
					this.loading = false;
				});
			}
			return useWebApiFetch('/Category/GetAllCategories')
				.then(({ data, error}) => {
					if (data.value) {
						this.categories = data.value.categories;
					} else if (error.value) {
						this.categories = [];
					}
				})
				.finally(() => {
					this.loading = false;
				})
		},
		removeCategory(categoryToRemove) {
			this.categories = this.categories.filter(category => category !== categoryToRemove);
		},
	}
});