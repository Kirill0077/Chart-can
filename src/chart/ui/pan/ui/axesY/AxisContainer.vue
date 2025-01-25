<script setup lang="ts">
import { AxesY } from '@/chart/ui/pan'
import { computed, toRef} from 'vue'
import AxisY from '@/chart/ui/pan/ui/axesY/AxisY.vue'

const props = defineProps<{
  axesYContainer: AxesY;
  offset:number;
}>()

const axesInfoMap = toRef(() => props.axesYContainer.axesInfo);
const axesInfo = computed(() => axesInfoMap.value.values());

</script>

<template>
  <div class="axis-container" :style="{minWidth:props.offset+`px`}">
    <AxisY
      v-for="axis in axesInfo"
      :key="axis.name"
      :axis-info="axis"
      :bounds="axesYContainer.axisBounds"
      :pan-id="axesYContainer.selectorParent"
      :axes-container="axesYContainer"
    />
  </div>
</template>

<style scoped>
.axis-container {
  display: flex;
  margin-top: 2px;
  flex-direction: row;
  justify-content: end;
}

</style>
