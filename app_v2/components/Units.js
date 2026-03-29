import { dbGetAll, dbAdd, uid } from '../db.js';

export default {
    template: `
        <div>
            <div class="grid">
                <div v-for="p in units" :key="p.id" class="card" @click="$emit('nav', {view:'unit', id:p.id})" style="cursor: pointer;">
                    <h3>Project: {{ p.project_name || '<project>' }}</h3>
                    <h3>Unit: {{ p.name || '<unit>' }}</h3>
                    <small>{{ p.net_area || '--' }} acres | {{ p.plots ? p.plots.length : 0 }} plots</small>
                </div>
            </div>
            <button @click="addUnit">+ New Unit</button>
        </div>
    `,
    setup(props, { emit }) {
        const { ref, onMounted } = Vue;
        const units = ref([]);
        const load = async () => { units.value = await dbGetAll('units'); };
        
        onMounted(() => {
            emit('update-title', 'Units');
            load();
        });
        const addUnit = async () => {
            await dbAdd("units", { id: uid(), name: "", project_id: "", project_name: "", net_area: "", notes: "", polygon: null, plots: [], designs: [] });
            load();
        };
        return { units, addUnit };
    }
};