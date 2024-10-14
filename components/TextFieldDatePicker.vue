<template>
  <v-menu v-model="open" bottom left offset-y :close-on-content-click="false" :disabled="readonly" min-width="200">
    <template v-slot:activator="{ props }">
      <v-text-field :variant="variant" v-bind="props" :model-value="textValue" :label="label" :rules="rules"
        :hide-details="hideDetails" :readonly="readonly" :clearable="!readonly" @click:clear="clear " :style="textFieldStyle"
        @update:model-value="onTextFieldInput" :class="[textFieldClass]">
        <template v-slot:append-inner>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
    </template>

    <v-date-picker 
              hide-header 
              :multiple="range ? 'range' : false" 
              :model-value="pickerValue"
              @update:model-value="onPickerInput"
              :min="props.date ? props.date.startOf('month').format('YYYY-MM-DD') : null"
              :max="props.date ? props.date.endOf('month').format('YYYY-MM-DD') : null"
    >
      <template #actions v-if="range">
        <v-btn variant="text" @click="cancel"> Anuluj </v-btn>
        <v-btn variant="text" color="primary" @click="save"> Ok </v-btn>
      </template>
    </v-date-picker>
  </v-menu>
</template>

<script setup>
const dayjs = useDayjs();
const model = defineModel();
const props = defineProps({
  range: {
    type: Boolean,
    default: false,
  },
  "label": String,
  "variant": String,
  "rules": Array,
  "hideDetails": Boolean,
  "readonly": {
    type: Boolean,
    default: false
  },
  "textFieldClass" : String,
  "textFieldStyle": Object,
  "menuStyle": Object,
  "date": Object
});

const open = ref(false);
const pickerValue = ref(null);

watch(open, (v) => {
  if (v) {
    setPickerValueFromModel();
  }
})

const dateFormat = "DD.MM.YYYY";
const dateRangeSymbol = "~";

const textValue = computed(() => {
  if (!model.value || (_isArray(model.value) && model.value.length == 0)) {
    return "";
  }

  if (props.range) {
    if (model.value.length > 1) {
      return `${dayjs(model.value[0]).format(dateFormat)} ${dateRangeSymbol} ${dayjs(model.value[model.value.length - 1]).format(dateFormat)}`;
    }
    else {
      return dayjs(model.value[0]).format(dateFormat);
    }
  } else {
    return dayjs(model.value).format(dateFormat);
  }
});

function save() {
  let newRangeValue = [];
  if (_isArray(pickerValue.value) && pickerValue.value.length > 0) {
    newRangeValue.push(pickerValue.value[0]);

    if (pickerValue.value.length > 1) {
      newRangeValue.push(pickerValue.value[pickerValue.value.length - 1]);
    }
  }

  model.value = newRangeValue;
  open.value = false;
}

function cancel() {
  pickerValue.value = null;
  open.value = false;
}

function clear() {
  model.value = props.range ? [] : null;
  pickerValue.value = null;
}

function onPickerInput(v) {
  pickerValue.value = v;

  if (!props.range) {
    model.value = v;
    open.value = false;
  }
}

function onTextFieldInput(v) {
  setModelFromText(v);
}

function setModelFromText(v) {
  if (!v) {
    model.value = null;
  }
  else {
    if (props.range) {
      const splitedV = v.split(dateRangeSymbol);
      const parsedStartDate = dayjs(splitedV[0].trim(), dateFormat, true);
      if (parsedStartDate.isValid()) {
        if (splitedV.length > 1) {
          const parsedEndDate = dayjs(splitedV[1].trim(), dateFormat, true);
          if (parsedEndDate.isValid() && Math.abs(parsedStartDate.diff(parsedEndDate, "year")) < 11) {
            model.value = [parsedStartDate.toDate(), parsedEndDate.toDate()];
          }
        }
        else {
          model.value = [parsedStartDate.toDate()];
        }
      }
    } else {
      const parsedDate = dayjs(v.trim(), dateFormat, true);
      if (parsedDate.isValid()) {
        model.value = parsedDate.toDate();
      }
    }
  }

  if (open.value) {
    nextTick(() => {
      setPickerValueFromModel();
    })
  }
}

function setPickerValueFromModel() {
  if (!model.value || (_isArray(model.value) && model.value.length == 0)) {
    return pickerValue.value = null;
  }

  if (props.range) {
    if (model.value.length > 1) {
      pickerValue.value = getDatesRange(model.value[0], model.value[model.value.length - 1]);
    }
    else {
      pickerValue.value = [model.value[0]];
    }
  } else {
    pickerValue.value = model.value;
  }
}

function getDatesRange(start, end) {
  let startOfRange = dayjs(start);
  let endOfRange = dayjs(end);

  if (endOfRange.isBefore(startOfRange)) {
    startOfRange = dayjs(end);
    endOfRange = dayjs(start);
  }

  let currentDate = dayjs(startOfRange);
  let ranges = [];

  while (currentDate.isBefore(endOfRange) || currentDate.isSame(endOfRange)) {
    ranges.push(currentDate.toDate());
    currentDate = currentDate.add(1, 'day');
  }

  return ranges;
}

</script>
