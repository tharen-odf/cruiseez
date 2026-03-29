import { dbGet, dbPut, dbDel, debounce } from '../db.js';

export default {
    props: ['navData'],
    template: `
        <div v-if="unit">
            <div class="flex-row">
                <div class="floating-label">
                    <input placeholder=" " v-model="unit.name" @input="save">
                    <label>Unit Name</label>
                </div>
                <div class="floating-label">
                    <input placeholder=" " v-model="unit.project_name" @input="save">
                    <label>Project Name</label>
                </div>
                <div class="floating-label">
                    <input placeholder=" " v-model="unit.project_id" @input="save">
                    <label>Project ID</label>
                </div>
                <div class="floating-label">
                    <input placeholder=" " v-model="unit.net_area" @input="save">
                    <label>Net Area</label>
                </div>
            </div>
            <div class="floating-label">
                <textarea placeholder=" " v-model="unit.notes" @input="save"></textarea>
                <label>Notes...</label>
            </div>
            <div id="map"></div>
            <div class="actions">
                <button @click="$emit('nav', {view:'plots', id:unit.id})">Plots</button>
                <button @click="$emit('nav', {view:'designs', id:unit.id})">Designs</button>
                <button class="secondary" @click="toggleDraw">{{ isDrawing ? 'Finish Drawing' : 'Draw Polygon' }}</button>
                <button class="secondary" @click="clearPoly">Clear Polygon</button>
                <button @click="exportJSON">Export JSON</button>
                <button @click="exportCSV">Export CSV</button>
                <button class="danger" @click="del">Delete</button>
            </div>
        </div>
    `,
    setup(props, { emit }) {
        const { ref, onMounted, onUnmounted } = Vue;
        const unit = ref(null);
        const isDrawing = ref(false);
        let map = null;
        let polygonLayer = null;

        const save = debounce(() => {
            if (unit.value) dbPut("units", JSON.parse(JSON.stringify(unit.value)));
        }, 500);

        const initMap = () => {
            if (map) map.remove();
            map = L.map("map").setView([45.9336, -120.5583], 6);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

            if (unit.value.polygon) {
                polygonLayer = L.geoJSON(unit.value.polygon).addTo(map);
                map.fitBounds(polygonLayer.getBounds());
            }

            map.on("click", e => {
                if (!isDrawing.value) return;
                const latlng = [e.latlng.lat, e.latlng.lng];
                if (!polygonLayer) polygonLayer = L.polygon([latlng]).addTo(map);
                else polygonLayer.addLatLng(latlng);
                unit.value.polygon = polygonLayer.toGeoJSON();
                save();
            });
        };

        onMounted(async () => {
            emit('update-title', 'Unit');
            unit.value = await dbGet('units', props.navData.id);
            setTimeout(initMap, 50); // delay to ensure element mounts
        });

        onUnmounted(() => { if (map) map.remove(); });

        const toggleDraw = () => { isDrawing.value = !isDrawing.value; };
        const clearPoly = () => {
            if (polygonLayer && map) {
                map.removeLayer(polygonLayer);
                polygonLayer = null;
                unit.value.polygon = null;
                save();
            }
        };

        const del = async () => {
            if (confirm("Delete unit?")) {
                await dbDel("units", unit.value.id);
                emit('nav', {view:'units'});
            }
        };

        const download = (text, name) => {
            const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text])); a.download=name; a.click();
        };

        const exportJSON = () => download(JSON.stringify(unit.value,null,2), "unit.json");
        const exportCSV = () => {
            let rows=["unit,project,plot,design,tree,condition,species,count,diameter,form_point,form_factor,tdf,bole_height,total_height,crown_ratio,position,damage_1,severity_1,damage_2,severity_2,log_number,grade,bole_height,length,small_diam,large_diam,def_type,def_amt,gross_cuft,gross_bdft,net_cuft,net_bdft"];
            (unit.value.plots || []).forEach(pl=>{ (pl.trees || []).forEach(t=>{ if (t.logs && t.logs.length > 0) { t.logs.forEach(l=>{ rows.push([unit.value.name,unit.value.project_name,pl.name,pl.cruiser,t.designCode,t.number,t.condition,t.species,t.count,t.diameter,t.form_point,t.form_factor,t.tdf,t.bole_height,t.total_height,t.crown_ratio,t.position,t.damage_1,t.severity_1,t.damage_2,t.severity_2,l.number,l.grade,l.bole_height,l.length,l.small_diam,l.large_diam,l.def_type,l.def_amt,l.gross_cuft,l.gross_bdft,l.net_cuft,l.net_bdft].join(",")); }); } else { rows.push([unit.value.name,unit.value.project_name,pl.name,pl.cruiser,t.designCode,t.number,t.condition,t.species,t.count,t.diameter,t.form_point,t.form_factor,t.tdf,t.bole_height,t.total_height,t.crown_ratio,t.position,t.damage_1,t.severity_1,t.damage_2,t.severity_2,"","","","","","","","","","",""].join(",")); } }); });
            download(rows.join("\n"), "inventory.csv");
        };

        return { unit, isDrawing, save, toggleDraw, clearPoly, del, exportJSON, exportCSV };
    }
};