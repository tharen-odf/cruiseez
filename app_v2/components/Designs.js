import { dbGet, dbPut, uid, debounce } from '../db.js';

export default {
    props: ['navData'],
    template: `
        <div v-if="unit">
            <div v-for="design in unit.designs" :key="design.id" class="card">
                <div class="flex-row">
                    <input placeholder="Code" v-model="design.code" @input="save">
                    <input placeholder="Sample Method" v-model="design.method" @input="save">
                    <input placeholder="Sample Size" v-model="design.size" @input="save">
                </div>
                <textarea placeholder="Description" v-model="design.description" @input="save"></textarea>
                <div class="actions">
                    <button class="danger" @click="delDesign(design.id)">Delete</button>
                </div>
            </div>
            <button @click="addDesign">+ Add Design</button>
        </div>
    `,
    setup(props, { emit }) {
        const { ref, onMounted } = Vue;
        const unit = ref(null);
        const save = debounce(() => { if (unit.value) dbPut("units", JSON.parse(JSON.stringify(unit.value))); }, 500);

        onMounted(async () => {
            emit('update-title', 'Sample Designs');
            unit.value = await dbGet('units', props.navData.id);
            if (!unit.value.designs) unit.value.designs = [];
        });

        const addDesign = () => { unit.value.designs.push({id:uid(), code:"", method:"", size:"", description:""}); save(); };
        const delDesign = (designId) => {
            if (confirm("Delete design?")) { unit.value.designs = unit.value.designs.filter(d => d.id !== designId); save(); }
        };
        return { unit, save, addDesign, delDesign };
    }
};