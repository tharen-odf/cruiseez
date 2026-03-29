import { dbGet, dbPut, uid, debounce } from '../db.js';

export default {
    props: ['navData'],
    template: `
        <div v-if="unit && plot">
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>ST</th><th>#</th><th>Cond</th><th>Spp</th><th>Cnt</th><th>Diam</th>
                            <th>FP</th><th>FF</th><th>TDF</th><th>Bole Ht</th><th>Tot Ht</th>
                            <th>CR</th><th>Pos</th><th>Dmg-1</th><th>Sev-1</th><th>Dmg-2</th><th>Sev-2</th>
                            <th>Logs</th><th>❌</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tree in plot.trees" :key="tree.id">
                            <td>
                                <select v-model="tree.designCode" @change="save" class="cell-input">
                                    <option value=""></option>
                                    <option v-for="d in (unit.designs || [])" :key="d.id" :value="d.code">{{ d.code }}</option>
                                </select>
                            </td>
                            <td><input v-model="tree.number" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.condition" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.species" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.count" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.diameter" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.form_point" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.form_factor" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.tdf" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.bole_height" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.total_height" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.crown_ratio" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.position" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.damage_1" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.severity_1" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.damage_2" @input="save" class="cell-input"></td>
                            <td><input v-model="tree.severity_2" @input="save" class="cell-input"></td>
                            <td><button class="table-button" @click="$emit('nav', {view:'logs', pid:unit.id, plotId:plot.id, treeId:tree.id})">✎</button></td>
                            <td><button class="table-button" @click="delTree(tree.id)">❌</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button @click="addTree" style="margin-top: 10px;">+ Add Tree</button>
        </div>
    `,
    setup(props, { emit }) {
        const { ref, onMounted } = Vue;
        const unit = ref(null);
        const plot = ref(null);
        const save = debounce(() => { if (unit.value) dbPut("units", JSON.parse(JSON.stringify(unit.value))); }, 500);

        onMounted(async () => {
            emit('update-title', 'Trees');
            unit.value = await dbGet('units', props.navData.pid);
            plot.value = unit.value.plots.find(pl => pl.id === props.navData.plotId);
        });

        const addTree = () => { plot.value.trees.push({ id:uid(), number:"", condition: "", designCode: "", species:"", count:"", diameter:"", form_point: "", form_factor: "", tdf: "", bole_height: "", total_height:"", crown_ratio: "", position: "", damage_1: "", severity_1: "", damage_2: "", severity_2: "", logs:[] }); save(); };
        const delTree = (treeId) => { if (confirm("Delete tree?")) { plot.value.trees = plot.value.trees.filter(t => t.id !== treeId); save(); } };
        return { unit, plot, save, addTree, delTree };
    }
};