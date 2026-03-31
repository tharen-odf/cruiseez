import { dbGet, dbPut, uid, debounce } from '../db.js';

export default {
    props: ['navData'],
    template: `
        <div v-if="unit">
            <div v-for="design in unit.designs" :key="design.uid" class="card">
                <div class="flex-row">
                    <div class="floating-label">
                        <input placeholder=" " v-model="design.code" @input="save">
                        <label>Code</label>
                    </div>
                    <div class="floating-label">
                        <input placeholder=" " v-model="design.method" @input="save">
                        <label>Sample Method</label>
                    </div>
                    <div class="floating-label">
                        <input placeholder=" " v-model="design.size" @input="save">
                        <label>Sample Size</label>
                    </div>
                </div>
                <div class="floating-label">
                    <textarea placeholder=" " v-model="design.description" @input="save"></textarea>
                    <label>Description</label>
                </div>
                <div class="actions">
                    <button class="danger" @click="delDesign(design.uid)">Delete</button>
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
            unit.value = await dbGet('units', props.navData.uid);
            if (!unit.value.designs) unit.value.designs = [];
        });

        const addDesign = () => { unit.value.designs.push({uid:uid(), code:"", method:"", size:"", description:""}); save(); };
        const delDesign = (designId) => {
            if (confirm("Delete design?")) { unit.value.designs = unit.value.designs.filter(d => d.uid !== designId); save(); }
        };
        return { unit, save, addDesign, delDesign };
    }
};