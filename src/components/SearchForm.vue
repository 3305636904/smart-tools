<template>
  <n-form
    ref="formRef"
    :label-placement="props.labelPlacement"
    :size="props.size"
  >
  <n-form-item 
    v-for="(v, i) in props.formItems"
    :key="v.label + v.path + i"
    :label="v.label" 
    :path="v.path">

    <template v-if="v.type === 'input'">
      <n-input v-model:[v.path]="model[v.path]" :placeholder="`请输入${v.label}`" v-bind="v">
        <slot v-for="v in formInputSlots" :key="v" :name="v"></slot>
      </n-input>
    </template>

    <template v-else-if="v.type === 'textarea'">
      <n-input type="textarea" 
        v-model:[v.path]="model[v.path]" 
        :placeholder="`请输入${v.label}`" 
        v-bind="v">
        <slot v-for="v in formInputSlots" :key="v" :name="v"></slot>
      </n-input>
    </template>

    <template v-else-if="v.type === 'radioGroup'">
      <n-radio-group v-model:[v.path]="model[v.path]" :name="v.path" :size="v.size || props.size" v-bind="v">
        <n-radio-button
          v-for="(item, index) in v.options"
          :key="item.value + index"
          :value="item.value"
          :disabled="item.disabled"
          :label="item.label"
          :size="item.size || props.size"
        >
          {{ item.label }}
        </n-radio-button>
      </n-radio-group>
    </template>

    <template v-else-if="v.type === 'select'">
      <n-select v-model:[v.path]="model[v.path]" :options="v.options" v-bind="v" >
        <slot v-for="v in formSelectSlots" :key="v" :name="v"></slot>
      </n-select>
    </template>

    <template v-else-if="v.type === 'switch'">
      <n-switch v-model:[v.path]="model[v.path]" v-bind="v" />
    </template>

    <template v-else-if="v.type === 'custom'">
      <slot :name="v.path" />
    </template>
  </n-form-item>
</n-form>
</template>

<script setup name="custom-form" lang="ts">
import { FormInst } from 'naive-ui'

// const props = defineProps({
//   labelPlacement: { default: 'left', type: String },
//   size: { default: 'small', type: String },
//   formItems: { default: [], type: Array},
//   model: { default: {}, type: Object}
// })
const props = defineProps<Record<string, any>>()

const formRef = ref<FormInst>()

const $slots = useSlots()
console.log('slots: ', $slots)

const formInputSlots: Record<string, any>[] = []
const formSelectSlots: Record<string, any>[] = []
// const formInputSlots = $slots.filter(v => v.startsWith('formInput-'))
// const formSelectSlots = $slots.filter(v => v.startsWith('formSelect-'))
const validate = (callback = () => {}) => {
  formRef.value?.validate(callback)
}

defineExpose({
  validate
})

</script>

<style>

</style>