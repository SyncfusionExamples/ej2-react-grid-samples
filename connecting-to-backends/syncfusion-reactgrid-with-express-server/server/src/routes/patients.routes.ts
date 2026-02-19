import { Router } from 'express';
import { getPatients, createPatient, updatePatient, deletePatient} from '../controllers/patients.controller';

const router = Router();

router.post('/', (req, res) => {
    return getPatients(req, res);
});
router.post('/create', (req, res) => { return createPatient(req, res); });
router.post('/update', (req, res) => { return updatePatient(req, res); });
router.post('/remove', (req, res) => { return deletePatient(req, res); });

export default router;
