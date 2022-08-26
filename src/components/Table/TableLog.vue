<script setup>
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { onMounted, ref } from "vue";
// import { useMainStore } from "@/stores/main";
import { mdiArrowBottomLeft } from "@mdi/js";
import CardBoxModal from "@/components/CardBoxModal.vue";
// import TableCheckboxCell from "@/components/TableCheckboxCell.vue";
import PillTag from "@/components/PillTag.vue";
import BaseButton from "@/components/BaseButton.vue";
import FormControl from "@/components/FormControl.vue";
import FormField from "@/components/FormField.vue";
import moment from "moment";
import CardBox from "../CardBox.vue";
import { FilterMatchMode, FilterOperator } from "primevue/api";
// import UserAvatar from "@/components/UserAvatar.vue";

defineProps({
  checkable: Boolean,
});
const today = new Date();
const isModalActive = ref(false);

const startDate = ref(null);
const endDate = ref(today);

const logData = ref(null);
const error = ref(null);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  stockName: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  created_at: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
  machine: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  shift: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  category: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  action: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
});

onMounted(async () => {
  startDate.value = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
  await fetch(`http://localhost:8080/logging/range?
    start=${startDate.value.toISOString()}&end=${endDate.value.toISOString()}`)
    .then((res) => res.json())
    .then((json) => (logData.value = json))
    .catch((err) => (error.value = err));
});

const fetchDataByRange = () => {
  fetch(
    `http://localhost:8080/logging/range?start=${startDate.value.toISOString()}&end=${endDate.value.toISOString()}`
  )
    .then((res) => res.json())
    .then((json) => (logData.value = json))
    .catch((err) => (error.value = err));
};

const actionColor = (action) => {
  if (action === "create") {
    return "success";
  } else if (action === "update") {
    return "warning";
  } else if (action === "delete") {
    return "danger";
  }
  return "info";
};
</script>

<template>
  <CardBoxModal v-model="isModalActive" title="Sample modal">
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <CardBox>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="flex flex-col justify-between">
        <h2>Start date:</h2>
        <Datepicker v-model="startDate"></Datepicker>
      </div>
      <div class="flex flex-col justify-between">
        <h2>End date:</h2>
        <Datepicker v-model="endDate"></Datepicker>
      </div>
    </div>

    <div class="grid grid-cols-1">
      <div class="flex flex-col justify-between">
        <BaseButton
          :icon="mdiArrowBottomLeft"
          color="info"
          label="Fetch data"
          @click="fetchDataByRange()"
        ></BaseButton>
      </div>
    </div>
  </CardBox>

  <CardBox>
    <DataTable
      v-model:filters="filters"
      :value="logData"
      responsive-layout="scroll"
      :global-filter-fields="[
        'stockName',
        'action',
        'machine',
        'shift',
        'category',
        'created_at',
      ]"
    >
      <template #header>
        <div class="flex justify-content-center align-items-center">
          <FormField label="Search" help="Below data table will be filtered">
            <FormControl
              v-model="filters['global'].value"
              type="text"
              placeholder="Search text"
            />
          </FormField>
        </div>
      </template>
      <Column field="action" header="Action" :sortable="true">
        <template #body="{ data }">
          <PillTag
            :color="actionColor(data.action)"
            :label="data.action"
            small
          />
        </template>
      </Column>
      <Column field="stockCode" header="Stock Code" :sortable="true"></Column>
      <Column field="stockName" header="Stock Name" :sortable="true"></Column>
      <Column field="machine" header="Machine" :sortable="true"></Column>
      <Column field="shift" header="Shift" :sortable="true"></Column>
      <Column field="totalQty" header="Total qty" :sortable="true"></Column>
      <Column field="category" header="Category" :sortable="true"></Column>
      <Column field="stockGroup" header="Group" :sortable="true"></Column>
      <Column field="class" header="Class" :sortable="true"></Column>
      <Column field="purchasePrice" header="Price" :sortable="true"></Column>
      <Column field="uom" header="UOM" :sortable="true"></Column>
      <Column field="weight" header="Weight" :sortable="true"></Column>
      <Column field="created_at" header="Created At" :sortable="true">
        <template #body="{ data }">
          <small
            class="text-gray-500 dark:text-slate-400"
            :title="moment(new Date(data.created_at)).format('LLLL')"
            >{{
              moment(new Date(data.created_at)).format("MM/DD/YYYY, h:mm a")
            }}</small
          >
        </template>
      </Column>
    </DataTable>
  </CardBox>
</template>
