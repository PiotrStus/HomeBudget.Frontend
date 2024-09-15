<template>
					<div>
						<v-btn variant="flat" style="padding: 0; margin: 0">
							Kwota
							<v-icon icon="mdi-filter-outline" />
							<v-menu
								activator="parent"
								location="bottom end"
								transition="fab-transition"
								:close-on-content-click="false"
							>
								<v-list>
									<v-list-item class="d-flex align-center">
										<div class="d-block align-center w-100">
											<v-number-input
												class="mt-4"
												v-model="debouncedMinAmount"
												variant="outlined"
												controlVariant="default"
												label="Od"
												:style="{ minWidth: '200px' }"
												:clearable="true"
												@click:clear="() => clearFilter('localAmountMinFilter')"
											/>
											<v-number-input
											v-model="debouncedMaxAmount"	
											variant="outlined"
											controlVariant="default"
											label="Do"
											:style="{ minWidth: '200px' }"
											:clearable="true"
											@click:clear="() => clearFilter('localAmountMaxFilter')"
											/>
										</div>
									</v-list-item>
								</v-list>
							</v-menu>
						</v-btn>
					</div>
</template>

<script setup>
import { VNumberInput } from "vuetify/labs/VNumberInput";
const localAmountMinFilter = defineModel("amountMinFilter");
const localAmountMaxFilter = defineModel("amountMaxFilter");


const clearFilter = (filterName) => {
  if (filterName === "localAmountMinFilter") {
    debouncedMinAmount.value = null;
	
  } else if (filterName === "localAmountMaxFilter") {
    debouncedMaxAmount.value = null;
  }
};

const debouncedMinAmount = ref(localAmountMinFilter.value);
const debouncedMaxAmount = ref(localAmountMaxFilter.value);

watch(debouncedMinAmount, (newVal) => {
	if (newVal !== localAmountMinFilter.value) {
	console.log('znowu sie zmieniam Min')
	updateMinFilterDebounced(newVal);
	console.log(localAmountMinFilter.value);
	}
});

watch(debouncedMaxAmount, (newVal) => {
	if (newVal !== localAmountMaxFilter.value) {
	console.log('znowu sie zmieniam Max')
	updateMaxFilterDebounced(newVal);
	console.log(localAmountMaxFilter.value);
	}
});

watch(localAmountMinFilter, (newVal) => {
	if (newVal !== debouncedMinAmount.value) {
	console.log('znowu sie zmieniam local Min')
	debouncedMinAmount.value = newVal;
	console.log(debouncedMinAmount.value);
	}
});

watch(localAmountMaxFilter, (newVal) => {
	if (newVal !== debouncedMaxAmount.value) {
	console.log('znowu sie zmieniam local Max')
	debouncedMaxAmount.value = newVal;
	console.log(debouncedMaxAmount.value);
	}
});


const updateMinFilterDebounced = useDebounceFn((value) => {
  localAmountMinFilter.value = value;
  console.log(localAmountMinFilter.value);
}, 1300);

const updateMaxFilterDebounced = useDebounceFn((value) => {
  localAmountMaxFilter.value = value;
  console.log(localAmountMaxFilter.value);
}, 1300);

watch([debouncedMinAmount, debouncedMaxAmount, localAmountMinFilter, localAmountMaxFilter], () => {
	console.log(debouncedMinAmount.value);
	console.log(localAmountMinFilter.value);
	console.log(debouncedMaxAmount.value);
	console.log(localAmountMaxFilter.value);
});

</script>