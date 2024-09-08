import { defineStore } from "pinia";

export const useGlobalFiltersStore = defineStore({
	id: "globalFilters-store",
	state: () => {
		return {
			filters: {}
		};
	},
	actions: {
		setFilters(listingId, filterData) {
			this.filters[listingId] = filterData;
		},

		getFilters(listingId) {
			return this.filters[listingId] || {};
		}
	},
});
