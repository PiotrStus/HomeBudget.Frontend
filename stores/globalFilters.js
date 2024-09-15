import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const useGlobalFiltersStore = defineStore({
  id: "globalFilters-store",
  state: () => {
    return {
      filters: useStorage('global-filters', {}) 
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