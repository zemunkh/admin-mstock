<script setup>
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { onMounted, ref } from "vue";
// import { useMainStore } from "@/stores/main";
import { mdiArrowBottomLeft, mdiDelete } from "@mdi/js";
// import TableCheckboxCell from "@/components/TableCheckboxCell.vue";
import PillTag from "@/components/PillTag.vue";
import BaseButton from "@/components/BaseButton.vue";
import FormControl from "@/components/FormControl.vue";
import FormField from "@/components/FormField.vue";
import CardBoxModal from "@/components/CardBoxModal.vue";
import moment from "moment";
import CardBox from "../CardBox.vue";
import { FilterMatchMode, FilterOperator } from "primevue/api";
// import UserAvatar from "@/components/UserAvatar.vue";

defineProps({
  checkable: Boolean,
});
const today = new Date();

const startDate = ref(null);
const endDate = ref(today);

const logData = ref(null);
const error = ref(null);

const isModalDeleteActive = ref(false);
const isModalResultActive = ref(false);

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
  device: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  uom: {
    operator: FilterOperator.OR,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  class: {
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
    .then((json) => {
      if (json.length > 0) {
        json.forEach((el) => {
          el.created_at = new Date(el.created_at);
        });
        logData.value = json;
      } else {
        isModalResultActive.value = true;
      }
    })
    .catch((err) => (error.value = err));
});

const fetchDataByRange = () => {
  fetch(
    `http://localhost:8080/logging/range?start=${startDate.value.toISOString()}&end=${endDate.value.toISOString()}`
  )
    .then((res) => res.json())
    .then((json) => {
      if (json.length > 0) {
        json.forEach((el) => {
          el.created_at = new Date(el.created_at);
        });
        logData.value = json;
      } else {
        isModalResultActive.value = true;
      }
    })
    .catch((err) => (error.value = err));
};

const deleteData = async () => {
  logData.value.forEach((el) => {
    const delData = {
      id: el.id,
    };
    fetch("http://localhost:8080/logging/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(delData),
    })
      .then(() => {
        console.log(`ID ${el.id} Deleted successfully ✅  ${typeof el.id} `);
        const index = logData.value.findIndex((key) => key.id === el.id);
        logData.value.splice(index, 1);
      })
      .catch((err) => (error.value = err));
  });
};

const actionColor = (action) => {
  if (action.includes("new")) {
    return "success";
  } else if (action.includes("update")) {
    return "warning";
  } else if (action.includes("delete")) {
    return "danger";
  }
  return "info";
};
</script>

<template>
  <CardBoxModal
    v-model="isModalResultActive"
    title="Fetch request is done"
    button="info"
    button-label="Understand"
  >
    <p>Records within range is not available.</p>
  </CardBoxModal>

  <CardBoxModal
    v-model="isModalDeleteActive"
    title="Please confirm."
    button="success"
    button-label="Confirm"
    has-cancel
    @confirm="deleteData()"
  >
    <p>Are you sure that you want to <b>delete</b> the selected records?</p>
    <p>If yes, please continue.</p>
  </CardBoxModal>

  <CardBox>
    <div class="grid grid-cols-5 lg:grid-cols-5 gap-6 mb-2">
      <div class="flex flex-col justify-between">
        <h2>Start date:</h2>
        <Datepicker v-model="startDate"></Datepicker>
      </div>
      <div class="flex flex-col justify-between">
        <h2>End date:</h2>
        <Datepicker v-model="endDate"></Datepicker>
      </div>
      <div class="flex flex-col justify-between">
        <h2></h2>
        <BaseButton
          class="w-1/2 mx-auto"
          :icon="mdiArrowBottomLeft"
          color="info"
          label="Fetch data"
          @click="fetchDataByRange()"
        ></BaseButton>
      </div>
      <div class="flex flex-col justify-between">
        <h2></h2>
        <BaseButton
          class="w-1/2 mx-auto"
          :icon="mdiDelete"
          color="danger"
          label="Delete"
          @click="isModalDeleteActive = true"
        ></BaseButton>
      </div>
      <div class="flex flex-col justify-between align-items-center">
        <FormField label="Search">
          <FormControl
            v-model="filters['global'].value"
            type="text"
            placeholder="Search text"
          />
        </FormField>
      </div>
    </div>
  </CardBox>
  <br />
  <CardBox class="w-full">
    <DataTable
      v-model:filters="filters"
      :value="logData"
      responsive-layout="scroll"
      :global-filter-fields="[
        'stockName',
        'stockCode',
        'action',
        'machine',
        'device',
        'shift',
        'category',
        'uom',
        'created_at',
      ]"
    >
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
      <Column field="qty" header="Quantity" :sortable="true"></Column>
      <Column field="uom" header="UOM" :sortable="true"></Column>
      <Column field="stockName" header="Stock Name" :sortable="true"></Column>
      <Column field="machine" header="Machine" :sortable="true"></Column>
      <Column field="shift" header="Shift" :sortable="true"></Column>
      <Column field="totalQty" header="Total qty" :sortable="true"></Column>
      <Column field="category" header="Category" :sortable="true"></Column>
      <Column field="device" header="Device" :sortable="true"></Column>
      <Column field="weight" header="Weight" :sortable="true"></Column>
      <Column field="created_at" header="Created At" :sortable="true">
        <template #body="{ data }">
          <small
            class="text-gray-500 dark:text-slate-400"
            :title="moment(new Date(data.created_at)).format('LLLL')"
            >{{
              moment(new Date(data.created_at)).format("MM/DD/YYYY, HH:mm")
            }}</small
          >
        </template>
      </Column>
    </DataTable>
  </CardBox>
</template>
