import { dbGetAll, dbAdd, uid } from '../db.js';

export default {
    template: `
        <div>
            <div class="grid">
                <div v-for="u in units" :key="u.uid" class="card" @click="$emit('nav', {view:'unit', uid:u.uid})" style="cursor: pointer;">
                    <h3>Project: {{ u.project_name || '<project>' }}</h3>
                    <h3>Unit: {{ u.name || '<unit>' }}</h3>
                    <!--<h3>UID: {{ u.uid || '<uid>' }}</h3>-->
                    <small>{{ u.net_area || '--' }} acres | {{ u.plots ? u.plots.length : 0 }} plots</small>
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
            await dbAdd("units", { uid: uid(), name: "", project_id: "", project_name: "", gross_area: "", net_area: "", notes: "", polygon: null, polygon_edited_timestamp: null, polygon_edited_by: "", plots: [], designs: [] });
            load();
        };
        return { units, addUnit };
    }
};