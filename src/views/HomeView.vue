<script setup>
import { ref, onMounted } from "vue";
// import { useMainStore } from "@/stores/main";
import * as chartConfig from "@/components/Charts/chart.config.js";
import SectionMain from "@/components/SectionMain.vue";
// import TableSampleClients from "@/components/TableSampleClients.vue";
import LayoutAuthenticated from "@/layouts/LayoutAuthenticated.vue";
import TableLog from "../components/Table/TableLog.vue";

const chartData = ref(null);

const fillChartData = () => {
  chartData.value = chartConfig.sampleChartData();
};

onMounted(() => {
  fillChartData();
});

// const mainStore = useMainStore();
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <TableLog />
    </SectionMain>
  </LayoutAuthenticated>
</template>
