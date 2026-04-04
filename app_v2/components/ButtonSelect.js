// Unique prefix to act as a manual "scope"
const scope = 'v-opt';

// Inject CSS into the head once
const style = document.createElement('style');
style.textContent = `
  .${scope}-wrapper { position: relative; display: inline-block; }
  .${scope}-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 8px;
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 10px;
    width: 100%;
    z-index: 100;
  }
  .${scope}-btn { cursor: pointer; padding: 4px; }
`;
document.head.appendChild(style);

export default {
  props: ['options'],
  emits: ['update:options'],
  setup(props, { emit }) {
    const isFocused = Vue.ref(false);
    const selected = Vue.ref('');
    const opts = Vue.ref(['DF','WH','RC','RA','OC','OH']);
    const onOptionClicked = (option) => {
      selected.value = option;
      const reordered = [option, ...props.options.filter(item => item !== option)];
      emit('update:options', reordered);
      isFocused.value = false;
    };

    return { isFocused, selected, opts, onOptionClicked, scope };
  },
  
// <script setup lang="ts">

  template: `
    <div :class="scope + '-wrapper'">
      <input 
        v-model="selected" 
        @focus="isFocused = true" 
        @blur="isFocused = false"
      >
      <div v-show="isFocused" :class="scope + '-list'">
        <button 
          v-for="opt in opts" 
          :class="scope + '-btn'"
          @mousedown.prevent="onOptionClicked(opt)"
        >
          {{ opt }}
        </button>
      </div>
    </div>
  `
};
