import { dbGet, dbPut, uid, debounce } from '../db.js';

export default {
    props: ['navData'],
    template: `
        <div v-if="unit">
            <div v-for="plot in unit.plots" :key="plot.id" class="card">
                <div class="flex-row">
                    <input placeholder="Plot ID" v-model="plot.name" @input="save">
                    <input placeholder="Cruiser" v-model="plot.cruiser" @input="save">
                </div>
                <div class="flex-row">
                    <input placeholder="Slope" v-model="plot.slope" @input="save">
                    <input placeholder="Aspect" v-model="plot.aspect" @input="save">
                    <input placeholder="Elevation" v-model="plot.elevation" @input="save">
                </div>
                <div class="flex-row">
                    <input placeholder="Planned Lat" v-model="plot.planned_lat" @input="save">
                    <input placeholder="Planned Lon" v-model="plot.planned_lon" @input="save">
                    <input placeholder="GPS Lat" v-model="plot.gps_lat" @input="save">
                    <input placeholder="GPS Lon" v-model="plot.gps_lon" @input="save">
                    <input placeholder="GPS Accuracy" v-model="plot.gps_accuracy" @input="save">
                    <input placeholder="GPS Time" v-model="plot.gps_timestamp" @input="save">
                </div>
                <textarea placeholder="Notes" v-model="plot.notes" @input="save"></textarea>
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
                    plot.gps_lat = position.coords.latitude.toFixed(6); plot.gps_lon = position.coords.longitude.toFixed(6);
                    plot.gps_accuracy = position.coords.accuracy.toFixed(4); plot.gps_timestamp = Date.now(); save();
                },
                error => alert(`GPS Error: ${error.message}`), { enableHighAccuracy: true }
            );
        };
        return { unit, save, addPlot, delPlot, getGPS };
    }
};