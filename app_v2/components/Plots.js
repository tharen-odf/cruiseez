import { dbGet, dbPut, uid, debounce } from '../db.js';

export default {
    props: ['navData'],
    template: `
        <div v-if="unit">
            <div v-for="plot in unit.plots" :key="plot.id" class="card">
                <div class="flex-row">
                    <div class="floating-label">
                        <input placeholder=" " v-model="plot.name" @input="save">
                        <label>Plot ID</label>
                    </div>
                    <div class="floating-label">
                        <input placeholder=" " v-model="plot.cruiser" @input="save">
                        <label>Cruiser</label>
                    </div>
                </div>
                <div class="flex-row">
                    <div class="floating-label">
                        <input placeholder=" " v-model="plot.slope" @input="save">
                        <label>Slope (%)</label>
                    </div>
                    <div class="floating-label">
                        <input placeholder=" " v-model="plot.aspect" @input="save">
                        <label>Aspect (deg)</label>
                    </div>
                    <div class="floating-label">
                        <input placeholder=" " v-model="plot.elevation" @input="save">
                        <label>Elev (ft)</label>
                    </div>
                </div>
                <div class="flex-row">
                    <div class="floating-label">
                        <input placeholder=" " v-model="plot.planned_lat" @input="save">
                        <label>Plan Lat</label>
                    </div>
                    <div class="floating-label">
                        <input placeholder=" " v-model="plot.planned_lon" @input="save">
                        <label>Plan Lon</label>
                    </div>
                    <div class="floating-label">
                        <input placeholder=" " v-model="plot.gps_lat" readonly>
                        <label>GPS Lat</label>
                    </div>
                    <div class="floating-label">
                        <input placeholder=" " v-model="plot.gps_lon" readonly>
                        <label>GPS Lon</label>
                    </div>
                    <div class="floating-label">
                        <input placeholder=" " v-model="plot.gps_accuracy" readonly>
                        <label>Acc (m)</label>
                    </div>
                    <div class="floating-label">
                        <input placeholder=" " v-model="plot.gps_timestamp" readonly>
                        <label>Time</label>
                    </div>
                </div>
                <div class="floating-label">
                    <textarea placeholder=" " v-model="plot.notes" @input="save"></textarea>
                    <label>Notes</label>
                </div>
                <div class="actions">
                    <button @click="$emit('nav', {view:'trees', pid:unit.id, plotId:plot.id})">Trees</button>
                    <button class="danger" @click="delPlot(plot.id)">Delete</button>
                    <button class="secondary" @click="getGPS(plot)">Get GPS</button>
                </div>
            </div>
            <button @click="addPlot">+ Add Plot</button>
        </div>
    `,
    setup(props, { emit }) {
        const { ref, onMounted } = Vue;
        const unit = ref(null);
        const save = debounce(() => { if (unit.value) dbPut("units", JSON.parse(JSON.stringify(unit.value))); }, 500);

        onMounted(async () => {
            emit('update-title', 'Plots');
            unit.value = await dbGet('units', props.navData.id);
        });

        const addPlot = () => {
            unit.value.plots.push({ id: uid(), name:"", cruiser:"", slope: "", aspect: "", elevation: "", notes: "", planned_lat: "", planned_lon: "", gps_lat: "", gps_lon: "", gps_accuracy: "", gps_timestamp: "", trees:[] });
            save();
        };
        const delPlot = (plotId) => {
            if (confirm("Delete plot?")) { unit.value.plots = unit.value.plots.filter(x => x.id !== plotId); save(); }
        };
        const getGPS = (plot) => {
            navigator.geolocation.getCurrentPosition(
                position => {
                    plot.gps_lat = position.coords.latitude.toFixed(6); // Roughly 8 cm resolution @ 45 deg north
                    plot.gps_lon = position.coords.longitude.toFixed(6);
                    plot.gps_accuracy = position.coords.accuracy.toFixed(2);
                    plot.gps_timestamp = Date.now();
                    save();
                },
                error => alert(`GPS Error: ${error.message}`),
                {
                    enableHighAccuracy: true,
                    maximumAge: 0
                }
            );
        };
        return { unit, save, addPlot, delPlot, getGPS };
    }
};