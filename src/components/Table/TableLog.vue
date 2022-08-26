<script setup>
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { onMounted, ref } from "vue";
// import { useMainStore } from "@/stores/main";
import { mdiEye, mdiArrowBottomLeft } from "@mdi/js";
import CardBoxModal from "@/components/CardBoxModal.vue";
// import TableCheckboxCell from "@/components/TableCheckboxCell.vue";
import PillTag from "@/components/PillTag.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import BaseButton from "@/components/BaseButton.vue";
import moment from "moment";
import CardBox from "../CardBox.vue";
// import UserAvatar from "@/components/UserAvatar.vue";

defineProps({
  checkable: Boolean,
});
const today = new Date();
const isModalActive = ref(false);
const checkedRows = ref([]);

const startDate = ref(null);
const endDate = ref(today);

const logData = ref(null);
const error = ref(null);

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
}

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

// const remove = (arr, cb) => {
//   const newArr = [];

//   arr.forEach((item) => {
//     if (!cb(item)) {
//       newArr.push(item);
//     }
//   });

//   return newArr;
// };

// const checked = (isChecked, client) => {
//   if (isChecked) {
//     checkedRows.value.push(client);
//   } else {
//     checkedRows.value = remove(
//       checkedRows.value,
//       (row) => row.id === client.id
//     );
//   }
// };
</script>

<template>
  <CardBoxModal v-model="isModalActive" title="Sample modal">
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <div v-if="checkedRows.length" class="p-3 bg-gray-100/50 dark:bg-slate-800">
    <span
      v-for="checkedRow in checkedRows"
      :key="checkedRow.id"
      class="inline-block px-2 py-1 rounded-sm mr-2 text-sm bg-gray-100 dark:bg-slate-700"
    >
      {{ checkedRow.name }}
    </span>
  </div>

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

  <CardBox has-table>
    <table>
      <thead>
        <tr>
          <th v-if="checkable" />
          <th>Action</th>
          <th>Stock Code</th>
          <th>Stock Name</th>
          <th>Machine</th>
          <th>Shift</th>
          <th>Created At</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logData" :key="log.id">
          <!-- <TableCheckboxCell
            v-if="checkable"
            @checked="checked($event, log)"
          /> -->
          <td data-label="Action">
            <PillTag
              :color="actionColor(log.action)"
              :label="log.action"
              small
            />
          </td>
          <td data-label="StockCode">
            {{ log.stockCode }}
          </td>
          <td data-label="StockName">
            {{ log.stockName }}
          </td>
          <td data-label="Machine">
            {{ log.machine }}
          </td>
          <td data-label="Shift">
            {{ log.shift }}
          </td>
          <td data-label="Created" class="lg:w-1 whitespace-nowrap">
            <small
              class="text-gray-500 dark:text-slate-400"
              :title="moment(new Date(log.created_at)).format('LLLL')"
              >{{
                moment(new Date(log.created_at)).format("MM/DD/YYYY, h:mm a")
              }}</small
            >
          </td>
          <td class="before:hidden lg:w-1 whitespace-nowrap">
            <BaseButtons type="justify-start lg:justify-end" no-wrap>
              <BaseButton
                color="info"
                :icon="mdiEye"
                small
                @click="isModalActive = true"
              />
            </BaseButtons>
          </td>
        </tr>
      </tbody>
    </table>
  </CardBox>
</template>
