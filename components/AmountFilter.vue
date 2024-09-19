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
												:model-value="localAmountMinFilter"
												@update:model-value="$event => updateMinFilterDebounced($event)"
												variant="outlined"
												controlVariant="default"
												label="Od"
												:style="{ minWidth: '200px' }"
												:clearable="true"
												@click:clear="() => clearFilter('localAmountMinFilter')"
											/>
										<v-number-input
											:model-value="localAmountMaxFilter"
											@update:model-value="$event => updateMaxFilterDebounced($event)"	
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
    localAmountMinFilter.value = null;
	
  } else if (filterName === "localAmountMaxFilter") {
    localAmountMaxFilter.value = null;
  }
};

const updateMinFilterDebounced = useDebounceFn((value) => {
  localAmountMinFilter.value = value;
}, 500);

const updateMaxFilterDebounced = useDebounceFn((value) => {
  localAmountMaxFilter.value = value;
}, 500);



</script>