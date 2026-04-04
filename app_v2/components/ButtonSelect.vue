
<template>
  <div class="wrapper">
    <input v-model="selected" @focus="isFocused=true" @blur="isFocused=false"></input>
    <div class="option-list" v-show="isFocused">
      <button 
        v-for="(opt, idx) in options" :key="idx"
        @mousedown.prevent="onOptionClicked(opt)"
      >
        {{ opt }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const options = defineModel<string[]>('options', { required: true })

const isFocused = ref(false)
const selected = ref('')
//const options = ref(['DF','WH','RA','OC'])
const onOptionClicked = (option: string) => {
      selected.value = option
      // Reorder the options list so the last item selected is presented first
      options.value = [option, ...options.value.filter(item => item !== option)]
      console.log(`${option} was clicked`);
    }

    

</script>

<style scoped>
.option-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}
</style>
