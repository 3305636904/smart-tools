<template>
  <n-form
    ref="formRef"
    v-bind="$attrs"
    :label-placement="props.labelPlacement"
    :label-width="props.labelWidth"
    :require-mark-placement="props['requireMarkPlacement']"
    :size="props.size"
  >
    <n-form-item 
      v-for="(v, i) in props.formItems"
      :key="v.label + v.path + i"
      :label="v.label" 
      :path="v.path">
  
      <template v-if="v.type === 'input'">
        <n-input v-model:value="props.model[v.path]" :placeholder="`请输入${v.label}`" v-bind="v">
          <template v-for="v in formInputSlots">
            <slot :name="v"></slot>
          </template>
        </n-input>
      </template>
  
      <template v-else-if="v.type === 'textarea'">
        <n-input type="textarea" 
          v-model:value="props.model[v.path]" 
          :placeholder="`请输入${v.label}`" 
          v-bind="v">
          <template v-for="v in formInputSlots">
            <slot :name="v"></slot>
          </template>
        </n-input>
      </template>
  
      <template v-else-if="v.type === 'radioGroup'">
        <n-radio-group v-model:value="props.model[v.path]" :name="v.path" :size="v.size || props.size" v-bind="v">
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
        <n-select v-model:value="props.model[v.path]" :options="v.options" v-bind="v" >
          <slot v-for="v in formSelectSlots" :key="v" :name="v"></slot>
        </n-select>
      </template>
  
      <template v-else-if="v.type === 'switch'">
        <n-switch v-model:value="props.model[v.path]" v-bind="v" />
      </template>
  
      <template v-else-if="v.type === 'custom'">
        <slot :name="v.path"></slot>
      </template>
    </n-form-item>
  </n-form>
</template>

<script setup name="search-form" lang="ts">
import { FormInst } from 'naive-ui'

interface Props {
  formItems: [],
  model: {},
  rules: [],
  labelPlacement: string,
  labelWidth: string,
  size: string,
  [key: string]: string | number | any; // 这里使用了具体的联合类型
}

const props = withDefaults(defineProps<Props>(), {
  labelPlacement: 'left',
  size: 'small',
  labelWidth: 'auto',
  ['require-mark-placement']: "right-hanging",
})

console.log('props searchForm: ', props)

const formRef = ref<FormInst>()
const $slots = useSlots()

const formInputSlots = Object.keys($slots).filter(v => v.startsWith('formInput-'))
const formSelectSlots = Object.keys($slots).filter(v => v.startsWith('formSelect-'))

const validate = (callback = () => {}) => {
  return formRef.value?.validate(callback)
}

defineExpose({
  validate
})

</script>

<style>

</style>