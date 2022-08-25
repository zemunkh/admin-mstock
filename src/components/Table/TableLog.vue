<script setup>
import { computed, onMounted, ref } from "vue";
import { useMainStore } from "@/stores/main";
import { mdiEye } from "@mdi/js";
import CardBoxModal from "@/components/CardBoxModal.vue";
// import TableCheckboxCell from "@/components/TableCheckboxCell.vue";
import PillTag from "@/components/PillTag.vue";
import BaseLevel from "@/components/BaseLevel.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import BaseButton from "@/components/BaseButton.vue";
import moment from 'moment';
// import UserAvatar from "@/components/UserAvatar.vue";

defineProps({
  checkable: Boolean,
});

const mainStore = useMainStore();

const items = computed(() => mainStore.clients);

const isModalActive = ref(false);

const perPage = ref(5);

const currentPage = ref(0);

const checkedRows = ref([]);

const logData = ref(null);
const error = ref(null);

onMounted(() => {
  fetch('http://localhost:8080/logging/all')
    .then((res) => {
      console.log('Response: ', res);
      return res.json();
    })
    .then((json) => (logData.value = json))
    .catch((err) => (error.value = err));
});

// const itemsPaginated = computed(() =>
//   items.value.slice(
//     perPage.value * currentPage.value,
//     perPage.value * (currentPage.value + 1)
//   )
// );

const numPages = computed(() => Math.ceil(items.value.length / perPage.value));

const currentPageHuman = computed(() => currentPage.value + 1);

const pagesList = computed(() => {
  const pagesList = [];

  for (let i = 0; i < numPages.value; i++) {
    pagesList.push(i);
  }

  return pagesList;
});

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

  <!-- <div>
    <h6>Data:</h6>
    <p>{{ logData }}</p>
  </div> -->

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
          <PillTag :color="actionColor(log.action)" :label="log.action" small />
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
            >{{ moment(new Date(log.created_at)).format('MM/DD/YYYY, h:mm a') }}</small
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
  <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
    <BaseLevel>
      <BaseButtons>
        <BaseButton
          v-for="page in pagesList"
          :key="page"
          :active="page === currentPage"
          :label="page + 1"
          :color="page === currentPage ? 'lightDark' : 'whiteDark'"
          small
          @click="currentPage = page"
        />
      </BaseButtons>
      <small>Page {{ currentPageHuman }} of {{ numPages }}</small>
    </BaseLevel>
  </div>
</template>
