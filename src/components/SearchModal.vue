<template>
  <n-modal
    v-bind="$attrs"
    :size="props.size"
  >
    <n-scrollbar class="max-h-400px p-r-15px">
      <slot />
    </n-scrollbar>
    <template v-for="slotName in customSlots">
      <slot :name="slotName"></slot>
    </template>
  </n-modal>
</template>

<script setup name="search-modal" lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large',
  [key: string]: string | number | any; // 这里使用了具体的联合类型
}
const props = withDefaults(defineProps<Props>(), {
  size: 'small'
})

const slots = useSlots()

const customSlots = Object.keys(slots).filter(slotName => slotName !== 'default');
</script>

<style>

</style>