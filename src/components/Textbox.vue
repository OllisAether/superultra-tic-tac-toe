<template>
  <input
    @input="input"
    class="textbox"
    v-bind="$attrs"
    :class="{
      'textbox--error': error
    }"
    :placeholder="placeholder"
    :value="modelValue"
  />

  <div class="error-wrapper" v-if="error">
    <div class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  placeholder?: string
  error?: string | null
  uppercase?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

function input (event: Event) {
  const value = (event.target as HTMLInputElement).value

  if (props.uppercase) {
    emit('update:modelValue', value.toUpperCase())
  } else {
    emit('update:modelValue', value)
  }
}
</script>

<style scoped lang="scss">
.textbox {
  appearance: none;
  font: inherit;
  color: inherit;
  padding: 0.5em 1em;
  border-radius: 0.5em;
  background: #fff1;
  border: .125rem solid #fff0;
  box-shadow: 0 0 1rem #0002;
  text-decoration: none;
  transition: background-color .15s, border-color .15s .1s;
  text-align: center;

  &:hover {
    background: #fff2;
    border: .125rem solid #fff2;
  }

  &:focus {
    outline: none;
    background: #fff2;
    border: .125rem solid #fff2;
  }
}

.error {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #f88;
  font-size: 0.75em;
  margin-top: 0.25em;
  text-align: center;
  white-space: nowrap;
}

.error-wrapper {
  position: relative;
  height: 1.5em;
}
</style>