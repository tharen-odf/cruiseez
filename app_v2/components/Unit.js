import { dbGet, dbPut, dbDel, debounce } from '../db.js';

export default {
    props: ['navData'],
    template: `
        <div v-if="unit">
            <div class="flex-row">
                <div class="floating-label">
                    <input placeholder=" " v-model="unit.name" @input="save">
                    <label>Unit</label>
                </div>
                <div class="floating-label">
                    <input placeholder=" " v-model="unit.project_name" @input="save">
                    <label>Project</label>
                </div>
                <div class="floating-label">
                    <input placeholder=" " v-model="unit.project_id" @input="save">
                    <label>Project ID</label>
                </div>
                <div class="floating-label">
                    <input placeholder=" " v-model="unit.gross_area" @input="save">
                    <label>Gross Area</label>
                </div>
                <div class="floating-label">
                    <input placeholder=" " v-model="unit.net_area" @input="save">
                    <label>Net Area</label>
                </div>
            </div>
            <div class="floating-label">
                <textarea placeholder=" " v-model="unit.notes" @input="save"></textarea>
                <label>Notes</label>
            </div>
            <div id="map"></div>
            <div class="actions">
                <button @click="$emit('nav', {view:'plots', uid:unit.uid})">Plots</button>
                <button @click="$emit('nav', {view:'designs', uid:unit.uid})">Designs</button>
                <button @click="exportJSON">Export JSON</button>
                <button @click="exportCSV">Export CSV</button>
                <button class="danger push-right" @click="del">Delete</button>
            </div>
        </div>
    `,
    setup(props, { emit }) {
        const { ref, onMounted, onUnmounted } = Vue;
        const unit = ref(null);
        let map = null;
        let drawnItems = null;
        let home = { lat: 45.9336, lng: -120.5583, zoom: 6}

        const save = debounce(() => {
            if (unit.value) dbPut("units", JSON.parse(JSON.stringify(unit.value)));
        }, 500);

        const initMap = () => {
            if (map) map.remove();
            map = L.map("map").setView([home.lat, home.lng], home.zoom);
            const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
            osmLayer.addTo(map);

            const imageryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                 attribution: ''
            });

            var baseLayers = {
                "OpenStreetMap": osmLayer,
                "World Imagery": imageryLayer
            };

            L.control.layers(baseLayers).addTo(map);

            drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);

            map.pm.setGlobalOptions({ 
                layerGroup: drawnItems,
            });

            map.pm.setGlobalOptions({ tooltips: false });

            const handleEdit = () => {
                unit.value.polygon = drawnItems.toGeoJSON();
                unit.value.gross_area = (turf.area(unit.value.polygon)/4046.86).toFixed(3);
                unit.value.polygon_edited_timestamp = Date.now();
                unit.value.polygon_edited_by = "user"; // Placeholder for user identification
                save();
            };

            const bindEvents = (layer) => {
                layer.on('pm:edit', handleEdit);
                layer.on('pm:dragend', handleEdit);
                layer.on('pm:cut', handleEdit);
            };

            if (unit.value.polygon) {
                const polygonLayer = L.geoJSON(unit.value.polygon);
                polygonLayer.eachLayer(layer => {
                    drawnItems.addLayer(layer);
                    bindEvents(layer);
                });
                map.fitBounds(drawnItems.getBounds());
                home.lat = drawnItems.getBounds().getCenter().lat;
                home.lng = drawnItems.getBounds().getCenter().lng;
                home.zoom = map.getZoom();
                map.setView([home.lat, home.lng], home.zoom);
            }

            map.pm.addControls({
                position: 'topleft',
                drawMarker: false,
                drawCircleMarker: false,
                drawPolyline: false,
                drawRectangle: false,
                drawCircle: false,
                drawText: false,
                editMode: true,
                dragMode: false,
                cutPolygon: false,
                removalMode: true,
                rotateMode: false,
                drawPolygon: drawnItems.getLayers().length === 0
            });

            map.on('pm:create', e => {
                drawnItems.clearLayers();
                drawnItems.addLayer(e.layer);
                bindEvents(e.layer);
                handleEdit();
                map.pm.addControls({ drawPolygon: false });
            });

            map.on('pm:remove', e => {
                if (confirm("Delete Polygon?")) { // The layer is already removed by geoman, this is for confirmation
                    unit.value.polygon = null;
                    unit.value.gross_area = null;
                    unit.value.polygon_edited_timestamp = Date.now();
                    unit.value.polygon_edited_by = "user"; // Placeholder for user identification
                    save();
                    map.pm.addControls({ drawPolygon: true });
                } else {
                    // If deletion is cancelled, add the layer back to the map
                    drawnItems.addLayer(e.layer);
                }
            });
        };

        onMounted(async () => {
            emit('update-title', 'Unit');
            unit.value = await dbGet('units', props.navData.uid);
            setTimeout(initMap, 50); // delay to ensure element mounts
        });

        onUnmounted(() => { if (map) map.remove(); });

        const del = async () => {
            if (confirm("Delete unit?")) {
                await dbDel("units", unit.value.uid);
                emit('nav', {view:'units'});
            }
        };

        const download = (text, name) => {
            const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text])); a.download=name; a.click();
        };

        const exportJSON = () => download(JSON.stringify(unit.value,null,2), "unit.json");
        const exportCSV = () => {
            let rows=["unit,project,plot,design,tree,condition,species,count,diameter,form_point,form_factor,tdf,bole_height,total_height,crown_ratio,position,damage_1,severity_1,damage_2,severity_2,log_number,grade,bole_height,length,small_diam,large_diam,def_type,def_amt,gross_cuft,gross_bdft,net_cuft,net_bdft"];
            (unit.value.plots || []).forEach(pl=>{ (pl.trees || []).forEach(t=>{ if (t.logs && t.logs.length > 0) { t.logs.forEach(l=>{ rows.push([unit.value.name,unit.value.project_name,pl.name,pl.crew,t.designCode,t.number,t.condition,t.species,t.count,t.diameter,t.form_point,t.form_factor,t.tdf,t.bole_height,t.total_height,t.crown_ratio,t.position,t.damage_1,t.severity_1,t.damage_2,t.severity_2,l.number,l.grade,l.bole_height,l.length,l.small_diam,l.large_diam,l.def_type,l.def_amt,l.gross_cuft,l.gross_bdft,l.net_cuft,l.net_bdft].join(",")); }); } else { rows.push([unit.value.name,unit.value.project_name,pl.name,pl.crew,t.designCode,t.number,t.condition,t.species,t.count,t.diameter,t.form_point,t.form_factor,t.tdf,t.bole_height,t.total_height,t.crown_ratio,t.position,t.damage_1,t.severity_1,t.damage_2,t.severity_2,"","","","","","","","","","",""].join(",")); } }); });
            download(rows.join("\n"), "inventory.csv");
        };

        return { unit, save, del, exportJSON, exportCSV };
    }
};