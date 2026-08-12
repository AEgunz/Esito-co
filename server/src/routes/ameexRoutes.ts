import express from 'express';
import {
  addParcel, editParcel, deleteParcel, getParcelInfo,
  getParcelTracking, getParcelStatus, massTracking,
  massInfo, relaunchParcel, relaunchNew, getParcelsList
} from '../controllers/ameexController';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = express.Router();

router.use(authenticate);
router.use(authorizeAdmin);

router.post('/add', addParcel);
router.post('/edit', editParcel);
router.delete('/delete', deleteParcel);
router.get('/info', getParcelInfo);
router.get('/tracking', getParcelTracking);
router.get('/status', getParcelStatus);
router.post('/mass-tracking', massTracking);
router.post('/mass-info', massInfo);
router.get('/relaunch', relaunchParcel);
router.post('/relaunch-new', relaunchNew);
router.post('/list', getParcelsList);

// Delivery Notes
router.post('/notes/add', addDeliveryNote);
router.post('/notes/add-parcels', addParcelsToNote);
router.delete('/notes/delete', deleteDeliveryNote);
router.get('/notes/print', getPrintUrls);
router.post('/pickup/add', addPickupRequest);

export default router;
