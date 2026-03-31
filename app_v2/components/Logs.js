import { dbGet, dbPut, uid, debounce } from '../db.js';

export default {
    props: ['navData'],
    template: `
        <div v-if="unit && tree">
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>#</th><th>Length</th><th>Grade</th><th>Def Type</th><th>Def Amt</th>
                            <th>Bole Ht</th><th>Sm Dia</th><th>Lg Dia</th><th>Gr CuFt</th><th>Gr BdFt</th>
                            <th>Net CuFt</th><th>Net BdFt</th><th>❌</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="log in tree.logs" :key="log.uid">
                            <td><input v-model="log.number" @input="save" class="cell-input"></td>
                            <td><input v-model="log.length" @input="save" class="cell-input"></td>
                            <td><input v-model="log.grade" @input="save" class="cell-input"></td>
                            <td><input v-model="log.def_type" @input="save" class="cell-input"></td>
                            <td><input v-model="log.def_amt" @input="save" class="cell-input"></td>
                            <td><input v-model="log.bole_height" @input="save" class="cell-input"></td>
                            <td><input v-model="log.small_diam" @input="save" class="cell-input"></td>
                            <td><input v-model="log.large_diam" @input="save" class="cell-input"></td>
                            <td><input v-model="log.gross_cuft" @input="save" class="cell-input"></td>
                            <td><input v-model="log.gross_bdft" @input="save" class="cell-input"></td>
                            <td><input v-model="log.net_cuft" @input="save" class="cell-input"></td>
                            <td><input v-model="log.net_bdft" @input="save" class="cell-input"></td>
                            <td><button class="table-button" @click="delLog(log.uid)">❌</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button @click="addLog" style="margin-top: 10px;">+ Add Log</button>
        </div>
    `,
    setup(props, { emit }) {
        const { ref, onMounted } = Vue;
        const unit = ref(null);
        const tree = ref(null);
        const save = debounce(() => { if (unit.value) dbPut("units", JSON.parse(JSON.stringify(unit.value))); }, 500);

        onMounted(async () => {
            emit('update-title', 'Logs');
            unit.value = await dbGet('units', props.navData.pid);
            tree.value = unit.value.plots.find(pl => pl.uid === props.navData.plotId).trees.find(t => t.uid === props.navData.treeId);
        });
        const addLog = () => { tree.value.logs.push({uid:uid(),number:"",length:"",grade:"",def_type:"",def_amt:"",bole_height:"",small_diam:"",large_diam:"",gross_cuft:"",gross_bdft:"",net_cuft:"",net_bdft:""}); save(); };
        const delLog = (logId) => { if (confirm("Delete log?")) { tree.value.logs = tree.value.logs.filter(l => l.uid !== logId); save(); } };
        return { unit, tree, save, addLog, delLog };
    }
};