import { getSetup, saveSetup } from '../db.js';

export default {
    name: 'SetupView',
    setup(props, { emit }) {
        const { ref, onMounted } = Vue;
        const userName = ref('');
        const gpsAvgTime = ref(5);

        onMounted(async () => {
            emit('update-title', 'Setup');
            const setup = await getSetup();
            
            if (setup) {
                userName.value = setup.userName || '';
                gpsAvgTime.value = setup.gpsAvgTime || 5;
            }
        });

        const save = async () => {
            await saveSetup({
                userName: userName.value,
                gpsAvgTime: parseInt(gpsAvgTime.value, 10),
            });
            alert('Settings saved!');
        };

        return {
            userName,
            gpsAvgTime,
            save,
        };
    },
    template: `
        <div class="setup-view">
            <div class="form-group">
                <label for="userName">User Name</label>
                <input id="userName" type="text" v-model="userName">
            </div>
            <div class="form-group">
                <label for="gpsAvgTime">GPS Averaging Time (seconds)</label>
                <input id="gpsAvgTime" type="number" v-model.number="gpsAvgTime">
            </div>
            <button @click="save">Save</button>
        </div>
    `
};